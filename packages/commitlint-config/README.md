# commitlint-config-re

> Git 规范

Enforces Conventional Commits header/body/footer conventions: 100-character limits on header, body, and footer; lowercase type and scope; restricted type enum (`feat`, `fix`, `docs`, `style`, `test`, `refactor`, `chore`, `revert`); subject required, not ending with a period; body/footer preceded by a blank line.

## 安装

使用时，需要安装 [@commitlint/cli](https://www.npmjs.com/package/@commitlint/cli)：

```bash
npm install @sophiaa/commitlint-config-re @commitlint/cli --save-dev
```

> Requires `@commitlint/cli@^17.0.0` as a peer dependency.

## 使用

在 `commitlint.config.js` 中集成本包。**注意：`extends` 必须使用短名 `'re'`，而不是包的全名 `'commitlint-config-re'`** —— 这是 Commitlint 的 shareable-config 命名约定：包名形如 `commitlint-config-<scope>`，消费者写 `extends: ['<scope>']`。写全名会导致 `Cannot find module "conventional-changelog-lint-config-<...>"` 错误。

```javascript
module.exports = {
  extends: ['re'],
};
```

## 设置 git hook

可通过 [husky](https://www.npmjs.com/package/husky) 设置在 `git commit` 时触发 `commitlint`。安装并初始化 husky：

```bash
npm install --save-dev husky
npx husky init
```

然后手动创建或替换 `.husky/commit-msg` 的内容：

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx commitlint --edit $1
```

在 Unix 系统上，可能还需要执行 `chmod +x .husky/commit-msg`。

## License

MIT © 2024 sophiaa
