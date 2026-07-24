# packages/commitlint-config/

## Responsibility

- 提供可发布、可复用的 Commitlint 配置包 `commitlint-config-re`，统一仓库及外部项目的 Conventional Commits 提交信息约束。
- 负责定义提交消息的解析预设、字段格式、长度限制及允许的提交类型；不包含 CLI、Git Hook 或运行时业务逻辑。

## Design

- `packages/commitlint-config/index.js` 通过 CommonJS `module.exports` 导出单个 Commitlint 配置对象。
- `parserPreset` 指向 `conventional-changelog-conventionalcommits`，由 Conventional Commits 解析器解释 header、body 和 footer。
- 配置直接声明 `rules`，没有继续组合其他 `extends` 配置，也没有注册 Commitlint `plugins`。
- 规则数组遵循 Commitlint 的 `[severity, applicability, value?]` 格式：`0` 为关闭、`1` 为警告、`2` 为错误。
- 空行规则：`body-leading-blank`、`footer-leading-blank` 以警告级别要求正文和页脚前留空行。
- 长度规则：`body-max-line-length`、`footer-max-line-length`、`header-max-length` 以错误级别限制为 100 个字符。
- 大小写规则：`scope-case` 与 `type-case` 强制 `lower-case`；`subject-case` 被显式关闭，不限制 subject 大小写。
- 必填及标点规则：`subject-empty`、`type-empty` 禁止对应字段为空，`subject-full-stop` 禁止 subject 以英文句点 `.` 结尾。
- `type-enum` 仅允许 `feat`、`fix`、`docs`、`style`、`test`、`refactor`、`chore`、`revert` 八种 type。
- 配置不固定 scope 枚举，也不要求 scope 必填；存在 scope 时仅校验其小写格式。
- `conventional-changelog-conventionalcommits` 作为 `dependencies` 引入（commitlint 在加载本包时通过 `require` 解析此 parser preset；放在 `dependencies` 而非 `peerDependencies`，与 `@commitlint/config-conventional` 同生态惯例一致）。
- `index.js` 不修改，因此 `index.js:1-17` 是行为不变层；所有改动集中在 `package.json` 与 `README.md`。

### Manifest fields (publish-readiness state, see `package.json`)

| Field | Value | Rationale |
|-------|-------|-----------|
| `type` | `"commonjs"` | 显式声明，避免未来误改 `package.json` 全局 `type` 时漂移 |
| `description` | `"Shareable commitlint config enforcing Conventional Commits with 100-char header/body/footer limits"` | 提升 npm 搜索可发现性 |
| `keywords` | `["commitlint", "conventional-commits", "commit-message", "git", "shareable-config", "lint"]` | 替换原过于通用的 `["commit", "lint"]` |
| `homepage` | `"https://github.com/Graham-Sun/re-spec/tree/main/packages/commitlint-config#readme"` | monorepo 包级 homepage（与其他两个 `*-config-re` 一致） |
| `repository.directory` | `"packages/commitlint-config"` | monorepo 包级 GitHub 链接指向正确子目录 |
| `peerDependencies` | `{ "@commitlint/cli": "^17.0.0" }` | 强制消费者安装兼容主版本；`^17.0.0` 范围比 dev pin 略宽以兼容更多消费者 |
| `devDependencies` | `{ "@commitlint/cli": "^17.6.1" }` | 镜像根 dev pin，确保自测在 lockstep 的 commitlint 版本下执行 |
| `engines.node` | `">=14"` | 与 lerna 6 / commitlint 17 / conventionalcommacts parser 4.5 的最低 Node 一致 |
| `files` | `["index.js", "README.md", "LICENSE"]` | 白名单：npm 仅打包这三份文件。`codemap.md` 与 `test/` 自动被排除 |
| `publishConfig.access` | `"public"` | 显式 public（包名非 scoped 时 `npm publish` 默认公开，但显式声明避免歧义） |
| `publishConfig.registry` | — (未设置) | 由根 `package.json` 与 `lerna.json` 统一提供，避免重复 |
| `scripts.test` | `"node ./test/smoke.js && node ./test/smoke-cli.js"` | 双层验证：Node 形状检查 + CLI 引擎检查 |
| `LICENSE` | 包内副本（`packages/commitlint-config/LICENSE`，MIT） | npm 不会自动从仓库根复制 LICENSE；必须物理拷贝。**License 字段与 LICENSE 文件一致：均为 MIT**（早期版本曾错误声明 ISC，已修复） |

## Flow

