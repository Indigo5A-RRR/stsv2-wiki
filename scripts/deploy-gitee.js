/**
 * 构建并复制到 docs 目录，供 Gitee Pages 部署
 * 运行: node scripts/deploy-gitee.js
 * 仓库名非 stsv2-wiki 时: BASE_PATH=/你的仓库名 node scripts/deploy-gitee.js
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// 默认 basePath 为 /stsv2-wiki，与 Gitee 仓库名对应
process.env.BASE_PATH = process.env.BASE_PATH || "/stsv2-wiki";

const root = path.join(__dirname, "..");
const outDir = path.join(root, "out");
const docsDir = path.join(root, "docs");

console.log("正在构建 Next.js 静态站点 (basePath:", process.env.BASE_PATH, ")...");
execSync("npm run build", { cwd: root, stdio: "inherit", env: { ...process.env } });

if (!fs.existsSync(outDir)) {
  console.error("错误：构建输出目录 out 不存在");
  process.exit(1);
}

console.log("正在复制到 docs 目录...");
if (fs.existsSync(docsDir)) {
  fs.rmSync(docsDir, { recursive: true });
}
fs.cpSync(outDir, docsDir, { recursive: true });

// GitHub Pages / Gitee Pages: 404 回退到 index，实现 SPA 路由
const indexPath = path.join(docsDir, "index.html");
const notFoundPath = path.join(docsDir, "404.html");
if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log("已创建 404.html（SPA 回退）");
}

// GitHub Pages: 禁用 Jekyll，否则会忽略 _next 目录
const noJekyllPath = path.join(docsDir, ".nojekyll");
fs.writeFileSync(noJekyllPath, "", "utf-8");
console.log("已创建 .nojekyll");

console.log("完成！推送到 Gitee: git add docs && git commit -m \"Update\" && git push gitee main");
console.log("推送到 GitHub: git add docs && git commit -m \"Update\" && git push origin main");
