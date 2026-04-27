import fs from 'fs';
import path from 'path';
import { cities } from '../data/cities';
import { BLOG_POSTS, BLOG_POST_BY_SLUG } from '../data/blogPosts';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
const ORIGIN = 'https://worldtimesuite.com';

// Routes

// Routes

const STATIC_ROUTES = ['/', '/timer', '/stopwatch', '/calendar', '/about', '/terms', '/privacy', '/world-clock', '/globe', '/blog', '/about-author'];

const BLOG_POST_ROUTES: string[] = BLOG_POSTS.map(p => `/blog/${p.slug}`);

const TIMEZONE_ROUTES: string[] = [
  '/ist-to-gmt',
  '/gmt-to-ist',
  '/ist-to-est',
  '/est-to-ist',
  '/ist-to-pst',
  '/pst-to-ist',
  '/ist-to-cst',
  '/cst-to-ist',
  '/ist-to-cet',
  '/cet-to-ist',
  '/ist-to-aest',
  '/aest-to-ist',
  '/ist-to-jst',
  '/jst-to-ist',
  '/ist-to-sgt',
  '/sgt-to-ist',
  '/ist-to-gst',
  '/gst-to-ist',
  '/ist-to-hkt',
  '/hkt-to-ist',
  '/est-to-gmt',
  '/gmt-to-est',
  '/est-to-cet',
  '/cet-to-est',
  '/est-to-aest',
  '/aest-to-est',
  '/est-to-sgt',
  '/sgt-to-est',
  '/est-to-jst',
  '/jst-to-est',
  '/est-to-hkt',
  '/hkt-to-est',
  '/pst-to-est',
  '/est-to-pst',
  '/pst-to-gmt',
  '/gmt-to-pst',
  '/pst-to-cst',
  '/cst-to-pst',
  '/pst-to-cet',
  '/cet-to-pst',
  '/cst-to-gmt',
  '/gmt-to-cst',
  '/cst-to-est',
  '/est-to-cst',
  '/cet-to-gmt',
  '/gmt-to-cet',
  '/aest-to-gmt',
  '/gmt-to-aest',
  '/aest-to-pst',
  '/pst-to-aest',
  '/jst-to-gmt',
  '/gmt-to-jst',
  '/sgt-to-gmt',
  '/gmt-to-sgt',
  '/gst-to-gmt',
  '/gmt-to-gst',
  '/hkt-to-gmt',
  '/gmt-to-hkt',
  '/brt-to-est',
  '/est-to-brt',
  '/brt-to-gmt',
  '/gmt-to-brt',
  '/mst-to-gmt',
  '/gmt-to-mst',
  '/mst-to-est',
  '/est-to-mst',
  '/wet-to-gmt',
  '/gmt-to-wet',
  '/eet-to-gmt',
  '/gmt-to-eet',
  '/kst-to-est',
  '/est-to-kst',
  '/gmt-to-kst',
  '/kst-to-gmt',
  '/pht-to-est',
  '/est-to-pht',
  '/pht-to-gmt',
  '/gmt-to-pht',
  '/nzdt-to-est',
  '/est-to-nzdt',
  '/nzdt-to-gmt',
  '/gmt-to-nzdt',
  '/ast-to-est',
  '/est-to-ast',
  '/gmt-to-msk',
  '/msk-to-gmt',
  '/cest-to-gmt',
  '/gmt-to-cest',
];

