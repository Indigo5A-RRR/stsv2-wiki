"use client";

import { useState } from "react";

type FilterOption = { id: string; label: string };

type FilterSection = {
  title: string;
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
};

type FilterSidebarProps = {
  sections: FilterSection[];
  searchPlaceholder?: string;
  search?: string;
  onSearchChange?: (v: string) => void;
  children?: React.ReactNode;
};

export function FilterSidebar({
  sections,
  searchPlaceholder = "搜索...",
  search = "",
  onSearchChange,
  children,
}: FilterSidebarProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">{children}</div>

      <aside
        className={`flex-shrink-0 transition-all duration-200 ${
          expanded ? "w-56 opacity-100" : "w-12 opacity-80"
        }`}
      >
        <div className="sticky top-4 rounded-lg border border-slate-800 bg-slate-900/80 p-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between text-sm font-medium text-slate-300 mb-3 hover:text-emerald-400"
          >
            <span>{expanded ? "筛选" : "筛选"}</span>
            <span className="text-slate-500">
              {expanded ? "◀" : "▶"}
            </span>
          </button>

          {expanded ? (
            <div className="space-y-4">
              {onSearchChange && (
                <div>
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm placeholder-slate-500"
                  />
                </div>
              )}

              {sections.map((section) => (
                <div key={section.title}>
                  <p className="text-xs font-medium text-slate-500 mb-2">{section.title}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => section.onChange("all")}
                      className={`px-2.5 py-1 rounded text-xs transition ${
                        section.value === "all"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      全部
                    </button>
                    {section.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => section.onChange(opt.id)}
                        className={`px-2.5 py-1 rounded text-xs transition ${
                          section.value === opt.id
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
