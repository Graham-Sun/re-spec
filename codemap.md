# Repository Atlas: re-spec

## Project Responsibility

`@sophiaa/re-spec` (v1.0.10) — **前端编码规范工程化** (frontend coding-standards engineering). A lerna + pnpm monorepo that publishes four shareable lint configurations as npm packages (`commitlint-config-re`, `eslint-config-re`, `markdownlint-config-re`, `stylelint-config-re`) and ships a VuePress 1.x documentation site. The repo is a "集中定义、就近继承" (centralize-and-inherit-locally) standards platform: each `*-config-re` package is consumed by the repo root's matching `.*rc` file and is independently publishable for downstream projects.

## System Entry Points

- `package.json` — Root devDependencies (husky, lerna, pnpm, vuepress, markdownlint, conventional-changelog), npm scripts (`init`, `prepare`, `clean`, `test`, `docs:dev`, `docs:build`, `deploy`, `publish`, `lint`, `changelog`).
- `lerna.json` — Lerna 6.x configuration; pnpm-workspace-based monorepo; publishes packages under `packages/*` to the public npm registry.
- `pnpm-workspace.yaml` — pnpm workspace declaration: `packages: ['packages/*']`.
- `commitlint.config.js` — Root Commitlint config; extends `./packages/commitlint-config/index.js`.
- `.markdownlint.json` — Root Markdownlint config; extends `./packages/markdownlint-config/index.json`.
- `.markdownlintignore` — Excludes `node_modules/` from markdown linting.
- `.stylelintrc` — Root Stylelint config; extends `./packages/stylelint-config/index.js`.
- `.husky/commit-msg` — Husky pre-commit / commit-msg hook; runs commitlint.
- `deploy.sh` — Documentation deploy script (bash).
- `docs/` — VuePress 1.x documentation site (Chinese-language; themes, plugin-one-click-copy, plugin-zooming).
- `CHANGELOG.md` — Auto-generated changelog via `conventional-changelog`.

## Architecture & Module Hierarchy

```
packages/
├── commitlint-config/           ← @commitlint config preset (one file)
│   └── index.js                 — extends root via './packages/commitlint-config/index.js'
├── markdownlint-config/         ← markdownlint config preset (one JSON file)
│   └── index.json               — extends root via '.markdownlint.json' → './packages/.../index.json'
├── stylelint-config/            ← stylelint config preset (one JS file)
│   └── index.js                 — extends root via './packages/stylelint-config/index.js'
└── eslint-config/               ← ESLint config preset family (largest package)
    ├── index.js, es5.js, node.js, react.js, vue.js, jsx-a11y.js       (public API)
    ├── essential/                                                       (lax severity overlay)
    │   ├── index.js, es5.js, react.js, vue.js                          — extends parent + demotes severity
    │   ├── rules/                                                       (override bundles)
    │   │   ├── blacklist.js                                             — ES5 disabled rules
    │   │   ├── es6-blacklist.js                                         — ES6 disabled rules
    │   │   ├── set-style-to-warn.js                                     — factory: rewrite 'error'→'warn'
    │   │   └── ts-blacklist.js                                          — @typescript-eslint disabled rules
    │   └── typescript/                                                   (lax TS flavor)
    │       ├── index.js, react.js, vue.js
    ├── rules/                                                             (upper rule layer)
    │   ├── es5.js, imports.js, jsx-a11y.js, node.js, react.js, typescript.js, vue.js
    │   └── base/                                                          (core ESLint buckets)
    │       ├── best-practices.js, es6.js, possible-errors.js, strict.js, style.js, variables.js
    └── typescript/                                                       (strict TS flavor entry layer)
        ├── index.js, node.js, react.js, vue.js
```

## ESLint Config Merge Order (representative, vue flavor)

```
rules/base/{best-practices, possible-errors, style, variables, es6, strict}
  → rules/imports
    → ../index                (essential entry, OR strict entry: ../vue)
      → rules/vue             (vue-eslint-parser + eslint-plugin-vue)
        → essential/vue       (set-style-to-warn + blacklist + es6-blacklist)
          → user .eslintrc
```

## Directory Map (Aggregated)

