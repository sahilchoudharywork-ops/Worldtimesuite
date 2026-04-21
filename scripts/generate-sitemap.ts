// import fs from 'node:fs';
// import path from 'node:path';
// import { cities } from '../data/cities';
// import { TIMEZONE_PAIR_ROUTES } from '../data/timezones';

// const BASE = 'https://worldtimesuite.com';
// const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

// const CHUNK_SIZE = 5000;

// type UrlEntry = {
//   loc: string;
//   changefreq: 'weekly' | 'monthly';
//   priority: string;
// };

// // Static tool pages
// const staticUrls: UrlEntry[] = [
//   { loc: `${BASE}/`,           changefreq: 'weekly', priority: '1.0' },
//   { loc: `${BASE}/stopwatch`,  changefreq: 'weekly', priority: '0.8' },
//   { loc: `${BASE}/timer`,      changefreq: 'weekly', priority: '0.8' },
//   { loc: `${BASE}/calendar`,   changefreq: 'weekly', priority: '0.8' }
// ];

// // Timezone code pair URLs e.g. /est-to-ist — highest priority, these are SEO targets
// const timezoneUrls: UrlEntry[] = TIMEZONE_PAIR_ROUTES.map(route => ({
//   loc: `${BASE}${route}`,
//   changefreq: 'monthly' as const,
//   priority: '0.9'
// }));

// // City pair URLs e.g. /london-to-new-york
// const pairUrls: UrlEntry[] = [];
// for (const from of cities) {
//   for (const to of cities) {
//     if (from.slug === to.slug) continue;
//     pairUrls.push({
//       loc: `${BASE}/${from.slug}-to-${to.slug}`,
//       changefreq: 'monthly',
//       priority: '0.8'
//     });
//   }
// }

// // Order: static → timezone codes → city pairs
// const allUrls = [...staticUrls, ...timezoneUrls, ...pairUrls];

// const toUrlset = (urls: UrlEntry[]) => `<?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
// ${urls
//   .map(
//     (u) => `  <url>
//     <loc>${u.loc}</loc>
//     <changefreq>${u.changefreq}</changefreq>
//     <priority>${u.priority}</priority>
//   </url>`
//   )
//   .join('\n')}
// </urlset>`;

// const chunks: UrlEntry[][] = [];
// for (let i = 0; i < allUrls.length; i += CHUNK_SIZE) {
//   chunks.push(allUrls.slice(i, i + CHUNK_SIZE));
// }

// if (!fs.existsSync(PUBLIC_DIR)) {
//   fs.mkdirSync(PUBLIC_DIR, { recursive: true });
// }

// const sitemapFiles: string[] = [];

// chunks.forEach((chunk, idx) => {
//   const fileName = `sitemap-${idx + 1}.xml`;

//   fs.writeFileSync(
//     path.join(PUBLIC_DIR, fileName),
//     toUrlset(chunk),
//     'utf8'
//   );

//   sitemapFiles.push(fileName);
//   console.log(`Wrote ${fileName} (${chunk.length} URLs)`);
// });

// const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
// <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
// ${sitemapFiles
//   .map((file) => `  <sitemap>
//     <loc>${BASE}/${file}</loc>
//   </sitemap>`)
//   .join('\n')}
// </sitemapindex>`;

// fs.writeFileSync(
//   path.join(PUBLIC_DIR, 'sitemap.xml'),
//   sitemapIndex,
//   'utf8'
// );

// console.log(`\nSitemap generated:`);
// console.log(`  Static pages:   ${staticUrls.length}`);
// console.log(`  Timezone pages: ${timezoneUrls.length}`);
// console.log(`  City pair pages:${pairUrls.length}`);
// console.log(`  Total:          ${allUrls.length} URLs across ${sitemapFiles.length} sitemap files`);



import fs from 'node:fs';
import path from 'node:path';
import { cities } from '../data/cities';

const BASE = 'https://worldtimesuite.com';
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const CHUNK_SIZE = 5000;

type UrlEntry = {
  loc: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
};

// ─── Static tool pages ────────────────────────────────────────────────────────
const staticUrls: UrlEntry[] = [
  { loc: `${BASE}`,              changefreq: 'weekly',  priority: '1.0' },
  { loc: `${BASE}/stopwatch`,    changefreq: 'weekly',  priority: '0.8' },
  { loc: `${BASE}/timer`,        changefreq: 'weekly',  priority: '0.8' },
  { loc: `${BASE}/calendar`,     changefreq: 'weekly',  priority: '0.8' },
  { loc: `${BASE}/world-clock`,  changefreq: 'daily',   priority: '0.9' },
  { loc: `${BASE}/about`,        changefreq: 'monthly', priority: '0.6' },
  { loc: `${BASE}/terms`,        changefreq: 'monthly', priority: '0.4' },
  { loc: `${BASE}/privacy`,      changefreq: 'monthly', priority: '0.4' },
];

