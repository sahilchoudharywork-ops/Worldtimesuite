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
    title: 'Time Zone Converter – Convert Time Between Any Two Cities',
    description: 'Free time zone converter for 500+ cities worldwide. Instantly see the time difference between any two cities, find meeting-friendly hours, and plan across time zones.',
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

// ─── CHANGED: Route-specific static body copy ─────────────────────────────────
// Previously all static pages (/, /timer, /stopwatch, /calendar) shared one
// generic body that said "Time Zone Converter / Convert time between cities
// worldwide with WorldTimeSuite / Explore Popular Route".
//
// This was wrong because:
//   - /timer prerendered as "Time Zone Converter" — not "Online Countdown Timer"
//   - /stopwatch prerendered as "Time Zone Converter" — not "Online Stopwatch"
//   - /calendar prerendered as "Time Zone Converter" — not "Time Zone Calendar"
//
// Google reads the prerendered HTML before React loads. So it was seeing the
// wrong content for these pages. Now each page gets its own correct body.

interface StaticCopy {
  heading: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}

const getStaticCopy = (route: string): StaticCopy => {
  switch (route) {
    case '/timer':
      return {
        heading: 'Online Countdown Timer',
        description: 'Set a free online countdown timer in seconds. Fast, distraction-free, works instantly on any device — no sign-up needed.',
        ctaHref: '/timer',
        ctaLabel: 'Open Timer',
      };
    case '/stopwatch':
      return {
        heading: 'Online Stopwatch',
        description: 'Free online stopwatch with lap tracking. Start, stop and record laps instantly on desktop and mobile — no download needed.',
        ctaHref: '/stopwatch',
        ctaLabel: 'Open Stopwatch',
      };
    case '/calendar':
      return {
        heading: 'Time Zone Calendar',
        description: 'Plan meetings and tasks across time zones. Compare overlapping hours between cities and avoid scheduling mistakes.',
        ctaHref: '/calendar',
        ctaLabel: 'Open Calendar',
      };
    default:
      // Homepage (/) and any unrecognised static route
      return {
        heading: 'Time Zone Converter',
        description: 'Convert time between 500+ cities worldwide. See the exact time difference and find the best hours to meet across time zones.',
        ctaHref: '/london-to-new-york',
        ctaLabel: 'Explore Popular Route',
      };
  }
};

const buildBody = (route: string, parsed: ParsedConversionRoute | null): string => {
  if (parsed) {
    // Conversion route: /london-to-new-york or /ist-to-gmt — unchanged
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

  // CHANGED: was one hardcoded generic block for all static pages.
  // Now uses getStaticCopy() to return page-specific content.
  const copy = getStaticCopy(route);
  return `
    <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
      <div style="max-width:1100px;margin:0 auto;">
        <div style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;">
          ${esc(copy.heading)}
        </div>
        <p style="margin-top:24px;font-size:20px;line-height:1.6;color:#a1a1aa;max-width:900px;">
          ${esc(copy.description)}
        </p>
        <div style="margin-top:24px;">
          <a href="${esc(copy.ctaHref)}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">
            ${esc(copy.ctaLabel)}
          </a>
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

  const rawTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  if (!rawTemplate.includes('<!--app-html-->')) {
    console.error('\n❌ ERROR: dist/index.html is missing the <!--app-html--> placeholder.');
    console.error('   This means a previous prerender already overwrote it.');
    console.error('   Fix: run the following commands, then try again:\n');
    console.error('     rm -rf dist');
    console.error('     npm run build\n');
    process.exit(1);
  }

  const backupPath = path.join(DIST_DIR, '_template.html');
  fs.writeFileSync(backupPath, rawTemplate, 'utf8');
  console.log(`\n  Template backed up to dist/_template.html`);

  const allRoutes = [...new Set([...STATIC_ROUTES, ...TIMEZONE_ROUTES, ...CITY_ROUTES])];

  const sample = parseConversionRoute('/delhi-to-london');
  console.log(`  Sanity check: parseConversionRoute('/delhi-to-london') =`, JSON.stringify(sample));

  const tzSample = parseConversionRoute('/ist-to-gmt');
  console.log(`  Sanity check: parseConversionRoute('/ist-to-gmt') =`, JSON.stringify(tzSample));
  console.log();
  console.log(`  Prerendering ${allRoutes.length} routes...\n`);

  for (const route of allRoutes) {
    const html = buildHtml(rawTemplate, route);
    writeRoute(route, html);
  }

  console.log(`\n✅ Done.`);
  console.log(`   Static:    ${STATIC_ROUTES.length}`);
  console.log(`   Timezone:  ${TIMEZONE_ROUTES.length}`);
  console.log(`   City:      ${CITY_ROUTES.length}`);
  console.log(`   Total:     ${allRoutes.length}`);
};

main();