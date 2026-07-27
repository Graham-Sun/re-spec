# markdownlint-config-re

Enforces Markdown conventions via a curated markdownlint config: defaults on, with explicit overrides for `ul-style: dash`, `no-trailing-spaces` (`br_spaces: 0`, `list_item_empty_lines: false`), and disables `line-length` / `no-duplicate-header` / `no-inline-html` / `list-marker-space` for flexibility with Chinese-language docs and embedded HTML. Includes a ~80-name `proper-names` whitelist (JavaScript, Node.js, webpack, GitHub, Chrome, iOS, Apache, etc.) with `code_blocks: false` so casing inside code fences is not enforced.

## 安装

需要先行安装 [markdownlint](https://www.npmjs.com/package/markdownlint)：

```bash
npm install @sophiaa/markdownlint-config-re markdownlint --save-dev
```

> Requires `markdownlint@^0.28.1` as a peer dependency.

## 使用

在 `.markdownlint.json` 中继承本包：

```json
{
  "extends": "@sophiaa/markdownlint-config-re"
}
```

(`.markdownlint.json` / `.markdownlint.yaml` / `.markdownlintrc.js` / `.markdownlintrc` all work; markdownlint resolves the config via its own config-loader.)

## 验证配置

查看合并后的完整规则集：

```bash
npx markdownlint --help
# 或在项目根运行：
npx markdownlint "**/*.md"
```

> CLI 由独立的 `markdownlint-cli` / `markdownlint-cli2` 包提供；本包只发布配置，CLI 由消费方自行选择。

## 测试

本包自带两层验证。运行 `npm test`（包目录下）会依次执行：

1. Node 形态检查（`test/smoke.js`）—— 直接 `require('../index.json')` 并断言关键字段（`default: true`、`ul-style: dash`、`proper-names.names` 包含 `JavaScript`/`Node.js`/`webpack` 等）。
2. 引擎检查（`test/smoke-engine.js`）—— 通过 `markdownlint.sync()` 库 API 对 2 个 fixture（`good.md` / `bad.md`）跑规则引擎；`good.md` 期望 ≤0 errors，`bad.md` 期望 ≥1 error（实测 4 个 errors：2 个 `ul-style` 违规 + 2 个 `no-trailing-spaces` 违规）。

## License

MIT © 2024 sophiaa