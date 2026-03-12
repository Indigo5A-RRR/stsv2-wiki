import { notFound } from "next/navigation";
import relics from "../../../data/relics.json";
import { CardImage } from "../../components/CardImage";
import { BackButton } from "../../components/BackButton";

type Relic = (typeof relics)[number];

export function generateStaticParams() {
  return (relics as { id: string }[]).map((r) => ({ id: r.id }));
}

export default async function RelicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const relic = (relics as Relic[]).find((r) => r.id === id);
  if (!relic) return notFound();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{relic.name}</h1>
          <BackButton fallbackHref="/relics">
            返回遗物列表
          </BackButton>
        </header>
        <section className="grid gap-6 md:grid-cols-[120px,1fr]">
          <div className="w-28 h-28 rounded-lg border border-slate-800 bg-slate-900 overflow-hidden relative">
            <CardImage src={relic.image || ""} alt={relic.name} fill className="object-cover" sizes="112px" containerClassName="!absolute inset-0" />
          </div>
          <div>
            <p className="text-slate-400">{relic.nameEn}</p>
            <p className="mt-2">职业：{relic.classLabel || relic.class}</p>
            <p>分类：{relic.categoryLabel || relic.category}</p>
            <p className="mt-4 text-slate-300">{relic.descriptionZh || relic.description}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
