import React, { useState, useCallback, useEffect, useMemo } from 'react';
import * as ct from 'countries-and-timezones';
import { Timezone } from '../types';
import { buildCityPairContent } from '../lib/cityPairContent';

interface TimezoneConverterProps {
  isDark: boolean;
  fromSlug?: string;
  toSlug?: string;
  isTimezoneCodeRoute?: boolean;
}

interface ConversionHistoryItem {
  id: string;
  query: string;
  sourceName: string;
  sourceIana: string;
  sourceTime: string;
  targetName: string;
  targetIana: string;
  targetTime: string;
  createdAt: number;
}

interface RelatedRouteItem {
  href: string;
  label: string;
  score: number;
}

// ─── Zone maps ────────────────────────────────────────────────────────────────

const EXTENDED_ZONE_MAP: Record<string, string> = {
  IST: 'Asia/Kolkata',
  INDIA: 'Asia/Kolkata',
  BOMBAY: 'Asia/Kolkata',
  DELHI: 'Asia/Kolkata',
  KOLKATA: 'Asia/Kolkata',
  EST: 'America/New_York',
  EDT: 'America/New_York',
  'NEW YORK': 'America/New_York',
  NY: 'America/New_York',
  NYC: 'America/New_York',
  PST: 'America/Los_Angeles',
  PDT: 'America/Los_Angeles',
  LA: 'America/Los_Angeles',
  CALIFORNIA: 'America/Los_Angeles',
  SF: 'America/Los_Angeles',
  'SAN FRANCISCO': 'America/Los_Angeles',
  CST: 'America/Chicago',
  CDT: 'America/Chicago',
  CHICAGO: 'America/Chicago',
  MST: 'America/Denver',
  MDT: 'America/Denver',
  DENVER: 'America/Denver',
  GMT: 'Europe/London',
  BST: 'Europe/London',
  LONDON: 'Europe/London',
  UK: 'Europe/London',
  ENGLAND: 'Europe/London',
  CET: 'Europe/Berlin',
  CEST: 'Europe/Berlin',
  BERLIN: 'Europe/Berlin',
  GERMANY: 'Europe/Berlin',
  PARIS: 'Europe/Paris',
  FRANCE: 'Europe/Paris',
  JST: 'Asia/Tokyo',
  TOKYO: 'Asia/Tokyo',
  JAPAN: 'Asia/Tokyo',
  AEST: 'Australia/Sydney',
  AEDT: 'Australia/Sydney',
  SYDNEY: 'Australia/Sydney',
  MELBOURNE: 'Australia/Melbourne',
  SGT: 'Asia/Singapore',
  SINGAPORE: 'Asia/Singapore',
  GST: 'Asia/Dubai',
  PHT: 'Asia/Manila',
  MANILA: 'Asia/Manila',
  PHILIPPINES: 'Asia/Manila',
  EET: 'Europe/Helsinki',
  HELSINKI: 'Europe/Helsinki',
  KST: 'Asia/Seoul',
  KOREA: 'Asia/Seoul',
  NZDT: 'Pacific/Auckland',
  NZST: 'Pacific/Auckland',
  AUCKLAND: 'Pacific/Auckland',
  AST: 'America/Halifax',
  HALIFAX: 'America/Halifax',
  DUBAI: 'Asia/Dubai',
  UAE: 'Asia/Dubai',
  RUSSIA: 'Europe/Moscow',
  MOSCOW: 'Europe/Moscow',
  MSK: 'Europe/Moscow',
  TORONTO: 'America/Toronto',
  CANADA: 'America/Toronto',
  ONTARIO: 'America/Toronto',
  HKT: 'Asia/Hong_Kong',
  'HONG KONG': 'Asia/Hong_Kong',
  WET: 'Europe/Lisbon',
  PORTUGAL: 'Europe/Lisbon',
  LISBON: 'Europe/Lisbon',
  BRT: 'America/Sao_Paulo',
  BRAZIL: 'America/Sao_Paulo',
  'SAO PAULO': 'America/Sao_Paulo',
};

const TIMEZONE_CODES = new Set([
  'IST', 'EST', 'EDT', 'PST', 'PDT', 'CST', 'CDT', 'MST', 'MDT',
  'GMT', 'BST', 'CET', 'CEST', 'JST', 'AEST', 'AEDT', 'SGT',
  'GST', 'MSK', 'HKT', 'WET', 'BRT', 'NY', 'NYC', 'LA', 'SF', 'UK',
  'PHT', 'EET', 'KST', 'NZDT', 'NZST', 'AST',
]);

const IANA_TO_CODE: Record<string, string> = {
  'America/New_York':    'EST',
  'America/Los_Angeles': 'PST',
  'America/Chicago':     'CST',
  'America/Denver':      'MST',
  'Europe/London':       'GMT',
  'Asia/Kolkata':        'IST',
  'Asia/Tokyo':          'JST',
  'Europe/Berlin':       'CET',
  'Asia/Singapore':      'SGT',
  'Australia/Sydney':    'AEST',
  'Asia/Dubai':          'GST',
  'Asia/Manila':         'PHT',
  'Europe/Helsinki':     'EET',
  'Asia/Seoul':          'KST',
  'Pacific/Auckland':    'NZDT',
  'America/Halifax':     'AST',
  'America/Sao_Paulo':   'BRT',
  'Europe/Lisbon':       'WET',
  'Asia/Hong_Kong':      'HKT',
  'Europe/Moscow':       'MSK',
};

const normalizeKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// ─── Alias entries for partial city matching ──────────────────────────────────
// Enables "Del"→Delhi, "Lon"→London, "Mum"→Mumbai, "Syd"→Sydney etc.

type QueryAliasEntry = {
  key: string;
  label: string;
  iana: string;
  isTimezoneCode?: boolean;
};

