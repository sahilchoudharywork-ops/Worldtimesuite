// import fs from 'fs';
// import path from 'path';
// import { getRouteState } from '../lib/routing';
// import { getSeoData } from '../lib/seo';
// import { TIMEZONE_PAIR_ROUTES, TIMEZONE_BY_SLUG } from '../data/timezones';

// const ROOT = process.cwd();
// const DIST_DIR = path.join(ROOT, 'dist');
// const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
// const ORIGIN = 'https://worldtimesuite.com';

// // City pair routes that get prerendered
// const cityRoutes = [
//   '/',
//   '/timer',
//   '/stopwatch',
//   '/calendar',
//   '/london-to-san-francisco',
//   '/new-york-to-london',
//   '/london-to-vancouver',
//   '/los-angeles-to-sydney',
//   '/sydney-to-new-york',
//   '/london-to-melbourne',
//   '/london-to-sydney',
//   '/sydney-to-perth',
//   '/melbourne-to-perth',
//   '/sydney-to-london',
//   '/india-to-london',
//   '/new-york-to-singapore',
//   '/melbourne-to-london',
//   '/seattle-to-boston',
//   '/adelaide-to-los-angeles',
//   '/melbourne-to-sydney',
//   '/sydney-to-brisbane',
//   '/brisbane-to-sydney',
//   '/sydney-to-melbourne',
//   '/washington-dc-to-vienna',
//   '/houston-to-las-vegas',
//   '/perth-to-melbourne',
//   '/new-york-to-sydney',
//   '/bangalore-to-san-diego',
//   '/perth-to-sydney',
//   '/lisbon-to-rio-de-janeiro',
//   '/boston-to-warsaw',
//   '/new-york-to-dubai',
//   '/perth-to-adelaide',
//   '/melbourne-to-brisbane',
//   '/montreal-to-vancouver',
//   '/cairo-to-washington-dc',
//   '/seattle-to-copenhagen',
//   '/mumbai-to-san-francisco',
//   '/las-vegas-to-honolulu',
//   '/dubai-to-new-york',
//   '/san-francisco-to-melbourne',
//   '/perth-to-dallas',
//   '/hyderabad-to-mumbai',
//   '/wellington-to-mumbai',
//   '/bangalore-to-melbourne',
//   '/melbourne-to-singapore',
//   '/sydney-to-adelaide',
//   '/singapore-to-new-york',
//   '/athens-to-perth',
//   '/san-francisco-to-sydney',
//   '/miami-to-tokyo'
// ];

// // All routes = timezone code routes + city routes
// // Timezone routes are listed first so they get priority in the build output
// const routes = [
//   ...TIMEZONE_PAIR_ROUTES,
//   ...cityRoutes
// ];

// const escapeHtml = (value: string) =>
//   value
//     .replace(/&/g, '&amp;')
//     .replace(/"/g, '&quot;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;');

// const titleCase = (value: string) =>
//   value
//     .split('-')
//     .filter(Boolean)
//     .map(part => part.charAt(0).toUpperCase() + part.slice(1))
//     .join(' ');

// const getStaticBody = (route: string) => {
//   const routeState = getRouteState(route);

//   // Timezone code pages e.g. /est-to-ist
//   if (routeState.timezoneRoute) {
//     const from = TIMEZONE_BY_SLUG[routeState.timezoneRoute.fromSlug];
//     const to = TIMEZONE_BY_SLUG[routeState.timezoneRoute.toSlug];

