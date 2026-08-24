import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputPath = path.join(repoRoot, 'src/pages/mtg/commanders-data.ts');
const SEARCH_URL = 'https://api.scryfall.com/cards/search?q=is%3Acommander&order=name&unique=cards';
const MIN_REQUEST_GAP_MS = 350;
const MAX_ATTEMPTS = 2;
const REQUEST_HEADERS = {
  'User-Agent': 'Flow.Fail Commander Tracker App Data Bot/1.0',
  Accept: 'application/json',
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJsonWithRetry(url) {
  let attempt = 0;
  while (attempt < MAX_ATTEMPTS) {
    const response = await fetch(url, { headers: REQUEST_HEADERS });
    if (response.ok) return response.json();

    if (response.status === 429) {
      if (attempt + 1 >= MAX_ATTEMPTS) {
        throw new Error('Scryfall rate-limited this run (429). Keeping existing commanders-data.ts unchanged.');
      }
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : 60;
      const retryDelayMs = (Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : 60) * 1000 + MIN_REQUEST_GAP_MS;
      await delay(retryDelayMs);
      attempt += 1;
      continue;
    }

    const body = await response.text();
    throw new Error(`Scryfall request failed (${response.status}): ${body.slice(0, 300)}`);
  }

  throw new Error(`Scryfall request failed after ${MAX_ATTEMPTS} attempt(s).`);
}

async function fetchAllCommanders() {
  /** @type {{name: string; artCrop: string}[]} */
  const commanders = [];
  /** @type {Set<string>} */
  const seen = new Set();
  let nextUrl = SEARCH_URL;

  while (nextUrl) {
    const payload = await fetchJsonWithRetry(nextUrl);
    const cards = Array.isArray(payload?.data) ? payload.data : [];

    for (const card of cards) {
      const name = typeof card?.name === 'string' ? card.name.trim() : '';
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const artCrop = card?.image_uris?.art_crop
        ?? card?.card_faces?.[0]?.image_uris?.art_crop
        ?? '';

      commanders.push({ name, artCrop });
    }

    nextUrl = payload?.has_more ? payload?.next_page ?? '' : '';
    if (nextUrl) await delay(MIN_REQUEST_GAP_MS);
  }

  commanders.sort((a, b) => a.name.localeCompare(b.name));
  return commanders;
}

function buildFileContent(commanders) {
  return `import type { CommanderEntry } from './types';

const commandersData: CommanderEntry[] = ${JSON.stringify(commanders, null, 2)};

export default commandersData;
`;
}

async function main() {
  const commanders = await fetchAllCommanders();
  const content = buildFileContent(commanders);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content, 'utf8');
  console.log(`Updated ${outputPath} with ${commanders.length} commanders.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