const CITY_ROUTES: string[] = [
  // Existing prerendered city routes - kept
  '/london-to-new-york',
  '/new-york-to-london',
  '/london-to-dubai',
  '/mumbai-to-new-york',
  '/los-angeles-to-new-york',
  '/sydney-to-london',
  '/singapore-to-london',
  '/toronto-to-new-york',
  '/dubai-to-london',
  '/delhi-to-new-york',
  '/london-to-sydney',
  '/chicago-to-new-york',
  '/san-francisco-to-new-york',
  '/london-to-paris',
  '/paris-to-london',
  '/bangalore-to-new-york',
  '/hong-kong-to-london',
  '/new-york-to-tokyo',
  '/london-to-hong-kong',
  '/mumbai-to-london',
  '/sydney-to-new-york',
  '/new-york-to-singapore',
  '/manila-to-new-york',
  '/toronto-to-london',
  '/chicago-to-london',
  '/london-to-singapore',
  '/melbourne-to-london',
  '/london-to-los-angeles',
  '/new-york-to-dubai',
  '/vancouver-to-london',
  '/delhi-to-london',
  '/brisbane-to-london',
  '/new-york-to-hong-kong',
  '/london-to-mumbai',
  '/dallas-to-london',
  '/london-to-bangalore',
  '/perth-to-london',
  '/new-york-to-paris',
  '/san-francisco-to-london',
  '/dubai-to-mumbai',
  '/atlanta-to-london',
  '/delhi-to-dubai',
  '/boston-to-london',
  '/london-to-tokyo',
  '/new-york-to-berlin',
  '/seattle-to-new-york',
  '/houston-to-new-york',
  '/london-to-bangkok',
  '/london-to-san-francisco',
  '/lisbon-to-rio-de-janeiro',
  '/los-angeles-to-sydney',
  '/adelaide-to-los-angeles',
  '/washington-dc-to-dubai',
  '/delhi-to-hong-kong',
  '/washington-dc-to-nairobi',
  '/rome-to-bangalore',

  // GSC-prioritized city routes + high-impression routes from Search Console
  '/jakarta-to-oslo',
  '/sydney-to-perth',
  '/melbourne-to-sydney',
  '/perth-to-dallas',
  '/san-diego-to-new-york',
  '/melbourne-to-perth',
  '/sydney-to-brisbane',
  '/perth-to-sydney',
  '/brisbane-to-melbourne',
  '/melbourne-to-brisbane',
  '/london-to-melbourne',
  '/sofia-to-manila',
  '/bangalore-to-san-diego',
  '/brisbane-to-sydney',
  '/delhi-to-orlando',
  '/london-to-vancouver',
  '/perth-to-melbourne',
  '/sydney-to-melbourne',
  '/mumbai-to-miami',
  '/new-york-to-kolkata',
  '/washington-dc-to-amsterdam',
  '/san-francisco-to-houston',
  '/hong-kong-to-lima',
  '/warsaw-to-san-diego',
  '/shanghai-to-riyadh',
  '/washington-dc-to-vienna',
  '/houston-to-las-vegas',
  '/adelaide-to-perth',
  '/delhi-to-stockholm',
  '/dallas-to-adelaide',
  '/melbourne-to-adelaide',
  '/washington-dc-to-istanbul',
  '/seattle-to-boston',
  '/delhi-to-kuwait-city',
  '/sydney-to-san-francisco',
  '/miami-to-prague',
  '/las-vegas-to-honolulu',
  '/boston-to-warsaw',
  '/montreal-to-hanoi',
  '/brussels-to-cape-town',
  '/lima-to-colombo',
  '/san-francisco-to-sydney',
  '/new-york-to-sydney',
  '/perth-to-adelaide',
  '/wellington-to-mumbai',
  '/chicago-to-atlanta',
  '/mumbai-to-san-francisco',
  '/cairo-to-houston',
  '/washington-dc-to-houston',
  '/jerusalem-to-new-york',
  '/miami-to-san-diego',
  '/new-york-to-san-diego',
  '/honolulu-to-las-vegas',
  '/houston-to-dubai',
  '/miami-to-dubai',
  '/karachi-to-washington-dc',
  '/san-diego-to-toronto',
  '/london-to-adelaide',
  '/melbourne-to-new-york',
  '/perth-to-brisbane',
  '/kuwait-city-to-dallas',
  '/brisbane-to-orlando',
  '/atlanta-to-chicago',
  '/brussels-to-miami',
  '/athens-to-perth',
  '/bucharest-to-vancouver',
  '/sydney-to-washington-dc',
  '/san-francisco-to-melbourne',
  '/washington-dc-to-bucharest',
  '/nairobi-to-san-diego',
  '/seattle-to-copenhagen',
  '/sydney-to-adelaide',
  '/miami-to-sofia',
  '/geneva-to-montreal',
  '/san-diego-to-helsinki',
  '/san-francisco-to-dallas',
  '/cairo-to-chicago',
  '/houston-to-london',
  '/geneva-to-cairo',
  '/new-york-to-san-francisco',
  '/cairo-to-riyadh',
  '/zurich-to-seattle',
  '/chennai-to-dubai',
  '/bangkok-to-geneva',
  '/bangkok-to-san-diego',
  '/las-vegas-to-chicago',
  '/new-york-to-casablanca',
  '/sydney-to-los-angeles',
  '/san-diego-to-atlanta',
  '/melbourne-to-washington-dc',
  '/brisbane-to-san-diego',
  '/cairo-to-washington-dc',
  '/kuwait-city-to-washington-dc',
  '/est-to-gst',
  '/los-angeles-to-honolulu',
  '/adelaide-to-sydney',
  '/montreal-to-vancouver',
  '/vancouver-to-montreal',
  '/new-york-to-brisbane',
  '/london-to-houston',
  '/manila-to-cairo',
  '/adelaide-to-vancouver',
  '/amsterdam-to-sydney',
  '/london-to-seattle',
  '/brisbane-to-new-york',
  '/atlanta-to-san-francisco',
  '/athens-to-houston',
  '/bangalore-to-melbourne',
  '/prague-to-bucharest',
  '/zurich-to-boston',
  '/london-to-dallas',
  '/honolulu-to-seattle',
  '/seattle-to-washington-dc',
  '/sydney-to-las-vegas',
  '/london-to-perth',
  '/san-francisco-to-adelaide',
  '/houston-to-melbourne',
  '/bucharest-to-athens',
  '/chicago-to-lisbon',
  '/melbourne-to-las-vegas',
  '/nairobi-to-washington-dc',
  '/singapore-to-houston',
  '/singapore-to-seattle',
  '/adelaide-to-melbourne',
  '/dublin-to-geneva',
  '/dallas-to-dubai',
  '/dallas-to-geneva',
  '/orlando-to-las-vegas',
  '/bangkok-to-washington-dc',
  '/dallas-to-las-vegas',
  '/new-york-to-manila',
  '/brisbane-to-johannesburg',
  '/tokyo-to-vancouver',
  '/chicago-to-rome',
  '/perth-to-washington-dc',
  '/adelaide-to-san-diego',
  '/london-to-delhi',
  '/san-francisco-to-tokyo',
  '/new-york-to-tel-aviv',
  '/vancouver-to-belgrade',
  '/hyderabad-to-dubai',
  '/bangkok-to-cape-town',
  '/montreal-to-singapore',
  '/rio-de-janeiro-to-cairo',
  '/new-york-to-houston',
  '/oslo-to-houston',
  '/houston-to-atlanta',
  '/amsterdam-to-san-diego',
  '/cairo-to-seattle',
  '/san-francisco-to-lisbon',
  '/san-diego-to-london',
  '/vienna-to-houston',
  '/las-vegas-to-hong-kong',
  '/washington-dc-to-addis-ababa',
  '/san-diego-to-houston',
  '/melbourne-to-san-diego',
  '/vancouver-to-taipei',
  '/london-to-shanghai',
  '/dublin-to-singapore',
  '/perth-to-new-york',
  '/dubai-to-houston',
  '/bangkok-to-singapore',
  '/seattle-to-london',
  '/brisbane-to-perth',
  '/zurich-to-helsinki',
  '/athens-to-montreal',
  '/nairobi-to-geneva',
  '/barcelona-to-amsterdam',
  '/cairo-to-perth',
  '/geneva-to-melbourne',
  '/melbourne-to-cairo',
  '/rome-to-washington-dc',
  '/rome-to-san-diego',
  '/stockholm-to-atlanta',
  '/chicago-to-montreal',
  '/chicago-to-san-diego',
  '/paris-to-bucharest',
  '/amsterdam-to-cape-town',
  '/boston-to-sydney',
  '/amsterdam-to-houston',
  '/melbourne-to-boston',
  '/sydney-to-houston',
  '/singapore-to-adelaide',
  '/mumbai-to-riyadh',
  '/dubai-to-zurich',
  '/dallas-to-karachi',
  '/riyadh-to-cairo',
  '/barcelona-to-singapore',
  '/copenhagen-to-houston',
  '/jerusalem-to-washington-dc',
  '/miami-to-bucharest',
  '/prague-to-san-francisco',
  '/bucharest-to-miami',
  '/melbourne-to-ho-chi-minh-city',
  '/zurich-to-san-diego',
  '/san-diego-to-barcelona',
  '/manila-to-san-diego',
  '/rome-to-san-francisco',
  '/athens-to-miami',
  '/los-angeles-to-london',
  '/sofia-to-chicago',
  '/houston-to-cape-town',
  '/los-angeles-to-boston',
  '/san-francisco-to-dublin',
  '/dubai-to-washington-dc',
  '/singapore-to-dallas',
  '/las-vegas-to-houston',
  '/amsterdam-to-montreal',
  '/manila-to-san-francisco',
  '/vancouver-to-melbourne',
  '/chicago-to-seattle',
  '/brisbane-to-wellington',
  '/dubai-to-accra',
  '/vancouver-to-adelaide',
  '/singapore-to-oslo',
  '/singapore-to-san-diego',
  '/sydney-to-shanghai',
  '/adelaide-to-brisbane',
  '/accra-to-tokyo',
  '/geneva-to-dubai',
  '/karachi-to-toronto',
  '/honolulu-to-san-diego',
  '/oslo-to-helsinki',
  '/atlanta-to-karachi',
  '/montreal-to-helsinki',
  '/new-york-to-cape-town',
  '/cairo-to-san-francisco',
  '/perth-to-los-angeles',
  '/brisbane-to-miami',
  '/las-vegas-to-melbourne',
  '/toronto-to-bucharest',
  '/houston-to-abu-dhabi',
  '/san-francisco-to-atlanta',
  '/dubai-to-chennai',
  '/houston-to-prague',
  '/mexico-city-to-san-diego',
  '/sydney-to-stockholm',
  '/miami-to-brussels',
  '/san-diego-to-zurich',
  '/san-francisco-to-cape-town',
  '/vienna-to-boston',
  '/san-francisco-to-montreal',
  '/vancouver-to-cairo',
  '/cairo-to-miami',
  '/seattle-to-orlando',
  '/copenhagen-to-san-diego',
  '/istanbul-to-houston',
  '/cape-town-to-san-diego',
  '/houston-to-warsaw',
  '/las-vegas-to-miami',
  '/manila-to-warsaw',
  '/new-york-to-bucharest',
  '/new-york-to-colombo',
  '/rome-to-adelaide',
  '/houston-to-istanbul',
  '/shanghai-to-houston',
  '/san-francisco-to-hanoi',
  '/boston-to-dubai',
  '/tashkent-to-dubai',
  '/new-york-to-las-vegas',
  '/muscat-to-houston',
  '/sydney-to-honolulu',
  '/accra-to-vancouver',
  '/wellington-to-muscat',
  '/amsterdam-to-doha',
  '/dubai-to-doha',
  '/delhi-to-lima',
  '/mumbai-to-wellington',
  '/mumbai-to-frankfurt',
  '/riyadh-to-delhi',
  '/paris-to-doha',
  '/delhi-to-munich',
  '/copenhagen-to-lagos',
  '/accra-to-lahore',
  '/budapest-to-hanoi',
  '/colombo-to-nairobi',
  '/mumbai-to-bogota',
  '/manchester-to-prague',
  '/paris-to-kuala-lumpur',
  '/adelaide-to-tashkent',
  '/brisbane-to-manchester',
  '/seattle-to-taipei',
  '/barcelona-to-oslo',
  '/montreal-to-athens',
  '/orlando-to-san-diego',
  '/jakarta-to-belgrade',
  '/paris-to-montreal',
  '/bucharest-to-houston',
  '/milan-to-bucharest',
  '/helsinki-to-dallas',
  '/geneva-to-kuala-lumpur',
  '/warsaw-to-ho-chi-minh-city',
  '/brussels-to-amsterdam',
  '/hyderabad-to-adelaide',
  '/melbourne-to-manchester',
  '/rio-de-janeiro-to-brisbane',
  '/brisbane-to-prague',
  '/boston-to-riyadh',
  '/cairo-to-rio-de-janeiro',
  '/jerusalem-to-chicago',
  '/karachi-to-boston',
  '/melbourne-to-athens',
  '/melbourne-to-dhaka',
  '/tashkent-to-riyadh',
  '/vienna-to-brisbane',
  '/taipei-to-zurich',
  '/new-york-to-amsterdam',
  '/barcelona-to-helsinki',
  '/beijing-to-almaty',
  '/manila-to-nice',
  '/berlin-to-auckland',
  '/new-york-to-kuala-lumpur',
  '/abu-dhabi-to-toronto',
  '/jakarta-to-hyderabad',
  '/lahore-to-riyadh',
  '/boston-to-kyiv',
  '/geneva-to-athens',
  '/seattle-to-brussels',
  '/geneva-to-san-francisco',
  '/manchester-to-adelaide',
  '/helsinki-to-rio-de-janeiro',
  '/manchester-to-brisbane',
  '/manila-to-prague',
  '/bogota-to-houston',
  '/hong-kong-to-dubai',
  '/new-york-to-seattle',
  '/san-diego-to-orlando',
  '/san-francisco-to-manchester',
  '/amsterdam-to-miami',
  '/brussels-to-seattle',
  '/oslo-to-lisbon',
  '/warsaw-to-taipei',
  '/bangkok-to-bucharest',
  '/chicago-to-hong-kong',
  '/lahore-to-melbourne',
  '/chicago-to-orlando',
  '/lima-to-brisbane',
  '/adelaide-to-manchester',
  '/sofia-to-belgrade',
  '/ho-chi-minh-city-to-san-diego',
  '/nairobi-to-london',
  '/prague-to-singapore',
  '/geneva-to-san-diego',
  '/manchester-to-san-francisco',
  '/miami-to-amsterdam',
  '/vancouver-to-sofia',
  '/hyderabad-to-singapore',
  '/orlando-to-chicago',
  '/san-diego-to-hyderabad',
  '/brisbane-to-barcelona',
  '/helsinki-to-zurich',
  '/istanbul-to-lisbon',
  '/riyadh-to-cape-town',
  '/san-diego-to-sofia',
  '/seattle-to-atlanta',
  '/prague-to-toronto',
  '/munich-to-brisbane',
  '/belgrade-to-atlanta',
  '/montreal-to-bucharest',
  '/tashkent-to-melbourne',
  '/washington-dc-to-belgrade',
  '/hanoi-to-seattle',
  '/los-angeles-to-shanghai',
  '/prague-to-manila',
  '/adelaide-to-bangkok',
  '/cairo-to-prague',
  '/dubai-to-delhi',
  '/hong-kong-to-manchester',
  '/lahore-to-san-francisco',
  '/miami-to-lisbon',
  '/montreal-to-nice',
  '/prague-to-bangalore',
  '/rome-to-dublin',
  '/toronto-to-hyderabad',
  '/vancouver-to-reykjavik',
  '/boston-to-nice',
  '/brisbane-to-jerusalem',
  '/almaty-to-prague',
  '/chennai-to-singapore',
  '/jerusalem-to-seattle',
  '/lima-to-boston',
  '/los-angeles-to-helsinki',
  '/miami-to-brisbane',
  '/cairo-to-melbourne',
  '/dallas-to-san-diego',
  '/san-diego-to-warsaw',
  '/montreal-to-ho-chi-minh-city',
  '/amsterdam-to-orlando',
  '/brisbane-to-bangalore',
  '/chicago-to-tashkent',
  '/dhaka-to-montreal',
  '/kolkata-to-nairobi',
  '/montreal-to-bangkok',
  '/new-york-to-zurich',
  '/oslo-to-kyiv',
  '/perth-to-prague',
  '/riyadh-to-atlanta',
  '/sao-paulo-to-perth',
  '/houston-to-karachi',
  '/las-vegas-to-dubai',
  '/madrid-to-montreal',
  '/shenzhen-to-los-angeles',
  '/athens-to-copenhagen',
  '/budapest-to-geneva',
  '/copenhagen-to-vancouver',
  '/geneva-to-houston',
  '/geneva-to-sao-paulo',
  '/johannesburg-to-atlanta',
  '/kolkata-to-lagos',
  '/nairobi-to-houston',
  '/san-diego-to-cairo',
  '/taipei-to-brussels',
  '/miami-to-belgrade',
  '/athens-to-dallas',
  '/cairo-to-sydney',
  '/manchester-to-bucharest',
  '/houston-to-cairo',
  '/kyiv-to-san-francisco',
  '/oslo-to-beijing',
  '/atlanta-to-brussels',
  '/colombo-to-dubai',
  '/colombo-to-geneva',
  '/houston-to-jakarta',
  '/karachi-to-brisbane',
  '/los-angeles-to-paris',
  '/seattle-to-accra',
  '/stockholm-to-helsinki',
  '/sydney-to-bucharest',
  '/toronto-to-oslo',
  '/warsaw-to-adelaide',
  '/washington-dc-to-casablanca',
  '/chicago-to-paris',
  '/colombo-to-washington-dc',
  '/dhaka-to-perth',
  '/vancouver-to-copenhagen',
  '/boston-to-montreal',
  '/cape-town-to-bangkok',
  '/amsterdam-to-hyderabad',
  '/los-angeles-to-reykjavik',
  '/vancouver-to-nice',
  '/vienna-to-montreal',
  '/belgrade-to-adelaide',
  '/san-francisco-to-amsterdam',
  '/san-francisco-to-orlando',
  '/abu-dhabi-to-singapore',
  '/budapest-to-jakarta',
  '/hanoi-to-toronto',
  '/new-york-to-belgrade',
  '/prague-to-seattle',
  '/riyadh-to-orlando',
  '/berlin-to-tashkent',
  '/delhi-to-singapore',
  '/karachi-to-melbourne',
  '/los-angeles-to-kuala-lumpur',
  '/rome-to-montreal',
  '/taipei-to-barcelona',
  '/atlanta-to-helsinki',
  '/bangkok-to-belgrade',
  '/bangkok-to-johannesburg',
  '/boston-to-seattle',
  '/dallas-to-mexico-city',
  '/hong-kong-to-melbourne',
  '/houston-to-copenhagen',
  '/istanbul-to-atlanta',
  '/perth-to-houston',
  '/amsterdam-to-helsinki',
  '/nairobi-to-cape-town',
  '/perth-to-hanoi',
  '/prague-to-bangkok',
  '/seattle-to-bangalore',
  '/vancouver-to-athens',
  '/bangkok-to-vancouver',
  '/hanoi-to-adelaide',
  '/houston-to-amsterdam',
  '/istanbul-to-karachi',
  '/miami-to-lahore',
  '/milan-to-warsaw',
  '/washington-dc-to-geneva',
  '/las-vegas-to-orlando',
  '/london-to-karachi',
  '/vancouver-to-oslo',
  '/abu-dhabi-to-san-diego',
  '/atlanta-to-lisbon',
  '/lisbon-to-karachi',
  '/vancouver-to-bucharest',
  '/wellington-to-osaka',
  '/atlanta-to-houston',
  '/san-diego-to-nairobi',
  '/boston-to-vienna',
  '/dallas-to-san-francisco',
  '/geneva-to-stockholm',
  '/montreal-to-lisbon',
  '/new-york-to-stockholm',
  '/sao-paulo-to-san-diego',
  '/shanghai-to-osaka',
  '/las-vegas-to-sofia',
  '/miami-to-cairo',
  '/warsaw-to-dallas',
  '/budapest-to-montreal',
  '/hanoi-to-melbourne',
  '/prague-to-vancouver',
  '/sao-paulo-to-vancouver',
  '/budapest-to-istanbul',
  '/budapest-to-seattle',
  '/houston-to-vienna',
  '/prague-to-casablanca',
  '/vancouver-to-hanoi',
  '/geneva-to-helsinki',
  '/honolulu-to-los-angeles',
  '/houston-to-bangkok',
  '/reykjavik-to-budapest',
  '/addis-ababa-to-montreal',
  '/dublin-to-perth',
  '/helsinki-to-montreal',
  '/houston-to-lagos',
  '/jakarta-to-boston',
  '/kuwait-city-to-houston',
  '/lisbon-to-miami',
  '/new-york-to-athens',
  '/vancouver-to-geneva',
  '/belgrade-to-miami',
  '/prague-to-san-diego',
  '/los-angeles-to-oslo',
  '/montreal-to-prague',
  '/san-diego-to-vienna',
  '/toronto-to-lahore',
  '/washington-dc-to-abu-dhabi',
  '/addis-ababa-to-dallas',
  '/barcelona-to-san-diego',
  '/dublin-to-cairo',
  '/honolulu-to-amsterdam',
  '/miami-to-geneva',
  '/perth-to-san-diego',
  '/seattle-to-bucharest',
  '/brussels-to-jakarta',
  '/oslo-to-toronto',
  '/geneva-to-bogota',
  '/hanoi-to-geneva',
  '/jerusalem-to-brisbane',
  '/lisbon-to-cape-town',
  '/sofia-to-boston',
  '/toronto-to-san-francisco',
  '/bangkok-to-houston',
  '/bangkok-to-montreal',
  '/melbourne-to-geneva',
  '/sao-paulo-to-atlanta',
  '/singapore-to-abu-dhabi',
  '/budapest-to-adelaide',
  '/new-york-to-dhaka',
  '/singapore-to-atlanta',
  '/geneva-to-lisbon',
  '/rome-to-brisbane',
  '/copenhagen-to-brisbane',
  '/manila-to-geneva',
  '/lahore-to-sydney',
  '/mexico-city-to-chicago',
  '/san-diego-to-amsterdam',
  '/singapore-to-prague',
  '/amsterdam-to-barcelona',
  '/bangkok-to-las-vegas',
  '/dhaka-to-washington-dc',
  '/las-vegas-to-helsinki',
  '/houston-to-bucharest',
  '/jerusalem-to-adelaide',
  '/athens-to-geneva',
  '/dallas-to-washington-dc',
  '/geneva-to-miami',
  '/kolkata-to-dubai',
  '/prague-to-houston',
  '/amsterdam-to-san-francisco',
  '/atlanta-to-geneva',
  '/cairo-to-adelaide',
  '/geneva-to-hanoi',
  '/miami-to-houston',
  '/toronto-to-hanoi',
  '/boston-to-geneva',
  '/brisbane-to-hanoi',
  '/seattle-to-miami',
  '/bangalore-to-adelaide',
  '/los-angeles-to-lisbon',
  '/prague-to-lisbon',
  '/stockholm-to-perth',
  '/addis-ababa-to-boston',
  '/almaty-to-kuala-lumpur',
  '/dubai-to-bucharest',
  '/houston-to-adelaide',
  '/lisbon-to-dallas',
  '/manchester-to-melbourne',
  '/montreal-to-washington-dc',
  '/berlin-to-cairo',
  '/oslo-to-montreal',
  '/casablanca-to-istanbul',
  '/zurich-to-toronto',
  '/bangalore-to-bangkok',
  '/houston-to-miami',
  '/lisbon-to-los-angeles',
  '/sydney-to-geneva',
  '/bangkok-to-brisbane',
  '/brussels-to-san-diego',
  '/prague-to-washington-dc',
  '/riyadh-to-washington-dc',
  '/montreal-to-manila',
  '/oslo-to-jakarta',
  '/perth-to-cape-town',
  '/dubai-to-manchester',
  '/cairo-to-boston',
  '/vienna-to-melbourne',
  '/adelaide-to-geneva',
  '/las-vegas-to-manchester',
  '/lisbon-to-belgrade',
  '/melbourne-to-tashkent',
  '/nairobi-to-brisbane',
  '/toronto-to-zurich',
  '/helsinki-to-seattle',
  '/milan-to-stockholm',
  '/auckland-to-seattle',
  '/miami-to-budapest',
  '/dallas-to-miami',
  '/geneva-to-vancouver',
  '/mexico-city-to-dallas',
  '/chennai-to-washington-dc',
  '/berlin-to-sofia',
  '/vienna-to-washington-dc',
  '/kolkata-to-dublin',
  '/oslo-to-boston',
  '/washington-dc-to-las-vegas',
  '/geneva-to-new-york',
  '/melbourne-to-dublin',
  '/san-francisco-to-chicago',
  '/vancouver-to-san-diego',
  '/washington-dc-to-accra',
  '/chicago-to-las-vegas',
  '/bangkok-to-helsinki',
  '/melbourne-to-atlanta',
  '/chicago-to-rio-de-janeiro',
  '/miami-to-las-vegas',
  '/los-angeles-to-montreal',
  '/boston-to-istanbul',
  '/boston-to-barcelona',
  '/san-francisco-to-nice',
  '/tokyo-to-brisbane',
  '/berlin-to-perth',
  '/chicago-to-warsaw',
  '/dublin-to-san-diego',
  '/reykjavik-to-dhaka',
  '/hanoi-to-singapore',
  '/lima-to-doha',
  '/london-to-zurich',
  '/chicago-to-copenhagen',
  '/munich-to-dallas',
  '/bangkok-to-seattle',
  '/shanghai-to-san-diego',
  '/stockholm-to-los-angeles',
  '/chicago-to-lahore',
  '/miami-to-melbourne',
  '/las-vegas-to-atlanta',
  '/wellington-to-vancouver',
  '/istanbul-to-miami',
  '/honolulu-to-singapore',
  '/johannesburg-to-washington-dc',
  '/amsterdam-to-washington-dc',
  '/new-york-to-reykjavik',
  '/atlanta-to-dublin',
  '/washington-dc-to-singapore',
  '/boston-to-zurich',
  '/vienna-to-hong-kong',
  '/amsterdam-to-chicago',
  '/montreal-to-las-vegas',
  '/rome-to-colombo',
  '/vancouver-to-perth',
  '/mexico-city-to-houston',
  '/dubai-to-atlanta',
  '/dublin-to-san-francisco',
  '/honolulu-to-london',
  '/milan-to-melbourne',
  '/oslo-to-san-francisco',
  '/atlanta-to-las-vegas',
  '/dublin-to-seattle',
  '/riyadh-to-boston',

];

