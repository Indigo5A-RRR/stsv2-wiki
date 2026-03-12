"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CardImage } from "../components/CardImage";
import { FilterPanel } from "../components/FilterPanel";
import { FilterSidebar } from "../components/FilterSidebar";
import cards from "../../data/cards.json";

type Card = (typeof cards)[number];

const CATEGORIES = [
  { id: "character", label: "角色牌" },
  { id: "colorless", label: "无色牌" },
  { id: "quest", label: "任务牌" },
  { id: "curse", label: "诅咒牌" },
  { id: "status", label: "状态牌" },
  { id: "derived", label: "衍生牌" },
  { id: "ancient", label: "先古牌" },
];

const CHARACTERS = [
  { id: "Ironclad", label: "铁甲战士" },
  { id: "Silent", label: "静默猎手" },
  { id: "Necrobinder", label: "亡灵契约师" },
  { id: "Regent", label: "储君" },
  { id: "Defect", label: "故障机器人" },
];

const RARITY_OPTIONS = [
  { id: "common", label: "普通" },
  { id: "uncommon", label: "罕见" },
  { id: "rare", label: "稀有" },
];

const COST_OPTIONS = [
  { id: "0", label: "0" },
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
  { id: "4+", label: "4+" },
  { id: "x", label: "X" },
];

const TYPE_OPTIONS = [
  { id: "attack", label: "攻击" },
  { id: "skill", label: "技能" },
  { id: "power", label: "能力" },
];

function isXCostCard(card: Card): boolean {
  if (card.cost !== 0) return false;
  const desc = card.description || "";
  const upDesc = (card as { upgraded?: { description?: string } }).upgraded?.description || "";
  return desc.includes("X") || upDesc.includes("X");
}

const rarityColor: Record<string, string> = {
  common: "bg-slate-700",
  uncommon: "bg-emerald-600",
  rare: "bg-amber-500",
  curse: "bg-purple-600",
  basic: "bg-slate-600",
  starter: "bg-slate-600",
  ancient: "bg-amber-600",
  quest: "bg-cyan-600",
  status: "bg-slate-500",
  token: "bg-slate-500",
  event: "bg-rose-600",
};

