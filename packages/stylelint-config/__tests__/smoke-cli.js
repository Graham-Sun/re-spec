#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PKG_DIR = path.resolve(__dirname, '..');
const FIXTURES = path.join(PKG_DIR, '__tests__', 'fixtures');

// Walk up to find stylelint's CLI bin entry (pnpm hoists to repo root).
function findStylelintEntry() {
  let d = PKG_DIR;
  for (let i = 0; i < 6 && d !== path.dirname(d); i++) {
    const entry = path.join(d, 'node_modules', 'stylelint', 'bin', 'stylelint.js');
    if (fs.existsSync(entry)) return entry;
    d = path.dirname(d);
  }
  return null;
}

const entry = findStylelintEntry();
if (!entry) {
  console.error('stylelint CLI not found; install stylelint (devDependency) before running this script');
  process.exit(2);
}

// Build a temp .stylelintrc.json inside the package directory so the
// relative extends path '../index.js' resolves correctly: stylelint
// resolves extends relative to the config file's location.
const tmpCfg = path.join(PKG_DIR, '__tests__', `.tmp-stylelintrc-${process.pid}-${Date.now()}.json`);
fs.writeFileSync(tmpCfg, JSON.stringify({ extends: ['../index.js'] }) + '\n');
process.on('exit', () => { try { fs.unlinkSync(tmpCfg); } catch (_) {} });

const cases = [
  { label: 'good-css', file: 'index.css',       expect: 0 },
  { label: 'good-mod', file: 'css-module.scss', expect: 0 },
  { label: 'bad-css',  file: 'bad.css',         expect: 2 },
];

const node = process.execPath;
let failed = 0;
for (const c of cases) {
  const fix = path.join(FIXTURES, c.file);
  const res = spawnSync(node, [entry, '--config', tmpCfg, '--formatter', 'json', fix], {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: PKG_DIR,
    shell: false,
  });
  const actual = res.status === null ? 1 : res.status;
  if (actual === c.expect) {
    console.log(`PASS ${c.label}`);
  } else {
    console.log(`FAIL ${c.label} (expected exit ${c.expect}, got ${actual})`);
    if (res.stdout && res.stdout.length) console.log('  stdout:', res.stdout.toString().slice(0, 500).trim());
    if (res.stderr && res.stderr.length) console.log('  stderr:', res.stderr.toString().slice(0, 500).trim());
    failed++;
  }
}

process.exit(failed === 0 ? 0 : 1);