//     if (from && to) {
//       return `
//         <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
//           <div style="max-width:1100px;margin:0 auto;">
//             <div style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;">
//               ${escapeHtml(from.code)} to ${escapeHtml(to.code)} Converter
//             </div>
//             <p style="margin-top:24px;font-size:20px;line-height:1.6;color:#a1a1aa;max-width:900px;">
//               Convert ${escapeHtml(from.name)} (${escapeHtml(from.code)}) to ${escapeHtml(to.name)} (${escapeHtml(to.code)}) instantly.
//               Use the converter below to see the exact time difference and find the best hours to schedule meetings.
//             </p>
//             <div style="margin-top:40px;padding:32px;border:1px solid #27272a;border-radius:32px;background:#09090b;">
//               <div style="font-size:12px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#71717a;margin-bottom:16px;">
//                 Time Zone Conversion
//               </div>
//               <div style="font-size:42px;font-weight:800;letter-spacing:-0.03em;text-transform:uppercase;">
//                 ${escapeHtml(from.code)} → ${escapeHtml(to.code)}
//               </div>
//               <div style="margin-top:10px;font-size:16px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">
//                 ${escapeHtml(from.name)} → ${escapeHtml(to.name)}
//               </div>
//               <div style="margin-top:24px;">
//                 <a href="${route}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">
//                   Open Converter
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       `;
//     }
//   }

//   // City pair pages e.g. /london-to-new-york
//   if (routeState.cityRoute) {
//     const fromName = titleCase(routeState.cityRoute.fromSlug);
//     const toName = titleCase(routeState.cityRoute.toSlug);

//     return `
//       <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
//         <div style="max-width:1100px;margin:0 auto;">
//           <div style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;">
//             ${escapeHtml(fromName)} To ${escapeHtml(toName)} Time Converter
//           </div>
//           <p style="margin-top:24px;font-size:20px;line-height:1.6;color:#a1a1aa;max-width:900px;">
//             Convert time from ${escapeHtml(fromName)} to ${escapeHtml(toName)} instantly. Check the live time difference and compare local time before scheduling meetings.
//           </p>
//           <div style="margin-top:40px;padding:32px;border:1px solid #27272a;border-radius:32px;background:#09090b;">
//             <div style="font-size:12px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#71717a;margin-bottom:16px;">
//               Live Route
//             </div>
//             <div style="font-size:42px;font-weight:800;letter-spacing:-0.03em;text-transform:uppercase;">
//               ${escapeHtml(fromName)} → ${escapeHtml(toName)}
//             </div>
//             <div style="margin-top:24px;">
//               <a href="${route}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">
//                 Open Converter
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     `;
//   }

//   // Static pages: homepage, /timer, /stopwatch, /calendar
//   return `
//     <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
//       <div style="max-width:1100px;margin:0 auto;">
//         <div style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;">
//           Timezone Converter
//         </div>
//         <p style="margin-top:24px;font-size:20px;line-height:1.6;color:#a1a1aa;max-width:900px;">
//           Convert time between cities worldwide with WorldTimeSuite.
//         </p>
//         <div style="margin-top:24px;">
//           <a href="/india-to-new-york" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">
//             Explore Popular Route
//           </a>
//         </div>
//       </div>
//     </div>
//   `;
// };

// const injectHtml = (template: string, route: string) => {
//   const seo = getSeoData(getRouteState(route));
//   const canonicalUrl = `${ORIGIN}${seo.canonicalPath}`;
//   const bodyHtml = getStaticBody(route);

//   return template
//     .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(seo.title)}</title>`)
//     .replace(
//       /<meta name="description" content="[\s\S]*?">/,
//       `<meta name="description" content="${escapeHtml(seo.description)}">`
//     )
//     .replace(
//       /<meta property="og:title" content="[\s\S]*?">/,
//       `<meta property="og:title" content="${escapeHtml(seo.title)}">`
//     )
//     .replace(
//       /<meta property="og:description" content="[\s\S]*?">/,
//       `<meta property="og:description" content="${escapeHtml(seo.description)}">`
//     )
//     .replace(
//       /<meta property="og:url" content="[\s\S]*?">/,
//       `<meta property="og:url" content="${canonicalUrl}">`
//     )
//     .replace(
//       /<meta name="twitter:title" content="[\s\S]*?">/,
//       `<meta name="twitter:title" content="${escapeHtml(seo.title)}">`
//     )
//     .replace(
//       /<meta name="twitter:description" content="[\s\S]*?">/,
//       `<meta name="twitter:description" content="${escapeHtml(seo.description)}">`
//     )
//     .replace(
//       /<link rel="canonical" href="[\s\S]*?">/,
//       `<link rel="canonical" href="${canonicalUrl}">`
//     )
//     .replace('<!--app-html-->', bodyHtml);
// };