// City clock routes — all 109 cities from cities.ts + moscow (legacy)
const CITY_CLOCK_ROUTES: string[] = [
  // ── North America ──────────────────────────────────────────────────────────
  '/time-in-new-york',
  '/time-in-los-angeles',
  '/time-in-chicago',
  '/time-in-san-francisco',
  '/time-in-seattle',
  '/time-in-boston',
  '/time-in-miami',
  '/time-in-washington-dc',
  '/time-in-toronto',
  '/time-in-vancouver',
  '/time-in-montreal',
  '/time-in-mexico-city',
  '/time-in-houston',
  '/time-in-dallas',
  '/time-in-atlanta',
  // ── South America ──────────────────────────────────────────────────────────
  '/time-in-sao-paulo',
  '/time-in-rio-de-janeiro',
  '/time-in-buenos-aires',
  '/time-in-santiago',
  '/time-in-bogota',
  '/time-in-lima',
  '/time-in-caracas',
  // ── UK & Ireland ───────────────────────────────────────────────────────────
  '/time-in-london',
  '/time-in-manchester',
  '/time-in-birmingham',
  '/time-in-dublin',
  // ── Western Europe ─────────────────────────────────────────────────────────
  '/time-in-paris',
  '/time-in-berlin',
  '/time-in-madrid',
  '/time-in-barcelona',
  '/time-in-rome',
  '/time-in-milan',
  '/time-in-amsterdam',
  '/time-in-brussels',
  '/time-in-zurich',
  '/time-in-geneva',
  '/time-in-vienna',
  '/time-in-lisbon',
  // ── Northern Europe ────────────────────────────────────────────────────────
  '/time-in-stockholm',
  '/time-in-oslo',
  '/time-in-copenhagen',
  '/time-in-helsinki',
  '/time-in-reykjavik',
  // ── Eastern Europe ─────────────────────────────────────────────────────────
  '/time-in-warsaw',
  '/time-in-prague',
  '/time-in-budapest',
  '/time-in-athens',
  '/time-in-bucharest',
  '/time-in-sofia',
  '/time-in-belgrade',
  '/time-in-kyiv',
  // ── Middle East ────────────────────────────────────────────────────────────
  '/time-in-dubai',
  '/time-in-abu-dhabi',
  '/time-in-riyadh',
  '/time-in-doha',
  '/time-in-kuwait-city',
  '/time-in-muscat',
  '/time-in-tel-aviv',
  '/time-in-jerusalem',
  '/time-in-istanbul',
  // ── South Asia ─────────────────────────────────────────────────────────────
  '/time-in-delhi',
  '/time-in-mumbai',
  '/time-in-bangalore',
  '/time-in-hyderabad',
  '/time-in-chennai',
  '/time-in-kolkata',
  '/time-in-karachi',
  '/time-in-lahore',
  '/time-in-dhaka',
  '/time-in-colombo',
  // ── Southeast Asia ─────────────────────────────────────────────────────────
  '/time-in-singapore',
  '/time-in-kuala-lumpur',
  '/time-in-bangkok',
  '/time-in-jakarta',
  '/time-in-manila',
  '/time-in-ho-chi-minh-city',
  '/time-in-hanoi',
  // ── East Asia ──────────────────────────────────────────────────────────────
  '/time-in-tokyo',
  '/time-in-osaka',
  '/time-in-seoul',
  '/time-in-beijing',
  '/time-in-shanghai',
  '/time-in-shenzhen',
  '/time-in-hong-kong',
  '/time-in-taipei',
  // ── Central Asia ───────────────────────────────────────────────────────────
  '/time-in-almaty',
  '/time-in-tashkent',
  // ── Africa ─────────────────────────────────────────────────────────────────
  '/time-in-johannesburg',
  '/time-in-cape-town',
  '/time-in-nairobi',
  '/time-in-lagos',
  '/time-in-cairo',
  '/time-in-casablanca',
  '/time-in-accra',
  '/time-in-addis-ababa',
  // ── Oceania ────────────────────────────────────────────────────────────────
  '/time-in-sydney',
  '/time-in-melbourne',
  '/time-in-brisbane',
  '/time-in-perth',
  '/time-in-adelaide',
  '/time-in-auckland',
  '/time-in-wellington',
  // ── Travel hubs ────────────────────────────────────────────────────────────
  '/time-in-san-diego',
  '/time-in-las-vegas',
  '/time-in-orlando',
  '/time-in-honolulu',
  '/time-in-frankfurt',
  '/time-in-munich',
  '/time-in-nice',
  // ── Legacy (not in cities.ts but historically prerendered) ─────────────────
  '/time-in-moscow',
];

// ─── Generated pairs: top 30 cities × top 30 cities ──────────────────────────
// All permutations between the 30 most globally-searched cities.
// Same-timezone pairs are excluded (thin content) — identical to sitemap logic.
// The Set in allRoutes deduplicates any overlap with CITY_ROUTES above.
const TOP_30_SLUGS = new Set([
  'new-york', 'london',   'tokyo',    'paris',      'dubai',
  'sydney',   'toronto',  'singapore','chicago',    'berlin',
  'mumbai',   'delhi',    'hong-kong','bangkok',    'istanbul',
  'seoul',    'amsterdam','madrid',   'rome',       'sao-paulo',
  'mexico-city','melbourne','los-angeles','san-francisco','miami',
  'shanghai', 'beijing',  'cairo',    'vancouver',  'karachi',
]);

const top30Cities = cities.filter(c => TOP_30_SLUGS.has(c.slug));

const GENERATED_CITY_ROUTES: string[] = [];
for (const from of top30Cities) {
  for (const to of top30Cities) {
    if (from.slug === to.slug) continue;
    if (from.tz === to.tz) continue; // skip same-timezone pairs (thin content)
    GENERATED_CITY_ROUTES.push(`/${from.slug}-to-${to.slug}`);
  }
}

// Route parsing

const TIMEZONE_CODES = new Set([
  'ist',
  'est',
  'edt',
  'pst',
  'pdt',
  'cst',
  'cdt',
  'mst',
  'mdt',
  'gmt',
  'bst',
  'cet',
  'cest',
  'jst',
  'aest',
  'aedt',
  'sgt',
  'gst',
  'msk',
  'hkt',
  'wet',
  'brt',
  'pht',
  'eet',
  'kst',
  'nzdt',
  'nzst',
  'ast',
]);

type TimezoneData = {
  code: string;
  name: string;
  iana: string;
};

type ConversionLabelMode = 'timezone' | 'city';

const TIMEZONE_DATA_BY_SLUG: Record<string, TimezoneData> = {
  ist: { code: 'IST', name: 'India Standard Time', iana: 'Asia/Kolkata' },
  est: { code: 'EST', name: 'Eastern Time', iana: 'America/New_York' },
  edt: { code: 'EDT', name: 'Eastern Daylight Time', iana: 'America/New_York' },
  pst: { code: 'PST', name: 'Pacific Time', iana: 'America/Los_Angeles' },
  pdt: { code: 'PDT', name: 'Pacific Daylight Time', iana: 'America/Los_Angeles' },
  cst: { code: 'CST', name: 'Central Time', iana: 'America/Chicago' },
  cdt: { code: 'CDT', name: 'Central Daylight Time', iana: 'America/Chicago' },
  mst: { code: 'MST', name: 'Mountain Time', iana: 'America/Denver' },
  mdt: { code: 'MDT', name: 'Mountain Daylight Time', iana: 'America/Denver' },
  gmt: { code: 'GMT', name: 'Greenwich Mean Time', iana: 'Etc/GMT' },
  bst: { code: 'BST', name: 'British Summer Time', iana: 'Europe/London' },
  cet: { code: 'CET', name: 'Central European Time', iana: 'Europe/Berlin' },
  cest: { code: 'CEST', name: 'Central European Summer Time', iana: 'Europe/Berlin' },
  jst: { code: 'JST', name: 'Japan Standard Time', iana: 'Asia/Tokyo' },
  aest: { code: 'AEST', name: 'Australian Eastern Time', iana: 'Australia/Sydney' },
  aedt: { code: 'AEDT', name: 'Australian Eastern Daylight Time', iana: 'Australia/Sydney' },
  sgt: { code: 'SGT', name: 'Singapore Time', iana: 'Asia/Singapore' },
  gst: { code: 'GST', name: 'Gulf Standard Time', iana: 'Asia/Dubai' },
  msk: { code: 'MSK', name: 'Moscow Standard Time', iana: 'Europe/Moscow' },
  hkt: { code: 'HKT', name: 'Hong Kong Time', iana: 'Asia/Hong_Kong' },
  wet: { code: 'WET', name: 'Western European Time', iana: 'Europe/Lisbon' },
  brt: { code: 'BRT', name: 'Brasilia Time', iana: 'America/Sao_Paulo' },
  pht: { code: 'PHT', name: 'Philippine Time', iana: 'Asia/Manila' },
  eet: { code: 'EET', name: 'Eastern European Time', iana: 'Europe/Helsinki' },
  kst: { code: 'KST', name: 'Korea Standard Time', iana: 'Asia/Seoul' },
  nzdt: { code: 'NZDT', name: 'New Zealand Daylight Time', iana: 'Pacific/Auckland' },
  nzst: { code: 'NZST', name: 'New Zealand Standard Time', iana: 'Pacific/Auckland' },
  ast: { code: 'AST', name: 'Atlantic Standard Time', iana: 'America/Halifax' },
};

