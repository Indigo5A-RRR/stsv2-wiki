/**
 * 从 sts2.runthesim.ai 获取卡牌元数据（角色、类型、费用、稀有度）
 * 逐张抓取每张卡牌详情页以获取完整数据。需要网络连接。
 * 运行: node scripts/fetch-card-metadata.js
 */

const fs = require("fs");
const path = require("path");

const INPUT =
  process.env.STS2_LOCALIZATION ||
  "D:\\projects\\sts2_extracted\\localization\\zhs\\cards.json";
const OUTPUT = path.join(__dirname, "..", "data", "card_metadata.json");
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : 0; // 0 = 全部
const BASE_URL = "https://sts2.runthesim.ai/cards";

function toRunthesimId(gameId) {
  return gameId.toLowerCase().replace(/'/g, "").replace(/\s+/g, "_");
}

const POOL_TO_CLASS = {
  ironclad: "Ironclad",
  silent: "Silent",
  defect: "Defect",
  regent: "Regent",
  necrobinder: "Necrobinder",
  colorless: "Colorless",
};

function parseCardPage(html) {
  const meta = { class: "Unknown", type: "skill", cost: 0, rarity: "common" };
  // runthesim 页面内嵌 JSON：pool:"silent", cardType:"Power", baseCost:3, rarity:"Rare"
  const poolMatch = html.match(/pool:\s*["']([a-z]+)["']/i);
  if (poolMatch) meta.class = POOL_TO_CLASS[poolMatch[1].toLowerCase()] || poolMatch[1];
  const typeMatch = html.match(/cardType:\s*["']([^"']+)["']/i);
  if (typeMatch) meta.type = typeMatch[1].charAt(0).toUpperCase() + typeMatch[1].slice(1).toLowerCase();
  const costMatch = html.match(/baseCost:\s*(\d+)/i);
  if (costMatch) meta.cost = parseInt(costMatch[1], 10);
  const rarityMatch = html.match(/rarity:\s*["']([^"']+)["']/i);
  if (rarityMatch) meta.rarity = rarityMatch[1].toLowerCase();
  return meta;
}

async function fetchOneCard(cardId) {
  const url = `${BASE_URL}/${cardId}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    const html = await res.text();
    return parseCardPage(html, cardId);
  } catch (e) {
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchMetadata() {
  const raw = JSON.parse(fs.readFileSync(INPUT, "utf-8"));
  const cardIds = new Set();
  for (const key of Object.keys(raw)) {
    const m = key.match(/^([A-Z0-9_]+)\.(title|description)$/);
    if (m) cardIds.add(m[1]);
  }
  if (cardIds.size === 0) {
    console.error("未从 localization 解析到卡牌 ID，请检查路径:", INPUT);
    process.exit(1);
  }

  const metadata = {};
  let ids = [...cardIds];
  if (LIMIT > 0) ids = ids.slice(0, LIMIT);
  const runthesimIds = ids.map((id) => toRunthesimId(id));

  console.log(`正在获取 ${ids.length} 张卡牌的元数据...`);
  for (let i = 0; i < runthesimIds.length; i++) {
    const rsId = runthesimIds[i];
    const gameId = ids[i];
    const meta = await fetchOneCard(rsId);
    if (meta && meta.class !== "Unknown") {
      metadata[rsId] = meta;
    }
    if ((i + 1) % 50 === 0) console.log(`  已处理 ${i + 1}/${ids.length}`);
    await sleep(80);
  }

  // 角色专属 Defend/Strike 从 ID 推断
  for (const id of ids) {
    const rsId = toRunthesimId(id);
    if (metadata[rsId]) continue;
    if (id.startsWith("DEFEND_")) {
      const char = id.replace("DEFEND_", "");
      const charMap = { IRONCLAD: "Ironclad", SILENT: "Silent", DEFECT: "Defect", NECROBINDER: "Necrobinder", REGENT: "Regent" };
      metadata[rsId] = { class: charMap[char] || char, type: "Skill", cost: 1, rarity: "basic" };
    } else if (id.startsWith("STRIKE_")) {
      const char = id.replace("STRIKE_", "");
      const charMap = { IRONCLAD: "Ironclad", SILENT: "Silent", DEFECT: "Defect", NECROBINDER: "Necrobinder", REGENT: "Regent" };
      metadata[rsId] = { class: charMap[char] || char, type: "Attack", cost: 1, rarity: "basic" };
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(metadata, null, 2), "utf-8");
  console.log(`已保存 ${Object.keys(metadata).length} 条元数据 -> ${OUTPUT}`);
  return metadata;
}

fetchMetadata().catch((err) => {
  console.error("获取失败:", err.message);
  process.exit(1);
});
