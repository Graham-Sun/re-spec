# packages/stylelint-config/

## Responsibility

`stylelint-config-re`（v1.1.0）是 monorepo 内的共享 CSS/SCSS 静态检查配置包。它不实现规则逻辑，只聚合并预设 stylelint 规则集，统一全仓库样式代码风格（缩进、空格、命名、SCSS 语法合法性与一致性），由消费方通过 `extends` 引入。

## Design

单一入口 `index.js` 以 CommonJS `module.exports` 导出一份 stylelint 配置对象。结构按四个顶级键组织：

- `defaultSeverity: 'warning'` —— 未显式标注 severity 的规则默认按 warning 报告，配合个别规则（如 `declaration-block-trailing-semicolon`）显式提升为 `error`。
- `plugins: ['stylelint-scss']` —— 注册 SCSS 语法插件，提供以 `scss/` 为前缀的规则命名空间。
- `rules` —— 核心规则字典，按用途分为三大块：
  - **Possible errors**：`at-rule-no-unknown: null` + `scss/at-rule-no-unknown: true` 形成覆盖，禁用原生规则、改用 SCSS 插件版本以放行 `@use`/`@forward`/`@mixin`/`@include` 等 SCSS at-rule；`no-descending-specificity` 与 `no-empty-source` 设为 `null` 关闭；`color-no-invalid-hex`、`declaration-block-no-shorthand-property-overrides`、`no-duplicate-at-import-rules`、`property-no-unknown` 等开启。
  - **Stylistic issues**：`indentation: 2`；大括号换行/空格组合（`block-opening-brace-newline-after: 'always-multi-line'`、`block-closing-brace-newline-before: 'always-multi-line'`）；`color-hex-case: 'lower'` + `color-hex-length: 'short'`；`max-line-length: 100`；`declaration-block-single-line-max-declarations: 1`；`declaration-block-trailing-semicolon: 'always'`（含 `severity: error`）；`length-zero-no-unit` 忽略自定义属性；`value-list-comma-space-after: 'always-single-line'`。
  - **stylelint-scss 专属**：仅启用 `scss/double-slash-comment-whitespace-inside: 'always'`，其余 SCSS 规则（命名规范、变量模式、`@import` 约束等）未启用，保留后续按需扩展空间。
- `ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx']` —— 避免误扫 JS/TS 文件。

带 secondary options 的规则示例：`declaration-block-no-duplicate-properties` 启用并忽略 `consecutive-duplicates-with-different-values`（兼容响应式写法）；`selector-pseudo-class-no-unknown` 忽略 `global` / `local` / `export`（CSS Modules 场景）；`unit-no-unknown` 忽略 `rpx`（小程序/移动端长度单位）。

`index.js:1-87` 是行为不变层；所有改动集中在 `package.json` 与 `README.md`。

### Manifest fields (publish-readiness state, see `package.json`)

| Field | Value | Rationale |
|-------|-------|-----------|
| `type` | `"commonjs"` | 显式声明，避免未来误改 `package.json` 全局 `type` 时漂移 |
| `version` | `"2.0.0"` | 从 `1.0.10` 经 `1.1.0` bump 到 **`2.0.0`**（major：peerDependencies 收窄是 breaking change——`stylelint: >=8.3.0`/`stylelint-scss: >=2.0.0` → `^14.0.0`/`^4.0.0`）。semver 要求 major bump 才是诚实的版本信号 |
| `license` | `"MIT"` | **修复历史 mismatch**：`package.json` 原写 `"ISC"`，但根 `LICENSE` 与本包复制的 LICENSE 内容均为 MIT；现统一为 MIT |
| `description` | `"Shareable stylelint config enforcing CSS/SCSS standards with strict style and SCSS-aware rules"` | 提升 npm 搜索可发现性（原 `"CSS规范"` 过短） |
| `keywords` | `["stylelint","css","scss","stylesheet","lint","shareable-config"]` | 替换原 `[]`（包原本没有任何 keywords 字段） |
| `homepage` | `"https://github.com/Graham-Sun/re-spec/tree/main/packages/stylelint-config#readme"` | 锚定到 monorepo 内本包的 README 路径 |
| `repository.directory` | `"packages/stylelint-config"` | monorepo 包级 GitHub 链接指向正确子目录 |
| `peerDependencies` | `{ "stylelint": "^14.0.0", "stylelint-scss": "^4.0.0" }` | 范围比原 `>=8.3.0` / `>=2.0.0` 收窄以匹配主流活跃版本；dev pin 仍为测试过的 `^14.3.0` / `^4.1.0` |
| `devDependencies` | `{ "jest": "^29.5.0", "stylelint": "^14.3.0", "stylelint-scss": "^4.1.0" }` | 测试锁定版本 |
| `engines.node` | `">=14"` | 与 stylelint 14 / jest 29 / Node 主流活跃 LTS 一致 |
| `files` | `["index.js", "README.md", "LICENSE"]` | 白名单：npm 仅打包这三份文件。`codemap.md`、`__tests__/`、`test/` 自动被排除 |
| `publishConfig.access` | `"public"` | 显式 public |
| `publishConfig.registry` | — (未设置) | 由根 `package.json` 与 `lerna.json` 统一提供 |
| `scripts.test` | `"node ./__tests__/smoke.js && jest && node ./__tests__/smoke-cli.js"` | 三层验证：Node 形态 → jest 引擎 → stylelint CLI 引擎。所有测试文件统一在 `__tests__/` 下（2026-07-24 审查修复：原 `test/` 目录已删除，文件合并到 `__tests__/`） |
| `LICENSE` | 包内副本（`packages/stylelint-config/LICENSE`） | npm 不会自动从仓库根复制 LICENSE；必须物理拷贝 |