// Maps each timezone slug to the most representative city that has a /time-in-[slug] page.
// Used on timezone pair pages so footer links point to real pages, not broken /time-in-ist URLs.
const TIMEZONE_REPRESENTATIVE_CITY: Record<string, string> = {
  ist: 'delhi',
  est: 'new-york',
  edt: 'new-york',
  pst: 'los-angeles',
  pdt: 'los-angeles',
  cst: 'chicago',
  cdt: 'chicago',
  mst: 'denver',
  mdt: 'denver',
  gmt: 'london',
  bst: 'london',
  cet: 'berlin',
  cest: 'berlin',
  jst: 'tokyo',
  aest: 'sydney',
  aedt: 'sydney',
  sgt: 'singapore',
  gst: 'dubai',
  msk: 'moscow',
  hkt: 'hong-kong',
  wet: 'lisbon',
  brt: 'sao-paulo',
  pht: 'manila',
  eet: 'helsinki',
  kst: 'seoul',
  nzdt: 'auckland',
  nzst: 'auckland',
};

const CITY_IANA_MAP: Record<string, string> = {
  london: 'Europe/London',
  'new-york': 'America/New_York',
  'los-angeles': 'America/Los_Angeles',
  chicago: 'America/Chicago',
  toronto: 'America/Toronto',
  vancouver: 'America/Vancouver',
  montreal: 'America/Toronto',
  sydney: 'Australia/Sydney',
  melbourne: 'Australia/Melbourne',
  brisbane: 'Australia/Brisbane',
  perth: 'Australia/Perth',
  delhi: 'Asia/Kolkata',
  mumbai: 'Asia/Kolkata',
  bangalore: 'Asia/Kolkata',
  hyderabad: 'Asia/Kolkata',
  chennai: 'Asia/Kolkata',
  kolkata: 'Asia/Kolkata',
  dubai: 'Asia/Dubai',
  singapore: 'Asia/Singapore',
  tokyo: 'Asia/Tokyo',
  osaka: 'Asia/Tokyo',
  'hong-kong': 'Asia/Hong_Kong',
  paris: 'Europe/Paris',
  berlin: 'Europe/Berlin',
  amsterdam: 'Europe/Amsterdam',
  rome: 'Europe/Rome',
  madrid: 'Europe/Madrid',
  moscow: 'Europe/Moscow',
  istanbul: 'Europe/Istanbul',
  bangkok: 'Asia/Bangkok',
  jakarta: 'Asia/Jakarta',
  manila: 'Asia/Manila',
  karachi: 'Asia/Karachi',
  lahore: 'Asia/Karachi',
  dhaka: 'Asia/Dhaka',
  riyadh: 'Asia/Riyadh',
  cairo: 'Africa/Cairo',
  nairobi: 'Africa/Nairobi',
  johannesburg: 'Africa/Johannesburg',
  lagos: 'Africa/Lagos',
  accra: 'Africa/Accra',
  seattle: 'America/Los_Angeles',
  'san-francisco': 'America/Los_Angeles',
  dallas: 'America/Chicago',
  houston: 'America/Chicago',
  atlanta: 'America/New_York',
  miami: 'America/New_York',
  boston: 'America/New_York',
  'washington-dc': 'America/New_York',
  denver: 'America/Denver',
  phoenix: 'America/Phoenix',
  'mexico-city': 'America/Mexico_City',
  'sao-paulo': 'America/Sao_Paulo',
  'buenos-aires': 'America/Argentina/Buenos_Aires',
  lima: 'America/Lima',
  bogota: 'America/Bogota',
  santiago: 'America/Santiago',
  lisbon: 'Europe/Lisbon',
  zurich: 'Europe/Zurich',
  vienna: 'Europe/Vienna',
  stockholm: 'Europe/Stockholm',
  oslo: 'Europe/Oslo',
  helsinki: 'Europe/Helsinki',
  warsaw: 'Europe/Warsaw',
  prague: 'Europe/Prague',
  budapest: 'Europe/Budapest',
  bucharest: 'Europe/Bucharest',
  athens: 'Europe/Athens',
  sofia: 'Europe/Sofia',
  kyiv: 'Europe/Kyiv',
  kiev: 'Europe/Kyiv',
  beijing: 'Asia/Shanghai',
  shanghai: 'Asia/Shanghai',
  seoul: 'Asia/Seoul',
  taipei: 'Asia/Taipei',
  'kuala-lumpur': 'Asia/Kuala_Lumpur',
  colombo: 'Asia/Colombo',
  kathmandu: 'Asia/Kathmandu',
  kabul: 'Asia/Kabul',
  tehran: 'Asia/Tehran',
  baghdad: 'Asia/Baghdad',
  'abu-dhabi': 'Asia/Dubai',
  muscat: 'Asia/Muscat',
  auckland: 'Pacific/Auckland',
  wellington: 'Pacific/Auckland',
  honolulu: 'Pacific/Honolulu',
  anchorage: 'America/Anchorage',
  halifax: 'America/Halifax',
  // ── Additional cities needed for GSC-priority routes ─────────────────────
  'kuwait-city': 'Asia/Kuwait',
  adelaide: 'Australia/Adelaide',
  barcelona: 'Europe/Madrid',
  milan: 'Europe/Rome',
  hanoi: 'Asia/Bangkok',
  'ho-chi-minh-city': 'Asia/Ho_Chi_Minh',
  tashkent: 'Asia/Tashkent',
  jerusalem: 'Asia/Jerusalem',
  'tel-aviv': 'Asia/Jerusalem',
  almaty: 'Asia/Almaty',
  munich: 'Europe/Berlin',
  belgrade: 'Europe/Belgrade',
  'addis-ababa': 'Africa/Addis_Ababa',
  casablanca: 'Africa/Casablanca',
  shenzhen: 'Asia/Shanghai',
  reykjavik: 'Atlantic/Reykjavik',
  'rio-de-janeiro': 'America/Sao_Paulo',
  copenhagen: 'Europe/Copenhagen',
  doha: 'Asia/Qatar',
  'las-vegas': 'America/Los_Angeles',
  'san-diego': 'America/Los_Angeles',
  orlando: 'America/New_York',
  manchester: 'Europe/London',
  dublin: 'Europe/Dublin',
  nice: 'Europe/Paris',
  frankfurt: 'Europe/Berlin',
};

interface ParsedConversionRoute {
  fromSlug: string;
  toSlug: string;
  fromName: string;
  toName: string;
}

const titleCase = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const parseConversionRoute = (route: string): ParsedConversionRoute | null => {
  const match = route.match(/^\/([a-z0-9-]+)-to-([a-z0-9-]+)$/i);
  if (!match) return null;

  const fromSlug = match[1].toLowerCase();
  const toSlug = match[2].toLowerCase();

  return {
    fromSlug,
    toSlug,
    fromName: TIMEZONE_CODES.has(fromSlug) ? fromSlug.toUpperCase() : titleCase(fromSlug),
    toName: TIMEZONE_CODES.has(toSlug) ? toSlug.toUpperCase() : titleCase(toSlug),
  };
};

// ─── Related conversions — pre-built lookup structures ────────────────────────
// All maps are built ONCE at module start — O(1) lookup per rendered route.

// Priority-ordered city slugs for related route selection.
// Cities earlier in this list are preferred as related suggestions,
// so the most globally-searched pairs surface first.
const RELATED_PRIORITY: readonly string[] = [
  'london', 'new-york', 'dubai', 'sydney', 'singapore', 'tokyo', 'paris',
  'berlin', 'toronto', 'mumbai', 'hong-kong', 'bangkok', 'istanbul',
  'seoul', 'amsterdam', 'madrid', 'rome', 'sao-paulo', 'mexico-city',
  'melbourne', 'los-angeles', 'san-francisco', 'miami', 'shanghai',
  'beijing', 'cairo', 'vancouver', 'karachi', 'delhi', 'chicago',
  'moscow', 'johannesburg', 'nairobi', 'riyadh', 'kuala-lumpur',
  'jakarta', 'taipei', 'lagos', 'ho-chi-minh-city', 'doha',
];

// Merge cities[] + CITY_IANA_MAP into one Map — cities[] wins on conflicts
// because it is the authoritative data source.
const CITY_TZ_LOOKUP = new Map<string, string>([
  ...Object.entries(CITY_IANA_MAP),
  ...cities.map(c => [c.slug, c.tz] as [string, string]),
]);

// Slug → proper display name (e.g. "hong-kong" → "Hong Kong").
// Prefers the curated name from cities.ts; falls back to titleCase.
const CITY_NAME_LOOKUP = new Map<string, string>(
  cities.map(c => [c.slug, c.name])
);
const getDisplayName = (slug: string): string =>
  CITY_NAME_LOOKUP.get(slug) ?? titleCase(slug);

// Returns up to `count` related city-pair route strings for a given pair.
//   First half  → same "from" city,  different popular destinations.
//   Second half → different popular origins, same "to" city.
// Same-timezone pairs are excluded (they show 0h difference — thin content).
const getRelatedCityRoutes = (
  fromSlug: string,
  toSlug: string,
  count = 6,
): string[] => {
  const fromTz = CITY_TZ_LOOKUP.get(fromSlug);
  const toTz   = CITY_TZ_LOOKUP.get(toSlug);
  if (!fromTz || !toTz) return [];

  const half    = Math.ceil(count / 2);
  const results: string[] = [];
  // Track seen pairs to avoid duplicates (in both directions).
  const seen    = new Set([`${fromSlug}>${toSlug}`, `${toSlug}>${fromSlug}`]);

  // Pass 1: same "from" → different destinations
  for (const dest of RELATED_PRIORITY) {
    if (results.length >= half) break;
    if (dest === fromSlug || dest === toSlug) continue;
    const destTz = CITY_TZ_LOOKUP.get(dest);
    if (!destTz || destTz === fromTz) continue; // same-tz = thin content
    const key = `${fromSlug}>${dest}`;
    if (!seen.has(key)) { seen.add(key); results.push(`/${fromSlug}-to-${dest}`); }
  }

  // Pass 2: different origins → same "to"
  for (const orig of RELATED_PRIORITY) {
    if (results.length >= count) break;
    if (orig === fromSlug || orig === toSlug) continue;
    const origTz = CITY_TZ_LOOKUP.get(orig);
    if (!origTz || origTz === toTz) continue; // same-tz = thin content
    const key = `${orig}>${toSlug}`;
    if (!seen.has(key)) { seen.add(key); results.push(`/${orig}-to-${toSlug}`); }
  }

  return results.slice(0, count);
};

// Returns up to `count` city-pair routes FROM a given city.
// Used on city clock pages (/time-in-london) to link to conversion pages.
const getTopRoutesFromCity = (fromSlug: string, count = 5): string[] => {
  const fromTz = CITY_TZ_LOOKUP.get(fromSlug);
  if (!fromTz) return [];

  const results: string[] = [];
  const seen    = new Set([fromSlug]);

  for (const dest of RELATED_PRIORITY) {
    if (results.length >= count) break;
    if (seen.has(dest)) continue;
    const destTz = CITY_TZ_LOOKUP.get(dest);
    if (!destTz || destTz === fromTz) continue;
    seen.add(dest);
    results.push(`/${fromSlug}-to-${dest}`);
  }

  return results;
};

// Renders a pill-link grid section from an array of route paths.
// heading — shown as a small label above the pills.
const buildRelatedSection = (routes: string[], heading = 'Related Conversions'): string => {
  if (routes.length === 0) return '';

  const pills = routes
    .map(route => {
      const m = route.match(/^\/([a-z0-9-]+)-to-([a-z0-9-]+)$/);
      if (!m) return '';
      const label = `${getDisplayName(m[1])} → ${getDisplayName(m[2])}`;
      return `<a href="${route}" style="display:inline-block;padding:9px 16px;border-radius:999px;border:1px solid #27272a;color:#a1a1aa;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">${esc(label)}</a>`;
    })
    .filter(Boolean)
    .join('\n            ');

  return `
        <div style="margin-top:32px;padding:28px 32px;border:1px solid #27272a;border-radius:32px;background:#09090b;">
          <div style="font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#71717a;margin-bottom:14px;">${esc(heading)}</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${pills}
          </div>
        </div>`;
};

// SEO helpers

const formatHourValue = (value: number) => {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/0$/, '').replace(/\.0$/, '');
};

const getOffsetHours = (iana: string, date: Date = new Date()) => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'longOffset',
    }).formatToParts(date);

    const offsetStr = parts.find(part => part.type === 'timeZoneName')?.value || 'GMT+0';
    const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);

    if (!match) return 0;

    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;

    return sign * (hours + minutes / 60);
  } catch {
    return 0;
  }
};

