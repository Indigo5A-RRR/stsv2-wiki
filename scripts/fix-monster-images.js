/**
 * 将怪物图片路径从本地 /monster-images/xxx.png 改为 sts2.runthesim.ai 外部 CDN
 * 注意：sts2.runthesim.ai 的 /assets/monster-images/ 路径返回 HTML 而非图片，不可用！
 * 请使用本地图片（来自游民星空爬取），运行 revert 脚本恢复：
 *   node scripts/revert-monster-images-to-local.js
 * 运行: node scripts/fix-monster-images.js
 */
const fs = require("fs");
const path = require("path");

const MONSTERS_PATH = path.join(__dirname, "../data/monsters.json");
const CDN_BASE = "https://sts2.runthesim.ai/assets/monster-images";

const monsters = JSON.parse(fs.readFileSync(MONSTERS_PATH, "utf-8"));
let count = 0;

for (const m of monsters) {
  if (m.image && m.image.startsWith("/monster-images/")) {
    const filename = m.image.replace("/monster-images/", "");
    const baseName = filename.replace(/\.(png|webp|jpg|jpeg)$/i, "");
    m.image = `${CDN_BASE}/${baseName}.webp`;
    count++;
  }
}

fs.writeFileSync(MONSTERS_PATH, JSON.stringify(monsters, null, 2), "utf-8");
console.log(`已更新 ${count} 个怪物的图片地址为 CDN`);
