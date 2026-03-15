
// import React, { useState, useCallback, useEffect } from 'react';
// import * as ct from 'countries-and-timezones';
// import { COMMON_TIMEZONES } from '../constants';
// import { Timezone } from '../types';

// interface TimezoneConverterProps {
//   isDark: boolean;
//   fromSlug?: string;
//   toSlug?: string;
// }

// interface ConversionHistoryItem {
//   id: string;
//   query: string;
//   sourceName: string;
//   sourceIana: string;
//   sourceTime: string;
//   targetName: string;
//   targetIana: string;
//   targetTime: string;
//   createdAt: number;
// }

// const EXTENDED_ZONE_MAP: Record<string, string> = {
//   'IST': 'Asia/Kolkata', 'INDIA': 'Asia/Kolkata', 'BOMBAY': 'Asia/Kolkata', 'DELHI': 'Asia/Kolkata', 'KOLKATA': 'Asia/Kolkata',
//   'EST': 'America/New_York', 'EDT': 'America/New_York', 'NEW YORK': 'America/New_York', 'NY': 'America/New_York', 'NYC': 'America/New_York',
//   'PST': 'America/Los_Angeles', 'PDT': 'America/Los_Angeles', 'LA': 'America/Los_Angeles', 'CALIFORNIA': 'America/Los_Angeles', 'SF': 'America/Los_Angeles', 'SAN FRANCISCO': 'America/Los_Angeles',
//   'CST': 'America/Chicago', 'CDT': 'America/Chicago', 'CHICAGO': 'America/Chicago',
//   'MST': 'America/Denver', 'MDT': 'America/Denver', 'DENVER': 'America/Denver',
//   'GMT': 'Europe/London', 'BST': 'Europe/London', 'LONDON': 'Europe/London', 'UK': 'Europe/London', 'ENGLAND': 'Europe/London',
//   'CET': 'Europe/Berlin', 'CEST': 'Europe/Berlin', 'BERLIN': 'Europe/Berlin', 'GERMANY': 'Europe/Berlin', 'PARIS': 'Europe/Paris', 'FRANCE': 'Europe/Paris',
//   'JST': 'Asia/Tokyo', 'TOKYO': 'Asia/Tokyo', 'JAPAN': 'Asia/Tokyo',
//   'AEST': 'Australia/Sydney', 'AEDT': 'Australia/Sydney', 'SYDNEY': 'Australia/Sydney', 'MELBOURNE': 'Australia/Melbourne',
//   'SGT': 'Asia/Singapore', 'SINGAPORE': 'Asia/Singapore',
//   'GST': 'Asia/Dubai', 'DUBAI': 'Asia/Dubai', 'UAE': 'Asia/Dubai',
//   'RUSSIA': 'Europe/Moscow', 'MOSCOW': 'Europe/Moscow', 'MSK': 'Europe/Moscow',
//   'TORONTO': 'America/Toronto', 'CANADA': 'America/Toronto', 'ONTARIO': 'America/Toronto',
//   'HKT': 'Asia/Hong_Kong', 'HONG KONG': 'Asia/Hong_Kong',
//   'WET': 'Europe/Lisbon', 'PORTUGAL': 'Europe/Lisbon', 'LISBON': 'Europe/Lisbon',
//   'BRT': 'America/Sao_Paulo', 'BRAZIL': 'America/Sao_Paulo', 'SAO PAULO': 'America/Sao_Paulo'
// };

// // Global Resolution Engine
// const normalizeKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// const ALL_IANA_ZONES: string[] = (() => {
//   try {
//     return (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf('timeZone') : [];
//   } catch {
//     return [];
//   }
// })();
// const GLOBAL_ZONE_INDEX: Record<string, string> = {};
// const COUNTRY_ZONE_INDEX: Record<string, string> = {};

// // Build Indexes
// ALL_IANA_ZONES.forEach(iana => {
//   const parts = iana.split('/');
//   const city = parts[parts.length - 1];
//   GLOBAL_ZONE_INDEX[normalizeKey(city)] = iana;
//   GLOBAL_ZONE_INDEX[normalizeKey(iana)] = iana;
// });

// const countries = ct.getAllCountries();
// Object.values(countries).forEach((country: any) => {
//   const primaryZone = country.timezones[0];
//   if (primaryZone) {
//     COUNTRY_ZONE_INDEX[normalizeKey(country.name)] = primaryZone;
//     COUNTRY_ZONE_INDEX[normalizeKey(country.id)] = primaryZone;
//   }
// });

// const resolveIanaFromQuery = (query: string): string | null => {
//   const norm = normalizeKey(query);
//   if (!norm) return null;
//   // 1. Fast path: Extended Map
//   const upper = query.toUpperCase().trim();
//   if (EXTENDED_ZONE_MAP[upper]) return EXTENDED_ZONE_MAP[upper];
//   // 2. Exact City/IANA match
//   if (GLOBAL_ZONE_INDEX[norm]) return GLOBAL_ZONE_INDEX[norm];
//   // 3. Country match
//   if (COUNTRY_ZONE_INDEX[norm]) return COUNTRY_ZONE_INDEX[norm];
//   // 4. Fuzzy search through all zones
//   return ALL_IANA_ZONES.find(z => normalizeKey(z).includes(norm)) || null;
// };

// const toZoneLabel = (iana: string) => {
//   const parts = iana.split('/');
//   const last = parts[parts.length - 1].replace(/_/g, ' ');
//   return last.charAt(0).toUpperCase() + last.slice(1);
// };

// const buildTimelineStart = (anchor: Date) => {
//   const aligned = new Date(anchor);
//   aligned.setMinutes(aligned.getMinutes() < 30 ? 0 : 30, 0, 0);
//   return new Date(aligned.getTime() - 15 * 30 * 60000);
// };

// // Formatter Caching Layer
// const TZ_PARTS_FORMATTER_CACHE: Record<string, Intl.DateTimeFormat> = {};
// const TZ_DISPLAY_FORMATTER_CACHE: Record<string, Intl.DateTimeFormat> = {};

// const getPartsFormatter = (iana: string) => {
//   if (!TZ_PARTS_FORMATTER_CACHE[iana]) {
//     TZ_PARTS_FORMATTER_CACHE[iana] = new Intl.DateTimeFormat('en-US', {
//       timeZone: iana, hour12: false, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
//     });
//   }
//   return TZ_PARTS_FORMATTER_CACHE[iana];
// };

