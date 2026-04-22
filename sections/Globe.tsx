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

// ─── Module-level constants — computed once per page load, never again ────────

// Country → primary IANA timezone map
const COUNTRY_TZ: Record<string, string> = (() => {
  const overrides: Record<string, string> = {
    US: 'America/New_York',  RU: 'Europe/Moscow',
    AU: 'Australia/Sydney',  CA: 'America/Toronto',
    BR: 'America/Sao_Paulo', MX: 'America/Mexico_City',
    CN: 'Asia/Shanghai',     ID: 'Asia/Jakarta',
    KZ: 'Asia/Almaty',       MN: 'Asia/Ulaanbaatar',
    CD: 'Africa/Kinshasa',   CL: 'America/Santiago',
    EC: 'America/Guayaquil', GL: 'America/Nuuk',
    PT: 'Europe/Lisbon',     ES: 'Europe/Madrid',
    NO: 'Europe/Oslo',       FM: 'Pacific/Pohnpei',
    KI: 'Pacific/Tarawa',    PF: 'Pacific/Tahiti',
    AQ: 'Antarctica/McMurdo',
  };
  const map: Record<string, string> = {};
  for (const [code, country] of Object.entries(getAllCountries())) {
    const c = country as { timezones: string[] };
    const tz = overrides[code] ?? c.timezones[0] ?? null;
    if (tz) map[code] = tz;
  }
  return map;
})();