function CardsContent() {
  const allCards = cards as Card[];
  const searchParams = useSearchParams();
  const router = useRouter();

  const [category, setCategory] = useState<string>(() => searchParams.get("category") ?? "character");
  const [character, setCharacter] = useState<string>(() => searchParams.get("character") ?? "all");
  const [rarity, setRarity] = useState<string>(() => searchParams.get("rarity") ?? "all");
  const [costFilter, setCostFilter] = useState<string>(() => searchParams.get("cost") ?? "all");
  const [typeFilter, setTypeFilter] = useState<string>(() => searchParams.get("type") ?? "all");
  const [search, setSearch] = useState<string>(() => searchParams.get("q") ?? "");

  useEffect(() => {
    const cat = searchParams.get("category") ?? "character";
    const char = searchParams.get("character") ?? "all";
    const r = searchParams.get("rarity") ?? "all";
    const cost = searchParams.get("cost") ?? "all";
    const type = searchParams.get("type") ?? "all";
    const q = searchParams.get("q") ?? "";
    setCategory(cat);
    setCharacter(char);
    setRarity(r);
    setCostFilter(cost);
    setTypeFilter(type);
    setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    const isDefault =
      category === "character" &&
      character === "all" &&
      rarity === "all" &&
      costFilter === "all" &&
      typeFilter === "all" &&
      !search;
    if (isDefault) {
      if (typeof window !== "undefined" && window.location.search) router.replace("/cards", { scroll: false });
      return;
    }
    params.set("category", category);
    if (category === "character") {
      if (character !== "all") params.set("character", character);
      if (rarity !== "all") params.set("rarity", rarity);
      if (costFilter !== "all") params.set("cost", costFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
    }
    if (search) params.set("q", search);
    const url = `/cards?${params.toString()}`;
    const current = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";
    if (current !== url) router.replace(url, { scroll: false });
  }, [category, character, rarity, costFilter, typeFilter, search, router]);

  const filteredCards = allCards.filter((card) => {
    if (card.category !== category) return false;
    if (category === "character" && character !== "all") {
      if (card.class !== character) return false;
    }
    if (category === "character" && rarity !== "all") {
      if (card.rarity !== rarity) return false;
    }
    if (category === "character" && typeFilter !== "all") {
      if (card.type !== typeFilter) return false;
    }
    if (costFilter !== "all") {
      if (costFilter === "x") {
        if (!isXCostCard(card)) return false;
      } else if (costFilter === "4+") {
        if (card.cost < 4) return false;
      } else {
        const c = parseInt(costFilter, 10);
        if (card.cost !== c) return false;
      }
    }
    if (search) {
      const q = search.toLowerCase();
      if (!card.name.toLowerCase().includes(q) && !(card.id || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sidebarSections =
    category === "character"
      ? [
          { title: "稀有度", options: RARITY_OPTIONS, value: rarity, onChange: setRarity },
          { title: "费用", options: COST_OPTIONS, value: costFilter, onChange: setCostFilter },
          { title: "类型", options: TYPE_OPTIONS, value: typeFilter, onChange: setTypeFilter },
        ]
      : [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">卡牌图鉴</h1>
          <Link href="/" className="text-sm text-emerald-400 hover:underline">
            返回首页
          </Link>
        </header>

        <FilterPanel
          categoryOptions={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
          category={category}
          onCategoryChange={setCategory}
          subOptions={category === "character" ? CHARACTERS.map((c) => ({ id: c.id, label: c.label })) : undefined}
          subFilter={character}
          onSubFilterChange={category === "character" ? setCharacter : undefined}
          searchPlaceholder="搜索卡牌..."
          search={search}
          onSearchChange={setSearch}
        />

        {category === "character" ? (
        <FilterSidebar sections={sidebarSections}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map((card) => (
              <Link
                key={card.id}
                href={`/cards/${card.id}`}
                className="flex gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-500 hover:bg-slate-900 transition"
              >
                <div className="relative w-16 h-24 flex-shrink-0 rounded border border-slate-700 overflow-hidden bg-slate-800">
                  <CardImage
                    src={("image" in card ? card.image : "") || ""}
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    containerClassName="!absolute inset-0"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold">{card.name}</h2>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        rarityColor[card.rarity] ?? "bg-slate-700"
                      }`}
                    >
                      {card.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    职业：{card.class} ｜ 类型：{card.type} ｜ 费用：{isXCostCard(card) ? "X" : card.cost}
                    {typeof card.damage === "number" && ` ｜ 伤害：${card.damage}`}
                    {typeof card.block === "number" && ` ｜ 格挡：${card.block}`}
                  </p>
                  <p className="text-sm text-slate-300">{card.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {filteredCards.length === 0 && (
            <p className="text-slate-500 text-center py-8">
              该分类下暂无卡牌
            </p>
          )}
        </FilterSidebar>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card) => (
                <Link
                  key={card.id}
                  href={`/cards/${card.id}`}
                  className="flex gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-500 hover:bg-slate-900 transition"
                >
                  <div className="relative w-16 h-24 flex-shrink-0 rounded border border-slate-700 overflow-hidden bg-slate-800">
                    <CardImage
                      src={("image" in card ? card.image : "") || ""}
                      alt={card.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      containerClassName="!absolute inset-0"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-semibold">{card.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${rarityColor[card.rarity] ?? "bg-slate-700"}`}>
                        {card.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      职业：{card.class} ｜ 类型：{card.type} ｜ 费用：{isXCostCard(card) ? "X" : card.cost}
                      {typeof card.damage === "number" && ` ｜ 伤害：${card.damage}`}
                      {typeof card.block === "number" && ` ｜ 格挡：${card.block}`}
                    </p>
                    <p className="text-sm text-slate-300">{card.description}</p>
                  </div>
                </Link>
              ))}
            </div>
            {filteredCards.length === 0 && (
              <p className="text-slate-500 text-center py-8">该分类下暂无卡牌</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function CardsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">加载中...</div>}>
      <CardsContent />
    </Suspense>
  );
}
