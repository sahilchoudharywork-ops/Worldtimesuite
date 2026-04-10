import React from 'react';

interface AboutProps {
  isDark: boolean;
}

const About: React.FC<AboutProps> = ({ isDark }) => {
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const mutedText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const panelBorder = isDark ? 'border-zinc-800' : 'border-zinc-200';
  const panelBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';

  return (
    <div className={`${bgColor} ${textColor} font-['Helvetica'] p-4 sm:p-8 max-w-4xl mx-auto`}>

      <header className="mb-12 sm:mb-16">
        <div className={`flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] ${mutedText} mb-6`}>
          <div className="w-10 sm:w-20 h-px bg-current"></div>About
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-tight">
          Built for People<br />Who Work Across<br />Time Zones
        </h1>
        <p className={`mt-6 text-base sm:text-lg font-bold leading-relaxed ${mutedText} max-w-2xl`}>
          WorldTimeSuite is a free, precision-grade productivity suite designed for remote teams,
          global freelancers, and anyone who needs to coordinate across time zones without
          the friction.
        </p>
      </header>

      <div className="space-y-6">

        <div className={`border ${panelBorder} rounded-[1.5rem] sm:rounded-[2rem] ${panelBg} p-6 sm:p-10`}>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-4">Our Mission</h2>
          <p className={`text-sm sm:text-base font-bold leading-relaxed ${mutedText}`}>
            Time zone confusion costs teams hours every week — missed meetings, wrong deadlines,
            and late-night calls that should have been scheduled differently. We built WorldTimeSuite
            to make time zone conversion instant, accurate, and completely free. No sign-up.
            No subscription. No ads in your way. Just the tools you need.
          </p>
        </div>

        <div className={`border ${panelBorder} rounded-[1.5rem] sm:rounded-[2rem] ${panelBg} p-6 sm:p-10`}>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-green-500 mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Time Zone Converter',
                desc: 'Convert time between 500+ cities worldwide. Type naturally — "5pm London to New York" — and get an instant answer. Includes a visual timeline for business hour overlap.',
                color: 'text-blue-500'
              },
              {
                title: 'iPhone-Style Stopwatch',
                desc: 'A precision stopwatch with lap tracking, built to feel as smooth and responsive as the one on your phone. Works entirely in your browser — no download needed.',
                color: 'text-green-500'
              },
              {
                title: 'Countdown Timer',
                desc: 'Set a countdown for any duration in seconds. Clean, distraction-free, and works instantly on any device.',
                color: 'text-yellow-500'
              },
              {
                title: 'Calendar',
                desc: 'Plan meetings and tasks across time zones with a timezone-aware calendar. See overlapping hours between cities and avoid scheduling mistakes.',
                color: 'text-purple-500'
              }
            ].map(tool => (
              <div key={tool.title} className="space-y-2">
                <h3 className={`text-xs font-black uppercase tracking-widest ${tool.color}`}>{tool.title}</h3>
                <p className={`text-sm font-bold leading-relaxed ${mutedText}`}>{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`border ${panelBorder} rounded-[1.5rem] sm:rounded-[2rem] ${panelBg} p-6 sm:p-10`}>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-yellow-500 mb-4">Why Free?</h2>
          <p className={`text-sm sm:text-base font-bold leading-relaxed ${mutedText}`}>
            We believe essential productivity tools should be accessible to everyone — whether you
            are a student coordinating with classmates overseas, a freelancer managing clients
            across continents, or a team lead scheduling standups across four time zones.
            WorldTimeSuite is and will remain free to use.
          </p>
        </div>

        <div className={`border ${panelBorder} rounded-[1.5rem] sm:rounded-[2rem] ${panelBg} p-6 sm:p-10`}>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-purple-500 mb-4">Privacy First</h2>
          <p className={`text-sm sm:text-base font-bold leading-relaxed ${mutedText}`}>
            All time zone conversions happen directly in your browser. We do not store your
            searches, your location, or any personal data. The only data we collect is standard
            anonymous analytics to understand how the site is being used — and you can opt out
            of that entirely via our cookie consent controls.
          </p>
        </div>

        <div className={`border ${panelBorder} rounded-[1.5rem] sm:rounded-[2rem] ${panelBg} p-6 sm:p-10`}>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-4" style={{ color: isDark ? '#a1a1aa' : '#52525b' }}>Contact</h2>
          <p className={`text-sm sm:text-base font-bold leading-relaxed ${mutedText}`}>
            Have feedback, a bug report, or a feature request? We would love to hear from you.
            Reach us at{' '}
            <a
              href="mailto:hello@worldtimesuite.com"
              className="text-blue-500 hover:opacity-70 transition-opacity"
            >
              hello@worldtimesuite.com
            </a>
          </p>
        </div>

      </div>

      <div className={`mt-12 text-center text-[10px] font-black uppercase tracking-[0.3em] ${mutedText}`}>
        WorldTimeSuite — Global Time, Simplified
      </div>

    </div>
  );
};

export default About;