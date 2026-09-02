import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Crown, Lock } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Modal } from "@/components/Modal";
import { STAGES, useSistema } from "@/lib/sistema-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Путь — SISTEMA" },
      {
        name: "description",
        content: "Программа на 30 этапов: недели, boss-дни и атрибуты характера.",
      },
      { property: "og:title", content: "Путь — SISTEMA" },
      {
        property: "og:description",
        content: "Программа на 30 этапов: недели, boss-дни и атрибуты характера.",
      },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const s = useSistema();
  const [open, setOpen] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");

  const done = s.journeyDone;
  const current = Math.min(30, done + 1);
  const pct = Math.round((done / 30) * 100);

  const weeks: number[][] = [];
  for (let i = 0; i < 30; i += 7) weeks.push(STAGES.slice(i, i + 7).map((st) => st.day));

  const stateOf = (day: number) =>
    day <= done ? "done" : day === current ? "open" : "locked";

  return (
    <AppShell>
      <PageHeader eyebrow={`ПУТЬ · ДЕНЬ ${current}`} title="Путь" />

      <section className="surface mb-6 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="num text-4xl font-bold">
              Пройдено {done} <span className="text-muted-foreground">/ 30</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Только следующий день открыт. Сделай его — и путь двинется.
            </p>
          </div>
          <div className="num text-3xl font-bold text-primary">{pct}%</div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="xp-bar h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Object.entries(s.attributes).map(([k, v]) => (
          <div key={k} className="surface p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
            <div className="num mt-2 text-3xl font-bold text-primary">{v}</div>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {weeks.map((week, wi) => (
          <section key={wi} className="surface p-6">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-bold">Неделя {wi + 1}</h2>
              <span className="text-xs text-muted-foreground">
                {week.filter((d) => d <= done).length} / {week.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {week.map((day) => {
                const stage = STAGES[day - 1];
                const st = stateOf(day);
                return (
                  <button
                    key={day}
                    disabled={st === "locked"}
                    onClick={() => {
                      setReflection(s.reflections[day] ?? "");
                      setOpen(day);
                    }}
                    className={cn(
                      "flex h-28 flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all",
                      st === "done" && "border-primary/50 bg-primary-soft/50",
                      st === "open" && "border-primary bg-elevated shadow-glow hover:scale-[1.03]",
                      st === "locked" && "cursor-not-allowed border-border bg-muted/40 opacity-60",
                      stage.boss && st !== "locked" && "border-flame/60",
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="num text-xs font-bold text-muted-foreground">{day}</span>
                      {st === "done" ? (
                        <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                      ) : st === "locked" ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : stage.boss ? (
                        <Crown className="h-4 w-4 text-flame" />
                      ) : null}
                    </div>
                    <span className="line-clamp-3 text-xs font-semibold">{stage.title}</span>
                    {stage.boss && (
                      <span className="mt-auto rounded-md bg-flame/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-flame">
                        boss
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {open !== null && (
        <Modal
          title={`День ${open}. ${STAGES[open - 1].title}`}
          onClose={() => setOpen(null)}
        >
          <p className="text-sm leading-relaxed text-muted-foreground">{STAGES[open - 1].lesson}</p>
          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Рефлексия
            </span>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              placeholder="Что получилось сегодня…"
              className="w-full resize-none rounded-xl border border-input bg-elevated px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setOpen(null)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Закрыть
            </button>
            {open > done ? (
              <button
                onClick={() => {
                  s.completeStage(open, reflection);
                  setOpen(null);
                }}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow"
              >
                Завершить день
              </button>
            ) : (
              <span className="grid place-items-center rounded-xl bg-primary-soft px-4 text-sm font-semibold text-accent-foreground">
                ✓ пройден
              </span>
            )}
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
