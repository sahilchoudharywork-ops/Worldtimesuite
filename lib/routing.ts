import { Page } from '../types';

export interface CityRoute {
  fromSlug: string;
  toSlug: string;
}

export interface AppRouteState {
  page: Page;
  normalizedPath: string;
  cityRoute: CityRoute | null;
}

export const normalizePath = (path: string) => {
  if (!path) return '/';
  const clean = path.replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
};

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
  '/settings': Page.SETTINGS
};

export const pageToPath: Partial<Record<Page, string>> = {
  [Page.CONVERTER]: '/',
  [Page.STOPWATCH]: '/stopwatch',
  [Page.TIMER]: '/timer',
  [Page.CALENDAR]: '/calendar',
  [Page.SETTINGS]: '/settings'
};

export const getRouteState = (path: string): AppRouteState => {
  const normalizedPath = normalizePath(path);
  const cityRoute = parseCityRoute(normalizedPath);

  if (cityRoute) {
    return {
      page: Page.CONVERTER,
      normalizedPath: toShortCityPath(cityRoute.fromSlug, cityRoute.toSlug),
      cityRoute
    };
  }

  return {
    page: pathToPage[normalizedPath] || Page.CONVERTER,
    normalizedPath,
    cityRoute: null
  };
};
