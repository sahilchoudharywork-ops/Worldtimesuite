import { Page } from '../types';
import { AppRouteState, toShortCityPath } from './routing';
import { TIMEZONE_BY_SLUG } from '../data/timezones';

export interface SeoData {
  title: string;
  description: string;
  canonicalPath: string;
}

const titleCase = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

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
  }
};

export const getSeoData = (route: AppRouteState): SeoData => {

  // Timezone code pages e.g. /est-to-ist
  if (route.timezoneRoute) {
    const from = TIMEZONE_BY_SLUG[route.timezoneRoute.fromSlug];
    const to = TIMEZONE_BY_SLUG[route.timezoneRoute.toSlug];
    if (from && to) {
      return {
        title: `${from.code} to ${to.code} Converter – ${from.name} to ${to.name} | WorldTimeSuite`,
        description: `Convert ${from.code} to ${to.code} instantly. See the exact time difference between ${from.name} and ${to.name}, find the best meeting hours, and plan across time zones.`,
        canonicalPath: `/${from.slug}-to-${to.slug}`
      };
    }
  }

  // City pair pages e.g. /london-to-new-york
  if (route.cityRoute) {
    const fromName = titleCase(route.cityRoute.fromSlug);
    const toName = titleCase(route.cityRoute.toSlug);
    return {
      title: `${fromName} to ${toName} Time Converter | Current Time & Difference`,
      description: `What time is it in ${toName} when it's a given time in ${fromName}? Convert time between ${fromName} and ${toName} instantly. See the exact time difference and best hours to schedule meetings.`,
      canonicalPath: toShortCityPath(route.cityRoute.fromSlug, route.cityRoute.toSlug)
    };
  }

  const pageSeo = seoByPage[route.page] || seoByPage[Page.CONVERTER]!;
  return {
    ...pageSeo,
    canonicalPath: route.normalizedPath
  };
};