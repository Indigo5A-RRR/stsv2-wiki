/**
 * 修复遗物描述中的问号和英文占位符
 * 根据英文描述中的数字替换 ?，并替换英文占位符为中文
 */
const fs = require("fs");
const path = require("path");

const relicsPath = path.join(__dirname, "../data/relics.json");
const relics = JSON.parse(fs.readFileSync(relicsPath, "utf-8"));

// 根据 relic id 的修复映射：descriptionZh 中 ? 或占位符 → 正确值
const fixes = {
  centennial_puzzle: { "抽?张牌": "抽3张牌" },
  festive_popper: { "造成?点伤害": "造成9点伤害" },
  gorget: { "获得?层覆甲": "获得4层覆甲" },
  juzu_bracelet: { "你在?房间中": "你在问号房间中" },
  meal_ticket: {}, // 已正确
  bloody_idol: { "额外回复?点生命": "额外回复15点生命" },
  strike_dummy: { "造成?点额外伤害": "造成3点额外伤害" },
  vajra: { "获得?点力量": "获得1点力量" },
  war_paint: { "随机升级?张技能牌": "随机升级2张技能牌" },
  wrathful_hammer: { "随机升级?张攻击牌": "随机升级2张攻击牌" },
  tough_bandages: { "造成?点伤害": "造成3点伤害" },
  soul_catcher: { "将?张灵魂": "将3张灵魂" },
  dark_emblem: { "生成?个黑暗充能球": "生成1个黑暗充能球" },
  dead_branch: { "抽?张牌": "抽1张牌" },
  sundial: { "你每消耗{ExhaustAmount}张牌，就抽?张牌": "你每消耗5张牌，就抽1张牌" },
  ornamental_fan: { "打出?张攻击牌": "打出3张攻击牌", "造成?点伤害": "造成6点伤害" },
  kunai: { "打出?张技能牌": "打出3张技能牌", "造成?点伤害": "造成5点伤害" },
  membership_card: { "获得?金币": "获得15金币" },
  incense_burner: { "造成?点伤害": "造成3点伤害" },
  shuriken: { "额外造成?点伤害": "额外造成3点伤害" },
  nunchaku: { "你每打出?张攻击牌": "你每打出10张攻击牌" },
  pen_nib: { "打出?张攻击牌": "打出3张攻击牌" },
  calipers: { "造成?点伤害": "造成6点伤害" },
  bag_of_marbles: { "?层虚弱": "1层虚弱" },
  phantasmal_killer: { "?张牌": "3张牌" },
  ornamental_fan_alt: { "打出?张技能牌": "打出10张技能牌" },
  charons_ashes: { "造成?点伤害": "造成3点伤害" },
  big_hat: { "将?张随机无色牌": "将2张随机无色牌" },
  pandoras_box: { "将?张随机虚无牌": "将2张随机虚无牌" },
  capacitor: { "生成{OrbCount}个充能球时，对所有敌人造成?点伤害": "生成7个充能球时，对所有敌人造成30点伤害" },
  frozen_core: { "将?张耗能为0的卡牌": "将2张耗能为0的卡牌" },
  ink_bottle: { "抽?张牌": "抽1张牌" },
  ninja_scroll: { "打出?张攻击牌": "打出3张攻击牌" },
  lizard_tail: { "最大生命值的?%": "最大生命值的50%" },
  ectoplasm: { "获得?金币": "获得300金币" },
  shuriken_alt: { "打出?张攻击牌": "打出3张攻击牌" },
  turnip: { "造成?点伤害": "造成52点伤害" },
  shuriken_relic: { "至多?张攻击牌": "至多3张攻击牌" },
  wrist_blade: { "至多?张牌": "至多3张牌" },
  envenomed_dagger: { "额外造成?点伤害": "额外造成9点伤害" },
  pandoras_box_alt: { "获得?组卡牌奖励": "获得5组卡牌奖励" },
  empty_cage: { "造成?点伤害": "造成20点伤害" },
  cursed_key: { "获得?点力量": "获得2点力量" },
  tiny_house: { "从?张随机无色牌": "从3张随机无色牌" },
  astrolabe: { "选择?张牌进行变化": "选择3张牌进行变化" },
  coffee_dripper: { "获得?点力量": "获得1点力量" },
  runic_dome: { "不能打出超过?张牌": "不能打出超过6张牌" },
  cursed_pearl: { "获得?金币": "获得333金币" },
  ectoplasm_alt: { "获得?金币": "获得150金币" },
  transform_card: { "变化?张牌": "变化1张牌" },
  busted_crown: { "移除?张牌": "移除2张牌", "受到?点伤害": "受到13点伤害" },
  peace_pipe: { "移除?张牌": "移除1张牌" },
  nloths_gift: { "前?组卡牌奖励": "前3组卡牌奖励" },
  beautiful_bracelet: { "选择?张牌": "选择3张牌" },
  blessed_antler: { "将?张晕眩": "将3张晕眩" },
  bloody_idol_alt: { "获得?金币": "获得999金币" },
  cold_snap: { "将?张冷光": "将1张冷光" },
  prayer_wheel: { "随机升级?张牌": "随机升级6张牌" },
  prismatic_shard: { "查看?张来自": "查看15张来自", "一张牌|其他角色}": "其他角色的牌" },
  incense_burner_alt: { "休眠?个回合": "休眠2个回合" },
  biiig_hug: { "选择?张牌移除": "选择5张牌移除", "一张牌|}": "" },
  claws: { "将至多?张牌": "将至多6张牌" },
  instinct_relic: { "选择?张攻击牌": "选择3张攻击牌" },
  hand_of_greed: { "随机升级?张牌": "随机升级4张牌" },
  biiig_hug_alt: { "移除?张牌": "移除4张牌" },
  the_courier: { "花费?金币": "花费5金币" },
  very_hot_cocoa: {}, // 需单独处理
  ssserpent_head: { "升级?张牌": "升级4张牌" },
  choices_paradox: { "从?张随机牌": "从5张随机牌" },
  apparition_relic: { "将?张灵体": "将3张灵体" },
  question_card: { "移除?张牌": "移除5张牌" },
  big_mushroom: { "少抽?张牌": "少抽2张牌" },
  charons_ashes_alt: { "造成?点伤害": "造成1点伤害" },
  toxic_egg: { "失去{HpLoss}点生命": "失去15点生命", "升级?张牌": "升级3张牌" },
  nuclear_battery: { "造成?点伤害": "造成8点伤害" },
  smiley_mask: { "获得?金币": "获得12金币" },
  mark_of_pain: { "失去?点生命": "失去4点生命" },
  red_skull: { "造成?点额外伤害": "造成1点额外伤害" },
  red_skull_alt: { "获得?点力量": "获得3点力量" },
};

