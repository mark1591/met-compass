
// Restrooms: only locations confirmed by the Met or published guides. x,y are plan coordinates (null = not on this plan).
const BATH = [
 {f:1, lvl:"1", x:262, y:290, name:"Egyptian Art, by Gallery 100", where:"Floor 1 · just off the Great Hall",
  how:"Turn right out of the Great Hall into Egyptian Art. The restrooms are right beside Gallery 100, the Tomb of Perneb.", tip:"Closest to the main entrance, so often the busiest."},
 {f:1, lvl:"1", x:160, y:108, name:"European Sculpture, by Gallery 528", where:"Floor 1 · between Medieval Art and the Lehman Wing",
  how:"Walk past the Medieval Sculpture Hall toward the Robert Lehman Wing. The restrooms are beside Galleries 524 to 528.", tip:"Handy on the way to or from the Lehman Collection."},
 {f:1, lvl:"1", x:100, y:104, name:"By Gallery 399 and the Petrie Court Café", where:"Floor 1 · west end",
  how:"Head to the far west end, where European sculpture meets the Rockefeller Wing. The restrooms are by the elevator at Gallery 399, near the Petrie Court Café.", tip:"A good stop before or after the café."},
 {f:1, lvl:"1", x:372, y:98, name:"American Wing, by Gallery 732", where:"Floor 1 · north side of the American Wing",
  how:"Go through the Engelhard Court to the north side of the American Wing. The restrooms are by Galleries 731 and 732.", tip:"Closest to the Temple of Dendur and Arms and Armor."},
 {f:1, lvl:"1M", x:262, y:32, name:"American Wing mezzanine, Galleries 773–774", where:"Floor 1 mezzanine · American Wing",
  how:"Take the stairs or elevator in the American Wing up to the mezzanine level between Floors 1 and 2.", tip:"Often the least crowded restrooms in the building."},
 {f:2, lvl:"2", x:272, y:212, name:"Asian Art, by Gallery 232", where:"Floor 2 · just off the Balcony",
  how:"At the top of the Grand Staircase, turn right along the Balcony past the Balcony Lounge. The restrooms are at the entrance to the Asian galleries, by Galleries 210 and 232.", tip:"The closest restrooms to the top of the Grand Staircase."},
 {f:2, lvl:"2", x:100, y:32, name:"By Gallery 917, past the 19th-century paintings", where:"Floor 2 · southwest corner",
  how:"Walk through the 19th-century European galleries toward Gallery 830. The restrooms are in the corner by Gallery 917.", tip:"This sits beside the modern wing, which is closed for construction, so it may be blocked. Ask a guard."},
 {f:0, lvl:"G", x:null, y:null, name:"Ground floor, by The Eatery", where:"Ground floor · under the Lehman Wing",
  how:"Take the stairs down from the Robert Lehman Wing on Floor 1. There are two sets of restrooms at the bottom of the stairs, next to The Eatery cafeteria.", tip:"Pair it with a snack break."},
 {f:0, lvl:"G", x:null, y:null, name:"Ground floor, by the 81st Street entrance", where:"Ground floor · south end",
  how:"Next to the Met Store at the 81st Street entrance. Another set is in the education area beside the Bonnie J. Sacerdote Lecture Hall.", tip:"Widest doors and the all-gender family restroom. Best with a stroller or wheelchair."},
 {f:4, lvl:"4", x:null, y:null, name:"Floor 4, by the elevator", where:"Floor 4 · reached from Gallery 555 on Floor 1",
  how:"Take the elevator in the European Sculpture and Decorative Arts galleries near Gallery 555 up to Floor 4. The nursing room is on this floor too.", tip:"Quiet, and the place to go for the lactation room."}
];