// const getDisplayFormatter = (iana: string) => {
//   if (!TZ_DISPLAY_FORMATTER_CACHE[iana]) {
//     TZ_DISPLAY_FORMATTER_CACHE[iana] = new Intl.DateTimeFormat('en-US', {
//       timeZone: iana, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, weekday: 'short', month: 'short', day: 'numeric'
//     });
//   }
//   return TZ_DISPLAY_FORMATTER_CACHE[iana];
// };

// const TimezoneConverter: React.FC<TimezoneConverterProps> = ({ isDark, fromSlug, toSlug }) => {
//   const [naturalInput, setNaturalInput] = useState('');
//   const [baseTime, setBaseTime] = useState(() => {
//     const d = new Date();
//     d.setSeconds(0, 0);
//     return d;
//   });
//   const [sourceTz, setSourceTz] = useState<Timezone>(COMMON_TIMEZONES[3]);
//   const [targets, setTargets] = useState<Timezone[]>([
//     { name: 'Toronto', iana: 'America/Toronto', offset: -5 }
//   ]);
//   const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isLive, setIsLive] = useState(true);
//   const [timelineFocusIndex, setTimelineFocusIndex] = useState<number | null>(null);
//   const [timelineStartUtc, setTimelineStartUtc] = useState<Date>(() => {
//     const d = new Date();
//     d.setMinutes(d.getMinutes() < 30 ? 0 : 30, 0, 0);
//     return new Date(d.getTime() - 15 * 30 * 60000);
//   });

//   useEffect(() => {
//     if (!isLive) return;

//     const interval = setInterval(() => {
//       const now = new Date();
//       setBaseTime(now);
//       setTimelineStartUtc(buildTimelineStart(now));
//       setTimelineFocusIndex(15);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [isLive]);

//   /* ---------------------------
//    Dynamic Route Loader
// ----------------------------*/

// useEffect(() => {

//   if (!fromSlug || !toSlug) return;

//   const fromQuery = fromSlug.replace(/-/g, ' ');
//   const toQuery = toSlug.replace(/-/g, ' ');

//   const fromIana = resolveIanaFromQuery(fromQuery);
//   const toIana = resolveIanaFromQuery(toQuery);

//   if (fromIana) {
//     setSourceTz({
//       name: toZoneLabel(fromIana),
//       iana: fromIana,
//       offset: 0
//     });
//   }

//   if (toIana) {
//     setTargets([
//       {
//         name: toZoneLabel(toIana),
//         iana: toIana,
//         offset: 0
//       }
//     ]);
//   }

//   setNaturalInput(`${fromQuery} to ${toQuery}`);
//   setIsLive(true);

// }, [fromSlug, toSlug]);

//   // DST-Safe Time Conversion Helpers
//   const getZoneDateParts = (date: Date, iana: string) => {
//     const parts = getPartsFormatter(iana).formatToParts(date);
//     const p = (type: string) => parseInt(parts.find(x => x.type === type)?.value || '0');
//     return { year: p('year'), month: p('month'), day: p('day'), hour: p('hour'), minute: p('minute'), second: p('second') };
//   };

//   const zonedTimeToUtc = (input: { year: number, month: number, day: number, hour: number, minute: number, second: number }, iana: string) => {
//     const targetWallMs = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, input.second);
//     let utcMillis = targetWallMs;
//     // Iterative Correction for DST-safe wall-clock matching
//     for (let i = 0; i < 4; i++) {
//       const date = new Date(utcMillis);
//       const parts = getZoneDateParts(date, iana);
//       const zoneWallMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
//       const diff = targetWallMs - zoneWallMs;
//       if (diff === 0) break;
//       utcMillis += diff;
//     }
//     return new Date(utcMillis);
//   };

//   const getTzInfo = useCallback((date: Date, iana: string) => {
//     try {
//       const parts = getDisplayFormatter(iana).formatToParts(date);
//       const p = (type: string) => parts.find(part => part.type === type)?.value || '';
      
//       const timeStr = `${p('hour')}:${p('minute')}:${p('second')} ${p('dayPeriod')}`;
//       const shortTime = `${p('hour')}:${p('minute')}${p('dayPeriod')?.toLowerCase().charAt(0)}`;
      
//       return { 
//         time: timeStr, shortTime,
//         hour: parseInt(p('hour')), minute: parseInt(p('minute')), second: parseInt(p('second')),
//         dayPeriod: p('dayPeriod')?.toLowerCase() || '',
//         date: `${p('weekday')}, ${p('month')} ${p('day')}`.toUpperCase(),
//         dayName: p('weekday').toUpperCase(), monthDay: `${p('month')} ${p('day')}`.toUpperCase()
//       };
//     } catch {
//       return { time: '--:--:--', shortTime: '--:--', hour: 0, minute: 0, second: 0, dayPeriod: '', date: '', dayName: '', monthDay: '' };
//     }
//   }, []);

//   const getOffsetString = (iana: string, date: Date = new Date()) => {
//     try {
//       const parts = new Intl.DateTimeFormat('en-US', { timeZone: iana, timeZoneName: 'shortOffset' }).formatToParts(date);
//       return parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
//     } catch { return 'GMT+0'; }
//   };

//   const getRelativeOffset = (iana: string, refIana: string) => {
//     try {
//       const now = new Date();
//       const getOffset = (tz: string) => {
//         const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(now);
//         const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
//         const match = offsetStr.match(/([-+])(\d+):?(\d+)?/);
//         if (!match) return 0;
//         const sign = match[1] === '-' ? -1 : 1;
//         const h = parseInt(match[2]);
//         const m = match[3] ? parseInt(match[3]) : 0;
//         return sign * (h + m / 60);
//       };
//       const diff = getOffset(iana) - getOffset(refIana);
//       return diff === 0 ? "0" : (diff > 0 ? `+${diff}` : `${diff}`);
//     } catch { return "0"; }
//   };

//   const performLocalParse = (input: string, commitToHistory: boolean = false) => {
//     const text = input.toUpperCase().trim();
//     if (!text) return;

//     // Split Zones
//     const zoneParts = text.replace(/\b(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?\b/gi, '').split(/\s+(?:TO|INTO|IN|AND|AT)\s+/i);
    
