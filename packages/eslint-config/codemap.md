# packages/eslint-config/

## Responsibility

Entry-point config composition layer for the entire `eslint-config-re` preset family. This directory exposes the public API of the package: one file per "flavor" (vanilla JS/ES5/Node/React/Vue/JSX-a11y). Consumers only ever reference files at this level; the underlying rule definitions live in `rules/`, the lower-level primitives in `essential/`, and the TS-specific overlays in `typescript/`. The package root itself is a preset aggregator — it does not define rules, only orchestrates `extends` chains and parser selection.

## Design

Per-flavor entry files are thin façades over `./rules/*`. All extends use `require.resolve` so the paths are absolute at load time (ESLint config resolution does not normalize relative extends across all runners).

- **`index.js`** — Base preset (modern JS / ES2020 + JSX). Extends `rules/base/{best-practices,possible-errors,style,variables,es6,strict}` and `rules/imports`. Sets `parser: '@babel/eslint-parser'` with `ecmaVersion: 2020`, `sourceType: 'module'`, `ecmaFeatures.jsx: true`, `impliedStrict: true`, `requireConfigFile: false`. `root: true` halts parent-config lookup.
- **`es5.js`** — Legacy preset. Same base rules as `index.js` but substitutes `./rules/base/es6` with `./rules/es5` (drops ES6 syntax enforcement). No parser override (uses Espree default).
- **`node.js`** — Composes `./index` + `./rules/node`. No parser override.
- **`react.js`** — Composes `./index` + `./rules/react`. Adds `parserOptions.babelOptions.presets: ['@babel/preset-react']` so `@babel/eslint-parser` understands JSX.
- **`vue.js`** — Composes `./index` + `./rules/vue`. Sets `parserOptions.parser: '@babel/eslint-parser'` — this is consumed by `vue-eslint-parser` as its inner script parser (see `vue.js` inline comment referencing vue-eslint-parser docs).
- **`jsx-a11y.js`** — Composable fragment, only `./rules/jsx-a11y`. No `root: true`; intended to be merged into a React consumer config (it expects the React plugin to already be registered upstream).

Composition is multiplicative: `react.js` pulls in the entire base rule set via `./index`, then layers React-specific rules on top. There is no rule override at this layer — only extension and parser/option selection.

### Manifest fields (publish-readiness state, see `package.json`)

| Field | Value | Rationale |
|-------|-------|-----------|
| `type` | `"commonjs"` | 显式声明，避免未来误改全局 `type` 时漂移 |
| `version` | `"1.1.0"` | 从 `1.0.10` bump（minor：新增 `peerDependencies` 是 additive + 修正 license mismatch） |
| `license` | `"MIT"` | **修复 mismatch**（原 `"ISC"`）：根 LICENSE 与本包复制的 LICENSE 均为 MIT |
| `description` | `"Shareable ESLint preset family with strict entry, essential (lax) overlay, and TypeScript/React/Vue/Node flavors"` | 提升 npm 搜索可发现性 |
| `keywords` | `["eslint","eslint-config","typescript","react","vue","node","shareable-config","lint"]` | 替换原 `["javaScript","typescript","node","lint"]`（注意：原 `javaScript` 拼写错误也一并修正） |
| `homepage` | `"https://github.com/Graham-Sun/re-spec/tree/main/packages/eslint-config#readme"` | monorepo 包级 homepage |
| `repository.directory` | `"packages/eslint-config"` | monorepo GitHub 链接 |
| `peerDependencies` | `{ "eslint": "^8.0.0" }` | **首次添加**（原缺失）。只列 ESLint 自身；per-flavor 插件（react/vue/typescript-eslint 等）在 README per-section 列出。这是 shareable-config 惯例，与 `@commitlint/config-conventional` 同模式 |
| `engines.node` | `">=14"` | lerna 6 / ESLint 8 / Node LTS 一致 |
| `files` | `["index.js","es5.js","node.js","react.js","vue.js","jsx-a11y.js","README.md","LICENSE","essential/**/*.js","rules/**/*.js","typescript/**/*.js"]` | glob 白名单：覆盖 33 个 JS 文件 + README + LICENSE。`__tests__/`、`lib/`、`codemap.md`、`.eslintrc.js` 等全部自动排除 |
| `publishConfig.access` | `"public"` | 显式 public |
| `publishConfig.registry` | — (未设置) | 由根 `package.json` 与 `lerna.json` 统一提供 |
| `scripts.test` | `"node ./__tests__/smoke.js && mocha ./__tests__/*.test.js --timeout 5000 && node ./__tests__/smoke-cli.js"` | 三层验证：Node 形态 → mocha → ESLint CLI 引擎 |
| `LICENSE` | 包内副本（`packages/eslint-config/LICENSE`，MIT） | npm 不自动从仓库根传播 LICENSE；物理拷贝 |

## Flow

Consumer usage (`<consumer>/.eslintrc.js`):

