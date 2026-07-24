# packages/eslint-config/typescript/

## Responsibility

Public entry layer for the strict TypeScript flavors of `eslint-config-re`. It mirrors the
JavaScript entries in `../` while adding the TypeScript parser, plugin, resolver settings,
and TS-aware replacements for core ESLint rules.

Consumers select `eslint-config-re/typescript` or a target-specific preset such as
`eslint-config-re/typescript/node`, `/react`, or `/vue`; these entries only compose configs.

## Design

Every module exports a thin CommonJS aggregator. Its `extends` entries are passed through
`require.resolve`, so ESLint receives absolute config paths.

| Entry | Extends, in merge order | Local configuration |
| --- | --- | --- |
| `index.js` | `../index`, `../rules/typescript` | None |
| `node.js` | `./index`, `../rules/node` | None |
| `react.js` | `../react`, `../rules/typescript` | None |
| `vue.js` | `./index`, `../rules/vue` | `parserOptions.parser: '@typescript-eslint/parser'` |

`index.js` is the generic TS root: `../index` supplies the ES2020/JSX base and import
rules, then `../rules/typescript` replaces the Babel parser with
`@typescript-eslint/parser`, registers `@typescript-eslint`, and configures the TypeScript
import parser/resolver. Its parser options use `project: './tsconfig.json'`,
`createDefaultProgram: true`, and `extraFileExtensions: ['.vue']`, enabling rules that
need TypeScript program information.

`node.js` and `vue.js` build on `./index`. `react.js` instead composes the equivalent
`../react` entry directly with `../rules/typescript`, preserving React rules and Babel
React parser options before the TypeScript layer selects the final parser. In `vue.js`,
`../rules/vue` selects `vue-eslint-parser`; the local `parserOptions.parser` makes
`@typescript-eslint/parser` its inner parser for Vue script blocks.

These strict entries do not extend `../essential/typescript/*`. That directory exposes a
parallel, lower-severity TypeScript preset family with blacklist overlays; it is not an
ancestor of `eslint-config-re/typescript/*`.

## Flow

A React TypeScript consumer config is typically:

```js
module.exports = {
  extends: ['eslint-config-re/typescript/react'],
};
```

ESLint resolves the package subpath, then walks each `extends` chain depth-first and
merges later configs over earlier ones. The strict chains are:

- Base: `rules/base/*` + `rules/imports` → `../index` → `rules/typescript` →
  `typescript/index` → user config.
- Node: base chain → `typescript/index` → `rules/node` → `typescript/node` → user config.
- React: base chain → `rules/react` → `../react` → `rules/typescript` →
  `typescript/react` → user config.
- Vue: base chain → `rules/typescript` → `typescript/index` → `rules/vue`
  (`vue-eslint-parser`) → `typescript/vue` inner-parser override → user config.

The essential alternative is a separate chain: `rules/base/*` → the matching `../` entry
→ `essential/*` severity/blacklist overlays → `rules/typescript` + `ts-blacklist` →
`essential/typescript/<flavor>` → user config. Consumers choose this through
`eslint-config-re/essential/typescript[/react|/vue]`, rather than layering it under the
strict `typescript/*` entries.

## Integration

- **`../`** — JavaScript entry layer. `../index` and `../react` provide the base and
  framework portions reused here; the TS entries are their public TypeScript counterparts.
- **`../rules/typescript.js`** — Upper TS rule layer. Owns `@typescript-eslint/parser`,
  the plugin, project-aware parser options, import resolver settings, TS-specific rules,
  and core-rule-to-TS-rule substitutions.
- **`../rules/node.js` and `../rules/vue.js`** — Flavor overlays appended by the Node and
  Vue entries; Vue installs `vue-eslint-parser`, requiring the local inner parser setting.
- **`../essential/typescript/`** — Parallel essential TS entry family. It combines the
  essential severity policy and TS blacklist with the same TS/framework rule sources; it
  is selected explicitly by consumers and is not extended by this strict entry layer.

