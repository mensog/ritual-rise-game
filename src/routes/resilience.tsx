import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Crown, HeartHandshake } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { todayIso, useSistema } from "@/lib/sistema-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resilience")({
  head: () => ({
    meta: [
      { title: "Стойкость — SISTEMA" },
      {
        name: "description",
        content: "Миссия дня, boss-дни и протокол возврата после срыва — без стыда, с планом.",
      },
      { property: "og:title", content: "Стойкость — SISTEMA" },
      {
        property: "og:description",
        content: "Миссия дня, boss-дни и протокол возврата после срыва.",
      },
    ],
  }),
  component: ResiliencePage,
});

function ResiliencePage() {
  const s = useSistema();
  const [date, setDate] = useState(todayIso());
  const [strategy, setStrategy] = useState("");
  const [trigger, setTrigger] = useState("");
  const [reflection, setReflection] = useState("");

  const habit = s.habits[0];

  return (
    <AppShell>
      <PageHeader eyebrow="АНТИХРУПКОСТЬ" title="Стойкость" />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface bg-gradient-to-br from-primary-soft/60 to-transparent p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Миссия дня</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                {habit
                  ? `Сегодня закрой привычку «${habit.name}» — одно точное действие.`
                  : "Добавь первую привычку в Планере — и миссия появится."}
              </p>
            </div>
            {s.missionDone ? (
              <span className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
                <Check className="h-4 w-4" strokeWidth={3} /> выполнено
              </span>
            ) : (
              <button
                onClick={s.completeMission}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                Выполнить <span className="num opacity-80">+15 XP</span>
              </button>
            )}
          </div>
        </section>

        <section className="surface p-6">
          <div className="mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-flame" />
            <h2 className="text-lg font-bold">Boss-дни</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Запланируй трудный день заранее. Заранее — значит наполовину пройден.
          </p>
          <div className="space-y-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-elevated px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              placeholder="Стратегия: пороги вместо целей…"
              className="w-full rounded-xl border border-input bg-elevated px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => {
                if (!strategy.trim()) return;
                s.addBossDay(date, strategy.trim());
                setStrategy("");
              }}
              className="w-full rounded-xl bg-flame py-2.5 text-sm font-bold text-flame-foreground"
            >
              Запланировать
            </button>
          </div>

          <div className="mt-5 space-y-2">
            {s.bossDays.map((b) => (
              <div key={b.id} className="rounded-xl border border-border bg-elevated p-3">
                <div className="flex items-center gap-2">
                  <span className="num text-sm font-bold">{b.date}</span>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                      b.status === "passed" && "bg-primary-soft text-accent-foreground",
                      b.status === "scheduled" && "bg-muted text-muted-foreground",
                      b.status === "failed" && "bg-destructive/15 text-destructive",
                    )}
                  >
                    {b.status === "passed"
                      ? "пройден"
                      : b.status === "failed"
                        ? "не вышло"
                        : "запланирован"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{b.strategy}</p>
                {b.status === "scheduled" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => s.resolveBossDay(b.id, true)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                    >
                      Выстоял <span className="num">+50 XP</span>
                    </button>
                    <button
                      onClick={() => s.resolveBossDay(b.id, false)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
                    >
                      Не вышло
                    </button>
                  </div>
                )}
              </div>
            ))}
            {s.bossDays.length === 0 && (
              <p className="text-sm text-muted-foreground">Пока нет запланированных boss-дней.</p>
            )}
          </div>
        </section>

        <section className="surface p-6">
          <div className="mb-4 flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-calm" />
            <h2 className="text-lg font-bold">Протокол возврата</h2>
          </div>
          <div className="rounded-xl border border-calm/40 bg-calm/10 p-4 text-sm">
            Срыв не наказывается. Вернись с малого — история и уровень целы.
          </div>

          <div className="mt-4 space-y-3">
            <input
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="Что выбило из ритма?"
              className="w-full rounded-xl border border-input bg-elevated px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              placeholder="С чего начну возвращение…"
              className="w-full resize-none rounded-xl border border-input bg-elevated px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => {
                if (!trigger.trim() && !reflection.trim()) return;
                s.addReturn(trigger.trim(), reflection.trim());
                setTrigger("");
                setReflection("");
              }}
              className="w-full rounded-xl bg-calm py-2.5 text-sm font-bold text-calm-foreground"
            >
              Записать возврат
            </button>
          </div>

          <div className="mt-5 space-y-2">
            {s.returns.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-elevated p-3">
                <div className="num text-xs font-bold text-muted-foreground">{r.date}</div>
                <div className="mt-1 text-sm font-medium">{r.trigger || "—"}</div>
                {r.reflection && (
                  <p className="mt-1 text-sm text-muted-foreground">{r.reflection}</p>
                )}
              </div>
            ))}
            {s.returns.length === 0 && (
              <p className="text-sm text-muted-foreground">Записей пока нет. И это тоже нормально.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
