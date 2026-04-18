/**
 * cityPairContent.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates the three dynamic SEO content sections for every city-pair and
 * timezone-pair page:
 *
 *   1. Daylight Saving Time section
 *   2. About <City A> and <City B> Timezones
 *   3. Frequently Asked Questions  (with FAQPage JSON-LD)
 *
 * All output is computed purely from two IANA timezone identifiers so it works
 * identically for city routes (/london-to-new-york) and tz-code routes
 * (/gmt-to-est).  No external requests — uses only Intl APIs available in
 * every modern browser and Node ≥ 18.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DstPeriodRow {
  period: string;       // e.g. "Late Oct – early Nov"
  periodNote: string;   // e.g. "UK clocks back, US hasn't yet"
  tzALabel: string;     // e.g. "GMT (UTC+0)"
  tzBLabel: string;     // e.g. "EDT (UTC−4)"
  offsetLabel: string;  // e.g. "4 hours"
  isCurrent: boolean;
  isTransitioning: boolean;
}

export interface DstSectionData {
  cityA: string;
  cityB: string;
  rows: DstPeriodRow[];
  footerNote: string;
  hasDst: boolean;       // false when neither zone observes DST
}

export interface AboutSectionData {
  cityA: string;
  cityB: string;
  ianaA: string;
  ianaB: string;
  paragraphA: string;
  paragraphB: string;
  headingA: string;
  headingB: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionData {
  cityA: string;
  cityB: string;
  items: FaqItem[];
  jsonLd: string;  // serialised FAQPage JSON-LD — drop into <script type="application/ld+json">
}

export interface CityPairContentData {
  dst: DstSectionData;
  about: AboutSectionData;
  faq: FaqSectionData;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Returns the UTC offset in fractional hours for a given IANA zone at `date`.
 * e.g. Asia/Kolkata → 5.5,  America/New_York (EDT) → -4
 */
function getOffsetHours(iana: string, date: Date): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'longOffset',
    }).formatToParts(date);
    const raw = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0';
    const m = raw.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!m) return 0;
    const sign = m[1] === '-' ? -1 : 1;
    return sign * (parseInt(m[2], 10) + (m[3] ? parseInt(m[3], 10) / 60 : 0));
  } catch {
    return 0;
  }
}

/** Short offset string like "UTC+5:30" or "UTC−4". */
function shortOffset(iana: string, date: Date): string {
  const h = getOffsetHours(iana, date);
  if (h === 0) return 'UTC+0';
  const sign = h > 0 ? '+' : '−';
  const abs = Math.abs(h);
  const whole = Math.floor(abs);
  const mins = Math.round((abs - whole) * 60);
  return mins === 0 ? `UTC${sign}${whole}` : `UTC${sign}${whole}:${String(mins).padStart(2, '0')}`;
}

/** Short timezone abbreviation for a date, e.g. "BST", "EDT", "IST". */
function tzAbbr(iana: string, date: Date): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'short',
    }).formatToParts(date);
    return parts.find(p => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

/** Long timezone name, e.g. "British Summer Time". */
function tzLongName(iana: string, date: Date): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'long',
    }).formatToParts(date);
    return parts.find(p => p.type === 'timeZoneName')?.value ?? iana;
  } catch {
    return iana;
  }
}

/** Format a fractional offset as a display label "GMT (UTC+0)". */
function offsetLabel(iana: string, date: Date): string {
  const abbr = tzAbbr(iana, date);
  const utc  = shortOffset(iana, date);
  return `${abbr} (${utc})`;
}

/** Format |diff| as "5 hours" or "5.5 hours". */
function diffLabel(diffHours: number): string {
  const abs = Math.abs(diffHours);
  if (Number.isInteger(abs)) return `${abs} hour${abs === 1 ? '' : 's'}`;
  return `${abs.toFixed(1).replace(/\.0$/, '')} hours`;
}

/**
 * Returns four probe dates that cover the four DST-transition windows of a
 * calendar year relative to today:
 *   Jan 15  — northern-hemisphere winter / southern-hemisphere summer
 *   Apr 1   — northern spring (post US, pre UK sometimes)
 *   Jul 15  — northern summer
 *   Nov 1   — northern autumn transition window
 */
function probeYear(): Date[] {
  const y = new Date().getFullYear();
  return [
    new Date(y, 0, 15, 12),   // Jan 15
    new Date(y, 2, 20, 12),   // Mar 20 — US has changed, UK about to
    new Date(y, 6, 15, 12),   // Jul 15 — both on summer time
    new Date(y, 10, 5, 12),   // Nov 5  — UK changed back, US about to
  ];
}

