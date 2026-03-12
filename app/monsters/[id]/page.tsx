import { notFound } from "next/navigation";
import monsters from "../../../data/monsters.json";
import { CardImage } from "../../components/CardImage";
import { BackButton } from "../../components/BackButton";

type Monster = (typeof monsters)[number];

type IntentInfo = {
  intent: string;
  description?: string | null;
  damage?: number | null;
  block?: number | null;
  repeat?: number | null;
  logic?: string | null;
};

type MoveWithIntents = {
  id: string;
  title: string;
  titleEn?: string;
  intents?: IntentInfo[];
  intent?: string;
  description?: string | null;
  damage?: number | null;
  block?: number | null;
  repeat?: number | null;
  logic?: string | null;
};

function getIntentsFromMove(move: MoveWithIntents): IntentInfo[] {
  if (move.intents && move.intents.length > 0) {
    return move.intents;
  }
  if (move.intent) {
    return [
      {
        intent: move.intent,
        description: move.description,
        damage: move.damage,
        block: move.block,
        repeat: move.repeat,
        logic: move.logic,
      },
    ];
  }
  return [];
}

export function generateStaticParams() {
  const allMonsters = monsters as { id: string }[];
  return allMonsters.map((m) => ({ id: m.id }));
}

interface MonsterPageProps {
  params: Promise<{ id: string }>;
}

export default async function MonsterDetailPage({ params }: MonsterPageProps) {
  const { id } = await params;

  const allMonsters = monsters as Monster[];
  const monster = allMonsters.find((m) => m.id === id);

  if (!monster) {
    return notFound();
  }

  const moves = (monster.moves || []) as MoveWithIntents[];
  const monsterWithPassive = monster as Monster & { passive?: string };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{monster.name}</h1>
          <BackButton fallbackHref="/monsters">
            返回怪物列表
          </BackButton>
        </header>

        <section className="grid gap-6 md:grid-cols-[160px,1fr]">
          <div className="flex justify-center">
            <div className="w-40 h-40 rounded-lg border border-slate-800 bg-slate-900 overflow-hidden relative">
              <CardImage
                src={monster.image || ""}
                alt={monster.name}
                fill
                className="object-cover"
                sizes="160px"
                containerClassName="!absolute inset-0"
                priority
              />
            </div>
          </div>

          <div className="space-y-2">
            {monster.nameEn && (
              <p className="text-slate-400">英文名：{monster.nameEn}</p>
            )}
            <p>
              类型：{monster.category === "boss" ? "Boss" : monster.category === "elite" ? "精英" : "普通"}
            </p>
            {monsterWithPassive.passive && (
              <div className="mt-2 p-3 rounded-lg bg-amber-950/40 border border-amber-800/50">
                <p className="text-sm font-medium text-amber-400/90 mb-1">被动 / 特殊机制</p>
                <p className="text-sm text-slate-300">{monsterWithPassive.passive}</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-amber-400/90">行为 / 技能</h2>
          <div className="space-y-6">
            {moves.map((move) => {
              const intents = getIntentsFromMove(move);
              if (intents.length === 0) return null;
              return (
                <div
                  key={move.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                >
                  <h3 className="font-semibold text-emerald-400/90 mb-2">
                    {move.title}
                    {move.titleEn && (
                      <span className="text-slate-500 font-normal ml-2">
                        {move.titleEn}
                      </span>
                    )}
                  </h3>
                  {intents.map((info, idx) => (
                    <div key={idx} className="mt-3 pl-3 border-l-2 border-slate-700">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-rose-600/80 text-xs">
                          {info.intent}
                        </span>
                        {info.damage != null && (
                          <span className="text-rose-400 text-sm">
                            伤害 {info.damage}
                            {info.repeat != null && info.repeat > 1
                              ? ` × ${info.repeat}`
                              : ""}
                          </span>
                        )}
                        {info.block != null && info.block > 0 && (
                          <span className="text-cyan-400 text-sm">
                            格挡 {info.block}
                          </span>
                        )}
                      </div>
                      {info.description && (
                        <p className="text-sm text-slate-400 mb-1">
                          {info.description}
                        </p>
                      )}
                      {info.logic && (
                        <p className="text-sm text-slate-300">{info.logic}</p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
