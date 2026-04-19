import React, { useState, useEffect, useMemo, useRef } from 'react';
import { cities } from '../data/cities';

interface WorldClockProps {
  isDark: boolean;
}

const COUNTRY_MAP: Record<string, string> = {
  'new-york': 'USA', 'los-angeles': 'USA', 'chicago': 'USA', 'san-francisco': 'USA',
  'seattle': 'USA', 'boston': 'USA', 'miami': 'USA', 'washington-dc': 'USA',
  'houston': 'USA', 'dallas': 'USA', 'atlanta': 'USA', 'san-diego': 'USA',
  'las-vegas': 'USA', 'orlando': 'USA', 'honolulu': 'USA',
  'toronto': 'Canada', 'vancouver': 'Canada', 'montreal': 'Canada',
  'mexico-city': 'Mexico',
  'sao-paulo': 'Brazil', 'rio-de-janeiro': 'Brazil',
  'buenos-aires': 'Argentina', 'santiago': 'Chile', 'bogota': 'Colombia',
  'lima': 'Peru', 'caracas': 'Venezuela',
  'london': 'UK', 'manchester': 'UK', 'birmingham': 'UK',
  'dublin': 'Ireland',
  'paris': 'France', 'nice': 'France',
  'berlin': 'Germany', 'frankfurt': 'Germany', 'munich': 'Germany',
  'madrid': 'Spain', 'barcelona': 'Spain',
  'rome': 'Italy', 'milan': 'Italy',
  'amsterdam': 'Netherlands', 'brussels': 'Belgium',
  'zurich': 'Switzerland', 'geneva': 'Switzerland',
  'vienna': 'Austria', 'lisbon': 'Portugal',
  'stockholm': 'Sweden', 'oslo': 'Norway', 'copenhagen': 'Denmark',
  'helsinki': 'Finland', 'reykjavik': 'Iceland',
  'warsaw': 'Poland', 'prague': 'Czech Republic', 'budapest': 'Hungary',
  'athens': 'Greece', 'bucharest': 'Romania', 'sofia': 'Bulgaria',
  'belgrade': 'Serbia', 'kyiv': 'Ukraine', 'istanbul': 'Turkey',
  'dubai': 'UAE', 'abu-dhabi': 'UAE', 'riyadh': 'Saudi Arabia',
  'doha': 'Qatar', 'kuwait-city': 'Kuwait', 'muscat': 'Oman',
  'tel-aviv': 'Israel', 'jerusalem': 'Israel',
  'delhi': 'India', 'mumbai': 'India', 'bangalore': 'India',
  'hyderabad': 'India', 'chennai': 'India', 'kolkata': 'India',
  'karachi': 'Pakistan', 'lahore': 'Pakistan',
  'dhaka': 'Bangladesh', 'colombo': 'Sri Lanka',
  'singapore': 'Singapore', 'kuala-lumpur': 'Malaysia',
  'bangkok': 'Thailand', 'jakarta': 'Indonesia', 'manila': 'Philippines',
  'ho-chi-minh-city': 'Vietnam', 'hanoi': 'Vietnam',
  'tokyo': 'Japan', 'osaka': 'Japan',
  'seoul': 'South Korea',
  'beijing': 'China', 'shanghai': 'China', 'shenzhen': 'China',
  'hong-kong': 'Hong Kong', 'taipei': 'Taiwan',
  'almaty': 'Kazakhstan', 'tashkent': 'Uzbekistan',
  'johannesburg': 'South Africa', 'cape-town': 'South Africa',
  'nairobi': 'Kenya', 'lagos': 'Nigeria', 'cairo': 'Egypt',
  'casablanca': 'Morocco', 'accra': 'Ghana', 'addis-ababa': 'Ethiopia',
  'sydney': 'Australia', 'melbourne': 'Australia', 'brisbane': 'Australia',
  'perth': 'Australia', 'adelaide': 'Australia',
  'auckland': 'New Zealand', 'wellington': 'New Zealand',
};

// ─── Offset helpers ───────────────────────────────────────────────────────────

// Called sparingly: once at mount + every 60 s for DST accuracy
const getOffsetMinutes = (iana: string, date: Date): number => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'longOffset',
    }).formatToParts(date);
    const str = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0';
    const match = str.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;
    const sign = match[1] === '-' ? -1 : 1;
    const h = parseInt(match[2], 10);
    const m = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (h * 60 + m);
  } catch {
    return 0;
  }
};

const buildOffsetCache = (): Record<string, number> => {
  const now = new Date();
  const cache: Record<string, number> = {};
  for (const city of cities) {
    cache[city.slug] = getOffsetMinutes(city.tz, now);
  }
  return cache;
};