/** True if this IANA zone observes DST at any point this year. */
function zoneObservesDst(iana: string): boolean {
  const probes = probeYear();
  const offsets = probes.map(d => getOffsetHours(iana, d));
  return new Set(offsets).size > 1;
}

/** True if both zones observe DST (either or both being DST-free → false). */
function pairHasDst(ianaA: string, ianaB: string): boolean {
  return zoneObservesDst(ianaA) || zoneObservesDst(ianaB);
}

/**
 * For zones that don't observe DST we generate a simple single-row table:
 * always the same offset, no transitions.
 */
function buildStaticDstRows(
  ianaA: string,
  ianaB: string,
  now: Date,
): DstPeriodRow[] {
  const diff = Math.abs(getOffsetHours(ianaA, now) - getOffsetHours(ianaB, now));
  return [
    {
      period: 'All year',
      periodNote: 'No Daylight Saving Time observed',
      tzALabel: offsetLabel(ianaA, now),
      tzBLabel: offsetLabel(ianaB, now),
      offsetLabel: diffLabel(diff),
      isCurrent: true,
      isTransitioning: false,
    },
  ];
}

/**
 * Core DST row builder — produces 4 probe rows that cover the main
 * transition windows.  Marks the row whose date range contains today.
 */
function buildDstRows(ianaA: string, ianaB: string): DstPeriodRow[] {
  const now = new Date();
  const nowMonth = now.getMonth(); // 0-based

  type ProbeConfig = {
    date: Date;
    period: string;
    note: string;
  };

  const y = now.getFullYear();

  const probes: ProbeConfig[] = [
    {
      date: new Date(y, 0, 15, 12),
      period: 'Nov – Mar',
      note: 'Both on standard time',
    },
    {
      date: new Date(y, 2, 20, 12),
      period: 'Mar – late Mar',
      note: 'US clocks forward, some zones still on standard',
    },
    {
      date: new Date(y, 6, 15, 12),
      period: 'Late Mar – Oct',
      note: 'Both on summer / daylight time',
    },
    {
      date: new Date(y, 10, 5, 12),
      period: 'Late Oct – early Nov',
      note: 'Clocks transitioning — check exact date',
    },
  ];

  // Which probe index is "now"?
  const currentIdx =
    nowMonth <= 1  ? 0 :
    nowMonth <= 2  ? 1 :
    nowMonth <= 9  ? 2 : 3;

  return probes.map((p, i) => {
    const diff = Math.abs(
      getOffsetHours(ianaA, p.date) - getOffsetHours(ianaB, p.date),
    );
    return {
      period: p.period,
      periodNote: p.note,
      tzALabel: offsetLabel(ianaA, p.date),
      tzBLabel: offsetLabel(ianaB, p.date),
      offsetLabel: diffLabel(diff),
      isCurrent: i === currentIdx,
      isTransitioning: i === 3,
    };
  });
}

// ─── Per-zone knowledge base ──────────────────────────────────────────────────
// We store concise but accurate paragraphs for the ~60 zones we support.
// For any unknown IANA zone we fall back to a generated paragraph that uses
// live Intl data so it's always accurate (just less detailed).

interface ZoneProfile {
  displayName: string;  // canonical human name, e.g. "London"
  country: string;
  paragraph: string;    // 2-3 sentence description
}

