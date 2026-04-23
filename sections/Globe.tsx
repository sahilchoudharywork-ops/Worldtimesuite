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

// ─── Timezone overrides (multi-timezone countries → capital zone) ─────────────

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

// ─── Star field — generated once per page load as a data URL ─────────────────
// Passed to react-globe.gl's backgroundImageUrl which maps it onto the
// Three.js sky sphere surrounding the globe. Runs in an IIFE so the canvas
// is created exactly once regardless of how many times the component mounts.

const STAR_BG_URL: string = (() => {
  if (typeof document === 'undefined') return '';
  const W = 2048, H = 1024;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const ctx = cvs.getContext('2d');
  if (!ctx) return '';

  // Deep space base
  ctx.fillStyle = '#00000c';
  ctx.fillRect(0, 0, W, H);

  // ~2000 stars with varied size + colour
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 0.3 + Math.random() * Math.random() * 1.5;
    const a = 0.2 + Math.random() * 0.8;
    const roll = i % 20;
    const col =
      roll === 0 ? `rgba(180,210,255,${a})` :   // blue-white
      roll === 1 ? `rgba(255,220,170,${a})` :   // warm yellow
                   `rgba(255,255,255,${a})`;    // white
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  }

  // 12 bright stars with a subtle glow halo
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 5);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.3)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 5, y - 5, 10, 10);
  }

  return cvs.toDataURL('image/jpeg', 0.92);
})();

// ─── Geometry helper (fly-to on search) ──────────────────────────────────────

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
  } catch {
    return null;
  }
};

// ─── Time helpers ─────────────────────────────────────────────────────────────

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

// ─── Globe page ───────────────────────────────────────────────────────────────

