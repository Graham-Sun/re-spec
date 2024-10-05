# re-spec

前端编码规范工程化

## :couch_and_lamp: 配套工具

引入了多个业界流行的 `Linter` 作为规范文档的配套工具，并根据规范内容定制了对应的规则包，它们包括：

| 规范                                                              | Lint 工具                                                      | npm 包                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| JavaScript 编码规范 <br/> TypeScript 编码规范 <br/> Node 编码规范 | [ESLint](https://eslint.org/)                                  | [eslint-config-encode](https://www.npmjs.com/package/eslint-config-encode)             |
| CSS 编码规范                                                      | [stylelint](https://stylelint.io/)                             | [stylelint-config-encode](https://www.npmjs.com/package/stylelint-config-encode)       |
| Git 规范                                                          | [commitlint](https://commitlint.js.org/#/)                     | [commitlint-config-encode](https://www.npmjs.com/package/commitlint-config-encode)     |
| 文档规范                                                          | [markdownlint](https://github.com/DavidAnson/markdownlint)     | [markdownlint-config-encode](https://www.npmjs.com/package/markdownlint-config-encode) |
| Eslint 插件                                                       | [ESlint Plugin](https://eslint.org/docs/latest/extend/plugins) | [eslint-plugin-encode](https://www.npmjs.com/package/eslint-plugin-encode)             |

## 其他

## 测试`markdown config`

全局安装`markdownlint-cli`

```bash
npm i -g markdownlint-cli
pnpm run lint
```

### 生成`CHANGELOG`

参考[conventional-changelog-cli](https://www.npmjs.com/package/conventional-changelog-cli)，全局安装`conventional-changelog-cli`：

```bash
npm install -g conventional-changelog-cli
pnpm run changelog
```

## :email: 联系

- **简书**: <https://www.jianshu.com/u/a45f405ae390>
<!-- - **前端编码规范工程化** <https://encode-studio-fe.github.io/fe-spec/> -->
- **GitHub**: <https://github.com/Graham-Sun/re-spec>

</br>
