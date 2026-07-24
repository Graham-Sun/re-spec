#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PKG_DIR = path.resolve(__dirname, '..');
const FIXTURES = path.join(PKG_DIR, '__tests__', 'fixtures');

function findEslintEntry() {
  let d = PKG_DIR;
  for (let i = 0; i < 6 && d !== path.dirname(d); i++) {
    const entry = path.join(d, 'node_modules', 'eslint', 'bin', 'eslint.js');
    if (fs.existsSync(entry)) return entry;
    d = path.dirname(d);
  }
  return null;
}

const entry = findEslintEntry();
if (!entry) {
  console.error('eslint CLI not found; install eslint (devDependency) before running this script');
  process.exit(2);
}

const tmpCfg = path.join(PKG_DIR, '__tests__', `.tmp-eslintrc-${process.pid}-${Date.now()}.json`);
fs.writeFileSync(tmpCfg, JSON.stringify({ extends: ['../index.js'], root: true }) + '\n');
process.on('exit', () => { try { fs.unlinkSync(tmpCfg); } catch (_) {} });

const cases = [
  { label: 'good', file: 'good.js', expect: 0 },
  { label: 'bad',  file: 'bad.js',  expect: 1 },
];

const node = process.execPath;
let failed = 0;
for (const c of cases) {
  const fix = path.join(FIXTURES, c.file);
  const res = spawnSync(node, [entry, '--no-eslintrc', '--config', tmpCfg, fix], {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: PKG_DIR,
    shell: false,
  });
  const actual = res.status === null ? 1 : res.status;
  if (actual === c.expect) {
    console.log('PASS ' + c.label);
  } else {
    console.log('FAIL ' + c.label + ' (expected exit ' + c.expect + ', got ' + actual + ')');
    if (res.stdout && res.stdout.length) console.log('  stdout:', res.stdout.toString().slice(0, 500).trim());
    if (res.stderr && res.stderr.length) console.log('  stderr:', res.stderr.toString().slice(0, 500).trim());
    failed++;
  }
}
process.exit(failed === 0 ? 0 : 1);