// Returns true if the IANA zone shifts between Jan and Jul (i.e. observes DST).
const observesDst = (iana: string): boolean => {
  try {
    const year = new Date().getFullYear();
    return getOffsetHours(iana, new Date(year, 0, 15)) !== getOffsetHours(iana, new Date(year, 6, 15));
  } catch {
    return false;
  }
};

const getCurrentTimeZoneName = (iana: string, fallback: string) => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'long',
    }).formatToParts(new Date());

    return parts.find(part => part.type === 'timeZoneName')?.value || fallback;
  } catch {
    return fallback;
  }
};

const formatOffsetPhrase = (fromIana: string, toIana: string) => {
  const diff = getOffsetHours(fromIana) - getOffsetHours(toIana);

  if (diff === 0) return 'at the same time as';

  const abs = Math.abs(diff);
  const hours = formatHourValue(abs);

  return `${hours} hour${abs === 1 ? '' : 's'} ${diff > 0 ? 'ahead of' : 'behind'}`;
};

const buildConversionDescription = (parsed: ParsedConversionRoute) => {
  const { fromSlug, toSlug, fromName, toName } = parsed;

  const fromTimezone = TIMEZONE_DATA_BY_SLUG[fromSlug];
  const toTimezone = TIMEZONE_DATA_BY_SLUG[toSlug];

  if (fromTimezone && toTimezone) {
    const offsetPhrase = formatOffsetPhrase(fromTimezone.iana, toTimezone.iana);
    const fromLongName = getCurrentTimeZoneName(fromTimezone.iana, fromTimezone.name);
    const toLongName = getCurrentTimeZoneName(toTimezone.iana, toTimezone.name);

    if (offsetPhrase === 'at the same time as') {
      return `${fromTimezone.name} (${fromTimezone.code}) is at the same time as ${toTimezone.name} (${toTimezone.code}). Convert any ${fromTimezone.code} time to ${toTimezone.code} instantly — DST-aware, live clock, and best meeting hours included.`;
    }

    return `${fromLongName} (${fromTimezone.code}) is currently ${offsetPhrase} ${toLongName} (${toTimezone.code}). Convert any ${fromTimezone.code} time to ${toTimezone.code} instantly — DST-aware, live clock, and best meeting hours included.`;
  }

  const fromIana = CITY_IANA_MAP[fromSlug];
  const toIana = CITY_IANA_MAP[toSlug];

  if (fromIana && toIana) {
    const offsetPhrase = formatOffsetPhrase(fromIana, toIana);

    if (offsetPhrase === 'at the same time as') {
      return `${fromName} and ${toName} are currently at the same time. Convert time between ${fromName} and ${toName}, see the exact difference, and find the best hours for calls and meetings.`;
    }

    return `${fromName} is currently ${offsetPhrase} ${toName}. Convert time between ${fromName} and ${toName}, see the exact difference, and find the best hours for calls and meetings.`;
  }

  return `Convert time between ${fromName} and ${toName}. See the exact time difference and find the best hours for calls and meetings.`;
};

const formatTime12h = (totalMinutes: number): string => {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
};

const buildVisibleConversionTable = (
  fromIana: string,
  toIana: string,
  fromName: string,
  toName: string,
  fromFullName: string,
  toFullName: string,
  labelMode: ConversionLabelMode
): string => {
  try {
    const fromOffsetHours = getOffsetHours(fromIana);
    const toOffsetHours = getOffsetHours(toIana);
    const diffMinutes = Math.round((toOffsetHours - fromOffsetHours) * 60);
    const offsetPhrase = formatOffsetPhrase(fromIana, toIana);
    const firstToTime = formatTime12h(diffMinutes);
    const keyHours = Array.from({ length: 24 }, (_, i) => i);

    const rows = keyHours
      .map(hour => {
        const fromMinutes = hour * 60;
        const toMinutes = fromMinutes + diffMinutes;
        const fromTime = formatTime12h(fromMinutes);
        const toTime = formatTime12h(toMinutes);

        return `          <tr>
            <td style="padding:10px 16px;color:#a1a1aa;border-bottom:1px solid #18181b;">${esc(fromTime)} ${esc(fromName)}</td>
            <td style="padding:10px 16px;color:#ffffff;border-bottom:1px solid #18181b;font-weight:600;">${esc(toTime)} ${esc(toName)}</td>
          </tr>`;
      })
      .join('\n');

    const offsetStatement =
      offsetPhrase === 'at the same time as'
        ? labelMode === 'timezone'
          ? `${esc(fromName)} (${esc(fromFullName)}) and ${esc(toName)} (${esc(toFullName)}) are currently at the same time.`
          : `${esc(fromName)} and ${esc(toName)} are currently at the same time. ${esc(fromName)} uses ${esc(fromFullName)} and ${esc(toName)} uses ${esc(toFullName)}.`
        : labelMode === 'timezone'
          ? `${esc(fromName)} is known as <em>${esc(fromFullName)}</em>. ${esc(toName)} is known as <em>${esc(toFullName)}</em>. ${esc(fromName)} is ${esc(offsetPhrase)} ${esc(toName)}.`
          : `${esc(fromName)} uses <em>${esc(fromFullName)}</em>. ${esc(toName)} uses <em>${esc(toFullName)}</em>. ${esc(fromName)} time is ${esc(offsetPhrase)} ${esc(toName)}.`;

    return `
        <section style="margin-top:32px;">
          <p style="font-size:16px;line-height:1.7;color:#a1a1aa;max-width:900px;margin:0;">
            ${offsetStatement} So, when it is 12:00 AM in ${esc(fromName)}, it is ${esc(firstToTime)} in ${esc(toName)}.
          </p>
          <div style="margin-top:32px;padding:32px;border:1px solid #27272a;border-radius:32px;background:#09090b;">
            <h2 style="font-size:16px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#ffffff;margin:0 0 6px 0;">
              ${esc(fromName)} to ${esc(toName)} Time Conversion
            </h2>
            <p style="font-size:13px;color:#71717a;margin:0 0 20px 0;">
              Common ${esc(fromName)} times and their ${esc(toName)} equivalents.
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px 16px;color:#71717a;font-weight:600;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;border-bottom:1px solid #27272a;">${esc(fromName)} Time</th>
                  <th style="text-align:left;padding:8px 16px;color:#71717a;font-weight:600;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;border-bottom:1px solid #27272a;">${esc(toName)} Time</th>
                </tr>
              </thead>
              <tbody>
${rows}
              </tbody>
            </table>
          </div>
        </section>`;
  } catch {
    return '';
  }
};

const buildVisibleConversionTableForRoute = (parsed: ParsedConversionRoute): string => {
  const { fromSlug, toSlug, fromName, toName } = parsed;

  const fromTimezone = TIMEZONE_DATA_BY_SLUG[fromSlug];
  const toTimezone = TIMEZONE_DATA_BY_SLUG[toSlug];

  if (fromTimezone && toTimezone) {
    const fromFullName = getCurrentTimeZoneName(fromTimezone.iana, fromTimezone.name);
    const toFullName = getCurrentTimeZoneName(toTimezone.iana, toTimezone.name);

    return buildVisibleConversionTable(
      fromTimezone.iana,
      toTimezone.iana,
      fromTimezone.code,
      toTimezone.code,
      fromFullName,
      toFullName,
      'timezone'
    );
  }

  const fromIana = CITY_IANA_MAP[fromSlug];
  const toIana = CITY_IANA_MAP[toSlug];

  if (fromIana && toIana) {
    const fromFullName = getCurrentTimeZoneName(fromIana, fromName);
    const toFullName = getCurrentTimeZoneName(toIana, toName);

    return buildVisibleConversionTable(
      fromIana,
      toIana,
      fromName,
      toName,
      fromFullName,
      toFullName,
      'city'
    );
  }

  return '';
};

const buildNoscriptTable = (
  fromIana: string,
  toIana: string,
  fromName: string,
  toName: string
): string => {
  try {
    const fromOffsetHours = getOffsetHours(fromIana);
    const toOffsetHours = getOffsetHours(toIana);
    const diffMinutes = Math.round((toOffsetHours - fromOffsetHours) * 60);

    const rows = Array.from({ length: 24 }, (_, hour) => {
      const fromMinutes = hour * 60;
      const toMinutes = fromMinutes + diffMinutes;

      return `        <tr>
          <td>${esc(formatTime12h(fromMinutes))} in ${esc(fromName)}</td>
          <td>${esc(formatTime12h(toMinutes))} in ${esc(toName)}</td>
        </tr>`;
    }).join('\n');

    return `
    <noscript>
      <section aria-label="${esc(fromName)} to ${esc(toName)} time conversion table">
        <h2>${esc(fromName)} to ${esc(toName)} Time Conversion Table</h2>
        <p>Use this table to convert time between ${esc(fromName)} and ${esc(toName)} without JavaScript.</p>
        <table>
          <caption>${esc(fromName)} to ${esc(toName)} hourly time conversion</caption>
          <thead>
            <tr>
              <th>${esc(fromName)} Time</th>
              <th>${esc(toName)} Time</th>
            </tr>
          </thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </section>
    </noscript>`;
  } catch {
    return '';
  }
};

const buildNoscriptTableForRoute = (parsed: ParsedConversionRoute | null): string => {
  if (!parsed) return '';

  const { fromSlug, toSlug, fromName, toName } = parsed;

  const fromTimezone = TIMEZONE_DATA_BY_SLUG[fromSlug];
  const toTimezone = TIMEZONE_DATA_BY_SLUG[toSlug];

  if (fromTimezone && toTimezone) {
    return buildNoscriptTable(
      fromTimezone.iana,
      toTimezone.iana,
      fromTimezone.code,
      toTimezone.code
    );
  }

  const fromIana = CITY_IANA_MAP[fromSlug];
  const toIana = CITY_IANA_MAP[toSlug];

  if (fromIana && toIana) {
    return buildNoscriptTable(fromIana, toIana, fromName, toName);
  }

  return '';
};

// Builds a FAQPage JSON-LD block for city pair and timezone pair pages.
// All values are computed at prerender time from IANA data — zero runtime cost.
const buildConversionFaqJsonLd = (
  fromIana: string,
  toIana: string,
  fromName: string,
  toName: string,
): string => {
  const diffMinutes = Math.round((getOffsetHours(toIana) - getOffsetHours(fromIana)) * 60);
  const absDiff = Math.abs(diffMinutes);
  const absDiffHours = formatHourValue(absDiff / 60);
  const offsetPhrase = formatOffsetPhrase(fromIana, toIana);

  const nineAmTo    = formatTime12h(9  * 60 + diffMinutes);
  const noonTo      = formatTime12h(12 * 60 + diffMinutes);

  // Compute business-hour overlap (09:00–18:00 in both zones).
  const fromStart = 9 * 60;
  const fromEnd   = 18 * 60;
  const toStartInFrom = 9  * 60 - diffMinutes;
  const toEndInFrom   = 18 * 60 - diffMinutes;
  const overlapStart = Math.max(fromStart, toStartInFrom);
  const overlapEnd   = Math.min(fromEnd,   toEndInFrom);

  const bestMeetingAnswer = overlapStart < overlapEnd
    ? `The best overlap for a meeting is ${formatTime12h(overlapStart)}–${formatTime12h(overlapEnd)} ${fromName} time (${formatTime12h(overlapStart + diffMinutes)}–${formatTime12h(overlapEnd + diffMinutes)} ${toName} time), when both locations are within standard business hours.`
    : `There is no business-hour overlap between ${fromName} and ${toName} given the ${absDiffHours}-hour difference. Consider an early-morning or late-evening slot for one party.`;

  const fromDst = observesDst(fromIana);
  const toDst   = observesDst(toIana);
  const dstAnswer =
    fromDst && toDst
      ? `Both ${fromName} and ${toName} observe Daylight Saving Time, though their clock-change dates may differ. The gap between them can shift by up to one hour during spring and autumn transitions.`
      : fromDst
      ? `${fromName} observes Daylight Saving Time but ${toName} does not, so the difference between them shifts by one hour during ${fromName}'s DST period.`
      : toDst
      ? `${toName} observes Daylight Saving Time but ${fromName} does not, so the difference between them shifts by one hour during ${toName}'s DST period.`
      : `Neither ${fromName} nor ${toName} observes Daylight Saving Time, so their time difference stays the same all year.`;

  const faqs = [
    {
      question: `What is the time difference between ${fromName} and ${toName}?`,
      answer: diffMinutes === 0
        ? `${fromName} and ${toName} share the same time zone — there is no difference between them.`
        : `${fromName} is ${offsetPhrase} ${toName}, a difference of ${absDiffHours} hour${absDiff === 60 ? '' : 's'}.`,
    },
    {
      question: `What time is it in ${toName} when it is 9:00 AM in ${fromName}?`,
      answer: `When it is 9:00 AM in ${fromName}, it is ${nineAmTo} in ${toName}.`,
    },
    {
      question: `What time is it in ${toName} when it is 12:00 PM (noon) in ${fromName}?`,
      answer: `When it is 12:00 PM (noon) in ${fromName}, it is ${noonTo} in ${toName}.`,
    },
    {
      question: `What is the best time to schedule a meeting between ${fromName} and ${toName}?`,
      answer: bestMeetingAnswer,
    },
    {
      question: `Does ${fromName} or ${toName} observe Daylight Saving Time?`,
      answer: dstAnswer,
    },
  ];

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  });
};

