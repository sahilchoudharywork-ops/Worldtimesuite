// import React, { Component, useState, useEffect, Suspense, ErrorInfo, ReactNode } from 'react';
// import { Page, GDPRSettings } from './types';
// import Header from './components/Header';
// import Footer from './components/Footer';
// import CookieConsent from './components/CookieConsent';
// import AdUnit from './components/AdUnit';
// import { cities } from "./data/cities";

// /* ---------------------------
//    URL ↔ Page Routing Helpers
// ----------------------------*/

// const normalizePath = (path: string) => {
//   if (!path) return '/timezone';
//   const clean = path.replace(/\/+$/, '');
//   return clean === '' ? '/timezone' : clean;
// };

// const pathToPage: Record<string, Page> = {
//   '/timezone': Page.CONVERTER,
//   '/stopwatch': Page.STOPWATCH,
//   '/timer': Page.TIMER,
//   '/calendar': Page.CALENDAR,
//   '/settings': Page.SETTINGS
// };

// const pageToPath: Record<Page, string> = {
//   [Page.CONVERTER]: '/timezone',
//   [Page.STOPWATCH]: '/stopwatch',
//   [Page.TIMER]: '/timer',
//   [Page.CALENDAR]: '/calendar',
//   [Page.SETTINGS]: '/settings'
// };

// /* ---------------------------
//    SEO CONFIG
// ----------------------------*/

// const seoByPage: Record<Page, { title: string; description: string; path: string; appName: string }> = {
//   [Page.CONVERTER]: {
//     title: 'Timezone Converter – Convert Time Between Cities | WorldTimeSuite',
//     description: 'Free timezone converter. Instantly convert time between cities worldwide with WorldTimeSuite.',
//     path: '/timezone',
//     appName: 'Timezone Converter'
//   },
//   [Page.STOPWATCH]: {
//     title: 'Online Stopwatch – Simple & Accurate Timer | WorldTimeSuite',
//     description: 'Free online stopwatch with millisecond precision. Track time instantly using WorldTimeSuite.',
//     path: '/stopwatch',
//     appName: 'Online Stopwatch'
//   },
//   [Page.TIMER]: {
//     title: 'Countdown Timer – Free Online Timer | WorldTimeSuite',
//     description: 'Free countdown timer online. Set alarms and track time easily with WorldTimeSuite.',
//     path: '/timer',
//     appName: 'Countdown Timer'
//   },
//   [Page.CALENDAR]: {
//     title: 'Global Calendar – Track Time Across Timezones | WorldTimeSuite',
//     description: 'Global calendar tool to visualize timezones across the world.',
//     path: '/calendar',
//     appName: 'Global Calendar'
//   },
//   [Page.SETTINGS]: {
//     title: 'Settings | WorldTimeSuite',
//     description: 'Manage your WorldTimeSuite preferences.',
//     path: '/settings',
//     appName: 'Settings'
//   }
// };

// /* ---------------------------
//    SEO Helpers
// ----------------------------*/

// const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
//   let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;

//   if (!el) {
//     el = document.createElement('meta');
//     el.setAttribute(attr, key);
//     document.head.appendChild(el);
//   }

//   el.setAttribute('content', content);
// };

// const upsertLink = (rel: string, href: string) => {
//   let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

//   if (!el) {
//     el = document.createElement('link');
//     el.setAttribute('rel', rel);
//     document.head.appendChild(el);
//   }

//   el.setAttribute('href', href);
// };

// /* ---------------------------
//    Error Boundary
// ----------------------------*/

// interface ErrorBoundaryProps {
//   children?: ReactNode;
// }

// interface ErrorBoundaryState {
//   hasError: boolean;
// }

// class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {

//   constructor(props: ErrorBoundaryProps) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(_: Error): ErrorBoundaryState {
//     return { hasError: true };
//   }

//   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
//     console.error("worldtimesuite Uncaught Error:", error, errorInfo);
//   }

//   render() {

//     if (this.state.hasError) {
//       return (
//         <div className="min-h-screen flex items-center justify-center bg-black text-white p-8 text-center font-['Helvetica']">
//           <div>
//             <h1 className="text-4xl font-black mb-4">Something went wrong.</h1>
//             <p className="opacity-50 mb-8 uppercase tracking-widest text-sm">
//               A synchronization error occurred.
//             </p>

