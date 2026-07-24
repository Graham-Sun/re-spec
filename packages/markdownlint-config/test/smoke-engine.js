'use strict';

const path = require('path');
const fs = require('fs');

function findMarkdownlintEntry() {
  let d = __dirname;
  for (let i = 0; i < 6; i++) {
    const p = path.join(d, 'node_modules', 'markdownlint');
    if (fs.existsSync(p)) return p;
    d = path.dirname(d);
    if (d === path.dirname(d)) break;
  }
  return null;
}

const pkgRoot = findMarkdownlintEntry();
if (!pkgRoot) {
  console.error('markdownlint library not found; install markdownlint (devDependency) before running this script');
  process.exit(2);
}

const markdownlint = require(pkgRoot);
const cfg = require('../index.json');

const FIXTURES = path.join(__dirname, 'fixtures');

function checkExpect(actual, expected) {
  if (typeof expected === 'number') return actual === expected;
  if (typeof expected === 'string') {
    const m = expected.match(/^(<=|>=|<|>|=)(\d+)$/);
    if (!m) throw new Error(`bad expect expression: ${expected}`);
    const num = Number(m[2]);
    switch (m[1]) {
      case '<=': return actual <= num;
      case '>=': return actual >= num;
      case '<':  return actual < num;
      case '>':  return actual > num;
      case '=':  return actual === num;
    }
  }
  throw new Error(`unsupported expect value: ${expected}`);
}

const cases = [
  { label: 'good', file: 'good.md', expectErrors: '<=0' },
  { label: 'bad',  file: 'bad.md',  expectErrors: '>=1' },
];

let failed = 0;
for (const c of cases) {
  const content = fs.readFileSync(path.join(FIXTURES, c.file), 'utf8');
  const result = markdownlint.sync({
    strings: { [c.file]: content },
    config: cfg,
    resultVersion: 3,
  });
  const errCount = Object.values(result).reduce((n, r) => n + (Array.isArray(r) ? r.length : 0), 0);
  const ok = checkExpect(errCount, c.expectErrors);
  if (ok) {
    console.log(`PASS ${c.label} (errors=${errCount}, expected ${c.expectErrors})`);
  } else {
    console.log(`FAIL ${c.label} (expected ${c.expectErrors}, got ${errCount})`);
    failed++;
  }
}

process.exit(failed === 0 ? 0 : 1);