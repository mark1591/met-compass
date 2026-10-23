import os,shutil,json
# Builds the site into the repo root from the files in this folder.  Run: python3 source/build.py
S=os.path.dirname(os.path.abspath(__file__)); P=os.path.dirname(S)
shell=open(f"{S}/shell2.html").read(); data=open(f"{S}/data.js").read()+"\n"+open(f"{S}/extra.js").read()+"\n"+open(f"{S}/lessons.js").read()+"\n"+open(f"{S}/plan.js").read(); app=open(f"{S}/app2.js").read()
import datetime
page=shell.replace("/*DATA*/",data).replace("/*APP*/",app).replace("/*VERSION*/", datetime.datetime.now().strftime("%b %-d, %Y · %-I:%M %p"))
D=P   # the site lives at the repo root
cut=page.index('<div class="col" id="views">'); head,body=page[:cut],page[cut:]
reset="""<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>"""
html=f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Met Compass">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
{reset}
{head}</head>
<body>
{body}
</body></html>
"""
open(f"{D}/index.html","w").write(html)
imgs=sorted(os.listdir(f"{P}/img"),key=lambda x:int(x[:-4]))
json.dump({"name":"Met Compass","short_name":"Met Compass","description":"Unofficial study guide to the layout and 100 key works of the Met Fifth Avenue.",
 "start_url":"./","scope":"./","display":"standalone","background_color":"#EDECE7","theme_color":"#EDECE7",
 "icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"},
          {"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},open(f"{D}/manifest.json","w"),indent=1)
files=["./","index.html","manifest.json","icon-192.png","icon-512.png"]+[f"img/{f}" for f in imgs]
import hashlib
ver=hashlib.sha1((html+"".join(imgs)).encode()).hexdigest()[:10]
open(f"{D}/sw.js","w").write("""// Saves the whole guide on the phone so it works without signal.
// The version changes with every build, so an update replaces the old copy.
const CACHE = "met-compass-%s";
const FILES = %s;
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Pages: try the network first so updates show up, fall back to the saved copy offline.
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return res; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && (url.origin === location.origin || url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com"))) {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
    }
    return res;
  })));
});
""" % (ver, json.dumps(files)))
# icons: a plan with a "you are here" marker
from PIL import Image,ImageDraw
def icon(size,path,pad=0.0):
    # Brand mark: a compass needle on ink, the north half in faience blue.
    S4=size*4; im=Image.new("RGB",(S4,S4),"#17191C"); d=ImageDraw.Draw(im)
    cx=S4/2; top=S4*0.16; bot=S4*0.84; half=S4*0.13
    d.polygon([(cx,top),(cx+half,S4/2),(cx,bot),(cx-half,S4/2)],fill="#FFFFFF")
    d.polygon([(cx,top),(cx+half,S4/2),(cx-half,S4/2)],fill="#2342C0")
    im=im.resize((size,size),Image.LANCZOS); im.save(path)
icon(192,f"{D}/icon-192.png",0.06); icon(512,f"{D}/icon-512.png",0.1)

print("ok",len(imgs))
