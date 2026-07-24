# packages/eslint-config/essential/rules/

## Responsibility

Rule severity overrides / blacklists applied on top of the essential preset. Each file is a partial ESLint config (`{ rules: { ... } }`) whose entries downgrade or disable rules already defined in the baseline (`../rules/base/*`, `../rules/*`). The goal is to relax the full `error`-level config into an "essential" subset: cosmetic, stylistic, and opinionated rules are either silenced or demoted to `warn`, while correctness rules stay at `error`.

## Design

Four files, each following the `{ rules: { '<rule-name>': 'off' | 'warn' | [<severity>, ...options] } }` shape that ESLint's `extends` merge accepts:

- **`blacklist.js`** — Overrides for ES5-era core rules. Disables (`off`): `indent`, `semi`, `semi-style`. Downgrades to `warn`: `dot-location` (with `property` option), `no-eval`, `no-implied-eval`, `no-script-url`, `no-shadow`, `no-multi-spaces` (with `ignoreEOLComments: false`), `no-prototype-builtins`. Each entry carries an inline Chinese comment plus a `// @unessential` marker.
- **`es6-blacklist.js`** — Overrides for ES6 rules. All entries are `warn`. Examples: `arrow-spacing`, `generator-star-spacing`, `no-confusing-arrow`, `prefer-arrow-callback`, `prefer-const`, `template-curly-spacing`, `yield-star-spacing`, `import/first` (plugin-prefixed), `object-shorthand`, `no-var`.
- **`set-style-to-warn.js`** — Not a plain override map; a factory. Exports `setErrorRulesToWarn(configPath)` which `require()`s another config, walks its `rules`, and rewrites every severity value that is `'error'` (either scalar or first array element) to `'warn'`. The default invocation targets `'../../rules/base/style.js'`, so the entire `style` category from the baseline is bulk-demoted.
- **`ts-blacklist.js`** — Overrides for `@typescript-eslint/*` rules. Disables (`off`): `@typescript-eslint/indent`, `@typescript-eslint/semi`. Downgrades to `warn`: `@typescript-eslint/adjacent-overload-signatures`, `@typescript-eslint/no-parameter-properties`. Consumed only by the TypeScript-flavored presets, not by `essential/index.js`.

The pattern across `blacklist.js`, `es6-blacklist.js`, and `ts-blacklist.js` is identical: a flat rule-name → severity/options map. `set-style-to-warn.js` is the lone programmatic exception — it inverts the override direction (reads a config, emits a derived one).

## Flow

1. `packages/eslint-config/index.js` extends the baseline configs from `../rules/base/*` and `../rules/imports`; every rule in those files is defined at `error`.
2. `packages/eslint-config/essential/index.js` extends `../index` **and then** `./rules/set-style-to-warn`, `./rules/blacklist`, `./rules/es6-blacklist` (order matters — later `extends` entries win on conflict).
3. `set-style-to-warn.js` loads `../../rules/base/style.js`, iterates its rules, and rewrites `'error'` → `'warn'` in place, then exports `{ rules }`.
4. `blacklist.js` and `es6-blacklist.js` are merged as plain config objects; ESLint replaces the matching rule entries with the new severities.
5. Final per-rule severity = `baseline severity (error)` unless overridden by an entry here → `off` or `warn`.
6. For TypeScript users, `packages/eslint-config/essential/typescript/index.js` extends `../index` (the essential preset assembled above), `../../rules/typescript`, and `../rules/ts-blacklist` in that order — so `ts-blacklist` is the last writer and decides any conflicting `@typescript-eslint/*` severity.

Net flow: `rules/base/*` (error) → `set-style-to-warn` (style → warn) → `blacklist`/`es6-blacklist` (selective off/warn) → `ts-blacklist` (TS-selective off/warn) → final consumer config.

## Integration

- Consumed exclusively via ESLint `extends:`. `essential/index.js` and `essential/typescript/index.js` each use `.map(require.resolve)` so the relative paths here become absolute paths — ESLint requires absolute paths in `extends`.
- `set-style-to-warn.js` is the only file in this folder that performs a `require()` against a sibling config (`../../rules/base/style.js`); the other three are leaf config objects with no dependencies.
- `ts-blacklist.js` is **not** loaded by `essential/index.js`; it is reached transitively only through the `essential/typescript/*` presets. The three JS-overrides (`blacklist`, `es6-blacklist`, `set-style-to-warn`) are reached only through `essential/index.js`.
- The folder has no `index.js` of its own; each file is a discrete export resolved directly by its importer.