//             <button
//               onClick={() => window.location.reload()}
//               className="px-8 py-3 border-2 border-white rounded-full font-bold hover:bg-white hover:text-black transition-all"
//             >
//               Reload Application
//             </button>
//           </div>
//         </div>
//       );
//     }

//     return this.props.children;
//   }
// }

// /* ---------------------------
//    Lazy Load Sections
// ----------------------------*/

// const TimezoneConverter = React.lazy(() => import('./sections/TimezoneConverter'));
// const Stopwatch = React.lazy(() => import('./sections/Stopwatch'));
// const Timer = React.lazy(() => import('./sections/Timer'));
// const Calendar = React.lazy(() => import('./sections/Calendar'));

// /* ---------------------------
//    Main App
// ----------------------------*/

// const App: React.FC = () => {

//   const [currentPage, setCurrentPage] = useState<Page>(() => {
//     if (typeof window === 'undefined') return Page.CONVERTER;
//     const path = normalizePath(window.location.pathname);
//     return pathToPage[path] || Page.CONVERTER;
//   });

//   const [theme, setTheme] = useState<'dark' | 'light'>(() => {
//     try {
//       const saved = localStorage.getItem('chrono_theme');
//       return (saved as 'dark' | 'light') || 'dark';
//     } catch {
//       return 'dark';
//     }
//   });

//   const [gdpr, setGdpr] = useState<GDPRSettings>(() => {
//     try {
//       const saved = localStorage.getItem('chrono_gdpr');
//       return saved
//         ? JSON.parse(saved)
//         : { essential: true, analytics: false, marketing: false, consented: false };
//     } catch {
//       return { essential: true, analytics: false, marketing: false, consented: false };
//     }
//   });

//   const toggleTheme = () => {
//     const newTheme = theme === 'dark' ? 'light' : 'dark';
//     setTheme(newTheme);

//     try {
//       localStorage.setItem('chrono_theme', newTheme);
//     } catch (e) {
//       console.warn("App: Failed to save theme", e);
//     }
//   };

//   const handleConsent = (settings: GDPRSettings) => {
//     setGdpr(settings);

//     try {
//       localStorage.setItem('chrono_gdpr', JSON.stringify(settings));
//     } catch (e) {
//       console.warn("App: Failed to save GDPR consent", e);
//     }
//   };

//   /* Scroll on page change */

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }, [currentPage]);

//   /* Update URL */

//   useEffect(() => {
//     const targetPath = pageToPath[currentPage] || '/timezone';
//     const currentPath = normalizePath(window.location.pathname);

//     if (currentPath !== targetPath) {
//       window.history.pushState({}, '', targetPath);
//     }
//   }, [currentPage]);

//   /* Browser navigation */

//   useEffect(() => {
//     const onPopState = () => {
//       const path = normalizePath(window.location.pathname);
//       setCurrentPage(pathToPage[path] || Page.CONVERTER);
//     };

//     window.addEventListener('popstate', onPopState);

//     return () => {
//       window.removeEventListener('popstate', onPopState);
//     };

//   }, []);

//   /* ---------------------------
//      SEO EFFECT
//   ----------------------------*/

//   useEffect(() => {

//     const seo = seoByPage[currentPage] || seoByPage[Page.CONVERTER];

//     const origin =
//       typeof window !== 'undefined'
//         ? window.location.origin
//         : 'https://worldtimesuite.com';

//     const canonicalUrl = `${origin}${seo.path}`;

//     document.title = seo.title;

//     upsertMeta('name', 'description', seo.description);
//     upsertLink('canonical', canonicalUrl);

//     upsertMeta('property', 'og:title', seo.title);
//     upsertMeta('property', 'og:description', seo.description);
//     upsertMeta('property', 'og:url', canonicalUrl);
//     upsertMeta('property', 'og:type', 'website');

//     upsertMeta('name', 'twitter:card', 'summary_large_image');
//     upsertMeta('name', 'twitter:title', seo.title);
//     upsertMeta('name', 'twitter:description', seo.description);

//     const schemaId = 'wts-page-schema';

//     const schema = {
//       '@context': 'https://schema.org',
//       '@type': 'SoftwareApplication',
//       name: seo.appName,
//       applicationCategory: 'UtilityApplication',
//       operatingSystem: 'Web',
//       url: canonicalUrl
//     };

//     let script = document.getElementById(schemaId) as HTMLScriptElement | null;