const ZONE_PROFILES: Record<string, ZoneProfile> = {
  'Europe/London': {
    displayName: 'London',
    country: 'United Kingdom',
    paragraph:
      'London uses Greenwich Mean Time (GMT, UTC+0) in winter and British Summer Time (BST, UTC+1) in summer. The UK clocks go forward one hour on the last Sunday of March and back on the last Sunday of October. GMT takes its name from the Royal Observatory in Greenwich, east London — the historical origin of UTC-based world time.',
  },
  'America/New_York': {
    displayName: 'New York',
    country: 'United States',
    paragraph:
      'New York City operates on Eastern Time — Eastern Standard Time (EST, UTC−5) in winter and Eastern Daylight Time (EDT, UTC−4) in summer. US clocks spring forward on the second Sunday of March and fall back on the first Sunday of November. NYSE and NASDAQ market hours (9:30 AM–4:00 PM ET) make Eastern Time one of the most referenced zones in global finance.',
  },
  'America/Los_Angeles': {
    displayName: 'Los Angeles',
    country: 'United States',
    paragraph:
      'Los Angeles and the US West Coast use Pacific Time — Pacific Standard Time (PST, UTC−8) in winter and Pacific Daylight Time (PDT, UTC−7) in summer. The transition follows the same US schedule: forward in March, back in November. Silicon Valley operates in this timezone, making PT a reference point for the tech industry.',
  },
  'America/Chicago': {
    displayName: 'Chicago',
    country: 'United States',
    paragraph:
      'Chicago uses Central Time — Central Standard Time (CST, UTC−6) in winter and Central Daylight Time (CDT, UTC−5) in summer, shifting on the same US DST schedule. It sits one hour behind Eastern Time and two hours ahead of Pacific, placing it in the heart of US business scheduling overlap.',
  },
  'America/Denver': {
    displayName: 'Denver',
    country: 'United States',
    paragraph:
      'Denver and the Mountain West use Mountain Time — Mountain Standard Time (MST, UTC−7) in winter and Mountain Daylight Time (MDT, UTC−6) in summer. Note that Arizona (except Navajo Nation) does not observe DST and stays on MST year-round, which can cause confusion for Arizona-adjacent scheduling.',
  },
  'America/Toronto': {
    displayName: 'Toronto',
    country: 'Canada',
    paragraph:
      'Toronto follows Eastern Time, the same as New York — Eastern Standard Time (EST, UTC−5) in winter, Eastern Daylight Time (EDT, UTC−4) in summer — with transitions on the same US/Canada schedule. Canada and the US typically transition their clocks on the same dates, keeping cross-border offsets stable throughout the year.',
  },
  'America/Vancouver': {
    displayName: 'Vancouver',
    country: 'Canada',
    paragraph:
      'Vancouver uses Pacific Time, matching Los Angeles and Seattle — PST (UTC−8) in winter, PDT (UTC−7) in summer. Canada\'s Pacific provinces change clocks on the same schedule as the US, so the Vancouver–LA offset stays consistent at zero hours throughout the year.',
  },
  'America/Sao_Paulo': {
    displayName: 'São Paulo',
    country: 'Brazil',
    paragraph:
      'São Paulo uses Brasília Time (BRT, UTC−3) and previously observed summer time (BRST, UTC−2), but Brazil abolished Daylight Saving Time in 2019. The offset is now a fixed UTC−3 year-round, making Brazilian time scheduling simpler and more predictable for international teams.',
  },
  'America/Argentina/Buenos_Aires': {
    displayName: 'Buenos Aires',
    country: 'Argentina',
    paragraph:
      'Buenos Aires uses Argentina Time (ART, UTC−3) with no Daylight Saving Time observed — Argentina permanently dropped DST in 2000. This fixed offset simplifies scheduling with South America\'s Southern Cone significantly compared to the Northern Hemisphere DST rotations.',
  },
  'Europe/Paris': {
    displayName: 'Paris',
    country: 'France',
    paragraph:
      'Paris (and all of metropolitan France) uses Central European Time (CET, UTC+1) in winter and Central European Summer Time (CEST, UTC+2) in summer. EU clocks change on the last Sunday of March and the last Sunday of October, the same schedule as most of continental Europe.',
  },
  'Europe/Berlin': {
    displayName: 'Berlin',
    country: 'Germany',
    paragraph:
      'Berlin uses Central European Time (CET, UTC+1) in winter and Central European Summer Time (CEST, UTC+2) in summer. Germany\'s clock transitions follow the EU schedule — last Sunday of March and last Sunday of October. Frankfurt\'s financial markets (XETRA) operate on CET/CEST, making this a key European business timezone.',
  },
  'Europe/Amsterdam': {
    displayName: 'Amsterdam',
    country: 'Netherlands',
    paragraph:
      'Amsterdam, like most of Western Europe, uses Central European Time (CET, UTC+1) in winter and Central European Summer Time (CEST, UTC+2) in summer. Transitions follow the EU schedule. Amsterdam is home to Schiphol Airport and the AEX stock exchange, both operating on CET/CEST.',
  },
  'Europe/Rome': {
    displayName: 'Rome',
    country: 'Italy',
    paragraph:
      'Rome uses Central European Time (CET, UTC+1) in winter and Central European Summer Time (CEST, UTC+2) in summer — matching Berlin and Paris exactly on the EU transition schedule. The Borsa Italiana exchange also operates on CET/CEST.',
  },
  'Europe/Madrid': {
    displayName: 'Madrid',
    country: 'Spain',
    paragraph:
      'Despite its geographical position (further west than the UK), Spain uses CET (UTC+1) in winter and CEST (UTC+2) in summer, on the EU schedule. This means Madrid has notably late sunsets and a culture built around evening hours.',
  },
  'Europe/Moscow': {
    displayName: 'Moscow',
    country: 'Russia',
    paragraph:
      'Moscow uses Moscow Standard Time (MSK, UTC+3) year-round with no Daylight Saving Time — Russia permanently abandoned DST in 2014. The fixed UTC+3 offset means the Moscow–Western Europe gap changes by one hour when Europe transitions clocks.',
  },
  'Europe/Istanbul': {
    displayName: 'Istanbul',
    country: 'Turkey',
    paragraph:
      'Istanbul uses Turkey Time (TRT, UTC+3) permanently with no Daylight Saving Time — Turkey stopped observing DST in 2016 and fixed its clocks at UTC+3. This is the same offset as Moscow, putting Istanbul three hours ahead of London in winter and two hours ahead in summer.',
  },
  'Europe/Kyiv': {
    displayName: 'Kyiv',
    country: 'Ukraine',
    paragraph:
      'Kyiv uses Eastern European Time (EET, UTC+2) in winter and Eastern European Summer Time (EEST, UTC+3) in summer. Ukraine follows the EU DST schedule — last Sunday of March forward, last Sunday of October back. This places Kyiv two hours ahead of London in summer and one hour ahead in winter.',
  },
  'Asia/Kolkata': {
    displayName: 'India',
    country: 'India',
    paragraph:
      'India uses India Standard Time (IST, UTC+5:30) year-round with no Daylight Saving Time. The unusual 30-minute offset from UTC reflects a compromise made during India\'s unification — the country spans two natural time zone widths but uses a single zone for national cohesion. IST applies to all Indian cities including Delhi, Mumbai, Bangalore, Chennai, Kolkata, and Hyderabad.',
  },
  'Asia/Dubai': {
    displayName: 'Dubai',
    country: 'United Arab Emirates',
    paragraph:
      'Dubai and the UAE use Gulf Standard Time (GST, UTC+4) year-round with no Daylight Saving Time. The fixed offset makes Dubai scheduling predictable throughout the year. As a major financial and logistics hub, GST is a widely used timezone in the Middle East and South Asia corridor.',
  },
  'Asia/Riyadh': {
    displayName: 'Riyadh',
    country: 'Saudi Arabia',
    paragraph:
      'Riyadh uses Arabia Standard Time (AST, UTC+3) year-round with no Daylight Saving Time observed. Saudi Arabia has not adjusted clocks seasonally since 2008. The UTC+3 offset places Riyadh three hours ahead of London (winter) and two hours ahead in summer when Europe changes clocks.',
  },
  'Asia/Tokyo': {
    displayName: 'Tokyo',
    country: 'Japan',
    paragraph:
      'Tokyo uses Japan Standard Time (JST, UTC+9) year-round. Japan does not observe Daylight Saving Time — the country trialled it briefly after WWII but abandoned it. The fixed JST offset makes Japan scheduling particularly straightforward despite the large distance from Europe and the Americas.',
  },
  'Asia/Seoul': {
    displayName: 'Seoul',
    country: 'South Korea',
    paragraph:
      'Seoul uses Korea Standard Time (KST, UTC+9) year-round, identical to Tokyo in offset. South Korea does not observe Daylight Saving Time. The consistent UTC+9 offset means Seoul–Tokyo scheduling has zero drift throughout the year.',
  },
  'Asia/Shanghai': {
    displayName: 'Beijing / Shanghai',
    country: 'China',
    paragraph:
      'China uses China Standard Time (CST, UTC+8) across all of its territory — a single zone for the world\'s third-largest country by area. China abolished DST in 1991. The uniform UTC+8 offset makes scheduling with China simple, though the western regions (Xinjiang) are geographically in UTC+5/6 territory.',
  },
  'Asia/Hong_Kong': {
    displayName: 'Hong Kong',
    country: 'Hong Kong SAR',
    paragraph:
      'Hong Kong uses Hong Kong Time (HKT, UTC+8) year-round with no Daylight Saving Time. The fixed offset aligns Hong Kong with Mainland China (CST) and Singapore (SGT). The Hang Seng exchange operates on HKT, making it a key financial timezone for the Asia-Pacific region.',
  },
  'Asia/Singapore': {
    displayName: 'Singapore',
    country: 'Singapore',
    paragraph:
      'Singapore uses Singapore Time (SGT, UTC+8) year-round with no Daylight Saving Time. Singapore is situated near the equator, which means daylight hours barely vary throughout the year, making DST unnecessary. SGT aligns with Kuala Lumpur (MYT), Hong Kong (HKT), and China (CST).',
  },
  'Asia/Kuala_Lumpur': {
    displayName: 'Kuala Lumpur',
    country: 'Malaysia',
    paragraph:
      'Kuala Lumpur uses Malaysia Time (MYT, UTC+8) year-round with no Daylight Saving Time. Near-equatorial location means consistent daylight throughout the year. MYT aligns with Singapore (SGT) and Hong Kong (HKT), making KL a natural scheduling bridge in the South-East Asian corridor.',
  },
  'Asia/Bangkok': {
    displayName: 'Bangkok',
    country: 'Thailand',
    paragraph:
      'Bangkok uses Indochina Time (ICT, UTC+7) year-round with no Daylight Saving Time. The fixed UTC+7 offset is shared with Hanoi, Ho Chi Minh City, and Jakarta. Thailand\'s near-equatorial position makes seasonal time adjustment unnecessary.',
  },
  'Asia/Jakarta': {
    displayName: 'Jakarta',
    country: 'Indonesia',
    paragraph:
      'Jakarta uses Western Indonesia Time (WIB, UTC+7) year-round. Indonesia spans three time zones across its archipelago but Jakarta and most of the population are on WIB. No Daylight Saving Time is observed, making Indonesian scheduling consistent throughout the year.',
  },
  'Asia/Manila': {
    displayName: 'Manila',
    country: 'Philippines',
    paragraph:
      'Manila uses Philippine Time (PHT, UTC+8) year-round with no Daylight Saving Time. The Philippines observes a single timezone across all its islands. PHT aligns with Singapore, Hong Kong, and Beijing, making the Philippines well-positioned for pan-Asian scheduling.',
  },
  'Asia/Karachi': {
    displayName: 'Karachi',
    country: 'Pakistan',
    paragraph:
      'Karachi uses Pakistan Standard Time (PKT, UTC+5) year-round. Pakistan does not currently observe Daylight Saving Time (it was briefly reintroduced in 2008 but discontinued). The fixed UTC+5 places Karachi and Lahore thirty minutes behind IST and one hour ahead of Dubai.',
  },
  'Asia/Dhaka': {
    displayName: 'Dhaka',
    country: 'Bangladesh',
    paragraph:
      'Dhaka uses Bangladesh Standard Time (BST, UTC+6) year-round with no Daylight Saving Time. The UTC+6 offset places Dhaka 30 minutes ahead of India (IST) and one hour behind Myanmar. Bangladesh has not observed seasonal time changes since 2009.',
  },
  'Asia/Colombo': {
    displayName: 'Colombo',
    country: 'Sri Lanka',
    paragraph:
      'Colombo uses Sri Lanka Standard Time (SLST, UTC+5:30) year-round, matching India\'s IST offset exactly. Sri Lanka does not observe Daylight Saving Time. The shared offset with India makes scheduling between the two countries straightforward.',
  },
  'Australia/Sydney': {
    displayName: 'Sydney',
    country: 'Australia',
    paragraph:
      'Sydney uses Australian Eastern Standard Time (AEST, UTC+10) in winter and Australian Eastern Daylight Time (AEDT, UTC+11) in summer. Because Australia is in the Southern Hemisphere, its summer runs October–April — the opposite of the Northern Hemisphere. Clocks go forward on the first Sunday of October and back on the first Sunday of April.',
  },
  'Australia/Melbourne': {
    displayName: 'Melbourne',
    country: 'Australia',
    paragraph:
      'Melbourne follows the same schedule as Sydney — AEST (UTC+10) in winter and AEDT (UTC+11) in summer, with Southern Hemisphere transitions in October and April. Melbourne\'s ASX (Australian Securities Exchange) operates on AEST/AEDT, making it a key financial timezone for the Asia-Pacific region.',
  },
  'Australia/Brisbane': {
    displayName: 'Brisbane',
    country: 'Australia',
    paragraph:
      'Brisbane uses AEST (UTC+10) year-round — Queensland does not observe Daylight Saving Time, a point of ongoing debate in Australia. This means Brisbane and Sydney share the same offset only during Sydney\'s winter (April–October) but differ by one hour during Sydney\'s summer.',
  },
  'Australia/Perth': {
    displayName: 'Perth',
    country: 'Australia',
    paragraph:
      'Perth uses Australian Western Standard Time (AWST, UTC+8) year-round. Western Australia does not observe Daylight Saving Time after multiple referendum rejections. The UTC+8 offset aligns Perth with Singapore and Hong Kong, making it a convenient bridge for Asia-Pacific trade.',
  },
  'Pacific/Auckland': {
    displayName: 'Auckland',
    country: 'New Zealand',
    paragraph:
      'Auckland uses New Zealand Standard Time (NZST, UTC+12) in winter and New Zealand Daylight Time (NZDT, UTC+13) in summer. As with Australia, New Zealand\'s seasons are reversed — clocks go forward in late September and back in early April. NZDT is one of the world\'s most advanced offsets at UTC+13.',
  },
  'Africa/Johannesburg': {
    displayName: 'Johannesburg',
    country: 'South Africa',
    paragraph:
      'Johannesburg uses South Africa Standard Time (SAST, UTC+2) year-round with no Daylight Saving Time. South Africa abandoned DST in 1994. The fixed UTC+2 offset aligns Johannesburg with Eastern European Time (EET) in winter, though they diverge by one hour when Europe observes EEST in summer.',
  },
  'Africa/Nairobi': {
    displayName: 'Nairobi',
    country: 'Kenya',
    paragraph:
      'Nairobi uses East Africa Time (EAT, UTC+3) year-round with no Daylight Saving Time. The fixed UTC+3 offset matches Moscow and Riyadh. Kenya\'s equatorial location means nearly equal day/night throughout the year, making DST impractical.',
  },
  'Africa/Lagos': {
    displayName: 'Lagos',
    country: 'Nigeria',
    paragraph:
      'Lagos uses West Africa Time (WAT, UTC+1) year-round. Nigeria and most of West Africa do not observe Daylight Saving Time. The UTC+1 offset matches Central European standard time (CET) in winter — though Europe moves to CEST in summer, WAT stays fixed.',
  },
  'Africa/Cairo': {
    displayName: 'Cairo',
    country: 'Egypt',
    paragraph:
      'Cairo uses Eastern European Time (EET, UTC+2) year-round. Egypt discontinued Daylight Saving Time permanently in 2011. The fixed UTC+2 offset places Cairo two hours ahead of London in summer and three hours ahead in winter.',
  },
  'Europe/Lisbon': {
    displayName: 'Lisbon',
    country: 'Portugal',
    paragraph:
      'Lisbon uses Western European Time (WET, UTC+0) in winter and Western European Summer Time (WEST, UTC+1) in summer, matching London\'s GMT/BST schedule. Portugal follows the EU DST transition dates. Despite being on the Iberian Peninsula, Lisbon shares London\'s timezone rather than joining CET.',
  },
  'Europe/Zurich': {
    displayName: 'Zurich',
    country: 'Switzerland',
    paragraph:
      'Zurich uses Central European Time (CET, UTC+1) in winter and Central European Summer Time (CEST, UTC+2) in summer on the EU schedule. Switzerland\'s major financial institutions — including the Swiss Exchange (SIX) — operate on CET/CEST, making Zurich a key financial timezone in Europe.',
  },
  'Europe/Stockholm': {
    displayName: 'Stockholm',
    country: 'Sweden',
    paragraph:
      'Stockholm uses Central European Time (CET, UTC+1) in winter and Central European Summer Time (CEST, UTC+2) in summer, matching Berlin and Paris. Sweden follows the EU DST schedule. Sweden has been debating abolishing DST as part of the broader EU review of seasonal time changes.',
  },
  'Europe/Helsinki': {
    displayName: 'Helsinki',
    country: 'Finland',
    paragraph:
      'Helsinki uses Eastern European Time (EET, UTC+2) in winter and Eastern European Summer Time (EEST, UTC+3) in summer. Finland, as the easternmost EU capital timezone, is one hour ahead of Berlin. Finland follows the EU DST schedule — last Sunday of March and October.',
  },
  'Europe/Warsaw': {
    displayName: 'Warsaw',
    country: 'Poland',
    paragraph:
      'Warsaw uses Central European Time (CET, UTC+1) in winter and Central European Summer Time (CEST, UTC+2) in summer on the EU schedule, matching Berlin and Paris. Warsaw\'s Warsaw Stock Exchange (WSE) operates on CET/CEST.',
  },
  'Africa/Accra': {
    displayName: 'Accra',
    country: 'Ghana',
    paragraph:
      'Accra uses Greenwich Mean Time (GMT, UTC+0) year-round with no Daylight Saving Time. Ghana shares its offset with London\'s winter timezone, but stays fixed while London moves to BST in summer. This makes Accra UTC+0 at all times, useful as a reference for West Africa.',
  },
  'America/Mexico_City': {
    displayName: 'Mexico City',
    country: 'Mexico',
    paragraph:
      'Mexico City uses Central Standard Time (CST, UTC−6) in winter and Central Daylight Time (CDT, UTC−5) in summer. Mexico observes DST on a schedule similar to the US, though it changed in 2022 — most Mexican states no longer observe DST. Confirm the exact current rules for your scheduling needs.',
  },
};

