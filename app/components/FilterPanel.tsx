"use client";

type FilterOption = { id: string; label: string };

type FilterPanelProps = {
  categoryOptions?: FilterOption[];
  category?: string;
  onCategoryChange?: (v: string) => void;
  subOptions?: FilterOption[];
  subFilter?: string;
  onSubFilterChange?: (v: string) => void;
  costOptions?: FilterOption[];
  costFilter?: string;
  onCostFilterChange?: (v: string) => void;
  typeOptions?: FilterOption[];
  typeFilter?: string;
  onTypeFilterChange?: (v: string) => void;
  actOptions?: FilterOption[];
  actFilter?: string;
  onActFilterChange?: (v: string) => void;
  searchPlaceholder?: string;
  search?: string;
  onSearchChange?: (v: string) => void;
};

export function FilterPanel({
  categoryOptions,
  category = "all",
  onCategoryChange = () => {},
  subOptions,
  subFilter = "all",
  onSubFilterChange,
  costOptions,
  costFilter = "all",
  onCostFilterChange,
  typeOptions,
  typeFilter = "all",
  onTypeFilterChange,
  actOptions,
  actFilter = "all",
  onActFilterChange,
  searchPlaceholder = "搜索...",
  search = "",
  onSearchChange,
}: FilterPanelProps) {
  return (
    <div className="space-y-4 mb-6">
      {categoryOptions && categoryOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((c) => (
            <button
              key={c.id}
              onClick={() => onCategoryChange(c.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                category === c.id
                  ? "bg-emerald-500 text-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {subOptions && subOptions.length > 0 && onSubFilterChange && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSubFilterChange("all")}
            className={`px-3 py-1.5 rounded text-sm transition ${
              subFilter === "all"
                ? "bg-slate-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            全部
          </button>
          {subOptions.map((c) => (
            <button
              key={c.id}
              onClick={() => onSubFilterChange(c.id)}
              className={`px-3 py-1.5 rounded text-sm transition ${
                subFilter === c.id
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {costOptions && costOptions.length > 0 && onCostFilterChange && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-slate-500 text-sm">费用：</span>
          {costOptions.map((c) => (
            <button
              key={c.id}
              onClick={() => onCostFilterChange(c.id)}
              className={`px-3 py-1.5 rounded text-sm transition ${
                costFilter === c.id
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {typeOptions && typeOptions.length > 0 && onTypeFilterChange && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-slate-500 text-sm">类型：</span>
          <button
            onClick={() => onTypeFilterChange("all")}
            className={`px-3 py-1.5 rounded text-sm transition ${
              typeFilter === "all"
                ? "bg-slate-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            全部
          </button>
          {typeOptions.map((c) => (
            <button
              key={c.id}
              onClick={() => onTypeFilterChange(c.id)}
              className={`px-3 py-1.5 rounded text-sm transition ${
                typeFilter === c.id
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {actOptions && actOptions.length > 0 && onActFilterChange && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-slate-500 text-sm">幕次：</span>
          <button
            onClick={() => onActFilterChange("all")}
            className={`px-3 py-1.5 rounded text-sm transition ${
              actFilter === "all"
                ? "bg-slate-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            全部
          </button>
          {actOptions.map((c) => (
            <button
              key={c.id}
              onClick={() => onActFilterChange(c.id)}
              className={`px-3 py-1.5 rounded text-sm transition ${
                actFilter === c.id
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {onSearchChange && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500"
        />
      )}
    </div>
  );
}
