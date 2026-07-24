# packages/markdownlint-config/

## Responsibility

Publishes `markdownlint-config-re` — the shared markdown lint ruleset for the `re-spec` frontend standards monorepo. Provides a single, versioned configuration that downstream consumers (the repo root, other packages, and external npm users) extend from their own `.markdownlint.json`.

## Design

The package ships **a single `index.json` file as its `main` entry** — no JavaScript, no programmatic loader. This is intentional: markdownlint natively loads JSON configs via its built-in config resolver, so an `.json` artifact keeps the dependency tree zero-runtime and lets the file be reused verbatim as both the npm package entry and the `extends` target inside this monorepo.

The config strategy is **"defaults + targeted overrides"**:

- `default: true` — opt into markdownlint's full default rule set as the baseline; every rule not mentioned below keeps its shipped severity.
- `$schema` — pinned to DavidAnson's official `markdownlint-config-schema.json` for editor autocomplete and validation.

Rule categories touched (rule IDs in `MDxxx` form per markdownlint):

- **MD004 / `ul-style`** — forces unordered list bullet to `"dash"` only, rejecting `*` and `+`.
- **MD009 / `no-trailing-spaces`** — `br_spaces: 0` (no trailing whitespace after hard breaks) and `list_item_empty_lines: false` (do not require blank lines around empty list items).
- **MD013 / `line-length`** — disabled (`false`); Chinese docs and embedded tables routinely exceed the default 80-char limit.
- **MD024 / `no-duplicate-header`** — disabled (`false`); permits repeated section titles across a document.
- **MD030 / `list-marker-space`** — disabled (`false`); tolerant spacing after ordered-list markers.
- **MD033 / `no-inline-html`** — disabled (`false`); raw HTML inside markdown is allowed (useful for `<br>`, badges, embedded widgets).
- **MD044 / `proper-names`** — extensive `names` whitelist (≈80 tech proper nouns: `JavaScript`, `Node.js`, `React`, `webpack`, `GitHub`, `Chrome`, `iOS`, `Apache`, etc.) with `code_blocks: false` so casing inside fenced code is not enforced.

All other MD001–MD058 rules retain their default severity.

`index.json:1-111` is the behavior-invariant layer; all changes for publish-readiness are in `package.json` and `README.md`.

### Manifest fields (publish-readiness state, see `package.json`)

| Field | Value | Rationale |
|-------|-------|-----------|
| `version` | `"1.1.0"` | Bump from `1.0.10` (minor: license mismatch fix + new metadata) |
| `license` | `"MIT"` | **Fix mismatch** (was `"ISC"`): root `LICENSE` and copied in-package `LICENSE` are both MIT |
| `main` | `"index.json"` | Preserved — JSON config is the only artifact |
| `description` | `"Shareable markdownlint config with documented proper-noun whitelist and disabled line-length/duplicate-header/inline-HTML for flexible Chinese docs"` | Expanded from `"文档规范"` for npm search |
| `keywords` | `["markdownlint","markdown","lint","shareable-config","documentation"]` | Replaces old `["markdown","lint"]` |
| `homepage` | `"https://github.com/Graham-Sun/re-spec/tree/main/packages/markdownlint-config#readme"` | Anchored to the package subpath |
| `repository.directory` | `"packages/markdownlint-config"` | Monorepo GitHub link |
| `peerDependencies` | `{ "markdownlint": "^0.28.1" }` | Preserved (was already correct) |
| `devDependencies` | `{ "markdownlint": "^0.28.1" }` | Added so the engine smoke (`markdownlint.sync`) can run locally without hoisting |
| `engines.node` | `">=14"` | Matches markdownlint 0.28 floor |
| `files` | `["index.json", "README.md", "LICENSE"]` | Whitelist — `codemap.md` and `test/` auto-excluded |
| `publishConfig.access` | `"public"` | Explicit public |
| `publishConfig.registry` | — (not set) | Inherited from `lerna.json` |
| `scripts.test` | `"node ./test/smoke.js && node ./test/smoke-engine.js"` | Two-layer verification (no CLI layer — markdownlint has no built-in CLI; engine check uses the library API) |
| `LICENSE` | In-package copy (MIT) | npm does not auto-propagate from repo root |

**No `type` field**: package is JSON-only; `type` is irrelevant and would be misleading.

## Flow

End-to-end consumption:

1. Consumer installs the package alongside the `markdownlint` peer dependency (`^0.28.1`).
2. Consumer creates `.markdownlint.json` at the project root containing `"extends": "markdownlint-config-re"`.
3. When the `markdownlint` CLI (`markdownlint-cli` or `markdownlint-cli2`) runs, it resolves `markdownlint-config-re` via Node module resolution, loads `index.json`, merges `default: true` with every override above, and applies the resulting ruleset to `*.md` files.
4. For this monorepo itself, step 2 is satisfied by the repo-root `.markdownlint.json`, which points `extends` directly at `./packages/markdownlint-config/index.json` (workspace-local reference).
5. The package's own `npm test` (via `lerna run test`) executes two verification layers:
   - **Layer 1 `test/smoke.js`** — `require('../index.json')` + `assert` locks: `default: true`, `ul-style.style === 'dash'`, `no-trailing-spaces.br_spaces === 0`, the four `false` overrides (`line-length`, `no-duplicate-header`, `no-inline-html`, `list-marker-space`), `proper-names.names` length and inclusion of `JavaScript`/`Node.js`/`webpack`/`GitHub`, `code_blocks: false`, `$schema` reference.
   - **Layer 2 `test/smoke-engine.js`** — invokes `markdownlint.sync({ strings, config: cfg })` from the `markdownlint` library directly. `good.md` → 0 errors; `bad.md` (star list violating `ul-style: dash` + trailing-space line) → ≥1 error.

## Integration

- **Peer dep**: `markdownlint@^0.28.1` (declared in `package.json`, not bundled).
- **Dev dep**: `markdownlint@^0.28.1` (mirrors peer; the engine smoke needs the library locally).
- **Repo root**: `.markdownlint.json` extends `./packages/markdownlint-config/index.json`; `.markdownlintignore` excludes `node_modules/`.
- **Sister packages**: none depend on it programmatically; it is consumed exclusively through the markdownlint CLI config layer.
- **Docs surface**: published npm usage documented in `docs/npm/markdownlint.md` and `docs/cli/encode-fe-lint.md`; sidebar entry wired in `docs/.vuepress/config.ts`.
- **Distribution**: published to npm under the name `markdownlint-config-re` (`license: "MIT"`, author `baihong`); current version `1.1.0`.

## Publish readiness (verified 2026-07-24)

- `version` 已 bump `1.0.10` → `1.1.0`（minor：license mismatch fix + 新增 metadata）。
- `npm pack ./packages/markdownlint-config` → tarball `markdownlint-config-re-1.1.0.tgz`，3.0 kB，4 文件（`LICENSE`、`README.md`、`index.json`、`package.json`）。
- `npm publish --dry-run ./packages/markdownlint-config --registry=https://registry.npmjs.org/` → exit 0；"Publishing to https://registry.npmjs.org/ with tag latest and public access (dry-run)"。
- 自测双层全 PASS（Layer 1 形态 + Layer 2 engine 2/2）。
- 实际发布前唯一剩余步骤：用户执行 `npm publish --access=public`（认证已在 `npm whoami` 中确认 `sophiaa`）。
- 验证记录见 `.slim/deepwork/markdownlint-config-re-publish-readiness.md`。