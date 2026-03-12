import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        杀戮尖塔 2 百科（非官方）
      </h1>
      <p className="mb-8 text-slate-300">
        杀戮尖塔 2 卡牌、遗物、药水、附魔、怪物图鉴。
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/cards"
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold"
        >
          卡牌图鉴
        </Link>
        <Link
          href="/relics"
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold"
        >
          遗物图鉴
        </Link>
        <Link
          href="/potions"
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold"
        >
          药水图鉴
        </Link>
        <Link
          href="/enchantments"
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold"
        >
          附魔图鉴
        </Link>
        <Link
          href="/monsters"
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold"
        >
          怪物图鉴
        </Link>
      </div>
    </main>
  );
}