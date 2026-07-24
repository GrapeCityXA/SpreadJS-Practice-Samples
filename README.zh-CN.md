# SpreadJS 实战示例代码库

本仓库整理了一组 SpreadJS 官方精选实践示例，并将示例代码按便于浏览和运行的方式放在本地目录中。示例目录参考公开的葡萄城在线 demo 菜单，方便用户对照查看：

https://demo.grapecity.com.cn/spreadjs/practice/welcome

目标是让常见 SpreadJS 实战场景更容易检索、运行、学习和复用。

English version: [README.md](README.md).

## 仓库内容

- `samples/`：按示例分类和 demo slug 组织的本地代码目录。
- `samples/shared/`：保存可运行 demo 复用的运行时配置。
- `docs/demo-catalog.md`：列出可查看的示例，并提供在线示例链接。
- `samples/_template/`：展示一个可运行本地 demo 的推荐结构。

## 快速开始

1. 在 `docs/demo-catalog.md` 中查找目标 demo。
2. 进入 `samples/<分类>/<demo-slug>/` 对应目录。
3. 阅读该 demo 的 `README.md`。
4. 按本地 README 运行示例。

使用本地开发服务器时，建议从仓库根目录或 `samples/` 目录启动，确保浏览器可以访问 `samples/shared/` 下的共享运行时配置。

部分目录初期可能只包含在线示例链接，本地代码会逐步整理补充。

## 示例约定

每个完整 demo 建议包含：

- `README.md`：说明功能目标、在线示例链接、文件结构、运行方式和关键实现点。
- `index.html`：静态 demo 的浏览器入口。
- `src/app.js` 或等价源码文件。
- `src/styles.css`：需要自定义样式时使用。
- `assets/`：保存本示例所需的数据、图片、工作簿、字体等资源。

目录名保持与来源 URL slug 一致。若来源 slug 存在拼写问题，仍优先保留原 slug，便于对照；可在 demo README 中补充正确写法。

静态 demo 默认复用 `samples/shared/systemjs.config.js`。只有 demo 存在确实不同的加载需求时，才单独添加专用配置。

## 依赖约定

可运行 demo 应在本地 `package.json` 中声明运行时依赖，并从 `node_modules` 加载资源。对外发布的 demo 不应使用葡萄城 CDN 或其他公共 CDN 作为运行时依赖来源。

SpreadJS 包版本应在各 demo 中保持一致。若 demo 需要 IO、Designer、PDF、Charts 等扩展能力，应显式添加对应的 `@grapecity-software/*` 包。

## SpreadJS 授权说明

SpreadJS 是葡萄城的商业产品。本仓库不应提交私有 license key，也不应提交未经允许分发的专有资源。需要用户自行配置的内容，应写在对应 demo 的 README 中。
