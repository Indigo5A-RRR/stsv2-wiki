import { notFound } from "next/navigation";
import enchantments from "../../../data/enchantments.json";
import { BackButton } from "../../components/BackButton";

type Enchantment = (typeof enchantments)[number];

export function generateStaticParams() {
  return (enchantments as { id: string }[]).map((e) => ({ id: e.id }));
}

export default async function EnchantmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enc = (enchantments as Enchantment[]).find((e) => e.id === id);
  if (!enc) return notFound();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{enc.name}</h1>
          <BackButton fallbackHref="/enchantments">
            返回附魔列表
          </BackButton>
        </header>
        <section>
          <p className="text-slate-400">{enc.nameEn}</p>
          <p className="mt-4 text-slate-300">{enc.description}</p>
          {enc.extraCardText && (
            <p className="mt-2 text-sm text-slate-400">卡牌显示：{enc.extraCardText}</p>
          )}
        </section>
      </div>
    </main>
  );
}
