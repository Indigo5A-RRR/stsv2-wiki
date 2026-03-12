/**
 * 从游戏解包文件 card_atlas.tpsheet 提取卡牌角色/分类
 * 无需网络，直接使用 D:\projects\sts2_extracted 中的资源
 * 运行: node scripts/extract-card-metadata-from-tpsheet.js
 */

const fs = require("fs");
const path = require("path");

const TPSHEET =
  process.env.STS2_TPSHEET ||
  "D:\\projects\\sts2_extracted\\images\\atlases\\card_atlas.tpsheet";
const OUTPUT = path.join(__dirname, "..", "data", "card_metadata.json");

const POOL_TO_CLASS = {
  ironclad: "Ironclad",
  silent: "Silent",
  defect: "Defect",
  regent: "Regent",
  necrobinder: "Necrobinder",
  colorless: "Colorless",
  curse: "Curse",
  event: "Event",
  token: "Token",
  status: "Status",
  quest: "Quest",
  ancient: "Ancient",
};

function filenameToCardId(filename) {
  // "ironclad/break.png" -> "break"
  // "event/beta/apparition.png" -> "apparition"
  // "curse/ascenders_bane.png" -> "ascenders_bane"
  const base = path.basename(filename, ".png");
  return base.replace(/-/g, "_");
}

function extractPool(filename) {
  const parts = filename.split("/");
  if (parts.length >= 2) return parts[0].toLowerCase();
  if (filename.startsWith("ancient_")) return "ancient";
  return null;
}

function main() {
  if (!fs.existsSync(TPSHEET)) {
    console.error("未找到 tpsheet:", TPSHEET);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(TPSHEET, "utf-8"));
  const raw = {};
  for (const tex of data.textures || []) {
    for (const sprite of tex.sprites || []) {
      const filename = sprite.filename;
      if (!filename || !filename.endsWith(".png")) continue;

      const pool = extractPool(filename);
      const cardId = filenameToCardId(filename);
      if (!pool || !cardId) continue;

      const isBeta = filename.includes("/beta/");
      if (!raw[cardId] || (!isBeta && raw[cardId].isBeta)) {
        raw[cardId] = { pool, isBeta };
      }
    }
  }

  const metadata = {};
  for (const [cardId, { pool }] of Object.entries(raw)) {
    let classVal = POOL_TO_CLASS[pool] || pool;
    if (pool === "event") {
      const name = cardId.toLowerCase();
      if (["apotheosis", "brightest_flame", "maul", "neows_fury", "relax", "whistle", "wish"].includes(name)) {
        classVal = "Ancient";
      }
    }
    if (pool === "curse") classVal = "Curse";
    else if (pool === "token") classVal = "Status";

    metadata[cardId] = {
      class: classVal,
      type: "skill",
      cost: 0,
      rarity: "common",
    };
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(metadata, null, 2), "utf-8");
  console.log(`已从 tpsheet 提取 ${Object.keys(metadata).length} 条卡牌元数据 -> ${OUTPUT}`);
}

main();