//     if (!script) {
//       script = document.createElement('script');
//       script.id = schemaId;
//       script.type = 'application/ld+json';
//       document.head.appendChild(script);
//     }

//     script.textContent = JSON.stringify(schema);

//   }, [currentPage]);

//   const isDark = theme === 'dark';
//   const bgColor = isDark ? 'bg-black' : 'bg-white';
//   const textColor = isDark ? 'text-white' : 'text-black';

//   const renderPage = () => {
//     const props = { isDark };

//     switch (currentPage) {
//       case Page.CONVERTER: return <TimezoneConverter {...props} />;
//       case Page.STOPWATCH: return <Stopwatch {...props} />;
//       case Page.TIMER: return <Timer {...props} />;
//       case Page.CALENDAR: return <Calendar {...props} />;
//       default: return <TimezoneConverter {...props} />;
//     }
//   };

//   const isFullView = currentPage === Page.STOPWATCH || currentPage === Page.TIMER;
//   const isCalendar = currentPage === Page.CALENDAR;
//   const isConverter = currentPage === Page.CONVERTER;

//   return (
//     <ErrorBoundary>

//       <div className={`min-h-screen flex flex-col ${bgColor} ${textColor} transition-colors duration-300 font-['Helvetica Neue',Helvetica,sans-serif] relative`}>

//         <div className="apple-ribbon fixed top-0 opacity-50" />

//         <Header
//           currentPage={currentPage}
//           onNavigate={setCurrentPage}
//           theme={theme}
//           onToggleTheme={toggleTheme}
//         />

//         {isFullView ? (
//           <main className="flex-grow pt-16 flex flex-col overflow-y-auto relative">
//             <Suspense fallback={null}>
//               {renderPage()}
//             </Suspense>
//           </main>
//         ) : (
//           <main className={`flex-grow pt-24 pb-12 w-full mx-auto relative ${isCalendar ? 'max-w-none px-0' : 'max-w-7xl px-2 md:px-4'}`}>

//             <div className="mb-8 flex justify-center">
//               <AdUnit id="top-leaderboard" type="leaderboard" className="border-none" isDark={isDark} />
//             </div>

//             <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

//               {!isCalendar && !isConverter && (
//                 <aside className="hidden lg:block lg:col-span-2">
//                   <AdUnit id="left-sidebar" type="sidebar" className="border-none" isDark={isDark} />
//                 </aside>
//               )}

//               <div className={`${isCalendar ? 'lg:col-span-12' : isConverter ? 'lg:col-span-9' : 'lg:col-span-7'} ${bgColor} min-h-[800px] overflow-hidden relative`}>

//                 <Suspense fallback={<div className="flex items-center justify-center h-[400px] font-black uppercase tracking-widest opacity-20">Syncing...</div>}>
//                   {renderPage()}
//                 </Suspense>

//               </div>

//               {!isCalendar && (
//                 <aside className="hidden lg:block lg:col-span-3 flex justify-center">
//                   <div className={`${isConverter ? 'top-80' : 'top-48'} sticky`}>
//                     <AdUnit
//                       id="right-sidebar"
//                       type={isConverter ? 'skyscraper' : 'sidebar'}
//                       className="border-none"
//                       isDark={isDark}
//                     />
//                   </div>
//                 </aside>
//               )}

//             </div>

//             <div className={`mt-8 flex justify-center ${isCalendar ? 'px-8' : ''}`}>
//               <AdUnit id="footer-leaderboard" type="footer" className="border-none" isDark={isDark} />
//             </div>

//           </main>
//         )}

//         {!isFullView && <Footer theme={theme} />}

//         {!gdpr.consented && !isFullView && (
//           <CookieConsent onAccept={handleConsent} />
//         )}

//       </div>

//     </ErrorBoundary>
//   );
// };

// export default App;
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// TEST CODE 2


// import React, { Component, useState, useEffect, Suspense, ErrorInfo, ReactNode } from 'react';
// import { Page, GDPRSettings } from './types';
// import Header from './components/Header';
// import Footer from './components/Footer';
// import CookieConsent from './components/CookieConsent';
// import AdUnit from './components/AdUnit';

// /* ---------------------------
//    URL ↔ Page Routing Helpers
// ----------------------------*/

// const normalizePath = (path: string) => {
//   if (!path) return '/timezone';
//   const clean = path.replace(/\/+$/, '');
//   return clean === '' ? '/timezone' : clean;
// };

