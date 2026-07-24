# packages/eslint-config/essential/

## Responsibility

Defines the "essential" (core/strict) preset layer of the ESLint config monorepo.
The per-file Chinese comment on `index.js` states the intent: "essential-level
entry only keeps necessary rules at the `error` severity; everything else is
downgraded to `warn`." All consumer flavors (`vue`, `react`, `es5`) extend this
layer to opt into the relaxed severity baseline.

## Design

Lower-abstraction overlay sitting **between** the parent presets
(`../index.js`, `../vue.js`, `../react.js`, `../es5.js`) and the supplemental
rule bundles in `./rules/`. It never re-declares rules from scratch; it
**extends** a parent and then **re-severities** them. The overlay strategy:

- **Demote, never remove.** Style/formatting rules that the parent treats as
  `error` are softened to `warn` (or `off`) here via the `./rules/set-style-to-warn`
  helper and inline `rules:` overrides.
- **Block known-bad constructs.** `./rules/blacklist` disables patterns the
  project has decided never to allow regardless of severity.
- **Block ES6+ in non-ES6 targets.** `./rules/es6-blacklist` is only included
  where ES6 syntax is legal.

The four entry files all follow the same shape:

```js
module.exports = {
  extends: ['../<parent>', './rules/set-style-to-warn',
            './rules/blacklist', /* optional */ './rules/es6-blacklist']
            .map(require.resolve),
  rules: { /* optional inline overrides */ },
};
```

`require.resolve` is applied to every extends entry so ESLint receives absolute
paths (avoids resolution surprises under the package's `exports` field).

### Flavor differentiation

| File | Parent extended | Extra extends | Inline rule overrides |
|------|-----------------|---------------|------------------------|
| `index.js`   | `../index`   | set-style-to-warn, blacklist, es6-blacklist | none |
| `vue.js`     | `../vue`     | set-style-to-warn, blacklist, es6-blacklist | none |
| `react.js`   | `../react`   | set-style-to-warn, blacklist, es6-blacklist | 13 `react/jsx-*` and `react/no-*` rules softened (most to `warn`, two to `off`) |
| `es5.js`     | `../es5`     | set-style-to-warn, blacklist | single override: `comma-dangle: ['warn', 'never']` |

`es5.js` is the only flavor that omits `./rules/es6-blacklist` — by design, since
ES5 targets must not adopt ES6 syntax at all, the blacklist is unnecessary (or
already covered by the parent). `react.js` is the only flavor that needs an
inline `rules:` block because JSX formatting rules (`react/jsx-*`,
`react/no-deprecated`, `react/no-find-dom-node`) demand flavor-specific tuning
beyond what the shared helper bundles provide. `vue.js` and `index.js` rely
entirely on the shared `./rules/` bundles.

## Flow

Consumer preset chain for the Vue flavor (representative of the pattern):

```
@scope/eslint-config (entry)
  └─ extends: './essential/vue'          ← packages/eslint-config/vue.js
       ├─ extends: '../vue'              ← packages/eslint-config/vue.js (strict parent)
       ├─ extends: './rules/set-style-to-warn'
       ├─ extends: './rules/blacklist'
       └─ extends: './rules/es6-blacklist'
```

ESLint merges configs left-to-right / top-down, so the parent's `error` rules
are first loaded and then overwritten by the essential layer's `warn`/`off`
versions. The same chain exists for `react.js` and `index.js`. For `es5.js`,
`./rules/es6-blacklist` is dropped from the chain.

## Integration

- **`./rules/`** — sibling subfolder that owns three reusable bundles
  consumed by every entry above: `set-style-to-warn` (severity demotion map),
  `blacklist` (permanently disabled rules), and `es6-blacklist` (ES6-syntax
  bans). They are not entry points; they are imported exclusively by the four
  files in this directory. See `essential/rules/codemap.md`.
- **`./typescript/`** — provides the TS variant of the essential overlay
  (additional `typescript-eslint` rule overrides). Consumers who want the TS
  flavor additionally extend from this subfolder. See
  `essential/typescript/codemap.md`.
- **`../` (parent preset)** — the strict reference layer. Every file in this
  directory extends exactly one parent file (`../index`, `../vue`, `../react`,
  or `../es5`). The essential layer exists to soften that parent, not to
  replace it.