// Static page SEO

const staticSeo: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Time Zone Converter - Convert Time Between Any Two Cities',
    description: 'Free time zone converter for 500+ cities worldwide. Instantly see the time difference between any two cities, find meeting-friendly hours, and plan across time zones.',
  },
  '/stopwatch': {
    title: 'Online Stopwatch — Free, with Lap Timer | WorldTimeSuite',
    description: 'Free online stopwatch with lap times and split tracking. Instant start, no download. Works on desktop and mobile — ideal for workouts, sports, running, and cooking.',
  },
  '/timer': {
    title: 'Online Timer — Free Countdown Timer, No Sign-up | WorldTimeSuite',
    description: 'Free online countdown timer — set in seconds, runs instantly on any device. No download, no account. Use as a classroom timer, meeting timer, or study timer.',
  },
  '/calendar': {
    title: 'Time Zone Calendar - Plan Meetings Across Time Zones | WorldTimeSuite',
    description: 'Plan and schedule across time zones with our timezone-aware calendar. See overlapping hours between cities and avoid scheduling mistakes.',
  },
  '/about': {
    title: 'About WorldTimeSuite - Free Global Time Zone Converter and World Clock',
    description: 'Learn about WorldTimeSuite, a free productivity suite for global teams and remote workers. Convert time zones, plan meetings, and use online timer, stopwatch, and calendar tools.',
  },
  '/terms': {
    title: 'Terms and Conditions | WorldTimeSuite',
    description: 'Read the WorldTimeSuite terms and conditions, including usage policy, accuracy disclaimers, acceptable use, and legal information for using our free online tools.',
  },
  '/privacy': {
    title: 'Privacy Policy | WorldTimeSuite',
    description: 'Read the WorldTimeSuite privacy policy, including how we handle data, cookies, Google AdSense advertising, analytics, and your privacy rights.',
  },
  '/world-clock': {
    title: 'World Clock — Live Time in 100+ Cities Worldwide | WorldTimeSuite',
    description: 'World clock showing live local time in New York, London, Dubai, Tokyo, Sydney and 23 more cities. Grouped by region, with UTC offset and DST status. Always accurate.',
  },
  '/globe': {
    title: 'Globe — Interactive 3D Globe for World time zone | WorldTimeSuite',
    description: 'Interactive 3D Globe showing current local time for every country. Spin the globe, hover any nation for its UTC offset and live clock. Free, no sign-up.',
  },
  '/blog': {
    title: 'Time Zone Blog — DST, World Clocks & Scheduling Guides | WorldTimeSuite',
    description: 'Guides on daylight saving time, world time zones, UTC offsets, and scheduling across borders. Practical articles for remote teams, travellers, and global professionals.',
  },
  '/about-author': {
    title: 'About the Author — Sahil Choudhary, Creator of WorldTimeSuite',
    description: 'Meet Sahil Choudhary, the engineer and creator behind WorldTimeSuite — a free global time zone converter, world clock, and scheduling suite built with AI.',
  },
};

// Populate blog post SEO entries dynamically so new posts are covered automatically
BLOG_POSTS.forEach(p => {
  staticSeo[`/blog/${p.slug}`] = {
    title: `${p.title} | WorldTimeSuite Blog`,
    description: p.metaDescription,
  };
});

// HTML helpers

const esc = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

interface StaticCopy {
  heading: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}

const getStaticCopy = (route: string): StaticCopy => {
  if (route.startsWith('/blog/')) {
    const slug = route.slice(6);
    const post = BLOG_POST_BY_SLUG[slug];
    if (post) {
      return {
        heading: post.title,
        description: post.metaDescription,
        ctaHref: '/blog',
        ctaLabel: 'More Articles',
      };
    }
  }

  switch (route) {
    case '/timer':
      return {
        heading: 'Online Countdown Timer',
        description: 'Set a free online countdown timer in seconds. Fast, distraction-free, works instantly on any device - no sign-up needed.',
        ctaHref: '/timer',
        ctaLabel: 'Open Timer',
      };
    case '/stopwatch':
      return {
        heading: 'Online Stopwatch',
        description: 'Free online stopwatch with lap tracking. Start, stop and record laps instantly on desktop and mobile - no download needed.',
        ctaHref: '/stopwatch',
        ctaLabel: 'Open Stopwatch',
      };
    case '/calendar':
      return {
        heading: 'Time Zone Calendar',
        description: 'Plan meetings and tasks across time zones. Compare overlapping hours between cities and avoid scheduling mistakes.',
        ctaHref: '/calendar',
        ctaLabel: 'Open Calendar',
      };
    case '/blog':
      return {
        heading: 'Time Zones, Explained.',
        description: 'Guides, explainers, and deep dives on time zones, daylight saving time, scheduling across borders, and global productivity.',
        ctaHref: '/blog',
        ctaLabel: 'Read the Blog',
      };
    case '/about-author':
      return {
        heading: 'From the Author',
        description: 'Meet Sahil Choudhary, the engineer behind WorldTimeSuite — a free global time zone converter and productivity suite.',
        ctaHref: '/',
        ctaLabel: 'Back to Tools',
      };
    case '/about':
      return {
        heading: 'About WorldTimeSuite',
        description: 'WorldTimeSuite is a free time zone converter and productivity suite for global teams, remote workers, and anyone planning across time zones. Use it to convert time zones, compare cities, and access online timer, stopwatch, and calendar tools.',
        ctaHref: '/',
        ctaLabel: 'Open Time Zone Converter',
      };
    case '/terms':
      return {
        heading: 'Terms and Conditions',
        description: 'Read the terms and conditions for using WorldTimeSuite, including usage policy, accuracy disclaimers, acceptable use, and legal information for our free online tools.',
        ctaHref: '/',
        ctaLabel: 'Back to Tools',
      };
    case '/privacy':
      return {
        heading: 'Privacy Policy',
        description: 'Read how WorldTimeSuite handles data, cookies, Google AdSense advertising, analytics, and privacy rights while providing free online productivity tools.',
        ctaHref: '/',
        ctaLabel: 'Back to Tools',
      };
    default:
      return {
        heading: 'Time Zone Converter',
        description: 'Convert time between 500+ cities worldwide. See the exact time difference and find the best hours to meet across time zones.',
        ctaHref: '/',
        ctaLabel: 'Open Time Zone Converter',
      };
  }
};

const buildBody = (route: string, parsed: ParsedConversionRoute | null, conversionDescription?: string): string => {
  if (parsed) {
    const { fromName, toName } = parsed;
    const descText =
      conversionDescription ||
      `Convert time between ${fromName} and ${toName}. See the exact time difference and best hours to schedule meetings.`;
    const visibleTable = buildVisibleConversionTableForRoute(parsed);

    return `
    <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
      <div style="max-width:1100px;margin:0 auto;">
        <h1 style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;color:#fff;margin:0;padding:0;">
          ${esc(fromName)} to ${esc(toName)} Time Converter
        </h1>
        <p style="margin-top:24px;font-size:20px;line-height:1.6;color:#a1a1aa;max-width:900px;">
          ${esc(descText)}
        </p>
        <div style="margin-top:40px;padding:32px;border:1px solid #27272a;border-radius:32px;background:#09090b;">
          <div style="font-size:12px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#71717a;margin-bottom:16px;">Live Route</div>
          <div style="font-size:42px;font-weight:800;letter-spacing:-0.03em;text-transform:uppercase;">${esc(fromName)} &rarr; ${esc(toName)}</div>
          <div style="margin-top:24px;">
            <a href="${route}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">Open Converter</a>
          </div>
        </div>
${visibleTable}
${buildRelatedSection(getRelatedCityRoutes(parsed.fromSlug, parsed.toSlug))}
        <div style="margin-top:32px;padding:24px 0;border-top:1px solid #27272a;display:flex;flex-wrap:wrap;gap:16px;">
          ${(() => {
            // For timezone pair pages the slug is e.g. "ist" — there's no /time-in-ist page.
            // Use the representative city for that timezone instead.
            const fromCitySlug = TIMEZONE_DATA_BY_SLUG[parsed.fromSlug]
              ? (TIMEZONE_REPRESENTATIVE_CITY[parsed.fromSlug] || null)
              : parsed.fromSlug;
            const toCitySlug = TIMEZONE_DATA_BY_SLUG[parsed.toSlug]
              ? (TIMEZONE_REPRESENTATIVE_CITY[parsed.toSlug] || null)
              : parsed.toSlug;
            const fromCityName = fromCitySlug ? getDisplayName(fromCitySlug) : fromName;
            const toCityName   = toCitySlug   ? getDisplayName(toCitySlug)   : toName;
            const fromLink = fromCitySlug
              ? `<a href="/time-in-${esc(fromCitySlug)}" style="color:#a1a1aa;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Current time in ${esc(fromCityName)}</a>`
              : '';
            const toLink = toCitySlug
              ? `<a href="/time-in-${esc(toCitySlug)}" style="color:#a1a1aa;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Current time in ${esc(toCityName)}</a>`
              : '';
            return `${fromLink}\n          ${toLink}`;
          })()}
          <a href="/world-clock" style="color:#a1a1aa;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">World Clock</a>
        </div>
      </div>
    </div>`;
  }

  const copy = getStaticCopy(route);

  return `
    <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
      <div style="max-width:1100px;margin:0 auto;">
        <h1 style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;color:#fff;margin:0;padding:0;">
          ${esc(copy.heading)}
        </h1>
        <p style="margin-top:24px;font-size:20px;line-height:1.6;color:#a1a1aa;max-width:900px;">
          ${esc(copy.description)}
        </p>
        <div style="margin-top:24px;">
          <a href="${esc(copy.ctaHref)}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">
            ${esc(copy.ctaLabel)}
          </a>
        </div>
      </div>
    </div>`;
};

// ─── City clock page SEO helpers ─────────────────────────────────────────────

const CITY_CLOCK_SEO_IANA_MAP: Record<string, string> = { ...CITY_IANA_MAP };

// Also cover any cities whose slugs differ from the seo map but exist in cities list
cities.forEach(c => {
  if (!CITY_CLOCK_SEO_IANA_MAP[c.slug]) {
    CITY_CLOCK_SEO_IANA_MAP[c.slug] = c.tz;
  }
});

// Returns the standard (non-DST) timezone name by always using a January date.
// This ensures the description is evergreen — e.g. always "Eastern Standard Time",
// never the DST variant "Eastern Daylight Time".
const getStandardTimeZoneName = (iana: string, fallback: string): string => {
  try {
    const janDate = new Date(new Date().getFullYear(), 0, 15);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'long',
    }).formatToParts(janDate);
    return parts.find(p => p.type === 'timeZoneName')?.value || fallback;
  } catch {
    return fallback;
  }
};

const buildCityClockDescription = (cityName: string, iana: string): string => {
  const year = new Date().getFullYear();
  const janOffset = getOffsetHours(iana, new Date(year, 0, 15));
  const julOffset = getOffsetHours(iana, new Date(year, 6, 15));
  const hasDst = janOffset !== julOffset;

  // Standard offset = the smaller of the two (winter / non-DST)
  const stdOffset = Math.min(janOffset, julOffset);
  const dstOffset = Math.max(janOffset, julOffset);

  const fmtOffset = (h: number): string => {
    const abs = Math.abs(h);
    const sign = h >= 0 ? '+' : '-';
    const hrs = Math.floor(abs);
    const mins = Math.round((abs - hrs) * 60);
    return `UTC${sign}${hrs}${mins > 0 ? ':' + String(mins).padStart(2, '0') : ''}`;
  };

  // Use the standard-time name (January) so the description never says "Summer Time"
  const stdName = getStandardTimeZoneName(iana, 'Local Time');

  const offsetNote = hasDst
    ? `${fmtOffset(stdOffset)} standard, ${fmtOffset(dstOffset)} in summer`
    : fmtOffset(stdOffset);

  const dstNote = hasDst
    ? ` ${cityName} observes daylight saving time.`
    : '';

  return `Current local time in ${cityName}. ${cityName} is in the ${stdName} zone (${offsetNote}).${dstNote} Live clock with UTC offset table and time zone details.`;
};

const build24HourOffsetTable = (cityName: string, iana: string): string => {
  try {
    const offsetHours = getOffsetHours(iana);
    const utcOffsetMins = Math.round(offsetHours * 60);
    const rows = Array.from({ length: 24 }, (_, hour) => {
      const utcMins = hour * 60;
      const localMins = ((utcMins + utcOffsetMins) % 1440 + 1440) % 1440;
      const localHour = Math.floor(localMins / 60);
      const localMin = localMins % 60;
      const period = localHour < 12 ? 'AM' : 'PM';
      const displayHour = localHour % 12 === 0 ? 12 : localHour % 12;
      const localTimeStr = `${displayHour}:${String(localMin).padStart(2, '0')} ${period}`;
      const utcHour = Math.floor(hour);
      const utcPeriod = utcHour < 12 ? 'AM' : 'PM';
      const utcDisplayHour = utcHour % 12 === 0 ? 12 : utcHour % 12;
      const utcTimeStr = `${utcDisplayHour}:00 ${utcPeriod}`;
      return `          <tr>
            <td style="padding:8px 16px;color:#a1a1aa;border-bottom:1px solid #18181b;">${esc(utcTimeStr)} UTC</td>
            <td style="padding:8px 16px;color:#ffffff;border-bottom:1px solid #18181b;font-weight:600;">${esc(localTimeStr)} ${esc(cityName)}</td>
          </tr>`;
    }).join('\n');

    return `
        <div style="margin-top:32px;padding:32px;border:1px solid #27272a;border-radius:32px;background:#09090b;">
          <h2 style="font-size:16px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#ffffff;margin:0 0 6px 0;">
            UTC to ${esc(cityName)} Conversion Table
          </h2>
          <p style="font-size:13px;color:#71717a;margin:0 0 20px 0;">24-hour UTC offset reference for ${esc(cityName)}.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px 16px;color:#71717a;font-weight:600;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;border-bottom:1px solid #27272a;">UTC Time</th>
                <th style="text-align:left;padding:8px 16px;color:#71717a;font-weight:600;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;border-bottom:1px solid #27272a;">${esc(cityName)} Time</th>
              </tr>
            </thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>`;
  } catch {
    return '';
  }
};

const buildCityClockBody = (citySlug: string, cityName: string, iana: string): string => {
  const description = buildCityClockDescription(cityName, iana);
  const offsetStr = getUtcOffsetString(iana);
  const longName = getCurrentTimeZoneName(iana, 'Local Time');
  const conversionTable = build24HourOffsetTable(cityName, iana);

  return `
    <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
      <div style="max-width:1100px;margin:0 auto;">
        <h1 style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;color:#fff;margin:0;padding:0;">
          Current Time in ${esc(cityName)}
        </h1>
        <p style="margin-top:16px;font-size:18px;color:#a1a1aa;">
          ${esc(longName)} &bull; ${esc(offsetStr)}
        </p>
        <p style="margin-top:12px;font-size:16px;line-height:1.7;color:#a1a1aa;max-width:900px;">
          ${esc(description)}
        </p>
        <div style="margin-top:32px;">
          <a href="/time-in-${esc(citySlug)}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">
            Live ${esc(cityName)} Clock
          </a>
        </div>