// /* Dynamic City Route Parser */

// const parseCityRoute = (path: string) => {
//   const match = path.match(/^\/timezone\/([a-z0-9-]+)-to-([a-z0-9-]+)$/i);
//   if (!match) return null;

//   return {
//     fromSlug: match[1].toLowerCase(),
//     toSlug: match[2].toLowerCase()
//   };
// };

// const pathToPage: Record<string, Page> = {
//   '/timezone': Page.CONVERTER,
//   '/stopwatch': Page.STOPWATCH,
//   '/timer': Page.TIMER,
//   '/calendar': Page.CALENDAR,
//   '/settings': Page.SETTINGS
// };

// const pageToPath: Record<Page, string> = {
//   [Page.CONVERTER]: '/timezone',
//   [Page.STOPWATCH]: '/stopwatch',
//   [Page.TIMER]: '/timer',
//   [Page.CALENDAR]: '/calendar',
//   [Page.SETTINGS]: '/settings'
// };

// /* ---------------------------
//    SEO CONFIG
// ----------------------------*/

// const seoByPage: Record<Page, { title: string; description: string; path: string; appName: string }> = {
//   [Page.CONVERTER]: {
//     title: 'Timezone Converter – Convert Time Between Cities | WorldTimeSuite',
//     description: 'Free timezone converter. Instantly convert time between cities worldwide with WorldTimeSuite.',
//     path: '/timezone',
//     appName: 'Timezone Converter'
//   },
//   [Page.STOPWATCH]: {
//     title: 'Online Stopwatch – Simple & Accurate Timer | WorldTimeSuite',
//     description: 'Free online stopwatch with millisecond precision. Track time instantly using WorldTimeSuite.',
//     path: '/stopwatch',
//     appName: 'Online Stopwatch'
//   },
//   [Page.TIMER]: {
//     title: 'Countdown Timer – Free Online Timer | WorldTimeSuite',
//     description: 'Free countdown timer online. Set alarms and track time easily with WorldTimeSuite.',
//     path: '/timer',
//     appName: 'Countdown Timer'
//   },
//   [Page.CALENDAR]: {
//     title: 'Global Calendar – Track Time Across Timezones | WorldTimeSuite',
//     description: 'Global calendar tool to visualize timezones across the world.',
//     path: '/calendar',
//     appName: 'Global Calendar'
//   },
//   [Page.SETTINGS]: {
//     title: 'Settings | WorldTimeSuite',
//     description: 'Manage your WorldTimeSuite preferences.',
//     path: '/settings',
//     appName: 'Settings'
//   }
// };

// /* ---------------------------
//    SEO Helpers
// ----------------------------*/

// const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
//   let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;

//   if (!el) {
//     el = document.createElement('meta');
//     el.setAttribute(attr, key);
//     document.head.appendChild(el);
//   }

//   el.setAttribute('content', content);
// };

// const upsertLink = (rel: string, href: string) => {
//   let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

//   if (!el) {
//     el = document.createElement('link');
//     el.setAttribute('rel', rel);
//     document.head.appendChild(el);
//   }

//   el.setAttribute('href', href);
// };

// /* ---------------------------
//    Error Boundary
// ----------------------------*/

// interface ErrorBoundaryProps {
//   children?: ReactNode;
// }

// interface ErrorBoundaryState {
//   hasError: boolean;
// }

// class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {

//   constructor(props: ErrorBoundaryProps) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(_: Error): ErrorBoundaryState {
//     return { hasError: true };
//   }

//   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
//     console.error("worldtimesuite Uncaught Error:", error, errorInfo);
//   }

//   render() {

//     if (this.state.hasError) {
//       return (
//         <div className="min-h-screen flex items-center justify-center bg-black text-white p-8 text-center font-['Helvetica']">
//           <div>
//             <h1 className="text-4xl font-black mb-4">Something went wrong.</h1>
//             <p className="opacity-50 mb-8 uppercase tracking-widest text-sm">
//               A synchronization error occurred.
//             </p>

//             <button
//               onClick={() => window.location.reload()}
//               className="px-8 py-3 border-2 border-white rounded-full font-bold hover:bg-white hover:text-black transition-all"
//             >
//               Reload Application
//             </button>
//           </div>
//         </div>
//       );
//     }

//     return this.props.children;
//   }
// }