// ─── Timezone-to-timezone routes ─────────────────────────────────────────────
// Top 48 searched timezone pairs + logical reverses and extras
// Priority 0.9 — these are high-intent SEO targets
const TIMEZONE_PAIR_ROUTES: string[] = [
  '/ist-to-gmt',
  '/gmt-to-ist',
  '/ist-to-est',
  '/est-to-ist',
  '/ist-to-pst',
  '/pst-to-ist',
  '/ist-to-cst',
  '/cst-to-ist',
  '/ist-to-cet',
  '/cet-to-ist',
  '/ist-to-aest',
  '/aest-to-ist',
  '/ist-to-jst',
  '/jst-to-ist',
  '/ist-to-sgt',
  '/sgt-to-ist',
  '/ist-to-gst',
  '/gst-to-ist',
  '/ist-to-hkt',
  '/hkt-to-ist',
  '/est-to-gmt',
  '/gmt-to-est',
  '/est-to-cet',
  '/cet-to-est',
  '/est-to-aest',
  '/aest-to-est',
  '/est-to-sgt',
  '/sgt-to-est',
  '/est-to-jst',
  '/jst-to-est',
  '/est-to-hkt',
  '/hkt-to-est',
  '/pst-to-est',
  '/est-to-pst',
  '/pst-to-gmt',
  '/gmt-to-pst',
  '/pst-to-cst',
  '/cst-to-pst',
  '/pst-to-cet',
  '/cet-to-pst',
  '/cst-to-gmt',
  '/gmt-to-cst',
  '/cst-to-est',
  '/est-to-cst',
  '/cet-to-gmt',
  '/gmt-to-cet',
  '/aest-to-gmt',
  '/gmt-to-aest',
  '/aest-to-pst',
  '/pst-to-aest',
  '/jst-to-gmt',
  '/gmt-to-jst',
  '/sgt-to-gmt',
  '/gmt-to-sgt',
  '/gst-to-gmt',
  '/gmt-to-gst',
  '/hkt-to-gmt',
  '/gmt-to-hkt',
  '/brt-to-est',
  '/est-to-brt',
  '/brt-to-gmt',
  '/gmt-to-brt',
  '/mst-to-gmt',
  '/gmt-to-mst',
  '/mst-to-est',
  '/est-to-mst',
  '/wet-to-gmt',
  '/gmt-to-wet',
  '/eet-to-gmt',
  '/gmt-to-eet',
  '/kst-to-est',
  '/est-to-kst',
  '/gmt-to-kst',
  '/kst-to-gmt',
  '/pht-to-est',
  '/est-to-pht',
  '/pht-to-gmt',
  '/gmt-to-pht',
  '/nzdt-to-est',
  '/est-to-nzdt',
  '/nzdt-to-gmt',
  '/gmt-to-nzdt',
  '/ast-to-est',
  '/est-to-ast',
  '/gmt-to-msk',
  '/msk-to-gmt',
  '/cest-to-gmt',
  '/gmt-to-cest',
];

const timezoneUrls: UrlEntry[] = TIMEZONE_PAIR_ROUTES.map(route => ({
  loc: `${BASE}${route}`,
  changefreq: 'monthly',
  priority: '0.9',
}));

// ─── City clock pages — /time-in-[slug] ──────────────────────────────────────
const cityClockUrls: UrlEntry[] = cities.map(c => ({
  loc: `${BASE}/time-in-${c.slug}`,
  changefreq: 'daily' as const,
  priority: '0.85',
}));

// ─── City-to-city routes ──────────────────────────────────────────────────────
// All permutations of cities array, excluding same-timezone pairs.
// Same-timezone pairs (e.g. london-to-manchester, delhi-to-mumbai) show a 0h
// difference and are treated as thin/duplicate content by Google — omitting
// them keeps the sitemap clean and preserves crawl budget.
const pairUrls: UrlEntry[] = [];
for (const from of cities) {
  for (const to of cities) {
    if (from.slug === to.slug) continue;
    if (from.tz === to.tz) continue; // skip same-timezone pairs (thin content)
    pairUrls.push({
      loc: `${BASE}/${from.slug}-to-${to.slug}`,
      changefreq: 'monthly',
      priority: '0.8',
    });
  }
}

// ─── Combine: static → timezone → city clocks → city pairs ───────────────────
const allUrls = [...staticUrls, ...timezoneUrls, ...cityClockUrls, ...pairUrls];

// ─── Write sitemap files ──────────────────────────────────────────────────────
const toUrlset = (urls: UrlEntry[]) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

const chunks: UrlEntry[][] = [];
for (let i = 0; i < allUrls.length; i += CHUNK_SIZE) {
  chunks.push(allUrls.slice(i, i + CHUNK_SIZE));
}

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

const sitemapFiles: string[] = [];
chunks.forEach((chunk, idx) => {
  const fileName = `sitemap-${idx + 1}.xml`;
  fs.writeFileSync(path.join(PUBLIC_DIR, fileName), toUrlset(chunk), 'utf8');
  sitemapFiles.push(fileName);
  console.log(`Wrote ${fileName} (${chunk.length} URLs)`);
});

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles
  .map((file) => `  <sitemap>\n    <loc>${BASE}/${file}</loc>\n  </sitemap>`)
  .join('\n')}
</sitemapindex>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapIndex, 'utf8');

console.log(`\nSitemap generated:`);
console.log(`  Static pages:    ${staticUrls.length}`);
console.log(`  Timezone routes: ${timezoneUrls.length}`);
console.log(`  City clock pages:${cityClockUrls.length}`);
console.log(`  City pair pages: ${pairUrls.length}`);
console.log(`  Total:           ${allUrls.length} URLs across ${sitemapFiles.length} sitemap files`);