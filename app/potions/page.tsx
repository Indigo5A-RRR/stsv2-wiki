"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CardImage } from "../components/CardImage";
import { FilterPanel } from "../components/FilterPanel";
import potions from "../../data/potions.json";

type Potion = (typeof potions)[number];

// 主筛选：职业（与 runthesim 一致）
const CLASS_OPTIONS = [
  { id: "all", label: "全部" },
  { id: "Ironclad", label: "铁甲战士" },
  { id: "Silent", label: "静默猎手" },
  { id: "Regent", label: "储君" },
  { id: "Necrobinder", label: "亡灵契约师" },
  { id: "Defect", label: "故障机器人" },
  { id: "Colorless", label: "无色" },
];

// 次筛选：稀有度
const RARITY_OPTIONS = [
  { id: "common", label: "普通" },
  { id: "uncommon", label: "罕见" },
  { id: "rare", label: "稀有" },
  { id: "event", label: "事件" },
  { id: "other", label: "其他" },
];

function PotionsContent() {
  const allPotions = potions as Potion[];
  const searchParams = useSearchParams();
  const router = useRouter();

  const [character, setCharacter] = useState(() => searchParams.get("character") ?? "all");
  const [rarity, setRarity] = useState(() => searchParams.get("rarity") ?? "all");
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    setCharacter(searchParams.get("character") ?? "all");
    setRarity(searchParams.get("rarity") ?? "all");
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (character === "all" && rarity === "all" && !search) {
      if (typeof window !== "undefined" && window.location.search) router.replace("/potions", { scroll: false });
      return;
    }
    const params = new URLSearchParams();
    if (character !== "all") params.set("character", character);
    if (rarity !== "all") params.set("rarity", rarity);
    if (search) params.set("q", search);
    const url = `/potions?${params.toString()}`;
    const current = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";
    if (current !== url) router.replace(url, { scroll: false });
  }, [character, rarity, search, router]);

  const filtered = allPotions.filter((p) => {
    if (character !== "all" && p.class !== character) return false;
    if (rarity !== "all" && p.rarity !== rarity) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.nameEn || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">药水图鉴</h1>
          <Link href="/" className="text-sm text-emerald-400 hover:underline">
            返回首页
          </Link>
        </header>

        <FilterPanel
          categoryOptions={CLASS_OPTIONS}
          category={character}
          onCategoryChange={setCharacter}
          subOptions={RARITY_OPTIONS}
          subFilter={rarity}
          onSubFilterChange={setRarity}
          searchPlaceholder="搜索药水..."
          search={search}
          onSearchChange={setSearch}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/potions/${p.id}`}
              className="flex gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-500 hover:bg-slate-900 transition"
            >
              <div className="relative w-16 h-20 flex-shrink-0 rounded border border-slate-700 overflow-hidden bg-slate-800">
                <CardImage src={p.image || ""} alt={p.name} fill className="object-cover" sizes="64px" containerClassName="!absolute inset-0" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{p.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded ${p.rarity === "common" ? "bg-slate-600" : p.rarity === "uncommon" ? "bg-emerald-600" : p.rarity === "rare" ? "bg-amber-500" : p.rarity === "event" ? "bg-rose-600" : "bg-slate-500"}`}>
                    {p.rarity === "common" ? "普通" : p.rarity === "uncommon" ? "罕见" : p.rarity === "rare" ? "稀有" : p.rarity === "event" ? "事件" : "其他"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{p.nameEn}</p>
                <p className="text-sm text-slate-300 mt-1">{p.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && <p className="text-slate-500 text-center py-8">暂无匹配药水</p>}
      </div>
    </main>
  );
}

export default function PotionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">加载中...</div>}>
      <PotionsContent />
    </Suspense>
  );
}