// /* ---------------------------
//    Lazy Load Sections
// ----------------------------*/

// const TimezoneConverter = React.lazy(() => import('./sections/TimezoneConverter'));
// const Stopwatch = React.lazy(() => import('./sections/Stopwatch'));
// const Timer = React.lazy(() => import('./sections/Timer'));
// const Calendar = React.lazy(() => import('./sections/Calendar'));

// /* ---------------------------
//    Main App
// ----------------------------*/

// const App: React.FC = () => {

//   const [currentPage, setCurrentPage] = useState<Page>(() => {

//     if (typeof window === 'undefined') return Page.CONVERTER;

//     const path = normalizePath(window.location.pathname);

//     const cityMatch = parseCityRoute(path);
//     if (cityMatch) return Page.CONVERTER;

//     return pathToPage[path] || Page.CONVERTER;
//   });

//   const currentPath =
//     typeof window !== 'undefined'
//       ? normalizePath(window.location.pathname)
//       : '/timezone';

//   const cityRoute = parseCityRoute(currentPath);

//   const [theme, setTheme] = useState<'dark' | 'light'>(() => {
//     try {
//       const saved = localStorage.getItem('chrono_theme');
//       return (saved as 'dark' | 'light') || 'dark';
//     } catch {
//       return 'dark';
//     }
//   });

//   const [gdpr, setGdpr] = useState<GDPRSettings>(() => {
//     try {
//       const saved = localStorage.getItem('chrono_gdpr');
//       return saved
//         ? JSON.parse(saved)
//         : { essential: true, analytics: false, marketing: false, consented: false };
//     } catch {
//       return { essential: true, analytics: false, marketing: false, consented: false };
//     }
//   });

//   const toggleTheme = () => {
//     const newTheme = theme === 'dark' ? 'light' : 'dark';
//     setTheme(newTheme);

//     try {
//       localStorage.setItem('chrono_theme', newTheme);
//     } catch {}
//   };

//   const handleConsent = (settings: GDPRSettings) => {
//     setGdpr(settings);

//     try {
//       localStorage.setItem('chrono_gdpr', JSON.stringify(settings));
//     } catch {}
//   };

//   /* Scroll on page change */

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }, [currentPage]);

//   /* Update URL — dynamic routes safe */

//   useEffect(() => {

//     const currentPath = normalizePath(window.location.pathname);
//     const isDynamicCityRoute = !!parseCityRoute(currentPath);

//     if (currentPage === Page.CONVERTER && isDynamicCityRoute) {
//       return;
//     }

//     const targetPath = pageToPath[currentPage] || '/timezone';

//     if (currentPath !== targetPath) {
//       window.history.pushState({}, '', targetPath);
//     }

//   }, [currentPage]);

//   /* Browser navigation */

//   useEffect(() => {

//     const onPopState = () => {

//       const path = normalizePath(window.location.pathname);
//       const cityMatch = parseCityRoute(path);

//       if (cityMatch) {
//         setCurrentPage(Page.CONVERTER);
//         return;
//       }

//       setCurrentPage(pathToPage[path] || Page.CONVERTER);
//     };

//     window.addEventListener('popstate', onPopState);
//     return () => window.removeEventListener('popstate', onPopState);

//   }, []);

//   /* ---------------------------
//      SEO EFFECT
//   ----------------------------*/

//   useEffect(() => {

//     const seo = seoByPage[currentPage] || seoByPage[Page.CONVERTER];

//     const origin =
//       typeof window !== 'undefined'
//         ? window.location.origin
//         : 'https://worldtimesuite.com';

//     const canonicalUrl = `${origin}${normalizePath(window.location.pathname)}`;

//     if (currentPage === Page.CONVERTER && cityRoute) {

//       const fromName = cityRoute.fromSlug.replace(/-/g, ' ');
//       const toName = cityRoute.toSlug.replace(/-/g, ' ');

//       const dynamicTitle = `Timezone Converter – ${fromName} to ${toName} | WorldTimeSuite`;
//       const dynamicDesc = `Convert time from ${fromName} to ${toName} instantly with WorldTimeSuite.`;

//       document.title = dynamicTitle;

//       upsertMeta('name', 'description', dynamicDesc);
//       upsertMeta('property', 'og:title', dynamicTitle);
//       upsertMeta('property', 'og:description', dynamicDesc);
//       upsertMeta('name', 'twitter:title', dynamicTitle);
//       upsertMeta('name', 'twitter:description', dynamicDesc);

