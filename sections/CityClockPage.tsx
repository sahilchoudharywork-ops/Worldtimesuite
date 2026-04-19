import React, { useState, useEffect } from 'react';
import { cities } from '../data/cities';

interface CityClockPageProps {
  citySlug: string;
  isDark: boolean;
}

const getOffsetHours = (iana: string, date: Date = new Date()): number => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'longOffset',
    }).formatToParts(date);
    const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
    const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;
    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours + minutes / 60);
  } catch {
    return 0;
  }
};

const getUtcOffsetString = (iana: string, date: Date = new Date()): string => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'longOffset',
    }).formatToParts(date);
    const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
    return offsetStr.replace('GMT', 'UTC');
  } catch {
    return 'UTC+0';
  }
};

const getLongTimeZoneName = (iana: string, date: Date = new Date()): string => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'long',
    }).formatToParts(date);
    return parts.find(p => p.type === 'timeZoneName')?.value || iana;
  } catch {
    return iana;
  }
};

const isCurrentlyDST = (iana: string, date: Date = new Date()): boolean => {
  const jan = getOffsetHours(iana, new Date(date.getFullYear(), 0, 1));
  const jul = getOffsetHours(iana, new Date(date.getFullYear(), 6, 1));
  if (jan === jul) return false;
  return getOffsetHours(iana, date) === Math.max(jan, jul);
};

const hasDSTAtAll = (iana: string, date: Date = new Date()): boolean => {
  const jan = getOffsetHours(iana, new Date(date.getFullYear(), 0, 1));
  const jul = getOffsetHours(iana, new Date(date.getFullYear(), 6, 1));
  return jan !== jul;
};

