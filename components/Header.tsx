
// import React from 'react';
// import { Page } from '../types';

// interface HeaderProps {
//   currentPage: Page;
//   onNavigate: (page: Page) => void;
//   theme: 'dark' | 'light';
//   onToggleTheme: () => void;
// }

// const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, theme, onToggleTheme }) => {
//   const isDark = theme === 'dark';
  
//   const navItems = [
//     { id: Page.CONVERTER, label: 'Timezone Converter' },
//     { id: Page.STOPWATCH, label: 'Stopwatch' },
//     { id: Page.TIMER, label: 'Timer' },
//     { id: Page.CALENDAR, label: 'Calendar' },
//   ];

//   return (
//     <header className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
//       isDark ? 'bg-black/90 border-zinc-800' : 'bg-white/90 border-zinc-200'
//     }`}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
//         <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(Page.CONVERTER)}>
//           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border transition-colors ${
//             isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
//           }`}>W</div>
//           <span className={`text-xl font-bold tracking-tight hidden sm:inline transition-colors ${
//             isDark ? 'text-white' : 'text-black'
//           }`}>worldtimesuite</span>
//         </div>

//         <nav className="flex items-center gap-1 sm:gap-4">
//           {navItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => onNavigate(item.id)}
//               className={`px-3 py-2 rounded-full text-sm font-bold transition-all ${
//                 currentPage === item.id 
//                   ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
//                   : (isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black')
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </nav>

//         <div className="flex items-center gap-2 md:gap-4">
//           <button 
//             onClick={onToggleTheme}
//             className={`p-2 rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
//               isDark ? 'text-white' : 'text-black'
//             }`}
//             title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
//           >
//             {isDark ? (
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
//               </svg>
//             ) : (
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
//               </svg>
//             )}
//           </button>
//           <button className={`transition-colors hidden md:block ${isDark ? 'text-white' : 'text-black'}`}>
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, theme, onToggleTheme }) => {
  const isDark = theme === 'dark';

  const navItems = [
    { id: Page.CONVERTER, label: 'Time Zone Converter' },
    { id: Page.STOPWATCH, label: 'Stopwatch' },
    { id: Page.TIMER, label: 'Timer' },
    { id: Page.CALENDAR, label: 'Calendar' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
        isDark ? 'bg-black/90 border-zinc-800' : 'bg-white/90 border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          type="button"
          aria-label="Go to time zone converter homepage"
          onClick={() => onNavigate(Page.CONVERTER)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border transition-colors ${
              isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
            }`}
          >
            W
          </div>
          <span
            className={`text-xl font-bold tracking-tight hidden sm:inline transition-colors ${
              isDark ? 'text-white' : 'text-black'
            }`}
          >
            worldtimesuite
          </span>
        </button>

        <nav className="flex items-center gap-1 sm:gap-4" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={currentPage === item.id ? 'page' : undefined}
              className={`px-3 py-2 rounded-full text-sm font-bold transition-all ${
                currentPage === item.id
                  ? isDark
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : isDark
                    ? 'text-zinc-300 hover:text-white'
                    : 'text-zinc-600 hover:text-black'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`p-2 rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              isDark ? 'text-white' : 'text-black'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            aria-label="Open settings"
            className={`transition-colors hidden md:block ${isDark ? 'text-white' : 'text-black'}`}
          >
            <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
