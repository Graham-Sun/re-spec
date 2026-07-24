# packages/eslint-config/rules/

## Responsibility

Upper rule layer of the eslint-config package. Each file is a per-flavor / per-domain composition of ESLint rule dictionaries, sitting one level above `rules/base/` (the core ESLint rule buckets). These modules expose the actual rule values (`plugins`, `parser`, `parserOptions`, `settings`, `rules`, `overrides`) that are consumed by the package entry files (`../<flavor>.js`, `../index.js`) and by the preset layer (`../essential/`).

## Design

One file per framework/target. Layout is intentionally flat (no subfolders under `rules/`); each file is keyed by the framework or feature it configures.

### es5.js
- No `extends`. Defines a single `comma-dangle: ['error', 'never']` override so that ES5-only projects get the trailing-comma-banned style. Marked `@unessential`.
- Only standalone ES5 layer that does not inherit from `rules/base/imports`; composed directly by `../es5.js` plus `rules/base/*`.

### imports.js
- Plugin: `eslint-plugin-import`. Aligned with `eslint-plugin-import`'s `recommended` config.
- `settings.import/ignore`: skips `node_modules` plus coffee/scss/css/less/hbs/svg/json extensions.
- Key `error` rules: `import/no-unresolved`, `import/named`, `import/default`, `import/namespace`, `import/export`, `import/no-named-as-default`, `import/first`, `import/no-duplicates`, `import/no-self-import`, `import/no-cycle` (with `maxDepth: Infinity`).
- `import/order`, `import/newline-after-import`, `import/no-named-as-default-member` configured at `warn`/disabled with explicit option blocks. Other module-system style rules (`no-amd`, `no-extraneous-dependencies`, `no-mutable-exports`, etc.) explicitly opted out.

### jsx-a11y.js
- Plugin: `eslint-plugin-jsx-a11y`. All rules set to `warn` (informational, never erroring builds).
- Covers: `alt-text`, `img-redundant-alt`, `anchor-has-content`, `aria-props`, `aria-proptypes`, `aria-unsupported-elements`, `aria-role` (`ignoreNonDOM: true`), `role-has-required-aria-props`, `role-supports-aria-props`, `iframe-has-title`, `no-access-key`, `no-distracting-elements`, `scope`.
- Standalone — does NOT inherit from `../index`, only from itself in `../jsx-a11y.js`.

### node.js
- Thin delegating shim: `extends: ['eslint-config-egg/lib/rules/node']`. Inherits the full Node.js rule corpus from the egg preset (originally from `eslint-plugin-node`). No local overrides.

### react.js
- Plugins: `eslint-plugin-react`, `eslint-plugin-react-hooks`.
- `settings.react`: `pragma: 'React'`, `version: 'detect'`. `settings['import/resolver'].node`: extensions `.js/.jsx/.json`.
- Rule categories: JSX style (`react/jsx-closing-bracket-location`, `react/jsx-closing-tag-location`, `react/jsx-curly-spacing`, `react/jsx-indent`, `react/jsx-tag-spacing`, all marked `@unessential`), correctness (`react/jsx-no-duplicate-props`, `react/jsx-no-undef`, `react/no-unknown-property`, `react/self-closing-comp`, `react/no-typos`, `react/no-children-prop`, `react/no-danger-with-children`, `react/void-dom-elements-no-children`), patterns (`react/display-name`, `react/forbid-prop-types`, `react/no-multi-comp`, `react/prefer-es6-class`, `react/jsx-pascal-case`, `react/require-render-return`).
- Hook rules: `react-hooks/rules-of-hooks: error`, `react-hooks/exhaustive-deps: warn`.