//     const findZone = (query: string): Timezone | null => {
//       const iana = resolveIanaFromQuery(query);
//       if (!iana) return null;
//       return { name: toZoneLabel(iana), iana, offset: 0 };
//     };

//     let activeSrc = sourceTz;
//     let activeTgt = targets[0] || { name: 'Target', iana: 'UTC', offset: 0 };

//     if (zoneParts.length >= 2) {
//       const src = findZone(zoneParts[0]);
//       const tgt = findZone(zoneParts[1]);
//       if (src) { setSourceTz(src); activeSrc = src; }
//       if (tgt) { setTargets([tgt]); activeTgt = tgt; }
//     } else if (zoneParts.length === 1) {
//       const single = findZone(zoneParts[0]);
//       if (single) { setSourceTz(single); activeSrc = single; }
//     }

//     // Time Match & Anchoring
//     const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?\b/i);
//     if (timeMatch) {
//       let h = parseInt(timeMatch[1]);
//       const m = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
//       const s = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
//       const period = timeMatch[4];
//       if (period === 'PM' && h < 12) h += 12;
//       if (period === 'AM' && h === 12) h = 0;

//       const now = new Date();
//       const zoneNowParts = getZoneDateParts(now, activeSrc.iana);
//       const targetUtc = zonedTimeToUtc({ 
//         year: zoneNowParts.year, month: zoneNowParts.month, day: zoneNowParts.day, 
//         hour: h, minute: m, second: s 
//       }, activeSrc.iana);

//       setBaseTime(targetUtc);
//       setIsLive(false);
//       setTimelineStartUtc(buildTimelineStart(targetUtc));
//       setTimelineFocusIndex(15);

//       if (commitToHistory) {
//         // History Insertion Logic
//         const srcInfo = getTzInfo(targetUtc, activeSrc.iana);
//         const tgtInfo = getTzInfo(targetUtc, activeTgt.iana);

//         const entry: ConversionHistoryItem = {
//           id: Math.random().toString(36).substr(2, 9),
//           query: input,
//           sourceName: activeSrc.name,
//           sourceIana: activeSrc.iana,
//           sourceTime: srcInfo.time,
//           targetName: activeTgt.name,
//           targetIana: activeTgt.iana,
//           targetTime: tgtInfo.time,
//           createdAt: Date.now()
//         };

//         setHistory(prev => [entry, ...prev].slice(0, 3));
//       }
//     }
//   };

//   const handleConvert = () => {
//     const trimmed = naturalInput.trim();
//     setIsLoading(true);
//     if (!trimmed) {
//       setIsLive(true);
//       setIsLoading(false);
//       return;
//     }
//     performLocalParse(trimmed, true);
//     setIsLoading(false);
//   };

//   const getTimelineData = (iana: string, startUtc: Date) => {
//     const cells = [];
//     const startTime = new Date(startUtc);

//     for (let i = 0; i < 48; i++) {
//       const d = new Date(startTime.getTime() + i * 30 * 60000);
//       const parts = getZoneDateParts(d, iana);
//       const info = getTzInfo(d, iana);
      
//       const hour24 = parts.hour % 24;
//       const minute = parts.minute;
//       const isHalf = minute !== 0;
//       const hour12 = ((hour24 + 11) % 12) + 1;
//       const period = hour24 < 12 ? 'am' : 'pm';
//       const isWorkingHour = hour24 >= 9 && hour24 < 18;
//       const cellType: 'night' | 'day' = (hour24 < 6 || hour24 >= 18) ? 'night' : 'day';

//       cells.push({
//         fullDate: d,
//         hourLabel: isHalf ? '' : hour12,
//         period: isHalf ? '' : period,
//         isHalf,
//         cellType,
//         isWorkingHour,
//         dayName: info.dayName,
//         monthDay: info.monthDay,
//         isDayStart: hour24 === 0 && minute === 0
//       });
//     }
//     return cells;
//   };

//   const allTzs = [sourceTz, ...targets];
//   const textColor = isDark ? 'text-white' : 'text-black';
//   const bgColor = isDark ? 'bg-black' : 'bg-white';
//   const borderClass = isDark ? 'border-zinc-800' : 'border-zinc-200';

//   const panelBg = isDark ? 'bg-black' : 'bg-white';
//   const panelBorder = isDark ? 'border-zinc-900' : 'border-zinc-200';
//   const panelBorderSoft = isDark ? 'border-zinc-900/50' : 'border-zinc-200/70';
//   const panelBorderSofter = isDark ? 'border-zinc-900/30' : 'border-zinc-200/50';

//   const titleText = isDark ? 'text-white' : 'text-black';
//   const mutedText = isDark ? 'text-zinc-400' : 'text-zinc-600';
//   const tinyMuted = isDark ? 'opacity-30' : 'opacity-50';

//   const inputBg = isDark ? 'bg-white/5' : 'bg-black/[0.03]';
//   const convertBtn = isDark
//     ? 'bg-white text-black hover:bg-zinc-200'
//     : 'bg-black text-white hover:bg-zinc-800';

//   const timelineWrapBg = isDark ? 'bg-[#0a0a0a]' : 'bg-zinc-50 shadow-xl';
//   const timelineLabelBg = isDark ? 'from-zinc-950/50' : 'from-zinc-200/40';
//   const timelineLabelPill = isDark ? 'bg-zinc-800' : 'bg-zinc-200';

//   const addRowBg = isDark ? 'bg-black/40' : 'bg-zinc-100';
//   const addInputBg = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-300';
//   const addBtnBg = isDark ? 'hover:bg-zinc-800 border-zinc-800' : 'hover:bg-zinc-200 border-zinc-300';

//   return (
//     <div className={`timezone-no-shadow p-8 space-y-12 ${bgColor} ${textColor} font-['Helvetica']`}>
//       <header className="space-y-4 text-center">
//         <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Timezone Converter</h1>
//         <p className="text-sm font-bold uppercase tracking-widest opacity-30">Instant Synchronization • Professional Accuracy</p>
//       </header>