```js
module.exports = { extends: ['eslint-config-re/vue'] };
// or
module.exports = { extends: ['eslint-config-re/react', 'eslint-config-re/jsx-a11y'] };
// or
module.exports = { extends: ['eslint-config-re'] };  // resolves to index.js
```

At config-load time:

1. ESLint resolves `eslint-config-re/<flavor>` via `package.json#main` (`index.js`) plus the file-name convention.
2. The entry file's `extends` array is normalized through `require.resolve` → absolute paths.
3. ESLint walks the extends chain depth-first, merging configs (later extends override earlier ones at the leaf, but arrays/rules concatenate).
4. Parser / parserOptions from the leaf config apply; `@babel/eslint-parser` parses the source, then `vue-eslint-parser` (loaded inside `rules/vue`) takes over for `.vue` SFCs.
5. Plugins are registered implicitly via the `extends` chain (e.g., `rules/react` enables `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-plus`).
6. The package's own `npm test` (via `lerna run test`) executes three verification layers:
   - Layer 1 `__tests__/smoke.js` — `require('../')` + 16 entry-file requires (entry/essential/typescript) + `assert` on top-level keys (`extends`, `parser`, `parserOptions.ecmaVersion: 2020`, `sourceType: 'module'`, `jsx: true`, `root: true`).
   - Layer 2 `__tests__/*.test.js` — mocha (3 existing suites: `use-babel-eslint`, `validate-js-configs`, `validate-ts-configs`). Note: `validate-ts-configs.test.js` has 1 pre-existing failure (`node/prefer-promises/fs` rule not triggered by `ts-node.ts` fixture); not introduced by publish-readiness work.
   - Layer 3 `__tests__/smoke-cli.js` — `child_process.spawnSync` against `bin/eslint.js`, temp `.eslintrc.json` extends `../index.js`. `good.js` → exit 0; `bad.js` → exit 1.

## Integration

- **`rules/`** — Source of all rule categories (`base/*`, `imports`, `node`, `react`, `vue`, `jsx-a11y`, `es5`). Every entry file here resolves into `./rules/*` subpaths; this directory is the single point of coupling between the entry layer and the rule layer.
- **`essential/`** — Lower-level building blocks (custom rules, utility configs). Re-exported via `rules/`, never referenced directly from this layer.
- **`typescript/`** — Separate preset subtree (`typescript/index.js` etc.) for TS projects. Not referenced from these entry files — consumers extend `eslint-config-re/typescript` instead.
- **`.eslintrc.js`** — Self-lint config for the package itself; extends `./index`. Bootstraps the base preset so `npm run lint` lints the package using its own output. **Auto-excluded** from npm publish by `files` whitelist (not listed).
- **`package.json` scripts** — `print-config`: `eslint --print-config ./index.js > ./print-config.json` materializes the fully-resolved config (after merging all extends) for debugging and snapshot testing. `test`: `node ./__tests__/smoke.js && mocha ./__tests__/*.test.js --timeout 5000 && node ./__tests__/smoke-cli.js`. `lint`: `eslint ./` against the self-config.
- **`devDependencies`** pin the plugin/parser versions that the rule definitions assume: `eslint-config-egg ^10`, `@typescript-eslint/* ^5`, `eslint-plugin-vue ^7.3` + `vue-eslint-parser ^7.3` (version-coupled), `eslint-plugin-react ^7.17` + `react-hooks ^4.2` + `jsx-a11y ^6.3` + `jsx-plus ^0.1`, `eslint-plugin-import ^2.25` + `eslint-import-resolver-typescript ^2.5`.
- **Stale artifacts** (intentionally NOT shipped): `lib/eslint-config.js` (111-byte leftover scaffold from early development), `print-config.json` (0-byte build output, also gitignored in this package). Both auto-excluded by `files` whitelist.

## Publish readiness (verified 2026-07-24)

- `version` 已 bump `1.0.10` → `1.1.0`（minor：peerDeps 是 additive 不 breaking）。
- `npm pack ./packages/eslint-config` → tarball `eslint-config-re-1.1.0.tgz`，**37 文件**（33 JS + LICENSE + README + package.json）。SHA-512 integrity 已生成。
- `npm publish --dry-run ./packages/eslint-config --registry=https://registry.npmjs.org/` → exit 0；"Publishing to https://registry.npmjs.org/ with tag latest and public access (dry-run)"。
- 自测：Layer 1 PASS（16 入口全加载）/ Layer 3 PASS（good exit 0，bad exit 1）。Layer 2（mocha）16/17 PASS — 1 个 pre-existing failure（`validate-ts-configs.test.js` 的 `node/prefer-promises/fs` 断言，与本次改动无关）。
- 实际发布前唯一剩余步骤：用户执行 `npm publish --access=public`（认证已在 `npm whoami` 中确认 `sophiaa`）。
- 验证记录见 `.slim/deepwork/eslint-config-re-publish-readiness.md`。