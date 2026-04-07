import { Page } from '../types';
import { AppRouteState, toShortCityPath } from './routing';

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
    title: 'Timezone Converter – Convert Time Between Any Two Cities | WorldTimeSuite',
    description: 'Free timezone converter for 500+ cities worldwide. Instantly see the time difference between any two cities, find meeting-friendly hours, and plan across time zones.'
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



// //
// //
// //
// //
// //

//     const seoByPage: Partial<Record<Page, Omit<SeoData, 'canonicalPath'>>> = {
//   [Page.CONVERTER]: {
//     title: 'Timezone Converter | WorldTimeSuite',
//     description: 'Convert time between cities worldwide with WorldTimeSuite. Check live time differences, current local time, and meeting-friendly hours instantly.'
//   },
//   [Page.STOPWATCH]: {
//     title: 'Online Stopwatch | Free Stopwatch Timer | WorldTimeSuite',
//     description: 'Use a free online stopwatch with lap tracking and precise timing on WorldTimeSuite.'
//   },
//   [Page.TIMER]: {
//     title: 'Online Timer | Free Countdown Timer | WorldTimeSuite',
//     description: 'Use a free online countdown timer with WorldTimeSuite. Set timers quickly and track time accurately.'
//   },
//   [Page.CALENDAR]: {
//     title: 'Time Zone Calendar | WorldTimeSuite',
//     description: 'View and compare time across cities with the WorldTimeSuite calendar and time zone planning tools.'
//   },
//   [Page.SETTINGS]: {
//     title: 'Settings | WorldTimeSuite',
//     description: 'Manage your WorldTimeSuite preferences.'
//   }
// };

export const getSeoData = (route: AppRouteState): SeoData => {
  if (route.cityRoute) {
    const fromName = titleCase(route.cityRoute.fromSlug);
    const toName = titleCase(route.cityRoute.toSlug);

    return {
      title: `${fromName} to ${toName} Time Converter | Current Time & Difference`,
      description: `What time is it in ${toName} when it's a given time in ${fromName}? Convert time between ${fromName} and ${toName} instantly. See the exact time difference and best hours to schedule meetings.`,
      // description: `Convert time from ${fromName} to ${toName} instantly. Check the live time difference, current local time, and meeting-friendly hours with WorldTimeSuite.`,
      canonicalPath: toShortCityPath(route.cityRoute.fromSlug, route.cityRoute.toSlug)
    };
  }

  const pageSeo = seoByPage[route.page] || seoByPage[Page.CONVERTER]!;

  return {
    ...pageSeo,
    canonicalPath: route.normalizedPath
  };
};
