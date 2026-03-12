"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FilterPanel } from "../components/FilterPanel";
import enchantments from "../../data/enchantments.json";

type Enchantment = (typeof enchantments)[number];

function EnchantmentsContent() {
  const all = enchantments as Enchantment[];
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (!search) {
      if (typeof window !== "undefined" && window.location.search) router.replace("/enchantments", { scroll: false });
      return;
    }
    const url = `/enchantments?q=${encodeURIComponent(search)}`;
    const current = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";
    if (current !== url) router.replace(url, { scroll: false });
  }, [search, router]);

  const filtered = all.filter(
    (e) =>
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.nameEn || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">附魔图鉴</h1>
          <Link href="/" className="text-sm text-emerald-400 hover:underline">
            返回首页
          </Link>
        </header>

        <FilterPanel
          searchPlaceholder="搜索附魔..."
          search={search}
          onSearchChange={setSearch}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <Link
              key={e.id}
              href={`/enchantments/${e.id}`}
              className="flex rounded-lg border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-500 hover:bg-slate-900 transition"
            >
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold">{e.name}</h2>
                <p className="text-xs text-slate-500">{e.nameEn}</p>
                <p className="text-sm text-slate-300 mt-1 line-clamp-2">{e.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && <p className="text-slate-500 text-center py-8">暂无匹配附魔</p>}
      </div>
    </main>
  );
}

export default function EnchantmentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">加载中...</div>}>
      <EnchantmentsContent />
    </Suspense>
  );
}
