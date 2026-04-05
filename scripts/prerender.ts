import fs from 'fs';
import path from 'path';
import { getRouteState } from '../lib/routing';
import { getSeoData } from '../lib/seo';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
const ORIGIN = 'https://worldtimesuite.com';

const routes = [  
  '/',
  '/timer',
  '/stopwatch',
  '/calendar',
  '/london-to-san-francisco',
  '/new-york-to-london',
  '/london-to-vancouver',
  '/los-angeles-to-sydney',
  '/sydney-to-new-york',
  '/london-to-melbourne',
  '/london-to-sydney',
  '/sydney-to-perth',
  '/melbourne-to-perth',
  '/sydney-to-london',
  '/india-to-london',
  '/new-york-to-singapore',
  '/melbourne-to-london',
  '/seattle-to-boston',
  '/adelaide-to-los-angeles',
  '/melbourne-to-sydney',
  '/sydney-to-brisbane',
  '/brisbane-to-sydney',
  '/sydney-to-melbourne',
  '/washington-dc-to-vienna',
  '/houston-to-las-vegas',
  '/perth-to-melbourne',
  '/new-york-to-sydney',
  '/bangalore-to-san-diego',
  '/perth-to-sydney',
  '/lisbon-to-rio-de-janeiro',
  '/boston-to-warsaw',
  '/new-york-to-dubai',
  '/perth-to-adelaide',
  '/melbourne-to-brisbane',
  '/montreal-to-vancouver',
  '/cairo-to-washington-dc',
  '/seattle-to-copenhagen',
  '/mumbai-to-san-francisco',
  '/las-vegas-to-honolulu',
  '/dubai-to-new-york',
  '/san-francisco-to-melbourne',
  '/perth-to-dallas',
  '/hyderabad-to-mumbai',
  '/wellington-to-mumbai',
  '/bangalore-to-melbourne',
  '/melbourne-to-singapore',
  '/sydney-to-adelaide',
  '/singapore-to-new-york',
  '/athens-to-perth',
  '/san-francisco-to-sydney',
  '/miami-to-tokyo'
];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const titleCase = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getStaticBody = (route: string) => {
  const routeState = getRouteState(route);

  if (routeState.cityRoute) {
    const fromName = titleCase(routeState.cityRoute.fromSlug);
    const toName = titleCase(routeState.cityRoute.toSlug);

    return `
      <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
        <div style="max-width:1100px;margin:0 auto;">
          <div style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;">
            ${escapeHtml(fromName)} To ${escapeHtml(toName)} Time Converter
          </div>
          <p style="margin-top:24px;font-size:20px;line-height:1.6;color:#a1a1aa;max-width:900px;">
            Convert time from ${escapeHtml(fromName)} to ${escapeHtml(toName)} instantly. Check the live time difference and compare local time before scheduling meetings.
          </p>
          <div style="margin-top:40px;padding:32px;border:1px solid #27272a;border-radius:32px;background:#09090b;">
            <div style="font-size:12px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#71717a;margin-bottom:16px;">
              Live Route
            </div>
            <div style="font-size:42px;font-weight:800;letter-spacing:-0.03em;text-transform:uppercase;">
              ${escapeHtml(fromName)} → ${escapeHtml(toName)}
            </div>
            <div style="margin-top:24px;">
              <a href="${route}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">
                Open Converter
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div style="min-height:100vh;background:#000;color:#fff;font-family:Helvetica,Arial,sans-serif;padding:40px 24px;">
      <div style="max-width:1100px;margin:0 auto;">
        <div style="font-size:72px;font-weight:900;letter-spacing:-0.04em;line-height:0.95;text-transform:uppercase;">
          Timezone Converter
        </div>
        <p style="margin-top:24px;font-size:20px;line-height:1.6;color:#a1a1aa;max-width:900px;">
          Convert time between cities worldwide with WorldTimeSuite.
        </p>
        <div style="margin-top:24px;">
          <a href="/india-to-new-york" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:0.24em;text-transform:uppercase;">
            Explore Popular Route
          </a>
        </div>
      </div>
    </div>
  `;
};

const injectHtml = (template: string, route: string) => {
  const seo = getSeoData(getRouteState(route));
  const canonicalUrl = `${ORIGIN}${seo.canonicalPath}`;
  const bodyHtml = getStaticBody(route);

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(seo.title)}</title>`)
    .replace(
      /<meta name="description" content="[\s\S]*?">/,
      `<meta name="description" content="${escapeHtml(seo.description)}">`
    )
    .replace(
      /<meta property="og:title" content="[\s\S]*?">/,
      `<meta property="og:title" content="${escapeHtml(seo.title)}">`
    )
    .replace(
      /<meta property="og:description" content="[\s\S]*?">/,
      `<meta property="og:description" content="${escapeHtml(seo.description)}">`
    )
    .replace(
      /<meta property="og:url" content="[\s\S]*?">/,
      `<meta property="og:url" content="${canonicalUrl}">`
    )
    .replace(
      /<meta name="twitter:title" content="[\s\S]*?">/,
      `<meta name="twitter:title" content="${escapeHtml(seo.title)}">`
    )
    .replace(
      /<meta name="twitter:description" content="[\s\S]*?">/,
      `<meta name="twitter:description" content="${escapeHtml(seo.description)}">`
    )
    .replace(
      /<link rel="canonical" href="[\s\S]*?">/,
      `<link rel="canonical" href="${canonicalUrl}">`
    )
    .replace('<!--app-html-->', bodyHtml);
};

const writeRoute = (route: string, html: string) => {
  const filePath =
    route === '/'
      ? path.join(DIST_DIR, 'index.html')
      : path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Wrote ${filePath}`);
};

const main = () => {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Missing build template at ${TEMPLATE_PATH}`);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  for (const route of routes) {
    const html = injectHtml(template, route);
    writeRoute(route, html);
  }

  console.log(`Prerendered ${routes.length} routes.`);
};

main();
