
import React, { useState, useCallback, useEffect } from 'react';
import * as ct from 'https://esm.sh/countries-and-timezones@^3.7.1';
import { COMMON_TIMEZONES } from '../constants';
import { Timezone } from '../types';

interface TimezoneConverterProps {
  isDark: boolean;
}

interface ConversionHistoryItem {
  id: string;
  query: string;
  sourceName: string;
  sourceIana: string;
  sourceTime: string;
  targetName: string;
  targetIana: string;
  targetTime: string;
  createdAt: number;
}

const EXTENDED_ZONE_MAP: Record<string, string> = {
  'IST': 'Asia/Kolkata', 'INDIA': 'Asia/Kolkata', 'BOMBAY': 'Asia/Kolkata', 'DELHI': 'Asia/Kolkata', 'KOLKATA': 'Asia/Kolkata',
  'EST': 'America/New_York', 'EDT': 'America/New_York', 'NEW YORK': 'America/New_York', 'NY': 'America/New_York', 'NYC': 'America/New_York',
  'PST': 'America/Los_Angeles', 'PDT': 'America/Los_Angeles', 'LA': 'America/Los_Angeles', 'CALIFORNIA': 'America/Los_Angeles', 'SF': 'America/Los_Angeles', 'SAN FRANCISCO': 'America/Los_Angeles',
  'CST': 'America/Chicago', 'CDT': 'America/Chicago', 'CHICAGO': 'America/Chicago',
  'MST': 'America/Denver', 'MDT': 'America/Denver', 'DENVER': 'America/Denver',
  'GMT': 'Europe/London', 'BST': 'Europe/London', 'LONDON': 'Europe/London', 'UK': 'Europe/London', 'ENGLAND': 'Europe/London',
  'CET': 'Europe/Berlin', 'CEST': 'Europe/Berlin', 'BERLIN': 'Europe/Berlin', 'GERMANY': 'Europe/Berlin', 'PARIS': 'Europe/Paris', 'FRANCE': 'Europe/Paris',
  'JST': 'Asia/Tokyo', 'TOKYO': 'Asia/Tokyo', 'JAPAN': 'Asia/Tokyo',
  'AEST': 'Australia/Sydney', 'AEDT': 'Australia/Sydney', 'SYDNEY': 'Australia/Sydney', 'MELBOURNE': 'Australia/Melbourne',
  'SGT': 'Asia/Singapore', 'SINGAPORE': 'Asia/Singapore',
  'GST': 'Asia/Dubai', 'DUBAI': 'Asia/Dubai', 'UAE': 'Asia/Dubai',
  'RUSSIA': 'Europe/Moscow', 'MOSCOW': 'Europe/Moscow', 'MSK': 'Europe/Moscow',
  'TORONTO': 'America/Toronto', 'CANADA': 'America/Toronto', 'ONTARIO': 'America/Toronto',
  'HKT': 'Asia/Hong_Kong', 'HONG KONG': 'Asia/Hong_Kong',
  'WET': 'Europe/Lisbon', 'PORTUGAL': 'Europe/Lisbon', 'LISBON': 'Europe/Lisbon',
  'BRT': 'America/Sao_Paulo', 'BRAZIL': 'America/Sao_Paulo', 'SAO PAULO': 'America/Sao_Paulo'
};