//       <div className="max-w-4xl mx-auto flex gap-4">
//         <div className={`flex-grow flex items-center px-6 py-4 rounded-full border-2 ${borderClass} focus-within:border-blue-500 transition-all shadow-2xl ${inputBg}`}>
//           <svg className="w-6 h-6 opacity-30 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
//           <input 
//             className="flex-grow bg-transparent border-none outline-none font-bold text-lg" 
//             placeholder="e.g. 8 pm russia to london"
//             value={naturalInput}
//             onChange={(e) => {
//               setNaturalInput(e.target.value);
//               if (e.target.value.length > 1) performLocalParse(e.target.value, false);
//             }}
//             onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
//           />
//         </div>
//         <button onClick={handleConvert} className={`px-10 rounded-full font-black uppercase text-sm tracking-widest transition-all active:scale-95 shadow-lg ${convertBtn}`}>
//           {isLoading ? 'Syncing...' : 'Convert'}
//         </button>
//       </div>

//       <div className="max-w-6xl mx-auto">
//         <div className={`border ${panelBorder} rounded-[2.5rem] overflow-hidden ${panelBg} shadow-2xl transition-all duration-300`}>
//           <div className={`grid grid-cols-12 px-12 pt-8 pb-4 border-b ${panelBorderSoft}`}>
//             <div className="col-span-5 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Source Timezone</div>
//             <div className="col-span-2 text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Direction</div>
//             <div className="col-span-5 text-right text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Target Local Time</div>
//           </div>

//           {targets.map((tz, idx) => {
//             const srcInfo = getTzInfo(baseTime, sourceTz.iana);
//             const tgtInfo = getTzInfo(baseTime, tz.iana);
//             return (
//               <div key={`${tz.iana}-${idx}`} className={`grid grid-cols-12 px-12 py-14 items-center last:border-0 border-b ${panelBorderSofter}`}>
//                 <div className="col-span-5 space-y-1">
//                   <div className={`text-4xl font-normal tracking-tight ${titleText} uppercase truncate`}>{sourceTz.name}</div>
//                   <div className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">{sourceTz.iana.toUpperCase()} (GMT{getOffsetString(sourceTz.iana, baseTime)})</div>
//                   <div className="text-6xl font-normal tracking-tighter text-blue-500 tabular-nums">{srcInfo.time}</div>
//                 </div>
//                 <div className="col-span-2 flex flex-col items-center justify-center opacity-40">
//                   <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
//                   <span className="text-[10px] font-normal uppercase tracking-[0.2em]">Converted</span>
//                 </div>
//                 <div className="col-span-5 text-right space-y-1">
//                   <div className={`text-4xl font-normal tracking-tight ${titleText} uppercase truncate`}>{tz.name}</div>
//                   <div className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">{tz.iana.toUpperCase()} (GMT{getOffsetString(tz.iana, baseTime)})</div>
//                   <div className="text-6xl font-normal tracking-tighter text-green-500 tabular-nums">{tgtInfo.time}</div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Conversion History Section */}
//       <div className="max-w-6xl mx-auto mt-20">
//         <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] opacity-30 mb-8">
//           <div className="w-20 h-px bg-current"></div>Recent Sync History
//         </div>
//         <div className={`border ${panelBorder} rounded-[2.5rem] overflow-hidden ${panelBg} shadow-2xl p-10`}>
//           {history.length === 0 ? (
//             <div className="py-12 text-center text-xs font-black uppercase tracking-widest opacity-20">No recent conversions</div>
//           ) : (
//             <div className="space-y-10">
//               {history.map(item => (
//                 <div key={item.id} className={`grid grid-cols-12 gap-8 items-center pb-10 border-b ${panelBorder} last:border-0 last:pb-0`}>
//                    <div className="col-span-3">
//                      <div className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-1">Query context</div>
//                      <div className="text-sm font-bold truncate opacity-80 uppercase tracking-tight">{item.query}</div>
//                    </div>
//                    <div className="col-span-3">
//                      <div className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-1 truncate">{item.sourceName}</div>
//                      <div className="text-2xl font-black text-blue-500 tabular-nums tracking-tighter">{item.sourceTime}</div>
//                    </div>
//                    <div className="col-span-2 text-center opacity-20">
//                       <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                       <div className="text-[9px] font-black uppercase tracking-widest">Synced</div>
//                    </div>
//                    <div className="col-span-4 text-right">
//                      <div className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-1 truncate">{item.targetName}</div>
//                      <div className="text-2xl font-black text-green-500 tabular-nums tracking-tighter">{item.targetTime}</div>
//                    </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto mt-20">
//         <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] opacity-30 mb-8">
//           <div className="w-20 h-px bg-current"></div>24H Interactive Timeline
//         </div>
//         <div className={`border ${borderClass} rounded-xl overflow-hidden ${timelineWrapBg}`}>
//           <div className="flex">
//             {/* Fixed Labels Column */}
//             <div className={`w-80 flex-none border-r ${panelBorder}`}>
//               {allTzs.map((tz, rowIndex) => {
//                 const currentTzInfo = getTzInfo(baseTime, tz.iana);
//                 const relativeOffset = getRelativeOffset(tz.iana, sourceTz.iana);
//                 const isSource = rowIndex === 0;
//                 return (
//                   <div key={`${tz.iana}-label-${rowIndex}`} className={`h-40 p-6 border-b ${panelBorder} last:border-0 flex flex-col justify-center relative bg-gradient-to-r ${timelineLabelBg} to-transparent group`}>
//                     <div className="flex justify-between items-start">
//                       <div className="space-y-0.5">
//                         <div className="flex items-center gap-2">
//                           <h3 className="text-xl font-black tracking-tight uppercase truncate max-w-[140px]">{tz.name}</h3>
//                           <div className={`px-2 py-0.5 rounded ${timelineLabelPill} text-[10px] font-bold opacity-60`}>{getOffsetString(tz.iana, baseTime)}</div>
//                         </div>
//                         <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate">{tz.iana.split('/')[0]}</div>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-2xl font-black tracking-tighter leading-none">{currentTzInfo.shortTime.slice(0, -1)}<span className="text-xs ml-0.5 opacity-60 font-bold">{currentTzInfo.shortTime.slice(-1)}</span></div>
//                         <div className="text-[9px] font-black opacity-30 uppercase tracking-tighter mt-1">{currentTzInfo.date}</div>
//                       </div>
//                     </div>
//                     <div className="absolute left-6 bottom-4 flex items-center gap-2 opacity-20">
//                       {!isSource && <span className="text-[10px] font-black tracking-widest">{relativeOffset}H RELATIVE</span>}
//                       {isSource && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>}
//                     </div>
//                     {!isSource && (
//                       <button 
//                         onClick={() => setTargets(prev => prev.filter((_, i) => i !== rowIndex - 1))}
//                         className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity"
//                       >
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
//                       </button>
//                     )}
//                   </div>
//                 );
//               })}
//               {/* Add Timezone Label Area */}
//               <div className={`h-16 p-4 border-t ${panelBorder} ${addRowBg} flex items-center gap-4`}>
//                 <div className="relative flex-grow">
//                   <input 
//                     type="text"
//                     placeholder="ADD TIMEZONE..."
//                     className={`w-full ${addInputBg} border rounded-lg px-4 py-2 text-[10px] font-black tracking-widest uppercase outline-none focus:border-blue-500 transition-colors`}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter') {
//                         const val = (e.target as HTMLInputElement).value;
//                         const iana = resolveIanaFromQuery(val);
//                         if (iana) {
//                           setTargets(prev => [...prev, { name: toZoneLabel(iana), iana, offset: 0 }]);
//                           (e.target as HTMLInputElement).value = '';
//                         }
//                       }
//                     }}
//                   />
//                 </div>
//                 <button className={`w-10 h-10 flex-none rounded-lg border ${addBtnBg} flex items-center justify-center transition-colors`}>
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
//                 </button>
//               </div>
//             </div>

