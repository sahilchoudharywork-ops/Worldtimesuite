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
    title: 'Timezone Converter | WorldTimeSuite',
    description: 'Convert time between cities worldwide with WorldTimeSuite. Check live time differences, current local time, and meeting-friendly hours instantly.'
  },
  [Page.STOPWATCH]: {
    title: 'Online Stopwatch | Free Stopwatch Timer | WorldTimeSuite',
    description: 'Use a free online stopwatch with lap tracking and precise timing on WorldTimeSuite.'
  },
  [Page.TIMER]: {
    title: 'Online Timer | Free Countdown Timer | WorldTimeSuite',
    description: 'Use a free online countdown timer with WorldTimeSuite. Set timers quickly and track time accurately.'
  },
  [Page.CALENDAR]: {
    title: 'Time Zone Calendar | WorldTimeSuite',
    description: 'View and compare time across cities with the WorldTimeSuite calendar and time zone planning tools.'
  },
  [Page.SETTINGS]: {
    title: 'Settings | WorldTimeSuite',
    description: 'Manage your WorldTimeSuite preferences.'
  }
};

export const getSeoData = (route: AppRouteState): SeoData => {
  if (route.cityRoute) {
    const fromName = titleCase(route.cityRoute.fromSlug);
    const toName = titleCase(route.cityRoute.toSlug);

    return {
      title: `${fromName} to ${toName} Time Converter | WorldTimeSuite`,
      description: `Convert time from ${fromName} to ${toName} instantly. Check the live time difference, current local time, and meeting-friendly hours with WorldTimeSuite.`,
      canonicalPath: toShortCityPath(route.cityRoute.fromSlug, route.cityRoute.toSlug)
    };
  }

  const pageSeo = seoByPage[route.page] || seoByPage[Page.CONVERTER]!;

  return {
    ...pageSeo,
    canonicalPath: route.normalizedPath
  };
};
