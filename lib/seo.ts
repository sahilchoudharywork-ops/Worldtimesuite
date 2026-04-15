import { Page } from '../types';
import { AppRouteState, toShortCityPath } from './routing';
import { TIMEZONE_BY_SLUG } from '../data/timezones';

export interface SeoData {
  title: string;
  description: string;
  canonicalPath: string;
}

type TimezoneSeoEntry = {
  slug: string;
  code: string;
  name: string;
  iana: string;
};

const EXTRA_TIMEZONE_BY_SLUG: Record<string, TimezoneSeoEntry> = {
  gmt: { slug: 'gmt', code: 'GMT', name: 'Greenwich Mean Time', iana: 'Etc/GMT' },
  edt: { slug: 'edt', code: 'EDT', name: 'Eastern Daylight Time', iana: 'America/New_York' },
  pdt: { slug: 'pdt', code: 'PDT', name: 'Pacific Daylight Time', iana: 'America/Los_Angeles' },
  cdt: { slug: 'cdt', code: 'CDT', name: 'Central Daylight Time', iana: 'America/Chicago' },
  mdt: { slug: 'mdt', code: 'MDT', name: 'Mountain Daylight Time', iana: 'America/Denver' },
  bst: { slug: 'bst', code: 'BST', name: 'British Summer Time', iana: 'Europe/London' },
  cest: { slug: 'cest', code: 'CEST', name: 'Central European Summer Time', iana: 'Europe/Berlin' },
  aedt: { slug: 'aedt', code: 'AEDT', name: 'Australian Eastern Daylight Time', iana: 'Australia/Sydney' },
  hkt: { slug: 'hkt', code: 'HKT', name: 'Hong Kong Time', iana: 'Asia/Hong_Kong' },
  wet: { slug: 'wet', code: 'WET', name: 'Western European Time', iana: 'Europe/Lisbon' },
  brt: { slug: 'brt', code: 'BRT', name: 'Brasilia Time', iana: 'America/Sao_Paulo' },
  pht: { slug: 'pht', code: 'PHT', name: 'Philippine Time', iana: 'Asia/Manila' },
  eet: { slug: 'eet', code: 'EET', name: 'Eastern European Time', iana: 'Europe/Helsinki' },
  kst: { slug: 'kst', code: 'KST', name: 'Korea Standard Time', iana: 'Asia/Seoul' },
  nzdt: { slug: 'nzdt', code: 'NZDT', name: 'New Zealand Daylight Time', iana: 'Pacific/Auckland' },
  nzst: { slug: 'nzst', code: 'NZST', name: 'New Zealand Standard Time', iana: 'Pacific/Auckland' },
  ast: { slug: 'ast', code: 'AST', name: 'Atlantic Standard Time', iana: 'America/Halifax' },
  msk: { slug: 'msk', code: 'MSK', name: 'Moscow Standard Time', iana: 'Europe/Moscow' }
};

const TIMEZONE_SEO_BY_SLUG: Record<string, TimezoneSeoEntry> = {
  ...TIMEZONE_BY_SLUG,
  ...EXTRA_TIMEZONE_BY_SLUG
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
  halifax: 'America/Halifax'
};

const titleCase = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatHourValue = (value: number) => {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/0$/, '').replace(/\.0$/, '');
};

const getOffsetHours = (iana: string, date: Date = new Date()) => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'longOffset'
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
      timeZoneName: 'long'
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