## Flow

1. 消费方在其项目根的 `.stylelintrc`（JSON / JS / YAML）中声明 `"extends": "stylelint-config-re"`（npm 消费）或相对路径指向本包入口。
2. stylelint 启动时合并配置：先加载 `stylelint-config-re`，再叠加消费方自定义 `rules`（消费方覆盖优先级更高）。
3. `plugins: ['stylelint-scss']` 在此阶段被解析，注册 `scss/*` 规则命名空间。
4. CLI / 编辑器集成对仓库内 `**/*.{css,scss,sass}` 应用规则，按 `defaultSeverity` 与每条规则的 severity 报告问题；`ignoreFiles` 模式命中的文件被跳过。
5. 本仓库的根 `.stylelintrc` 内容为 `{ "extends": "./packages/stylelint-config/index.js" }`，直接以工作区路径引入，作为 monorepo 内统一基线。
6. 本包的 `npm test`（通过 `lerna run test` 触发）执行三层验证：
   - Layer 1 `test/smoke.js` — 直接 `require('../')` 并用 `assert` 锁定 `defaultSeverity`、plugins、rules 关键字段（`at-rule-no-unknown === null`、`scss/at-rule-no-unknown === true`、`max-line-length === 100`、`declaration-block-trailing-semicolon` 含 `severity: 'error'`、`ignoreFiles` 含 `**/*.js`/`**/*.ts`）。
   - Layer 2 `__tests__/rules-validate.test.js` — jest，5 个 case（`index.css` / `sass-test.scss` / `less-test.less` / `css-module.scss` / `essential.css`），通过 `stylelint.lint()` 真实跑引擎。
   - Layer 3 `test/smoke-cli.js` — `child_process.spawnSync` 直接调 `bin/stylelint.js`，临时 `.stylelintrc.json` 指向 `../index.js`，跑 3 个 fixture（`index.css`/`css-module.scss` 期望 exit 0；`bad.css` 期望 exit 2）。

## Integration

- 与根 `.stylelintrc` 一对一耦合：根配置是该包的唯一直接消费点，体现 "集中定义、就近继承" 的 monorepo 策略。
- 与同类 lint 包保持一致的命名与结构：`packages/eslint-config`、`packages/commitlint-config`、`packages/markdownlint-config` 均采用 `*-config-re` 命名、单一入口导出、`peerDependencies` 声明宿主工具的形态；本包遵循相同模式，仅宿主由 ESLint/Commitlint/Markdownlint 换为 stylelint + stylelint-scss。
- 测试通过 `__tests__/rules-validate.test.js` 与 `test/smoke.{js,cli.js}` 在 `npm test` 下依次执行，验证导出的配置对象是合法 stylelint 配置（含规则键、插件数组、严重度等）。Git head 字段透出 monorepo 的 lerna 链路，供版本同步使用。
- 根 `pnpm-lock.yaml` 通过 pnpm 将 `stylelint@14.16.1` 与 `jest@29.7.0` 提升至根 `node_modules/`；自测脚本通过目录向上回溯找到该二进制（pnpm hardlink）。

## Publish readiness (verified 2026-07-24)

- `version` 已 bump `1.0.10` → `2.0.0`（major：peerDependencies 收窄是 breaking change；经 `1.1.0` 步骤中转后定稿 `2.0.0`）。
- `npm pack ./packages/stylelint-config` → tarball `stylelint-config-re-1.1.0.tgz`，3.3 kB，4 个文件：`LICENSE`、`README.md`、`index.js`、`package.json`。
- `npm publish --dry-run ./packages/stylelint-config --registry=https://registry.npmjs.org/` → exit 0；"Publishing to https://registry.npmjs.org/ with tag latest and public access (dry-run)"。
- 自测三层全 PASS（Layer 1 形态 / Layer 2 jest 5/5 / Layer 3 CLI 3/3）。
- 实际发布前唯一剩余步骤：用户执行 `npm publish --access=public`（认证已在 `npm whoami` 中确认 `sophiaa`）。
- 验证记录见 `.slim/deepwork/stylelint-config-re-publish-readiness.md`。