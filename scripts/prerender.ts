import fs from 'fs';
import path from 'path';
import { cities } from '../data/cities';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
const ORIGIN = 'https://worldtimesuite.com';

// Routes

// Routes

const STATIC_ROUTES = ['/', '/timer', '/stopwatch', '/calendar', '/about', '/terms', '/privacy', '/world-clock'];

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

  // GSC-prioritized city routes - added
  '/london-to-san-francisco',
  '/lisbon-to-rio-de-janeiro',
  '/los-angeles-to-sydney',
  '/adelaide-to-los-angeles',
  '/washington-dc-to-dubai',
  '/delhi-to-hong-kong',
  '/washington-dc-to-nairobi',
  '/rome-to-bangalore',
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
  '/chicago-to-houston',
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
  '/hyderabad-to-mumbai',
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
  '/kolkata-to-mumbai',
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

// Static page SEO

const staticSeo: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Time Zone Converter - Convert Time Between Any Two Cities',
    description: 'Free time zone converter for 500+ cities worldwide. Instantly see the time difference between any two cities, find meeting-friendly hours, and plan across time zones.',
  },
  '/stopwatch': {
    title: 'Online Stopwatch with Lap Timer - Free & Instant | WorldTimeSuite',
    description: 'Free online stopwatch with lap tracking. Start, stop and record laps instantly - no download needed. Works on desktop and mobile.',
  },
  '/timer': {
    title: 'Online Countdown Timer - Free, Fast & No Sign-up | WorldTimeSuite',
    description: 'Set a free online countdown timer in seconds. Simple, distraction-free timer that works instantly on any device - no app or account needed.',
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
    title: 'World Clock — Current Time in Every Major City | WorldTimeSuite',
    description: 'See the current local time in cities worldwide — New York, London, Dubai, Tokyo, Sydney and more. Free live world clock, always accurate.',
  },
};

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
        ctaHref: '/london-to-new-york',
        ctaLabel: 'Explore Popular Route',
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
        <div style="margin-top:32px;padding:24px 0;border-top:1px solid #27272a;display:flex;flex-wrap:wrap;gap:16px;">
          <a href="/time-in-${esc(parsed.fromSlug)}" style="color:#a1a1aa;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Current time in ${esc(fromName)}</a>
          <a href="/time-in-${esc(parsed.toSlug)}" style="color:#a1a1aa;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Current time in ${esc(toName)}</a>
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

const buildCityClockDescription = (cityName: string, iana: string): string => {
  const offsetHours = getOffsetHours(iana);
  const longName = getCurrentTimeZoneName(iana, 'Local Time');
  const now = new Date();
  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: iana,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now);

  const janOffset = getOffsetHours(iana, new Date(now.getFullYear(), 0, 1));
  const julOffset = getOffsetHours(iana, new Date(now.getFullYear(), 6, 1));
  const hasDst = janOffset !== julOffset;
  const dstOffset = Math.max(janOffset, julOffset);
  const isInDst = hasDst && offsetHours === dstOffset;

  const abs = Math.abs(offsetHours);
  const sign = offsetHours >= 0 ? '+' : '-';
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  const offsetStr = `UTC${sign}${h}${m > 0 ? ':' + String(m).padStart(2, '0') : ''}`;

  const dstSentence = isInDst
    ? `${cityName} is currently observing daylight saving time.`
    : hasDst
      ? `${cityName} does not currently observe daylight saving time.`
      : '';

  return `${cityName} current time is ${timeStr}. ${cityName} uses ${longName} at ${offsetStr}. ${dstSentence}`.trim();
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
          &nbsp;
          <a href="/${esc(citySlug)}-to-new-york" style="display:inline-block;padding:14px 22px;border-radius:999px;border:1px solid #27272a;color:#fff;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">
            ${esc(cityName)} to New York
          </a>
        </div>
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

  const canonicalUrl = `${ORIGIN}${canonicalPath}`;
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

  const allRoutes = [...new Set([...STATIC_ROUTES, ...TIMEZONE_ROUTES, ...CITY_ROUTES, ...GENERATED_CITY_ROUTES, ...CITY_CLOCK_ROUTES])];

  const sample = parseConversionRoute('/delhi-to-london');
  console.log(`Sanity check: parseConversionRoute('/delhi-to-london') =`, JSON.stringify(sample));

  const timezoneSample = parseConversionRoute('/ist-to-gmt');
  console.log(`Sanity check: parseConversionRoute('/ist-to-gmt') =`, JSON.stringify(timezoneSample));

  console.log();
  console.log(`Prerendering ${allRoutes.length} routes...\n`);

  for (const route of allRoutes) {
    const html = buildHtml(rawTemplate, route);
    writeRoute(route, html);
  }

  console.log(`\nDone.`);
  console.log(`Static:          ${STATIC_ROUTES.length}`);
  console.log(`Timezone:        ${TIMEZONE_ROUTES.length}`);
  console.log(`City (manual):   ${CITY_ROUTES.length}`);
  console.log(`City (top-30×30):${GENERATED_CITY_ROUTES.length} → unique after dedup`);
  console.log(`City clock:      ${CITY_CLOCK_ROUTES.length}`);
  console.log(`Total unique:    ${allRoutes.length}`);
};

main();