| Directory | Responsibility Summary | Detailed Map |
|-----------|------------------------|--------------|
| `packages/commitlint-config/` | Single-file Conventional Commits preset (`commitlint-config-re` v1.0.10). Defines header/body/footer format, line-length limits, type-enum, severity of each rule; consumed by root `commitlint.config.js` via relative path. | [View Map](packages/commitlint-config/codemap.md) |
| `packages/markdownlint-config/` | Single-file JSON preset (`markdownlint-config-re`). Defaults + targeted overrides on MD004/MD009/MD013/MD024/MD030/MD033/MD044 + ~80-name `proper-names` whitelist. Consumed by root `.markdownlint.json`. | [View Map](packages/markdownlint-config/codemap.md) |
| `packages/stylelint-config/` | Single-file CSS/SCSS preset (`stylelint-config-re`). Plugins: `stylelint-scss`; severity defaults to `warning` with selective `error` overrides; SCSS at-rule overrides for `@use`/`@forward`/`@mixin`/`@include`. Consumed by root `.stylelintrc`. | [View Map](packages/stylelint-config/codemap.md) |
| `packages/eslint-config/` | Public API entry layer: per-flavor files (`index`, `es5`, `node`, `react`, `vue`, `jsx-a11y`) that compose strict presets. `@babel/eslint-parser`, `vue-eslint-parser`, `@typescript-eslint/parser` selection; `require.resolve` for absolute extends paths. | [View Map](packages/eslint-config/codemap.md) |
| `packages/eslint-config/essential/` | Lax severity overlay: 4 entry files that extend the strict parents and downgrade style/cosmetic rules to `warn`. Flavor table: `index`/`vue`/`react`/`es5`. Inline overrides only in `react.js` (JSX rules). | [View Map](packages/eslint-config/essential/codemap.md) |
| `packages/eslint-config/essential/rules/` | Reusable override bundles: `blacklist` (ES5 disabled), `es6-blacklist` (ES6 disabled), `ts-blacklist` (TS disabled), `set-style-to-warn` (programmatic factory that bulk-rewrites error→warn on `rules/base/style`). | [View Map](packages/eslint-config/essential/rules/codemap.md) |
| `packages/eslint-config/essential/typescript/` | Lax TS overlay: 3 files (`index`/`react`/`vue`) extending the essential parents + `rules/typescript` + `ts-blacklist`. `vue.js` re-establishes `@typescript-eslint/parser` as inner parser behind `vue-eslint-parser`. | [View Map](packages/eslint-config/essential/typescript/codemap.md) |
| `packages/eslint-config/rules/` | Upper rule layer: 7 per-framework/per-domain files (`es5`, `imports`, `jsx-a11y`, `node` (shim to `eslint-config-egg/lib/rules/node`), `react`, `typescript`, `vue`). Owns the `plugins`/`parser`/`parserOptions`/`settings`/`rules`/`overrides` for each framework. | [View Map](packages/eslint-config/rules/codemap.md) |
| `packages/eslint-config/rules/base/` | Lowest abstraction: 6 ESLint built-in rule buckets (`best-practices`, `es6`, `possible-errors`, `strict`, `style`, `variables`) — a structured re-export of ESLint's official category taxonomy with severity overrides. | [View Map](packages/eslint-config/rules/base/codemap.md) |
| `packages/eslint-config/typescript/` | Strict TS-flavor entry layer: 4 files (`index`/`node`/`react`/`vue`) — TypeScript counterpart to `../` entry layer. `index.js` extends `../index` + `../rules/typescript`; `vue.js` adds inner-parser override. | [View Map](packages/eslint-config/typescript/codemap.md) |

## Plugin / Parser Version Coupling (eslint-config-re)

| Plugin | Version | Layer |
|--------|---------|-------|
| `eslint` | ^8.7.0 | core |
| `@typescript-eslint/parser` | ^5.0.0 | typescript entry / rules/typescript |
| `@typescript-eslint/eslint-plugin` | ^5.0.0 | rules/typescript |
| `eslint-plugin-vue` | ^7.3.0 | rules/vue, essential/typescript/vue |
| `vue-eslint-parser` | ^7.3.0 | rules/vue, typescript/vue |
| `eslint-plugin-react` | ^7.17.0 | rules/react |
| `eslint-plugin-react-hooks` | ^4.2.0 | rules/react |
| `eslint-plugin-jsx-a11y` | ^6.3.1 | rules/jsx-a11y |
| `eslint-plugin-jsx-plus` | ^0.1.0 | rules/react |
| `eslint-plugin-import` | ^2.25.3 | rules/imports, rules/typescript |
| `eslint-import-resolver-typescript` | ^2.5.0 | rules/typescript |
| `eslint-config-egg` | ^10.0.0 | rules/node |
| `@babel/core` / `@babel/eslint-parser` / `@babel/preset-react` | ^7.16 | index.js / react.js |

## Build / Release

- **`npm run init`** — `pnpm install --no-frozen-lockfile`.
- **`npm run prepare`** — `husky install`.
- **`npm run test`** — `lerna run test` (runs `mocha` in eslint-config and `jest` in stylelint-config).
- **`npm run publish`** — `lerna publish` (npm client; publishes each `packages/*` independently).
- **`npm run changelog`** — `conventional-changelog -p angular -i CHANGELOG.md -s`.
- **`npm run docs:dev` / `docs:build`** — VuePress 1.x local dev / production build of `docs/`.
- **`npm run deploy`** — `bash deploy.sh`.
- **`npm run lint`** — `markdownlint README.md`.

## Conventions Observed

- All four published configs follow `*-config-re` naming; each is a single (or near-single) entry-point preset with `peerDependencies` pinning the host tool version.
- Severity defaults vary by package: ESLint strict preset → `error`; ESLint essential preset → style `warn`/correctness `error`; stylelint → `defaultSeverity: 'warning'`.
- Chinese-language repo (README, .vuepress config, inline comments). Documentation under `docs/coding/`, `docs/cli/`, `docs/engineering/`, `docs/npm/`.
- Conventional Commits enforced via `commitlint.config.js` + `.husky/commit-msg`.
- husky 8.x is the Git-hook layer; lerna 6.x + pnpm-workspace is the package-management layer.