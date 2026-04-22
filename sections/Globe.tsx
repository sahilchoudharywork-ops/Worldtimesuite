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
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Geo data
  const [geoData, setGeoData] = useState<{ features: object[] }>({ features: [] });
  const [geoError, setGeoError] = useState(false);

  // Interaction state
  const [hoveredCountry, setHoveredCountry] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    const stop = () => { controls.autoRotate = false; };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [dimensions.width]); // re-attach when globe first renders

  // ── Mouse tracking for tooltip position ──────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  // ── Polygon colours ───────────────────────────────────────────────────────
  const getCapColor = useCallback(
    (d: object) =>
      d === hoveredCountry
        ? isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.12)'
        : 'rgba(0,0,0,0)',
    [hoveredCountry, isDark]
  );

  const getStrokeColor = useCallback(
    (d: object) =>
      d === hoveredCountry
        ? isDark ? '#ffffff' : '#000000'
        : isDark ? '#3a3a3a' : '#c0c0c0',
    [hoveredCountry, isDark]
  );

  // ── Tooltip data — computed on hover + clock tick ─────────────────────────
  const tooltipInfo = useMemo<TooltipInfo | null>(() => {
    if (!hoveredCountry) return null;
    const props = (hoveredCountry as any).properties ?? {};
    const isoCode: string = props.ISO_A2 ?? '';
    const name: string = props.ADMIN ?? 'Unknown';
    const iana = COUNTRY_TZ[isoCode] ?? null;

    if (!iana) return { name, isoCode, iana: null, localTime: null, offset: null };

    try {
      return {
        name,
        isoCode,
        iana,
        localTime: fmtLocalTime(iana, now),
        offset: fmtOffset(iana, now),
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
      top: mousePos.y + 16,
      transform: flipX ? 'translateX(-100%)' : undefined,
    } as React.CSSProperties;
  }, [mousePos]);

  // ── Globe visual config ───────────────────────────────────────────────────
  const globeImage = isDark
    ? '//unpkg.com/three-globe/example/img/earth-night.jpg'
    : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

  const bgColor = isDark ? '#000000' : '#d4e4f7';
  const bgImageUrl = isDark
    ? '//unpkg.com/three-globe/example/img/night-sky.png'
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

      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <div className="absolute top-6 left-8 z-10 pointer-events-none select-none">
        <span className={`text-xs font-black uppercase tracking-[0.35em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Globe
        </span>
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

      {/* ── GeoJSON error notice ────────────────────────────────────────────── */}
      {geoError && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className={`text-xs font-bold uppercase tracking-widest opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
            Country data unavailable — check network connection
          </div>
        </div>
      )}

      {/* ── Globe renderer ─────────────────────────────────────────────────── */}
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
          polygonLabel={() => ''} // disabled — we render our own React tooltip
          onPolygonHover={setHoveredCountry}
          polygonsTransitionDuration={180}
          atmosphereColor={isDark ? 'rgba(130,170,255,0.18)' : 'rgba(100,150,255,0.35)'}
          atmosphereAltitude={0.13}
        />
      )}

      {/* ── Tooltip overlay ────────────────────────────────────────────────── */}
      {tooltipInfo && (
        <div className="fixed z-50 pointer-events-none" style={tooltipStyle}>
          <div
            className={`rounded-2xl border shadow-2xl min-w-[210px] overflow-hidden ${
              isDark
                ? 'bg-[#09090b] border-[#27272a]'
                : 'bg-white border-zinc-200'
            }`}
          >
            {/* Header strip */}
            <div className={`px-4 pt-4 pb-3 ${isDark ? 'border-b border-[#18181b]' : 'border-b border-zinc-100'}`}>
              <div className={`text-[9px] font-black uppercase tracking-[0.35em] mb-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {tooltipInfo.isoCode || '—'}
              </div>
              <div className={`text-base font-black uppercase tracking-tight leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
                {tooltipInfo.name}
              </div>
            </div>

            {/* Time section */}
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