// 直接替换：匹配 descriptionZh 中的模式
const directReplacements = [
  ["抽?张牌", "抽3张牌", ["centennial_puzzle"]],
  ["造成?点伤害", "造成9点伤害", ["festive_popper"]],
  ["获得?层覆甲", "获得4层覆甲", ["gorget"]],
  ["你在?房间中", "你在问号房间中", ["juzu_bracelet"]],
  ["额外回复?点生命", "额外回复15点生命", ["bloody_idol"]],
  ["造成?点额外伤害", "造成3点额外伤害", ["strike_dummy"]],
  ["获得?点力量", "获得1点力量", ["vajra"]],
  ["随机升级?张技能牌", "随机升级2张技能牌", ["war_paint"]],
  ["随机升级?张攻击牌", "随机升级2张攻击牌", ["wrathful_hammer"]],
  ["将?张灵魂", "将3张灵魂", ["soul_catcher"]],
  ["生成?个黑暗充能球", "生成1个黑暗充能球", ["dark_emblem"]],
  ["获得1 点能量并抽?张牌", "获得1点能量并抽1张牌", ["dead_branch"]],
  ["你每消耗{ExhaustAmount}张牌，就抽?张牌", "你每消耗5张牌，就抽1张牌", ["sundial"]],
  ["你每在同一回合内打出?张攻击牌，就随机对一名敌人造成?点伤害", "你每在同一回合内打出3张攻击牌，就随机对一名敌人造成6点伤害", ["ornamental_fan"]],
  ["你每在同一回合内打出?张技能牌，就对所有敌人造成?点伤害", "你每在同一回合内打出3张技能牌，就对所有敌人造成5点伤害", ["kunai"]],
  ["每当你将一张卡牌加入你的牌组时，获得?金币", "每当你将一张卡牌加入你的牌组时，获得15金币", ["membership_card"]],
  ["对所有敌人造成?点伤害", "对所有敌人造成3点伤害", ["incense_burner"]],
  ["升级的攻击牌额外造成?点伤害", "升级的攻击牌额外造成3点伤害", ["shuriken"]],
  ["你每打出?张攻击牌，获得1 点能量", "你每打出10张攻击牌，获得1点能量", ["nunchaku"]],
  ["你每在同一回合内打出?张攻击牌，就获得4点格挡", "你每在同一回合内打出3张攻击牌，就获得4点格挡", ["pen_nib"]],
  ["对随机敌人造成?点伤害", "对随机敌人造成6点伤害", ["calipers"]],
  ["给于所有敌人?层虚弱", "给予所有敌人1层虚弱", ["bag_of_marbles"]],
  ["随机升级你抽牌堆中的?张牌", "随机升级你抽牌堆中的3张牌", ["phantasmal_killer"]],
  ["你每打出?张技能牌，获得7点格挡", "你每打出10张技能牌，获得7点格挡", ["ornamental_fan_alt"]],
  ["对所有敌人造成?点伤害", "对所有敌人造成3点伤害", ["charons_ashes"]],
  ["将?张随机无色牌", "将2张随机无色牌", ["big_hat"]],
  ["将?张随机虚无牌", "将2张随机虚无牌", ["pandoras_box"]],
  ["每场战斗中你首次生成{OrbCount}个充能球时，对所有敌人造成?点伤害", "每场战斗中你首次生成7个充能球时，对所有敌人造成30点伤害", ["capacitor"]],
  ["将?张耗能为0的卡牌", "将2张耗能为0的卡牌", ["frozen_core"]],
  ["抽?张牌", "抽1张牌", ["ink_bottle"]],
  ["你每在同一回合内打出?张攻击牌，就获得1点敏捷", "你每在同一回合内打出3张攻击牌，就获得1点敏捷", ["ninja_scroll"]],
  ["免死并回复到最大生命值的?%", "免死并回复到最大生命值的50%", ["lizard_tail"]],
  ["获得?金币", "获得300金币", ["ectoplasm"]],
  ["你每在同一回合内打出?张攻击牌，获得1点力量", "你每在同一回合内打出3张攻击牌，获得1点力量", ["shuriken_alt"]],
  ["对所有敌人造成?点伤害", "对所有敌人造成52点伤害", ["turnip"]],
  ["从你的牌组中选择至多?张攻击牌", "从你的牌组中选择至多3张攻击牌", ["shuriken_relic"]],
  ["从你的牌组中选择至多?张牌", "从你的牌组中选择至多3张牌", ["wrist_blade"]],
  ["有附魔的攻击牌额外造成?点伤害", "有附魔的攻击牌额外造成9点伤害", ["envenomed_dagger"]],
  ["获得?组卡牌奖励", "获得5组卡牌奖励", ["pandoras_box_alt"]],
  ["对所有敌人造成?点伤害", "对所有敌人造成20点伤害", ["empty_cage"]],
  ["获得?点力量", "获得2点力量", ["cursed_key"]],
  ["从?张随机无色牌", "从3张随机无色牌", ["tiny_house"]],
  ["选择?张牌进行变化", "选择3张牌进行变化", ["astrolabe"]],
  ["所有敌人初始获得?点力量", "所有敌人初始获得1点力量", ["coffee_dripper"]],
  ["不能打出超过?张牌", "不能打出超过6张牌", ["runic_dome"]],
  ["获得一张贪婪，获得?金币", "获得一张贪婪，获得333金币", ["cursed_pearl"]],
  ["获得?金币", "获得150金币", ["ectoplasm_alt"]],
  ["变化?张牌", "变化1张牌", ["transform_card"]],
  ["从你的牌组中移除?张牌，并受到?点伤害", "从你的牌组中移除2张牌，并受到13点伤害", ["busted_crown"]],
  ["从你的牌组中移除?张牌", "从你的牌组中移除1张牌", ["peace_pipe"]],
  ["你遇到的前?组卡牌奖励", "你遇到的前3组卡牌奖励", ["nloths_gift"]],
  ["从你的牌组中选择?张牌", "从你的牌组中选择3张牌", ["beautiful_bracelet"]],
  ["将?张晕眩放入", "将3张晕眩放入", ["blessed_antler"]],
  ["获得?金币", "获得999金币", ["bloody_idol_alt"]],
  ["将?张冷光", "将1张冷光", ["cold_snap"]],
  ["随机升级?张牌", "随机升级6张牌", ["prayer_wheel"]],
  ["查看?张来自一张牌|其他角色}的牌", "查看15张来自其他角色的牌", ["prismatic_shard"]],
  ["休眠?个回合", "休眠2个回合", ["incense_burner_alt"]],
  ["拾起时，从你的牌组中选择?张牌移除", "拾起时，从你的牌组中选择5张牌移除", ["biiig_hug"]],
  ["将其中随机1张牌升级然后返还。一张牌|}", "将其中随机1张牌升级然后返还", ["biiig_hug"]],
  ["将至多?张牌变化为撕咬", "将至多6张牌变化为撕咬", ["claws"]],
  ["从你的牌组中选择?张攻击牌", "从你的牌组中选择3张攻击牌", ["instinct_relic"]],
  ["随机升级?张牌", "随机升级4张牌", ["hand_of_greed"]],
  ["从你的牌组中移除?张牌", "从你的牌组中移除4张牌", ["biiig_hug_alt"]],
  ["花费?金币来获得", "花费5金币来获得", ["the_courier"]],
  ["升级?张牌", "升级4张牌", ["ssserpent_head"]],
  ["从?张随机牌中选择", "从5张随机牌中选择", ["choices_paradox"]],
  ["将?张灵体", "将3张灵体", ["apparition_relic"]],
  ["移除?张牌", "移除5张牌", ["question_card"]],
  ["少抽?张牌", "少抽2张牌", ["big_mushroom"]],
  ["造成?点伤害", "造成1点伤害", ["charons_ashes_alt"]],
  ["失去{HpLoss}点生命，然后随机升级?张牌", "失去15点生命，然后随机升级3张牌", ["toxic_egg"]],
  ["就对所有敌人造成?点伤害", "就对所有敌人造成8点伤害", ["nuclear_battery"]],
  ["获得?金币", "获得12金币", ["smiley_mask"]],
  ["失去?点生命", "失去4点生命", ["mark_of_pain"]],
  ["造成?点额外伤害", "造成1点额外伤害", ["red_skull"]],
  ["获得?点力量", "获得3点力量", ["red_skull_alt"]],
];

