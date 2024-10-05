# `commitlint-config`

> Git 规范

支持配套的 [commitlint 配置](https://commitlint.js.org/#/concepts-shareable-config)，用于对 `git commit message` 进行校验。

## 安装

使用时，需要安装 [@commitlint/cli](https://www.npmjs.com/package/@commitlint/cli)：

```bash
npm install commitlint-config-re @commitlint/cli --save-dev
```

## 使用

在 `commitlint.config.js` 中集成本包:

```javascript
module.exports = {
  extends: ['re'],
};
```

## 设置 git hook

可通过 [husky](https://www.npmjs.com/package/husky) 设置在 `git commit` 时触发 `commitlint`。

首先安装 husky：

```bash
npm install husky --save-dev
```

然后执行添加`commit-msg`:(适用于mac)

```bash
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

## ps:

如果是命令无效需要自己并初始化并创建文件

在package.json/scripts里添加 "prepare": "husky install"并执行

```bash
npm run prepare
```

在.husky文件夹下创建commit-msg,写入指令 npx commitlint --edit $1

更多信息可参考 [commitlint 文档](https://commitlint.js.org/#/guides-local-setup?id=install-husky)。
```