// Food, drink and information points, from the Met's official map (October 2026).
const FOOD = [
 {f:1, x:130, y:104, k:"cafe", name:"Petrie Court Café", where:"Floor 1 · European Sculpture, park side",
  how:"Walk through European Sculpture and Decorative Arts to the glass-walled Petrie Court. The café is at the park end.", tip:"Sit-down café with views of Central Park. The restrooms by Gallery 399 are steps away."},
 {f:1, x:300, y:34, k:"cafe", name:"American Wing Café", where:"Floor 1 · American Wing",
  how:"In the American Wing, at the edge of the Engelhard Court garden.", tip:"Coffee and quick bites among the sculpture."},
 {f:1, x:184, y:262, k:"info", name:"Information desk", where:"Floor 1 · Great Hall",
  how:"In the middle of the Great Hall as you walk in.", tip:"Pick up a printed map and ask what's on view today."},
 {f:2, x:238, y:262, k:"cafe", name:"The Balcony Lounge", where:"Floor 2 · Great Hall Balcony",
  how:"At the top of the Grand Staircase, on the Balcony overlooking the Great Hall.", tip:"Drinks and light bites with a view down into the Great Hall."},
 {f:0, x:null, y:null, k:"cafe", name:"The Eatery", where:"Ground floor · under the Lehman Wing",
  how:"Take the stairs down from the Robert Lehman Wing on Floor 1. The Eatery is at the bottom, next to the restrooms.", tip:"The biggest and most casual option. Good with kids."}
];
const FOOD_HINTS = [{f:1, x:182, y:32, t:"G↓"}];
const YEAR = [-2900, -2381, -2090, -1981, -1961, -1479, -1386, -883, -883, -604, -750, -590, -530, -530, -250, 100, -50, 260, -15, 525, 750, 1050, 1319, 1330, -1050, 1981, 1830, 1354, 1525, 1575, 1707, -1200, 1250, 1550, 1720, 1850, 1960, 1970, 629, 1763, 1750, 1290, 1436, 1449, 1490, 1478, 1506, 1504, 1544, 1586, 1525, 1350, 1565, 1565, 1599, 1597, 1620, 1630, 1616, 1653, 1660, 1650, 1662, 1656, 1693, 1720, 1787, 1787, 1785, 1804, 1851, 1852, 1865, 1866, 1867, 1874, 1874, 1878, 1878, 1887, 1887, 1889, 1891, 1890, 1899, 1912, 1836, 1851, 1859, 1871, 1883, 1883, 1892, 1899, 1912, 1923, 1905, 1928, 1931, 1950];
// Special exhibitions at The Met Fifth Avenue, from metmuseum.org/exhibitions (checked Oct 23, 2026).
// start/end are ISO dates (null = already open / open-ended). gals = gallery numbers for the Find tab.
// f = floor shown on the plan (1 or 2), x/y = marker position on the plan, null when not on the two-floor plan.
const EXHIBS = [
 {t:"Krasner and Pollock: Past Continuous", start:null, end:"2027-01-31", f:2, x:172, y:132, gals:[899], where:"Floor 2 · Gallery 899",
  d:"More than 120 works tracing Lee Krasner and Jackson Pollock, who met in 1941 and shaped each other's art until Pollock's death. The first big New York show for either artist in over 20 years.",
  how:"Take the Grand Staircase up and walk into European Paintings, then bear left toward the 19th-century galleries. The exhibition hall sits between the two.", url:"krasner-and-pollock-past-continuous"},
 {t:"Costume Art", start:null, end:"2027-01-10", f:1, x:250, y:226, gals:[99], where:"Floor 1 · Gallery 099",
  d:"The Costume Institute pairs garments with artworks from across the Met, grouped by body type, to show how clothing and the body shape each other.",
  how:"From the Great Hall, walk around the right side of the Grand Staircase. The Costume Institute galleries are just behind it, between Medieval Art and Egyptian Art.", url:"costume-art"},
 {t:"Designing the Gilded Age: Drawings from the Studios of Louis C. Tiffany", start:null, end:"2027-02-07", f:2, x:190, y:206, gals:[691,692,693], where:"Floor 2 · Galleries 691–693",
  d:"Nearly 120 watercolor designs for Tiffany stained glass, lamps and interiors, many for works that were lost or never built, shown with finished pieces.",
  how:"At the top of the Grand Staircase, go straight ahead and slightly left into the Drawings and Prints galleries.", url:"designing-the-gilded-age-drawings-from-the-studios-of-louis-c-tiffany"},
 {t:"Orientalism: Between Fact and Fantasy", start:null, end:"2027-02-28", f:2, x:50, y:160, gals:[454,458,803,804], where:"Floor 2 · Galleries 454, 458 and 803–804",
  d:"About 180 objects from 12 departments on how 19th-century European and Ottoman artists pictured the Middle East, often borrowing from Islamic art.",
  how:"In two parts. The main rooms are in the Islamic galleries: from the top of the Grand Staircase turn left along the Balcony, go through Near Eastern Art and on into the Islamic galleries. The rest is in Galleries 803–804 in the 19th-century European paintings.", url:"orientalism-between-fact-and-fantasy"},
 {t:"The Genesis Facade Commission: Liu Wei, Speculation", start:null, end:"2027-06-08", f:1, x:322, y:318, gals:[], where:"Outside · Fifth Avenue facade",
  d:"Four large sculptures by Beijing artist Liu Wei set into the niches of the Met's front facade, built around the human hand.",
  how:"Outside, on the facade above the main entrance. Best seen from the front steps or across Fifth Avenue.", url:"the-genesis-facade-commission-liu-wei"},
 {t:"The Face of Life: Modern Portraits at The Met", start:null, end:null, f:0, x:null, y:null, gals:[963,964,965], where:"Ground floor · Galleries 963–965",
  d:"Nearly 80 modern portraits from about 1900 to the 1960s, including Picasso's Gertrude Stein, while the modern wing is closed.",
  how:"Take the stairs down from the Robert Lehman Wing on Floor 1. The galleries are at the bottom, near The Eatery.", url:"the-face-of-life-modern-portraits-at-the-met"},
 {t:"There Are No Words: Si Lewen's Parade", start:null, end:"2027-01-05", f:2, x:212, y:206, gals:[690], where:"Floor 2 · Gallery 690",
  d:"Si Lewen's cycle of 63 drawings made after World War II, moving from military parade to war and mourning when read in order.",
  how:"At the top of the Grand Staircase, go straight ahead into the Drawings and Prints galleries.", url:"there-are-no-words-si-lewens-parade"},
 {t:"David Hartt: Peripheries", start:null, end:"2027-02-07", f:1, x:372, y:56, gals:[735], where:"Floor 1 · Gallery 735",
  d:"A two-screen video installation built around John Vanderlyn's 1818–19 panorama of Versailles, shifting the view from Paris to its edges.",
  how:"In the American Wing, through the Engelhard Court to the round panorama room.", url:"david-hartt-peripheries"},
 {t:"P. S. Art 2026: Celebrating the Creative Spirit of New York City Kids", start:null, end:"2026-10-26", f:0, x:null, y:null, gals:[], where:"Ground floor · Uris Center for Education",
  d:"125 works by New York City public school students, from pre-K through 12th grade.",
  how:"On the ground floor by the 81st Street entrance, in the education center.", url:"p-s-art-2026-celebrating-the-creative-spirit-of-new-york-city-kids"},
 {t:"Futurism, Constructivism, and Dada in Georgia, 1917–1928", start:null, end:"2026-10-27", f:1, x:158, y:294, gals:[], where:"Floor 1 · Thomas J. Watson Library",
  d:"Avant-garde books and magazines made in Tbilisi in the 1910s and 1920s.",
  how:"In the Watson Library, between the Greek and Roman galleries and European sculpture. Ask a guard to point you to the entrance.", url:"futurism-constructivism-and-dada-in-georgia-1917-1928"},
 {t:"Chasing Clouds", start:null, end:"2027-02-28", f:2, x:150, y:188, gals:[852], where:"Floor 2 · Gallery 852",
  d:"How artists, scientists and photographers pictured clouds from the early 1800s to the 1920s, ending with Alfred Stieglitz's Equivalents.",
  how:"From the top of the Grand Staircase, walk through Drawings and Prints toward the 19th-century paintings. The photography galleries are along the way.", url:"chasing-clouds"},
 {t:"A King's Carpet: Louis XIV and the Savonnerie", start:null, end:"2028-03-05", f:1, x:102, y:180, gals:[524,525,526,527,528], where:"Floor 1 · Galleries 524–528",
  d:"Three enormous carpets woven for Louis XIV's Louvre, the first U.S. show on the royal Savonnerie workshop.",
  how:"Walk past the Medieval Sculpture Hall toward the Robert Lehman Wing. The galleries are next to the restrooms by Gallery 528.", url:"a-kings-carpet-louis-xiv-and-the-savonnerie"},
 {t:"Rediscovering Della Robbia at The Met", start:null, end:"2028-01-17", f:1, x:190, y:162, gals:[521], where:"Floor 1 · Gallery 521",
  d:"Twelve glazed terracotta sculptures by three generations of the Della Robbia family, with a 10-foot altarpiece rebuilt from 33 pieces.",
  how:"Just past the Medieval Sculpture Hall, on the way to the Robert Lehman Wing.", url:"rediscovering-della-robbia-at-the-met"},
 {t:"Cottage Industry: The Val-Kill Furniture Shop", start:null, end:"2027-05-09", f:1, x:268, y:96, gals:[746], where:"Floor 1 · Gallery 746 North",
  d:"Furniture from the workshop Eleanor Roosevelt co-founded in 1926, shown with the American Wing pieces that inspired it.",
  how:"In the American Wing period rooms beyond the Engelhard Court.", url:"cottage-industry-the-val-kill-furniture-shop"},
 {t:"City of Memory: Nanjing in the Seventeenth Century", start:null, end:"2027-01-03", f:2, x:372, y:296, gals:[210,211,212,213,214,215,216], where:"Floor 2 · Galleries 210–216",
  d:"About 100 works on artists in Nanjing around the fall of the Ming dynasty in 1644.",
  how:"Turn right at the top of the Grand Staircase into Asian Art and keep going to the Chinese painting galleries near the Astor Court.", url:"city-of-memory-nanjing-in-the-17th-century"},
 {t:"Flip Sides: Seeing Korean Art Anew", start:null, end:"2027-05-31", f:2, x:264, y:296, gals:[233], where:"Floor 2 · Gallery 233",
  d:"About 50 Korean objects shown from the inside, the back and other hidden angles to reveal how they were made. A new set of works goes up October 31.",
  how:"Turn right at the top of the Grand Staircase. Gallery 233 is at the entrance to Asian Art.", url:"flip-sides-seeing-korean-art-anew"},
 {t:"Celebrating the Year of the Horse", start:null, end:"2027-01-26", f:2, x:316, y:296, gals:[207], where:"Floor 2 · Gallery 207",
  d:"Ceramics, jade, metalwork and prints on the horse's place in Chinese history, farming, war and belief.",
  how:"Turn right at the top of the Grand Staircase and continue into the Chinese galleries.", url:"celebrating-the-year-of-the-horse"},
 {t:"Household Gods: Hindu Devotional Prints, 1860–1930", start:null, end:"2027-06-27", f:3, x:null, y:null, gals:[251], where:"Floor 3 · Gallery 251",
  d:"About 120 mass-produced color prints of Hindu gods that let ordinary families keep a deity at home. Works rotate; a new set is up from October 17.",
  how:"A small gallery on the third floor of the Asian wing. From the Chinese galleries on Floor 2, ask a guard for the stairs up.", url:"household-gods-hindu-devotional-prints-1860-1930"},
 {t:"The Infinite Artistry of Japanese Ceramics", start:null, end:"2027-08-08", f:2, x:300, y:204, gals:[223,224,225,226,227,228,229,230,231,232], where:"Floor 2 · Galleries 223–232",
  d:"About 350 Japanese ceramics, from ancient hand-built pots to modern sculpture. Works rotate every few months.",
  how:"In the Japanese galleries, the northern part of Asian Art toward Musical Instruments.", url:"the-infinite-artistry-of-japanese-ceramics"},
 {t:"Ecologies of Painting", start:null, end:"2027-01-17", f:2, x:276, y:62, gals:[638], where:"Floor 2 · Gallery 638",
  d:"Well-known European paintings from about 1525 to 1775, hung to explore how people and nature are connected.",
  how:"From the top of the Grand Staircase, walk straight into European Paintings. Gallery 638 is the room with The Harvesters.", url:"ecologies-of-painting"},
 {t:"Afterlives: Contemporary Art in the Byzantine Crypt", start:null, end:"2027-01-10", f:1, x:210, y:238, gals:[302], where:"Floor 1 · Gallery 302",
  d:"Modern works about death and remembrance, shown with Byzantine-era Egyptian burial objects.",
  how:"In the Byzantine Crypt directly under the Grand Staircase. Go in from Medieval Art behind the stairs.", url:"afterlives-contemporary-art-in-the-byzantine-crypt"},
 // upcoming
 {t:"Tapa: Art of the Gift in Polynesia", start:"2026-11-02", end:"2027-12-12", f:1, x:50, y:140, gals:[359], where:"Floor 1 · Gallery 359",
  d:"Hand-painted bark cloth from Fiji, Samoa and Futuna, made to be given as gifts at important ceremonies.",
  how:"Turn left from the Great Hall through Greek and Roman Art into the Rockefeller Wing. Gallery 359 is in the Oceania galleries.", url:"tapa-art-of-the-gift-in-polynesia"},
 {t:"A Long Shadow: Postwar Japan Through the Lens", start:"2026-11-12", end:"2027-05-02", f:2, x:128, y:188, gals:[851], where:"Floor 2 · Gallery 851",
  d:"Japanese photographers after World War II on the U.S. military presence, Okinawa and the occupation's effect on women's lives.",
  how:"From the top of the Grand Staircase, walk through Drawings and Prints toward the 19th-century paintings. The photography galleries are along the way.", url:"a-long-shadow-postwar-japan-through-the-lens"},
 {t:"Across Wine-Dark Seas: Art and Identity beyond Ancient Greece", start:"2026-12-20", end:"2027-04-11", f:1, x:128, y:200, gals:[199], where:"Floor 1 · Gallery 199",
  d:"More than 180 works on how sea trade around the Mediterranean shaped early Greek art and myth.",
  how:"Turn left from the Great Hall into the Greek and Roman sculpture hall. Gallery 199 opens off it on the right, toward European sculpture.", url:"across-wine-dark-seas-art-and-identity-beyond-ancient-greece"},
 {t:"Baseball Cards from the Collection of Jefferson R. Burdick", start:"2027-03-01", startText:"Reopens spring 2027", end:null, f:1.5, x:null, y:null, gals:[774], where:"Floor 1 mezzanine · Gallery 774A",
  d:"Historic baseball cards from the 1800s to the 1950s, from one of the great collections of its kind. Closed for gallery work until spring.",
  how:"On the American Wing mezzanine, up the stairs or elevator from the Engelhard Court.", url:"baseball-cards-from-the-collection-of-jefferson-r-burdick-2025"},
 {t:"The American Guitar: A Twentieth-Century Icon", start:"2027-03-21", end:null, f:1.5, x:null, y:null, gals:[773], where:"Floor 1 mezzanine · Gallery 773",
  d:"A new permanent guitar gallery covering the instrument's golden age, about 1900 to 1970.",
  how:"On the American Wing mezzanine, up the stairs or elevator from the Engelhard Court.", url:"the-american-guitar-a-twentieth-century-icon"},
 {t:"Felix Gonzalez-Torres: The Spaces Between", start:"2027-06-10", end:"2027-10-18", f:0, x:null, y:null, gals:[], where:"Throughout the museum",
  d:"More than 40 works installed around the Met, including pieces where visitors take candy or paper.",
  how:"Works are spread through the building. Pick up a map at the information desk.", url:"felix-gonzalez-torres-the-spaces-between"},
 {t:"The Genesis Facade Commission: Danh Vo", start:"2027-09-16", end:"2028-06-13", f:1, x:322, y:318, gals:[], where:"Outside · Fifth Avenue facade",
  d:"Four new sculptures by Danh Vo for the facade niches, the next in the yearly facade series.",
  how:"Outside, on the facade above the main entrance.", url:"the-genesis-facade-commission-danh-vo"},
 {t:"The Great Hall Commission: Sandra Mujinga", start:"2027-11-04", end:"2028-04-04", f:1, x:228, y:282, gals:[], where:"Floor 1 · The Great Hall",
  d:"Two sculptures by Norwegian-Congolese artist Sandra Mujinga for the Great Hall.",
  how:"In the Great Hall at the main entrance.", url:"the-great-hall-commission-sandra-mujinga"},
 {t:"Rembrandt and the Ancients", start:"2027-11-07", end:"2028-02-06", f:2, x:172, y:156, gals:[899], where:"Floor 2 · Gallery 899",
  d:"Rembrandt's take on Greek and Roman history and myth, organized with the Louvre.",
  how:"Take the Grand Staircase up and walk into European Paintings, then bear left toward the 19th-century galleries.", url:"rembrandt-and-the-ancients"}
];
const EXHIBS_CHECKED = "October 23, 2026";

