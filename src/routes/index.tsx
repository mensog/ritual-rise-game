import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Modal } from "@/components/Modal";
import {
  MONTHS_RU,
  daysInMonth,
  iso,
  todayIso,
  useSistema,
  type DayRating,
} from "@/lib/sistema-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Планер — SISTEMA" },
      {
        name: "description",
        content: "Месячная сетка привычек: отмечай день за днём, получай XP и держи серию.",
      },
      { property: "og:title", content: "Планер — SISTEMA" },
      {
        property: "og:description",
        content: "Месячная сетка привычек: отмечай день за днём, получай XP и держи серию.",
      },
    ],
  }),
  component: TrackerPage,
});

const MOODS = ["😞", "😕", "😐", "🙂", "🤩"];

function TrackerPage() {
  const s = useSistema();
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✳️");
  const [ratingDay, setRatingDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const total = daysInMonth(ym.y, ym.m);
  const days = useMemo(
    () => Array.from({ length: total }, (_, i) => iso(new Date(ym.y, ym.m, i + 1))),
    [ym, total],
  );
  const today = todayIso();

  const shift = (d: number) => {
    const dt = new Date(ym.y, ym.m + d, 1);
    setYm({ y: dt.getFullYear(), m: dt.getMonth() });
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="ЕЖЕДНЕВНАЯ ПРАКТИКА"
        title="Планер"
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
            <button
              onClick={() => setYm({ y: now.getFullYear(), m: now.getMonth() })}
              className="rounded-xl border border-border bg-elevated px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Сегодня
            </button>
          </div>
        }
      />

      <div className="surface mb-6 flex flex-wrap items-center gap-2 p-3">
        <div className="flex gap-1">
          {["✳️", "📖", "🏋️", "🧘", "💧", "🌅", "🥗", "🧠"].map((e) => (
            <button
              key={e}
              onClick={() => setIcon(e)}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-lg text-base transition-colors hover:bg-muted",
                icon === e && "bg-accent ring-1 ring-primary",
              )}
            >
              {e}
            </button>
          ))}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Новая привычка…"
          className="min-w-56 flex-1 rounded-xl border border-input bg-elevated px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              s.addHabit(name.trim(), icon);
              setName("");
            }
          }}
        />
        <button
          onClick={() => {
            if (!name.trim()) return;
            s.addHabit(name.trim(), icon);
            setName("");
          }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {s.habits.length === 0 ? (
        <div className="surface grid place-items-center p-16 text-center">
          <div className="text-4xl">🌱</div>
          <h3 className="mt-4 text-xl font-bold">Пока пусто</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Добавь первую привычку. Одну. Самую маленькую из тех, что ты точно закроешь сегодня.
          </p>
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 min-w-56 bg-card px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Привычка
                  </th>
                  {days.map((d) => {
                    const dt = new Date(d);
                    const weekend = [0, 6].includes(dt.getDay());
                    return (
                      <th
                        key={d}
                        onClick={() => setRatingDay(d)}
                        className={cn(
                          "num w-9 cursor-pointer px-0 py-3 text-center text-xs font-semibold text-muted-foreground hover:text-foreground",
                          weekend && "text-muted-foreground/60",
                          d === today && "text-primary",
                        )}
                      >
                        {dt.getDate()}
                      </th>
                    );
                  })}
                  <th className="num w-12 px-2 py-3 text-center text-xs font-semibold text-muted-foreground">
                    Σ
                  </th>
                </tr>
              </thead>
              <tbody>
                {s.habits.map((h) => {
                  const sum = days.filter((d) => s.isChecked(h.id, d)).length;
                  return (
                    <tr key={h.id} className="group border-t border-border">
                      <td className="sticky left-0 z-10 bg-card px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span>{h.icon}</span>
                          <span className="font-medium">{h.name}</span>
                          <span className="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => setEditing({ id: h.id, name: h.name })}
                              className="grid h-7 w-7 place-items-center rounded-md hover:bg-muted"
                              aria-label="Изменить"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => s.removeHabit(h.id)}
                              className="grid h-7 w-7 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                              aria-label="Удалить"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </div>
                      </td>
                      {days.map((d) => {
                        const on = s.isChecked(h.id, d);
                        return (
                          <td key={d} className="p-0.5 text-center">
                            <button
                              onClick={() => s.toggleCheck(h.id, d)}
                              className={cn(
                                "mx-auto grid h-7 w-7 place-items-center rounded-lg border transition-colors",
                                on
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-elevated hover:border-primary/60 hover:bg-accent",
                                d === today && !on && "ring-1 ring-primary/40",
                              )}
                              aria-label={`${h.name} ${d}`}
                            >
                              {on && <Check className="h-4 w-4 animate-pop" strokeWidth={3} />}
                            </button>
                          </td>
                        );
                      })}
                      <td className="num px-2 text-center font-bold text-primary">{sum}</td>
                    </tr>
                  );
                })}

                <tr className="border-t-2 border-border bg-elevated/60">
                  <td className="sticky left-0 z-10 bg-elevated px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Выполнено
                  </td>
                  {days.map((d) => {
                    const c = s.habits.filter((h) => s.isChecked(h.id, d)).length;
                    return (
                      <td key={d} className="num px-0 py-2 text-center text-xs font-semibold">
                        {c || <span className="text-muted-foreground/40">·</span>}
                      </td>
                    );
                  })}
                  <td />
                </tr>
                <tr className="border-t border-border bg-elevated/60">
                  <td className="sticky left-0 z-10 bg-elevated px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Настроение
                  </td>
                  {days.map((d) => {
                    const r = s.ratings[d];
                    return (
                      <td key={d} className="px-0 py-2 text-center">
                        <button
                          onClick={() => setRatingDay(d)}
                          className="mx-auto block h-3 w-3 rounded-full transition-transform hover:scale-125"
                          style={{
                            backgroundColor: r
                              ? `color-mix(in oklab, var(--primary) ${r.mood * 20}%, var(--flame))`
                              : "var(--muted)",
                          }}
                          aria-label={`Оценить ${d}`}
                        />
                      </td>
                    );
                  })}
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ratingDay && (
        <RatingModal
          date={ratingDay}
          initial={s.ratings[ratingDay]}
          onClose={() => setRatingDay(null)}
          onSave={(r) => {
            s.setRating(ratingDay, r);
            setRatingDay(null);
          }}
        />
      )}

      {editing && (
        <Modal title="Переименовать привычку" onClose={() => setEditing(null)}>
          <input
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            className="w-full rounded-xl border border-input bg-elevated px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setEditing(null)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Закрыть
            </button>
            <button
              onClick={() => {
                s.renameHabit(editing.id, editing.name.trim() || "Без названия");
                setEditing(null);
              }}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              Сохранить
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}

function RatingModal({
  date,
  initial,
  onClose,
  onSave,
}: {
  date: string;
  initial?: DayRating;
  onClose: () => void;
  onSave: (r: DayRating) => void;
}) {
  const [mood, setMood] = useState(initial?.mood ?? 3);
  const [motivation, setMotivation] = useState(initial?.motivation ?? 3);
  const [note, setNote] = useState(initial?.note ?? "");
  const dt = new Date(date);

  return (
    <Modal title={`Оценка дня · ${dt.getDate()} ${MONTHS_RU[dt.getMonth()].toLowerCase()}`} onClose={onClose}>
      <Scale label="настроение" value={mood} onChange={setMood} />
      <Scale label="мотивация" value={motivation} onChange={setMotivation} />
      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          заметка
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Что было важным сегодня…"
          className="w-full resize-none rounded-xl border border-input bg-elevated px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Закрыть
        </button>
        <button
          onClick={() => onSave({ mood, motivation, note })}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          Сохранить
        </button>
      </div>
    </Modal>
  );
}

function Scale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="flex gap-2">
        {MOODS.map((e, i) => (
          <button
            key={e}
            onClick={() => onChange(i + 1)}
            className={cn(
              "grid h-12 flex-1 place-items-center rounded-xl border text-xl transition-all",
              value === i + 1
                ? "border-primary bg-primary-soft scale-105"
                : "border-border bg-elevated hover:bg-accent",
            )}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
