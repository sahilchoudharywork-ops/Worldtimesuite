import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { getAllCountries } from 'countries-and-timezones';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GlobePageProps {
  isDark: boolean;
}

interface TooltipInfo {
  name: string;
  isoCode: string;
  iana: string | null;
  localTime: string | null;
  offset: string | null;
}

// ─── Timezone Data Layer ──────────────────────────────────────────────────────
// For multi-timezone countries we pin the capital city's IANA zone.
// Everything else falls through to countries-and-timezones (first entry = primary zone).

const TZ_OVERRIDES: Record<string, string> = {
  US: 'America/New_York',
  RU: 'Europe/Moscow',
  AU: 'Australia/Sydney',
  CA: 'America/Toronto',
  BR: 'America/Sao_Paulo',
  MX: 'America/Mexico_City',
  CN: 'Asia/Shanghai',
  ID: 'Asia/Jakarta',
  KZ: 'Asia/Almaty',
  MN: 'Asia/Ulaanbaatar',
  CD: 'Africa/Kinshasa',
  CL: 'America/Santiago',
  EC: 'America/Guayaquil',
  GL: 'America/Nuuk',
  PT: 'Europe/Lisbon',
  ES: 'Europe/Madrid',
  NO: 'Europe/Oslo',
  FM: 'Pacific/Pohnpei',
  KI: 'Pacific/Tarawa',
  PF: 'Pacific/Tahiti',
  AQ: 'Antarctica/McMurdo',
};

// Built once at module load — O(1) lookup at render time
const COUNTRY_TZ: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const all = getAllCountries();
  for (const [code, country] of Object.entries(all)) {
    const c = country as { timezones: string[] };
    const tz = TZ_OVERRIDES[code] ?? c.timezones[0] ?? null;
    if (tz) map[code] = tz;
  }
  return map;
})();

// ─── Geometry Helper (search fly-to only) ────────────────────────────────────

const computeCentroid = (feature: any): { lat: number; lng: number } | null => {
  try {
    const geom = feature.geometry;
    if (!geom) return null;
    let ring: number[][] = [];
    if (geom.type === 'Polygon') {
      ring = geom.coordinates[0];
    } else if (geom.type === 'MultiPolygon') {
      ring = geom.coordinates.reduce(
        (best: number[][], poly: number[][][]) =>
          poly[0].length > best.length ? poly[0] : best,
        [] as number[][]
      );
    }
    if (!ring.length) return null;
    const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length;
    const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
    return { lat, lng };
  } catch { return null; }
};

// ─── Time Formatting Helpers ──────────────────────────────────────────────────

const fmtLocalTime = (iana: string, date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: iana,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);

const fmtOffset = (iana: string, date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: iana,
    timeZoneName: 'shortOffset',
  })
    .formatToParts(date)
    .find(p => p.type === 'timeZoneName')?.value ?? '';

const fmtUtc = (date: Date): string =>
  date.toISOString().split('T')[1].split('.')[0];

// ─── Globe Component ──────────────────────────────────────────────────────────

