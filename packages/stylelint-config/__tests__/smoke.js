'use strict';

const cfg = require('../');
const assert = require('assert');

assert.strictEqual(cfg.defaultSeverity, 'warning', 'defaultSeverity must be warning');
assert.ok(Array.isArray(cfg.plugins), 'plugins must be an array');
assert.ok(cfg.plugins.includes('stylelint-scss'), 'plugins must include stylelint-scss');
assert.ok(cfg.rules && typeof cfg.rules === 'object', 'rules must be an object');
assert.strictEqual(cfg.rules['at-rule-no-unknown'], null, 'at-rule-no-unknown must be null (overridden by scss)');
assert.strictEqual(cfg.rules['scss/at-rule-no-unknown'], true, 'scss/at-rule-no-unknown must be true');
assert.ok(cfg.rules['color-no-invalid-hex'], 'color-no-invalid-hex must be enabled');
assert.strictEqual(cfg.rules['max-line-length'], 100, 'max-line-length must be 100');
const trailingSemi = cfg.rules['declaration-block-trailing-semicolon'];
assert.ok(Array.isArray(trailingSemi), 'declaration-block-trailing-semicolon must be an array');
assert.strictEqual(trailingSemi[0], 'always', 'declaration-block-trailing-semicolon must be "always"');
assert.ok(trailingSemi[1] && trailingSemi[1].severity === 'error', 'declaration-block-trailing-semicolon severity must be error');
assert.ok(Array.isArray(cfg.ignoreFiles), 'ignoreFiles must be an array');
assert.ok(cfg.ignoreFiles.includes('**/*.js'), 'ignoreFiles must include **/*.js');
assert.ok(cfg.ignoreFiles.includes('**/*.ts'), 'ignoreFiles must include **/*.ts');

console.log('OK shape');