### typescript.js
- Parser: `@typescript-eslint/parser`. Plugin: `@typescript-eslint/eslint-plugin`.
- `parserOptions.project: './tsconfig.json'` with `createDefaultProgram: true`, `extraFileExtensions: ['.vue']` to cover Vue SFCs.
- `settings['import/parsers']` registers the TS parser for `.ts/.d.ts/.tsx`; `settings['import/resolver'].typescript: {}` enables `eslint-import-resolver-typescript`; `settings['import/extensions']` adds `.ts/.mjs`.
- Pairs of base ESLint rules disabled in favor of TS-aware variants (`brace-style`, `indent`, `semi`, `comma-spacing`, `func-call-spacing`, `keyword-spacing`, `no-unused-expressions`, `no-unused-vars`, `no-use-before-define`, `no-useless-constructor`, `quotes`, `space-before-function-paren`, `default-param-last`, `dot-notation`, `no-shadow`, `no-array-constructor`, `no-dupe-class-members`, `no-empty-function`, `no-extra-parens`, `no-extra-semi`, `no-redeclare`, `no-dupe-class-members`).
- Category examples:
  - Type system: `@typescript-eslint/no-non-null-asserted-optional-chain`, `adjacent-overload-signatures`, `consistent-type-assertions`, `consistent-type-definitions`, `member-delimiter-style`, `typedef`, `type-annotation-spacing`.
  - Stylistic extensions: `array-type` (`array-simple`), `member-ordering`, `unified-signatures`, `quotes` (`single`), `semi`, `indent` (with detailed JSX-aware `ignoredNodes`).
  - Disabled by design: `await-thenable`, `no-explicit-any`, `no-floating-promises`, `no-implied-eval`, `prefer-nullish-coalescing`, `prefer-optional-chain`, `prefer-readonly`, `prefer-readonly-parameter-types`, `strict-boolean-expressions`, `switch-exhaustiveness-check`, etc.
- `overrides` block scoped to `*.ts` / `*.tsx`: turns off `no-undef` and `import/no-unresolved` (TS compiler + module resolver handle them).

### vue.js
- Parser: `vue-eslint-parser`. Plugin: `eslint-plugin-vue`.
- Rule categories: directive validation (`vue/valid-v-bind`, `vue/valid-v-model`, `vue/valid-v-on`, `vue/valid-v-if`, `vue/valid-v-for`, `vue/valid-v-html`, etc.), correctness (`vue/no-shared-component-data`, `vue/no-async-in-computed-properties`, `vue/no-side-effects-in-computed-properties`, `vue/no-textarea-mustache`, `vue/no-parsing-error`, `vue/no-template-key`, `vue/no-unused-components`, `vue/no-unused-vars`, `vue/no-reserved-keys`, `vue/no-dupe-keys`, `vue/no-duplicate-attributes`), API conventions (`vue/require-prop-type-constructor`, `vue/require-valid-default-prop`, `vue/require-v-for-key`, `vue/return-in-computed-property`, `vue/use-v-on-exact`, `vue/jsx-uses-vars`, `vue/comment-directive`).

## Flow

A consumer's `.eslintrc` typically references one of the package entry files under `../`:

1. `../index.js` extends the core `rules/base/*` buckets plus `rules/imports` (i.e. baseline + imports). It is the aggregator every non-ES5 flavor entry extends.
2. `../vue.js` `extends: ['./index', './rules/vue']` — aggregates base + imports + Vue rules, then overrides `parserOptions.parser` to `@babel/eslint-parser` so `<template>` and `<script>` are both parseable.
3. `../react.js` does the same with `./rules/react`, additionally injecting `@babel/preset-react` via `parserOptions.babelOptions`.
4. `../node.js` extends `./index` + `./rules/node` (the egg-config-egg shim).
5. `../jsx-a11y.js` extends ONLY `./rules/jsx-a11y` — it is intentionally additive on top of whichever other preset the consumer already loads.
6. `../es5.js` is a parallel root that extends `rules/base/*` + `rules/es5` (no imports, no parser override).
7. The `essential/` preset layer (`../essential/<flavor>.js`) then extends the corresponding `../<flavor>` and further downgrades style rules via `essential/rules/set-style-to-warn` + `essential/rules/blacklist` (and `es6-blacklist` for ES6-aware flavors).

## Integration

- **Down (rule layer below)**: `rules/base/` owns the six core ESLint rule buckets (`best-practices`, `possible-errors`, `style`, `variables`, `es6`, `strict`) — documented in its own codemap. Files here may assume those base rules have already been merged, but do not depend on them via `extends`.
- **Sibling preset layer**: `../essential/` consumes `../<flavor>` (which transitively reaches these files) and adds severity downgrades + blacklists to produce the "essential" preset variant.
- **Up (entry layer)**: `../<flavor>.js` (and `../index.js`) are the public API. Any consumer picks one entry, ESLint then resolves through `extends` chains that ultimately land on these per-flavor files to obtain the actual `parser`, `plugins`, `settings`, and `rules` values.
- **`settings`** declared here (e.g. `import/ignore`, `import/parsers`, `import/resolver`, `react.pragma`, `react.version`) are merged into the final config and consumed by individual rules at lint time.
