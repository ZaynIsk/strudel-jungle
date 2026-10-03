#!/usr/bin/env node
// Tiny local sample server for strudel.cc – no packages needed, just Node.
// Serves this folder on http://localhost:5544 with CORS, and builds the sample
// map fresh on every request, so a new file in samples/vocals/ shows up as soon
// as you re-evaluate in Strudel. Also keeps strudel.json up to date for GitHub.
//
//   npm run dev        then in strudel.cc:  samples('http://localhost:5544/strudel.json')
import http from 'node:http';
import { createReadStream, existsSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { ROOT, buildMap } from './make-map.mjs';

// 5544, not Strudel's usual 5432 – that port is PostgreSQL's default and is often taken.
const PORT = Number(process.env.PORT) || 5544;
const TYPES = { '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.flac': 'audio/flac',
  '.m4a': 'audio/mp4', '.aif': 'audio/aiff', '.aiff': 'audio/aiff', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/' || path === '/strudel.json') {
    const map = buildMap();
    writeFileSync(join(ROOT, 'strudel.json'), JSON.stringify(map, null, 2) + '\n'); // GitHub copy
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ...map, _base: `http://localhost:${PORT}/` }));
  }
  const file = normalize(join(ROOT, path));
  if (!file.startsWith(join(ROOT, 'samples')) || !existsSync(file) || !statSync(file).isFile()) {
    res.statusCode = 404;
    return res.end('not found');
  }
  res.setHeader('Content-Type', TYPES[extname(file).toLowerCase()] || 'application/octet-stream');
  createReadStream(file).pipe(res);
});

server.on('error', (err) => {
  if (err.code !== 'EADDRINUSE') throw err;
  console.error(`\n  Port ${PORT} is already in use – the server may already be running in another window.`);
  console.error(`  Use another port with:  PORT=5545 npm run dev   (and change the port in track.js to match)\n`);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`\n  strudel-jungle samples → http://localhost:${PORT}/strudel.json`);
  for (const [k, v] of Object.entries(buildMap())) if (k !== '_base') console.log(`    ${k.padEnd(12)} ${v.length} file(s)`);
  console.log('\n  Leave this running while you play in strudel.cc. Ctrl+C to stop.\n');
});
