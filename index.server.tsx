import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { getRouteState } from './lib/routing';
import { getSeoData } from './lib/seo';

export const renderPage = (path: string) => {
  const route = getRouteState(path);
  const seo = getSeoData(route);
  const appHtml = renderToString(<App initialPath={path} />);

  return {
    appHtml,
    seo
  };
};
