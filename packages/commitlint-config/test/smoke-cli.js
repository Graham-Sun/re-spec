#!/usr/bin/env node
'use strict';

// CLI engine smoke test for commitlint-config-re.
// Cross-platform: invokes commitlint via the JS entry point with the
// `node` executable so no shell wrapper is required.

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PKG_DIR = path.resolve(__dirname, '..');
const FIXTURES = path.join(PKG_DIR, 'test', 'fixtures');

// Find the commitlint CLI JS entry. Walk up parent dirs looking for
// node_modules/@commitlint/cli (pnpm creates a hoisted symlink at the
// repo root).
function findCommitlintEntry() {
  let d = PKG_DIR;
  for (let i = 0; i < 6 && d !== path.dirname(d); i++) {
    const entry = path.join(d, 'node_modules', '@commitlint', 'cli', 'lib', 'cli.js');
    if (fs.existsSync(entry)) return entry;
    d = path.dirname(d);
  }
  return null;
}

const entry = findCommitlintEntry();
if (!entry) {
  console.error('commitlint CLI not found; install @commitlint/cli (devDependency) before running this script');
  process.exit(2);
}

// Build a temp config that extends this package's index.js.
// The temp file lives inside the package directory so the relative
// extends path `../index.js` resolves correctly: commitlint resolves
// extends relative to the config file's location.
const tmpCfg = path.join(PKG_DIR, 'test', `.tmp-config-${process.pid}-${Date.now()}.cjs`);
fs.writeFileSync(tmpCfg, "module.exports = { extends: ['../index.js'] };\n");
process.on('exit', () => { try { fs.unlinkSync(tmpCfg); } catch (_) {} });

const cases = [
  { label: 'good',      file: 'good.txt',      expect: 0 },
  { label: 'bad-long',  file: 'bad-long.txt',  expect: 1 },
  { label: 'bad-type',  file: 'bad-type.txt',  expect: 1 },
  { label: 'bad-stop',  file: 'bad-stop.txt',  expect: 1 },
  { label: 'bad-blank', file: 'bad-blank.txt', expect: 1 },
];

const node = process.execPath;
let failed = 0;
for (const c of cases) {
  const fix = path.join(FIXTURES, c.file);
  const res = spawnSync(node, [entry, '--edit', fix, '--config', tmpCfg], {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: PKG_DIR,
    shell: false,
  });
  const actual = res.status === null ? 1 : res.status;
  if (actual === c.expect) {
    console.log(`PASS ${c.label}`);
  } else {
    console.log(`FAIL ${c.label} (expected exit ${c.expect}, got ${actual})`);
    if (res.stdout && res.stdout.length) console.log('  stdout:', res.stdout.toString().trim());
    if (res.stderr && res.stderr.length) console.log('  stderr:', res.stderr.toString().trim());
    failed++;
  }
}

process.exit(failed === 0 ? 0 : 1);