//             {/* Scrollable Timeline Column */}
//             <div className="flex-grow overflow-x-auto scrollbar-custom">
//               <div className="min-w-max">
//                 {allTzs.map((tz, rowIndex) => {
//                   const timeline = getTimelineData(tz.iana, timelineStartUtc);
//                   return (
//                     <div key={`${tz.iana}-timeline-${rowIndex}`} className={`flex h-40 border-b ${panelBorder} last:border-0`}>
//                       {timeline.map((cell, cIdx) => {
//                         const isFocused = timelineFocusIndex === cIdx;
//                         return (
//                           <div key={cIdx} onClick={() => { setTimelineFocusIndex(cIdx); setBaseTime(cell.fullDate); setIsLive(false); }}
//                             className={`w-12 flex flex-col items-center justify-center border-r ${panelBorderSofter} cursor-pointer transition-all relative group/cell
//                               ${
//                                 cell.cellType === 'night'
//                                   ? (isDark ? 'bg-[#0c0c0e]' : 'bg-zinc-200/70')
//                                   : (isDark ? 'bg-[#151518]' : 'bg-zinc-100')
//                               }
//                               ${isFocused ? (isDark ? 'bg-indigo-900/40' : 'bg-blue-200/50') : ''}
//                               ${cell.isWorkingHour ? 'ring-1 ring-zinc-700/30' : ''}
//                               hover:bg-zinc-800/80`}>
//                             {cell.isDayStart && <div className="absolute top-2 left-1 whitespace-nowrap"><div className="text-[8px] font-black opacity-40 uppercase">{cell.dayName}</div><div className="text-[8px] font-black opacity-40">{cell.monthDay}</div></div>}
//                             <div className={`text-xs font-black transition-colors duration-200
//                               ${isFocused ? 'text-yellow-400 opacity-100 scale-110' : `${isDark ? 'text-white' : 'text-black'} opacity-100 group-hover/cell:text-yellow-400`} 
//                               ${cell.isHalf ? 'text-[8px] mt-1' : ''}`}>
//                               {cell.hourLabel}
//                             </div>
//                             {!cell.isHalf && (
//                               <div className={`text-[8px] font-bold uppercase transition-colors duration-200
//                                 ${isFocused ? 'text-yellow-400/80 opacity-100' : `${isDark ? 'text-white' : 'text-black'} opacity-40 group-hover/cell:text-yellow-400/80`}`}>
//                                 {cell.period}
//                               </div>
//                             )}
//                             {cell.isHalf && !cell.hourLabel && <div className="w-0.5 h-0.5 rounded-full bg-zinc-700 group-hover/cell:bg-yellow-400"></div>}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   );
//                 })}
//                 {/* Empty space matching the Add Timezone row height */}
//                 <div className={`h-16 border-t ${panelBorder} ${addRowBg}`}></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <div className="text-center opacity-20 text-[10px] font-black uppercase tracking-[0.2em] pt-8">
//         Global resolution context • Wall-clock anchored drift-free engine
//       </div>

//       <style>{`
//         .scrollbar-custom::-webkit-scrollbar {
//           height: 6px;
//         }
//         .scrollbar-custom::-webkit-scrollbar-track {
//           background: #000000;
//           border-radius: 10px;
//         }
//         .scrollbar-custom::-webkit-scrollbar-thumb {
//           background: #333333;
//           border-radius: 10px;
//         }
//         .scrollbar-custom::-webkit-scrollbar-thumb:hover {
//           background: #555555;
//         }
//         ${!isDark ? `
//           .scrollbar-custom::-webkit-scrollbar-track {
//             background: #f4f4f5;
//           }
//           .scrollbar-custom::-webkit-scrollbar-thumb {
//             background: #d4d4d8;
//           }
//           .scrollbar-custom::-webkit-scrollbar-thumb:hover {
//             background: #a1a1aa;
//           }
//         ` : ''}

//         .timezone-no-shadow,
//         .timezone-no-shadow * {
//           box-shadow: none !important;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default TimezoneConverter;



import React, { useState, useCallback, useEffect } from 'react';
import * as ct from 'countries-and-timezones';
import { COMMON_TIMEZONES } from '../constants';
import { Timezone } from '../types';

