# 发布编辑器包

`@zrlog/editor` 发布到 npmjs。与 frontend-common 一样，使用手动 GitHub Actions 和标准 npm 命令发布；本工程继续用 Yarn 1 与 `yarn.lock` 安装开发依赖。

## 首次配置

- npmjs 账号具有 `@zrlog` scope 的包创建、发布权限。
- 在 `zrlog/zrlog-editor` 的 Actions Secrets 配置 `NPM_PUBLISH_SECRET`，使用有目标包或组织发布权限、允许无人值守发布的 npm granular access token。不要把 token 写入代码、包或日志。
- `package.json` 的 `publishConfig` 指定 npmjs registry 与 public access。首次 npm 版本为 `2.1.33`，实际发布前消费者不能安装该版本。

## 发布

1. 后续版本执行 `npm version 2.1.34 --no-git-tag-version`，自动同步编辑器帮助中的版本号。更新变更日志；依赖有变化时运行 `yarn install` 并提交 `yarn.lock`。
2. 运行 `npm test` 和 `npm run pack`，用 `.tmp/packages/zrlog-editor-<version>.tgz` 验证消费者。包测试检查实际 tarball、类型入口、浏览器构建和独立 Markdown 渲染。
3. 提交并推送源码，手动运行 **Publish editor package**。工作流只接受稳定版本，安装锁定依赖、运行测试后执行 `npm publish --access public`，凭据通过 `NODE_AUTH_TOKEN` 注入。
4. 确认 `npm view @zrlog/editor@<version> version --registry=https://registry.npmjs.org/` 返回目标版本，再升级消费者并提交锁文件。

`sh shell/version.sh 2.1.34`（也兼容 `34`）可一次完成本地版本更新、测试和打包。脚本不会创建提交、标签或推送；npm 发布由手动 workflow 完成。已发布版本不可覆盖，修正需要递增版本。

## 消费者

新消费者使用 `@zrlog/editor` 根入口及其类型；React、React DOM、Ant Design、React Router DOM、styled-components 为 peer dependencies，由宿主提供兼容版本。

后台可以保留现有导入路径，通过 alias 替换原来的 GitHub raw tarball 依赖：

```sh
yarn add --exact @editor@npm:@zrlog/editor@2.1.33
yarn type-check
yarn build
```

对应依赖为 `"@editor": "npm:@zrlog/editor@2.1.33"`。本地 tarball 仅用于联调，不作为正式路径依赖提交。

独立渲染通过 `require('@zrlog/editor/markdown')` 或 `import {markdownToHtml} from '@zrlog/editor/markdown'` 使用。
Java / Polyglot 可在构建时下载 npm tarball 并提取无外部 JS 依赖的 UMD 文件：

```sh
npm pack @zrlog/editor@2.1.33 --registry=https://registry.npmjs.org/
tar -xzf zrlog-editor-2.1.33.tgz package/dist/markdown/zrlog-markdown.umd.js
```

历史 `artifacts/` 文件继续保留，新版本只发布到 npmjs。演示站仍由 Pages workflow 单独部署。