// Global Resolution Engine
const normalizeKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const ALL_IANA_ZONES: string[] = (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf('timeZone') : [];
const GLOBAL_ZONE_INDEX: Record<string, string> = {};
const COUNTRY_ZONE_INDEX: Record<string, string> = {};

// Build Indexes
ALL_IANA_ZONES.forEach(iana => {
  const parts = iana.split('/');
  const city = parts[parts.length - 1];
  GLOBAL_ZONE_INDEX[normalizeKey(city)] = iana;
  GLOBAL_ZONE_INDEX[normalizeKey(iana)] = iana;
});

const countries = ct.getAllCountries();
Object.values(countries).forEach((country: any) => {
  const primaryZone = country.timezones[0];
  if (primaryZone) {
    COUNTRY_ZONE_INDEX[normalizeKey(country.name)] = primaryZone;
    COUNTRY_ZONE_INDEX[normalizeKey(country.id)] = primaryZone;
  }
});

const resolveIanaFromQuery = (query: string): string | null => {
  const norm = normalizeKey(query);
  if (!norm) return null;
  // 1. Fast path: Extended Map
  const upper = query.toUpperCase().trim();
  if (EXTENDED_ZONE_MAP[upper]) return EXTENDED_ZONE_MAP[upper];
  // 2. Exact City/IANA match
  if (GLOBAL_ZONE_INDEX[norm]) return GLOBAL_ZONE_INDEX[norm];
  // 3. Country match
  if (COUNTRY_ZONE_INDEX[norm]) return COUNTRY_ZONE_INDEX[norm];
  // 4. Fuzzy search through all zones
  return ALL_IANA_ZONES.find(z => normalizeKey(z).includes(norm)) || null;
};

const toZoneLabel = (iana: string) => {
  const parts = iana.split('/');
  const last = parts[parts.length - 1].replace(/_/g, ' ');
  return last.charAt(0).toUpperCase() + last.slice(1);
};

// Formatter Caching Layer
const TZ_PARTS_FORMATTER_CACHE: Record<string, Intl.DateTimeFormat> = {};
const TZ_DISPLAY_FORMATTER_CACHE: Record<string, Intl.DateTimeFormat> = {};

const getPartsFormatter = (iana: string) => {
  if (!TZ_PARTS_FORMATTER_CACHE[iana]) {
    TZ_PARTS_FORMATTER_CACHE[iana] = new Intl.DateTimeFormat('en-US', {
      timeZone: iana, hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
    });
  }
  return TZ_PARTS_FORMATTER_CACHE[iana];
};

const getDisplayFormatter = (iana: string) => {
  if (!TZ_DISPLAY_FORMATTER_CACHE[iana]) {
    TZ_DISPLAY_FORMATTER_CACHE[iana] = new Intl.DateTimeFormat('en-US', {
      timeZone: iana, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, weekday: 'short', month: 'short', day: 'numeric'
    });
  }
  return TZ_DISPLAY_FORMATTER_CACHE[iana];
};

const TimezoneConverter: React.FC<TimezoneConverterProps> = ({ isDark }) => {
  const [naturalInput, setNaturalInput] = useState('');
  const [baseTime, setBaseTime] = useState(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d;
  });
  const [sourceTz, setSourceTz] = useState<Timezone>(COMMON_TIMEZONES[3]);
  const [targets, setTargets] = useState<Timezone[]>([
    { name: 'Toronto', iana: 'America/Toronto', offset: -5 }
  ]);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => setBaseTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // DST-Safe Time Conversion Helpers
  const getZoneDateParts = (date: Date, iana: string) => {
    const parts = getPartsFormatter(iana).formatToParts(date);
    const p = (type: string) => parseInt(parts.find(x => x.type === type)?.value || '0');
    return { year: p('year'), month: p('month'), day: p('day'), hour: p('hour'), minute: p('minute'), second: p('second') };
  };

  const zonedTimeToUtc = (input: { year: number, month: number, day: number, hour: number, minute: number, second: number }, iana: string) => {
    const targetWallMs = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, input.second);
    let utcMillis = targetWallMs;
    // Iterative Correction for DST-safe wall-clock matching
    for (let i = 0; i < 4; i++) {
      const date = new Date(utcMillis);
      const parts = getZoneDateParts(date, iana);
      const zoneWallMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
      const diff = targetWallMs - zoneWallMs;
      if (diff === 0) break;
      utcMillis += diff;
    }
    return new Date(utcMillis);
  };

  const getTzInfo = useCallback((date: Date, iana: string) => {
    try {
      const parts = getDisplayFormatter(iana).formatToParts(date);
      const p = (type: string) => parts.find(part => part.type === type)?.value || '';
      
      const timeStr = `${p('hour')}:${p('minute')}:${p('second')} ${p('dayPeriod')}`;
      const shortTime = `${p('hour')}:${p('minute')}${p('dayPeriod')?.toLowerCase().charAt(0)}`;
      
      return { 
        time: timeStr, shortTime,
        hour: parseInt(p('hour')), minute: parseInt(p('minute')), second: parseInt(p('second')),
        dayPeriod: p('dayPeriod')?.toLowerCase() || '',
        date: `${p('weekday')}, ${p('month')} ${p('day')}`.toUpperCase(),
        dayName: p('weekday').toUpperCase(), monthDay: `${p('month')} ${p('day')}`.toUpperCase()
      };
    } catch {
      return { time: '--:--:--', shortTime: '--:--', hour: 0, minute: 0, second: 0, dayPeriod: '', date: '', dayName: '', monthDay: '' };
    }
  }, []);

  const getOffsetString = (iana: string, date: Date = new Date()) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: iana, timeZoneName: 'shortOffset' }).formatToParts(date);
      return parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
    } catch { return 'GMT+0'; }
  };

  const getRelativeOffset = (iana: string, refIana: string) => {
    try {
      const now = new Date();
      const getOffset = (tz: string) => {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(now);
        const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
        const match = offsetStr.match(/([-+])(\d+):?(\d+)?/);
        if (!match) return 0;
        const sign = match[1] === '-' ? -1 : 1;
        const h = parseInt(match[2]);
        const m = match[3] ? parseInt(match[3]) : 0;
        return sign * (h + m / 60);
      };
      const diff = getOffset(iana) - getOffset(refIana);
      return diff === 0 ? "0" : (diff > 0 ? `+${diff}` : `${diff}`);
    } catch { return "0"; }
  };

  const performLocalParse = (input: string, commitToHistory: boolean = false) => {
    const text = input.toUpperCase().trim();
    if (!text) return;

    // Split Zones
    const zoneParts = text.replace(/\b(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?\b/gi, '').split(/\s+(?:TO|INTO|IN|AND|AT)\s+/i);
    
    const findZone = (query: string): Timezone | null => {
      const iana = resolveIanaFromQuery(query);
      if (!iana) return null;
      return { name: toZoneLabel(iana), iana, offset: 0 };
    };

    let activeSrc = sourceTz;
    let activeTgt = targets[0] || { name: 'Target', iana: 'UTC', offset: 0 };

    if (zoneParts.length >= 2) {
      const src = findZone(zoneParts[0]);
      const tgt = findZone(zoneParts[1]);
      if (src) { setSourceTz(src); activeSrc = src; }
      if (tgt) { setTargets([tgt]); activeTgt = tgt; }
    } else if (zoneParts.length === 1) {
      const single = findZone(zoneParts[0]);
      if (single) { setSourceTz(single); activeSrc = single; }
    }

    // Time Match & Anchoring
    const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?\b/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1]);
      const m = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const s = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
      const period = timeMatch[4];
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;

      const now = new Date();
      const zoneNowParts = getZoneDateParts(now, activeSrc.iana);
      const targetUtc = zonedTimeToUtc({ 
        year: zoneNowParts.year, month: zoneNowParts.month, day: zoneNowParts.day, 
        hour: h, minute: m, second: s 
      }, activeSrc.iana);

      setBaseTime(targetUtc);
      setIsLive(false);

      if (commitToHistory) {
        // History Insertion Logic
        const srcInfo = getTzInfo(targetUtc, activeSrc.iana);
        const tgtInfo = getTzInfo(targetUtc, activeTgt.iana);

        const entry: ConversionHistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          query: input,
          sourceName: activeSrc.name,
          sourceIana: activeSrc.iana,
          sourceTime: srcInfo.time,
          targetName: activeTgt.name,
          targetIana: activeTgt.iana,
          targetTime: tgtInfo.time,
          createdAt: Date.now()
        };

        setHistory(prev => [entry, ...prev].slice(0, 3));
      }
    }
  };

  const handleConvert = () => {
    const trimmed = naturalInput.trim();
    setIsLoading(true);
    if (!trimmed) {
      setIsLive(true);
      setIsLoading(false);
      return;
    }
    performLocalParse(trimmed, true);
    setIsLoading(false);
  };

  const getTimelineData = (iana: string, refDate: Date) => {
    const cells = [];
    const alignedDate = new Date(refDate);
    alignedDate.setMinutes(alignedDate.getMinutes() < 30 ? 0 : 30, 0, 0);
    const startTime = new Date(alignedDate.getTime() - 15 * 30 * 60000); 

    for (let i = 0; i < 48; i++) {
      const d = new Date(startTime.getTime() + i * 30 * 60000);
      const info = getTzInfo(d, iana);
      const isHalf = d.getMinutes() === 30;
      const hourVal = parseInt(d.toLocaleTimeString('en-US', { timeZone: iana, hour: 'numeric', hourCycle: 'h23' }));
      const cellType: 'night' | 'day' = (hourVal < 6 || hourVal >= 18) ? 'night' : 'day';
      
      cells.push({
        fullDate: d, hourLabel: isHalf ? '' : (info.hour === 0 ? '12' : info.hour),
        period: isHalf ? '' : info.dayPeriod, isHalf, cellType,
        dayName: info.dayName, monthDay: info.monthDay, isDayStart: info.hour === 0 && info.minute === 0
      });
    }
    return cells;
  };

  const allTzs = [sourceTz, ...targets];
  const textColor = isDark ? 'text-white' : 'text-black';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const borderClass = isDark ? 'border-zinc-800' : 'border-zinc-200';

  return (
    <div className={`p-8 space-y-12 ${bgColor} ${textColor} font-['Helvetica_Neue',Helvetica,sans-serif]`}>
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Timezone Converter</h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-30">Instant Synchronization • Professional Accuracy</p>
      </header>

      <div className="max-w-4xl mx-auto flex gap-4">
        <div className={`flex-grow flex items-center px-6 py-4 rounded-full border-2 ${borderClass} focus-within:border-blue-500 transition-all shadow-2xl bg-white/5`}>
          <svg className="w-6 h-6 opacity-30 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            className="flex-grow bg-transparent border-none outline-none font-bold text-lg" 
            placeholder="e.g. 8 pm russia to london"
            value={naturalInput}
            onChange={(e) => {
              setNaturalInput(e.target.value);
              if (e.target.value.length > 1) performLocalParse(e.target.value, false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
          />
        </div>
        <button onClick={handleConvert} className="px-10 bg-white text-black rounded-full font-black uppercase text-sm tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-lg">
          {isLoading ? 'Syncing...' : 'Convert'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className={`border border-zinc-900 rounded-[2.5rem] overflow-hidden bg-black shadow-2xl transition-all duration-300`}>
          <div className="grid grid-cols-12 px-12 pt-8 pb-4 border-b border-zinc-900/50">
            <div className="col-span-5 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Source Timezone</div>
            <div className="col-span-2 text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Direction</div>
            <div className="col-span-5 text-right text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Target Local Time</div>
          </div>

          {targets.map((tz, idx) => {
            const srcInfo = getTzInfo(baseTime, sourceTz.iana);
            const tgtInfo = getTzInfo(baseTime, tz.iana);
            return (
              <div key={`${tz.iana}-${idx}`} className="grid grid-cols-12 px-12 py-14 items-center last:border-0 border-b border-zinc-900/30">
                <div className="col-span-5 space-y-1">
                  <div className="text-4xl font-bold tracking-tight text-white uppercase truncate">{sourceTz.name}</div>
                  <div className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">{sourceTz.iana.toUpperCase()} (GMT{getOffsetString(sourceTz.iana, baseTime)})</div>
                  <div className="text-6xl font-black tracking-tighter text-blue-500 tabular-nums">{srcInfo.time}</div>
                </div>
                <div className="col-span-2 flex flex-col items-center justify-center opacity-40">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Converted</span>
                </div>
                <div className="col-span-5 text-right space-y-1">
                  <div className="text-4xl font-bold tracking-tight text-white uppercase truncate">{tz.name}</div>
                  <div className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">{tz.iana.toUpperCase()} (GMT{getOffsetString(tz.iana, baseTime)})</div>
                  <div className="text-6xl font-black tracking-tighter text-green-500 tabular-nums">{tgtInfo.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversion History Section */}
      <div className="max-w-6xl mx-auto mt-20">
        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] opacity-30 mb-8">
          <div className="w-20 h-px bg-current"></div>Recent Sync History
        </div>
        <div className={`border border-zinc-900 rounded-[2.5rem] overflow-hidden bg-black shadow-2xl p-10`}>
          {history.length === 0 ? (
            <div className="py-12 text-center text-xs font-black uppercase tracking-widest opacity-20">No recent conversions</div>
          ) : (
            <div className="space-y-10">
              {history.map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-8 items-center pb-10 border-b border-zinc-900 last:border-0 last:pb-0">
                   <div className="col-span-3">
                     <div className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-1">Query context</div>
                     <div className="text-sm font-bold truncate opacity-80 uppercase tracking-tight">{item.query}</div>
                   </div>
                   <div className="col-span-3">
                     <div className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-1 truncate">{item.sourceName}</div>
                     <div className="text-2xl font-black text-blue-500 tabular-nums tracking-tighter">{item.sourceTime}</div>
                   </div>
                   <div className="col-span-2 text-center opacity-20">
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <div className="text-[9px] font-black uppercase tracking-widest">Synced</div>
                   </div>
                   <div className="col-span-4 text-right">
                     <div className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-1 truncate">{item.targetName}</div>
                     <div className="text-2xl font-black text-green-500 tabular-nums tracking-tighter">{item.targetTime}</div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-20">
        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] opacity-30 mb-8">
          <div className="w-20 h-px bg-current"></div>24H Interactive Timeline
        </div>
        <div className={`border border-zinc-800 rounded-xl overflow-hidden ${isDark ? 'bg-[#0a0a0a]' : 'bg-zinc-50 shadow-xl'}`}>
          {allTzs.map((tz, rowIndex) => {
            const currentTzInfo = getTzInfo(baseTime, tz.iana);
            const timeline = getTimelineData(tz.iana, baseTime);
            const relativeOffset = getRelativeOffset(tz.iana, sourceTz.iana);
            const isSource = rowIndex === 0;

            return (
              <div key={`${tz.iana}-${rowIndex}`} className="flex border-b border-zinc-900 last:border-0 h-40 group relative">
                <div className="w-80 flex-none p-6 border-r border-zinc-900 flex flex-col justify-center relative bg-gradient-to-r from-zinc-950/50 to-transparent">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black tracking-tight uppercase truncate max-w-[140px]">{tz.name}</h3>
                        <div className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold opacity-60">{getOffsetString(tz.iana, baseTime)}</div>
                      </div>
                      <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate">{tz.iana.split('/')[0]}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black tracking-tighter leading-none">{currentTzInfo.shortTime.slice(0, -1)}<span className="text-xs ml-0.5 opacity-60 font-bold">{currentTzInfo.shortTime.slice(-1)}</span></div>
                      <div className="text-[9px] font-black opacity-30 uppercase tracking-tighter mt-1">{currentTzInfo.date}</div>
                    </div>
                  </div>
                  <div className="absolute left-6 bottom-4 flex items-center gap-2 opacity-20">
                    {!isSource && <span className="text-[10px] font-black tracking-widest">{relativeOffset}H RELATIVE</span>}
                    {isSource && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>}
                  </div>
                </div>

                <div className="flex-grow flex relative overflow-x-hidden">
                  <div className="absolute inset-y-0 left-[31.25%] w-[2.0833%] z-20 pointer-events-none">
                    <div className="absolute inset-y-4 inset-x-0 border border-zinc-400 rounded-lg bg-white/5 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.05)]"></div>
                  </div>
                  {timeline.map((cell, cIdx) => {
                    const isFocused = cIdx === 15;
                    return (
                      <div key={cIdx} onClick={() => { setBaseTime(cell.fullDate); setIsLive(false); }}
                        className={`flex-1 min-w-[32px] flex flex-col items-center justify-center border-r border-zinc-900/50 cursor-pointer transition-colors relative
                          ${cell.cellType === 'night' ? 'bg-[#0c0c0e]' : 'bg-[#151518]'}
                          ${isFocused ? (isDark ? 'bg-indigo-900/40' : 'bg-blue-100') : ''}
                          hover:bg-zinc-800/80`}>
                        {cell.isDayStart && <div className="absolute top-2 left-1 whitespace-nowrap"><div className="text-[8px] font-black opacity-40 uppercase">{cell.dayName}</div><div className="text-[8px] font-black opacity-40">{cell.monthDay}</div></div>}
                        <div className={`text-xs font-black ${isFocused ? 'opacity-100' : 'opacity-20'} ${cell.isHalf ? 'text-[8px] mt-1' : ''}`}>{cell.hourLabel}</div>
                        {!cell.isHalf && <div className={`text-[8px] font-bold uppercase ${isFocused ? 'opacity-80' : 'opacity-10'}`}>{cell.period}</div>}
                        {cell.isHalf && !cell.hourLabel && <div className="w-0.5 h-0.5 rounded-full bg-zinc-700"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="text-center opacity-20 text-[10px] font-black uppercase tracking-[0.2em] pt-8">
        Global resolution context • Wall-clock anchored drift-free engine
      </div>
    </div>
  );
};

export default TimezoneConverter;