const QUERY_ALIAS_ENTRIES: QueryAliasEntry[] = [
  { key: 'IST',           label: 'IST',           iana: 'Asia/Kolkata',        isTimezoneCode: true },
  { key: 'INDIA',         label: 'India',          iana: 'Asia/Kolkata' },
  { key: 'BOMBAY',        label: 'Mumbai',         iana: 'Asia/Kolkata' },
  { key: 'MUMBAI',        label: 'Mumbai',         iana: 'Asia/Kolkata' },
  { key: 'DELHI',         label: 'Delhi',          iana: 'Asia/Kolkata' },
  { key: 'KOLKATA',       label: 'Kolkata',        iana: 'Asia/Kolkata' },
  { key: 'BANGALORE',     label: 'Bangalore',      iana: 'Asia/Kolkata' },
  { key: 'HYDERABAD',     label: 'Hyderabad',      iana: 'Asia/Kolkata' },
  { key: 'CHENNAI',       label: 'Chennai',        iana: 'Asia/Kolkata' },
  { key: 'EST',           label: 'EST',            iana: 'America/New_York',    isTimezoneCode: true },
  { key: 'EDT',           label: 'EDT',            iana: 'America/New_York',    isTimezoneCode: true },
  { key: 'NEW YORK',      label: 'New York',       iana: 'America/New_York' },
  { key: 'NY',            label: 'New York',       iana: 'America/New_York' },
  { key: 'NYC',           label: 'New York',       iana: 'America/New_York' },
  { key: 'PST',           label: 'PST',            iana: 'America/Los_Angeles', isTimezoneCode: true },
  { key: 'PDT',           label: 'PDT',            iana: 'America/Los_Angeles', isTimezoneCode: true },
  { key: 'LA',            label: 'Los Angeles',    iana: 'America/Los_Angeles' },
  { key: 'LOS ANGELES',   label: 'Los Angeles',    iana: 'America/Los_Angeles' },
  { key: 'CALIFORNIA',    label: 'California',     iana: 'America/Los_Angeles' },
  { key: 'SF',            label: 'San Francisco',  iana: 'America/Los_Angeles' },
  { key: 'SAN FRANCISCO', label: 'San Francisco',  iana: 'America/Los_Angeles' },
  { key: 'CST',           label: 'CST',            iana: 'America/Chicago',     isTimezoneCode: true },
  { key: 'CDT',           label: 'CDT',            iana: 'America/Chicago',     isTimezoneCode: true },
  { key: 'CHICAGO',       label: 'Chicago',        iana: 'America/Chicago' },
  { key: 'MST',           label: 'MST',            iana: 'America/Denver',      isTimezoneCode: true },
  { key: 'MDT',           label: 'MDT',            iana: 'America/Denver',      isTimezoneCode: true },
  { key: 'DENVER',        label: 'Denver',         iana: 'America/Denver' },
  { key: 'GMT',           label: 'GMT',            iana: 'Europe/London',       isTimezoneCode: true },
  { key: 'BST',           label: 'BST',            iana: 'Europe/London',       isTimezoneCode: true },
  { key: 'LONDON',        label: 'London',         iana: 'Europe/London' },
  { key: 'UK',            label: 'United Kingdom', iana: 'Europe/London' },
  { key: 'ENGLAND',       label: 'England',        iana: 'Europe/London' },
  { key: 'CET',           label: 'CET',            iana: 'Europe/Berlin',       isTimezoneCode: true },
  { key: 'CEST',          label: 'CEST',           iana: 'Europe/Berlin',       isTimezoneCode: true },
  { key: 'BERLIN',        label: 'Berlin',         iana: 'Europe/Berlin' },
  { key: 'GERMANY',       label: 'Germany',        iana: 'Europe/Berlin' },
  { key: 'PARIS',         label: 'Paris',          iana: 'Europe/Paris' },
  { key: 'FRANCE',        label: 'France',         iana: 'Europe/Paris' },
  { key: 'JST',           label: 'JST',            iana: 'Asia/Tokyo',          isTimezoneCode: true },
  { key: 'TOKYO',         label: 'Tokyo',          iana: 'Asia/Tokyo' },
  { key: 'JAPAN',         label: 'Japan',          iana: 'Asia/Tokyo' },
  { key: 'AEST',          label: 'AEST',           iana: 'Australia/Sydney',    isTimezoneCode: true },
  { key: 'AEDT',          label: 'AEDT',           iana: 'Australia/Sydney',    isTimezoneCode: true },
  { key: 'SYDNEY',        label: 'Sydney',         iana: 'Australia/Sydney' },
  { key: 'MELBOURNE',     label: 'Melbourne',      iana: 'Australia/Melbourne' },
  { key: 'SGT',           label: 'SGT',            iana: 'Asia/Singapore',      isTimezoneCode: true },
  { key: 'SINGAPORE',     label: 'Singapore',      iana: 'Asia/Singapore' },
  { key: 'GST',           label: 'GST',            iana: 'Asia/Dubai',          isTimezoneCode: true },
  { key: 'DUBAI',         label: 'Dubai',          iana: 'Asia/Dubai' },
  { key: 'UAE',           label: 'UAE',            iana: 'Asia/Dubai' },
  { key: 'PHT',           label: 'PHT',            iana: 'Asia/Manila',         isTimezoneCode: true },
  { key: 'MANILA',        label: 'Manila',         iana: 'Asia/Manila' },
  { key: 'PHILIPPINES',   label: 'Philippines',    iana: 'Asia/Manila' },
  { key: 'EET',           label: 'EET',            iana: 'Europe/Helsinki',     isTimezoneCode: true },
  { key: 'HELSINKI',      label: 'Helsinki',       iana: 'Europe/Helsinki' },
  { key: 'KST',           label: 'KST',            iana: 'Asia/Seoul',          isTimezoneCode: true },
  { key: 'KOREA',         label: 'Korea',          iana: 'Asia/Seoul' },
  { key: 'SEOUL',         label: 'Seoul',          iana: 'Asia/Seoul' },
  { key: 'NZDT',          label: 'NZDT',           iana: 'Pacific/Auckland',    isTimezoneCode: true },
  { key: 'NZST',          label: 'NZST',           iana: 'Pacific/Auckland',    isTimezoneCode: true },
  { key: 'AUCKLAND',      label: 'Auckland',       iana: 'Pacific/Auckland' },
  { key: 'AST',           label: 'AST',            iana: 'America/Halifax',     isTimezoneCode: true },
  { key: 'HALIFAX',       label: 'Halifax',        iana: 'America/Halifax' },
  { key: 'RUSSIA',        label: 'Russia',         iana: 'Europe/Moscow' },
  { key: 'MOSCOW',        label: 'Moscow',         iana: 'Europe/Moscow' },
  { key: 'MSK',           label: 'MSK',            iana: 'Europe/Moscow',       isTimezoneCode: true },
  { key: 'TORONTO',       label: 'Toronto',        iana: 'America/Toronto' },
  { key: 'CANADA',        label: 'Canada',         iana: 'America/Toronto' },
  { key: 'ONTARIO',       label: 'Ontario',        iana: 'America/Toronto' },
  { key: 'HKT',           label: 'HKT',            iana: 'Asia/Hong_Kong',      isTimezoneCode: true },
  { key: 'HONG KONG',     label: 'Hong Kong',      iana: 'Asia/Hong_Kong' },
  { key: 'WET',           label: 'WET',            iana: 'Europe/Lisbon',       isTimezoneCode: true },
  { key: 'PORTUGAL',      label: 'Portugal',       iana: 'Europe/Lisbon' },
  { key: 'LISBON',        label: 'Lisbon',         iana: 'Europe/Lisbon' },
  { key: 'BRT',           label: 'BRT',            iana: 'America/Sao_Paulo',   isTimezoneCode: true },
  { key: 'BRAZIL',        label: 'Brazil',         iana: 'America/Sao_Paulo' },
  { key: 'SAO PAULO',     label: 'Sao Paulo',      iana: 'America/Sao_Paulo' },
];

const QUERY_ALIAS_BY_NORMALIZED_KEY = new Map(
  QUERY_ALIAS_ENTRIES.map(entry => [normalizeKey(entry.key), entry])
);

const resolveAliasEntryFromQuery = (query: string): QueryAliasEntry | null => {
  const norm = normalizeKey(query);
  if (!norm) return null;
  const exact = QUERY_ALIAS_BY_NORMALIZED_KEY.get(norm);
  if (exact) return exact;
  if (norm.length < 3) return null;
  return (
    QUERY_ALIAS_ENTRIES.find(entry => normalizeKey(entry.key).startsWith(norm)) ||
    QUERY_ALIAS_ENTRIES.find(entry => normalizeKey(entry.label).startsWith(norm)) ||
    null
  );
};

// ─── IANA zone indexes ────────────────────────────────────────────────────────