${buildRelatedSection(getTopRoutesFromCity(citySlug), `${cityName} Time Conversions`)}
${conversionTable}
        <div style="margin-top:32px;padding:24px 0;border-top:1px solid #27272a;">
          <a href="/world-clock" style="color:#a1a1aa;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-right:24px;">&#8592; World Clock</a>
          <a href="/" style="color:#a1a1aa;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Time Zone Converter</a>
        </div>
      </div>
    </div>`;
};

const WORLD_CLOCK_CITIES: { name: string; slug: string; tz: string }[] = [
  { name: 'New York',    slug: 'new-york',     tz: 'America/New_York' },
  { name: 'Los Angeles', slug: 'los-angeles',  tz: 'America/Los_Angeles' },
  { name: 'Chicago',     slug: 'chicago',      tz: 'America/Chicago' },
  { name: 'Toronto',     slug: 'toronto',      tz: 'America/Toronto' },
  { name: 'Vancouver',   slug: 'vancouver',    tz: 'America/Vancouver' },
  { name: 'São Paulo',   slug: 'sao-paulo',    tz: 'America/Sao_Paulo' },
  { name: 'Mexico City', slug: 'mexico-city',  tz: 'America/Mexico_City' },
  { name: 'London',      slug: 'london',       tz: 'Europe/London' },
  { name: 'Paris',       slug: 'paris',        tz: 'Europe/Paris' },
  { name: 'Berlin',      slug: 'berlin',       tz: 'Europe/Berlin' },
  { name: 'Amsterdam',   slug: 'amsterdam',    tz: 'Europe/Amsterdam' },
  { name: 'Dubai',       slug: 'dubai',        tz: 'Asia/Dubai' },
  { name: 'Cairo',       slug: 'cairo',        tz: 'Africa/Cairo' },
  { name: 'Lagos',       slug: 'lagos',        tz: 'Africa/Lagos' },
  { name: 'Nairobi',     slug: 'nairobi',      tz: 'Africa/Nairobi' },
  { name: 'Moscow',      slug: 'moscow',       tz: 'Europe/Moscow' },
  { name: 'Mumbai',      slug: 'mumbai',       tz: 'Asia/Kolkata' },
  { name: 'Delhi',       slug: 'delhi',        tz: 'Asia/Kolkata' },
  { name: 'Singapore',   slug: 'singapore',    tz: 'Asia/Singapore' },
  { name: 'Tokyo',       slug: 'tokyo',        tz: 'Asia/Tokyo' },
  { name: 'Hong Kong',   slug: 'hong-kong',    tz: 'Asia/Hong_Kong' },
  { name: 'Bangkok',     slug: 'bangkok',      tz: 'Asia/Bangkok' },
  { name: 'Seoul',       slug: 'seoul',        tz: 'Asia/Seoul' },
  { name: 'Karachi',     slug: 'karachi',      tz: 'Asia/Karachi' },
  { name: 'Sydney',      slug: 'sydney',       tz: 'Australia/Sydney' },
  { name: 'Melbourne',   slug: 'melbourne',    tz: 'Australia/Melbourne' },
  { name: 'Auckland',    slug: 'auckland',     tz: 'Pacific/Auckland' },
  { name: 'Honolulu',    slug: 'honolulu',     tz: 'Pacific/Honolulu' },
];

const getUtcOffsetString = (iana: string): string => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'longOffset',
    }).formatToParts(new Date());
    const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
    return offsetStr.replace('GMT', 'UTC');
  } catch {
    return 'UTC+0';
  }
};

const buildWorldClockBody = (): string => {
  const rows = WORLD_CLOCK_CITIES.map(city => {
    const offsetStr = getUtcOffsetString(city.tz);
    return `          <tr>
            <td style="padding:10px 16px;color:#ffffff;border-bottom:1px solid #18181b;font-weight:600;">
              <a href="/time-in-${esc(city.slug)}" style="color:#ffffff;text-decoration:none;">${esc(city.name)}</a>
            </td>
            <td style="padding:10px 16px;color:#a1a1aa;border-bottom:1px solid #18181b;">${esc(offsetStr)}</td>
          </tr>`;
  }).join('\n');

  return `
    <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
      <div style="max-width:1100px;margin:0 auto;">
        <h1 style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;color:#fff;margin:0;padding:0;">
          World Clock &mdash; Current Time Worldwide
        </h1>
        <p style="margin-top:24px;font-size:20px;line-height:1.6;color:#a1a1aa;max-width:900px;">
          Live current times for major cities around the world. Click any city for a full clock, UTC offset, and DST status.
        </p>
        <div style="margin-top:40px;padding:32px;border:1px solid #27272a;border-radius:32px;background:#09090b;">
          <h2 style="font-size:16px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#ffffff;margin:0 0 20px 0;">
            World Clock — UTC Offsets
          </h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px 16px;color:#71717a;font-weight:600;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;border-bottom:1px solid #27272a;">City</th>
                <th style="text-align:left;padding:8px 16px;color:#71717a;font-weight:600;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;border-bottom:1px solid #27272a;">UTC Offset</th>
              </tr>
            </thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
};

const buildGlobeBody = (): string => {
  const regions = [
    {
      name: 'Americas',
      tz: 'UTC−12 to UTC−3',
      countries: [
        { name: 'United States', offset: 'UTC−5 / UTC−8', tz: 'ET / PT' },
        { name: 'Canada',        offset: 'UTC−3.5 to UTC−8', tz: 'ET / PT' },
        { name: 'Brazil',        offset: 'UTC−3',  tz: 'BRT' },
        { name: 'Mexico',        offset: 'UTC−6',  tz: 'CST' },
        { name: 'Argentina',     offset: 'UTC−3',  tz: 'ART' },
        { name: 'Colombia',      offset: 'UTC−5',  tz: 'COT' },
        { name: 'Chile',         offset: 'UTC−4',  tz: 'CLT' },
        { name: 'Peru',          offset: 'UTC−5',  tz: 'PET' },
      ],
    },
    {
      name: 'Europe',
      tz: 'UTC to UTC+3',
      countries: [
        { name: 'United Kingdom', offset: 'UTC+0', tz: 'GMT' },
        { name: 'Germany',        offset: 'UTC+1', tz: 'CET' },
        { name: 'France',         offset: 'UTC+1', tz: 'CET' },
        { name: 'Italy',          offset: 'UTC+1', tz: 'CET' },
        { name: 'Spain',          offset: 'UTC+1', tz: 'CET' },
        { name: 'Netherlands',    offset: 'UTC+1', tz: 'CET' },
        { name: 'Sweden',         offset: 'UTC+1', tz: 'CET' },
        { name: 'Switzerland',    offset: 'UTC+1', tz: 'CET' },
      ],
    },
    {
      name: 'Middle East & Africa',
      tz: 'UTC+2 to UTC+4',
      countries: [
        { name: 'United Arab Emirates', offset: 'UTC+4', tz: 'GST' },
        { name: 'Saudi Arabia',         offset: 'UTC+3', tz: 'AST' },
        { name: 'Israel',               offset: 'UTC+2', tz: 'IST' },
        { name: 'Turkey',               offset: 'UTC+3', tz: 'TRT' },
        { name: 'Egypt',                offset: 'UTC+2', tz: 'EET' },
        { name: 'South Africa',         offset: 'UTC+2', tz: 'SAST' },
        { name: 'Nigeria',              offset: 'UTC+1', tz: 'WAT' },
        { name: 'Kenya',                offset: 'UTC+3', tz: 'EAT' },
      ],
    },
    {
      name: 'Asia',
      tz: 'UTC+5 to UTC+9',
      countries: [
        { name: 'India',       offset: 'UTC+5:30', tz: 'IST' },
        { name: 'Pakistan',    offset: 'UTC+5',    tz: 'PKT' },
        { name: 'China',       offset: 'UTC+8',    tz: 'CST' },
        { name: 'Japan',       offset: 'UTC+9',    tz: 'JST' },
        { name: 'South Korea', offset: 'UTC+9',    tz: 'KST' },
        { name: 'Singapore',   offset: 'UTC+8',    tz: 'SGT' },
        { name: 'Thailand',    offset: 'UTC+7',    tz: 'ICT' },
        { name: 'Indonesia',   offset: 'UTC+7',    tz: 'WIB' },
      ],
    },
    {
      name: 'Oceania & Pacific',
      tz: 'UTC+8 to UTC+13',
      countries: [
        { name: 'Australia',   offset: 'UTC+10',   tz: 'AEST' },
        { name: 'New Zealand', offset: 'UTC+12',   tz: 'NZST' },
        { name: 'Hong Kong',   offset: 'UTC+8',    tz: 'HKT' },
        { name: 'Malaysia',    offset: 'UTC+8',    tz: 'MYT' },
        { name: 'Philippines', offset: 'UTC+8',    tz: 'PHT' },
        { name: 'Vietnam',     offset: 'UTC+7',    tz: 'ICT' },
        { name: 'Taiwan',      offset: 'UTC+8',    tz: 'CST' },
        { name: 'Bangladesh',  offset: 'UTC+6',    tz: 'BST' },
      ],
    },
  ];

  const regionCards = regions.map(r => `
        <div style="padding:24px;border:1px solid #27272a;border-radius:24px;background:#09090b;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
            <h3 style="font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#3b82f6;margin:0;">${esc(r.name)}</h3>
            <span style="font-size:11px;font-weight:700;color:#52525b;">${esc(r.tz)}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            ${r.countries.map(c => `
            <tr>
              <td style="padding:5px 0;color:#a1a1aa;font-weight:600;">${esc(c.name)}</td>
              <td style="padding:5px 0;color:#52525b;text-align:right;">${esc(c.tz)}</td>
              <td style="padding:5px 0;color:#3b82f6;text-align:right;padding-left:12px;">${esc(c.offset)}</td>
            </tr>`).join('')}
          </table>
        </div>`).join('\n');

  const faqItems = [
    {
      q: 'What is a world time zone map?',
      a: 'A world time zone map shows the 24 standard time zones used across the globe, each offset from UTC (Coordinated Universal Time) by a whole or half hour. Our interactive 3D globe lets you explore every country\'s current local time visually.',
    },
    {
      q: 'How many time zones are there in the world?',
      a: 'There are 38 recognised time zones worldwide, ranging from UTC−12 (Baker Island) to UTC+14 (Line Islands, Kiribati). Some countries like India (UTC+5:30) and Nepal (UTC+5:45) use non-standard half and quarter-hour offsets.',
    },
    {
      q: 'Which country has the most time zones?',
      a: 'France has the most time zones of any country — 12 — due to its overseas territories. Russia spans 11 time zones across its landmass. The United States covers 6 primary time zones.',
    },
    {
      q: 'What is UTC offset?',
      a: 'A UTC offset is the difference in hours and minutes between a location\'s local time and Coordinated Universal Time (UTC). For example, India is UTC+5:30, meaning it is 5 hours and 30 minutes ahead of UTC.',
    },
    {
      q: 'How do I find the current time in any country?',
      a: 'On this globe, hover over any country to instantly see its current local time, IANA timezone name, and UTC offset. You can also use the search bar to fly to a specific country.',
    },
  ];

  const faqHtml = faqItems.map(f => `
        <div style="padding:20px 0;border-bottom:1px solid #18181b;">
          <h3 style="font-size:15px;font-weight:800;color:#fff;margin:0 0 8px 0;">${esc(f.q)}</h3>
          <p style="font-size:14px;line-height:1.7;color:#a1a1aa;margin:0;">${esc(f.a)}</p>
        </div>`).join('');

  return `
    <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
      <div style="max-width:1100px;margin:0 auto;">

        <h1 style="font-size:64px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;color:#fff;margin:0;padding:0;">
          World Time Zone Map
        </h1>
        <p style="margin-top:8px;font-size:22px;font-weight:700;color:#3b82f6;letter-spacing:-0.01em;">
          Interactive 3D Globe with Live Country Clocks
        </p>
        <p style="margin-top:20px;font-size:18px;line-height:1.7;color:#a1a1aa;max-width:860px;">
          The free WorldTimeSuite globe shows the <strong style="color:#fff;">current local time and UTC offset for every country</strong> on an
          interactive 3D Earth. Drag to rotate, scroll to zoom, hover any country for its live timezone clock,
          or use the search bar to fly instantly to any nation. No sign-up, no install — works in any browser.
        </p>

        <div style="margin-top:28px;display:flex;flex-wrap:wrap;gap:10px;">
          ${['Live local time by country', 'UTC offset for all 195 countries', 'Interactive world time zone map', 'Country timezone search', '38 world time zones', 'Free — no sign-up'].map(f =>
            `<span style="padding:8px 16px;border:1px solid #27272a;border-radius:999px;background:#09090b;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#a1a1aa;">${esc(f)}</span>`
          ).join('\n          ')}
        </div>

        <div style="margin-top:56px;">
          <h2 style="font-size:32px;font-weight:900;letter-spacing:-0.02em;color:#fff;margin:0 0 8px 0;">
            Time Zones by Region
          </h2>
          <p style="font-size:15px;color:#71717a;margin:0 0 28px 0;">
            Live UTC offsets and timezone codes for every major country — hover the globe to see current local time.
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">
            ${regionCards}
          </div>
        </div>

        <div style="margin-top:56px;padding:32px;border:1px solid #27272a;border-radius:32px;background:#09090b;">
          <h2 style="font-size:20px;font-weight:800;letter-spacing:0.02em;text-transform:uppercase;color:#fff;margin:0 0 16px 0;">
            How to Use the World Time Zone Globe
          </h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;">
            ${[
              ['Hover a country', 'See its live local time, IANA timezone name, and UTC offset instantly.'],
              ['Drag to rotate', 'Spin the globe freely to navigate to any region on Earth.'],
              ['Scroll to zoom', 'Zoom in on any country or continent for a closer view.'],
              ['Search bar', 'Type a country name to fly the camera directly to it on the globe.'],
            ].map(([title, desc]) => `
            <div style="padding:16px;border:1px solid #18181b;border-radius:16px;background:#000;">
              <div style="font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#3b82f6;margin-bottom:8px;">${esc(title)}</div>
              <div style="font-size:13px;line-height:1.6;color:#71717a;">${esc(desc)}</div>
            </div>`).join('')}
          </div>
        </div>

        <div style="margin-top:56px;">
          <h2 style="font-size:32px;font-weight:900;letter-spacing:-0.02em;color:#fff;margin:0 0 4px 0;">
            Frequently Asked Questions
          </h2>
          <p style="font-size:15px;color:#71717a;margin:0 0 8px 0;">World time zones, UTC offsets, and the globe explained.</p>
          <div style="border:1px solid #27272a;border-radius:24px;padding:0 24px;background:#09090b;">
            ${faqHtml}
          </div>
        </div>

        <div style="margin-top:32px;padding:24px 0;border-top:1px solid #27272a;display:flex;flex-wrap:wrap;gap:16px;">
          <a href="/world-clock" style="color:#a1a1aa;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">World Clock</a>
          <a href="/" style="color:#a1a1aa;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Time Zone Converter</a>
        </div>

      </div>
    </div>`;
};