/**
 * Generates a fallback paragraph for zones not in the knowledge base.
 * Uses live Intl data so it\'s always factually accurate.
 */
function buildFallbackParagraph(iana: string, displayName: string, now: Date): string {
  const long = tzLongName(iana, now);
  const abbr = tzAbbr(iana, now);
  const utc  = shortOffset(iana, now);
  const observesDst = zoneObservesDst(iana);
  const dstNote = observesDst
    ? 'Clocks are adjusted seasonally for Daylight Saving Time.'
    : 'No Daylight Saving Time is observed — the offset is fixed year-round.';
  return `${displayName} uses ${long} (${abbr}, ${utc}). ${dstNote}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a human-friendly display name for an IANA zone.
 * Falls back to splitting the IANA string on "/" and cleaning underscores.
 */
export function getZoneDisplayName(iana: string): string {
  return ZONE_PROFILES[iana]?.displayName ?? iana.split('/').pop()!.replace(/_/g, ' ');
}

/**
 * Builds all three content sections for a city/tz pair.
 *
 * @param ianaA   IANA identifier for the "from" zone, e.g. "Europe/London"
 * @param ianaB   IANA identifier for the "to" zone,   e.g. "America/New_York"
 * @param labelA  Display name override (pass sourceTz.name from the component)
 * @param labelB  Display name override (pass targets[0].name from the component)
 */
export function buildCityPairContent(
  ianaA: string,
  ianaB: string,
  labelA: string,
  labelB: string,
): CityPairContentData {
  const now = new Date();

  // ── Names ──────────────────────────────────────────────────────────────────
  const cityA = labelA || getZoneDisplayName(ianaA);
  const cityB = labelB || getZoneDisplayName(ianaB);

  // ── DST Section ────────────────────────────────────────────────────────────
  const hasDst = pairHasDst(ianaA, ianaB);
  const dstRows = hasDst
    ? buildDstRows(ianaA, ianaB)
    : buildStaticDstRows(ianaA, ianaB, now);

  const dst: DstSectionData = {
    cityA,
    cityB,
    rows: dstRows,
    hasDst,
    footerNote: hasDst
      ? 'The transition window typically lasts 1–2 weeks in spring and autumn. If you have a recurring weekly meeting near a clock change, verify the exact date to avoid a missed call.'
      : `Neither ${cityA} nor ${cityB} observes Daylight Saving Time. The offset between these two zones is fixed year-round.`,
  };

  // ── About Section ──────────────────────────────────────────────────────────
  const profileA = ZONE_PROFILES[ianaA];
  const profileB = ZONE_PROFILES[ianaB];

  const abbrA  = tzAbbr(ianaA, now);
  const abbrB  = tzAbbr(ianaB, now);
  const longA  = tzLongName(ianaA, now);
  const longB  = tzLongName(ianaB, now);
  const utcA   = shortOffset(ianaA, now);
  const utcB   = shortOffset(ianaB, now);

  const about: AboutSectionData = {
    cityA,
    cityB,
    ianaA,
    ianaB,
    headingA: `${cityA} — ${abbrA} (${utcA})`,
    headingB: `${cityB} — ${abbrB} (${utcB})`,
    paragraphA: profileA
      ? profileA.paragraph
      : buildFallbackParagraph(ianaA, cityA, now),
    paragraphB: profileB
      ? profileB.paragraph
      : buildFallbackParagraph(ianaB, cityB, now),
  };

  // ── FAQ Section ────────────────────────────────────────────────────────────
  const srcOffsetHrs = getOffsetHours(ianaA, now);
  const tgtOffsetHrs = getOffsetHours(ianaB, now);
  const diffHrs      = srcOffsetHrs - tgtOffsetHrs;
  const absDiff      = Math.abs(diffHrs);
  const aheadBehind  = diffHrs > 0 ? 'ahead of' : diffHrs < 0 ? 'behind' : 'at the same offset as';

  // Best call window calculation
  const BUSINESS_START = 9;
  const BUSINESS_END   = 18;
  const overlapStart   = Math.max(BUSINESS_START, BUSINESS_START + diffHrs);
  const overlapEnd     = Math.min(BUSINESS_END,   BUSINESS_END   + diffHrs);

  const formatHourAmPm = (h: number): string => {
    const norm = ((h % 24) + 24) % 24;
    const h12  = norm % 12 || 12;
    return `${h12}:00 ${norm < 12 ? 'am' : 'pm'}`;
  };

  const overlapText =
    overlapStart < overlapEnd
      ? `The best overlap window is ${formatHourAmPm(overlapStart)}–${formatHourAmPm(overlapEnd)} ${cityA} time, which corresponds to ${formatHourAmPm(overlapStart - diffHrs)}–${formatHourAmPm(overlapEnd - diffHrs)} ${cityB} time. Both cities are within standard business hours (9 am–6 pm) during this window.`
      : `${cityA} and ${cityB} have no standard 9 am–6 pm business-hour overlap. Consider scheduling during early morning or late evening, or use a rotating schedule to share the inconvenience.`;

  // 9 am in A → what time in B
  const nineAmInB = BUSINESS_START - diffHrs;
  const fivepmInA = 17;
  const fivePmBInA = fivepmInA + diffHrs;

  // DST question — only include if the pair actually has DST changes
  const dstFaqItem: FaqItem | null = hasDst
    ? {
        question: `Does the ${cityA}–${cityB} time difference change with Daylight Saving Time?`,
        answer: (() => {
          const aObserves = zoneObservesDst(ianaA);
          const bObserves = zoneObservesDst(ianaB);
          if (aObserves && bObserves) {
            return `Both ${cityA} and ${cityB} observe Daylight Saving Time, but their transitions may not happen on the same date. During the brief 1–2 week windows in spring and autumn when only one zone has changed clocks, the offset between the two cities shifts by one hour. For most of the year the difference is ${diffLabel(absDiff)}, but double-check the transition dates if you have a recurring meeting scheduled near those windows.`;
          } else if (aObserves) {
            return `${cityA} observes Daylight Saving Time but ${cityB} does not. This means the offset between the two cities changes by one hour when ${cityA} transitions its clocks — typically in late March (spring forward) and late October (fall back). Always verify the current offset when scheduling around those dates.`;
          } else {
            return `${cityB} observes Daylight Saving Time but ${cityA} does not. This means the offset between the two cities changes by one hour when ${cityB} transitions its clocks. Always verify the current offset when scheduling meetings near DST transition dates.`;
          }
        })(),
      }
    : null;

  const items: FaqItem[] = [
    {
      question: `What is the time difference between ${cityA} and ${cityB}?`,
      answer:
        absDiff === 0
          ? `${cityA} and ${cityB} are currently at the same UTC offset — there is no time difference between them right now.`
          : `${cityA} is currently ${diffLabel(absDiff)} ${aheadBehind} ${cityB}. ${cityA} uses ${longA} (${utcA}) and ${cityB} uses ${longB} (${utcB}).`,
    },
    {
      question: `What is the best time to call or meet between ${cityA} and ${cityB}?`,
      answer: overlapText,
    },
    {
      question: `When it is 9:00 AM in ${cityA}, what time is it in ${cityB}?`,
      answer: `When it is 9:00 AM in ${cityA}, it is ${formatHourAmPm(nineAmInB)} in ${cityB}${nineAmInB < 0 || nineAmInB >= 24 ? ' (previous day)' : ''}. ${cityA} is ${diffLabel(absDiff)} ${aheadBehind} ${cityB}.`,
    },
    {
      question: `When it is 5:00 PM in ${cityB}, what time is it in ${cityA}?`,
      answer: `When it is 5:00 PM in ${cityB}, it is ${formatHourAmPm(fivePmBInA)} in ${cityA}${fivePmBInA < 0 || fivePmBInA >= 24 ? ' (next day)' : ''}.`,
    },
    ...(dstFaqItem ? [dstFaqItem] : []),
  ];

  // JSON-LD for FAQPage schema
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  });

  const faq: FaqSectionData = { cityA, cityB, items, jsonLd };

  return { dst, about, faq };
}