const GlobePage: React.FC<GlobePageProps> = ({ isDark }) => {
  const globeRef   = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLDivElement>(null);

  // Geo data
  const [geoData, setGeoData]   = useState<{ features: object[] }>({ features: [] });
  const [geoError, setGeoError] = useState(false);

  // Interaction state
  const [hoveredCountry, setHoveredCountry]         = useState<any>(null);
  const [highlightedCountry, setHighlightedCountry] = useState<any>(null);
  const [mousePos, setMousePos]                     = useState({ x: 0, y: 0 });

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen]   = useState(false);

  // Live clock — ticks every second
  const [now, setNow] = useState(() => new Date());

  // Container size — measured via ResizeObserver
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // ── Fetch GeoJSON (country polygons) ──────────────────────────────────────
  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'
    )
      .then(r => {
        if (!r.ok) throw new Error('GeoJSON fetch failed');
        return r.json();
      })
      .then(setGeoData)
      .catch(() => setGeoError(true));
  }, []);

  // ── 1-second clock tick ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── ResizeObserver for responsive sizing ──────────────────────────────────
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const r = entries[0]?.contentRect;
      if (r) setDimensions({ width: Math.floor(r.width), height: Math.floor(r.height) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Auto-rotate — stops permanently on first user drag ───────────────────
  useEffect(() => {
    if (!globeRef.current || dimensions.width === 0) return;
    const controls = globeRef.current.controls() as any;
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.08;
    const stop = () => { controls.autoRotate = false; };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [dimensions.width]);

  // ── Close search on outside click ─────────────────────────────────────────
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // ── Mouse tracking for tooltip position ──────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  // ── Fly to country on search select ──────────────────────────────────────
  const selectCountry = useCallback((feature: any) => {
    const centroid = computeCentroid(feature);
    if (centroid && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: centroid.lat, lng: centroid.lng, altitude: 1.4 }, 900
      );
    }
    setHighlightedCountry(feature);
    setSearchQuery('');
    setSearchOpen(false);
  }, []);

  // ── Search results ────────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return (geoData.features as any[])
      .filter(f => (f.properties?.ADMIN ?? '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, geoData]);

  // ── Canvas 2D space background — generated once, passed as Three.js texture ─
  // Draws a star field on an offscreen canvas and converts to a JPEG data URL.
  // react-globe.gl uses backgroundImageUrl as the equirectangular space texture,
  // so this replaces the CDN image with our own Canvas 2D–drawn star field.
  const spaceBgUrl = useMemo<string>(() => {
    if (typeof document === 'undefined') return '';
    const W = 2048, H = 1024;
    const cvs = document.createElement('canvas');
    cvs.width  = W;
    cvs.height = H;
    const ctx = cvs.getContext('2d');
    if (!ctx) return '';

    // Deep space base
    ctx.fillStyle = '#00000a';
    ctx.fillRect(0, 0, W, H);

    // ~2800 stars — biased toward small sizes (more realistic distribution)
    for (let i = 0; i < 2800; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = 0.3 + Math.random() * Math.random() * 1.6; // quadratic bias → mostly tiny
      const a = 0.2 + Math.random() * 0.8;
      // Realistic mix: ~85% white, ~10% blue-white, ~5% warm yellow
      const col =
        i % 10 === 0 ? `rgba(180,205,255,${a})` :   // blue-white
        i % 20 === 0 ? `rgba(255,235,190,${a})` :   // warm
        `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    }

    // ~14 bright stars with soft radial glow
    for (let i = 0; i < 14; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
      g.addColorStop(0,   'rgba(255,255,255,1)');
      g.addColorStop(0.3, 'rgba(255,255,255,0.35)');
      g.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 6, y - 6, 12, 12);
    }

    // Subtle Milky Way band — diagonal soft glow
    const mw = ctx.createLinearGradient(0, H * 0.25, W, H * 0.75);
    mw.addColorStop(0,    'rgba(255,255,255,0)');
    mw.addColorStop(0.35, 'rgba(210,220,255,0.05)');
    mw.addColorStop(0.5,  'rgba(210,225,255,0.09)');
    mw.addColorStop(0.65, 'rgba(210,220,255,0.05)');
    mw.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = mw;
    ctx.fillRect(0, 0, W, H);

    return cvs.toDataURL('image/jpeg', 0.92);
  }, []); // empty deps — generated once per mount

  // ── Polygon colours — original isDark palette, +highlighted support ───────
  const getCapColor = useCallback(
    (d: object) => {
      if (d === highlightedCountry) return isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.18)';
      if (d === hoveredCountry)     return isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.12)';
      return 'rgba(0,0,0,0)';
    },
    [hoveredCountry, highlightedCountry, isDark]
  );

  const getStrokeColor = useCallback(
    (d: object) => {
      if (d === highlightedCountry) return isDark ? '#ffffff' : '#000000';
      if (d === hoveredCountry)     return isDark ? '#ffffff' : '#000000';
      return isDark ? '#3a3a3a' : '#c0c0c0';
    },
    [hoveredCountry, highlightedCountry, isDark]
  );

  // ── Tooltip data — computed on hover + clock tick ─────────────────────────
  const tooltipInfo = useMemo<TooltipInfo | null>(() => {
    if (!hoveredCountry) return null;
    const props = (hoveredCountry as any).properties ?? {};
    const isoCode: string = props.ISO_A2 ?? '';
    const name: string    = props.ADMIN  ?? 'Unknown';
    const iana = COUNTRY_TZ[isoCode] ?? null;

    if (!iana) return { name, isoCode, iana: null, localTime: null, offset: null };

    try {
      return {
        name, isoCode, iana,
        localTime: fmtLocalTime(iana, now),
        offset:    fmtOffset(iana, now),
      };
    } catch {
      return { name, isoCode, iana, localTime: null, offset: null };
    }
  }, [hoveredCountry, now]);

  // ── Tooltip positioning — flip left when near right edge ─────────────────
  const tooltipStyle = useMemo(() => {
    const W = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const flipX = mousePos.x > W - 280;
    return {
      left: flipX ? mousePos.x - 16 : mousePos.x + 16,
      top:  mousePos.y + 16,
      transform: flipX ? 'translateX(-100%)' : undefined,
    } as React.CSSProperties;
  }, [mousePos]);

  // ── Globe visual config — original isDark logic ───────────────────────────
  const globeImage = isDark
    ? '//unpkg.com/three-globe/example/img/earth-night.jpg'
    : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

  const bgColor    = isDark ? '#000000' : '#d4e4f7';
  // Use canvas-generated star field; fall back to CDN image if canvas unavailable
  const bgImageUrl = isDark
    ? (spaceBgUrl || '//unpkg.com/three-globe/example/img/night-sky.png')
    : undefined;

  const utcTime = fmtUtc(now);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: 'calc(100vh - 64px)', background: isDark ? '#000' : bgColor }}
      onMouseMove={handleMouseMove}
    >

      {/* ── Top-left: title + search ──────────────────────────────────────── */}
      <div ref={searchRef} className="absolute top-5 left-6 z-20 flex items-center gap-3">

        <span className={`text-[10px] font-black uppercase tracking-[0.35em] select-none shrink-0 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Globe
        </span>

        {/* Search pill */}
        <div className="relative">
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm ${isDark ? 'border-zinc-800 bg-zinc-950/80' : 'border-zinc-300 bg-white/80'}`}>
            <svg className={`w-3 h-3 shrink-0 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search country…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={e => {
                if (e.key === 'Escape') { setSearchQuery(''); setSearchOpen(false); }
                if (e.key === 'Enter' && searchResults[0]) selectCountry(searchResults[0]);
              }}
              className={`bg-transparent outline-none text-[11px] font-bold w-36 placeholder-zinc-600 ${isDark ? 'text-white' : 'text-black'}`}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchOpen(false); setHighlightedCountry(null); }}
                className={`leading-none transition-colors ${isDark ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Dropdown results */}
          {searchOpen && searchResults.length > 0 && (
            <div className={`absolute top-full left-0 mt-1.5 w-52 rounded-2xl border shadow-2xl overflow-hidden z-30 ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
              {searchResults.map((feature: any, i: number) => (
                <button
                  key={i}
                  onClick={() => selectCountry(feature)}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors group ${isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'}`}
                >
                  <span className={`text-[9px] font-black tracking-widest uppercase w-6 shrink-0 ${isDark ? 'text-zinc-600 group-hover:text-zinc-500' : 'text-zinc-400 group-hover:text-zinc-500'}`}>
                    {feature.properties?.ISO_A2 ?? '??'}
                  </span>
                  <span className={`text-[11px] font-bold truncate transition-colors ${isDark ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-black'}`}>
                    {feature.properties?.ADMIN ?? ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {searchOpen && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className={`absolute top-full left-0 mt-1.5 w-52 rounded-2xl border px-4 py-3 z-30 ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>No results</span>
            </div>
          )}
        </div>
      </div>

      {/* ── UTC Clock ─────────────────────────────────────────────────────── */}
      <div className="absolute top-4 right-8 z-10 pointer-events-none select-none text-right">
        <div className={`text-[9px] font-black uppercase tracking-[0.35em] mb-0.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
          UTC
        </div>
        <div className={`text-2xl font-black tabular-nums leading-none ${isDark ? 'text-white' : 'text-black'}`}>
          {utcTime}
        </div>
      </div>

      {/* ── Interaction hint ───────────────────────────────────────────────── */}
      <div className="absolute bottom-7 left-8 z-10 pointer-events-none select-none">
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>
          Drag to rotate &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Hover to inspect
        </p>
      </div>

      {/* ── GeoJSON error notice ──────────────────────────────────────────── */}
      {geoError && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className={`text-xs font-bold uppercase tracking-widest opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
            Country data unavailable — check network connection
          </div>
        </div>
      )}

      {/* ── Globe renderer ────────────────────────────────────────────────── */}
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={globeImage}
          backgroundImageUrl={bgImageUrl}
          backgroundColor={bgColor}
          polygonsData={geoData.features}
          polygonCapColor={getCapColor}
          polygonSideColor={() => 'rgba(0,0,0,0.04)'}
          polygonStrokeColor={getStrokeColor}
          polygonLabel={() => ''}
          onPolygonHover={setHoveredCountry}
          polygonsTransitionDuration={180}
          atmosphereColor={isDark ? 'rgba(130,170,255,0.18)' : 'rgba(100,150,255,0.35)'}
          atmosphereAltitude={0.13}
        />
      )}

      {/* ── Tooltip overlay ───────────────────────────────────────────────── */}
      {tooltipInfo && (
        <div className="fixed z-50 pointer-events-none" style={tooltipStyle}>
          <div className={`rounded-2xl border shadow-2xl min-w-[210px] overflow-hidden ${isDark ? 'bg-[#09090b] border-[#27272a]' : 'bg-white border-zinc-200'}`}>
            <div className={`px-4 pt-4 pb-3 ${isDark ? 'border-b border-[#18181b]' : 'border-b border-zinc-100'}`}>
              <div className={`text-[9px] font-black uppercase tracking-[0.35em] mb-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {tooltipInfo.isoCode || '—'}
              </div>
              <div className={`text-base font-black uppercase tracking-tight leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
                {tooltipInfo.name}
              </div>
            </div>
            <div className="px-4 py-3">
              {tooltipInfo.localTime ? (
                <>
                  <div className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Local Time
                  </div>
                  <div className={`text-2xl font-black tabular-nums leading-none mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                    {tooltipInfo.localTime}
                  </div>
                  <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${isDark ? 'bg-[#18181b]' : 'bg-zinc-50'}`}>
                    <span className={`text-[9px] font-bold uppercase tracking-wide truncate max-w-[110px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {tooltipInfo.iana}
                    </span>
                    <span className={`text-[9px] font-black shrink-0 ml-2 ${isDark ? 'text-white' : 'text-black'}`}>
                      {tooltipInfo.offset}
                    </span>
                  </div>
                </>
              ) : (
                <div className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  No timezone data
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobePage;
