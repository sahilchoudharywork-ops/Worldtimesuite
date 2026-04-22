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

interface LabelDatum {
  lat: number;
  lng: number;
  text: string;
  fontSize: number; // CSS pixels
}

// ─── Timezone Data Layer ──────────────────────────────────────────────────────

const TZ_OVERRIDES: Record<string, string> = {
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

const COUNTRY_TZ: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [code, country] of Object.entries(getAllCountries())) {
    const c = country as { timezones: string[] };
    const tz = TZ_OVERRIDES[code] ?? c.timezones[0] ?? null;
    if (tz) map[code] = tz;
  }
  return map;
})();

// ─── Geometry Helpers ─────────────────────────────────────────────────────────

/** Centroid of the largest polygon ring in a GeoJSON feature */
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

/** Bounding-box diagonal in degrees — proxy for country size */
const bboxDiagonal = (feature: any): number => {
  try {
    const all: number[][] = [];
    const collect = (geom: any) => {
      if (geom.type === 'Polygon') all.push(...geom.coordinates[0]);
      else if (geom.type === 'MultiPolygon')
        geom.coordinates.forEach((p: number[][][]) => all.push(...p[0]));
    };
    collect(feature.geometry);
    if (!all.length) return 0;
    const lngs = all.map(c => c[0]);
    const lats = all.map(c => c[1]);
    const dLng = Math.max(...lngs) - Math.min(...lngs);
    const dLat = Math.max(...lats) - Math.min(...lats);
    return Math.sqrt(dLng * dLng + dLat * dLat);
  } catch { return 0; }
};

/** Short display name for a country */
const shortName = (props: any): string => {
  const admin: string = props?.ADMIN ?? '';
  const abbrev: string = props?.ABBREV ?? '';
  const name: string = props?.NAME ?? admin;
  if (admin.length > 16 && abbrev && abbrev.length < admin.length) return abbrev;
  return name;
};

// ─── Canvas Projection ────────────────────────────────────────────────────────
// Projects a lat/lng on the globe surface to 2D screen coordinates
// using the Three.js camera matrices exposed by react-globe.gl.
// Returns null if the point is on the back hemisphere (not visible).

const projectPoint = (
  lat: number,
  lng: number,
  camera: any,          // THREE.Camera (no import needed — accessed via globeRef)
  width: number,
  height: number
): { x: number; y: number } | null => {
  // Globe-surface world position (react-globe.gl uses radius = 100)
  const phi   = (90 - lat)   * (Math.PI / 180);
  const theta = (lng + 180)  * (Math.PI / 180);
  const R = 100;
  const wx = -R * Math.sin(phi) * Math.cos(theta);
  const wy =  R * Math.cos(phi);
  const wz =  R * Math.sin(phi) * Math.sin(theta);

  // ── Back-face cull ───────────────────────────────────────────────────────
  // Dot product of normalised surface point vs normalised camera direction.
  // If dot < 0.08 the country is on the far side or too near the limb.
  const cp = camera.position;
  const cl = Math.sqrt(cp.x * cp.x + cp.y * cp.y + cp.z * cp.z) || 1;
  const dot = (wx * cp.x + wy * cp.y + wz * cp.z) / (R * cl);
  if (dot < 0.08) return null;

  // ── World → clip space ───────────────────────────────────────────────────
  // Two 4×4 column-major matrices from Three.js
  const mv = camera.matrixWorldInverse.elements as number[];
  const pr = camera.projectionMatrix.elements    as number[];

  // Apply matrixWorldInverse  (world → camera / view space)
  const vx = mv[0]*wx + mv[4]*wy + mv[8] *wz + mv[12];
  const vy = mv[1]*wx + mv[5]*wy + mv[9] *wz + mv[13];
  const vz = mv[2]*wx + mv[6]*wy + mv[10]*wz + mv[14];
  const vw = mv[3]*wx + mv[7]*wy + mv[11]*wz + mv[15];

  // Apply projectionMatrix  (view → clip space)
  const cx = pr[0]*vx + pr[4]*vy + pr[8] *vz + pr[12]*vw;
  const cy = pr[1]*vx + pr[5]*vy + pr[9] *vz + pr[13]*vw;
  const cw = pr[3]*vx + pr[7]*vy + pr[11]*vz + pr[15]*vw;

  if (Math.abs(cw) < 1e-6) return null;

  // NDC → screen pixels
  const screenX = ((cx / cw) + 1) * 0.5 * width;
  const screenY = ((-cy / cw) + 1) * 0.5 * height;

  // Reject points outside the canvas with a small margin
  const margin = 24;
  if (screenX < margin || screenX > width - margin) return null;
  if (screenY < margin || screenY > height - margin) return null;

  return { x: screenX, y: screenY };
};