// const writeRoute = (route: string, html: string) => {
//   const filePath =
//     route === '/'
//       ? path.join(DIST_DIR, 'index.html')
//       : path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');

//   fs.mkdirSync(path.dirname(filePath), { recursive: true });
//   fs.writeFileSync(filePath, html, 'utf8');
//   console.log(`Wrote ${filePath}`);
// };

// const main = () => {
//   if (!fs.existsSync(TEMPLATE_PATH)) {
//     throw new Error(`Missing build template at ${TEMPLATE_PATH}`);
//   }

//   const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

//   for (const route of routes) {
//     const html = injectHtml(template, route);
//     writeRoute(route, html);
//   }

//   console.log(`Prerendered ${routes.length} routes (${TIMEZONE_PAIR_ROUTES.length} timezone + ${cityRoutes.length} city/static).`);
// };

// main();


import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
const ORIGIN = 'https://worldtimesuite.com';

// ─── Routes ───────────────────────────────────────────────────────────────────

const STATIC_ROUTES = ['/', '/timer', '/stopwatch', '/calendar'];

const TIMEZONE_ROUTES: string[] = [
  '/ist-to-gmt',
  '/est-to-gmt',
  '/ist-to-est',
  '/pst-to-est',
  '/pst-to-gmt',
  '/cst-to-gmt',
  '/ist-to-pst',
  '/cet-to-gmt',
  '/aest-to-gmt',
  '/ist-to-cst',
  '/est-to-cet',
  '/gmt-to-ist',
  '/gst-to-gmt',
  '/pht-to-est',
  '/pht-to-gmt',
  '/jst-to-gmt',
  '/cest-to-gmt',
  '/jst-to-est',
  '/cst-to-est',
  '/gmt-to-cet',
  '/pst-to-cst',
  '/ist-to-aest',
  '/est-to-aest',
  '/hkt-to-gmt',
  '/hkt-to-est',
  '/sgt-to-gmt',
  '/sgt-to-est',
  '/brt-to-est',
  '/mst-to-gmt',
  '/eet-to-gmt',
  '/kst-to-est',
  '/gmt-to-pst',
  '/cet-to-est',
  '/wet-to-gmt',
  '/nzdt-to-est',
  '/ast-to-est',
  '/brt-to-gmt',
  '/ist-to-jst',
  '/cst-to-pst',
  '/pst-to-cet',
  '/cet-to-ist',
  '/mst-to-est',
  '/gst-to-ist',
  '/gmt-to-kst',
  '/est-to-sgt',
  '/ist-to-hkt',
  '/aest-to-pst',
  '/gmt-to-msk',
];

const CITY_ROUTES: string[] = [
  '/london-to-new-york',
  '/new-york-to-london',
  '/london-to-dubai',
  '/mumbai-to-new-york',
  '/los-angeles-to-new-york',
  '/sydney-to-london',
  '/singapore-to-london',
  '/toronto-to-new-york',
  '/dubai-to-london',
  '/delhi-to-new-york',
  '/london-to-sydney',
  '/chicago-to-new-york',
  '/san-francisco-to-new-york',
  '/london-to-paris',
  '/paris-to-london',
  '/bangalore-to-new-york',
  '/hong-kong-to-london',
  '/new-york-to-tokyo',
  '/london-to-hong-kong',
  '/mumbai-to-london',
  '/sydney-to-new-york',
  '/new-york-to-singapore',
  '/manila-to-new-york',
  '/toronto-to-london',
  '/chicago-to-london',
  '/london-to-singapore',
  '/melbourne-to-london',
  '/london-to-los-angeles',
  '/new-york-to-dubai',
  '/vancouver-to-london',
  '/delhi-to-london',
  '/brisbane-to-london',
  '/new-york-to-hong-kong',
  '/london-to-mumbai',
  '/dallas-to-london',
  '/london-to-bangalore',
  '/perth-to-london',
  '/new-york-to-paris',
  '/san-francisco-to-london',
  '/dubai-to-mumbai',
  '/atlanta-to-london',
  '/delhi-to-dubai',
  '/boston-to-london',
  '/london-to-tokyo',
  '/new-york-to-berlin',
  '/seattle-to-new-york',
  '/houston-to-new-york',
  '/london-to-bangkok',
];

