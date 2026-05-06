/**
 * indexnow.ts
 *
 * Submits only NEW URLs to IndexNow (Bing, DuckDuckGo, Yahoo) after each deploy.
 * Tracks which URLs have already been submitted in submitted-urls.json so each
 * deploy only sends the delta — keeping submissions in Bing's fast queue.
 *
 * Behaviour:
 *   - First run (no tracking file): initialises submitted-urls.json with all
 *     currently eligible URLs and exits without submitting. Assumes everything
 *     already eligible has been submitted previously.
 *   - Subsequent runs: submits only URLs not yet in the tracking file.
 *   - Safety guard: if delta > MAX_SAFE_BATCH, refuses to submit and logs a
 *     warning — prevents accidental large batches if the tracking file is lost.
 *
 * Run via: npx tsx scripts/indexnow.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const KEY            = 'e621a87fb758415f9e129cfade0ae556';
const KEY_URL        = `https://worldtimesuite.com/${KEY}.txt`;
const HOST           = 'worldtimesuite.com';
const ENDPOINT       = 'https://api.indexnow.org/indexnow';
const MIN_PRIORITY   = 0.85;
const MAX_SAFE_BATCH = 50; // refuse to submit if delta exceeds this — something is wrong
const PUBLIC_DIR     = path.resolve(process.cwd(), 'public');
const TRACKING_FILE  = path.resolve(process.cwd(), 'submitted-urls.json');

// ─── Tracking file helpers ────────────────────────────────────────────────────

function loadSubmittedUrls(): Set<string> | null {
  if (!fs.existsSync(TRACKING_FILE)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
    if (!Array.isArray(data)) throw new Error('Expected array');
    return new Set<string>(data);
  } catch (err) {
    console.error(`⚠️  Could not parse ${TRACKING_FILE}: ${err}`);
    return null;
  }
}

function saveSubmittedUrls(submitted: Set<string>): void {
  const sorted = [...submitted].sort();
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
}

// ─── Sitemap reader ───────────────────────────────────────────────────────────

function extractUrls(): string[] {
  const urls: string[] = [];

  const sitemapFiles = fs
    .readdirSync(PUBLIC_DIR)
    .filter(f => f.match(/^sitemap-\d+\.xml$/))
    .sort();

  for (const file of sitemapFiles) {
    const content = fs.readFileSync(path.join(PUBLIC_DIR, file), 'utf8');
    const urlBlocks = content.match(/<url>[\s\S]*?<\/url>/g) ?? [];

    for (const block of urlBlocks) {
      const locMatch      = block.match(/<loc>(.*?)<\/loc>/);
      const priorityMatch = block.match(/<priority>(.*?)<\/priority>/);
      if (!locMatch || !priorityMatch) continue;

      const loc      = locMatch[1].trim();
      const priority = parseFloat(priorityMatch[1]);
      if (priority >= MIN_PRIORITY) urls.push(loc);
    }
  }

  return urls;
}

// ─── IndexNow submission ──────────────────────────────────────────────────────

async function submitToIndexNow(urls: string[]): Promise<boolean> {
  console.log(`\nSubmitting ${urls.length} URL(s) to IndexNow...`);
  urls.forEach(u => console.log(`  + ${u}`));

  const payload = { host: HOST, key: KEY, keyLocation: KEY_URL, urlList: urls };

  const response = await fetch(ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body:    JSON.stringify(payload),
  });

  console.log(`\nIndexNow response: ${response.status} ${response.statusText}`);

  if (response.status === 200 || response.status === 202) {
    console.log(`✅ Successfully submitted ${urls.length} URL(s) to IndexNow`);
    console.log('   Bing, DuckDuckGo, and Yahoo will crawl these pages shortly.');
    return true;
  } else {
    const body = await response.text().catch(() => '');
    console.error(`❌ IndexNow submission failed: ${response.status}`);
    if (body) console.error(`   Response: ${body}`);
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n=== IndexNow Submission (delta mode) ===');

const allEligible = extractUrls();
console.log(`URLs with priority >= ${MIN_PRIORITY}: ${allEligible.length}`);

const submitted = loadSubmittedUrls();

// ── First run: initialise the tracking file and exit ─────────────────────────
// Treat a missing file OR an empty file as "not yet initialised".
// An empty file is committed to the repo as a starting point — first deploy
// populates it with all currently eligible URLs (assumed already submitted).
const isUninitialized = submitted === null || submitted.size === 0;

if (isUninitialized) {
  console.log('\n⚙️  Tracking file is empty or missing — initialising submitted-urls.json');
  console.log('   Assuming all currently eligible URLs have already been submitted.');
  console.log('   Nothing will be submitted this run. Future runs will send only new URLs.');
  saveSubmittedUrls(new Set(allEligible));
  console.log(`   Saved ${allEligible.length} URLs to submitted-urls.json`);
  process.exit(0);
}

// ── Compute delta ─────────────────────────────────────────────────────────────
const newUrls = allEligible.filter(u => !submitted.has(u));
console.log(`Already submitted:  ${submitted.size}`);
console.log(`New URLs to submit: ${newUrls.length}`);

if (newUrls.length === 0) {
  console.log('\n✅ Nothing new to submit — all eligible URLs already indexed.');
  process.exit(0);
}

// ── Safety guard ──────────────────────────────────────────────────────────────
if (newUrls.length > MAX_SAFE_BATCH) {
  console.error(`\n🚫 Safety guard triggered: ${newUrls.length} new URLs exceeds MAX_SAFE_BATCH (${MAX_SAFE_BATCH}).`);
  console.error('   This likely means submitted-urls.json was deleted or corrupted.');
  console.error('   Restore the file from git history and re-deploy, or review and raise MAX_SAFE_BATCH intentionally.');
  console.error('   No URLs were submitted.');
  process.exit(1);
}

// ── Submit and update tracking file ──────────────────────────────────────────
const success = await submitToIndexNow(newUrls);

if (success) {
  newUrls.forEach(u => submitted.add(u));
  saveSubmittedUrls(submitted);
  console.log(`\n📝 submitted-urls.json updated (${submitted.size} total URLs tracked).`);
} else {
  console.error('\n⚠️  Tracking file NOT updated — URLs will be retried on next deploy.');
  process.exit(1);
}
