import { notFound } from "next/navigation";
import potions from "../../../data/potions.json";
import { CardImage } from "../../components/CardImage";
import { BackButton } from "../../components/BackButton";

type Potion = (typeof potions)[number];

export function generateStaticParams() {
  return (potions as { id: string }[]).map((p) => ({ id: p.id }));
}

export default async function PotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const potion = (potions as Potion[]).find((p) => p.id === id);
  if (!potion) return notFound();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{potion.name}</h1>
          <BackButton fallbackHref="/potions">
            返回药水列表
          </BackButton>
        </header>
        <section className="grid gap-6 md:grid-cols-[120px,1fr]">
          <div className="w-24 h-32 rounded-lg border border-slate-800 bg-slate-900 overflow-hidden relative">
            <CardImage src={potion.image || ""} alt={potion.name} fill className="object-cover" sizes="96px" containerClassName="!absolute inset-0" />
          </div>
          <div>
            <p className="text-slate-400">{potion.nameEn}</p>
            <p className="mt-2">职业：{potion.class === "Ironclad" ? "铁甲战士" : potion.class === "Silent" ? "静默猎手" : potion.class === "Regent" ? "储君" : potion.class === "Necrobinder" ? "亡灵契约师" : potion.class === "Defect" ? "故障机器人" : potion.class === "Colorless" ? "无色" : potion.class}</p>
            <p>稀有度：{potion.rarity === "common" ? "普通" : potion.rarity === "uncommon" ? "罕见" : potion.rarity === "rare" ? "稀有" : potion.rarity === "event" ? "事件" : potion.rarity === "other" ? "其他" : potion.rarity}</p>
            <p className="mt-4 text-slate-300">{potion.description}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