interface TimezoneConverterProps {
  isDark: boolean;
  fromSlug?: string;
  toSlug?: string;
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

const normalizeKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const ALL_IANA_ZONES: string[] = (() => {
  try {
    return (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf('timeZone') : [];
  } catch {
    return [];
  }
})();

const GLOBAL_ZONE_INDEX: Record<string, string> = {};
const COUNTRY_ZONE_INDEX: Record<string, string> = {};

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
  const upper = query.toUpperCase().trim();
  if (EXTENDED_ZONE_MAP[upper]) return EXTENDED_ZONE_MAP[upper];
  if (GLOBAL_ZONE_INDEX[norm]) return GLOBAL_ZONE_INDEX[norm];
  if (COUNTRY_ZONE_INDEX[norm]) return COUNTRY_ZONE_INDEX[norm];
  return ALL_IANA_ZONES.find(z => normalizeKey(z).includes(norm)) || null;
};

const toZoneLabel = (iana: string) => {
  const parts = iana.split('/');
  const last = parts[parts.length - 1].replace(/_/g, ' ');
  return last.charAt(0).toUpperCase() + last.slice(1);
};

const buildTimelineStart = (anchor: Date) => {
  const aligned = new Date(anchor);
  aligned.setMinutes(aligned.getMinutes() < 30 ? 0 : 30, 0, 0);
  return new Date(aligned.getTime() - 15 * 30 * 60000);
};

const TZ_PARTS_FORMATTER_CACHE: Record<string, Intl.DateTimeFormat> = {};
const TZ_DISPLAY_FORMATTER_CACHE: Record<string, Intl.DateTimeFormat> = {};

const getPartsFormatter = (iana: string) => {
  if (!TZ_PARTS_FORMATTER_CACHE[iana]) {
    TZ_PARTS_FORMATTER_CACHE[iana] = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      hour12: false,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
  }
  return TZ_PARTS_FORMATTER_CACHE[iana];
};

const getDisplayFormatter = (iana: string) => {
  if (!TZ_DISPLAY_FORMATTER_CACHE[iana]) {
    TZ_DISPLAY_FORMATTER_CACHE[iana] = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
  return TZ_DISPLAY_FORMATTER_CACHE[iana];
};

const TimezoneConverter: React.FC<TimezoneConverterProps> = ({ isDark, fromSlug, toSlug }) => {
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
  const [timelineFocusIndex, setTimelineFocusIndex] = useState<number | null>(null);
  const [timelineStartUtc, setTimelineStartUtc] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() < 30 ? 0 : 30, 0, 0);
    return new Date(d.getTime() - 15 * 30 * 60000);
  });

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      setBaseTime(now);
      setTimelineStartUtc(buildTimelineStart(now));
      setTimelineFocusIndex(15);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getZoneDateParts = (date: Date, iana: string) => {
    const parts = getPartsFormatter(iana).formatToParts(date);
    const p = (type: string) => parseInt(parts.find(x => x.type === type)?.value || '0');
    return {
      year: p('year'),
      month: p('month'),
      day: p('day'),
      hour: p('hour'),
      minute: p('minute'),
      second: p('second')
    };
  };

  const zonedTimeToUtc = (
    input: { year: number; month: number; day: number; hour: number; minute: number; second: number },
    iana: string
  ) => {
    const targetWallMs = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, input.second);
    let utcMillis = targetWallMs;
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
        time: timeStr,
        shortTime,
        hour: parseInt(p('hour')),
        minute: parseInt(p('minute')),
        second: parseInt(p('second')),
        dayPeriod: p('dayPeriod')?.toLowerCase() || '',
        date: `${p('weekday')}, ${p('month')} ${p('day')}`.toUpperCase(),
        dayName: p('weekday').toUpperCase(),
        monthDay: `${p('month')} ${p('day')}`.toUpperCase()
      };
    } catch {
      return {
        time: '--:--:--',
        shortTime: '--:--',
        hour: 0,
        minute: 0,
        second: 0,
        dayPeriod: '',
        date: '',
        dayName: '',
        monthDay: ''
      };
    }
  }, []);

  const getOffsetString = (iana: string, date: Date = new Date()) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: iana, timeZoneName: 'shortOffset' }).formatToParts(date);
      return parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
    } catch {
      return 'GMT+0';
    }
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
      return diff === 0 ? '0' : diff > 0 ? `+${diff}` : `${diff}`;
    } catch {
      return '0';
    }
  };

  const pushHistory = useCallback(
    (query: string, src: Timezone, tgt: Timezone, at: Date) => {
      const srcInfo = getTzInfo(at, src.iana);
      const tgtInfo = getTzInfo(at, tgt.iana);

      const entry: ConversionHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        query,
        sourceName: src.name,
        sourceIana: src.iana,
        sourceTime: srcInfo.time,
        targetName: tgt.name,
        targetIana: tgt.iana,
        targetTime: tgtInfo.time,
        createdAt: Date.now()
      };

      setHistory(prev => {
        const top = prev[0];
        if (
          top &&
          top.query === entry.query &&
          top.sourceIana === entry.sourceIana &&
          top.targetIana === entry.targetIana &&
          Date.now() - top.createdAt < 1500
        ) {
          return prev;
        }
        return [entry, ...prev].slice(0, 3);
      });
    },
    [getTzInfo]
  );

  useEffect(() => {
    if (!fromSlug || !toSlug) return;

    const fromQuery = fromSlug.replace(/-/g, ' ');
    const toQuery = toSlug.replace(/-/g, ' ');

    const fromIana = resolveIanaFromQuery(fromQuery);
    const toIana = resolveIanaFromQuery(toQuery);

    let routeSource: Timezone | null = null;
    let routeTarget: Timezone | null = null;

    if (fromIana) {
      routeSource = { name: toZoneLabel(fromIana), iana: fromIana, offset: 0 };
      setSourceTz(routeSource);
    }

    if (toIana) {
      routeTarget = { name: toZoneLabel(toIana), iana: toIana, offset: 0 };
      setTargets([routeTarget]);
    }

    const query = `${fromQuery} to ${toQuery}`;
    setNaturalInput(query);
    setIsLive(true);

    if (routeSource && routeTarget) {
      pushHistory(query, routeSource, routeTarget, new Date());
    }
  }, [fromSlug, toSlug, pushHistory]);

  const performLocalParse = (input: string, commitToHistory: boolean = false) => {
    const text = input.toUpperCase().trim();
    if (!text) return;

    const zoneParts = text
      .replace(/\b(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)?\b/gi, '')
      .split(/\s+(?:TO|INTO|IN|AND|AT)\s+/i);

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
      if (src) {
        setSourceTz(src);
        activeSrc = src;
      }
      if (tgt) {
        setTargets([tgt]);
        activeTgt = tgt;
      }
    } else if (zoneParts.length === 1) {
      const single = findZone(zoneParts[0]);
      if (single) {
        setSourceTz(single);
        activeSrc = single;
      }
    }

    let effectiveTime = baseTime;
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
      const targetUtc = zonedTimeToUtc(
        {
          year: zoneNowParts.year,
          month: zoneNowParts.month,
          day: zoneNowParts.day,
          hour: h,
          minute: m,
          second: s
        },
        activeSrc.iana
      );

      setBaseTime(targetUtc);
      setIsLive(false);
      setTimelineStartUtc(buildTimelineStart(targetUtc));
      setTimelineFocusIndex(15);
      effectiveTime = targetUtc;
    }

    if (commitToHistory) {
      pushHistory(input, activeSrc, activeTgt, effectiveTime);
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

  const getTimelineData = (iana: string, startUtc: Date) => {
    const cells = [];
    const startTime = new Date(startUtc);

    for (let i = 0; i < 48; i++) {
      const d = new Date(startTime.getTime() + i * 30 * 60000);
      const parts = getZoneDateParts(d, iana);
      const info = getTzInfo(d, iana);

      const hour24 = parts.hour % 24;
      const minute = parts.minute;
      const isHalf = minute !== 0;
      const hour12 = ((hour24 + 11) % 12) + 1;
      const period = hour24 < 12 ? 'am' : 'pm';
      const isWorkingHour = hour24 >= 9 && hour24 < 18;
      const cellType: 'night' | 'day' = (hour24 < 6 || hour24 >= 18) ? 'night' : 'day';

      cells.push({
        fullDate: d,
        hourLabel: isHalf ? '' : hour12,
        period: isHalf ? '' : period,
        isHalf,
        cellType,
        isWorkingHour,
        dayName: info.dayName,
        monthDay: info.monthDay,
        isDayStart: hour24 === 0 && minute === 0
      });
    }
    return cells;
  };

  const allTzs = [sourceTz, ...targets];
  const textColor = isDark ? 'text-white' : 'text-black';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const borderClass = isDark ? 'border-zinc-800' : 'border-zinc-200';

  const panelBg = isDark ? 'bg-black' : 'bg-white';
  const panelBorder = isDark ? 'border-zinc-900' : 'border-zinc-200';
  const panelBorderSoft = isDark ? 'border-zinc-900/50' : 'border-zinc-200/70';
  const panelBorderSofter = isDark ? 'border-zinc-900/30' : 'border-zinc-200/50';

  const titleText = isDark ? 'text-white' : 'text-black';
  const inputBg = isDark ? 'bg-white/5' : 'bg-black/[0.03]';
  const convertBtn = isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800';

  const timelineWrapBg = isDark ? 'bg-[#0a0a0a]' : 'bg-zinc-50 shadow-xl';
  const timelineLabelBg = isDark ? 'from-zinc-950/50' : 'from-zinc-200/40';
  const timelineLabelPill = isDark ? 'bg-zinc-800' : 'bg-zinc-200';

  const addRowBg = isDark ? 'bg-black/40' : 'bg-zinc-100';
  const addInputBg = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-300';
  const addBtnBg = isDark ? 'hover:bg-zinc-800 border-zinc-800' : 'hover:bg-zinc-200 border-zinc-300';

  return (
    <div className={`timezone-no-shadow p-8 space-y-12 ${bgColor} ${textColor} font-['Helvetica']`}>
      <header className="space-y-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Timezone Converter</h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-30">Instant Synchronization • Professional Accuracy</p>
      </header>

      <div className="max-w-4xl mx-auto flex gap-4">
        <div className={`flex-grow flex items-center px-6 py-4 rounded-full border-2 ${borderClass} focus-within:border-blue-500 transition-all shadow-2xl ${inputBg}`}>
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
        <button onClick={handleConvert} className={`px-10 rounded-full font-black uppercase text-sm tracking-widest transition-all active:scale-95 shadow-lg ${convertBtn}`}>
          {isLoading ? 'Syncing...' : 'Convert'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className={`border ${panelBorder} rounded-[2.5rem] overflow-hidden ${panelBg} shadow-2xl transition-all duration-300`}>
          <div className={`grid grid-cols-12 px-12 pt-8 pb-4 border-b ${panelBorderSoft}`}>
            <div className="col-span-5 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Source Timezone</div>
            <div className="col-span-2 text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Direction</div>
            <div className="col-span-5 text-right text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Target Local Time</div>
          </div>

          {targets.map((tz, idx) => {
            const srcInfo = getTzInfo(baseTime, sourceTz.iana);
            const tgtInfo = getTzInfo(baseTime, tz.iana);
            return (
              <div key={`${tz.iana}-${idx}`} className={`grid grid-cols-12 px-12 py-14 items-center last:border-0 border-b ${panelBorderSofter}`}>
                <div className="col-span-5 space-y-1">
                  <div className={`text-4xl font-normal tracking-tight ${titleText} uppercase truncate`}>{sourceTz.name}</div>
                  <div className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">{sourceTz.iana.toUpperCase()} (GMT{getOffsetString(sourceTz.iana, baseTime)})</div>
                  <div className="text-6xl font-normal tracking-tighter text-blue-500 tabular-nums">{srcInfo.time}</div>
                </div>
                <div className="col-span-2 flex flex-col items-center justify-center opacity-40">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  <span className="text-[10px] font-normal uppercase tracking-[0.2em]">Converted</span>
                </div>
                <div className="col-span-5 text-right space-y-1">
                  <div className={`text-4xl font-normal tracking-tight ${titleText} uppercase truncate`}>{tz.name}</div>
                  <div className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">{tz.iana.toUpperCase()} (GMT{getOffsetString(tz.iana, baseTime)})</div>
                  <div className="text-6xl font-normal tracking-tighter text-green-500 tabular-nums">{tgtInfo.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-20">
        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] opacity-30 mb-8">
          <div className="w-20 h-px bg-current"></div>Recent Sync History
        </div>
        <div className={`border ${panelBorder} rounded-[2.5rem] overflow-hidden ${panelBg} shadow-2xl p-10`}>
          {history.length === 0 ? (
            <div className="py-12 text-center text-xs font-black uppercase tracking-widest opacity-20">No recent conversions</div>
          ) : (
            <div className="space-y-10">
              {history.map(item => (
                <div key={item.id} className={`grid grid-cols-12 gap-8 items-center pb-10 border-b ${panelBorder} last:border-0 last:pb-0`}>
                  <div className="col-span-3">
                    <div className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-1">Query context</div>
                    <div className="text-sm font-bold truncate opacity-80 uppercase tracking-tight">{item.query}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-[10px] font-black uppercase opacity-30 tracking-widest mb-1 truncate">{item.sourceName}</div>
                    <div className="text-2xl font-black text-blue-500 tabular-nums tracking-tighter">{item.sourceTime}</div>
                  </div>
                  <div className="col-span-2 text-center opacity-20">
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
        <div className={`border ${borderClass} rounded-xl overflow-hidden ${timelineWrapBg}`}>
          <div className="flex">
            <div className={`w-80 flex-none border-r ${panelBorder}`}>
              {allTzs.map((tz, rowIndex) => {
                const currentTzInfo = getTzInfo(baseTime, tz.iana);
                const relativeOffset = getRelativeOffset(tz.iana, sourceTz.iana);
                const isSource = rowIndex === 0;
                return (
                  <div key={`${tz.iana}-label-${rowIndex}`} className={`h-40 p-6 border-b ${panelBorder} last:border-0 flex flex-col justify-center relative bg-gradient-to-r ${timelineLabelBg} to-transparent group`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black tracking-tight uppercase truncate max-w-[140px]">{tz.name}</h3>
                          <div className={`px-2 py-0.5 rounded ${timelineLabelPill} text-[10px] font-bold opacity-60`}>{getOffsetString(tz.iana, baseTime)}</div>
                        </div>
                        <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate">{tz.iana.split('/')[0]}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black tracking-tighter leading-none">
                          {currentTzInfo.shortTime.slice(0, -1)}
                          <span className="text-xs ml-0.5 opacity-60 font-bold">{currentTzInfo.shortTime.slice(-1)}</span>
                        </div>
                        <div className="text-[9px] font-black opacity-30 uppercase tracking-tighter mt-1">{currentTzInfo.date}</div>
                      </div>
                    </div>
                    <div className="absolute left-6 bottom-4 flex items-center gap-2 opacity-20">
                      {!isSource && <span className="text-[10px] font-black tracking-widest">{relativeOffset}H RELATIVE</span>}
                      {isSource && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg>}
                    </div>
                    {!isSource && (
                      <button
                        onClick={() => setTargets(prev => prev.filter((_, i) => i !== rowIndex - 1))}
                        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                );
              })}
              <div className={`h-16 p-4 border-t ${panelBorder} ${addRowBg} flex items-center gap-4`}>
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="ADD TIMEZONE..."
                    className={`w-full ${addInputBg} border rounded-lg px-4 py-2 text-[10px] font-black tracking-widest uppercase outline-none focus:border-blue-500 transition-colors`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value;
                        const iana = resolveIanaFromQuery(val);
                        if (iana) {
                          setTargets(prev => [...prev, { name: toZoneLabel(iana), iana, offset: 0 }]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>
                <button className={`w-10 h-10 flex-none rounded-lg border ${addBtnBg} flex items-center justify-center transition-colors`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-x-auto scrollbar-custom">
              <div className="min-w-max">
                {allTzs.map((tz, rowIndex) => {
                  const timeline = getTimelineData(tz.iana, timelineStartUtc);
                  return (
                    <div key={`${tz.iana}-timeline-${rowIndex}`} className={`flex h-40 border-b ${panelBorder} last:border-0`}>
                      {timeline.map((cell, cIdx) => {
                        const isFocused = timelineFocusIndex === cIdx;
                        return (
                          <div
                            key={cIdx}
                            onClick={() => {
                              setTimelineFocusIndex(cIdx);
                              setBaseTime(cell.fullDate);
                              setIsLive(false);
                            }}
                            className={`w-12 flex flex-col items-center justify-center border-r ${panelBorderSofter} cursor-pointer transition-all relative group/cell
                              ${cell.cellType === 'night' ? (isDark ? 'bg-[#0c0c0e]' : 'bg-zinc-200/70') : (isDark ? 'bg-[#151518]' : 'bg-zinc-100')}
                              ${isFocused ? (isDark ? 'bg-indigo-900/40' : 'bg-blue-200/50') : ''}
                              ${cell.isWorkingHour ? 'ring-1 ring-zinc-700/30' : ''}
                              hover:bg-zinc-800/80`}
                          >
                            {cell.isDayStart && (
                              <div className="absolute top-2 left-1 whitespace-nowrap">
                                <div className="text-[8px] font-black opacity-40 uppercase">{cell.dayName}</div>
                                <div className="text-[8px] font-black opacity-40">{cell.monthDay}</div>
                              </div>
                            )}
                            <div className={`text-xs font-black transition-colors duration-200
                              ${isFocused ? 'text-yellow-400 opacity-100 scale-110' : `${isDark ? 'text-white' : 'text-black'} opacity-100 group-hover/cell:text-yellow-400`}
                              ${cell.isHalf ? 'text-[8px] mt-1' : ''}`}>
                              {cell.hourLabel}
                            </div>
                            {!cell.isHalf && (
                              <div className={`text-[8px] font-bold uppercase transition-colors duration-200
                                ${isFocused ? 'text-yellow-400/80 opacity-100' : `${isDark ? 'text-white' : 'text-black'} opacity-40 group-hover/cell:text-yellow-400/80`}`}>
                                {cell.period}
                              </div>
                            )}
                            {cell.isHalf && !cell.hourLabel && <div className="w-0.5 h-0.5 rounded-full bg-zinc-700 group-hover/cell:bg-yellow-400"></div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                <div className={`h-16 border-t ${panelBorder} ${addRowBg}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center opacity-20 text-[10px] font-black uppercase tracking-[0.2em] pt-8">
        Global resolution context • Wall-clock anchored drift-free engine
      </div>

      <style>{`
        .scrollbar-custom::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #000000;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #333333;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #555555;
        }
        ${!isDark ? `
          .scrollbar-custom::-webkit-scrollbar-track {
            background: #f4f4f5;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb {
            background: #d4d4d8;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb:hover {
            background: #a1a1aa;
          }
        ` : ''}

        .timezone-no-shadow,
        .timezone-no-shadow * {
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default TimezoneConverter;