//     } else {

//       document.title = seo.title;

//       upsertMeta('name', 'description', seo.description);
//       upsertMeta('property', 'og:title', seo.title);
//       upsertMeta('property', 'og:description', seo.description);
//       upsertMeta('name', 'twitter:title', seo.title);
//       upsertMeta('name', 'twitter:description', seo.description);

//     }

//     upsertLink('canonical', canonicalUrl);

//   }, [currentPage, cityRoute]);

//   const isDark = theme === 'dark';
//   const bgColor = isDark ? 'bg-black' : 'bg-white';
//   const textColor = isDark ? 'text-white' : 'text-black';

//   const renderPage = () => {

//     const props = { isDark };

//     switch (currentPage) {

//       case Page.CONVERTER:
//         return (
//           <TimezoneConverter
//             {...props}
//             fromSlug={cityRoute?.fromSlug}
//             toSlug={cityRoute?.toSlug}
//           />
//         );

//       case Page.STOPWATCH:
//         return <Stopwatch {...props} />;

//       case Page.TIMER:
//         return <Timer {...props} />;

//       case Page.CALENDAR:
//         return <Calendar {...props} />;

//       default:
//         return <TimezoneConverter {...props} />;
//     }
//   };

//   const isFullView = currentPage === Page.STOPWATCH || currentPage === Page.TIMER;

//   return (
//     <ErrorBoundary>

//       <div className={`min-h-screen flex flex-col ${bgColor} ${textColor}`}>

//         <Header
//           currentPage={currentPage}
//           onNavigate={setCurrentPage}
//           theme={theme}
//           onToggleTheme={toggleTheme}
//         />

//         <main className="flex-grow">
//           <Suspense fallback={null}>
//             {renderPage()}
//           </Suspense>
//         </main>

//         {!isFullView && <Footer theme={theme} />}

//         {!gdpr.consented && !isFullView && (
//           <CookieConsent onAccept={handleConsent} />
//         )}

//       </div>

//     </ErrorBoundary>
//   );
// };

// export default App;
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// TESTING CODE 3
//

import React, { useState, useEffect, Suspense, ErrorInfo, ReactNode } from 'react';
import { Page, GDPRSettings } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import AdUnit from './components/AdUnit';

/* ---------------------------
   URL ↔ Page Routing Helpers
----------------------------*/

const normalizePath = (path: string) => {
  if (!path) return '/timezone';
  const clean = path.replace(/\/+$/, '');
  return clean === '' ? '/timezone' : clean;
};

const parseCityRoute = (path: string) => {
  const match = path.match(/^\/timezone\/([a-z0-9-]+)-to-([a-z0-9-]+)$/i);
  if (!match) return null;

  return {
    fromSlug: match[1].toLowerCase(),
    toSlug: match[2].toLowerCase()
  };
};

const pathToPage: Record<string, Page> = {
  '/timezone': Page.CONVERTER,
  '/stopwatch': Page.STOPWATCH,
  '/timer': Page.TIMER,
  '/calendar': Page.CALENDAR,
  '/settings': Page.SETTINGS
};

const pageToPath: Record<Page, string> = {
  [Page.CONVERTER]: '/timezone',
  [Page.STOPWATCH]: '/stopwatch',
  [Page.TIMER]: '/timer',
  [Page.CALENDAR]: '/calendar',
  [Page.SETTINGS]: '/settings'
};

/* ---------------------------
   SEO CONFIG
----------------------------*/

const seoByPage: Record<Page, { title: string; description: string; path: string; appName: string }> = {
  [Page.CONVERTER]: {
    title: 'Timezone Converter – Convert Time Between Cities | WorldTimeSuite',
    description: 'Free timezone converter. Instantly convert time between cities worldwide with WorldTimeSuite.',
    path: '/timezone',
    appName: 'Timezone Converter'
  },
  [Page.STOPWATCH]: {
    title: 'Online Stopwatch – Simple & Accurate Timer | WorldTimeSuite',
    description: 'Free online stopwatch with millisecond precision. Track time instantly using WorldTimeSuite.',
    path: '/stopwatch',
    appName: 'Online Stopwatch'
  },
  [Page.TIMER]: {
    title: 'Countdown Timer – Free Online Timer | WorldTimeSuite',
    description: 'Free countdown timer online. Set alarms and track time easily with WorldTimeSuite.',
    path: '/timer',
    appName: 'Countdown Timer'
  },
  [Page.CALENDAR]: {
    title: 'Global Calendar – Track Time Across Timezones | WorldTimeSuite',
    description: 'Global calendar tool to visualize timezones across the world.',
    path: '/calendar',
    appName: 'Global Calendar'
  },
  [Page.SETTINGS]: {
    title: 'Settings | WorldTimeSuite',
    description: 'Manage your WorldTimeSuite preferences.',
    path: '/settings',
    appName: 'Settings'
  }
};

