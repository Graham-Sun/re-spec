# packages/eslint-config/essential/typescript/

## Responsibility

TypeScript flavor of the `essential` preset — the lax, warn-by-default TS baseline for plain TypeScript projects and for TS projects paired with React or Vue. It mirrors the role of the top-level `packages/eslint-config/typescript/` entry, but sits one level down: every "essential" TS rule is downgraded to `warn` (or `off`) so consumers adopting it don't get the full-strict noise of `rules/typescript.js`.

## Design

Three files, each a thin composition layer (a `.map(require.resolve)` of relative `extends` paths). No rule bodies live here — the entire contribution is config merge order.

- **`index.js`** (plain TS) extends `../index` → `essential/index.js` (essential base: downgrades many JS rules to `warn`), `../../rules/typescript` → `rules/typescript.js` (parser + plugin + settings + full rule set), and `../rules/ts-blacklist` → `essential/rules/ts-blacklist.js` (TS-specific downgrades: `@typescript-eslint/indent` → off, `@typescript-eslint/semi` → off, `@typescript-eslint/adjacent-overload-signatures` → warn, `@typescript-eslint/no-parameter-properties` → warn).
- **`react.js`** mirrors `index.js` but swaps `../index` for `../react` (essential + React base), so JSX/React rules arrive already downgraded before TS rules layer on top. Same `ts-blacklist` is applied last, so TS downgrades win over base overrides.
- **`vue.js`** diverges structurally: it extends `./index` (the plain TS essential config above) plus `../../rules/vue` (`rules/vue.js`, which installs `vue-eslint-parser`). It then sets `parserOptions.parser = '@typescript-eslint/parser'`. The inline comment is the design rationale — `vue` must come last because vue-parser changes the parser context; the explicit `parserOptions.parser` re-establishes the TS parser as the inner parser so `.vue` `<script lang="ts">` blocks are still parsed as TypeScript.

Common shape across all three: parser (`@typescript-eslint/parser`), plugin (`@typescript-eslint/eslint-plugin`), and `parserOptions.project: './tsconfig.json'` with `createDefaultProgram: true` for type-aware rules are inherited via the `../../rules/typescript` extension, not redeclared.

## Flow

The entry layer `packages/eslint-config/typescript/{index,react,vue}.js` is a **sibling** layer, not a consumer of this folder. Each entry file composes from the non-essential base (`../index` → `packages/eslint-config/index.js`) plus `../rules/typescript` (and `../rules/vue` for the Vue entry), deliberately bypassing `essential/typescript/` so the strict preset stays strict. `essential/typescript/` therefore has no inbound `extends` references inside this package; consumers reach it directly by requiring `eslint-config-re/essential/typescript`, `/essential/typescript/react`, or `/essential/typescript/vue`.

Merge order within this layer (later wins): essential base → TS rules → TS blacklist. For `react.js`: essential+react base → TS rules → TS blacklist. For `vue.js`: `essential/typescript/index` → `rules/vue`, with `parserOptions.parser` applied last via the top-level object.

## Integration

- **Parent (`../`)**: `essential/index.js` and `essential/react.js` provide the downgraded JS / React baseline (via `essential/rules/{set-style-to-warn,blacklist,es6-blacklist}.js`).
- **Sibling entry layer (`../../typescript/`)**: independent strict counterpart; does not `extends` this folder.
- **Shared rules (`../../rules/typescript.js`)**: 807-line rule set; declares `parser: '@typescript-eslint/parser'`, `plugins: ['@typescript-eslint']`, `settings` for `import/parsers` (`['.ts', '.d.ts', '.tsx']`), `import/resolver: { typescript: {} }`, `import/extensions` (`['.js', '.ts', '.mjs']`), `parserOptions.extraFileExtensions: ['.vue']`, and the `overrides[files: ['*.ts', '*.tsx']]` block that disables `no-undef` and `import/no-unresolved` for TS files.
- **Plugin dependencies (`package.json` devDependencies)**: `@typescript-eslint/eslint-plugin@^5.0.0`, `@typescript-eslint/parser@^5.0.0`, `eslint-import-resolver-typescript@^2.5.0`, plus `eslint-plugin-vue@^7.3.0` and `vue-eslint-parser@^7.3.0` for the `vue.js` entry.
- **Notable enforced TS rules** (after ts-blacklist downgrades): `consistent-type-assertions` (error, `as` over `<T>`), `no-namespace` (error, allows `declare`), `no-non-null-asserted-optional-chain` (error), `no-invalid-void-type` (error), `no-dupe-class-members` (error), `no-shadow` (error), `no-unused-vars` (error), `quotes` (error, single), `brace-style` (error, 1tbs), `comma-spacing` (error), `consistent-type-definitions` (warn, interface), `array-type` (warn, array-simple), `member-ordering` (warn), `no-confusing-non-null-assertion` (warn), `no-empty-interface` (warn), `no-inferrable-types` (warn), `no-misused-new` (off), `no-explicit-any` (off), all `no-unsafe-*` (off).