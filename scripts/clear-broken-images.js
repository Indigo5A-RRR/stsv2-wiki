/**
 * 将 cards/relics/potions 中指向 sts2.runthesim.ai 的失效图片 URL 置空，
 * 使 CardImage 显示「暂无图片」而非加载失败。
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const BROKEN_PATTERN = /"image":\s*"https:\/\/sts2\.runthesim\.ai\/[^"]*"/g;

const files = ["cards.json", "relics.json", "potions.json"];

for (const file of files) {
  const filePath = path.join(DATA_DIR, file);
  let content = fs.readFileSync(filePath, "utf8");
  const matches = content.match(BROKEN_PATTERN) || [];
  content = content.replace(BROKEN_PATTERN, '"image": ""');
  fs.writeFileSync(filePath, content);
  console.log(`${file}: cleared ${matches.length} broken image URLs`);
}
