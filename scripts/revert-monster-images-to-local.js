/**
 * 将怪物图片从 sts2.runthesim.ai CDN 改回本地 public/monster-images
 * CDN 的 monster-images 路径返回 HTML 而非图片，导致全部显示「暂无图片」
 * 本地图片来自游民星空爬取，存放在 public/monster-images/
 * 运行: node scripts/revert-monster-images-to-local.js
 */
const fs = require("fs");
const path = require("path");

const MONSTERS_PATH = path.join(__dirname, "../data/monsters.json");
const MONSTER_IMAGES_DIR = path.join(__dirname, "../public/monster-images");

const monsters = JSON.parse(fs.readFileSync(MONSTERS_PATH, "utf-8"));
const existingFiles = new Set(fs.readdirSync(MONSTER_IMAGES_DIR));
let count = 0;
let fallbackCount = 0;

for (const m of monsters) {
  if (!m.image) continue;
  if (m.image.startsWith("https://sts2.runthesim.ai/assets/monster-images/")) {
    const baseName = m.image.replace("https://sts2.runthesim.ai/assets/monster-images/", "").replace(/\.(webp|png|jpg|jpeg)$/i, "");
    const pngName = `${baseName}.png`;
    const localPath = existingFiles.has(pngName) ? pngName : (existingFiles.has(m.id + ".png") ? m.id + ".png" : pngName);
    m.image = `/monster-images/${localPath}`;
    count++;
    if (!existingFiles.has(pngName) && !existingFiles.has(m.id + ".png")) {
      fallbackCount++;
    }
  }
}

fs.writeFileSync(MONSTERS_PATH, JSON.stringify(monsters, null, 2), "utf-8");
console.log(`已更新 ${count} 个怪物的图片为本地路径`);
if (fallbackCount > 0) {
  console.log(`注意: ${fallbackCount} 个怪物使用 id 作为文件名，请检查 public/monster-images 是否有对应文件`);
}
