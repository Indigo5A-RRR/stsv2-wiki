"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CardImage } from "../components/CardImage";
import { FilterPanel } from "../components/FilterPanel";
import relics from "../../data/relics.json";

type Relic = (typeof relics)[number];

// 第一层：大类（初始、罕见、稀有、商店、先古）
const CATEGORY_OPTIONS = [
  { id: "all", label: "全部" },
  { id: "starter", label: "初始" },
  { id: "uncommon", label: "罕见" },
  { id: "rare", label: "稀有" },
  { id: "shop", label: "商店" },
  { id: "ancient", label: "先古" },
];

// 第二层：五个角色（用于 初始/罕见/稀有/商店）
const CLASS_OPTIONS = [
  { id: "Ironclad", label: "铁甲战士" },
  { id: "Silent", label: "静默猎手" },
  { id: "Regent", label: "储君" },
  { id: "Necrobinder", label: "亡灵契约师" },
  { id: "Defect", label: "故障机器人" },
];

// 先古子分类：哪个 Boss 给的
const ANCIENT_SOURCE_OPTIONS = [
  { id: "darv", label: "Boss遗物" },
  { id: "orobas", label: "奥罗巴斯" },
  { id: "pael", label: "帕埃尔" },
  { id: "tanx", label: "坦克斯" },
  { id: "tezcatara", label: "特兹卡特拉" },
  { id: "vakuu", label: "瓦库" },
];

const ANCIENT_CATEGORIES = ["darv", "orobas", "pael", "tanx", "tezcatara", "vakuu"];

const ANCIENT_LABELS: Record<string, string> = {
  darv: "Boss遗物",
  orobas: "奥罗巴斯",
  pael: "帕埃尔",
  tanx: "坦克斯",
  tezcatara: "特兹卡特拉",
  vakuu: "瓦库",
};

const CLASS_LABELS: Record<string, string> = {
  Ironclad: "铁甲战士",
  Silent: "静默猎手",
  Regent: "储君",
  Necrobinder: "亡灵契约师",
  Defect: "故障机器人",
  Colorless: "无色",
};

function matchCategory(r: Relic, category: string): boolean {
  if (category === "all") return true;
  if (category === "ancient") return ANCIENT_CATEGORIES.includes(r.category);
  return r.category === category;
}

function getDisplaySource(r: Relic): string {
  const map: Record<string, string> = {
    starter: "初始",
    common: "普通",
    uncommon: "罕见",
    rare: "稀有",
    shop: "商店",
  };
  return map[r.category] ?? r.classLabel ?? r.class;
}

function RelicsContent() {
  const allRelics = relics as Relic[];
  const searchParams = useSearchParams();
  const router = useRouter();

  const [category, setCategory] = useState(() => searchParams.get("category") ?? "all");
  const [subFilter, setSubFilter] = useState(() => searchParams.get("sub") ?? "all");
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    setCategory(searchParams.get("category") ?? "all");
    setSubFilter(searchParams.get("sub") ?? "all");
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (category === "all" && subFilter === "all" && !search) {
      if (typeof window !== "undefined" && window.location.search) router.replace("/relics", { scroll: false });
      return;
    }
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (subFilter !== "all") params.set("sub", subFilter);
    if (search) params.set("q", search);
    const url = `/relics?${params.toString()}`;
    const current = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";
    if (current !== url) router.replace(url, { scroll: false });
  }, [category, subFilter, search, router]);

  const isAncient = category === "ancient";
  const subOptions = isAncient ? ANCIENT_SOURCE_OPTIONS : CLASS_OPTIONS;

  const filtered = allRelics.filter((r) => {
    if (!matchCategory(r, category)) return false;
    if (isAncient) {
      if (subFilter !== "all" && r.category !== subFilter) return false;
    } else {
      if (subFilter !== "all" && r.class !== subFilter) return false;
    }
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !(r.nameEn || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">遗物图鉴</h1>
          <Link href="/" className="text-sm text-emerald-400 hover:underline">
            返回首页
          </Link>
        </header>

        <FilterPanel
          categoryOptions={CATEGORY_OPTIONS}
          category={category}
          onCategoryChange={(v) => {
            setCategory(v);
            setSubFilter("all");
          }}
          subOptions={subOptions}
          subFilter={subFilter}
          onSubFilterChange={setSubFilter}
          searchPlaceholder="搜索遗物..."
          search={search}
          onSearchChange={setSearch}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Link
              key={r.id}
              href={`/relics/${r.id}`}
              className="flex gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-500 hover:bg-slate-900 transition"
            >
              <div className="relative w-16 h-16 flex-shrink-0 rounded border border-slate-700 overflow-hidden bg-slate-800">
                <CardImage src={r.image || ""} alt={r.name} fill className="object-cover" sizes="64px" containerClassName="!absolute inset-0" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold">{r.name}</h2>
                <p className="text-xs text-slate-500">
                  {r.nameEn}
                  {isAncient && ANCIENT_CATEGORIES.includes(r.category) ? (
                    <> · 先古 · {ANCIENT_LABELS[r.category]}</>
                  ) : (
                    <> · {CLASS_LABELS[r.class] ?? r.class} · {getDisplaySource(r)}</>
                  )}
                </p>
                <p className="text-sm text-slate-300 mt-1 line-clamp-2">{r.descriptionZh || r.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && <p className="text-slate-500 text-center py-8">暂无匹配遗物</p>}
      </div>
    </main>
  );
}

export default function RelicsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">加载中...</div>}>
      <RelicsContent />
    </Suspense>
  );
}
