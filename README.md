# Met Compass

An unofficial pocket guide to the Met Fifth Avenue: traced floor plans with walking directions, 100 key works, exhibitions and quizzes. Live at https://mark1591.github.io/met-compass/

Not affiliated with The Metropolitan Museum of Art. Images are public domain (Met Open Access) or freely licensed (Wikimedia Commons, credited in the app).

## Layout
- `index.html`, `sw.js`, `manifest.json`, icons, `img/`: the published site (GitHub Pages serves these).
- `source/`: what the site is built from. Edit here, then run `python3 source/build.py` to regenerate the site files.
  - `data.js`: works, galleries, lessons. `extra.js`: restrooms, food, exhibitions, tiers, Wikipedia views. `lessons.js`: class notes. `plan.js`: traced floor plans and walking grid.
  - `app2.js`: app code. `shell2.html`: page layout and styles.
  - `refresh.py`: updates gallery numbers (Met collection API) and Wikipedia views: `python3 source/refresh.py source/data.js source/extra.js`