const ALL_IANA_ZONES: string[] = (() => {
  try {
    return (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf('timeZone') : [];
  } catch {
    return [];
  }
})();

const GLOBAL_ZONE_INDEX: Record<string, string> = {};
const COUNTRY_ZONE_INDEX: Record<string, string> = {};

ALL_IANA_ZONES.forEach(iana => {
  const parts = iana.split('/');
  const city = parts[parts.length - 1];
  GLOBAL_ZONE_INDEX[normalizeKey(city)] = iana;
  GLOBAL_ZONE_INDEX[normalizeKey(iana)] = iana;
});

const countries = ct.getAllCountries();
Object.values(countries).forEach((country: any) => {
  const primaryZone = country.timezones[0];
  if (primaryZone) {
    COUNTRY_ZONE_INDEX[normalizeKey(country.name)] = primaryZone;
    COUNTRY_ZONE_INDEX[normalizeKey(country.id)] = primaryZone;
  }
});

// ─── City resolver — partial matching restored ────────────────────────────────
// Lookup order:
//   1. Alias entries (handles partials: Del→Delhi, Lon→London, Syd→Sydney)
//   2. Exact EXTENDED_ZONE_MAP
//   3. Exact GLOBAL_ZONE_INDEX
//   4. Exact COUNTRY_ZONE_INDEX
//   5. Starts-with GLOBAL_ZONE_INDEX (covers all IANA cities globally)
//   6. Starts-with COUNTRY_ZONE_INDEX
//   7. Contains fallback

const resolveIanaFromQuery = (query: string): string | null => {
  const norm = normalizeKey(query);
  if (!norm || norm.length < 2) return null;

  const aliasMatch = resolveAliasEntryFromQuery(query);
  if (aliasMatch) return aliasMatch.iana;

  const upper = query.toUpperCase().trim();
  if (EXTENDED_ZONE_MAP[upper]) return EXTENDED_ZONE_MAP[upper];
  if (GLOBAL_ZONE_INDEX[norm]) return GLOBAL_ZONE_INDEX[norm];
  if (COUNTRY_ZONE_INDEX[norm]) return COUNTRY_ZONE_INDEX[norm];

  const startsWithZone = Object.keys(GLOBAL_ZONE_INDEX).find(k => k.startsWith(norm));
  if (startsWithZone) return GLOBAL_ZONE_INDEX[startsWithZone];

  const startsWithCountry = Object.keys(COUNTRY_ZONE_INDEX).find(k => k.startsWith(norm));
  if (startsWithCountry) return COUNTRY_ZONE_INDEX[startsWithCountry];

  return ALL_IANA_ZONES.find(z => normalizeKey(z).includes(norm)) || null;
};

const toZoneLabel = (iana: string) => {
  const parts = iana.split('/');
  const last = parts[parts.length - 1].replace(/_/g, ' ');
  return last.charAt(0).toUpperCase() + last.slice(1);
};

// ─── Display name — returns full city name even for partial input ─────────────
// "Del" → resolves alias → returns "Delhi" not "Del"

const getDisplayName = (query: string, iana: string): string => {
  const aliasMatch = resolveAliasEntryFromQuery(query);
  if (aliasMatch) return aliasMatch.label;

  const upperQuery = query.toUpperCase().trim();
  if (TIMEZONE_CODES.has(upperQuery)) return upperQuery;

  const cleaned = query.trim();
  if (!cleaned) return toZoneLabel(iana);

  return cleaned
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

// ─── Route helpers ────────────────────────────────────────────────────────────

const slugifyRoutePart = (value: string) =>
  value.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const humanizeSlug = (slug: string) =>
  slug.split('-').filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

type RouteEdge = { to: string; score: number };

const ROUTE_ALIAS: Record<string, string> = {
  india: 'india', delhi: 'india', mumbai: 'india', bangalore: 'india',
  hyderabad: 'india', chennai: 'india',
  usa: 'usa', 'new-york': 'usa', 'los-angeles': 'usa', chicago: 'usa',
  seattle: 'usa', dallas: 'usa', 'san-francisco': 'usa', texas: 'usa', california: 'usa',
  uk: 'uk', london: 'uk', manchester: 'uk', birmingham: 'uk',
  canada: 'canada', toronto: 'canada', vancouver: 'canada', montreal: 'canada',
  uae: 'uae', dubai: 'uae', 'abu-dhabi': 'uae',
  australia: 'australia', sydney: 'australia', melbourne: 'australia', perth: 'australia',
  singapore: 'singapore',
  japan: 'japan', tokyo: 'japan', osaka: 'japan',
  germany: 'germany', berlin: 'germany', frankfurt: 'germany', munich: 'germany',
};

const HUB_CITY_VARIANTS: Record<string, string[]> = {
  india:     ['delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai'],
  usa:       ['new-york', 'los-angeles', 'chicago', 'seattle', 'dallas', 'san-francisco'],
  uk:        ['london', 'manchester', 'birmingham'],
  canada:    ['toronto', 'vancouver', 'montreal'],
  uae:       ['dubai', 'abu-dhabi'],
  australia: ['sydney', 'melbourne', 'perth'],
  singapore: ['singapore'],
  japan:     ['tokyo', 'osaka'],
  germany:   ['berlin', 'frankfurt', 'munich'],
};

const ROUTE_GRAPH: Record<string, RouteEdge[]> = {
  india:     [{ to: 'usa', score: 100 }, { to: 'uk', score: 95 }, { to: 'uae', score: 90 }, { to: 'canada', score: 88 }, { to: 'australia', score: 82 }, { to: 'singapore', score: 70 }],
  usa:       [{ to: 'india', score: 96 }, { to: 'uk', score: 90 }, { to: 'germany', score: 78 }, { to: 'uae', score: 72 }, { to: 'japan', score: 74 }],
  uk:        [{ to: 'india', score: 91 }, { to: 'usa', score: 92 }, { to: 'uae', score: 68 }],
  canada:    [{ to: 'india', score: 86 }, { to: 'usa', score: 84 }, { to: 'uk', score: 62 }],
  uae:       [{ to: 'india', score: 89 }, { to: 'uk', score: 65 }, { to: 'usa', score: 60 }],
  australia: [{ to: 'india', score: 80 }, { to: 'singapore', score: 66 }, { to: 'uk', score: 58 }],
  singapore: [{ to: 'india', score: 74 }, { to: 'australia', score: 64 }, { to: 'japan', score: 59 }],
  japan:     [{ to: 'usa', score: 76 }, { to: 'singapore', score: 57 }, { to: 'india', score: 55 }],
  germany:   [{ to: 'india', score: 69 }, { to: 'usa', score: 67 }, { to: 'uk', score: 63 }],
};

const CITY_REGION_MAP: Record<string, string> = {
  dubai: 'middle-east', riyadh: 'middle-east', doha: 'middle-east',
  mumbai: 'india', delhi: 'india', bangalore: 'india',
  london: 'europe', paris: 'europe', berlin: 'europe',
  'new-york': 'us', 'los-angeles': 'us', chicago: 'us',
  toronto: 'canada',
  singapore: 'asia', tokyo: 'asia', 'hong-kong': 'asia',
  sydney: 'australia', melbourne: 'australia',
};

const REGION_CLUSTERS: Record<string, string[]> = {
  india:         ['mumbai', 'delhi', 'bangalore'],
  'middle-east': ['dubai', 'riyadh', 'doha'],
  europe:        ['london', 'paris', 'berlin'],
  us:            ['new-york', 'los-angeles', 'chicago'],
  canada:        ['toronto'],
  asia:          ['singapore', 'tokyo', 'hong-kong'],
  australia:     ['sydney', 'melbourne'],
};

const buildTimelineStart = (anchor: Date) => {
  const aligned = new Date(anchor);
  aligned.setMinutes(aligned.getMinutes() < 30 ? 0 : 30, 0, 0);
  return new Date(aligned.getTime() - 15 * 30 * 60000);
};

const TZ_PARTS_FORMATTER_CACHE: Record<string, Intl.DateTimeFormat> = {};
const TZ_DISPLAY_FORMATTER_CACHE: Record<string, Intl.DateTimeFormat> = {};

const getPartsFormatter = (iana: string) => {
  if (!TZ_PARTS_FORMATTER_CACHE[iana]) {
    TZ_PARTS_FORMATTER_CACHE[iana] = new Intl.DateTimeFormat('en-US', {
      timeZone: iana, hour12: false, hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
    });
  }
  return TZ_PARTS_FORMATTER_CACHE[iana];
};

const getDisplayFormatter = (iana: string) => {
  if (!TZ_DISPLAY_FORMATTER_CACHE[iana]) {
    TZ_DISPLAY_FORMATTER_CACHE[iana] = new Intl.DateTimeFormat('en-US', {
      timeZone: iana, hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true, weekday: 'short', month: 'short', day: 'numeric',
    });
  }
  return TZ_DISPLAY_FORMATTER_CACHE[iana];
};

// ─── Component ────────────────────────────────────────────────────────────────

const TimezoneConverter: React.FC<TimezoneConverterProps> = ({ isDark, fromSlug, toSlug, isTimezoneCodeRoute = false }) => {
  const [naturalInput, setNaturalInput] = useState('');
  const [baseTime, setBaseTime] = useState(() => { const d = new Date(); d.setSeconds(0, 0); return d; });
  const [sourceTz, setSourceTz] = useState<Timezone>({ name: 'London', iana: 'Europe/London', offset: 0 });
  const [targets, setTargets] = useState<Timezone[]>([{ name: 'New York', iana: 'America/New_York', offset: -5 }]);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [timelineFocusIndex, setTimelineFocusIndex] = useState<number | null>(null);
  const [timelineStartUtc, setTimelineStartUtc] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() < 30 ? 0 : 30, 0, 0);
    return new Date(d.getTime() - 15 * 30 * 60000);
  });
  const [hasSearchedConversion, setHasSearchedConversion] = useState<boolean>(Boolean(fromSlug && toSlug));

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const now = new Date();
      setBaseTime(now);
      setTimelineStartUtc(buildTimelineStart(now));
      setTimelineFocusIndex(15);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const getZoneDateParts = (date: Date, iana: string) => {
    const parts = getPartsFormatter(iana).formatToParts(date);
    const p = (type: string) => parseInt(parts.find(x => x.type === type)?.value || '0');
    return { year: p('year'), month: p('month'), day: p('day'), hour: p('hour'), minute: p('minute'), second: p('second') };
  };

  const zonedTimeToUtc = (
    input: { year: number; month: number; day: number; hour: number; minute: number; second: number },
    iana: string,
  ) => {
    const targetWallMs = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, input.second);
    let utcMillis = targetWallMs;
    for (let i = 0; i < 4; i++) {
      const date = new Date(utcMillis);
      const parts = getZoneDateParts(date, iana);
      const zoneWallMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
      const diff = targetWallMs - zoneWallMs;
      if (diff === 0) break;
      utcMillis += diff;
    }
    return new Date(utcMillis);
  };

  const getTzInfo = useCallback((date: Date, iana: string) => {
    try {
      const parts = getDisplayFormatter(iana).formatToParts(date);
      const p = (type: string) => parts.find(part => part.type === type)?.value || '';
      const timeStr = `${p('hour')}:${p('minute')}:${p('second')} ${p('dayPeriod')}`;
      const shortTime = `${p('hour')}:${p('minute')}${p('dayPeriod')?.toLowerCase().charAt(0)}`;
      return {
        time: timeStr, shortTime,
        hour: parseInt(p('hour')), minute: parseInt(p('minute')), second: parseInt(p('second')),
        dayPeriod: p('dayPeriod')?.toLowerCase() || '',
        date: `${p('weekday')}, ${p('month')} ${p('day')}`.toUpperCase(),
        dayName: p('weekday').toUpperCase(),
        monthDay: `${p('month')} ${p('day')}`.toUpperCase(),
      };
    } catch {
      return { time: '--:--:--', shortTime: '--:--', hour: 0, minute: 0, second: 0, dayPeriod: '', date: '', dayName: '', monthDay: '' };
    }
  }, []);

  const getOffsetString = (iana: string, date: Date = new Date()) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: iana, timeZoneName: 'shortOffset' }).formatToParts(date);
      return parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
    } catch { return 'GMT+0'; }
  };

  const getLongTimeZoneName = (iana: string, date: Date = new Date()) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: iana, timeZoneName: 'long' }).formatToParts(date);
      return parts.find(p => p.type === 'timeZoneName')?.value || iana;
    } catch { return iana; }
  };

  const getOffsetHours = (iana: string, date: Date = new Date()) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: iana, timeZoneName: 'longOffset' }).formatToParts(date);
      const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
      const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
      if (!match) return 0;
      const sign = match[1] === '-' ? -1 : 1;
      const h = parseInt(match[2], 10);
      const m = match[3] ? parseInt(match[3], 10) : 0;
      return sign * (h + m / 60);
    } catch { return 0; }
  };

  const formatHourRange = (start: number, end: number) => {
    const formatPoint = (value: number) => {
      const whole = Math.floor(value);
      const minute = Math.round((value - whole) * 60);
      const normalizedHour = ((whole % 24) + 24) % 24;
      const hour12 = ((normalizedHour + 11) % 12) + 1;
      const suffix = normalizedHour < 12 ? 'am' : 'pm';
      if (minute === 0) return `${hour12}${suffix}`;
      return `${hour12}:${String(minute).padStart(2, '0')}${suffix}`;
    };
    return `${formatPoint(start)}-${formatPoint(end)}`;
  };

  const getRelativeOffset = (iana: string, refIana: string) => {
    try {
      const now = new Date();
      const diff = getOffsetHours(iana, now) - getOffsetHours(refIana, now);
      return diff === 0 ? '0' : diff > 0 ? `+${diff}` : `${diff}`;
    } catch { return '0'; }
  };

  const getTimeDifferenceLine = useCallback(
    (srcName: string, srcIana: string, tgtName: string, tgtIana: string) => {
      const diff = Number(getRelativeOffset(tgtIana, srcIana));
      if (Number.isNaN(diff)) return `Time difference between ${srcName} and ${tgtName} updates live.`;
      if (diff === 0) return `${srcName} and ${tgtName} are currently at the same time offset.`;
      const abs = Math.abs(diff);
      return `${tgtName} is currently ${abs} hour${abs === 1 ? '' : 's'} ${diff > 0 ? 'ahead of' : 'behind'} ${srcName}.`;
    }, [],
  );

  const trackRelatedRouteClick = useCallback((href: string, label: string, rank: number) => {
    const payload = { event: 'related_route_click', from: sourceTz.name, to: targets[0]?.name || '', href, label, rank };
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push(payload);
      window.dispatchEvent(new CustomEvent('related_route_click', { detail: payload }));
    }
  }, [sourceTz.name, targets]);

  const pushHistory = useCallback(
    (query: string, src: Timezone, tgt: Timezone, at: Date) => {
      const srcInfo = getTzInfo(at, src.iana);
      const tgtInfo = getTzInfo(at, tgt.iana);
      const entry: ConversionHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        query, sourceName: src.name, sourceIana: src.iana, sourceTime: srcInfo.time,
        targetName: tgt.name, targetIana: tgt.iana, targetTime: tgtInfo.time, createdAt: Date.now(),
      };
      setHistory(prev => {
        const top = prev[0];
        if (top && top.query === entry.query && top.sourceIana === entry.sourceIana &&
            top.targetIana === entry.targetIana && Date.now() - top.createdAt < 1500) return prev;
        return [entry, ...prev].slice(0, 3);
      });
    }, [getTzInfo],
  );

  useEffect(() => {
    if (!fromSlug || !toSlug) return;
    const fromQuery = fromSlug.replace(/-/g, ' ');
    const toQuery = toSlug.replace(/-/g, ' ');
    const fromIana = resolveIanaFromQuery(fromQuery);
    const toIana = resolveIanaFromQuery(toQuery);
    let routeSource: Timezone | null = null;
    let routeTarget: Timezone | null = null;
    if (fromIana) {
      const fromName = isTimezoneCodeRoute ? fromSlug!.toUpperCase() : humanizeSlug(fromSlug!);
      routeSource = { name: fromName, iana: fromIana, offset: 0 };
      setSourceTz(routeSource);
    }
    if (toIana) {
      const toName = isTimezoneCodeRoute ? toSlug!.toUpperCase() : humanizeSlug(toSlug!);
      routeTarget = { name: toName, iana: toIana, offset: 0 };
      setTargets([routeTarget]);
    }
    const query = `${fromQuery} to ${toQuery}`;
    setNaturalInput(query);
    setIsLive(true);
    setHasSearchedConversion(true);
    if (routeSource && routeTarget) pushHistory(query, routeSource, routeTarget, new Date());
  }, [fromSlug, toSlug, pushHistory, isTimezoneCodeRoute]);

  const performLocalParse = (input: string, commitToHistory: boolean = false) => {
    const text = input.toUpperCase().trim();
    if (!text) return;
    const zoneParts = text
      .replace(/\b(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?\b/gi, '')
      .split(/\s+(?:TO|INTO|IN|AND|AT)\s+/i);
    const originalParts = input
      .replace(/\b(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?\b/gi, '')
      .split(/\s+(?:to|into|in|and|at)\s+/i);
    const findZone = (uppercaseQuery: string, originalQuery: string): Timezone | null => {
      const iana = resolveIanaFromQuery(uppercaseQuery);
      if (!iana) return null;
      const displayName = getDisplayName(originalQuery.trim(), iana);
      return { name: displayName, iana, offset: 0 };
    };
    let activeSrc = sourceTz;
    let activeTgt = targets[0] || { name: 'Target', iana: 'UTC', offset: 0 };
    if (zoneParts.length >= 2) {
      const src = findZone(zoneParts[0], originalParts[0] || zoneParts[0]);
      const tgt = findZone(zoneParts[1], originalParts[1] || zoneParts[1]);
      if (src) { setSourceTz(src); activeSrc = src; }
      if (tgt) { setTargets([tgt]); activeTgt = tgt; }
    } else if (zoneParts.length === 1) {
      const single = findZone(zoneParts[0], originalParts[0] || zoneParts[0]);
      if (single) { setSourceTz(single); activeSrc = single; }
    }
    let effectiveTime = baseTime;
    const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?\b/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      const period = timeMatch[4];
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      const now = new Date();
      const zoneNowParts = getZoneDateParts(now, activeSrc.iana);
      const targetUtc = zonedTimeToUtc(
        { year: zoneNowParts.year, month: zoneNowParts.month, day: zoneNowParts.day, hour: h, minute: m, second: s },
        activeSrc.iana,
      );
      setBaseTime(targetUtc);
      setIsLive(false);
      setTimelineStartUtc(buildTimelineStart(targetUtc));
      setTimelineFocusIndex(15);
      effectiveTime = targetUtc;
    }
    if (commitToHistory) pushHistory(input, activeSrc, activeTgt, effectiveTime);
  };

  const handleConvert = () => {
    const trimmed = naturalInput.trim();
    setIsLoading(true);
    if (!trimmed) { setIsLive(true); setIsLoading(false); return; }
    setHasSearchedConversion(true);
    performLocalParse(trimmed, true);
    setIsLoading(false);
  };

  const getTimelineData = (iana: string, startUtc: Date) => {
    const cells = [];
    const startTime = new Date(startUtc);
    for (let i = 0; i < 48; i++) {
      const d = new Date(startTime.getTime() + i * 30 * 60000);
      const parts = getZoneDateParts(d, iana);
      const info = getTzInfo(d, iana);
      const hour24 = parts.hour % 24;
      const minute = parts.minute;
      const isHalf = minute !== 0;
      const hour12 = ((hour24 + 11) % 12) + 1;
      const period = hour24 < 12 ? 'am' : 'pm';
      const isWorkingHour = hour24 >= 9 && hour24 < 18;
      const cellType: 'night' | 'day' = hour24 < 6 || hour24 >= 18 ? 'night' : 'day';
      cells.push({
        fullDate: d, hourLabel: isHalf ? '' : hour12, period: isHalf ? '' : period,
        isHalf, cellType, isWorkingHour, dayName: info.dayName, monthDay: info.monthDay,
        isDayStart: hour24 === 0 && minute === 0,
      });
    }
    return cells;
  };

  // ─── Styling ─────────────────────────────────────────────────────────────────

  const allTzs = [sourceTz, ...targets];
  const textColor = isDark ? 'text-white' : 'text-black';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const borderClass = isDark ? 'border-zinc-800' : 'border-zinc-200';
  const panelBg = isDark ? 'bg-black' : 'bg-white';
  const panelBorder = isDark ? 'border-zinc-900' : 'border-zinc-200';
  const panelBorderSoft = isDark ? 'border-zinc-900/50' : 'border-zinc-200/70';
  const panelBorderSofter = isDark ? 'border-zinc-900/30' : 'border-zinc-200/50';
  const titleText = isDark ? 'text-white' : 'text-black';
  const inputBg = isDark ? 'bg-white/5' : 'bg-black/[0.03]';
  const convertBtn = isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800';
  const timelineWrapBg = isDark ? 'bg-[#0a0a0a]' : 'bg-zinc-50 shadow-xl';
  const timelineLabelBg = isDark ? 'from-zinc-950/50' : 'from-zinc-200/40';
  const timelineLabelPill = isDark ? 'bg-zinc-800' : 'bg-zinc-200';
  const addRowBg = isDark ? 'bg-black/40' : 'bg-zinc-100';
  const addInputBg = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-300';
  const addBtnBg = isDark ? 'hover:bg-zinc-800 border-zinc-800' : 'hover:bg-zinc-200 border-zinc-300';
  const mutedText = isDark ? 'text-zinc-300' : 'text-zinc-600';
  const subtleText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const faintText = isDark ? 'text-zinc-500' : 'text-zinc-500';

  const fromRouteSlug = fromSlug?.trim() ? fromSlug.toLowerCase() : slugifyRoutePart(sourceTz.name);
  const toRouteSlug = toSlug?.trim() ? toSlug.toLowerCase() : slugifyRoutePart(targets[0]?.name || 'toronto');
  const currentRoute = `${fromRouteSlug}-to-${toRouteSlug}`;

  // ─── Related routes ───────────────────────────────────────────────────────────

  const relatedRoutes = useMemo(() => {
    const itemMap = new Map<string, RelatedRouteItem>();
    const currentHref = `/${currentRoute}`;
    const addRoute = (from: string, to: string, score: number) => {
      if (!from || !to || from === to) return;
      const href = `/${from}-to-${to}`;
      if (href === currentHref) return;
      const label = `${humanizeSlug(from)} → ${humanizeSlug(to)}`;
      const existing = itemMap.get(href);
      if (!existing || score > existing.score) itemMap.set(href, { href, label, score });
    };
    const TZ_TO_CITIES: Record<string, string[]> = {
      ist:  ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai'],
      est:  ['new-york', 'boston', 'miami', 'atlanta', 'washington-dc'],
      pst:  ['los-angeles', 'san-francisco', 'seattle', 'las-vegas'],
      cst:  ['chicago', 'houston', 'dallas'],
      mst:  ['denver'],
      gmt:  ['london', 'dublin'],
      cet:  ['berlin', 'paris', 'amsterdam', 'rome', 'madrid'],
      jst:  ['tokyo', 'osaka'],
      sgt:  ['singapore'],
      aest: ['sydney', 'melbourne', 'brisbane'],
      gst:  ['dubai', 'abu-dhabi'],
    };
    const TZ_POPULAR_PAIRS: Record<string, string[]> = {
      ist:  ['est', 'pst', 'gmt', 'cet', 'jst', 'sgt', 'gst', 'aest', 'cst'],
      est:  ['ist', 'gmt', 'pst', 'cet', 'jst', 'sgt', 'aest', 'cst', 'gst'],
      pst:  ['ist', 'gmt', 'est', 'cet', 'jst', 'sgt', 'aest', 'cst'],
      cst:  ['est', 'ist', 'gmt', 'pst', 'cet', 'jst', 'sgt'],
      mst:  ['est', 'pst', 'gmt', 'cst', 'ist'],
      gmt:  ['ist', 'est', 'pst', 'cet', 'jst', 'sgt', 'aest', 'gst', 'cst'],
      cet:  ['gmt', 'est', 'ist', 'pst', 'jst', 'sgt', 'aest'],
      jst:  ['est', 'pst', 'ist', 'sgt', 'aest', 'gmt', 'cet'],
      sgt:  ['ist', 'gmt', 'est', 'jst', 'aest', 'cet', 'pst'],
      aest: ['ist', 'gmt', 'est', 'jst', 'sgt', 'pst', 'cet'],
      gst:  ['ist', 'gmt', 'est', 'cet', 'jst', 'pst'],
    };
    const isFromTz = Boolean(TZ_TO_CITIES[fromRouteSlug]);
    const isToTz = Boolean(TZ_TO_CITIES[toRouteSlug]);
    if (isFromTz || isToTz) {
      addRoute(toRouteSlug, fromRouteSlug, 100);
      if (isFromTz && isToTz) {
        (TZ_POPULAR_PAIRS[fromRouteSlug] || []).filter(tz => tz !== toRouteSlug).slice(0, 4).forEach((tz, i) => addRoute(fromRouteSlug, tz, 90 - i));
        (TZ_POPULAR_PAIRS[toRouteSlug] || []).filter(tz => tz !== fromRouteSlug).slice(0, 3).forEach((tz, i) => addRoute(tz, toRouteSlug, 80 - i));
        const fromCities = (TZ_TO_CITIES[fromRouteSlug] || []).slice(0, 2);
        const toCities = (TZ_TO_CITIES[toRouteSlug] || []).slice(0, 2);
        fromCities.forEach((fc, i) => { toCities.forEach((tc, j) => addRoute(fc, tc, 70 - i - j)); });
      } else if (isFromTz && !isToTz) {
        (TZ_TO_CITIES[fromRouteSlug] || []).slice(0, 3).forEach((fc, i) => addRoute(fc, toRouteSlug, 90 - i));
        (TZ_POPULAR_PAIRS[fromRouteSlug] || []).slice(0, 4).forEach((tz, i) => addRoute(fromRouteSlug, tz, 80 - i));
      } else if (!isFromTz && isToTz) {
        (TZ_TO_CITIES[toRouteSlug] || []).slice(0, 3).forEach((tc, i) => addRoute(fromRouteSlug, tc, 90 - i));
        (TZ_POPULAR_PAIRS[toRouteSlug] || []).slice(0, 4).forEach((tz, i) => addRoute(tz, toRouteSlug, 80 - i));
      }
    } else {
      const fromNode = ROUTE_ALIAS[fromRouteSlug] || fromRouteSlug;
      const toNode = ROUTE_ALIAS[toRouteSlug] || toRouteSlug;
      addRoute(toRouteSlug, fromRouteSlug, 100);
      (ROUTE_GRAPH[fromNode] || []).forEach(edge => {
        if (edge.to === toNode) return;
        (HUB_CITY_VARIANTS[edge.to] || [edge.to]).slice(0, 2).forEach(city => addRoute(fromRouteSlug, city, edge.score));
      });
      Object.entries(ROUTE_GRAPH).forEach(([sourceNode, edges]) => {
        const edge = edges.find(e => e.to === toNode);
        if (!edge) return;
        (HUB_CITY_VARIANTS[sourceNode] || [sourceNode]).slice(0, 2).forEach(city => addRoute(city, toRouteSlug, edge.score - 5));
      });
      if (toNode === 'usa' || ['new-york', 'los-angeles', 'chicago', 'seattle', 'dallas', 'san-francisco'].includes(toRouteSlug)) {
        ['new-york', 'los-angeles', 'chicago', 'seattle', 'dallas', 'san-francisco']
          .filter(city => city !== toRouteSlug)
          .forEach((city, idx) => addRoute(fromRouteSlug, city, 82 - idx));
      }
      if (itemMap.size < 6) {
        const fromRegion = CITY_REGION_MAP[fromRouteSlug];
        const toRegion = CITY_REGION_MAP[toRouteSlug];
        (fromRegion ? REGION_CLUSTERS[fromRegion] || [] : []).forEach((city, idx) => {
          if (city !== fromRouteSlug && city !== toRouteSlug) addRoute(fromRouteSlug, city, 50 - idx);
        });
        (toRegion ? REGION_CLUSTERS[toRegion] || [] : []).forEach((city, idx) => {
          if (city !== fromRouteSlug && city !== toRouteSlug) addRoute(city, toRouteSlug, 45 - idx);
        });
      }
    }
    if (itemMap.size < 6) {
      [['mumbai', 'london'], ['new-york', 'london'], ['london', 'new-york'], ['mumbai', 'new-york'],
       ['singapore', 'london'], ['dubai', 'london'], ['sydney', 'london'], ['tokyo', 'new-york'], ['berlin', 'new-york']]
        .forEach(([f, t]) => { if (f !== fromRouteSlug && t !== toRouteSlug) addRoute(f, t, 30); });
    }
    return Array.from(itemMap.values()).sort((a, b) => b.score - a.score).slice(0, 7);
  }, [fromRouteSlug, toRouteSlug, currentRoute]);

  const faqData = useMemo(() => {
    const target = targets[0];
    if (!target) return null;
    const srcOffsetHours = getOffsetHours(sourceTz.iana, baseTime);
    const tgtOffsetHours = getOffsetHours(target.iana, baseTime);
    const diff = srcOffsetHours - tgtOffsetHours;
    const absDiff = Math.abs(diff);
    const srcLongName = getLongTimeZoneName(sourceTz.iana, baseTime);
    const tgtLongName = getLongTimeZoneName(target.iana, baseTime);
    const srcTime = getTzInfo(baseTime, sourceTz.iana).time;
    const tgtTime = getTzInfo(baseTime, target.iana).time;
    const businessStart = 9, businessEnd = 17;
    const overlapStart = Math.max(businessStart, businessStart + diff);
    const overlapEnd = Math.min(businessEnd, businessEnd + diff);
    const overlap = overlapStart < overlapEnd
      ? { srcRange: formatHourRange(overlapStart, overlapEnd), tgtRange: formatHourRange(overlapStart - diff, overlapEnd - diff) }
      : null;
    return {
      srcName: sourceTz.name, tgtName: target.name, srcLongName, tgtLongName,
      srcTime, tgtTime,
      srcOffset: getOffsetString(sourceTz.iana, baseTime),
      tgtOffset: getOffsetString(target.iana, baseTime),
      diffHours: Number.isInteger(absDiff) ? String(absDiff) : absDiff.toFixed(1).replace(/\.0$/, ''),
      isAhead: diff > 0, overlap,
    };
  }, [sourceTz, targets, baseTime, getTzInfo]);

  // ─── Dynamic SEO content (DST / About / FAQ) ─────────────────────────────────
  const cityPairContent = useMemo(() => {
    const target = targets[0];
    if (!target) return null;
    try {
      return buildCityPairContent(
        sourceTz.iana,
        target.iana,
        sourceTz.name,
        target.name,
      );
    } catch {
      return null;
    }
  }, [sourceTz.iana, sourceTz.name, targets]);

  // FAQ accordion state
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // showRelatedRoutes: always true when routes exist — good for SEO internal linking
  const showRelatedRoutes = relatedRoutes.length > 0;
  const relatedRoutesDiffLine = targets[0]
    ? getTimeDifferenceLine(sourceTz.name, sourceTz.iana, targets[0].name, targets[0].iana)
    : '';

  const primaryTargetName = targets[0]?.name || 'Target Timezone';
  const meetingButtonLabel = `Best Time to Schedule a Meeting between ${sourceTz.name} and ${primaryTargetName}`;

  const scrollToTimeline = () => {
    document.getElementById('timeline-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRelatedRouteClick = useCallback((href: string, label: string, idx: number) => {
    trackRelatedRouteClick(href, label, idx + 1);
    const query = label.replace(' → ', ' to ').toLowerCase();
    setNaturalInput(query);
    performLocalParse(query, true);
    setHasSearchedConversion(true);
    window.location.href = href;
  }, [trackRelatedRouteClick]);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className={`timezone-no-shadow p-4 sm:p-8 space-y-8 sm:space-y-12 ${bgColor} ${textColor} font-['Helvetica']`}>

      {/* ── Header ── */}
      <header className="space-y-2 sm:space-y-4 text-center">
        <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tighter whitespace-nowrap">
          Time <em className="hero-italic">Zone</em> Converter
        </h1>
      </header>

      {/* ── Search bar ── */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4">
        <div className={`flex-grow flex items-center px-4 sm:px-5 py-3 sm:py-2 rounded-full border-2 ${borderClass} focus-within:border-blue-500 transition-all shadow-2xl ${inputBg}`}>
          <svg aria-hidden="true" className={`w-5 h-5 sm:w-6 sm:h-6 ${subtleText} mr-3 sm:mr-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            aria-label="Time Zone conversion query"
            className="flex-grow bg-transparent border-none outline-none font-bold text-base sm:text-lg min-w-0"
            placeholder={!fromSlug && !toSlug ? '5 pm London to New York' : 'e.g. 8 pm russia to london'}
            value={naturalInput}
            onChange={e => {
              setNaturalInput(e.target.value);
              if (e.target.value.length > 1) performLocalParse(e.target.value, false);
            }}
            onKeyDown={e => e.key === 'Enter' && handleConvert()}
          />
        </div>
        <button
          type="button"
          aria-label="Convert time zone"
          onClick={handleConvert}
          className={`w-full sm:w-auto px-6 sm:px-10 py-4 rounded-full font-black uppercase text-xs sm:text-sm tracking-[0.2em] sm:tracking-widest transition-all active:scale-95 shadow-lg ${convertBtn}`}
        >
          {isLoading ? 'Syncing...' : 'Convert'}
        </button>
      </div>

      {/* ── Time display panel ── */}
      <div className="max-w-6xl mx-auto">
        <div className={`border ${panelBorder} rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden ${panelBg} shadow-2xl transition-all duration-300`}>
          <div className={`hidden sm:grid grid-cols-12 px-12 pt-8 pb-4 border-b ${panelBorderSoft}`}>
            <div className={`col-span-5 text-[10px] font-black uppercase tracking-[0.3em] ${subtleText}`}>Source Time Zone</div>
            <div className={`col-span-2 text-center text-[10px] font-black uppercase tracking-[0.3em] ${subtleText}`}>Direction</div>
            <div className={`col-span-5 text-right text-[10px] font-black uppercase tracking-[0.3em] ${subtleText}`}>Target Local Time</div>
          </div>
          {targets.map((tz, idx) => {
            const srcInfo = getTzInfo(baseTime, sourceTz.iana);
            const tgtInfo = getTzInfo(baseTime, tz.iana);
            return (
              <div key={`${tz.iana}-${idx}`} className={`grid grid-cols-12 px-4 sm:px-12 py-6 sm:pt-8 sm:pb-10 items-center last:border-0 border-b ${panelBorderSofter}`}>
                <div className="col-span-5 space-y-1 text-left">
                  <div className={`text-sm sm:text-4xl font-normal tracking-tight ${titleText} uppercase truncate`}>{sourceTz.name}</div>
                  <div className={`text-[7px] sm:text-[10px] font-bold uppercase tracking-tight sm:tracking-tighter ${subtleText}`}>
                    {sourceTz.iana.toUpperCase()} (GMT{getOffsetString(sourceTz.iana, baseTime)})
                  </div>
                  <div className="text-xl sm:text-6xl font-normal tracking-tighter text-blue-500 tabular-nums whitespace-nowrap">{srcInfo.time}</div>
                </div>
                <div className={`col-span-2 flex flex-col items-center justify-center ${subtleText}`}>
                  <svg aria-hidden="true" className="w-5 h-5 sm:w-10 sm:h-10 mb-1 sm:mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="text-[7px] sm:text-[10px] font-normal uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center">Synced</span>
                </div>
                <div className="col-span-5 text-right space-y-1">
                  <div className={`text-sm sm:text-4xl font-normal tracking-tight ${titleText} uppercase truncate`}>{tz.name}</div>
                  <div className={`text-[7px] sm:text-[10px] font-bold uppercase tracking-tight sm:tracking-tighter ${subtleText}`}>
                    {tz.iana.toUpperCase()} (GMT{getOffsetString(tz.iana, baseTime)})
                  </div>
                  <div className="text-xl sm:text-6xl font-normal tracking-tighter text-green-500 tabular-nums whitespace-nowrap">{tgtInfo.time}</div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          aria-label={meetingButtonLabel}
          onClick={scrollToTimeline}
          className={`
            mt-6 sm:mt-8 w-full py-4 px-4 sm:px-6 rounded-full border font-bold uppercase
            text-[8px] sm:text-xs tracking-[0.1em] sm:tracking-[0.2em] leading-relaxed text-center
            ${borderClass} ${panelBg} ${textColor}
            hover:border-yellow-400 focus-visible:border-yellow-400 active:border-yellow-400
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40
            transition-all duration-200 active:scale-[0.99]
          `}
        >
          {meetingButtonLabel}
        </button>
      </div>

      {/* ── Related Searches tile (above Past Searches) ── */}
      {showRelatedRoutes && (
        <div className="max-w-6xl mx-auto mt-12 sm:mt-20">
          <div className={`flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${mutedText} mb-4 sm:mb-5`}>
            <div className="w-10 sm:w-20 h-px bg-current"></div>Related Searches
          </div>
          <div className="text-[10px] sm:text-xs font-bold tracking-wide uppercase mb-4 sm:mb-6 font-['Helvetica'] text-yellow-400">
            {relatedRoutesDiffLine}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {relatedRoutes.map((route, idx) => (
              <a
                key={route.href}
                href={route.href}
                onClick={() => trackRelatedRouteClick(route.href, route.label, idx + 1)}
                className={`
                  inline-flex items-center w-fit max-w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border
                  ${isDark ? 'border-zinc-700 hover:border-blue-500 hover:bg-zinc-950' : 'border-zinc-300 hover:border-blue-500 hover:bg-blue-50'}
                  font-['Helvetica'] font-bold text-xs sm:text-sm tracking-tight whitespace-nowrap
                  transition-all duration-200
                `}
              >
                {route.label}
              </a>
            ))}
          </div>
        </div>
      )}


      {/* ── Timeline ── */}
      <div id="timeline-section" className="max-w-6xl mx-auto mt-12 sm:mt-20 scroll-mt-24">
        <div className={`flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${mutedText} mb-6 sm:mb-8`}>
          <div className="w-10 sm:w-20 h-px bg-current"></div>Meeting Planner and time zone overlap
        </div>
        <div className={`border ${borderClass} rounded-xl overflow-hidden ${timelineWrapBg}`}>
          <div className="flex flex-col lg:flex-row">
            <div className={`w-full lg:w-80 lg:flex-none border-b lg:border-b-0 lg:border-r ${panelBorder}`}>
              {allTzs.map((tz, rowIndex) => {
                const currentTzInfo = getTzInfo(baseTime, tz.iana);
                const relativeOffset = getRelativeOffset(tz.iana, sourceTz.iana);
                const isSource = rowIndex === 0;
                return (
                  <div
                    key={`${tz.iana}-label-${rowIndex}`}
                    className={`h-28 sm:h-40 p-4 sm:p-6 border-b ${panelBorder} last:border-0 flex flex-col justify-center relative bg-gradient-to-r ${timelineLabelBg} to-transparent group`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-lg sm:text-xl font-black tracking-tight uppercase truncate max-w-[120px] sm:max-w-[140px]">{tz.name}</h3>
                          <div className={`px-2 py-0.5 rounded ${timelineLabelPill} text-[9px] sm:text-[10px] font-bold ${subtleText}`}>
                            {getOffsetString(tz.iana, baseTime)}
                          </div>
                        </div>
                        <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate ${subtleText}`}>
                          {tz.iana.split('/')[0]}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg sm:text-2xl font-black tracking-tighter leading-none whitespace-nowrap">
                          {currentTzInfo.shortTime.slice(0, -1)}
                          <span className={`text-[10px] sm:text-xs ml-0.5 font-bold ${subtleText}`}>{currentTzInfo.shortTime.slice(-1)}</span>
                        </div>
                        <div className={`text-[8px] sm:text-[9px] font-black uppercase tracking-tight sm:tracking-tighter mt-1 ${subtleText}`}>
                          {currentTzInfo.date}
                        </div>
                      </div>
                    </div>
                    <div className={`absolute left-4 sm:left-6 bottom-3 sm:bottom-4 flex items-center gap-2 ${faintText}`}>
                      {!isSource && <span className="text-[9px] sm:text-[10px] font-black tracking-widest">{relativeOffset}H RELATIVE</span>}
                      {isSource && (
                        <svg aria-hidden="true" className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                        </svg>
                      )}
                    </div>
                    {!isSource && (
                      <button
                        type="button"
                        aria-label={`Remove ${tz.name} from timeline`}
                        onClick={() => setTargets(prev => prev.filter((_, i) => i !== rowIndex - 1))}
                        className={`absolute top-2 right-2 p-1 transition-opacity ${isDark ? 'opacity-70 lg:opacity-0 group-hover:opacity-70 hover:opacity-100' : 'opacity-80 lg:opacity-0 group-hover:opacity-80 hover:opacity-100'}`}
                      >
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
              <div className={`h-20 sm:h-16 p-4 border-t ${panelBorder} ${addRowBg} flex items-center gap-3 sm:gap-4`}>
                <div className="relative flex-grow">
                  <input
                    type="text"
                    aria-label="Add time zone to timeline"
                    placeholder="ADD TIME ZONE..."
                    className={`w-full ${addInputBg} border rounded-lg px-4 py-3 sm:py-2 text-[10px] font-black tracking-[0.15em] sm:tracking-widest uppercase outline-none focus:border-blue-500 transition-colors`}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value;
                        const iana = resolveIanaFromQuery(val);
                        if (iana) {
                          const displayName = getDisplayName(val, iana);
                          setTargets(prev => [...prev, { name: displayName, iana, offset: 0 }]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Add timezone"
                  className={`w-12 h-12 sm:w-10 sm:h-10 flex-none rounded-lg border ${addBtnBg} flex items-center justify-center transition-colors`}
                >
                  <svg aria-hidden="true" className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-x-auto scrollbar-custom">
              <div className="min-w-max">
                {allTzs.map((tz, rowIndex) => {
                  const timeline = getTimelineData(tz.iana, timelineStartUtc);
                  return (
                    <div key={`${tz.iana}-timeline-${rowIndex}`} className={`flex h-28 sm:h-40 border-b ${panelBorder} last:border-0`}>
                      {timeline.map((cell, cIdx) => {
                        const isFocused = timelineFocusIndex === cIdx;
                        return (
                          <div
                            key={cIdx}
                            onClick={() => { setTimelineFocusIndex(cIdx); setBaseTime(cell.fullDate); setIsLive(false); }}
                            className={`w-10 sm:w-12 flex flex-col items-center justify-center border-r ${panelBorderSofter} cursor-pointer transition-all relative group/cell
                              ${isFocused
                                ? (isDark ? 'bg-indigo-900/40' : 'bg-blue-200/50')
                                : cell.isWorkingHour
                                  ? (isDark ? 'bg-[#2a2a2e]' : 'bg-white')
                                  : cell.cellType === 'night'
                                    ? (isDark ? 'bg-[#0c0c0e]' : 'bg-zinc-200/70')
                                    : (isDark ? 'bg-[#151518]' : 'bg-zinc-100')
                              }
                              hover:bg-zinc-800/80`}
                          >
                            {cell.isDayStart && (
                              <div className="absolute top-2 left-1 whitespace-nowrap">
                                <div className={`text-[7px] sm:text-[8px] font-black uppercase ${subtleText}`}>{cell.dayName}</div>
                                <div className={`text-[7px] sm:text-[8px] font-black ${subtleText}`}>{cell.monthDay}</div>
                              </div>
                            )}
                            <div className={[
                              'text-[10px] sm:text-xs font-black transition-colors duration-200 group-hover/cell:text-yellow-400',
                              isFocused
                                ? 'text-yellow-400 opacity-100 scale-110'
                                : (isDark ? 'text-white opacity-100' : 'text-black opacity-100'),
                              cell.isHalf ? 'text-[7px] sm:text-[8px] mt-1' : '',
                            ].join(' ')}>
                              {cell.hourLabel}
                            </div>
                            {!cell.isHalf && (
                              <div className={`text-[7px] sm:text-[8px] font-bold uppercase transition-colors duration-200
                                ${isFocused ? 'text-yellow-400/80 opacity-100' : `${subtleText} group-hover/cell:text-yellow-400/80`}`}>
                                {cell.period}
                              </div>
                            )}
                            {cell.isHalf && !cell.hourLabel && (
                              <div className="w-0.5 h-0.5 rounded-full bg-zinc-700 group-hover/cell:bg-yellow-400"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                <div className={`h-20 sm:h-16 border-t ${panelBorder} ${addRowBg}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ + Related Converters ── */}
      {faqData && (
        <div className="max-w-6xl mx-auto mt-12 sm:mt-16">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className={`lg:col-span-8 flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${mutedText}`}>
              <div className="w-10 sm:w-20 h-px bg-current"></div>Time Zone Conversion FAQ and Fact
            </div>
            <div className={`lg:col-span-4 flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${mutedText} whitespace-nowrap`}>
              <div className="w-6 sm:w-8 flex-none h-px bg-current"></div>Related Converters
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">

            {/* FAQ panel */}
            <div className={`lg:col-span-8 border ${panelBorder} rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden ${panelBg} shadow-2xl p-6 sm:p-10 space-y-8`}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-12">
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-blue-500">Time Difference</h4>
                  <div className="space-y-2">
                    <p className="text-sm sm:text-base lg:text-xl font-bold leading-relaxed">
                      {faqData.srcLongName} is {faqData.diffHours} hours {faqData.isAhead ? 'ahead of' : 'behind'} {faqData.tgtLongName}
                    </p>
                    <p className={`text-xs sm:text-sm ${subtleText} leading-relaxed`}>
                      {faqData.srcTime} in {faqData.srcName} is {faqData.tgtTime} in {faqData.tgtName}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-green-500">
                    {faqData.srcName} to {faqData.tgtName} Meeting Planner
                  </h4>
                  <div className="space-y-2">
                    {faqData.overlap ? (
                      <p className="text-sm sm:text-base lg:text-xl font-bold leading-relaxed">
                        Best time for a conference call or a meeting is between {faqData.overlap.srcRange} in {faqData.srcName} which corresponds to {faqData.overlap.tgtRange} in {faqData.tgtName}
                      </p>
                    ) : (
                      <p className={`text-sm sm:text-base lg:text-xl font-bold leading-relaxed ${subtleText}`}>
                        No standard business hour overlap found. Consider scheduling during early morning or late evening.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className={`pt-8 border-t ${panelBorderSoft} grid grid-cols-1 md:grid-cols-2 gap-6`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-none">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${subtleText}`}>
                      {faqData.srcName} ({faqData.srcLongName})
                    </div>
                    <div className="text-sm sm:text-lg font-bold">Offset {faqData.srcOffset}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-none">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${subtleText}`}>
                      {faqData.tgtName} ({faqData.tgtLongName})
                    </div>
                    <div className="text-sm sm:text-lg font-bold">Offset {faqData.tgtOffset}</div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <div className={`inline-block px-4 py-2 rounded-full ${isDark ? 'bg-zinc-500/5' : 'bg-zinc-900/5'} text-[10px] font-black uppercase tracking-widest ${faintText}`}>
                  {faqData.srcTime} {faqData.srcName} / {faqData.tgtTime} {faqData.tgtName}
                </div>
              </div>
            </div>

            {/* Related Converters panel */}
            <div className={`lg:col-span-4 border ${panelBorder} rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden ${panelBg} shadow-2xl p-4 sm:p-6 h-full`}>
              <div className="space-y-2 sm:space-y-3">
                {relatedRoutes.map((route, idx) => (
                  <a
                    key={route.href}
                    href={route.href}
                    onClick={e => {
                      e.preventDefault();
                      handleRelatedRouteClick(route.href, route.label, idx);
                    }}
                    className={`
                      flex items-center justify-between w-full px-4 py-3 sm:py-3.5
                      rounded-xl border
                      ${isDark
                        ? 'border-zinc-700 hover:border-blue-500 hover:bg-zinc-900 text-zinc-100'
                        : 'border-zinc-200 hover:border-blue-500 hover:bg-blue-50/60 text-zinc-700'}
                      font-bold text-[11px] sm:text-xs uppercase tracking-tight
                      transition-all duration-200 group cursor-pointer
                    `}
                  >
                    <span className="group-hover:text-blue-400 transition-colors truncate">
                      {route.label}
                    </span>
                    <svg
                      className="w-3 h-3 flex-none ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className={`text-center text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] pt-6 sm:pt-8 ${faintText}`}>
        Global resolution context • Wall-clock anchored drift-free engine
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SEO CONTENT LAYER — DST / About / FAQ
          Rendered only when a resolved city or tz-code pair is active.
          All content is computed dynamically from ianaA + ianaB so every
          page combination gets unique, accurate text.
      ══════════════════════════════════════════════════════════════════════ */}

      {cityPairContent && (
        <>
          {/* Inject FAQPage JSON-LD for rich results */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: cityPairContent.faq.jsonLd }}
          />

          {/* ── DST Section ── */}
          <section
            aria-label={`Daylight Saving Time — ${cityPairContent.dst.cityA} & ${cityPairContent.dst.cityB}`}
            className="max-w-6xl mx-auto mt-12 sm:mt-16"
          >
            {/* Section label */}
            <h2 className={`flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${mutedText} mb-6 sm:mb-8`}>
              <div className="w-10 sm:w-20 h-px bg-current"></div>
              Daylight Saving Time — {cityPairContent.dst.cityA} &amp; {cityPairContent.dst.cityB}
            </h2>

            <div className={`border ${panelBorder} rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden ${panelBg} shadow-2xl p-6 sm:p-10`}>

              {/* Intro paragraph */}
              <p className={`text-sm sm:text-base ${subtleText} leading-relaxed mb-6 sm:mb-8`}>
                {cityPairContent.dst.hasDst
                  ? `Both ${cityPairContent.dst.cityA} and ${cityPairContent.dst.cityB} may observe Daylight Saving Time, which means the offset between them can change twice a year. Here is exactly what to expect.`
                  : `The offset between ${cityPairContent.dst.cityA} and ${cityPairContent.dst.cityB} is fixed — no seasonal clock changes affect this pair.`
                }
              </p>

              {/* DST table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className={`border-b-2 ${panelBorder}`}>
                      {(['Period', cityPairContent.dst.cityA, cityPairContent.dst.cityB, 'Offset'] as const).map(h => (
                        <th
                          key={h}
                          className={`text-left text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] ${subtleText} pb-3 pr-4 sm:pr-6 whitespace-nowrap`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cityPairContent.dst.rows.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b ${panelBorderSoft} last:border-0`}
                      >
                        {/* Period */}
                        <td className="py-4 pr-4 sm:pr-6 align-top">
                          <div className="font-bold text-xs sm:text-sm">{row.period}</div>
                          <div className={`text-[10px] sm:text-xs ${subtleText} mt-0.5`}>{row.periodNote}</div>
                        </td>

                        {/* City A timezone */}
                        <td className="py-4 pr-4 sm:pr-6 align-top">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm">{row.tzALabel}</span>
                            {row.isCurrent && !row.isTransitioning && (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-100 text-green-700'
                              }`}>
                                now
                              </span>
                            )}
                            {row.isTransitioning && row.isCurrent && (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isDark ? 'bg-yellow-500/15 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                transitioning
                              </span>
                            )}
                          </div>
                        </td>

                        {/* City B timezone */}
                        <td className="py-4 pr-4 sm:pr-6 align-top">
                          <span className="font-bold text-xs sm:text-sm">{row.tzBLabel}</span>
                        </td>

                        {/* Offset */}
                        <td className="py-4 align-top">
                          <span className="font-black text-xs sm:text-sm">{row.offsetLabel}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer note */}
              <p className={`text-[10px] sm:text-xs ${subtleText} leading-relaxed mt-6 pt-6 border-t ${panelBorderSoft}`}>
                {cityPairContent.dst.footerNote}
              </p>
            </div>
          </section>

          {/* ── About Timezones Section ── */}
          <section
            aria-label={`About ${cityPairContent.about.cityA} and ${cityPairContent.about.cityB} timezones`}
            className="max-w-6xl mx-auto mt-12 sm:mt-16"
          >
            {/* Section label */}
            <h2 className={`flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${mutedText} mb-6 sm:mb-8`}>
              <div className="w-10 sm:w-20 h-px bg-current"></div>
              About {cityPairContent.about.cityA} and {cityPairContent.about.cityB} Time Zones
            </h2>

            <div className={`border ${panelBorder} rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden ${panelBg} shadow-2xl p-6 sm:p-10`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">

                {/* City A */}
                <div className="space-y-3">
                  <h2 className="text-sm sm:text-base font-black leading-tight">
                    {cityPairContent.about.headingA}
                  </h2>
                  <p className={`text-xs sm:text-sm ${subtleText} leading-relaxed`}>
                    {cityPairContent.about.paragraphA}
                  </p>
                </div>

                {/* City B */}
                <div className="space-y-3">
                  <h2 className="text-sm sm:text-base font-black leading-tight">
                    {cityPairContent.about.headingB}
                  </h2>
                  <p className={`text-xs sm:text-sm ${subtleText} leading-relaxed`}>
                    {cityPairContent.about.paragraphB}
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* ── FAQ Section ── */}
          <section
            aria-label={`Frequently asked questions — ${cityPairContent.faq.cityA} to ${cityPairContent.faq.cityB}`}
            className="max-w-6xl mx-auto mt-12 sm:mt-16"
          >
            {/* Section label */}
            <h2 className={`flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${mutedText} mb-6 sm:mb-8`}>
              <div className="w-10 sm:w-20 h-px bg-current"></div>
              Frequently Asked Questions
            </h2>

            <div className={`border ${panelBorder} rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden ${panelBg} shadow-2xl`}>
              {cityPairContent.faq.items.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    className={`border-b ${panelBorderSoft} last:border-0`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className={`
                        w-full flex items-start justify-between gap-4
                        px-6 sm:px-10 py-5 sm:py-6 text-left
                        transition-colors duration-150
                        ${isDark ? 'hover:bg-zinc-900/40' : 'hover:bg-zinc-50/70'}
                      `}
                    >
                      <span className="text-sm sm:text-base font-bold leading-snug flex-1">
                        {item.question}
                      </span>
                      {/* Chevron icon — rotates when open */}
                      <svg
                        aria-hidden="true"
                        className={`w-4 h-4 sm:w-5 sm:h-5 flex-none mt-0.5 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : 'rotate-0'
                        } ${subtleText}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Answer panel */}
                    {isOpen && (
                      <div className={`px-6 sm:px-10 pb-6 sm:pb-8`}>
                        <p className={`text-xs sm:text-sm ${subtleText} leading-relaxed`}>
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&display=swap');
        .scrollbar-custom::-webkit-scrollbar { height: 6px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: #000000; border-radius: 10px; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: #333333; border-radius: 10px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: #555555; }
        ${!isDark ? `
          .scrollbar-custom::-webkit-scrollbar-track { background: #f4f4f5; }
          .scrollbar-custom::-webkit-scrollbar-thumb { background: #d4d4d8; }
          .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
        ` : ''}
        .timezone-no-shadow, .timezone-no-shadow * { box-shadow: none !important; }
        .hero-italic {
          font-family: 'Instrument Serif', Georgia, serif !important;
          font-style: italic !important;
          font-weight: 400 !important;
          text-transform: none !important;
          letter-spacing: 0 !important;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default TimezoneConverter;