// ─── Time derivation — pure arithmetic, zero Intl calls ──────────────────────

const pad = (n: number) => String(n).padStart(2, '0');

const deriveTime = (utcMs: number, offsetMinutes: number) => {
  const localMs = utcMs + offsetMinutes * 60_000;
  const totalSec = Math.floor(localMs / 1000);
  const s = ((totalSec % 60) + 60) % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = ((totalMin % 60) + 60) % 60;
  const totalHours = Math.floor(totalMin / 60);
  const h = ((totalHours % 24) + 24) % 24;
  const h12 = h % 12 || 12;
  const period = h < 12 ? 'AM' : 'PM';
  return { hours: h, minutes: m, seconds: s, timeStr: `${pad(h12)}:${pad(m)}:${pad(s)} ${period}` };
};

// ─── IntersectionObserver hook ────────────────────────────────────────────────
// Once a card enters the viewport it stays rendered — prevents layout shift on scroll-back

const useVisible = () => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible };
};

// ─── Analog clock ─────────────────────────────────────────────────────────────

interface AnalogClockProps {
  hours: number;
  minutes: number;
  seconds: number;
  isDark: boolean;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ hours, minutes, seconds, isDark }) => {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const handEnd = (angle: number, length: number) => ({
    x: cx + length * Math.cos(toRad(angle)),
    y: cy + length * Math.sin(toRad(angle)),
  });

  const hourAngle   = ((hours % 12) + minutes / 60) * 30 - 90;
  const minuteAngle = (minutes + seconds / 60) * 6 - 90;
  const secondAngle = seconds * 6 - 90;
  const hourEnd     = handEnd(hourAngle, r * 0.52);
  const minuteEnd   = handEnd(minuteAngle, r * 0.72);
  const secondEnd   = handEnd(secondAngle, r * 0.78);

  const faceFill    = isDark ? '#1c1c1e' : '#faf9f7';
  const faceStroke  = isDark ? '#3a3a3c' : '#d1cfc9';
  const numColor    = isDark ? '#e5e5e5' : '#1a1a1a';
  const handColor   = isDark ? '#ffffff' : '#111111';
  const centerDot   = isDark ? '#ffffff' : '#111111';

  const numberPositions = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const angle = toRad(num * 30 - 90);
    const nr = r * 0.78;
    return { num, x: cx + nr * Math.cos(angle), y: cy + nr * Math.sin(angle) };
  });

  const tickMarks = Array.from({ length: 60 }, (_, i) => {
    const angle = toRad(i * 6 - 90);
    const isHour = i % 5 === 0;
    const outerR = r - 1;
    const innerR = isHour ? r - 8 : r - 4;
    return {
      x1: cx + innerR * Math.cos(angle), y1: cy + innerR * Math.sin(angle),
      x2: cx + outerR * Math.cos(angle), y2: cy + outerR * Math.sin(angle),
      isHour,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill={faceFill} stroke={faceStroke} strokeWidth="1.5" />
      {tickMarks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={isDark ? (t.isHour ? '#888' : '#555') : (t.isHour ? '#555' : '#ccc')}
          strokeWidth={t.isHour ? 1.5 : 0.75}
        />
      ))}
      {numberPositions.map(({ num, x, y }) => (
        <text key={num} x={x} y={y} textAnchor="middle" dominantBaseline="central"
          fontSize="8.5" fontWeight="700" fontFamily="Helvetica, Arial, sans-serif" fill={numColor}>
          {num}
        </text>
      ))}
      <line x1={cx} y1={cy} x2={hourEnd.x} y2={hourEnd.y} stroke={handColor} strokeWidth="3" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={minuteEnd.x} y2={minuteEnd.y} stroke={handColor} strokeWidth="2" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={secondEnd.x} y2={secondEnd.y} stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="3" fill="#3b82f6" />
      <circle cx={cx} cy={cy} r="1.5" fill={centerDot} />
    </svg>
  );
};

// Lightweight placeholder — same dimensions as AnalogClock, no SVG complexity
const ClockPlaceholder: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <svg width={120} height={120} viewBox="0 0 120 120">
    <circle cx={60} cy={60} r={56}
      fill={isDark ? '#1c1c1e' : '#faf9f7'}
      stroke={isDark ? '#3a3a3c' : '#d1cfc9'}
      strokeWidth="1.5"
    />
  </svg>
);

// ─── City card ────────────────────────────────────────────────────────────────
// Extracted as its own component so useVisible can be called at the top level

