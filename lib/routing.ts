import { Page } from '../types';
import { TIMEZONE_BY_SLUG, TIMEZONE_SLUGS } from '../data/timezones';

export interface CityRoute {
  fromSlug: string;
  toSlug: string;
}

export interface TimezoneRoute {
  fromSlug: string;  // e.g. "est"
  toSlug: string;    // e.g. "ist"
}

export interface AppRouteState {
  page: Page;
  normalizedPath: string;
  cityRoute: CityRoute | null;
  timezoneRoute: TimezoneRoute | null;
}

export const normalizePath = (path: string) => {
  if (!path) return '/';
  const clean = path.replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
};

// Detects timezone code routes like /est-to-ist
// Both slugs must be known timezone codes — this prevents city routes like /london-to-new-york matching
export const parseTimezoneRoute = (path: string): TimezoneRoute | null => {
  const clean = normalizePath(path);
  const match = clean.match(/^\/([a-z0-9]+)-to-([a-z0-9]+)$/i);
  if (!match) return null;

  const fromSlug = match[1].toLowerCase();
  const toSlug = match[2].toLowerCase();

  if (TIMEZONE_SLUGS.has(fromSlug) && TIMEZONE_SLUGS.has(toSlug)) {
    return { fromSlug, toSlug };
  }
  return null;
};

// Detects city pair routes like /london-to-new-york
export const parseCityRoute = (path: string): CityRoute | null => {
  const clean = normalizePath(path);
  const match = clean.match(/^\/([a-z0-9-]+)-to-([a-z0-9-]+)$/i);
  if (!match) return null;
  return {
    fromSlug: match[1].toLowerCase(),
    toSlug: match[2].toLowerCase()
  };
};

export const toShortCityPath = (fromSlug: string, toSlug: string) => `/${fromSlug}-to-${toSlug}`;

export const getLegacyRedirectPath = (path: string): string | null => {
  const clean = normalizePath(path);
  if (clean === '/timezone') return '/';
  const match = clean.match(/^\/timezone\/([a-z0-9-]+)-to-([a-z0-9-]+)$/i);
  if (!match) return null;
  return `/${match[1].toLowerCase()}-to-${match[2].toLowerCase()}`;
};

export const pathToPage: Record<string, Page> = {
  '/': Page.CONVERTER,
  '/stopwatch': Page.STOPWATCH,
  '/timer': Page.TIMER,
  '/calendar': Page.CALENDAR,
  '/settings': Page.SETTINGS,
  '/about': Page.ABOUT,
  '/terms': Page.TERMS
};

export const pageToPath: Partial<Record<Page, string>> = {
  [Page.CONVERTER]: '/',
  [Page.STOPWATCH]: '/stopwatch',
  [Page.TIMER]: '/timer',
  [Page.CALENDAR]: '/calendar',
  [Page.SETTINGS]: '/settings',
  [Page.ABOUT]: '/about',
  [Page.TERMS]: '/terms'
};

export const getRouteState = (path: string): AppRouteState => {
  const normalizedPath = normalizePath(path);

  // Check timezone route FIRST — /est-to-ist must not fall through to city route
  const timezoneRoute = parseTimezoneRoute(normalizedPath);
  if (timezoneRoute) {
    return {
      page: Page.CONVERTER,
      normalizedPath,
      cityRoute: null,
      timezoneRoute
    };
  }

  // Then check city pair route — /london-to-new-york
  const cityRoute = parseCityRoute(normalizedPath);
  if (cityRoute) {
    return {
      page: Page.CONVERTER,
      normalizedPath: toShortCityPath(cityRoute.fromSlug, cityRoute.toSlug),
      cityRoute,
      timezoneRoute: null
    };
  }

  return {
    page: pathToPage[normalizedPath] || Page.CONVERTER,
    normalizedPath,
    cityRoute: null,
    timezoneRoute: null
  };
};

// Re-export for consumers that need timezone lookup
export { TIMEZONE_BY_SLUG };