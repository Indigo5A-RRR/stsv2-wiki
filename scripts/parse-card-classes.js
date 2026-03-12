/**
 * 解析 ILSpy 导出的 C# 卡牌类，提取 cost/type/rarity
 * 
 * 使用步骤：
 * 1. 在 ILSpy 中打开 sts2.dll
 * 2. 右键程序集 -> Save Code -> 选择导出目录（如 D:\projects\sts2_decompiled）
 * 3. 运行: node scripts/parse-card-classes.js D:\projects\sts2_decompiled
 */

const fs = require("fs");
const path = require("path");

const EXPORT_DIR = process.argv[2] || "D:\\projects\\sts2_decompiled";
const OUTPUT = path.join(__dirname, "..", "data", "card_data_from_dll.json");

const CARD_TYPE_MAP = {
  None: "none", Attack: "attack", Skill: "skill", Power: "power",
  Status: "status", Curse: "curse", Quest: "quest"
};
const RARITY_MAP = {
  Basic: "basic", Common: "common", Uncommon: "uncommon", Rare: "rare",
  Curse: "curse", Status: "status", Event: "event", Quest: "quest", Ancient: "ancient"
};
const TARGET_MAP = {
  None: "none", Self: "self", AnyEnemy: "any_enemy", AnyAlly: "any_ally"
};

function findCsFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findCsFiles(full, list);
    else if (e.name.endsWith(".cs")) list.push(full);
  }
  return list;
}

function extractCardFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  
  // 必须是 CardModel 子类
  if (!content.includes("CardModel") || content.includes("abstract class CardModel")) return null;
  
  // 提取类名（支持 : CardModel 或 : CardModel, IInterface）
  const classMatch = content.match(/public\s+(?:sealed\s+)?class\s+(\w+)\s*:\s*[\w.]*CardModel/);
  if (!classMatch) return null;
  
  const className = classMatch[1];
  
  // 从类名推断 id（如 Strike -> strike, Defend -> defend）
  let id = className;
  if (id.endsWith("Card")) id = id.slice(0, -4);
  id = id.replace(/([A-Z])/g, (m, c) => (id.indexOf(c) > 0 ? "_" : "") + c.toLowerCase()).replace(/^_/, "");
  
  // 查找 base( 构造函数调用，支持多种格式
  const baseCallMatch = content.match(/base\s*\(\s*(\d+)\s*,\s*CardType\.(\w+)\s*,\s*CardRarity\.(\w+)\s*,\s*TargetType\.(\w+)(?:\s*,\s*(true|false))?\s*\)/);
  
  let cost = 0, cardType = "skill", rarity = "common", targetType = "none";
  if (baseCallMatch) {
    cost = parseInt(baseCallMatch[1], 10);
    cardType = CARD_TYPE_MAP[baseCallMatch[2]] || baseCallMatch[2].toLowerCase();
    rarity = RARITY_MAP[baseCallMatch[3]] || baseCallMatch[3].toLowerCase();
    targetType = TARGET_MAP[baseCallMatch[4]] || baseCallMatch[4].toLowerCase();
  }
  
  // 尝试从 ModelId 或 Id 字段获取真实 id
  const idMatch = content.match(/(?:ModelId|Id)\s*[=,]\s*(?:new\s+)?(?:ModelId\s*)?\(\s*["']\w+["']\s*,\s*["']([^"']+)["']\s*\)/);
  if (idMatch) id = idMatch[1].toLowerCase();

  // 提取 CanonicalVars 中的数值
  const vars = extractVars(content);
  const upgrades = extractUpgrades(content);
  const costUpgrade = extractCostUpgrade(content);

  // 计算升级后的 vars
  const varsBase = { ...vars };
  const varsUpgraded = { ...vars };
  for (const [varName, delta] of Object.entries(upgrades)) {
    if (varsUpgraded[varName] !== undefined) {
      varsUpgraded[varName] = Math.round((varsUpgraded[varName] + delta) * 10) / 10;
    }
  }
  const costUpgraded = costUpgrade !== null ? cost + costUpgrade : cost;

  const result = { id, cost, type: cardType, rarity, targetType };
  if (Object.keys(varsBase).length > 0) result.vars = varsBase;
  if (Object.keys(varsUpgraded).length > 0 && JSON.stringify(varsBase) !== JSON.stringify(varsUpgraded)) {
    result.varsUpgraded = varsUpgraded;
  }
  if (costUpgrade !== null && costUpgrade !== 0) result.costUpgraded = costUpgraded;
  return result;
}

function extractVars(content) {
  const vars = {};
  // DamageVar(6m, ValueProp.Move) -> Damage: 6
  const damageMatches = content.matchAll(/DamageVar\s*\(\s*([\d.]+)m/g);
  for (const m of damageMatches) { vars.Damage = parseFloat(m[1]); }
  // BlockVar(5m, ValueProp.Move) -> Block: 5
  const blockMatches = content.matchAll(/BlockVar\s*\(\s*([\d.]+)m/g);
  for (const m of blockMatches) { vars.Block = parseFloat(m[1]); }
  // DynamicVar("Name", 1m) -> Name: 1
  const dynMatches = content.matchAll(/new DynamicVar\s*\(\s*["']([^"']+)["']\s*,\s*([\d.]+)m\s*\)/g);
  for (const m of dynMatches) { vars[m[1]] = parseFloat(m[2]); }
  // PowerVar<ThornsPower>(4m) -> ThornsPower: 4
  const powerMatches = content.matchAll(/PowerVar\s*<\s*(\w+)\s*>\s*\(\s*([\d.]+)m\s*\)/g);
  for (const m of powerMatches) { vars[m[1]] = parseFloat(m[2]); }
  // CardsVar(3) -> Cards: 3
  const cardsMatches = content.matchAll(/CardsVar\s*\(\s*(\d+)\s*\)/g);
  for (const m of cardsMatches) { vars.Cards = parseInt(m[1], 10); }
  // ForgeVar(7) -> Forge: 7
  const forgeMatches = content.matchAll(/ForgeVar\s*\(\s*(\d+)\s*\)/g);
  for (const m of forgeMatches) { vars.Forge = parseInt(m[1], 10); }
  // ShivsVar, SummonVar, RepeatVar, HpLossVar, etc.
  const shivsMatches = content.matchAll(/ShivsVar\s*\(\s*(\d+)\s*\)/g);
  for (const m of shivsMatches) { vars.Shivs = parseInt(m[1], 10); }
  const summonMatches = content.matchAll(/SummonVar\s*\(\s*([\d.]+)m?\s*\)/g);
  for (const m of summonMatches) { vars.Summon = parseFloat(m[1]); }
  const repeatMatches = content.matchAll(/RepeatVar\s*\(\s*(\d+)\s*\)/g);
  for (const m of repeatMatches) { vars.Repeat = parseInt(m[1], 10); }
  const hpLossMatches = content.matchAll(/HpLossVar\s*\(\s*([\d.]+)m\s*\)/g);
  for (const m of hpLossMatches) { vars.HpLoss = parseFloat(m[1]); }
  const focusMatches = content.matchAll(/FocusVar\s*\(\s*([\d.]+)m\s*\)/g);
  for (const m of focusMatches) { vars.FocusPower = parseFloat(m[1]); }
  const extraDamageMatches = content.matchAll(/ExtraDamageVar\s*\(\s*([\d.]+)m\s*\)/g);
  for (const m of extraDamageMatches) { vars.ExtraDamage = parseFloat(m[1]); }
  const ostyMatches = content.matchAll(/OstyDamageVar\s*\(\s*([\d.]+)m/g);
  for (const m of ostyMatches) { vars.OstyDamage = parseFloat(m[1]); }
  const poisonMatches = content.matchAll(/PoisonVar\s*\(\s*([\d.]+)m\s*\)/g);
  for (const m of poisonMatches) { vars.PoisonPower = parseFloat(m[1]); }
  const vulnMatches = content.matchAll(/VulnerableVar\s*\(\s*([\d.]+)m\s*\)/g);
  for (const m of vulnMatches) { vars.VulnerablePower = parseFloat(m[1]); }
  const orbSlotsMatches = content.matchAll(/OrbSlotsVar\s*\(\s*(\d+)\s*\)/g);
  for (const m of orbSlotsMatches) { vars.OrbSlots = parseInt(m[1], 10); }
  const maxHpMatches = content.matchAll(/MaxHpVar\s*\(\s*([\d.]+)m\s*\)/g);
  for (const m of maxHpMatches) { vars.MaxHp = parseFloat(m[1]); }
  const healMatches = content.matchAll(/HealVar\s*\(\s*([\d.]+)m\s*\)/g);
  for (const m of healMatches) { vars.Heal = parseFloat(m[1]); }
  const biasedMatches = content.matchAll(/BiasedCognitionPower\s*\(\s*([\d.]+)m\s*\)/g);
  for (const m of biasedMatches) { vars.BiasedCognitionPower = parseFloat(m[1]); }
  return vars;
}

function extractUpgrades(content) {
  const upgrades = {};
  // base.DynamicVars.Damage.UpgradeValueBy(3m)
  const directMatches = content.matchAll(/DynamicVars\.(\w+)\.UpgradeValueBy\s*\(\s*([\d.-]+)m\s*\)/g);
  for (const m of directMatches) { upgrades[m[1]] = (upgrades[m[1]] || 0) + parseFloat(m[2]); }
  // base.DynamicVars["ThornsPower"].UpgradeValueBy(2m)
  const bracketMatches = content.matchAll(/DynamicVars\s*\[\s*["']([^"']+)["']\s*\]\.UpgradeValueBy\s*\(\s*([\d.-]+)m\s*\)/g);
  for (const m of bracketMatches) { upgrades[m[1]] = (upgrades[m[1]] || 0) + parseFloat(m[2]); }
  return upgrades;
}

function extractCostUpgrade(content) {
  // base.EnergyCost.UpgradeBy(-1)
  const m = content.match(/EnergyCost\.UpgradeBy\s*\(\s*(-?\d+)\s*\)/);
  return m ? parseInt(m[1], 10) : null;
}

function main() {
  if (!fs.existsSync(EXPORT_DIR)) {
    console.log("用法: node scripts/parse-card-classes.js <ILSpy导出目录>");
    console.log("");
    console.log("请先在 ILSpy 中导出 sts2.dll 的 C# 代码:");
    console.log("  1. 打开 ILSpy，加载 sts2.dll");
    console.log("  2. 右键 sts2 程序集 -> Save Code");
    console.log("  3. 选择保存目录");
    console.log("");
    console.log("然后运行: node scripts/parse-card-classes.js <导出目录路径>");
    process.exit(1);
  }

  const files = findCsFiles(EXPORT_DIR);
  console.log(`扫描 ${files.length} 个 .cs 文件...`);

  const cards = [];
  for (const f of files) {
    const card = extractCardFromFile(f);
    if (card) cards.push(card);
  }

  cards.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(OUTPUT, JSON.stringify(cards, null, 2), "utf-8");
  console.log(`已提取 ${cards.length} 张卡牌 -> ${OUTPUT}`);
}

main();