interface CityCardProps {
  city: { name: string; slug: string };
  offsetMinutes: number;
  utcMs: number;
  isDark: boolean;
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  subColor: string;
  detailColor: string;
}

const CityCard: React.FC<CityCardProps> = ({
  city, offsetMinutes, utcMs, isDark,
  cardBg, cardBorder, titleColor, subColor, detailColor,
}) => {
  const { ref, visible } = useVisible();
  const country = COUNTRY_MAP[city.slug] ?? '';
  const { hours, minutes, seconds, timeStr } = deriveTime(utcMs, offsetMinutes);

  return (
    <a
      ref={ref}
      href={`/time-in-${city.slug}`}
      className={`block rounded-2xl border ${cardBorder} ${cardBg} p-4 hover:border-blue-500 hover:shadow-md transition-all group`}
    >
      <div className="mb-2">
        <div className={`text-xs font-black uppercase tracking-wider ${titleColor} group-hover:text-blue-500 transition-colors leading-tight`}>
          {city.name}
        </div>
        <div className={`text-[10px] font-semibold uppercase tracking-widest ${subColor} mt-0.5`}>
          {country}
        </div>
      </div>

      <div className="text-sm sm:text-base font-black tabular-nums text-blue-500 tracking-tight leading-none mb-3">
        {timeStr}
      </div>

      <div className="flex justify-center mb-3">
        {visible
          ? <AnalogClock hours={hours} minutes={minutes} seconds={seconds} isDark={isDark} />
          : <ClockPlaceholder isDark={isDark} />
        }
      </div>

      <div className={`text-[9px] font-black uppercase tracking-widest text-center ${detailColor}`}>
        Click to view details
      </div>
    </a>
  );
};

// ─── World clock ──────────────────────────────────────────────────────────────

const WorldClock: React.FC<WorldClockProps> = ({ isDark }) => {
  // Single number — cheaper than a Date object
  const [utcMs, setUtcMs] = useState(() => Date.now());
  const [query, setQuery] = useState('');

  // Offset cache: computed once at mount, refreshed every 60 s for DST transitions
  const [offsetCache, setOffsetCache] = useState<Record<string, number>>(buildOffsetCache);

  useEffect(() => {
    const tick = setInterval(() => setUtcMs(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const refresh = setInterval(() => setOffsetCache(buildOffsetCache()), 60_000);
    return () => clearInterval(refresh);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(c => {
      const country = (COUNTRY_MAP[c.slug] ?? '').toLowerCase();
      return c.name.toLowerCase().includes(q) || country.includes(q);
    });
  }, [query]);

  const bg          = isDark ? 'bg-black'    : 'bg-white';
  const cardBg      = isDark ? 'bg-zinc-900' : 'bg-white';
  const cardBorder  = isDark ? 'border-zinc-800' : 'border-zinc-200';
  const titleColor  = isDark ? 'text-white'  : 'text-black';
  const subColor    = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const detailColor = isDark ? 'text-zinc-600' : 'text-zinc-400';
  const inputBg     = isDark
    ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500'
    : 'bg-white border-zinc-300 text-black placeholder-zinc-400';

  return (
    <div className={`min-h-screen ${bg} px-4 pt-2 pb-8 sm:px-8`}>
      <style>{`
        .world-clock-hero-italic {
          font-family: 'Instrument Serif', Georgia, serif !important;
          font-style: italic !important;
          font-weight: 400 !important;
          text-transform: none !important;
          letter-spacing: 0 !important;
          display: inline-block;
        }
      `}</style>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className={`text-xl sm:text-3xl md:text-5xl font-black tracking-tighter ${titleColor}`}>
            World <em className="world-clock-hero-italic">Clock</em>
          </h1>
          <p className={`text-xs uppercase tracking-widest font-bold ${subColor}`}>
            Live local times worldwide
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search city or country…"
            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition-colors ${inputBg}`}
          />
        </div>

        {query && (
          <p className={`text-center text-xs ${subColor}`}>
            {filtered.length} {filtered.length === 1 ? 'city' : 'cities'} found
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {filtered.map(city => (
          <CityCard
            key={city.slug}
            city={city}
            offsetMinutes={offsetCache[city.slug] ?? 0}
            utcMs={utcMs}
            isDark={isDark}
            cardBg={cardBg}
            cardBorder={cardBorder}
            titleColor={titleColor}
            subColor={subColor}
            detailColor={detailColor}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={`text-center py-20 ${subColor} text-sm font-semibold`}>
          No cities match &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
};

export default WorldClock;
