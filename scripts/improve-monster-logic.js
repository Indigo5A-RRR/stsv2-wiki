/**
 * 优化怪物技能描述：移除格挡可吸收、用具体 debuff、有 damage 时用数值
 * 运行: node scripts/improve-monster-logic.js
 */

const fs = require("fs");
const path = require("path");

const monstersPath = path.join(__dirname, "../data/monsters.json");
const monsters = JSON.parse(fs.readFileSync(monstersPath, "utf-8"));

const BLOCK_PHRASES = [
  /格挡可吸收该伤害。?/g,
  /格挡可吸收。?/g,
  /格挡可分别吸收。?/g,
  /格挡可吸收伤害。?/g,
  /每次伤害可被格挡分别阻挡。?/g,
  /可被格挡分别阻挡/g,
];

function cleanBlockPhrases(text) {
  if (!text) return text;
  let result = text;
  for (const re of BLOCK_PHRASES) {
    result = result.replace(re, "");
  }
  return result.replace(/\s{2,}/g, " ").replace(/。\s*。/g, "。").trim();
}

function improveLogic(logic, intent) {
  if (!logic) return logic;
  let result = logic;

  const damage = intent?.damage ?? intent?.intents?.[0]?.damage;
  const repeat = intent?.repeat ?? intent?.intents?.[0]?.repeat;
  if (damage != null) {
    const damageStr = repeat != null && repeat > 1
      ? `造成 ${damage} 点伤害，共 ${repeat} 次`
      : `造成 ${damage} 点伤害`;
    result = result
      .replace(/对玩家造成\s*高额伤害/g, `对玩家${damageStr}`)
      .replace(/对玩家造成\s*伤害(?!\d)/g, `对玩家${damageStr}`)
      .replace(/对玩家造成\s*多次伤害/g, `对玩家${damageStr}`)
      .replace(/怪物回合结束时，对玩家造成\s*伤害(?!\d)/g, `怪物回合结束时，对玩家${damageStr}`)
      .replace(/怪物回合结束时，对玩家造成\s*高额伤害/g, `怪物回合结束时，对玩家${damageStr}`)
      .replace(/怪物回合结束时，对玩家造成\s*多次伤害/g, `怪物回合结束时，对玩家${damageStr}`);
  }

  result = result
    .replace(/施加\s*易伤\s*debuff/gi, "施加易伤")
    .replace(/施加\s*虚弱\s*debuff/gi, "施加虚弱")
    .replace(/debuff\s*（如虚弱、易伤）/g, "虚弱、易伤")
    .replace(/可能施加\s*debuff、/g, "可能施加虚弱、易伤等、")
    .replace(/并可能施加\s*debuff/g, "并可能施加虚弱、易伤等")
    .replace(/执行策略类行动，可能施加\s*debuff、/g, "执行策略类行动，可能施加虚弱、易伤等、")
    .replace(/施加\s*debuff\s*或/g, "施加虚弱、易伤等或")
    .replace(/可能施加\s*debuff\s*或/g, "可能施加虚弱、易伤等或")
    .replace(/或施加\s*debuff/g, "或施加虚弱、易伤等")
    .replace(/对玩家施加\s*debuff\s*或/g, "对玩家施加虚弱、易伤等或")
    .replace(/对玩家施加\s*debuff\s*，/g, "对玩家施加虚弱、易伤等，")
    .replace(/施加\s*debuff\s*，/g, "施加虚弱、易伤等，")
    .replace(/施加\s*debuff\s*使/g, "施加虚弱、易伤等使")
    .replace(/施加\s*debuff\s*或强化/g, "施加虚弱、易伤等或强化")
    .replace(/强\s*debuff/g, "虚弱、易伤等")
    .replace(/可能施加\s*虚弱或易伤\s*debuff/gi, "可能施加虚弱或易伤");

  result = cleanBlockPhrases(result);
  return result;
}

let updated = 0;
for (const monster of monsters) {
  for (const move of monster.moves || []) {
    if (move.intents) {
      for (const intent of move.intents) {
        if (intent.logic) {
          const improved = improveLogic(intent.logic, intent);
          if (improved !== intent.logic) {
            intent.logic = improved;
            updated++;
          }
        }
      }
    } else if (move.logic) {
      const improved = improveLogic(move.logic, move);
      if (improved !== move.logic) {
        move.logic = improved;
        updated++;
      }
    }
  }
}

fs.writeFileSync(monstersPath, JSON.stringify(monsters, null, 2), "utf-8");
console.log(`已优化 ${updated} 处怪物技能描述`);
