"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CardImage } from "../components/CardImage";
import { FilterPanel } from "../components/FilterPanel";
import monsters from "../../data/monsters.json";

type Monster = (typeof monsters)[number];

const PAGE_SIZE = 24;

// 第一层：类型
const CATEGORY_OPTIONS = [
  { id: "all", label: "全部" },
  { id: "boss", label: "Boss" },
  { id: "elite", label: "精英" },
  { id: "normal", label: "普通" },
];

function MonstersContent() {
  const allMonsters = monsters as Monster[];
  const searchParams = useSearchParams();
  const router = useRouter();

  const [category, setCategory] = useState<string>(() => searchParams.get("category") ?? "all");
  const [search, setSearch] = useState<string>(() => searchParams.get("q") ?? "");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setCategory(searchParams.get("category") ?? "all");
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, search]);

  useEffect(() => {
    if (category === "all" && !search) {
      if (typeof window !== "undefined" && window.location.search) router.replace("/monsters", { scroll: false });
      return;
    }
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("q", search);
    const url = `/monsters?${params.toString()}`;
    const current = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";
    if (current !== url) router.replace(url, { scroll: false });
  }, [category, search, router]);

  const filteredMonsters = allMonsters.filter((m) => {
    const matchCat = category === "all" || m.category === category;
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.nameEn && m.nameEn.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const displayedMonsters = filteredMonsters.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMonsters.length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">怪物图鉴</h1>
          <Link href="/" className="text-sm text-emerald-400 hover:underline">
            返回首页
          </Link>
        </header>

        <FilterPanel
          categoryOptions={CATEGORY_OPTIONS}
          category={category}
          onCategoryChange={setCategory}
          searchPlaceholder="搜索怪物..."
          search={search}
          onSearchChange={setSearch}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayedMonsters.map((monster) => (
            <Link
              key={monster.id}
              href={`/monsters/${monster.id}`}
              className="flex gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-500 hover:bg-slate-900 transition"
            >
              <div className="relative w-20 h-20 flex-shrink-0 rounded border border-slate-700 overflow-hidden bg-slate-800">
                <CardImage
                  src={monster.image || ""}
                  alt={monster.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  containerClassName="!absolute inset-0"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold">{monster.name}</h2>
                {monster.nameEn && (
                  <p className="text-xs text-slate-500">{monster.nameEn}</p>
                )}
                <div className="mt-1 flex flex-wrap gap-2">
                  {monster.category === "boss" && (
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-600/80">
                      Boss
                    </span>
                  )}
                  {monster.category === "elite" && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-600/80">
                      精英
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              className="px-6 py-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition"
            >
              加载更多 ({filteredMonsters.length - visibleCount} 个)
            </button>
          </div>
        )}

        {filteredMonsters.length === 0 && (
          <p className="text-slate-500 text-center py-8">暂无匹配怪物</p>
        )}
      </div>
    </main>
  );
}

export default function MonstersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">加载中...</div>}>
      <MonstersContent />
    </Suspense>
  );
}
