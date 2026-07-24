# AGENTS.md — Project Conventions for AI Agents

## Repository Map

A full codemap is available at `codemap.md` in the project root.

Before working on any task, read `codemap.md` to understand:
- Project architecture and entry points
- Directory responsibilities and design patterns
- Data flow and integration points between modules

For deep work on a specific folder, also read that folder's `codemap.md`.

## Project Quick Facts

- **Name**: `@sophiaa/re-spec` — frontend coding-standards monorepo (lerna + pnpm-workspace).
- **Language**: JavaScript / JSON; documentation in Chinese.
- **Published packages** (all under `packages/`):
  - `commitlint-config-re` — Commitlint preset
  - `eslint-config-re` — ESLint preset family (strict + essential flavors, JS/TS/React/Vue/Node)
  - `markdownlint-config-re` — markdownlint preset
  - `stylelint-config-re` — stylelint preset
- **Node**: requires pnpm (enforced via `preinstall: only-allow pnpm`).
- **Tests**: `lerna run test` — mocha (eslint-config), jest (stylelint-config).
- **Hooks**: husky 8.x; `.husky/commit-msg` runs commitlint.

## Critical Conventions

1. **Do NOT modify `node_modules/` or `packages/*/node_modules/`** — they are pnpm-installed and regenerated.
2. **Do NOT bypass the `preinstall: only-allow pnpm`** — npm/yarn will be rejected.
3. **Conventional Commits** are enforced (see `packages/commitlint-config/codemap.md`). Header ≤ 100 chars; allowed types: `feat`, `fix`, `docs`, `style`, `test`, `refactor`, `chore`, `revert`.
4. **Style consistency across the 4 lint packages**: all follow `*-config-re` naming with `peerDependencies` pinning the host tool version.
5. **ESLint config hierarchy** is non-trivial (see `codemap.md` for the merge-order diagram). When changing a rule, identify its layer (`base/` → flavor `rules/` → entry) before editing.

## Where to Find Things

| Concern | Location |
|---------|----------|
| Monorepo config | `lerna.json`, `pnpm-workspace.yaml`, root `package.json` |
| Commit rules | `packages/commitlint-config/index.js` (root: `commitlint.config.js`) |
| Markdown rules | `packages/markdownlint-config/index.json` (root: `.markdownlint.json`) |
| Style rules | `packages/stylelint-config/index.js` (root: `.stylelintrc`) |
| ESLint rules | `packages/eslint-config/{index,es5,node,react,vue,jsx-a11y}.js` for strict; `packages/eslint-config/essential/` for lax |
| Documentation | `docs/` (VuePress 1.x) |
| Husky hooks | `.husky/` |