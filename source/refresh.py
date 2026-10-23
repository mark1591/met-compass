#!/usr/bin/env python3
"""
Refresh Met Compass data: current gallery numbers from the Met's collection API
and Wikipedia page views (last 60 days). Edits index.html in place and keeps a backup.

Usage:
    python3 refresh.py path/to/index.html
    python3 refresh.py source/data.js source/extra.js          (then python3 source/build.py)
    python3 refresh.py source/data.js source/extra.js --dry-run

Only uses the Python standard library. Then upload the changed index.html to GitHub.
"""
import argparse, datetime, json, re, shutil, sys, time, urllib.error, urllib.parse, urllib.request

UA = "MetCompassRefresh/1.0 (personal study guide)"
MET = "https://collectionapi.metmuseum.org/public/collection/v1/objects/"
# Special exhibition galleries: a work listed here is on loan to a temporary show, not moved for good.
EXHIBITION = {"099", "199", "899", "964", "965", "999"}
WIKI = "https://en.wikipedia.org/w/api.php?format=json&formatversion=2&action=query&prop=pageviews&pvipdays=60&titles="


def get_json(url, tries=6):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Api-User-Agent": UA})
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if e.code == 429 or e.code >= 500:
                wait = int(e.headers.get("retry-after") or 10) + 2
                print(f"  rate limited, waiting {wait}s")
                time.sleep(wait)
                continue
            raise
        except urllib.error.URLError:
            time.sleep(3 * (i + 1))
    raise RuntimeError(f"Gave up on {url}")


def read_const(html, name):
    m = re.search(r"const " + name + r" = (\{.*?\});\n", html)
    if not m:
        sys.exit(f"Couldn't find {name} in the file. Is this the Met Compass index.html?")
    return m, json.loads(m.group(1))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("index", nargs="+", help="index.html, or the source files source/data.js source/extra.js")
    ap.add_argument("--dry-run", action="store_true", help="show changes without saving")
    a = ap.parse_args()

    texts = {p: open(p, encoding="utf-8").read() for p in a.index}
    html = "\n".join(texts.values())
    _, met_id = read_const(html, "MET_ID")
    _, gal = read_const(html, "GAL")
    _, views = read_const(html, "VIEWS")

    # 1. gallery numbers
    print(f"Checking {len(met_id)} works with the Met...")
    gal_changes, exhib = [], []
    for n, oid in sorted(met_id.items(), key=lambda x: int(x[0])):
        o = get_json(MET + str(oid))
        time.sleep(0.15)
        if not o:
            continue
        g = (o.get("GalleryNumber") or "").strip()
        # The API leaves the field blank for many works that are on view, so only real numbers replace old ones.
        if g in EXHIBITION:
            exhib.append((int(n), g))
        elif g and g.isdigit() and gal.get(n) != g:
            gal_changes.append((int(n), gal.get(n, "none"), g))
            gal[n] = g
    for n, old, new in gal_changes:
        print(f"  No. {n}: gallery {old} -> {new}")
    if not gal_changes:
        print("  No gallery changes.")
    for n, g in exhib:
        print(f"  Note: No. {n} is listed in Gallery {g}, a special exhibition gallery. Left as is; check the Met's site.")

    # 2. Wikipedia views, batched 50 titles per request
    print(f"Pulling Wikipedia views for {len(views)} articles...")
    titles = sorted({v[1] for v in views.values()})
    pv, days = {}, None
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        d = get_json(WIKI + urllib.parse.quote("|".join(chunk)))
        for p in d["query"]["pages"]:
            if "pageviews" in p:
                vals = p["pageviews"]
                pv[p["title"]] = sum(v or 0 for v in vals.values())
                ds = sorted(vals)
                days = (ds[0], ds[-1])
        time.sleep(2)
    for n, (v, title) in views.items():
        if title in pv:
            views[n] = [pv[title], title]
    top = sorted(views.items(), key=lambda x: -x[1][0])[:5]
    print("  Top 5 now: " + "; ".join(f"No. {n} ({v[0]:,})" for n, v in top))

    if a.dry_run:
        print("Dry run: nothing saved.")
        return

    def fmt(s):
        d = datetime.date.fromisoformat(s)
        return d.strftime("%b %-d") if sys.platform != "win32" else d.strftime("%b %#d")

    rng = None
    if days:
        end = datetime.date.fromisoformat(days[1])
        rng = f"the 60 days from {fmt(days[0])} to {fmt(days[1])}, {end.year}"
    for path, text in texts.items():
        new = re.sub(r"const GAL = \{.*?\};\n", lambda m: "const GAL = " + json.dumps(gal) + ";\n", text, count=1)
        new = re.sub(r"const VIEWS = \{.*?\};\n", lambda m: "const VIEWS = " + json.dumps(views, ensure_ascii=False) + ";\n", new, count=1)
        if rng:
            new = re.sub(r'const VIEWS_RANGE = ".*?";', lambda m: f'const VIEWS_RANGE = "{rng}";', new, count=1)
        if new != text:
            shutil.copyfile(path, path + ".bak")
            open(path, "w", encoding="utf-8").write(new)
            print(f"Saved {path} (backup at {path}.bak).")


if __name__ == "__main__":
    main()