const WC_HINTS = [{f:1, x:34, y:321, t:"G↓"}, {f:1, x:182, y:32, t:"G↓"}];
// Tiers are an editorial judgment: what to prioritize on a short visit.
const MUST = [5,8,19,22,26,31,37,51,53,55,60,63,67,77,79,82,88,89,92,94];
const DEEP = [3,4,9,10,11,13,18,20,21,23,24,25,29,32,33,38,39,41,46,50,52,65,66,69,95,96,98];
const tierOf = n => MUST.includes(n) ? "must" : DEEP.includes(n) ? "deep" : "classic";
const TIERS = [["all","All tiers"],["must","Must-see"],["classic","Classics"],["deep","Deep cuts"]];
const TIER_NAME = {must:"Must-see", classic:"Classic", deep:"Deep cut"};
// Wikipedia page views, last 12 months: {n: [views, "Article title"]}. Filled in from Wikipedia's pageview statistics.
const VIEWS = {"1": [6154, "Tell Asmar Hoard"], "2": [460, "Tomb of Perneb"], "5": [1803, "William (hippopotamus figurine)"], "12": [1412, "New York Kouros"], "14": [1390, "Monteleone chariot"], "17": [2358, "Villa Boscoreale"], "19": [6597, "Temple of Dendur"], "21": [395, "Night-Shining White"], "26": [943, "Astor Court (Metropolitan Museum of Art)"], "27": [113941, "The Great Wave off Kanagawa"], "29": [2842, "Shahnameh of Shah Tahmasp"], "34": [3311, "Benin ivory mask"], "37": [552, "Bisj Pole"], "39": [403, "David Plates"], "42": [2903, "Madonna and Child (Duccio, Metropolitan)"], "43": [2205, "Crucifixion and Last Judgement diptych"], "44": [853, "A Goldsmith in His Shop"], "45": [537, "Annunciation (Botticelli, New York)"], "46": [433, "Studiolo from the Ducal Palace in Gubbio"], "47": [161, "Patio from the Castle of Vélez Blanco"], "48": [687, "Madonna and Child Enthroned with Saints (Raphael)"], "53": [3212, "The Harvesters (painting)"], "55": [5980, "View of Toledo"], "56": [4594, "The Musicians (Caravaggio)"], "57": [631, "Esther Before Ahasuerus (Artemisia Gentileschi)"], "58": [597, "The Fortune Teller (La Tour)"], "59": [537, "A Faun Teased by Children"], "60": [2003, "Aristotle with a Bust of Homer"], "61": [569, "Self-Portrait (Rembrandt, Altman)"], "62": [4177, "Portrait of Juan de Pareja"], "63": [2315, "Woman with a Water Jug"], "64": [1159, "A Girl Asleep"], "65": [150, "Gould Stradivarius"], "67": [29937, "The Death of Socrates"], "68": [867, "Manuel Osorio Manrique de Zúñiga"], "69": [641, "Self-Portrait with Two Pupils"], "71": [2055, "The Princesse de Broglie"], "72": [3023, "The Horse Fair"], "73": [18, "Ugolino and His Sons"], "74": [52, "Woman with a Parrot"], "75": [1751, "Garden at Sainte-Adresse"], "76": [804, "Boating (Manet)"], "77": [1949, "The Dance Class (Degas, Metropolitan Museum of Art)"], "78": [1197, "Madame Georges Charpentier and Her Children"], "79": [16426, "Little Dancer of Fourteen Years"], "80": [2019, "Parade de cirque"], "82": [6078, "Wheat Field with Cypresses"], "83": [1049, "Ia Orana Maria"], "84": [12112, "The Card Players"], "87": [5139, "The Oxbow"], "88": [20430, "Washington Crossing the Delaware (1851 paintings)"], "89": [2522, "The Heart of the Andes"], "90": [1326, "Max Schmitt in a Single Scull"], "91": [156, "Lady at the Tea Table"], "92": [30314, "Portrait of Madame X"], "93": [1544, "Diana (Saint-Gaudens)"], "94": [5001, "The Gulf Stream (painting)"], "95": [10, "Francis W. Little House"], "97": [2521, "Portrait of Gertrude Stein"], "98": [2439, "I Saw the Figure 5 in Gold"], "99": [1999, "Cow's Skull: Red, White, and Blue"], "100": [9098, "Autumn Rhythm (Number 30)"]};
const VIEWS_RANGE = "the 60 days from Aug 23 to Oct 21, 2026";
// Images for works the Met's API doesn't release, taken from Wikimedia Commons with their licenses.
const WIKI_IMG = {"75": {"page": "https://commons.wikimedia.org/wiki/File:Garden_at_Sainte-Adresse_MET_DT48.jpg", "license": "CC0", "artist": "Claude Monet"}, "91": {"page": "https://commons.wikimedia.org/wiki/File:Lady_at_the_Tea_Table_MET_DT516.jpg", "license": "CC0", "artist": "Mary Cassatt"}, "26": {"page": "https://commons.wikimedia.org/wiki/File:Astor_Court,_the_Met,_Manhattan_Oct_2017.jpg", "license": "CC0", "artist": "Thomson200"}, "85": {"page": "https://commons.wikimedia.org/wiki/File:Bridge_over_a_Pond_of_Water_Lilies_MET_DT1854.jpg", "license": "CC0", "artist": "Claude Monet"}, "97": {"page": "https://en.wikipedia.org/wiki/File:GertrudeStein.JPG", "license": "Public domain in the US", "artist": "Pablo Picasso"}, "98": {"page": "https://commons.wikimedia.org/wiki/File:NY_Met_demuth_figure_5_gold.JPG", "license": "Public domain", "artist": "Charles Demuth"}, "37": {"page": "https://commons.wikimedia.org/wiki/File:Asmat_bis_poles_from_Indonesian_New_Guinea_-_the_poles_are_named_for_deceased_people_and_the_huge_phalluses_on_top_represent_fertility._-_panoramio.jpg", "license": "CC BY 3.0", "artist": "Photo: olekinderhook", "note": "Taken at the Met in 2010, before the wing was renovated"}};
Object.keys(WIKI_IMG).forEach(n => IMG.add(+n));
