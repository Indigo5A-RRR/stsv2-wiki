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

console.log("完成！请执行以下命令推送到 Gitee：");
console.log("  git add docs");
console.log("  git commit -m \"Update Gitee Pages\"");
console.log("  git push gitee main");
