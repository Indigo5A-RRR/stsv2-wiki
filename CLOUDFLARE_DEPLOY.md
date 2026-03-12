# Cloudflare Pages 部署指南

## 一、连接 GitHub 仓库

1. 打开 [dash.cloudflare.com](https://dash.cloudflare.com)
2. 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择 **GitHub**，授权 Cloudflare 访问
4. 选择仓库 **Indigo5A-RRR/stsv2-wiki**

## 二、构建配置

项目已包含 `wrangler.toml`，会自动指定输出目录为 `out`。

在配置页面填写：

| 配置项 | 值 |
|--------|-----|
| **Production branch** | `main` |
| **Framework preset** | `None`（重要！不要选 Next.js） |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Deploy command** | **留空**（不要填 wrangler deploy，让 Cloudflare 自动上传） |
| **Root directory** | 留空 |

**环境变量**（必填，Next.js 16 需要 Node 20+）：
- `NODE_VERSION` = `20`

## 三、部署

点击 **Save and Deploy**，等待构建完成（约 2–3 分钟）。

## 四、访问地址

部署完成后，默认地址为：
**https://stsv2-wiki.pages.dev**

可在 Pages 项目设置中修改项目名称以更改域名。

## 五、后续更新

每次推送到 `main` 分支，Cloudflare 会自动重新部署。