1. 仓库根目录的 `commitlint.config.js` 通过 `extends: ['./packages/commitlint-config/index.js']` 加载本地配置；发布后的消费者可在 Commitlint 配置的 `extends` 中引用 `commitlint-config-re`（亦支持 `extends: ['re']` 简写）。
2. Commitlint 加载 CommonJS 导出，解析 `parserPreset`，再使用 `conventional-changelog-conventionalcommits` 将提交消息拆分为 type、scope、subject、body 和 footer。
3. `rules` 对解析结果执行校验：type 与 scope 必须为小写，type 必须属于八项枚举，type 和 subject 均不得为空。
4. header、body 行及 footer 行不得超过 100 字符；body/footer 缺少前导空行产生警告，其余启用规则违规产生错误。
5. `subject-case` 不参与校验，但 subject 仍必须存在且不能以 `.` 结尾。
6. 合法 header 形如 `feat(parser): add commit parser`；`build: update tooling` 会因 `build` 不在 `type-enum` 中而失败。
7. 根项目安装的 `@commitlint/cli` 读取 `commitlint.config.js`，并将该共享规则集应用到待校验的提交消息；`.husky/commit-msg` 触发 `npx commitlint --edit $1`。
8. 本包的 `npm test`（通过 `lerna run test` 触发）执行双层验证：
   - Layer 1 `test/smoke.js` — 直接 `require('./')` 并用 `assert` 锁定 12 条规则的形态（severity / applicability / value）。
   - Layer 2 `test/smoke-cli.js` — 通过 `child_process.spawnSync` 调用 `@commitlint/cli` 的 JS 入口（`node_modules/@commitlint/cli/lib/cli.js`），跑 5 个 fixture（good / bad-long / bad-type / bad-stop / bad-blank），断言退出码（0 表示通过、1 表示被规则拒绝）。

## Integration

- `commitlint.config.js`：仓库内直接消费者，以相对路径扩展 `packages/commitlint-config/index.js`。
- 根 `package.json` 通过 devDependency `@commitlint/cli@^17.6.1` 提供配置加载和提交消息校验能力。
- `packages/commitlint-config/package.json`：发布元数据定义包名 `commitlint-config-re`、入口 `index.js`，并依赖 `conventional-changelog-conventionalcommits@^4.5.0`。
- `packages/commitlint-config/index.js`：将该依赖注册为 `parserPreset`。
- `packages/eslint-config/`、`packages/markdownlint-config/`、`packages/stylelint-config/`：均未声明或直接引用此包；仓库内消费入口仅位于根配置。
- 根 `.husky/commit-msg`（8.x 风格）：`npx commitlint --edit $1`，由 husky 在 `core.hooksPath=.husky` 时自动触发。
- `packages/commitlint-config/test/`：`smoke.js` + `smoke-cli.js` + 5 个 fixture，是包级自测入口，被 `package.json#scripts.test` 与 `lerna run test` 共同触发。
- 根 `pnpm-lock.yaml` 通过 pnpm 将 `@commitlint/cli@17.8.1` 提升至根 `node_modules/`；自测脚本通过目录向上回溯找到该二进制。

## Publish readiness (verified 2026-07-22)

- `version` 已 bump `1.0.10` → `1.1.0`（minor：新增 `peerDependencies`、`devDependencies`、`engines`、`files`、`publishConfig.access`、`repository.directory`、`type`，均属向后兼容的元数据变更）。
- `npm pack ./packages/commitlint-config` → tarball `commitlint-config-re-1.1.0.tgz`，2.2 kB，4 个文件：`LICENSE`、`README.md`、`index.js`、`package.json`。SHA-512 integrity 已生成。
- `npm publish --dry-run ./packages/commitlint-config --registry=https://registry.npmjs.org/` → exit 0；"Publishing to https://registry.npmjs.org/ with tag latest and public access (dry-run)"。
- 自测双层全 PASS（5/5 fixtures + 12 条规则形态断言）。
- 待执行：`npm publish --access=public`（用户须先在能登录 sophiaa 账号的终端运行 `npm login` 完成认证）。
- 验证记录见 `.slim/deepwork/commitlint-config-re-publish-readiness.md` Phase D。

## Consumer-side caveat (discovered + patched 2026-07-22)

- 消费者 `extends: ['commitlint-config-re']` **失败**：`Error: Cannot find module "conventional-changelog-lint-config-commitlint-config-re"`。
- 消费者 `extends: ['re']` **成功**：good.txt → exit 0；bad.txt → exit 1（type-enum 报错命中）。
- 根因：`@commitlint/resolve-extends` 内置前缀策略（`commitlint-config-`、`@commitlint/config-`、`conventional-changelog-lint-config-`），消费者写 `extends: ['X']` 时实际查找 `commitlint-config-X`。包名 `commitlint-config-re` 的对应短名为 `re`，与官方 `@commitlint/config-conventional` 命名惯例一致。
- README 已用粗体警告框说明，示例 `extends: ['re']` 保留。
- 验证（2026-07-22）：在临时消费者目录中 `npm install ./commitlint-config-re-1.0.10.tgz` + `npm install @commitlint/cli`，`git init` 后跑 commitlint CLI，PASS。