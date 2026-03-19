/**
 * 修复附魔图标：public/enchantment-icons/*.webp 实际是 HTML 文件，会导致图片加载失败和页面异常
 * 移除假文件，将 enchantments.json 中的 image 设为空（显示「暂无图片」）
 * 运行: node scripts/fix-enchantment-icons.js
 */
const fs = require("fs");
const path = require("path");

const ENCHANTMENTS_PATH = path.join(__dirname, "../data/enchantments.json");
const ICONS_DIR = path.join(__dirname, "../public/enchantment-icons");

const enchantments = JSON.parse(fs.readFileSync(ENCHANTMENTS_PATH, "utf-8"));

// 清空所有附魔的 image，避免请求假 webp
for (const e of enchantments) {
  e.image = "";
}

fs.writeFileSync(ENCHANTMENTS_PATH, JSON.stringify(enchantments, null, 2), "utf-8");

// 移除假的 .webp 文件（实为 HTML）
if (fs.existsSync(ICONS_DIR)) {
  const files = fs.readdirSync(ICONS_DIR);
  let removed = 0;
  for (const f of files) {
    if (f.endsWith(".webp")) {
      const filePath = path.join(ICONS_DIR, f);
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.trim().startsWith("<!DOCTYPE") || content.trim().startsWith("<html")) {
        fs.unlinkSync(filePath);
        removed++;
      }
    }
  }
  console.log(`已移除 ${removed} 个假 webp 文件`);
}

console.log("已清空 enchantments.json 中的 image 字段");