// ─── Route parsing ────────────────────────────────────────────────────────────

const TIMEZONE_CODES = new Set([
  'ist','est','edt','pst','pdt','cst','cdt','mst','mdt',
  'gmt','bst','cet','cest','jst','aest','aedt','sgt',
  'gst','msk','hkt','wet','brt','pht','eet','kst',
  'nzdt','nzst','ast'
]);

interface ParsedConversionRoute {
  fromSlug: string;
  toSlug: string;
  fromName: string;
  toName: string;
}

const titleCase = (slug: string): string =>
  slug.split('-').filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

const parseConversionRoute = (route: string): ParsedConversionRoute | null => {
  const match = route.match(/^\/([a-z0-9-]+)-to-([a-z0-9-]+)$/i);
  if (!match) return null;
  const fromSlug = match[1].toLowerCase();
  const toSlug   = match[2].toLowerCase();
  return {
    fromSlug,
    toSlug,
    fromName: TIMEZONE_CODES.has(fromSlug) ? fromSlug.toUpperCase() : titleCase(fromSlug),
    toName:   TIMEZONE_CODES.has(toSlug)   ? toSlug.toUpperCase()   : titleCase(toSlug),
  };
};

// ─── SEO ──────────────────────────────────────────────────────────────────────

const staticSeo: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Timezone Converter – Convert Time Between Any Two Cities | WorldTimeSuite',
    description: 'Free timezone converter for 500+ cities worldwide. Instantly see the time difference between any two cities, find meeting-friendly hours, and plan across time zones.',
  },
  '/stopwatch': {
    title: 'Online Stopwatch with Lap Timer – Free & Instant | WorldTimeSuite',
    description: 'Free online stopwatch with lap tracking. Start, stop and record laps instantly — no download needed. Works on desktop and mobile.',
  },
  '/timer': {
    title: 'Online Countdown Timer – Free, Fast & No Sign-up | WorldTimeSuite',
    description: 'Set a free online countdown timer in seconds. Simple, distraction-free timer that works instantly on any device — no app or account needed.',
  },
  '/calendar': {
    title: 'Time Zone Calendar – Plan Meetings Across Time Zones | WorldTimeSuite',
    description: 'Plan and schedule across time zones with our timezone-aware calendar. See overlapping hours between cities and avoid scheduling mistakes.',
  },
};

// ─── HTML helpers ─────────────────────────────────────────────────────────────

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const buildBody = (route: string, parsed: ParsedConversionRoute | null): string => {
  if (parsed) {
    const { fromName, toName } = parsed;
    return `
    <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
      <div style="max-width:1100px;margin:0 auto;">
        <div style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;">
          ${esc(fromName)} To ${esc(toName)} Time Converter
        </div>
        <p style="margin-top:24px;font-size:20px;line-height:1.6;color:#a1a1aa;max-width:900px;">
          Convert time from ${esc(fromName)} to ${esc(toName)} instantly. Check the live time difference and compare local time before scheduling meetings.
        </p>
        <div style="margin-top:40px;padding:32px;border:1px solid #27272a;border-radius:32px;background:#09090b;">
          <div style="font-size:12px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#71717a;margin-bottom:16px;">Live Route</div>
          <div style="font-size:42px;font-weight:800;letter-spacing:-0.03em;text-transform:uppercase;">${esc(fromName)} → ${esc(toName)}</div>
          <div style="margin-top:24px;">
            <a href="${route}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">Open Converter</a>
          </div>
        </div>
      </div>
    </div>`;
  }
  return `
    <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
      <div style="max-width:1100px;margin:0 auto;">
        <div style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;">Timezone Converter</div>
        <p style="margin-top:24px;font-size:20px;line-height:1.6;color:#a1a1aa;max-width:900px;">Convert time between cities worldwide with WorldTimeSuite.</p>
        <div style="margin-top:24px;">
          <a href="/india-to-new-york" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">Explore Popular Route</a>
        </div>
      </div>
    </div>`;
};

