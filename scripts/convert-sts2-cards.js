/**
 * 将 STS2 游戏 localization/cards.json 转换为百科使用的 cards.json 格式
 * 运行: node scripts/convert-sts2-cards.js
 */

const fs = require("fs");
const path = require("path");

const INPUT = "D:\\projects\\sts2_extracted\\localization\\zhs\\cards.json";
const OUTPUT = path.join(__dirname, "..", "data", "cards.json");
const META_PATH = path.join(__dirname, "..", "data", "card_metadata.json");
const DLL_DATA_PATH = path.join(__dirname, "..", "data", "card_data_from_dll.json");

// 用 vars 替换描述中的 {VarName:diff()}，vars 为 { VarName: value }
function replaceVarsInText(text, vars) {
  if (!text) return "";
  let out = text;
  for (const [name, val] of Object.entries(vars || {})) {
    const re = new RegExp(`\\{${name}:diff\\(\\)\\}`, "g");
    out = out.replace(re, String(val));
  }
  return out;
}

// 清理描述中的模板标记，支持 base/upgraded 两版
function processDescription(rawDesc, varsBase, varsUpgraded) {
  const base = varsBase || {};
  const upgraded = varsUpgraded || base;

  function clean(text, useUpgraded) {
    if (!text) return "";
    const vars = useUpgraded ? upgraded : base;
    let out = replaceVarsInText(text, vars);
    out = out
      .replace(/\[gold\](.*?)\[\/gold\]/g, "$1")
      .replace(/\{([^}:]+):diff\(\)\}/g, (_, name) => (vars && vars[name] !== undefined) ? String(vars[name]) : "?")
      .replace(/\{[^}]+:energyIcons\(\)\}/g, "能量")
      .replace(/\{[^}]+:energyIcons\(1\)\}/g, "1能量")
      .replace(/\{[^}]+:starIcons\(\)\}/g, "星能")
      .replace(/\{singleStarIcon\}/g, "星能")
      .replace(/\{Energy:energyIcons\(\)\}/g, "能量")
      .replace(/\{Cards:plural:([^|]+)\|[^}]+\}/g, "$1")
      .replace(/\{IfUpgraded:show:([^|]+)\|([^}]*)\}/g, useUpgraded ? "$1" : "$2")
      .replace(/\{[^}]+:plural:([^|]+)\|[^}]+\}/g, "$1")
      .replace(/\{InCombat:[^}]*\}/g, "")
      .replace(/\{Skills:plural:\|([^}]*)\}/g, "$1")
      .replace(/\{([^}:]+)\}/g, (_, name) => (vars && vars[name] !== undefined) ? String(vars[name]) : "?")
      .replace(/\n/g, " ")
      .trim();
    return out;
  }

  const descBase = clean(rawDesc, false);
  const descUpgraded = clean(rawDesc, true);
  const hasUpgradeDiff = descBase !== descUpgraded;

  return { description: descBase, descriptionUpgraded: hasUpgradeDiff ? descUpgraded : null };
}

// 任务牌：多尼斯异鸟蛋、灯火钥匙、藏宝图
const QUEST_IDS = new Set(["byrdonis_egg", "lantern_key", "spoils_map"]);
// 衍生牌：燃料、巨石、冷光、仆从俯冲、仆从捐躯、仆从打击、小刀、灵魂、君王之剑、扫荡凝视（衰朽、懒惰已移至状态牌）
const DERIVED_IDS = new Set([
  "fuel", "giant_rock", "luminesce", "minion_dive_bomb", "minion_sacrifice", "minion_strike",
  "shiv", "soul", "sovereign_blade", "sweeping_gaze",
]);
// 状态牌中在 runthesim CDN 使用 token 前缀的（衰朽、懒惰）
const STATUS_IDS_USE_TOKEN_IMAGE = new Set(["sloth", "waste_away"]);

// runthesim.ai 卡牌立绘 CDN: {class}__{cardId}.webp
// 衍生牌（Token）在 CDN 中使用 token 前缀，而非 status
// 先古牌（Ancient/Event）在 CDN 中统一使用 event 前缀
const IMAGE_CDN = "https://sts2.runthesim.ai/assets/card-portraits";
function getCardImageUrl(cardId, cardClass, rarity) {
  let cls = String(cardClass || "colorless").toLowerCase().replace(/\s/g, "_");
  if (cls === "unknown") cls = "colorless";
  // 衍生牌、部分状态牌在 runthesim CDN 中为 token__xxx.webp
  if (DERIVED_IDS.has(cardId) || STATUS_IDS_USE_TOKEN_IMAGE.has(cardId) || String(rarity || "").toLowerCase() === "token") {
    cls = "token";
  }
  // 先古牌（Ancient 与 Event）在 runthesim CDN 中统一为 event__xxx.webp
  else if (cls === "ancient" || cls === "event") {
    cls = "event";
  }
  return `${IMAGE_CDN}/${cls}__${cardId}.webp`;
}