/* ---------------------------
   SEO Helpers
----------------------------*/

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

/* ---------------------------
   Error Boundary
----------------------------*/

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

/* ---------------------------
   Lazy Load Sections
----------------------------*/

const TimezoneConverter = React.lazy(() => import('./sections/TimezoneConverter'));
const Stopwatch = React.lazy(() => import('./sections/Stopwatch'));
const Timer = React.lazy(() => import('./sections/Timer'));
const Calendar = React.lazy(() => import('./sections/Calendar'));

/* ---------------------------
   Main App
----------------------------*/

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window === 'undefined') return Page.CONVERTER;

    const path = normalizePath(window.location.pathname);
    const cityMatch = parseCityRoute(path);
    if (cityMatch) return Page.CONVERTER;

    return pathToPage[path] || Page.CONVERTER;
  });

  const currentPath =
    typeof window !== 'undefined' ? normalizePath(window.location.pathname) : '/timezone';

  const cityRoute = parseCityRoute(currentPath);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('chrono_theme');
      return (saved as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [gdpr, setGdpr] = useState<GDPRSettings>(() => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    const path = normalizePath(window.location.pathname);
    const isDynamicCityRoute = !!parseCityRoute(path);

    if (currentPage === Page.CONVERTER && isDynamicCityRoute) return;

    const targetPath = pageToPath[currentPage] || '/timezone';
    if (path !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, [currentPage]);

  useEffect(() => {
    const onPopState = () => {
      const path = normalizePath(window.location.pathname);
      const cityMatch = parseCityRoute(path);

      if (cityMatch) {
        setCurrentPage(Page.CONVERTER);
        return;
      }

      setCurrentPage(pathToPage[path] || Page.CONVERTER);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const seo = seoByPage[currentPage] || seoByPage[Page.CONVERTER];

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://worldtimesuite.com';
    const canonicalUrl = `${origin}${normalizePath(window.location.pathname)}`;

    if (currentPage === Page.CONVERTER && cityRoute) {
      const fromName = cityRoute.fromSlug.replace(/-/g, ' ');
      const toName = cityRoute.toSlug.replace(/-/g, ' ');

      const dynamicTitle = `Timezone Converter – ${fromName} to ${toName} | WorldTimeSuite`;
      const dynamicDesc = `Convert time from ${fromName} to ${toName} instantly with WorldTimeSuite.`;

      document.title = dynamicTitle;
      upsertMeta('name', 'description', dynamicDesc);
      upsertMeta('property', 'og:title', dynamicTitle);
      upsertMeta('property', 'og:description', dynamicDesc);
      upsertMeta('name', 'twitter:title', dynamicTitle);
      upsertMeta('name', 'twitter:description', dynamicDesc);
    } else {
      document.title = seo.title;
      upsertMeta('name', 'description', seo.description);
      upsertMeta('property', 'og:title', seo.title);
      upsertMeta('property', 'og:description', seo.description);
      upsertMeta('name', 'twitter:title', seo.title);
      upsertMeta('name', 'twitter:description', seo.description);
    }

    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertLink('canonical', canonicalUrl);
  }, [currentPage, cityRoute]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';

  const renderPage = () => {
    const props = { isDark };

    switch (currentPage) {
      case Page.CONVERTER:
        return <TimezoneConverter {...props} fromSlug={cityRoute?.fromSlug} toSlug={cityRoute?.toSlug} />;
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
          onNavigate={setCurrentPage}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {isFullView ? (
          <main className="flex-grow pt-16 flex flex-col overflow-y-auto relative">
            <Suspense fallback={null}>
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
                <Suspense fallback={<div className="flex items-center justify-center h-[400px] font-black uppercase tracking-widest opacity-20">Syncing...</div>}>
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
