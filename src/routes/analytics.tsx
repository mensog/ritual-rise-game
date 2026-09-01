import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MONTHS_RU, daysInMonth, iso, useSistema } from "@/lib/sistema-store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Аналитика — SISTEMA" },
      {
        name: "description",
        content: "Процент выполнения, идеальные дни, настроение, мотивация и время в фокусе за месяц.",
      },
      { property: "og:title", content: "Аналитика — SISTEMA" },
      {
        property: "og:description",
        content: "Процент выполнения, идеальные дни, настроение и время в фокусе за месяц.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const s = useSistema();
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const total = daysInMonth(ym.y, ym.m);
  const days = useMemo(
    () => Array.from({ length: total }, (_, i) => iso(new Date(ym.y, ym.m, i + 1))),
    [ym, total],
  );

  const possible = total * s.habits.length;
  const checks = days.reduce(
    (acc, d) => acc + s.habits.filter((h) => s.isChecked(h.id, d)).length,
    0,
  );
  const rate = possible ? Math.round((checks / possible) * 100) : 0;
  const perfect = days.filter(
    (d) => s.habits.length > 0 && s.habits.every((h) => s.isChecked(h.id, d)),
  ).length;
  const active = days.filter((d) => s.habits.some((h) => s.isChecked(h.id, d))).length;

  const rated = days.map((d) => s.ratings[d]).filter(Boolean);
  const avg = (key: "mood" | "motivation") =>
    rated.length ? (rated.reduce((a, r) => a + r![key], 0) / rated.length).toFixed(1) : "—";

  const weeks = useMemo(() => {
    const out: { label: string; rate: number }[] = [];
    for (let i = 0; i < days.length; i += 7) {
      const chunk = days.slice(i, i + 7);
      const p = chunk.length * s.habits.length;
      const c = chunk.reduce(
        (acc, d) => acc + s.habits.filter((h) => s.isChecked(h.id, d)).length,
        0,
      );
      out.push({ label: `нед ${out.length + 1}`, rate: p ? Math.round((c / p) * 100) : 0 });
    }
    return out;
  }, [days, s]);

  const focusMin = s.focusSessions
    .filter((f) => {
      const d = new Date(f.finishedAt);
      return d.getFullYear() === ym.y && d.getMonth() === ym.m;
    })
    .reduce((a, f) => a + f.minutes, 0);

  const shift = (d: number) => {
    const dt = new Date(ym.y, ym.m + d, 1);
    setYm({ y: dt.getFullYear(), m: dt.getMonth() });
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="ОБЗОР МЕСЯЦА"
        title="Аналитика"
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => shift(-1)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-elevated hover:bg-accent"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="num min-w-44 text-center text-lg font-semibold">
              {MONTHS_RU[ym.m]} {ym.y}
            </div>
            <button
              onClick={() => shift(1)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-elevated hover:bg-accent"
              aria-label="Следующий месяц"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="surface grid place-items-center p-8">
          <Ring value={rate} />
          <p className="mt-4 text-sm text-muted-foreground">
            {checks} из {possible} отметок закрыто
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Tile label="отметок" value={`${checks} / ${possible}`} />
          <Tile label="идеальных дней" value={perfect || "—"} />
          <Tile label="активных дней" value={active || "—"} />
          <Tile label="привычек" value={s.habits.length || "—"} />
          <Tile label="настроение (сред.)" value={avg("mood")} />
          <Tile label="мотивация (сред.)" value={avg("motivation")} />
          <Tile
            label="время в фокусе"
            value={focusMin ? `${Math.floor(focusMin / 60)}ч ${focusMin % 60}м` : "—"}
            accent
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="surface p-6">
          <h2 className="mb-6 text-lg font-bold">По неделям</h2>
          <div className="flex h-52 items-end gap-4">
            {weeks.map((w) => (
              <div key={w.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="num text-xs font-semibold text-primary">{w.rate}%</div>
                <div className="flex w-full flex-1 items-end rounded-lg bg-muted/60">
                  <div
                    className="xp-bar w-full rounded-lg transition-all duration-700"
                    style={{ height: `${Math.max(3, w.rate)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{w.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="mb-6 text-lg font-bold">Настроение и мотивация</h2>
          <MoodChart days={days} ratings={s.ratings} />
        </section>
      </div>

      <section className="surface mt-6 p-6">
        <h2 className="mb-4 text-lg font-bold">Топ привычек</h2>
        <div className="space-y-3">
          {s.habits.map((h) => {
            const c = days.filter((d) => s.isChecked(h.id, d)).length;
            const pct = total ? Math.round((c / total) * 100) : 0;
            return (
              <div key={h.id} className="flex items-center gap-4">
                <span className="w-6">{h.icon}</span>
                <span className="w-48 truncate text-sm font-medium">{h.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="xp-bar h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="num w-12 text-right text-sm font-semibold">{pct}%</span>
              </div>
            );
          })}
          {s.habits.length === 0 && (
            <p className="text-sm text-muted-foreground">Нет привычек в этом месяце.</p>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Ring({ value }: { value: number }) {
  const r = 82;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative">
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="var(--muted)" strokeWidth="16" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          style={{ transition: "stroke-dashoffset 900ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="num text-5xl font-bold">{value}%</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">выполнено</div>
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="surface p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`num mt-2 text-3xl font-bold ${accent ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}

function MoodChart({
  days,
  ratings,
}: {
  days: string[];
  ratings: Record<string, { mood: number; motivation: number }>;
}) {
  const pts = days.map((d, i) => ({ i, r: ratings[d] }));
  const any = pts.some((p) => p.r);
  if (!any) {
    return (
      <div className="grid h-52 place-items-center text-sm text-muted-foreground">
        Нет оценок дня в этом месяце.
      </div>
    );
  }
  const W = 520;
  const H = 200;
  const x = (i: number) => (i / Math.max(1, days.length - 1)) * (W - 20) + 10;
  const y = (v: number) => H - 20 - ((v - 1) / 4) * (H - 40);

  const path = (key: "mood" | "motivation") => {
    const list = pts.filter((p) => p.r);
    return list.map((p, k) => `${k === 0 ? "M" : "L"}${x(p.i)},${y(p.r![key])}`).join(" ");
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full">
        {[1, 2, 3, 4, 5].map((v) => (
          <line
            key={v}
            x1="10"
            x2={W - 10}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}
        <path d={path("mood")} fill="none" stroke="var(--chart-1)" strokeWidth="3" strokeLinecap="round" />
        <path
          d={path("motivation")}
          fill="none"
          stroke="var(--chart-2)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 6"
        />
      </svg>
      <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-1 w-5 rounded-full bg-chart-1" /> настроение
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1 w-5 rounded-full bg-chart-2" /> мотивация
        </span>
      </div>
    </div>
  );
}
