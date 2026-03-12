import { notFound } from "next/navigation";
import cards from "../../../data/cards.json";
import { CardImage } from "../../components/CardImage";
import { BackButton } from "../../components/BackButton";

type Card = (typeof cards)[number];

// 静态导出：预生成所有卡牌详情页
export function generateStaticParams() {
  const allCards = cards as { id: string }[];
  return allCards.map((card) => ({ id: card.id }));
}

function hasUpgrade(card: Card): card is Card & { upgraded: Record<string, unknown> } {
  return (
    "upgraded" in card &&
    card.upgraded != null &&
    typeof card.upgraded === "object" &&
    Object.keys(card.upgraded).length > 0
  );
}

interface CardPageProps {
  params: Promise<{ id: string }>;
}

export default async function CardDetailPage({ params }: CardPageProps) {
  const { id } = await params;

  const allCards = cards as Card[];
  const card = allCards.find((c) => c.id === id);

  if (!card) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{card.name}</h1>
          <BackButton fallbackHref="/cards">
            返回卡牌列表
          </BackButton>
        </header>

        <section className="grid gap-6 md:grid-cols-[200px,1fr]">
          <div className="flex items-center justify-center">
            <div className="w-40 h-56 rounded-lg border border-slate-800 bg-slate-900 overflow-hidden relative">
              <CardImage
                src={("image" in card ? card.image : "") || ""}
                alt={card.name}
                fill
                className="object-cover"
                sizes="160px"
                containerClassName="!absolute inset-0"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p>职业：{card.class}</p>
            <p>类型：{card.type}</p>
            <p>稀有度：{card.rarity}</p>
            <p>费用：{card.cost}</p>
            {"damage" in card && typeof card.damage === "number" && (
              <p>基础伤害：{card.damage}</p>
            )}
            {"block" in card && typeof card.block === "number" && (
              <p>基础格挡：{card.block}</p>
            )}
            <div className="mt-4 space-y-4">
              <div>
                <h2 className="font-semibold text-amber-400/90 mb-1">基础效果</h2>
                <p className="text-slate-300">说明：{card.description}</p>
              </div>

              {hasUpgrade(card) && (
                <div className="border-t border-slate-700 pt-4">
                  <h2 className="font-semibold text-emerald-400/90 mb-2">升级后效果</h2>
                  <div className="space-y-1 text-slate-300">
                    {"cost" in card.upgraded && typeof card.upgraded.cost === "number" && (
                      <p>费用：{card.upgraded.cost}</p>
                    )}
                    {"damage" in card.upgraded && typeof card.upgraded.damage === "number" && (
                      <p>伤害：{card.upgraded.damage}</p>
                    )}
                    {"block" in card.upgraded && typeof card.upgraded.block === "number" && (
                      <p>格挡：{card.upgraded.block}</p>
                    )}
                    {"description" in card.upgraded && card.upgraded.description && (
                      <p>说明：{card.upgraded.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {card.tags && card.tags.length > 0 && (
              <div className="mt-4">
                <h2 className="font-semibold mb-1">标签</h2>
                <div className="flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-slate-800 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