const buildHtml = (template: string, route: string): string => {
  const parsed = parseConversionRoute(route);

  // SEO values
  let title: string;
  let description: string;
  let canonicalPath: string;

  if (parsed) {
    title        = `${parsed.fromName} to ${parsed.toName} Time Converter | Current Time & Difference`;
    description  = `What time is it in ${parsed.toName} when it is a given time in ${parsed.fromName}? Convert time between ${parsed.fromName} and ${parsed.toName} instantly. See the exact time difference and best hours to schedule meetings.`;
    canonicalPath = `/${parsed.fromSlug}-to-${parsed.toSlug}`;
  } else {
    const seo   = staticSeo[route] ?? staticSeo['/'];
    title        = seo.title;
    description  = seo.description;
    canonicalPath = route;
  }

  const canonicalUrl = `${ORIGIN}${canonicalPath}`;
  const body         = buildBody(route, parsed);

  // Apply all replacements to a fresh copy of the template
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/,                                    `<title>${esc(title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/,                `<meta name="description" content="${esc(description)}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/,               `<meta property="og:title" content="${esc(title)}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/,         `<meta property="og:description" content="${esc(description)}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/,                 `<meta property="og:url" content="${canonicalUrl}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/,              `<meta name="twitter:title" content="${esc(title)}">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/,        `<meta name="twitter:description" content="${esc(description)}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/,                      `<link rel="canonical" href="${canonicalUrl}">`);
  html = html.replace('<!--app-html-->',                                           body);

  return html;
};

// ─── Write helper ─────────────────────────────────────────────────────────────

const writeRoute = (route: string, html: string): void => {
  // KEY FIX: '/' writes to dist/index.html BUT we read the template
  // from a backup copy so dist/index.html is never used as source again.
  const filePath =
    route === '/'
      ? path.join(DIST_DIR, 'index.html')
      : path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`  ✓ ${route}`);
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = (): void => {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`dist/index.html not found. Run: npm run build:client first.`);
  }

  // Read the raw template
  const rawTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // CRITICAL GUARD: if <!--app-html--> is missing, the template is already
  // corrupted by a previous prerender run. Abort immediately with a clear message.
  if (!rawTemplate.includes('<!--app-html-->')) {
    console.error('\n❌ ERROR: dist/index.html is missing the <!--app-html--> placeholder.');
    console.error('   This means a previous prerender already overwrote it.');
    console.error('   Fix: run the following commands, then try again:\n');
    console.error('     rm -rf dist');
    console.error('     npm run build\n');
    process.exit(1);
  }

  // Save a backup of the clean template so future standalone runs of
  // build:prerender can always read a clean copy
  const backupPath = path.join(DIST_DIR, '_template.html');
  fs.writeFileSync(backupPath, rawTemplate, 'utf8');
  console.log(`\n  Template backed up to dist/_template.html`);

  const allRoutes = [...new Set([...STATIC_ROUTES, ...TIMEZONE_ROUTES, ...CITY_ROUTES])];

  // Sanity check
  const sample = parseConversionRoute('/delhi-to-london');
  console.log(`  Sanity check: parseConversionRoute('/delhi-to-london') =`, JSON.stringify(sample));

  const tzSample = parseConversionRoute('/ist-to-gmt');
  console.log(`  Sanity check: parseConversionRoute('/ist-to-gmt') =`, JSON.stringify(tzSample));
  console.log();
  console.log(`  Prerendering ${allRoutes.length} routes...\n`);

  for (const route of allRoutes) {
    const html = buildHtml(rawTemplate, route);  // always uses rawTemplate, never reads disk again
    writeRoute(route, html);
  }

  console.log(`\n✅ Done.`);
  console.log(`   Static:    ${STATIC_ROUTES.length}`);
  console.log(`   Timezone:  ${TIMEZONE_ROUTES.length}`);
  console.log(`   City:      ${CITY_ROUTES.length}`);
  console.log(`   Total:     ${allRoutes.length}`);
};

main();