// 按 id 精确替换
const idFixes = {
  centennial_puzzle: "你在每场战斗中第一次损失生命值时，抽3张牌。",
  festive_popper: "在每场战斗开始时，对所有敌人造成9点伤害。",
  gorget: "在每场战斗开始时，获得4层覆甲。",
  juzu_bracelet: "你在问号房间中不会再遭遇常规战斗。",
  bloody_idol: "在休息时，额外回复15点生命。",
  strike_dummy: "名字中有「打击」的卡牌造成3点额外伤害。",
  vajra: "在每场战斗开始时，获得1点力量。",
  war_paint: "拾起时，随机升级2张技能牌。",
  wrathful_hammer: "拾起时，随机升级2张攻击牌。",
  tough_bandages: "你每在你的回合丢弃一张牌，就对一名随机敌人造成3点伤害。",
  soul_catcher: "在每场战斗开始时，将3张灵魂加入你的抽牌堆。",
  dark_emblem: "在每场战斗开始时，生成1个黑暗充能球。",
  dead_branch: "每当有一名敌人死亡时，获得1点能量并抽1张牌。",
  sundial: "你每消耗5张牌，就抽1张牌。",
  ornamental_fan: "你每在同一回合内打出3张攻击牌，就随机对一名敌人造成6点伤害。",
  kunai: "你每在同一回合内打出3张技能牌，就对所有敌人造成5点伤害。",
  membership_card: "每当你将一张卡牌加入你的牌组时，获得15金币。",
  incense_burner: "在你的回合开始时，对所有敌人造成3点伤害。",
  shuriken: "升级的攻击牌额外造成3点伤害。",
  nunchaku: "你每打出10张攻击牌，获得1点能量。",
  pen_nib: "你每在同一回合内打出3张攻击牌，就获得4点格挡。",
  calipers: "如果你在回合结束时拥有至少10点格挡，则对随机敌人造成6点伤害。",
  bag_of_marbles: "在每场战斗开始时，给予所有敌人1层虚弱。",
  phantasmal_killer: "在Boss战开始时，在本场战斗中随机升级你抽牌堆中的3张牌。",
  the_boot: "你每打出10张技能牌，获得7点格挡。",
  charons_ashes: "每当你消耗一张牌，对所有敌人造成3点伤害。",
  big_hat: "在每场战斗开始时，将2张随机无色牌加入你的手牌。",
  pandoras_box: "在每场战斗开始时，将2张随机虚无牌加入你的手牌。",
  capacitor: "每场战斗中你首次生成7个充能球时，对所有敌人造成30点伤害。",
  frozen_core: "在每场战斗开始时，将2张耗能为0的卡牌从你的抽牌堆放入你的手牌。",
  ink_bottle: "每当你打出能力牌时，抽1张牌。",
  ninja_scroll: "你每在同一回合内打出3张攻击牌，就获得1点敏捷。",
  lizard_tail: "当你要被杀死时，免死并回复到最大生命值的50%（仅能起效一次）。",
  ectoplasm: "拾起时，获得300金币。",
  shuriken_relic: "你每在同一回合内打出3张攻击牌，获得1点力量。",
  turnip: "在第7回合结束时，对所有敌人造成52点伤害。",
  claws: "拾起时，从你的牌组中选择至多3张攻击牌，附魔：锋利3。",
  wrist_blade: "拾起时，从你的牌组中选择至多3张牌，附魔：伶俐。",
  envenomed_dagger: "有附魔的攻击牌额外造成9点伤害。",
  empty_cage: "拾起时，获得5组卡牌奖励。",
  cursed_key: "如果你在回合结束时没有任何手牌，则对所有敌人造成20点伤害。",
  tiny_house: "在与精英敌人战斗时，获得2点力量。",
  astrolabe: "在每场战斗开始时，从3张随机无色牌中选择1张加入你的手牌。",
  coffee_dripper: "拾起时，选择3张牌进行变化，然后将这些牌升级。",
  runic_dome: "在每回合开始时获得1点能量。所有敌人初始获得1点力量。",
  cursed_pearl: "在每回合开始时获得1点能量。你每回合不能打出超过6张牌。",
  bloody_idol_alt: "拾起时，获得一张贪婪，获得333金币。",
  peace_pipe: "拾起时，获得150金币。",
  busted_crown: "拾起时，变化1张牌。",
  nloths_gift: "拾起时，从你的牌组中移除2张牌，并受到13点伤害。",
  beautiful_bracelet: "拾起时，从你的牌组中移除1张牌。",
  blessed_antler: "你遇到的前3组卡牌奖励将是被升级过的。你打开的第一个宝箱将是空的。",
  prayer_wheel: "拾起时，从你的牌组中选择3张牌，附魔：迅捷3。",
  prismatic_shard: "在每回合开始时获得1点能量。在战斗开始时，将3张晕眩放入你的抽牌堆。",
  incense_burner_alt: "拾起时，获得999金币。",
  biiig_hug: "在每场战斗开始时，将1张冷光加入你的手牌。",
  claws_alt: "拾起时，随机升级6张牌。",
  instinct_relic: "查看15张来自其他角色的牌。从中选择任意数量的卡牌加入你的牌组。",
  hand_of_greed: "将你从一张卡牌内获得的格挡翻倍，然后休眠2个回合。",
  question_card: "拾起时，从你的牌组中选择5张牌移除。在每场战斗结束时，将其中随机1张牌升级然后返还。",
  big_mushroom: "拾起时，将至多6张牌变化为撕咬。",
  toxic_egg: "从你的牌组中选择3张攻击牌。为这些牌附魔：本能。",
  nuclear_battery: "每当你击败一名精英敌人时，随机升级4张牌。",
  smiley_mask: "拾起时，从你的牌组中移除4张牌。每当你的抽牌堆打乱洗牌时，将一张煤灰加入你的抽牌堆。",
  mark_of_pain: "在你的回合开始时，花费5金币来获得1点能量。",
  red_skull: "拾起时，升级4张牌。",
  ssserpent_head: "在每场战斗开始时，你可以从5张随机牌中选择1张放入你的手牌。然后被选定的那张牌获得保留。",
  choices_paradox: "拾起时，失去9点最大生命值。将3张灵体加入你的牌组。",
  apparition_relic: "拾起时，从你的牌组中移除5张牌。将一张愚行加入你的牌组。",
  the_courier: "拾起时，将你的最大生命值提升20。在每场战斗开始时，少抽2张牌。",
  charons_ashes_alt: "每当你消耗一张牌，随机对一名敌人造成1点伤害。",
  very_hot_cocoa: "拾起时，失去15点生命，然后随机升级3张牌。",
};

