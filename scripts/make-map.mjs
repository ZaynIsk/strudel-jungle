#!/usr/bin/env node
// Builds strudel.json – the sample map Strudel reads – from the folders in samples/.
// Each subfolder becomes a sound: samples/blackbird/*.wav → s("blackbird:0"), s("blackbird:1") …
// Files are sorted by name, so the numbers stay the same everywhere.
//
//   node scripts/make-map.mjs      (or: npm run map)
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Where the samples live once the repo is on GitHub (user/repo/branch).
export const GITHUB = 'ZaynIsk/strudel-jungle/main';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO = /\.(wav|mp3|ogg|flac|m4a|aiff?)$/i;
const byName = (a, b) => a.localeCompare(b, 'en', { numeric: true });

export function buildMap(base = `https://raw.githubusercontent.com/${GITHUB}/`) {
  const map = { _base: base };
  const dir = join(ROOT, 'samples');
  for (const bank of readdirSync(dir).sort(byName)) {
    if (bank.startsWith('.') || !statSync(join(dir, bank)).isDirectory()) continue;
    const files = readdirSync(join(dir, bank)).filter((f) => AUDIO.test(f)).sort(byName);
    if (files.length) map[bank] = files.map((f) => `samples/${bank}/${f}`);
  }
  return map;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const map = buildMap();
  writeFileSync(join(ROOT, 'strudel.json'), JSON.stringify(map, null, 2) + '\n');
  for (const [k, v] of Object.entries(map)) if (k !== '_base') console.log(`${k.padEnd(12)} ${v.length} file(s)`);
  console.log('wrote strudel.json');
}
