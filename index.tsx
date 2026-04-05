import './index.css';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';

const normalizePath = (path: string) => {
  if (!path) return '/';
  const clean = path.replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
};

const getLegacyRedirectPath = (path: string): string | null => {
  const clean = normalizePath(path);

  if (clean === '/timezone') return '/';

  const match = clean.match(/^\/timezone\/([a-z0-9-]+)-to-([a-z0-9-]+)$/i);
  if (!match) return null;

  return `/${match[1].toLowerCase()}-to-${match[2].toLowerCase()}`;
};

const redirectPath = getLegacyRedirectPath(window.location.pathname);

if (redirectPath && redirectPath !== window.location.pathname) {
  window.history.replaceState({}, '', redirectPath);
}

hydrateRoot(
  document.getElementById('root')!,
  <App initialPath={redirectPath || window.location.pathname} />
);