let count = 0;
for (const relic of relics) {
  const fix = idFixes[relic.id];
  if (fix) {
    relic.descriptionZh = fix;
    count++;
  } else if (relic.descriptionZh && (relic.descriptionZh.includes("?") || relic.descriptionZh.includes("{") || relic.descriptionZh.includes("}"))) {
    // 尝试从英文描述提取数字进行替换
    const en = relic.description;
    const zh = relic.descriptionZh;
    let newZh = zh;
    if (en && zh) {
      const numMatch = en.match(/\d+/g);
      if (numMatch && zh.includes("?")) {
        let i = 0;
        newZh = zh.replace(/\?/g, () => (i < numMatch.length ? numMatch[i++] : "?"));
      }
      newZh = newZh
        .replace(/\{ExhaustAmount\}/g, "5")
        .replace(/\{OrbCount\}/g, "7")
        .replace(/\{DamageTurn\}/g, "7")
        .replace(/\{SharpAmount:diff\(\)\}/g, "3")
        .replace(/\{HpLoss\}/g, "15")
        .replace(/\|.*?\}/g, "");
      if (newZh !== zh) {
        relic.descriptionZh = newZh;
        count++;
      }
    }
  }
}

fs.writeFileSync(relicsPath, JSON.stringify(relics, null, 2), "utf-8");
console.log(`已修复 ${count} 个遗物描述`);