const GlobePage: React.FC<GlobePageProps> = ({ isDark }) => {
  const globeRef     = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef    = useRef<HTMLDivElement>(null);

  const [geoData, setGeoData]   = useState<{ features: object[] }>({ features: [] });
  const [geoError, setGeoError] = useState(false);

  const [hoveredCountry, setHoveredCountry]         = useState<any>(null);
  const [highlightedCountry, setHighlightedCountry] = useState<any>(null);
  const [mousePos, setMousePos]                     = useState({ x: 0, y: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen]   = useState(false);

  const [now, setNow]             = useState(() => new Date());
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // ── Fetch country polygons ────────────────────────────────────────────────
  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'
    )
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setGeoData)
      .catch(() => setGeoError(true));
  }, []);

  // ── 1-second clock ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Responsive sizing ─────────────────────────────────────────────────────
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const r = entries[0]?.contentRect;
      if (r) setDimensions({ width: Math.floor(r.width), height: Math.floor(r.height) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Auto-rotate, stop on first drag ──────────────────────────────────────
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

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const selectCountry = useCallback((feature: any) => {
    const centroid = computeCentroid(feature);
    if (centroid && globeRef.current)
      globeRef.current.pointOfView({ lat: centroid.lat, lng: centroid.lng, altitude: 1.4 }, 900);
    setHighlightedCountry(feature);
    setSearchQuery('');
    setSearchOpen(false);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return (geoData.features as any[])
      .filter(f => (f.properties?.ADMIN ?? '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, geoData]);

  // Polygon colours — white hover/highlight, subtle stroke always
  const getCapColor = useCallback((d: object) => {
    if (d === highlightedCountry) return 'rgba(255,255,255,0.20)';
    if (d === hoveredCountry)     return 'rgba(255,255,255,0.13)';
    return 'rgba(0,0,0,0)';
  }, [hoveredCountry, highlightedCountry]);

  const getStrokeColor = useCallback((d: object) => {
    if (d === highlightedCountry || d === hoveredCountry) return '#ffffff';
    return '#3a3a3a';
  }, [hoveredCountry, highlightedCountry]);

  const tooltipInfo = useMemo<TooltipInfo | null>(() => {
    if (!hoveredCountry) return null;
    const props    = (hoveredCountry as any).properties ?? {};
    const isoCode  = (props.ISO_A2 ?? '') as string;
    const name     = (props.ADMIN  ?? 'Unknown') as string;
    const iana     = COUNTRY_TZ[isoCode] ?? null;
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

  // Globe always shows the blue-marble (day) texture — same in dark and light mode
  const GLOBE_IMAGE = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: 'calc(100vh - 64px)', background: '#000' }}
      onMouseMove={handleMouseMove}
    >

      {/* ── Top-left: GLOBE label + search ───────────────────────────────── */}
      <div ref={searchRef} className="absolute top-5 left-6 z-20 flex items-center gap-3">

        <span className="text-[10px] font-black uppercase tracking-[0.35em] select-none shrink-0 text-zinc-400">
          Globe
        </span>

        <div className="relative">
          {/* Search pill — dark background always so it's readable on the star field */}
          <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 backdrop-blur-sm">
            <svg className="w-3 h-3 shrink-0 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="bg-transparent outline-none text-[11px] font-bold w-36 text-white placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchOpen(false); setHighlightedCountry(null); }}
                className="leading-none text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Dropdown results */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1.5 w-52 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden z-30">
              {searchResults.map((feature: any, i: number) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => selectCountry(feature)}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors group hover:bg-zinc-900"
                >
                  <span className="text-[9px] font-black tracking-widest uppercase w-6 shrink-0 text-zinc-600 group-hover:text-zinc-400">
                    {feature.properties?.ISO_A2 ?? '??'}
                  </span>
                  <span className="text-[11px] font-bold truncate text-zinc-300 group-hover:text-white transition-colors">
                    {feature.properties?.ADMIN ?? ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {searchOpen && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="absolute top-full left-0 mt-1.5 w-52 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 z-30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">No results</span>
            </div>
          )}
        </div>
      </div>

      {/* ── UTC Clock — always white, always readable ─────────────────────── */}
      <div className="absolute top-4 right-8 z-10 pointer-events-none select-none text-right">
        <div className="text-[9px] font-black uppercase tracking-[0.35em] mb-0.5 text-zinc-500">
          UTC
        </div>
        <div className="text-2xl font-black tabular-nums leading-none text-white">
          {utcTime}
        </div>
      </div>

      {/* ── Interaction hint ──────────────────────────────────────────────── */}
      <div className="absolute bottom-7 left-8 z-10 pointer-events-none select-none">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
          Drag to rotate &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Hover to inspect
        </p>
      </div>

      {/* ── GeoJSON error ─────────────────────────────────────────────────── */}
      {geoError && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-xs font-bold uppercase tracking-widest opacity-40 text-white">
            Country data unavailable — check network connection
          </div>
        </div>
      )}

      {/* ── Globe ─────────────────────────────────────────────────────────── */}
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={GLOBE_IMAGE}
          backgroundImageUrl={STAR_BG_URL || '//unpkg.com/three-globe/example/img/night-sky.png'}
          backgroundColor="#000000"
          atmosphereColor="rgba(100,160,255,0.35)"
          atmosphereAltitude={0.13}
          polygonsData={geoData.features}
          polygonCapColor={getCapColor}
          polygonSideColor={() => 'rgba(0,0,0,0.04)'}
          polygonStrokeColor={getStrokeColor}
          polygonLabel={() => ''}
          onPolygonHover={setHoveredCountry}
          polygonsTransitionDuration={180}
        />
      )}

      {/* ── Tooltip ───────────────────────────────────────────────────────── */}
      {tooltipInfo && (
        <div className="fixed z-50 pointer-events-none" style={tooltipStyle}>
          <div className="rounded-2xl border border-[#27272a] bg-[#09090b] shadow-2xl min-w-[210px] overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-[#18181b]">
              <div className="text-[9px] font-black uppercase tracking-[0.35em] mb-1 text-zinc-600">
                {tooltipInfo.isoCode || '—'}
              </div>
              <div className="text-base font-black uppercase tracking-tight leading-tight text-white">
                {tooltipInfo.name}
              </div>
            </div>
            <div className="px-4 py-3">
              {tooltipInfo.localTime ? (
                <>
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-1 text-zinc-600">
                    Local Time
                  </div>
                  <div className="text-2xl font-black tabular-nums leading-none mb-3 text-white">
                    {tooltipInfo.localTime}
                  </div>
                  <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-[#18181b]">
                    <span className="text-[9px] font-bold uppercase tracking-wide truncate max-w-[110px] text-zinc-500">
                      {tooltipInfo.iana}
                    </span>
                    <span className="text-[9px] font-black shrink-0 ml-2 text-white">
                      {tooltipInfo.offset}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
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
