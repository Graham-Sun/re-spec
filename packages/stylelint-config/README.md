# stylelint-config-re

Enforces CSS/SCSS standards via a curated stylelint config: default severity `warning` with `declaration-block-trailing-semicolon` promoted to `error`; possible-errors category enabled (with `at-rule-no-unknown` overridden by the SCSS plugin to allow `@use`/`@forward`/`@mixin`/`@include`); stylistic rules for 2-space indent, brace placement, lowercase short hex, 100-char line limit; CSS Modules pseudo-class ignores (`global`/`local`/`export`); `rpx` (WeChat mini-program) allowed as a length unit.

## 安装

需要先行安装 [stylelint](https://www.npmjs.com/package/stylelint) 和 [stylelint-scss](https://www.npmjs.com/package/stylelint-scss)：

```bash
npm install stylelint-config-re stylelint stylelint-scss --save-dev
```

> Requires `stylelint@^14.0.0` and `stylelint-scss@^4.0.0` as peer dependencies.

## 使用

在 `.stylelintrc` 中继承本包：

```json
{
  "extends": "stylelint-config-re"
}
```

(JS or YAML equivalents also work — stylelint reads `.stylelintrc.js` / `.stylelintrc.yaml` / `.stylelintrc.json` / `stylelint.config.js`.)

## 验证配置

需要查看合并后的完整配置时，可以打印出来：

```bash
npx stylelint --print-config "**/*.css" > /tmp/stylelint-config.json
```

## 测试

本包自带三层验证。运行 `npm test`（包目录下）会依次执行：

1. Node 形态检查（`__tests__/smoke.js`）—— 直接 `require('../index.js')` 并断言关键字段。
2. Jest 套件（`__tests__/rules-validate.test.js`）—— 用真实 stylelint 对 5 个 fixture 跑规则：CSS / SCSS / LESS / CSS Modules / essential。
3. CLI 引擎检查（`__tests__/smoke-cli.js`）—— 调用 stylelint CLI 引擎验证 2 个 clean fixture（`index.css`/`css-module.scss` → exit 0）和 1 个反向 fixture（`bad.css` 缺尾分号触发 `declaration-block-trailing-semicolon` 错误 → exit 2）。

## License

MIT © 2024 sophiaa