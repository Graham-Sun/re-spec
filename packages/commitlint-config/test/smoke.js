'use strict';

const cfg = require('../');
const assert = require('assert');

assert.strictEqual(cfg.parserPreset, 'conventional-changelog-conventionalcommits', 'parserPreset must be conventional-changelog-conventionalcommits');
assert.ok(cfg.rules && typeof cfg.rules === 'object', 'rules must be an object');

const typeEnum = cfg.rules['type-enum'];
assert.ok(typeEnum, 'type-enum rule missing');
assert.strictEqual(typeEnum[0], 2, 'type-enum must be severity error (2)');
assert.strictEqual(typeEnum[1], 'always', 'type-enum must be applicability always');
assert.deepStrictEqual(
  typeEnum[2],
  ['feat', 'fix', 'docs', 'style', 'test', 'refactor', 'chore', 'revert'],
  'type-enum value must be the Conventional Commits preset'
);

assert.strictEqual(cfg.rules['header-max-length'][0], 2, 'header-max-length must be severity error');
assert.strictEqual(cfg.rules['header-max-length'][2], 100, 'header-max-length must be 100');

assert.strictEqual(cfg.rules['subject-case'][0], 0, 'subject-case must be severity off (0)');

assert.strictEqual(cfg.rules['type-case'][0], 2, 'type-case must be severity error');
assert.strictEqual(cfg.rules['type-case'][2], 'lower-case', 'type-case must require lower-case');

assert.strictEqual(cfg.rules['scope-case'][0], 2, 'scope-case must be severity error');
assert.strictEqual(cfg.rules['scope-case'][2], 'lower-case', 'scope-case must require lower-case');

assert.strictEqual(cfg.rules['subject-full-stop'][0], 2, 'subject-full-stop must be severity error');
assert.strictEqual(cfg.rules['subject-full-stop'][1], 'never', 'subject-full-stop applicability never');
assert.strictEqual(cfg.rules['subject-full-stop'][2], '.', 'subject-full-stop value must be .');

console.log('OK shape');
