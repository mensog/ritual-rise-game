import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Maximize2, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { AppShell, PageHeader, Segmented } from "@/components/AppShell";
import { fmtTime, useSistema } from "@/lib/sistema-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Фокус — SISTEMA" },
      {
        name: "description",
        content: "Помодоро-таймер SISTEMA: сессии 25/50/90 минут, привязка к привычке и XP за фокус.",
      },
      { property: "og:title", content: "Фокус — SISTEMA" },
      {
        property: "og:description",
        content: "Помодоро-таймер: сессии 25/50/90, привязка к привычке и XP за фокус.",
      },
    ],
  }),
  component: FocusPage,
});

function FocusPage() {
  const s = useSistema();
  const [zen, setZen] = useState(false);
  const f = s.focus;
  const totalSec = (f.mode === "work" ? f.workMin : f.breakMin) * 60;
  const pct = totalSec ? 1 - s.focusRemaining / totalSec : 0;

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && setZen(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const timer = (
    <div className="relative grid place-items-center">
      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        className={cn("-rotate-90", f.running && "animate-breathe")}
      >
        <circle cx="150" cy="150" r="130" fill="none" stroke="var(--muted)" strokeWidth="18" />
        <circle
          cx="150"
          cy="150"
          r="130"
          fill="none"
          stroke={f.mode === "work" ? "var(--primary)" : "var(--calm)"}
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 130}
          strokeDashoffset={2 * Math.PI * 130 * (1 - pct)}
          style={{ transition: "stroke-dashoffset 500ms linear" }}
        />
      </svg>
      <div className="absolute grid place-items-center text-center">
        <div className="num text-6xl font-bold">{fmtTime(s.focusRemaining)}</div>
        <div className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          {f.mode === "work" ? "фокус" : "перерыв"}
        </div>
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full",
                i < f.cycle % 4 || (f.cycle > 0 && f.cycle % 4 === 0)
                  ? "bg-primary"
                  : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (zen) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background">
        <div className="scale-125">{timer}</div>
        <p className="absolute bottom-10 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          ESC — выйти
        </p>
      </div>
    );
  }

  const todaySessions = s.focusSessions.filter(
    (x) => new Date(x.finishedAt).toDateString() === new Date().toDateString(),
  );
  const todayMin = todaySessions.reduce((a, x) => a + x.minutes, 0);

  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const min = s.focusSessions
      .filter((x) => new Date(x.finishedAt).toDateString() === d.toDateString())
      .reduce((a, x) => a + x.minutes, 0);
    return { label: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"][d.getDay()], min };
  });
  const maxMin = Math.max(60, ...weekBars.map((b) => b.min));

  return (
    <AppShell>
      <PageHeader
        eyebrow="ВРЕМЯ В ДЕЛЕ"
        title="Фокус"
        right={
          <button
            onClick={() => setZen(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-elevated px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Maximize2 className="h-4 w-4" /> Zen-режим
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section
          className={cn(
            "surface grid place-items-center p-8 transition-colors",
            f.mode === "break" && "bg-calm/10",
          )}
        >
          {timer}

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {f.running ? (
              <button
                onClick={s.pauseFocus}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
              >
                <Pause className="h-4 w-4" /> Пауза
              </button>
            ) : (
              <button
                onClick={s.startFocus}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                <Play className="h-4 w-4" /> Начать
              </button>
            )}
            <button
              onClick={s.resetFocus}
              className="flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" /> Сбросить
            </button>
            {f.mode === "break" && (
              <button
                onClick={s.skipBreak}
                className="flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium hover:bg-muted"
              >
                <SkipForward className="h-4 w-4" /> Пропустить перерыв
              </button>
            )}
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Сессия завершится сама — таймер переживает переходы между экранами и перезагрузку.
          </p>
        </section>

        <div className="space-y-6">
          <section className="surface p-6">
            <h2 className="mb-4 text-lg font-bold">Настройка сессии</h2>

            <div className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Длительность
                </div>
                <Segmented
                  value={[25, 50, 90].includes(f.workMin) ? String(f.workMin) : "custom"}
                  onChange={(v) => v !== "custom" && s.configureFocus({ workMin: Number(v) })}
                  options={[
                    { value: "25", label: "25" },
                    { value: "50", label: "50" },
                    { value: "90", label: "90" },
                    { value: "custom", label: "Своя" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NumField
                  label="Фокус, мин"
                  value={f.workMin}
                  min={1}
                  max={240}
                  onChange={(v) => s.configureFocus({ workMin: v })}
                />
                <NumField
                  label="Перерыв, мин"
                  value={f.breakMin}
                  min={1}
                  max={120}
                  onChange={(v) => s.configureFocus({ breakMin: v })}
                />
                <NumField
                  label="Длинный, мин"
                  value={f.longBreakMin}
                  min={1}
                  max={180}
                  onChange={(v) => s.configureFocus({ longBreakMin: v })}
                />
                <NumField
                  label="Циклов до длинного"
                  value={f.cyclesBeforeLong}
                  min={1}
                  max={12}
                  onChange={(v) => s.configureFocus({ cyclesBeforeLong: v })}
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-border bg-elevated p-3">
                <input
                  type="checkbox"
                  checked={f.longBreak}
                  onChange={(e) => s.configureFocus({ longBreak: e.target.checked })}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span className="text-sm font-medium">
                  Длинный перерыв каждые {f.cyclesBeforeLong} сессии
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-border bg-elevated p-3">
                <input
                  type="checkbox"
                  checked={f.autoStart}
                  onChange={(e) => s.configureFocus({ autoStart: e.target.checked })}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span className="text-sm font-medium">Автозапуск следующей сессии</span>
              </label>


              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Привычка
                </span>
                <select
                  value={f.habitId ?? ""}
                  onChange={(e) =>
                    s.configureFocus({ habitId: e.target.value || null })
                  }
                  className="w-full rounded-xl border border-input bg-elevated px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">— без привязки —</option>
                  {s.habits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.icon} {h.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Задача
                </span>
                <input
                  value={f.label}
                  onChange={(e) => s.configureFocus({ label: e.target.value })}
                  placeholder="Что делаешь сейчас?"
                  className="w-full rounded-xl border border-input bg-elevated px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            </div>
          </section>

          <section className="surface p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold">Сегодня</h2>
              <span className="num text-2xl font-bold text-primary">
                {Math.floor(todayMin / 60)}ч {todayMin % 60}м
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {todaySessions.map((x) => {
                const habit = s.habits.find((h) => h.id === x.habitId);
                return (
                  <div
                    key={x.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-elevated px-3 py-2 text-sm"
                  >
                    <span>{habit?.icon ?? "🎯"}</span>
                    <span className="truncate font-medium">{habit?.name ?? x.label}</span>
                    <span className="num ml-auto font-semibold">{x.minutes}м</span>
                    <span className="num text-xs text-muted-foreground">
                      {new Date(x.finishedAt).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
              {todaySessions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Сегодня ещё ни одной сессии. Начни с 25 минут.
                </p>
              )}
            </div>

            <div className="mt-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Неделя в фокусе
              </div>
              <div className="flex h-24 items-end gap-2">
                {weekBars.map((b, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full flex-1 items-end rounded-md bg-muted/60">
                      <div
                        className="xp-bar w-full rounded-md"
                        style={{ height: `${Math.max(3, (b.min / maxMin) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function NumField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isFinite(n)) return;
          onChange(Math.min(max, Math.max(min, Math.round(n))));
        }}
        className="num w-full rounded-xl border border-input bg-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