const buildHtml = (template: string, route: string): string => {
  // City clock route: /time-in-[slug]
  const cityClockMatch = route.match(/^\/time-in-([a-z0-9-]+)$/i);
  if (cityClockMatch) {
    const citySlug = cityClockMatch[1].toLowerCase();
    const cityEntry = cities.find(c => c.slug === citySlug);
    const cityName = cityEntry ? cityEntry.name : titleCase(citySlug);
    const iana = cityEntry ? cityEntry.tz : (CITY_CLOCK_SEO_IANA_MAP[citySlug] || '');

    const title = `Current Time in ${cityName} — World Clock & UTC Offset | WorldTimeSuite`;
    const description = iana ? buildCityClockDescription(cityName, iana) : `See the current local time in ${cityName}. Live clock with UTC offset and DST status.`;
    const canonicalPath = `/time-in-${citySlug}`;
    const canonicalUrl = `${ORIGIN}${canonicalPath}`;
    const body = iana ? buildCityClockBody(citySlug, cityName, iana) : buildBody(route, null);

    let html = template;
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`);
    html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
    html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`);
    html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalUrl}">`);
    html = html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(description)}">`);
    html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonicalUrl}">`);
    html = html.replace('<!--app-html-->', body);
    return html;
  }

  // World clock route
  if (route === '/world-clock') {
    const seo = staticSeo['/world-clock']!;
    const canonicalUrl = `${ORIGIN}/world-clock`;
    const body = buildWorldClockBody();

    let html = template;
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(seo.title)}</title>`);
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(seo.description)}">`);
    html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(seo.title)}">`);
    html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(seo.description)}">`);
    html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalUrl}">`);
    html = html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(seo.title)}">`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(seo.description)}">`);
    html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonicalUrl}">`);
    html = html.replace('<!--app-html-->', body);
    return html;
  }

  // Globe route
  if (route === '/globe') {
    const seo = staticSeo['/globe']!;
    const canonicalUrl = `${ORIGIN}/globe`;
    const body = buildGlobeBody();

    let html = template;
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(seo.title)}</title>`);
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(seo.description)}">`);
    html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(seo.title)}">`);
    html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(seo.description)}">`);
    html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalUrl}">`);
    html = html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(seo.title)}">`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(seo.description)}">`);
    html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonicalUrl}">`);
    html = html.replace('<!--app-html-->', body);
    return html;
  }

  const parsed = parseConversionRoute(route);

  let title: string;
  let description: string;
  let canonicalPath: string;

  if (parsed) {
    const isTimezoneRoute = Boolean(TIMEZONE_DATA_BY_SLUG[parsed.fromSlug] && TIMEZONE_DATA_BY_SLUG[parsed.toSlug]);
    title = isTimezoneRoute
      ? `${parsed.fromName} to ${parsed.toName} Converter | Time Difference & Current Time`
      : `${parsed.fromName} to ${parsed.toName} Time Converter | Current Time & Difference`;
    description = buildConversionDescription(parsed);
    canonicalPath = `/${parsed.fromSlug}-to-${parsed.toSlug}`;
  } else {
    const seo = staticSeo[route] ?? staticSeo['/'];
    title = seo.title;
    description = seo.description;
    canonicalPath = route;
  }

  // Homepage canonical must be https://worldtimesuite.com — no trailing slash
  const canonicalUrl = canonicalPath === '/' ? ORIGIN : `${ORIGIN}${canonicalPath}`;
  const body = buildBody(route, parsed, parsed ? description : undefined);
  const noscriptTable = buildNoscriptTableForRoute(parsed);

  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalUrl}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(description)}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonicalUrl}">`);
  html = html.replace('<!--app-html-->', `${body}\n${noscriptTable}`);

  // Inject JSON-LD for blog post pages into the static HTML so Google sees it on first crawl
  if (route.startsWith('/blog/')) {
    const slug = route.slice(6);
    const post = BLOG_POST_BY_SLUG[slug];
    if (post) {
      const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.metaDescription,
        author: { '@type': 'Organization', name: 'WorldTimeSuite' },
        publisher: { '@type': 'Organization', name: 'WorldTimeSuite', url: 'https://worldtimesuite.com' },
        datePublished: post.dateIso,
        dateModified: post.dateIso,
        url: `https://worldtimesuite.com/blog/${post.slug}`,
        keywords: post.tags.join(', '),
      });
      html = html.replace('</head>', `<script type="application/ld+json">${jsonLd}</script>\n</head>`);
    }
  }

  // Inject FAQPage JSON-LD for city pair and timezone pair pages.
  // Computed entirely at prerender time — no runtime cost, zero impact on page speed.
  if (parsed) {
    const fromTimezone = TIMEZONE_DATA_BY_SLUG[parsed.fromSlug];
    const toTimezone   = TIMEZONE_DATA_BY_SLUG[parsed.toSlug];

    const fromIana = fromTimezone ? fromTimezone.iana : CITY_IANA_MAP[parsed.fromSlug];
    const toIana   = toTimezone   ? toTimezone.iana   : CITY_IANA_MAP[parsed.toSlug];

    if (fromIana && toIana) {
      const fromLabel = fromTimezone ? fromTimezone.code : parsed.fromName;
      const toLabel   = toTimezone   ? toTimezone.code   : parsed.toName;
      const faqJsonLd = buildConversionFaqJsonLd(fromIana, toIana, fromLabel, toLabel);
      html = html.replace('</head>', `<script type="application/ld+json">${faqJsonLd}</script>\n</head>`);
    }
  }

  return html;
};

// Write helper

const writeRoute = (route: string, html: string): void => {
  const filePath =
    route === '/'
      ? path.join(DIST_DIR, 'index.html')
      : path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`  ${route}`);
};

// Main

const main = (): void => {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`dist/index.html not found. Run: npm run build:client first.`);
  }

  const rawTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  if (!rawTemplate.includes('<!--app-html-->')) {
    console.error('\nERROR: dist/index.html is missing the <!--app-html--> placeholder.');
    console.error('This means a previous prerender already overwrote it.');
    console.error('Fix: delete dist, run npm run build, then try again.\n');
    process.exit(1);
  }

  const backupPath = path.join(DIST_DIR, '_template.html');
  fs.writeFileSync(backupPath, rawTemplate, 'utf8');
  console.log(`\nTemplate backed up to dist/_template.html`);

  // Inject a <link rel="preload" as="style"> for the Vite CSS bundle early in <head>
  // so the browser starts fetching it while parsing the top of the HTML, rather than
  // waiting until it encounters <link rel="stylesheet"> at the bottom of <body>.
  const cssHrefMatch = rawTemplate.match(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/);
  const template = cssHrefMatch
    ? rawTemplate.replace(
        '<meta charset="UTF-8">',
        `<meta charset="UTF-8">\n  <link rel="preload" as="style" crossorigin href="${cssHrefMatch[1]}">`
      )
    : rawTemplate;
  if (cssHrefMatch) {
    console.log(`CSS preload hint injected: ${cssHrefMatch[1]}`);
  }

  const allRoutes = [...new Set([...STATIC_ROUTES, ...BLOG_POST_ROUTES, ...TIMEZONE_ROUTES, ...CITY_ROUTES, ...GENERATED_CITY_ROUTES, ...CITY_CLOCK_ROUTES])];

  const sample = parseConversionRoute('/delhi-to-london');
  console.log(`Sanity check: parseConversionRoute('/delhi-to-london') =`, JSON.stringify(sample));

  const timezoneSample = parseConversionRoute('/ist-to-gmt');
  console.log(`Sanity check: parseConversionRoute('/ist-to-gmt') =`, JSON.stringify(timezoneSample));

  console.log();
  console.log(`Prerendering ${allRoutes.length} routes...\n`);

  for (const route of allRoutes) {
    const html = buildHtml(template, route);
    writeRoute(route, html);
  }

  console.log(`\nDone.`);
  console.log(`Static:          ${STATIC_ROUTES.length}`);
  console.log(`Timezone:        ${TIMEZONE_ROUTES.length}`);
  console.log(`City (manual):   ${CITY_ROUTES.length}`);
  console.log(`City (top-30×30):${GENERATED_CITY_ROUTES.length} → unique after dedup`);
  console.log(`Blog posts:      ${BLOG_POST_ROUTES.length}`);
  console.log(`City clock:      ${CITY_CLOCK_ROUTES.length}`);
  console.log(`Total unique:    ${allRoutes.length}`);
};

main();