function main() {
  let CARD_META = {};
  if (fs.existsSync(META_PATH)) {
    CARD_META = JSON.parse(fs.readFileSync(META_PATH, "utf-8"));
    console.log(`已加载 ${Object.keys(CARD_META).length} 条卡牌元数据`);
  }

  let DLL_DATA = {};
  if (fs.existsSync(DLL_DATA_PATH)) {
    const dllCards = JSON.parse(fs.readFileSync(DLL_DATA_PATH, "utf-8"));
    for (const c of dllCards) DLL_DATA[c.id] = c;
    console.log(`已加载 ${Object.keys(DLL_DATA).length} 条 DLL 卡牌数据`);
  }

  const raw = JSON.parse(fs.readFileSync(INPUT, "utf-8"));

  const cardIds = new Set();
  for (const key of Object.keys(raw)) {
    const match = key.match(/^([A-Z0-9_]+)\.(title|description)$/);
    if (match) cardIds.add(match[1]);
  }

  const cards = [];
  for (const id of cardIds) {
    const title = raw[`${id}.title`] || raw[`${id}.name`] || id;
    const desc = raw[`${id}.description`] || "";

    const cardId = id.toLowerCase();
    const meta = CARD_META[cardId] || {};
    const dll = DLL_DATA[cardId] || {};

    // 根据元数据与 ID 推断分类（优先使用 tpsheet 提取的 class）
    let category = "character";
    const cls = (meta.class || "").toString();
    if (QUEST_IDS.has(cardId)) category = "quest";
    else if (DERIVED_IDS.has(cardId)) category = "derived";
    else if (cls === "Curse") category = "curse";
    else if (cls === "Status" || cls === "Token") category = "status";
    else if (["Ancient", "Event"].includes(cls)) category = "ancient";
    else if (cls === "Colorless") category = "colorless";
    else if (cls === "Quest") category = "quest";
    else if (["Ironclad", "Silent", "Defect", "Necrobinder", "Regent"].includes(cls)) category = "character";

    const varsBase = dll.vars || {};
    const varsUpgraded = dll.varsUpgraded || varsBase;
    const { description, descriptionUpgraded } = processDescription(desc, varsBase, varsUpgraded);

    const card = {
      id: cardId,
      name: processDescription(title, varsBase, varsUpgraded).description,
      description,
      category,
      class: meta.class || "Unknown",
      type: dll.type || meta.type || "skill",
      rarity: dll.rarity || meta.rarity || "common",
      cost: dll.cost ?? meta.cost ?? 0,
      tags: [],
      image: getCardImageUrl(cardId, meta.class || "Unknown", dll.rarity || meta.rarity),
      version: "1.0.0",
    };

    if (varsBase.Damage !== undefined) card.damage = Math.round(varsBase.Damage);
    if (varsBase.Block !== undefined) card.block = Math.round(varsBase.Block);
    if (descriptionUpgraded || dll.varsUpgraded || dll.costUpgraded !== undefined) {
      card.upgraded = {};
      if (descriptionUpgraded) card.upgraded.description = descriptionUpgraded;
      if (varsUpgraded.Damage !== undefined) card.upgraded.damage = Math.round(varsUpgraded.Damage);
      if (varsUpgraded.Block !== undefined) card.upgraded.block = Math.round(varsUpgraded.Block);
      if (dll.costUpgraded !== undefined) card.upgraded.cost = dll.costUpgraded;
    }

    cards.push(card);
  }

  // 过滤掉未分类的牌
  const filtered = cards.filter((c) => c.class !== "Unknown");
  filtered.sort((a, b) => a.id.localeCompare(b.id));

  fs.writeFileSync(OUTPUT, JSON.stringify(filtered, null, 2), "utf-8");
  console.log(`已转换 ${filtered.length} 张卡牌（排除 ${cards.length - filtered.length} 张未分类）-> ${OUTPUT}`);
}

main();
