/**
 * Deploy dist/ as a NIP-5A "nsite" (kind 15128 manifest + Blossom blobs),
 * served live by public gateways such as nsite.lol and nsite.run.
 *
 * Reuses the keypair/relay config that `nostr-deploy-cli` writes to
 * .env.nostr-deploy.local (auto-generates one if missing).
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, appendFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { finalizeEvent, generateSecretKey, getPublicKey, SimplePool } from 'nostr-tools';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { nip19 } from 'nostr-tools';

const DIST = new URL('../dist', import.meta.url).pathname;
const ENV_FILE = new URL('../.env.nostr-deploy.local', import.meta.url).pathname;

function loadEnv() {
  const env = {};
  if (existsSync(ENV_FILE)) {
    for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim();
    }
  }
  // Environment variables (e.g. CI secrets) take precedence over the local file.
  for (const key of ['NOSTR_PRIVATE_KEY', 'NOSTR_PUBLIC_KEY', 'NOSTR_RELAYS', 'BLOSSOM_SERVERS']) {
    if (process.env[key]) env[key] = process.env[key];
  }
  if (!env.NOSTR_PRIVATE_KEY) {
    if (process.env.CI) {
      console.error('NOSTR_PRIVATE_KEY is not set; refusing to deploy with a throwaway keypair in CI.');
      process.exit(1);
    }
    const sk = generateSecretKey();
    env.NOSTR_PRIVATE_KEY = bytesToHex(sk);
    env.NOSTR_PUBLIC_KEY = getPublicKey(sk);
    const saved = [
      '# Nostr Deploy CLI Configuration',
      '# This file contains sensitive information - do not commit to version control',
      '',
      '# Nostr Authentication',
      `NOSTR_PRIVATE_KEY=${env.NOSTR_PRIVATE_KEY}`,
      `NOSTR_PUBLIC_KEY=${env.NOSTR_PUBLIC_KEY}`,
      `NOSTR_RELAYS=${env.NOSTR_RELAYS ?? 'wss://nostrue.com,wss://purplerelay.com,wss://relay.primal.net,wss://nos.lol'}`,
      '',
      '# Blossom File Storage',
      `BLOSSOM_SERVERS=${env.BLOSSOM_SERVERS ?? 'https://blossom.primal.net,https://blossom.band,https://cdn.hzrd149.com'}`,
      '',
    ].join('\n');
    writeFileSync(ENV_FILE, saved, { mode: 0o600 });
    console.log('Generated new keypair (saved to .env.nostr-deploy.local — keep the nsec safe)');
  }
  return env;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

async function blossomUpload(servers, skBytes, filePath, blob) {
  const hash = sha256(blob);
  const auth = finalizeEvent({
    kind: 24242, // BUD-02 upload authorization
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['t', 'upload'],
      ['x', hash],
      ['expiration', String(Math.floor(Date.now() / 1000) + 600)],
    ],
    content: `Upload ${relative(DIST, filePath)}`,
  }, skBytes);
  const header = 'Nostr ' + Buffer.from(JSON.stringify(auth)).toString('base64');
  let lastErr;
  for (const server of servers) {
    try {
      const res = await fetch(`${server.replace(/\/$/, '')}/upload`, {
        method: 'PUT',
        headers: { authorization: header, 'content-type': 'application/octet-stream' },
        body: blob,
      });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      const json = await res.json();
      return { server, sha256: json.sha256 ?? hash };
    } catch (e) {
      lastErr = e;
      console.warn(`  upload via ${server} failed: ${e.message}`);
    }
  }
  throw lastErr;
}

function secretKeyBytes(secret) {
  if (secret.startsWith('nsec1')) {
    const { type, data } = nip19.decode(secret);
    if (type !== 'nsec') throw new Error(`NOSTR_PRIVATE_KEY must be an nsec or hex key, got ${type}`);
    return data;
  }
  return hexToBytes(secret);
}

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const env = loadEnv();
const skBytes = secretKeyBytes(env.NOSTR_PRIVATE_KEY);
const pubkey = getPublicKey(skBytes);
const relays = (env.NOSTR_RELAYS ?? 'wss://nos.lol,wss://relay.primal.net').split(',');
const blossoms = (env.BLOSSOM_SERVERS ?? 'https://blossom.primal.net').split(',');

// Optional extras (env-driven):
//   NSITE_PATH_PREFIX    deploy files under a URL prefix, e.g. "/pr-123"
//   NSITE_MERGE=1        keep existing manifest paths outside the prefix
//                        (incremental deploy into a live site)
//   NSITE_REMOVE_PREFIX  instead of deploying, drop all paths under
//                        NSITE_PATH_PREFIX from the existing manifest
const PREFIX = (() => {
  let p = (process.env.NSITE_PATH_PREFIX ?? '').trim();
  if (p && !p.startsWith('/')) p = '/' + p;
  return p.replace(/\/+$/, '');
})();
const MERGE = Boolean(process.env.NSITE_MERGE);
const REMOVE_PREFIX = Boolean(process.env.NSITE_REMOVE_PREFIX);

const pool = new SimplePool();

const fetchManifest = () =>
  pool.get(relays, { kinds: [15128], authors: [pubkey] });

const underPrefix = (urlPath) =>
  PREFIX && (urlPath === PREFIX || urlPath.startsWith(PREFIX + '/'));

async function publishManifest(pathTags) {
  const aggregate = sha256(Buffer.from(pathTags.map((t) => t.join(':')).join('\n')));
  const manifest = finalizeEvent({
    kind: 15128, // NIP-5A root site manifest
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ...pathTags,
      ['x', aggregate],
      ['title', pkg.name],
      ...(process.env.GITHUB_REPOSITORY
        ? [['source', `https://github.com/${process.env.GITHUB_REPOSITORY}`]]
        : []),
      ...blossoms.map((s) => ['server', s.replace(/\/$/, '')]),
    ],
    content: '',
  }, skBytes);

  const results = await Promise.allSettled(pool.publish(relays, manifest));
  const ok = results.filter((r) => r.status === 'fulfilled').length;
  console.log(`Manifest published to ${ok}/${relays.length} relays`);
  if (ok === 0) {
    console.error('Failed to publish manifest to any relay.');
    process.exitCode = 1;
  }
}

const npub = nip19.npubEncode(pubkey);

if (REMOVE_PREFIX) {
  // Cleanup mode: drop every path under PREFIX from the existing manifest.
  const existing = await fetchManifest();
  if (!existing) {
    pool.close(relays);
    console.log('No existing manifest found; nothing to remove.');
  } else {
    const kept = existing.tags.filter(
      (t) => t[0] === 'path' && !underPrefix(t[1]),
    );
    const removed =
      existing.tags.filter((t) => t[0] === 'path').length - kept.length;
    await publishManifest(kept);
    pool.close(relays);
    console.log(`Removed ${removed} entr${removed === 1 ? 'y' : 'ies'} under ${PREFIX}`);
  }
} else {
  const files = [...walk(DIST)].sort();
  console.log(`Deploying ${files.length} files from dist/${PREFIX ? ` under ${PREFIX}` : ''}`);

  const pathTags = [];
  for (const file of files) {
    const blob = readFileSync(file);
    const urlPath = PREFIX + '/' + relative(DIST, file).split('/').join('/');
    const { server, sha256: hash } = await blossomUpload(blossoms, skBytes, file, blob);
    pathTags.push(['path', urlPath, hash, server.replace(/\/$/, '') + '/' + hash]);
    console.log(`  ${urlPath} -> ${hash.slice(0, 12)}… (${server})`);
  }

  if (MERGE) {
    // Keep existing paths outside PREFIX (and not being replaced), so other
    // sections of the site (e.g. other PR previews) survive this deploy.
    const existing = await fetchManifest();
    const newPaths = new Set(pathTags.map((t) => t[1]));
    const kept = (existing?.tags ?? []).filter(
      (t) => t[0] === 'path' && !underPrefix(t[1]) && !newPaths.has(t[1]),
    );
    if (kept.length) console.log(`Merging ${kept.length} existing path(s) from current manifest`);
    pathTags.unshift(...kept);
  }

  await publishManifest(pathTags);
  pool.close(relays);

  console.log('\nDeployed:');
  console.log(`  https://${npub}.nsite.lol${PREFIX}`);
  console.log(`  https://${npub}.nsite.run${PREFIX}`);

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `npub=${npub}\n`);
  }
}
