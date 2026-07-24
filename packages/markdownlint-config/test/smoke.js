'use strict';

const cfg = require('../index.json');
const assert = require('assert');

assert.strictEqual(cfg.default, true, 'default must be true');
assert.ok(cfg['ul-style'], 'ul-style rule missing');
assert.strictEqual(cfg['ul-style'].style, 'dash', 'ul-style must be dash');
assert.ok(cfg['no-trailing-spaces'], 'no-trailing-spaces rule missing');
assert.strictEqual(cfg['no-trailing-spaces'].br_spaces, 0, 'no-trailing-spaces br_spaces must be 0');
assert.strictEqual(cfg['no-trailing-spaces'].list_item_empty_lines, false, 'no-trailing-spaces list_item_empty_lines must be false');
assert.strictEqual(cfg['line-length'], false, 'line-length must be disabled');
assert.strictEqual(cfg['no-duplicate-header'], false, 'no-duplicate-header must be disabled');
assert.strictEqual(cfg['no-inline-html'], false, 'no-inline-html must be disabled');
assert.strictEqual(cfg['list-marker-space'], false, 'list-marker-space must be disabled');
assert.ok(cfg['proper-names'], 'proper-names rule missing');
assert.ok(Array.isArray(cfg['proper-names'].names), 'proper-names.names must be an array');
assert.ok(cfg['proper-names'].names.length > 50, 'proper-names.whitelist should have 50+ entries');
assert.ok(cfg['proper-names'].names.includes('JavaScript'), 'proper-names must include JavaScript');
assert.ok(cfg['proper-names'].names.includes('Node.js'), 'proper-names must include Node.js');
assert.ok(cfg['proper-names'].names.includes('webpack'), 'proper-names must include webpack');
assert.ok(cfg['proper-names'].names.includes('GitHub'), 'proper-names must include GitHub');
assert.strictEqual(cfg['proper-names'].code_blocks, false, 'proper-names.code_blocks must be false');
assert.ok(cfg.$schema && cfg.$schema.includes('markdownlint-config-schema'), '$schema must reference the official schema');

console.log('OK shape');