// ─── Time Formatting Helpers ──────────────────────────────────────────────────

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

// ─── Globe Component ──────────────────────────────────────────────────────────

const GlobePage: React.FC<GlobePageProps> = ({ isDark }) => {
  const globeRef       = useRef<GlobeMethods | undefined>(undefined);
  const containerRef   = useRef<HTMLDivElement>(null);
  const labelCanvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef      = useRef<LabelDatum[]>([]);   // always-fresh ref for draw fn
  const idleTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef      = useRef<HTMLDivElement>(null);

  // State
  const [geoData, setGeoData]                   = useState<{ features: any[] }>({ features: [] });
  const [geoError, setGeoError]                 = useState(false);
  const [hoveredCountry, setHoveredCountry]     = useState<any>(null);
  const [mousePos, setMousePos]                 = useState({ x: 0, y: 0 });
  const [now, setNow]                           = useState(() => new Date());
  const [dimensions, setDimensions]             = useState({ width: 0, height: 0 });
  const [searchQuery, setSearchQuery]           = useState('');
  const [searchOpen, setSearchOpen]             = useState(false);
  const [highlightedCountry, setHighlightedCountry] = useState<any>(null);

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

  // ── ResizeObserver + canvas size sync ────────────────────────────────────
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      const w = Math.floor(r.width);
      const h = Math.floor(r.height);
      setDimensions({ width: w, height: h });
      // Resize canvas to match, accounting for retina displays
      const canvas = labelCanvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Country label data — computed once when GeoJSON arrives ───────────────
  const labelsData = useMemo<LabelDatum[]>(() => {
    return geoData.features
      .map((f: any) => {
        const diag = bboxDiagonal(f);
        if (diag < 5) return null;              // skip micro-states
        const centroid = computeCentroid(f);
        if (!centroid) return null;
        // Font size: 9–12px, proportional to country size
        const fontSize = Math.round(Math.min(12, Math.max(9, 7.5 + diag * 0.09)));
        return { ...centroid, text: shortName(f.properties), fontSize, feature: f };
      })
      .filter((d): d is LabelDatum & { feature: any } => d !== null);
  }, [geoData]);

  // Keep a ref in sync so drawLabelsOnce can always read current data
  useEffect(() => { labelsRef.current = labelsData; }, [labelsData]);

  // ── Canvas label draw (called once when globe becomes idle) ───────────────
  const drawLabelsOnce = useCallback(() => {
    const canvas = labelCanvasRef.current;
    const globe  = globeRef.current;
    if (!canvas || !globe) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w   = canvas.width  / dpr;
    const h   = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    const camera = globe.camera();

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    // Subtle shadow so text reads against both dark and bright globe regions
    ctx.shadowColor  = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur   = 4;

    for (const label of labelsRef.current) {
      const pos = projectPoint(label.lat, label.lng, camera, w, h);
      if (!pos) continue;

      ctx.font      = `700 ${label.fontSize}px Helvetica,Arial,sans-serif`;
      ctx.fillStyle = 'rgba(230,230,230,0.78)';
      ctx.fillText(label.text.toUpperCase(), pos.x, pos.y);
    }
  }, []); // no deps — reads only refs

  // ── Auto-rotate + idle detection → label drawing ─────────────────────────
  useEffect(() => {
    if (!globeRef.current || dimensions.width === 0) return;
    const controls = globeRef.current.controls() as any;
    controls.autoRotate     = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.08;

    const clearCanvas = () => {
      const canvas = labelCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    };

    const scheduleLabels = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(drawLabelsOnce, 180);
    };

    const onStart = () => {
      controls.autoRotate = false;
      clearCanvas();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };

    const onEnd = () => scheduleLabels();

    controls.addEventListener('start', onStart);
    controls.addEventListener('end',   onEnd);

    return () => {
      controls.removeEventListener('start', onStart);
      controls.removeEventListener('end',   onEnd);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [dimensions.width, drawLabelsOnce]);

  // Redraw labels when GeoJSON finally loads (if globe is already idle)
  useEffect(() => {
    if (labelsData.length > 0) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(drawLabelsOnce, 300);
    }
  }, [labelsData, drawLabelsOnce]);

  // ── Mouse tracking ────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

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

  // ── Fly to country + highlight ────────────────────────────────────────────
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
    return geoData.features
      .filter((f: any) => (f.properties?.ADMIN ?? '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, geoData]);

  // ── Polygon colours ───────────────────────────────────────────────────────
  const getCapColor = useCallback(
    (d: object) => {
      if (d === highlightedCountry) return 'rgba(255,255,255,0.20)';
      if (d === hoveredCountry)     return 'rgba(255,255,255,0.11)';
      return 'rgba(0,0,0,0)';
    },
    [hoveredCountry, highlightedCountry]
  );

  const getStrokeColor = useCallback(
    (d: object) => {
      if (d === highlightedCountry) return '#ffffff';
      if (d === hoveredCountry)     return 'rgba(255,255,255,0.7)';
      return '#383838';
    },
    [hoveredCountry, highlightedCountry]
  );

  // ── Tooltip ───────────────────────────────────────────────────────────────
  const tooltipInfo = useMemo<TooltipInfo | null>(() => {
    const active = hoveredCountry ?? highlightedCountry;
    if (!active) return null;
    const props    = active.properties ?? {};
    const isoCode  = props.ISO_A2 ?? '';
    const name     = props.ADMIN  ?? 'Unknown';
    const iana     = COUNTRY_TZ[isoCode] ?? null;
    if (!iana) return { name, isoCode, iana: null, localTime: null, offset: null };
    try {
      return { name, isoCode, iana, localTime: fmtLocalTime(iana, now), offset: fmtOffset(iana, now) };
    } catch {
      return { name, isoCode, iana, localTime: null, offset: null };
    }
  }, [hoveredCountry, highlightedCountry, now]);

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

      {/* ── Canvas label overlay (pointer-events:none — never blocks globe) ── */}
      <canvas
        ref={labelCanvasRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 5,
        }}
      />

      {/* ── Top-left: title + search ──────────────────────────────────────── */}
      <div ref={searchRef} className="absolute top-5 left-6 z-20 flex items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500 select-none shrink-0">
          Globe
        </span>

        {/* Search pill */}
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

          {/* Dropdown */}
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

      {/* ── UTC clock — top right ─────────────────────────────────────────── */}
      <div className="absolute top-4 right-8 z-10 pointer-events-none select-none text-right">
        <div className="text-[9px] font-black uppercase tracking-[0.35em] mb-0.5 text-zinc-600">UTC</div>
        <div className="text-2xl font-black tabular-nums leading-none text-white">{utcTime}</div>
      </div>

      {/* ── Interaction hint ──────────────────────────────────────────────── */}
      <div className="absolute bottom-7 left-6 z-10 pointer-events-none select-none">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-700">
          Drag to rotate &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Hover to inspect
        </p>
      </div>

      {/* ── GeoJSON error ────────────────────────────────────────────────── */}
      {geoError && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">
            Country data unavailable — check network connection
          </span>
        </div>
      )}

      {/* ── Globe ────────────────────────────────────────────────────────── */}
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          backgroundColor="#000000"
          polygonsData={geoData.features}
          polygonCapColor={getCapColor}
          polygonSideColor={() => 'rgba(0,0,0,0.04)'}
          polygonStrokeColor={getStrokeColor}
          polygonLabel={() => ''}
          onPolygonHover={setHoveredCountry}
          polygonsTransitionDuration={180}
          atmosphereColor="rgba(120,160,255,0.18)"
          atmosphereAltitude={0.13}
        />
      )}

      {/* ── Tooltip ──────────────────────────────────────────────────────── */}
      {tooltipInfo && hoveredCountry && (
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