const seoByPage: Partial<Record<Page, Omit<SeoData, 'canonicalPath'>>> = {
  [Page.CONVERTER]: {
    title: 'Time Zone Converter – Convert Time Between Any Two Cities',
    description: 'Free time zone converter for 500+ cities worldwide. Instantly see the time difference between any two cities, find meeting-friendly hours, and plan across time zones.'
  },
  [Page.STOPWATCH]: {
    title: 'Online Stopwatch with Lap Timer – Free & Instant | WorldTimeSuite',
    description: 'Free online stopwatch with lap tracking. Start, stop and record laps instantly — no download needed. Works on desktop and mobile.'
  },
  [Page.TIMER]: {
    title: 'Online Countdown Timer – Free, Fast & No Sign-up | WorldTimeSuite',
    description: 'Set a free online countdown timer in seconds. Simple, distraction-free timer that works instantly on any device — no app or account needed.'
  },
  [Page.CALENDAR]: {
    title: 'Time Zone Calendar – Plan Meetings Across Time Zones | WorldTimeSuite',
    description: 'Plan and schedule across time zones with our timezone-aware calendar. See overlapping hours between cities and avoid scheduling mistakes.'
  },
  [Page.SETTINGS]: {
    title: 'Settings | WorldTimeSuite',
    description: 'Manage your WorldTimeSuite preferences.'
  },
  [Page.ABOUT]: {
    title: 'About WorldTimeSuite – Free Global Time Zone Tools',
    description: 'WorldTimeSuite is a free productivity suite for remote teams and global professionals. Convert time zones, track business hours, and schedule meetings across cities.'
  },
  [Page.TERMS]: {
    title: 'Terms and Conditions | WorldTimeSuite',
    description: 'Read the terms and conditions for using WorldTimeSuite, including usage policy, accuracy disclaimers, and data handling practices.'
  },
  [Page.PRIVACY]: {
    title: 'Privacy Policy | WorldTimeSuite',
    description: 'WorldTimeSuite privacy policy — how we handle data, cookies, Google AdSense advertising, and your privacy rights.'
  }
};

export const getSeoData = (route: AppRouteState): SeoData => {
  if (route.timezoneRoute) {
    const from = TIMEZONE_SEO_BY_SLUG[route.timezoneRoute.fromSlug];
    const to = TIMEZONE_SEO_BY_SLUG[route.timezoneRoute.toSlug];

    if (from && to) {
      const offsetPhrase = formatOffsetPhrase(from.iana, to.iana);
      const fromLongName = getCurrentTimeZoneName(from.iana, from.name);
      const toLongName = getCurrentTimeZoneName(to.iana, to.name);

      const description =
        offsetPhrase === 'at the same time as'
          ? `${from.code}, ${fromLongName} is at the same time as ${toLongName}. Convert time between ${from.code} and ${to.code}. See the exact time difference and best hours to schedule meetings.`
          : `${from.code}, ${fromLongName} is ${offsetPhrase} ${toLongName}. Convert time between ${from.code} and ${to.code}. See the exact time difference and best hours to schedule meetings.`;

      return {
        title: `${from.code} to ${to.code} Time Converter | Current Time & Difference`,
        description,
        canonicalPath: `/${from.slug}-to-${to.slug}`
      };
    }
  }

  if (route.cityRoute) {
    const fromName = titleCase(route.cityRoute.fromSlug);
    const toName = titleCase(route.cityRoute.toSlug);
    const fromIana = CITY_IANA_MAP[route.cityRoute.fromSlug];
    const toIana = CITY_IANA_MAP[route.cityRoute.toSlug];

    const offsetPhrase = fromIana && toIana ? formatOffsetPhrase(fromIana, toIana) : null;

    const description =
      fromIana && toIana
        ? offsetPhrase === 'at the same time as'
          ? `${fromName} and ${toName} are currently at the same time. Convert time between ${fromName} and ${toName}. See the exact time difference and best hours to schedule meetings.`
          : `${fromName} time is ${offsetPhrase} ${toName}. Convert time between ${fromName} and ${toName}. See the exact time difference and best hours to schedule meetings.`
        : `Convert time between ${fromName} and ${toName}. See the exact time difference and best hours to schedule meetings.`;

    return {
      title: `${fromName} to ${toName} Time Converter | Current Time & Difference`,
      description,
      canonicalPath: toShortCityPath(route.cityRoute.fromSlug, route.cityRoute.toSlug)
    };
  }

  const pageSeo = seoByPage[route.page] || seoByPage[Page.CONVERTER]!;

  return {
    ...pageSeo,
    canonicalPath: route.normalizedPath
  };
};