// Canvas 2D star field — drawn once, reused for every Globe mount.
// Passed as backgroundImageUrl (Three.js equirectangular texture).
// The Globe page is always rendered as a dark/space experience regardless
// of the site's light/dark theme — this is intentional.
const SPACE_BG_URL: string = (() => {
  if (typeof document === 'undefined') return ''; // SSR guard
  const W = 2048, H = 1024;
  const cvs = document.createElement('canvas');
  cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext('2d');
  if (!ctx) return '';

  // Deep space base
  ctx.fillStyle = '#00000a';
  ctx.fillRect(0, 0, W, H);

  // 2800 stars — quadratic radius bias → mostly tiny (realistic distribution)
  for (let i = 0; i < 2800; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 0.3 + Math.random() * Math.random() * 1.6;
    const a = 0.2 + Math.random() * 0.8;
    // 85 % white · 10 % blue-white · 5 % warm yellow
    const col = i % 10 === 0 ? `rgba(180,205,255,${a})` :
                i % 20 === 0 ? `rgba(255,235,190,${a})` :
                               `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  }

  // 14 bright stars with radial glow
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

  // Subtle Milky Way band
  const mw = ctx.createLinearGradient(0, H * 0.25, W, H * 0.75);
  mw.addColorStop(0,    'rgba(255,255,255,0)');
  mw.addColorStop(0.35, 'rgba(210,220,255,0.05)');
  mw.addColorStop(0.5,  'rgba(210,225,255,0.09)');
  mw.addColorStop(0.65, 'rgba(210,220,255,0.05)');
  mw.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = mw;
  ctx.fillRect(0, 0, W, H);

  return cvs.toDataURL('image/jpeg', 0.92);
})();

// Globe always uses night texture — space view doesn't change with theme
const GLOBE_IMAGE = '//unpkg.com/three-globe/example/img/earth-night.jpg';

// ─── Geometry Helper ──────────────────────────────────────────────────────────

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

// ─── Time Formatting ──────────────────────────────────────────────────────────

const fmtLocalTime = (iana: string, date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: iana, hour: '2-digit', minute: '2-digit',
    second: '2-digit', hour12: true,
  }).format(date);

const fmtOffset = (iana: string, date: Date): string =>
  new Intl.DateTimeFormat('en-US', { timeZone: iana, timeZoneName: 'shortOffset' })
    .formatToParts(date).find(p => p.type === 'timeZoneName')?.value ?? '';

const fmtUtc = (date: Date): string =>
  date.toISOString().split('T')[1].split('.')[0];

// ─── Stable polygon colour functions (always-dark, no isDark branching) ───────
// Defined outside the component so their identity never changes → no extra
// useCallback overhead and react-globe.gl never re-uploads polygon buffers.

const TRANSPARENT   = 'rgba(0,0,0,0)';
const CAP_HOVER     = 'rgba(255,255,255,0.13)';
const CAP_HIGHLIGHT = 'rgba(255,255,255,0.20)';
const STROKE_ACTIVE = '#ffffff';
const STROKE_DEFAULT = '#3a3a3a';

// ─── Globe Component ──────────────────────────────────────────────────────────

const GlobePage: React.FC<GlobePageProps> = ({ isDark }) => {
  const globeRef     = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef    = useRef<HTMLDivElement>(null);
  const mouseRAF     = useRef<number>(0); // for RAF-throttled mousemove

  // Geo data
  const [geoData, setGeoData]   = useState<{ features: object[] }>({ features: [] });
  const [geoError, setGeoError] = useState(false);

  // Interaction
  const [hoveredCountry, setHoveredCountry]         = useState<any>(null);
  const [highlightedCountry, setHighlightedCountry] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen]   = useState(false);

  // Clock
  const [now, setNow]           = useState(() => new Date());
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // ── Fetch GeoJSON ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setGeoData)
      .catch(() => setGeoError(true));
  }, []);

  // ── 1-second clock ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── ResizeObserver ────────────────────────────────────────────────────────
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const r = entries[0]?.contentRect;
      if (r) setDimensions({ width: Math.floor(r.width), height: Math.floor(r.height) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Auto-rotate ───────────────────────────────────────────────────────────
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
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // ── RAF-throttled mousemove — caps tooltip position updates at 60 fps ─────
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const x = e.clientX, y = e.clientY;
    cancelAnimationFrame(mouseRAF.current);
    mouseRAF.current = requestAnimationFrame(() => setMousePos({ x, y }));
  }, []);

  // ── Polygon colours ───────────────────────────────────────────────────────
  const getCapColor = useCallback(
    (d: object) => {
      if (d === highlightedCountry) return CAP_HIGHLIGHT;
      if (d === hoveredCountry)     return CAP_HOVER;
      return TRANSPARENT;
    },
    [hoveredCountry, highlightedCountry]
  );

  const getStrokeColor = useCallback(
    (d: object) =>
      (d === hoveredCountry || d === highlightedCountry) ? STROKE_ACTIVE : STROKE_DEFAULT,
    [hoveredCountry, highlightedCountry]
  );

  // ── Search ────────────────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return (geoData.features as any[])
      .filter(f => (f.properties?.ADMIN ?? '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, geoData]);

  const selectCountry = useCallback((feature: any) => {
    const c = computeCentroid(feature);
    if (c && globeRef.current)
      globeRef.current.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.4 }, 900);
    setHighlightedCountry(feature);
    setSearchQuery('');
    setSearchOpen(false);
  }, []);

  // ── Tooltip ───────────────────────────────────────────────────────────────
  const tooltipInfo = useMemo<TooltipInfo | null>(() => {
    if (!hoveredCountry) return null;
    const props   = (hoveredCountry as any).properties ?? {};
    const isoCode = props.ISO_A2 ?? '';
    const name    = props.ADMIN  ?? 'Unknown';
    const iana    = COUNTRY_TZ[isoCode] ?? null;
    if (!iana) return { name, isoCode, iana: null, localTime: null, offset: null };
    try {
      return { name, isoCode, iana, localTime: fmtLocalTime(iana, now), offset: fmtOffset(iana, now) };
    } catch {
      return { name, isoCode, iana, localTime: null, offset: null };
    }
  }, [hoveredCountry, now]);

  const tooltipStyle = useMemo(() => {
    const W = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const flipX = mousePos.x > W - 280;
    return {
      left: flipX ? mousePos.x - 16 : mousePos.x + 16,
      top:  mousePos.y + 16,
      transform: flipX ? 'translateX(-100%)' : undefined,
    } as React.CSSProperties;
  }, [mousePos]);

  const utcTime = fmtUtc(now);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: 'calc(100vh - 64px)', background: '#000' }}
      onMouseMove={handleMouseMove}
    >

      {/* ── Top-left: title + search ──────────────────────────────────────── */}
      <div ref={searchRef} className="absolute top-5 left-6 z-20 flex items-center gap-3">

        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500 select-none shrink-0">
          Globe
        </span>

        <div className="relative">
          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm px-3 py-1.5">
            <svg className="w-3 h-3 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="bg-transparent outline-none text-[11px] font-bold text-white placeholder-zinc-600 w-36"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchOpen(false); setHighlightedCountry(null); }}
                className="text-zinc-600 hover:text-zinc-400 transition-colors leading-none"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1.5 w-52 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden z-30">
              {searchResults.map((feature: any, i: number) => (
                <button
                  key={i}
                  onClick={() => selectCountry(feature)}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-900 transition-colors group"
                >
                  <span className="text-[9px] font-black text-zinc-600 group-hover:text-zinc-500 tracking-widest uppercase w-6 shrink-0">
                    {feature.properties?.ISO_A2 ?? '??'}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors truncate">
                    {feature.properties?.ADMIN ?? ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchOpen && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="absolute top-full left-0 mt-1.5 w-52 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 z-30">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No results</span>
            </div>
          )}
        </div>
      </div>

      {/* ── UTC clock ─────────────────────────────────────────────────────── */}
      <div className="absolute top-4 right-8 z-10 pointer-events-none select-none text-right">
        <div className="text-[9px] font-black uppercase tracking-[0.35em] mb-0.5 text-zinc-600">UTC</div>
        <div className="text-2xl font-black tabular-nums leading-none text-white">{utcTime}</div>
      </div>

      {/* ── Hint ──────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-7 left-8 z-10 pointer-events-none select-none">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
          Drag to rotate &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Hover to inspect
        </p>
      </div>

      {/* ── GeoJSON error ─────────────────────────────────────────────────── */}
      {geoError && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">
            Country data unavailable — check network connection
          </span>
        </div>
      )}

      {/* ── Globe ─────────────────────────────────────────────────────────── */}
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={GLOBE_IMAGE}
          backgroundImageUrl={SPACE_BG_URL || '//unpkg.com/three-globe/example/img/night-sky.png'}
          backgroundColor="#000000"
          polygonsData={geoData.features}
          polygonCapColor={getCapColor}
          polygonSideColor={() => 'rgba(0,0,0,0.04)'}
          polygonStrokeColor={getStrokeColor}
          polygonLabel={() => ''}
          onPolygonHover={setHoveredCountry}
          polygonsTransitionDuration={180}
          atmosphereColor="rgba(130,170,255,0.18)"
          atmosphereAltitude={0.13}
        />
      )}

      {/* ── Tooltip ───────────────────────────────────────────────────────── */}
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
