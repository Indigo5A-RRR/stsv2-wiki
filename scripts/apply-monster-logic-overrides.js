/**
 * 应用怪物逻辑覆盖：从 monster_logic_overrides.json 合并到 monsters.json
 * 运行: node scripts/apply-monster-logic-overrides.js
 */

const fs = require("fs");
const path = require("path");

const monstersPath = path.join(__dirname, "../data/monsters.json");
const overridesPath = path.join(__dirname, "../data/monster_logic_overrides.json");

const monsters = JSON.parse(fs.readFileSync(monstersPath, "utf-8"));
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));

let applied = 0;

for (const monster of monsters) {
  const o = overrides[monster.id];
  if (!o) continue;

  if (o.passive) {
    monster.passive = o.passive;
    applied++;
  }

  for (const [moveId, moveOverride] of Object.entries(o)) {
    if (moveId === "passive" || moveId.startsWith("_")) continue;

    const move = (monster.moves || []).find((m) => m.id === moveId);
    if (!move) continue;

    if (moveOverride.intents) {
      for (let i = 0; i < moveOverride.intents.length; i++) {
        const intentOverride = moveOverride.intents[i];
        if (!intentOverride || !intentOverride.logic) continue;
        const intents = move.intents || [];
        if (intents[i]) {
          intents[i].logic = intentOverride.logic;
          applied++;
        }
      }
    } else if (moveOverride.logic) {
      if (move.intents && move.intents.length > 0) {
        move.intents[0].logic = moveOverride.logic;
      } else {
        move.logic = moveOverride.logic;
      }
      applied++;
    }
  }
}

fs.writeFileSync(monstersPath, JSON.stringify(monsters, null, 2), "utf-8");
console.log(`已应用 ${applied} 处怪物逻辑覆盖`);