const getNextDSTTransition = (iana: string, date: Date = new Date()): { date: string; offsetAfter: string } | null => {
  if (!hasDSTAtAll(iana, date)) return null;
  try {
    const check = new Date(date);
    const currentOffset = getOffsetHours(iana, check);
    for (let i = 0; i < 366; i++) {
      check.setDate(check.getDate() + 1);
      const nextOffset = getOffsetHours(iana, check);
      if (nextOffset !== currentOffset) {
        const transitionDate = new Intl.DateTimeFormat('en-US', {
          timeZone: iana,
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(check);
        const abs = Math.abs(nextOffset);
        const sign = nextOffset >= 0 ? '+' : '-';
        const h = Math.floor(abs);
        const m = Math.round((abs - h) * 60);
        const offsetAfter = `UTC${sign}${h}${m > 0 ? ':' + String(m).padStart(2, '0') : ''}`;
        return { date: transitionDate, offsetAfter };
      }
    }
  } catch {
    return null;
  }
  return null;
};

const formatCityTime = (iana: string, date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: iana,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
};

const formatCityDate = (iana: string, date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: iana,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const formatTimeDiff = (fromIana: string, toIana: string): string => {
  const diff = getOffsetHours(fromIana) - getOffsetHours(toIana);
  if (diff === 0) return 'Same time';
  const abs = Math.abs(diff);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  const label = m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${label} ${diff > 0 ? 'ahead' : 'behind'}`;
};

const formatOtherCityTime = (iana: string, date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: iana,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

// Top 5 destinations per city slug
const CITY_DESTINATIONS: Record<string, string[]> = {
  'london':      ['new-york', 'dubai', 'mumbai', 'sydney', 'toronto'],
  'new-york':    ['london', 'los-angeles', 'toronto', 'dubai', 'chicago'],
  'dubai':       ['london', 'mumbai', 'new-york', 'sydney', 'bangalore'],
  'mumbai':      ['london', 'new-york', 'dubai', 'singapore', 'toronto'],
  'tokyo':       ['new-york', 'london', 'singapore', 'sydney', 'los-angeles'],
  'sydney':      ['london', 'new-york', 'singapore', 'melbourne', 'dubai'],
  'singapore':   ['london', 'new-york', 'sydney', 'tokyo', 'mumbai'],
  'paris':       ['new-york', 'london', 'dubai', 'berlin', 'tokyo'],
  'berlin':      ['new-york', 'london', 'dubai', 'paris', 'tokyo'],
  'toronto':     ['new-york', 'london', 'dubai', 'vancouver', 'chicago'],
  'los-angeles': ['new-york', 'london', 'tokyo', 'sydney', 'chicago'],
  'chicago':     ['new-york', 'london', 'los-angeles', 'toronto', 'dubai'],
  'hong-kong':   ['london', 'new-york', 'singapore', 'tokyo', 'dubai'],
  'seoul':       ['new-york', 'london', 'tokyo', 'singapore', 'dubai'],
  'amsterdam':   ['new-york', 'london', 'dubai', 'berlin', 'toronto'],
  'moscow':      ['london', 'new-york', 'dubai', 'berlin', 'paris'],
  'cairo':       ['london', 'new-york', 'dubai', 'nairobi', 'paris'],
  'nairobi':     ['london', 'dubai', 'new-york', 'johannesburg', 'cairo'],
  'lagos':       ['london', 'new-york', 'dubai', 'nairobi', 'accra'],
  'delhi':       ['london', 'new-york', 'dubai', 'singapore', 'toronto'],
  'bangalore':   ['london', 'new-york', 'dubai', 'singapore', 'toronto'],
  'bangkok':     ['london', 'new-york', 'singapore', 'tokyo', 'dubai'],
  'karachi':     ['london', 'dubai', 'new-york', 'mumbai', 'toronto'],
  'melbourne':   ['london', 'sydney', 'new-york', 'singapore', 'dubai'],
  'auckland':    ['london', 'sydney', 'new-york', 'dubai', 'los-angeles'],
  'honolulu':    ['los-angeles', 'new-york', 'sydney', 'tokyo', 'san-francisco'],
  'vancouver':   ['new-york', 'london', 'toronto', 'los-angeles', 'dubai'],
  'sao-paulo':   ['new-york', 'london', 'miami', 'los-angeles', 'toronto'],
  'mexico-city': ['new-york', 'los-angeles', 'chicago', 'london', 'toronto'],
};

const DEFAULT_DESTINATIONS = ['london', 'new-york', 'dubai', 'singapore', 'sydney'];

const getRelatedCities = (citySlug: string, cityTz: string): typeof cities => {
  const sameTz = cities.filter(c => c.slug !== citySlug && c.tz === cityTz);
  if (sameTz.length >= 4) return sameTz.slice(0, 6);

  const continent = cityTz.split('/')[0];
  const sameContinent = cities.filter(
    c => c.slug !== citySlug && c.tz !== cityTz && c.tz.startsWith(continent + '/')
  );
  return [...sameTz, ...sameContinent].slice(0, 6);
};

const buildSeoText = (cityName: string, iana: string, now: Date): string => {
  const longName = getLongTimeZoneName(iana, now);
  const offsetStr = getUtcOffsetString(iana, now);
  const dst = isCurrentlyDST(iana, now);
  const hasDst = hasDSTAtAll(iana, now);

  const base = `${cityName} uses ${longName} (${offsetStr}).`;

  if (!hasDst) {
    return `${base} ${cityName} does not observe daylight saving time and keeps a fixed UTC offset year-round.`;
  }

  if (dst) {
    return `${base} ${cityName} is currently observing daylight saving time. Clocks will move back when DST ends later in the year.`;
  }

  return `${base} ${cityName} observes daylight saving time for part of the year, during which the offset changes by one hour.`;
};

const CityClockPage: React.FC<CityClockPageProps> = ({ citySlug, isDark }) => {
  const city = cities.find(c => c.slug === citySlug);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!city) return null;

  const iana       = city.tz;
  const timeStr    = formatCityTime(iana, now);
  const dateStr    = formatCityDate(iana, now);
  const offsetStr  = getUtcOffsetString(iana, now);
  const longName   = getLongTimeZoneName(iana, now);
  const dst        = isCurrentlyDST(iana, now);
  const hasDst     = hasDSTAtAll(iana, now);
  const nextTrans  = getNextDSTTransition(iana, now);
  const seoText    = buildSeoText(city.name, iana, now);

  const destinations = (CITY_DESTINATIONS[citySlug] || DEFAULT_DESTINATIONS)
    .map(slug => cities.find(c => c.slug === slug))
    .filter(Boolean) as typeof cities;

  const relatedCities = getRelatedCities(citySlug, iana);

  const bgColor     = isDark ? 'bg-black'    : 'bg-white';
  const textColor   = isDark ? 'text-white'  : 'text-black';
  const panelBg     = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const panelBorder = isDark ? 'border-zinc-800' : 'border-zinc-200';
  const subtleText  = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const faintText   = isDark ? 'text-zinc-500' : 'text-zinc-500';

  return (
    <div className={`p-4 sm:p-8 space-y-10 ${bgColor} ${textColor} font-['Helvetica']`}>
      <style>{`
        .city-clock-hero-italic {
          font-family: 'Instrument Serif', Georgia, serif !important;
          font-style: italic !important;
          font-weight: 400 !important;
          text-transform: none !important;
          letter-spacing: 0 !important;
          display: inline-block;
        }
      `}</style>

      {/* Hero */}
      <header className="space-y-6">
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter">
          Current Time in <em className="city-clock-hero-italic">{city.name}</em>
        </h1>

        <div className={`border ${panelBorder} rounded-[2.5rem] p-6 sm:p-10 ${panelBg} shadow-2xl`}>
          <div className="space-y-3">
            <div className="text-4xl sm:text-6xl md:text-7xl font-black tabular-nums text-blue-500 tracking-tight leading-none">
              {timeStr}
            </div>
            <div className={`text-sm sm:text-base font-bold ${subtleText}`}>
              {dateStr}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`text-xs font-black uppercase tracking-widest ${faintText}`}>
                {offsetStr}
              </span>
              <span className={`text-xs font-bold ${faintText}`}>·</span>
              <span className={`text-xs font-bold ${faintText}`}>{longName}</span>
              {dst && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-amber-500/50 text-amber-500">
                  DST Active
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* DST status */}
      <section>
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-20 h-px ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
          <span className={`text-xs font-black uppercase tracking-widest ${faintText}`}>
            Daylight Saving Time
          </span>
        </div>

        <div className={`border ${panelBorder} rounded-2xl p-5 ${panelBg}`}>
          {!hasDst ? (
            <p className={`text-sm font-bold ${subtleText}`}>
              {city.name} does not observe daylight saving time. The UTC offset stays fixed year-round at {offsetStr}.
            </p>
          ) : dst ? (
            <div className="space-y-2">
              <p className={`text-sm font-bold ${textColor}`}>
                {city.name} is currently observing daylight saving time.
              </p>
              <p className={`text-sm ${subtleText}`}>
                Current offset: <span className="font-black">{offsetStr}</span>
              </p>
              {nextTrans && (
                <p className={`text-sm ${subtleText}`}>
                  Clocks move back on <span className="font-black">{nextTrans.date}</span> to {nextTrans.offsetAfter}.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className={`text-sm font-bold ${textColor}`}>
                {city.name} is not currently observing daylight saving time.
              </p>
              <p className={`text-sm ${subtleText}`}>
                Current offset: <span className="font-black">{offsetStr}</span>
              </p>
              {nextTrans && (
                <p className={`text-sm ${subtleText}`}>
                  Clocks move forward on <span className="font-black">{nextTrans.date}</span> to {nextTrans.offsetAfter}.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Quick converter — top 5 destinations */}
      {destinations.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-20 h-px ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
            <span className={`text-xs font-black uppercase tracking-widest ${faintText}`}>
              Quick Converter
            </span>
          </div>

          <div className="space-y-2">
            {destinations.map(dest => (
              <a
                key={dest.slug}
                href={`/${citySlug}-to-${dest.slug}`}
                className={`flex items-center justify-between border ${panelBorder} rounded-xl px-5 py-4 ${panelBg} hover:border-blue-500 transition-colors group`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-black uppercase tracking-widest ${textColor} group-hover:text-blue-500 transition-colors`}>
                    {dest.name}
                  </span>
                  <span className={`text-xs font-bold ${subtleText}`}>
                    {formatTimeDiff(iana, dest.tz)}
                  </span>
                </div>
                <span className={`text-sm font-black tabular-nums text-blue-500`}>
                  {formatOtherCityTime(dest.tz, now)}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Related cities */}
      {relatedCities.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-20 h-px ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
            <span className={`text-xs font-black uppercase tracking-widest ${faintText}`}>
              Related Cities
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {relatedCities.map(related => (
              <a
                key={related.slug}
                href={`/time-in-${related.slug}`}
                className={`flex items-center justify-between border ${panelBorder} rounded-xl px-4 py-3 ${panelBg} hover:border-blue-500 transition-colors group`}
              >
                <span className={`text-xs font-black uppercase tracking-widest ${textColor} group-hover:text-blue-500 transition-colors`}>
                  {related.name}
                </span>
                <span className={`text-xs font-black tabular-nums text-blue-500`}>
                  {formatOtherCityTime(related.tz, now)}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* SEO text */}
      <section>
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-20 h-px ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
          <span className={`text-xs font-black uppercase tracking-widest ${faintText}`}>
            About {city.name} Time
          </span>
        </div>
        <p className={`text-sm leading-relaxed ${subtleText} max-w-2xl`}>
          {seoText}
        </p>
      </section>
    </div>
  );
};

export default CityClockPage;
