import fs from 'node:fs';
import path from 'node:path';
import { cities } from '../data/cities'; // adjust if your cities file lives elsewhere

const BASE = 'https://worldtimesuite.com';
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

const CHUNK_SIZE = 5000;

type UrlEntry = {
  loc: string;
  changefreq: 'weekly' | 'monthly';
  priority: string;
};

const staticUrls: UrlEntry[] = [
  { loc: `${BASE}/`, changefreq: 'weekly', priority: '0.9' },
  { loc: `${BASE}/stopwatch`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${BASE}/timer`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${BASE}/calendar`, changefreq: 'weekly', priority: '0.8' }
];

const pairUrls: UrlEntry[] = [];

for (const from of cities) {
  for (const to of cities) {
    if (from.slug === to.slug) continue;

    pairUrls.push({
      loc: `${BASE}/${from.slug}-to-${to.slug}`,
      changefreq: 'monthly',
      priority: '0.8'
    });
  }
}

const allUrls = [...staticUrls, ...pairUrls];

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

  fs.writeFileSync(
    path.join(PUBLIC_DIR, fileName),
    toUrlset(chunk),
    'utf8'
  );

  sitemapFiles.push(fileName);
});

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles
  .map((file) => `  <sitemap>
    <loc>${BASE}/${file}</loc>
  </sitemap>`)
  .join('\n')}
</sitemapindex>`;

fs.writeFileSync(
  path.join(PUBLIC_DIR, 'sitemap.xml'),
  sitemapIndex,
  'utf8'
);

console.log(`Sitemap generated: ${allUrls.length} URLs across ${sitemapFiles.length} files`);