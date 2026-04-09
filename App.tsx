import React, { useState, useEffect, ErrorInfo, ReactNode, Suspense, lazy } from 'react';
import { Page, GDPRSettings } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import AdUnit from './components/AdUnit';
import TimezoneConverter from './sections/TimezoneConverter';
import { getSeoData } from './lib/seo';
import {
  getLegacyRedirectPath,
  getRouteState,
  normalizePath,
  pageToPath
} from './lib/routing';

const Stopwatch = lazy(() => import('./sections/Stopwatch'));
const Timer = lazy(() => import('./sections/Timer'));
const Calendar = lazy(() => import('./sections/Calendar'));

const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;

  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }

  el.setAttribute('content', content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }

  el.setAttribute('href', href);
};

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('worldtimesuite Uncaught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-8 text-center font-['Helvetica']">
          <div>
            <h1 className="text-4xl font-black mb-4">Something went wrong.</h1>
            <p className="opacity-50 mb-8 uppercase tracking-widest text-sm">
              A synchronization error occurred.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 border-2 border-white rounded-full font-bold hover:bg-white hover:text-black transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface AppProps {
  initialPath?: string;
}

const loadingFallback = (
  <div className="flex items-center justify-center h-[400px] font-black uppercase tracking-widest opacity-20">
    Loading...
  </div>
);

const App: React.FC<AppProps> = ({ initialPath = '/' }) => {
  const initialRoute = getRouteState(typeof window === 'undefined' ? initialPath : window.location.pathname);

  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [routePath, setRoutePath] = useState<string>(initialRoute.normalizedPath);

  const routeState = getRouteState(routePath);
  const cityRoute = routeState.cityRoute;
  const timezoneRoute = routeState.timezoneRoute;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const redirectPath = getLegacyRedirectPath(window.location.pathname);
    if (!redirectPath) return;

    window.history.replaceState({}, '', redirectPath);
    const nextRoute = getRouteState(redirectPath);
    setCurrentPage(nextRoute.page);
    setRoutePath(nextRoute.normalizedPath);
  }, []);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';

    try {
      const saved = localStorage.getItem('chrono_theme');
      return (saved as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [gdpr, setGdpr] = useState<GDPRSettings>(() => {
    if (typeof window === 'undefined') {
      return { essential: true, analytics: false, marketing: false, consented: false };
    }

    try {
      const saved = localStorage.getItem('chrono_gdpr');
      return saved
        ? JSON.parse(saved)
        : { essential: true, analytics: false, marketing: false, consented: false };
    } catch {
      return { essential: true, analytics: false, marketing: false, consented: false };
    }
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    try {
      localStorage.setItem('chrono_theme', newTheme);
    } catch {}
  };

  const handleConsent = (settings: GDPRSettings) => {
    setGdpr(settings);

    try {
      localStorage.setItem('chrono_gdpr', JSON.stringify(settings));
    } catch {}
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, routePath]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const path = normalizePath(window.location.pathname);
    const targetPath = pageToPath[currentPage] || '/';

    // Don't override URL if we're already on a city or timezone route
    if (currentPage === Page.CONVERTER && (getRouteState(path).cityRoute || getRouteState(path).timezoneRoute)) return;

    if (path !== targetPath) {
      window.history.pushState({}, '', targetPath);
      setRoutePath(targetPath);
    }
  }, [currentPage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onPopState = () => {
      const redirectPath = getLegacyRedirectPath(window.location.pathname);

      if (redirectPath) {
        window.history.replaceState({}, '', redirectPath);
        const nextRoute = getRouteState(redirectPath);
        setCurrentPage(nextRoute.page);
        setRoutePath(nextRoute.normalizedPath);
        return;
      }

      const nextRoute = getRouteState(window.location.pathname);
      setCurrentPage(nextRoute.page);
      setRoutePath(nextRoute.normalizedPath);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const origin = window.location.origin || 'https://worldtimesuite.com';
    const seo = getSeoData(routeState);
    const canonicalUrl = `${origin}${seo.canonicalPath}`;

    document.title = seo.title;
    upsertMeta('name', 'description', seo.description);
    upsertMeta('property', 'og:title', seo.title);
    upsertMeta('property', 'og:description', seo.description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:title', seo.title);
    upsertMeta('name', 'twitter:description', seo.description);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertLink('canonical', canonicalUrl);
  }, [routeState]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';

  const renderPage = () => {
    const props = { isDark };

    switch (currentPage) {
      case Page.CONVERTER:
        return (
          <TimezoneConverter
            {...props}
            fromSlug={timezoneRoute?.fromSlug ?? cityRoute?.fromSlug}
            toSlug={timezoneRoute?.toSlug ?? cityRoute?.toSlug}
            isTimezoneCodeRoute={Boolean(timezoneRoute)}
          />
        );
      case Page.STOPWATCH:
        return <Stopwatch {...props} />;
      case Page.TIMER:
        return <Timer {...props} />;
      case Page.CALENDAR:
        return <Calendar {...props} />;
      default:
        return <TimezoneConverter {...props} />;
    }
  };

  const isFullView = currentPage === Page.STOPWATCH || currentPage === Page.TIMER;
  const isCalendar = currentPage === Page.CALENDAR;
  const isConverter = currentPage === Page.CONVERTER;

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col ${bgColor} ${textColor} transition-colors duration-300 font-['Helvetica Neue',Helvetica,sans-serif] relative`}>
        <div className="apple-ribbon fixed top-0 opacity-50" />

        <Header
          currentPage={currentPage}
          onNavigate={(page: Page) => {
            setCurrentPage(page);
            if (page !== Page.CONVERTER) {
              setRoutePath(pageToPath[page] || '/');
            } else {
              setRoutePath('/');
            }
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {isFullView ? (
          <main className="flex-grow pt-16 flex flex-col overflow-y-auto relative">
            <Suspense fallback={loadingFallback}>
              {renderPage()}
            </Suspense>
          </main>
        ) : (
          <main className={`flex-grow pt-24 pb-12 w-full mx-auto relative ${isCalendar ? 'max-w-none px-0' : 'max-w-7xl px-2 md:px-4'}`}>
            <div className="mb-8 flex justify-center">
              <AdUnit id="top-leaderboard" type="leaderboard" className="border-none" isDark={isDark} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {!isCalendar && !isConverter && (
                <aside className="hidden lg:block lg:col-span-2">
                  <AdUnit id="left-sidebar" type="sidebar" className="border-none" isDark={isDark} />
                </aside>
              )}

              <div className={`${isCalendar ? 'lg:col-span-12' : isConverter ? 'lg:col-span-9' : 'lg:col-span-7'} ${bgColor} min-h-[800px] overflow-hidden relative border-zinc-800/10 dark:border-zinc-200/10 transition-all duration-500`}>
                <Suspense fallback={loadingFallback}>
                  {renderPage()}
                </Suspense>
              </div>

              {!isCalendar && (
                <aside className="hidden lg:block lg:col-span-3 flex justify-center">
                  <div className={`${isConverter ? 'top-80' : 'top-48'} sticky`}>
                    <AdUnit
                      id="right-sidebar"
                      type={isConverter ? 'skyscraper' : 'sidebar'}
                      className="border-none"
                      isDark={isDark}
                    />
                  </div>
                </aside>
              )}
            </div>

            <div className={`mt-8 flex justify-center ${isCalendar ? 'px-8' : ''}`}>
              <AdUnit id="footer-leaderboard" type="footer" className="border-none" isDark={isDark} />
            </div>
          </main>
        )}

        {!isFullView && <Footer theme={theme} />}
        {!gdpr.consented && !isFullView && <CookieConsent onAccept={handleConsent} />}
      </div>
    </ErrorBoundary>
  );
};

export default App;