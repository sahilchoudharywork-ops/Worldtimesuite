/**
 * indexnow.ts
 *
 * Submits high-priority URLs to IndexNow (Bing, DuckDuckGo, Yahoo) after every deploy.
 * Reads directly from the generated sitemap XMLs so it always stays in sync
 * with whatever pages exist — no manual URL lists to maintain.
 *
 * Submits URLs with priority >= 0.85:
 *   - Static pages      (priority 1.0 / 0.9 / 0.8)
 *   - Timezone pairs    (priority 0.9)
 *   - City clock pages  (priority 0.85)
 *
 * Run via: npx tsx scripts/indexnow.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const KEY       = 'e621a87fb758415f9e129cfade0ae556';
const KEY_URL   = `https://worldtimesuite.com/${KEY}.txt`;
const HOST      = 'worldtimesuite.com';
const ENDPOINT  = 'https://api.indexnow.org/indexnow';
const MIN_PRIORITY = 0.85; // only submit pages at or above this priority
const PUBLIC_DIR   = path.resolve(process.cwd(), 'public');

// ─── Read all sitemap-*.xml files and extract URLs above MIN_PRIORITY ─────────
function extractUrls(): string[] {
  const urls: string[] = [];

  const sitemapFiles = fs
    .readdirSync(PUBLIC_DIR)
    .filter(f => f.match(/^sitemap-\d+\.xml$/))
    .sort();

  for (const file of sitemapFiles) {
    const content = fs.readFileSync(path.join(PUBLIC_DIR, file), 'utf8');

    // Parse each <url> block
    const urlBlocks = content.match(/<url>[\s\S]*?<\/url>/g) ?? [];

    for (const block of urlBlocks) {
      const locMatch      = block.match(/<loc>(.*?)<\/loc>/);
      const priorityMatch = block.match(/<priority>(.*?)<\/priority>/);

      if (!locMatch || !priorityMatch) continue;

      const loc      = locMatch[1].trim();
      const priority = parseFloat(priorityMatch[1]);

      if (priority >= MIN_PRIORITY) {
        urls.push(loc);
      }
    }
  }

  return urls;
}

// ─── Submit to IndexNow ────────────────────────────────────────────────────────
async function submitToIndexNow(urls: string[]): Promise<void> {
  if (urls.length === 0) {
    console.log('No URLs to submit.');
    return;
  }

  console.log(`\nSubmitting ${urls.length} URLs to IndexNow...`);

  const payload = {
    host:        HOST,
    key:         KEY,
    keyLocation: KEY_URL,
    urlList:     urls,
  };

  const response = await fetch(ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body:    JSON.stringify(payload),
  });

  console.log(`\nIndexNow response: ${response.status} ${response.statusText}`);

  if (response.status === 200 || response.status === 202) {
    console.log('✅ Successfully submitted to IndexNow');
    console.log(`   Bing, DuckDuckGo, and Yahoo will crawl these ${urls.length} pages shortly.`);
  } else {
    const body = await response.text().catch(() => '');
    console.error(`❌ IndexNow submission failed: ${response.status}`);
    if (body) console.error(`   Response: ${body}`);
    process.exit(1); // fail the GitHub Actions step so you notice
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const urls = extractUrls();

console.log('\n=== IndexNow Submission ===');
console.log(`Sitemap files scanned: ${fs.readdirSync(PUBLIC_DIR).filter(f => f.match(/^sitemap-\d+\.xml$/)).length}`);
console.log(`URLs with priority >= ${MIN_PRIORITY}: ${urls.length}`);

await submitToIndexNow(urls);
