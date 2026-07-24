'use strict';

const cfg = require('../');
const assert = require('assert');

assert.ok(Array.isArray(cfg.extends), 'extends must be an array');
assert.ok(cfg.extends.length >= 1, 'extends must not be empty');
assert.strictEqual(cfg.parser, '@babel/eslint-parser', 'parser must be @babel/eslint-parser');
assert.ok(cfg.parserOptions && typeof cfg.parserOptions === 'object', 'parserOptions must be an object');
assert.strictEqual(cfg.parserOptions.ecmaVersion, 2020, 'ecmaVersion must be 2020');
assert.strictEqual(cfg.parserOptions.sourceType, 'module', 'sourceType must be module');
assert.ok(cfg.parserOptions.ecmaFeatures && cfg.parserOptions.ecmaFeatures.jsx === true, 'jsx must be enabled');
assert.strictEqual(cfg.root, true, 'root must be true');

for (const flavor of ['es5', 'node', 'react', 'vue', 'jsx-a11y']) {
  const m = require('../' + flavor);
  assert.ok(m && typeof m === 'object', flavor + '.js must export an object');
}

const essentialFlavors = [
  './essential/index',
  './essential/es5',
  './essential/react',
  './essential/vue',
  './essential/typescript/index',
  './essential/typescript/react',
  './essential/typescript/vue',
];
for (const flavor of essentialFlavors) {
  const m = require('../' + flavor);
  assert.ok(m && typeof m === 'object', flavor + '.js must export an object');
}

const typescriptFlavors = [
  './typescript/index',
  './typescript/node',
  './typescript/react',
  './typescript/vue',
];
for (const flavor of typescriptFlavors) {
  const m = require('../' + flavor);
  assert.ok(m && typeof m === 'object', flavor + '.js must export an object');
}

console.log('OK shape');