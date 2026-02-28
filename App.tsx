import React, { Component, useState, useEffect, Suspense, ErrorInfo, ReactNode } from 'react';
import { Page, GDPRSettings } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import AdUnit from './components/AdUnit';

// Error Boundary for catching uncaught rendering errors
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

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("worldtimesuite Uncaught Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-8 text-center font-['Helvetica']">
          <div>
            <h1 className="text-4xl font-black mb-4">Something went wrong.</h1>
            <p className="opacity-50 mb-8 uppercase tracking-widest text-sm">A synchronization error occurred.</p>
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

// Lazy loading sections
const TimezoneConverter = React.lazy(() => import('./sections/TimezoneConverter'));
const Stopwatch = React.lazy(() => import('./sections/Stopwatch'));
const Timer = React.lazy(() => import('./sections/Timer'));
const Calendar = React.lazy(() => import('./sections/Calendar'));

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.CONVERTER);
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
      return saved ? JSON.parse(saved) : { essential: true, analytics: false, marketing: false, consented: false };
    } catch {
      return { essential: true, analytics: false, marketing: false, consented: false };
    }
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      localStorage.setItem('chrono_theme', newTheme);
    } catch (e) {
      console.warn("App: Failed to save theme", e);
    }
  };

  const handleConsent = (settings: GDPRSettings) => {
    setGdpr(settings);
    try {
      localStorage.setItem('chrono_gdpr', JSON.stringify(settings));
    } catch (e) {
      console.warn("App: Failed to save GDPR consent", e);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';

  const renderPage = () => {
    const props = { isDark };
    switch (currentPage) {
      case Page.CONVERTER: return <TimezoneConverter {...props} />;
      case Page.STOPWATCH: return <Stopwatch {...props} />;
      case Page.TIMER: return <Timer {...props} />;
      case Page.CALENDAR: return <Calendar {...props} />;
      default: return <TimezoneConverter {...props} />;
    }
  };

  const isFullView = currentPage === Page.STOPWATCH || currentPage === Page.TIMER;
  const isCalendar = currentPage === Page.CALENDAR;
  const isConverter = currentPage === Page.CONVERTER;

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col ${bgColor} ${textColor} transition-colors duration-300 font-['Helvetica Neue',Helvetica,sans-serif] relative`}>
        {/* Animated Top Ribbon */}
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
            {/* Top Ad */}
            <div className="mb-8 flex justify-center">
              <AdUnit id="top-leaderboard" type="leaderboard" className="border-none" isDark={isDark} />
            </div>

            <div className={`grid grid-cols-1 gap-4 ${isCalendar ? 'lg:grid-cols-12' : 'lg:grid-cols-12'}`}>
              {/* Left Sidebar Ad - Only visible when not on Calendar or Converter */}
              {!isCalendar && !isConverter && (
                <aside className="hidden lg:block lg:col-span-2">
                  <AdUnit id="left-sidebar" type="sidebar" className="border-none" isDark={isDark} />
                </aside>
              )}

              {/* Main Content Area - Expands when sidebars are hidden */}
              <div className={`${
                isCalendar ? 'lg:col-span-12' : 
                isConverter ? 'lg:col-span-9' : 
                'lg:col-span-7'
              } ${bgColor} min-h-[800px] overflow-hidden relative border-zinc-800/10 dark:border-zinc-200/10 transition-all duration-500`}>
                <Suspense fallback={<div className="flex items-center justify-center h-[400px] font-black uppercase tracking-widest opacity-20">Syncing...</div>}>
                  {renderPage()}
                </Suspense>
              </div>

              {/* Right Sidebar Ad */}
              {!isCalendar && (
                <aside className={`hidden lg:block ${isConverter ? 'lg:col-span-3' : 'lg:col-span-3'} flex justify-center`}>
                  <div className={`sticky ${isConverter ? 'top-80' : 'top-48'}`}>
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

            {/* Bottom Ad */}
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