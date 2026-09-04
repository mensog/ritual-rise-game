import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Modal } from "@/components/Modal";
import { EmojiPicker, HabitIcon } from "@/components/EmojiPicker";
import {
  MONTHS_RU,
  daysInMonth,
  iso,
  todayIso,
  useSistema,
  type DayRating,
  type Habit,
} from "@/lib/sistema-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Планер — SISTEMA" },
      {
        name: "description",
        content:
          "Месячная сетка задач и привычек: подзадачи, отметки по дням, XP и серия без пропусков.",
      },
      { property: "og:title", content: "Планер — SISTEMA" },
      {
        property: "og:description",
        content: "Месячная сетка задач и привычек с подзадачами, отметками по дням и XP.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const [detailId, setDetailId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const total = daysInMonth(ym.y, ym.m);
  const days = useMemo(
    () => Array.from({ length: total }, (_, i) => iso(new Date(ym.y, ym.m, i + 1))),
    [ym, total],
  );
  const today = todayIso();
  const detail = s.habits.find((h) => h.id === detailId) ?? null;

  const shift = (d: number) => {
    const dt = new Date(ym.y, ym.m + d, 1);
    setYm({ y: dt.getFullYear(), m: dt.getMonth() });
  };

  const create = () => {
    if (!name.trim()) return;
    s.addHabit(name.trim(), icon);
    setName("");
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="ЕЖЕДНЕВНАЯ ПРАКТИКА"
        title="Планер"
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => shift(-1)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-elevated hover:bg-accent"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="num min-w-40 text-center text-base font-semibold">
              {MONTHS_RU[ym.m]} {ym.y}
            </div>
            <button
              onClick={() => shift(1)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-elevated hover:bg-accent"
              aria-label="Следующий месяц"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setYm({ y: now.getFullYear(), m: now.getMonth() })}
              className="ml-1 rounded-md border border-border bg-elevated px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Сегодня
            </button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-2">
        <EmojiPicker value={icon} onChange={setIcon} />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Новая задача или привычка…"
          className="min-w-56 flex-1 rounded-md border border-input bg-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <button
          onClick={create}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {s.habits.length === 0 ? (
        <div className="grid place-items-center rounded-md border border-border bg-card p-16 text-center">
          <div className="text-4xl">🌱</div>
          <h3 className="mt-4 text-xl font-bold">Пока пусто</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Добавь первую задачу. Одну. Самую маленькую из тех, что ты точно закроешь сегодня.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-elevated/70">
                  <th className="sticky left-0 z-10 min-w-64 bg-elevated px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Задача
                  </th>
                  {days.map((d) => {
                    const dt = new Date(d);
                    const weekend = [0, 6].includes(dt.getDay());
                    return (
                      <th
                        key={d}
                        onClick={() => setRatingDay(d)}
                        className={cn(
                          "num w-8 cursor-pointer border-l border-border/60 px-0 py-2 text-center text-[11px] font-semibold text-muted-foreground hover:text-foreground",
                          weekend && "bg-muted/40",
                          d === today && "bg-primary/10 text-primary",
                        )}
                      >
                        {dt.getDate()}
                      </th>
                    );
                  })}
                  <th className="num w-12 border-l border-border px-2 py-2 text-center text-[11px] font-semibold text-muted-foreground">
                    Σ
                  </th>
                </tr>
              </thead>
              <tbody>
                {s.habits.map((h) => {
                  const sum = days.filter((d) => s.isChecked(h.id, d)).length;
                  const subs = h.subtasks ?? [];
                  const doneSubs = subs.filter((t) => t.done).length;
                  const open = !!expanded[h.id];
                  return (
                    <Fragment key={h.id}>
                      <tr className="group border-b border-border/70 hover:bg-muted/30">
                        <td className="sticky left-0 z-10 bg-card px-2 py-1.5 group-hover:bg-muted/30">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setExpanded((p) => ({ ...p, [h.id]: !open }))}
                              className={cn(
                                "grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-muted",
                                open && "rotate-0 text-foreground",
                              )}
                              aria-label="Подзадачи"
                            >
                              <ChevronDown
                                className={cn("h-3.5 w-3.5 transition-transform", !open && "-rotate-90")}
                              />
                            </button>
                            <HabitIcon value={h.icon} />
                            <button
                              onClick={() => setDetailId(h.id)}
                              className="truncate text-left font-medium hover:underline"
                            >
                              {h.name}
                            </button>
                            {subs.length > 0 && (
                              <span className="num flex items-center gap-1 rounded border border-border px-1 text-[10px] text-muted-foreground">
                                <ListChecks className="h-3 w-3" />
                                {doneSubs}/{subs.length}
                              </span>
                            )}
                            <span className="ml-auto flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => setDetailId(h.id)}
                                className="grid h-6 w-6 place-items-center rounded hover:bg-muted"
                                aria-label="Изменить"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => s.removeHabit(h.id)}
                                className="grid h-6 w-6 place-items-center rounded text-destructive hover:bg-destructive/10"
                                aria-label="Удалить"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          </div>
                        </td>
                        {days.map((d) => {
                          const on = s.isChecked(h.id, d);
                          const weekend = [0, 6].includes(new Date(d).getDay());
                          return (
                            <td
                              key={d}
                              className={cn(
                                "border-l border-border/60 p-0",
                                weekend && "bg-muted/30",
                                d === today && "bg-primary/5",
                              )}
                            >
                              <button
                                onClick={() => s.toggleCheck(h.id, d)}
                                className={cn(
                                  "grid h-8 w-full place-items-center transition-colors",
                                  on
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent",
                                )}
                                aria-label={`${h.name} ${d}`}
                              >
                                {on && <Check className="h-3.5 w-3.5 animate-pop" strokeWidth={3} />}
                              </button>
                            </td>
                          );
                        })}
                        <td className="num border-l border-border px-2 text-center font-semibold text-primary">
                          {sum}
                        </td>
                      </tr>

                      {open && (
                        <tr className="border-b border-border/70 bg-elevated/40">
                          <td
                            className="sticky left-0 z-10 bg-elevated/80 px-2 py-2"
                            colSpan={1}
                          >
                            <SubtaskList habit={h} />
                          </td>
                          <td colSpan={days.length + 1} />
                        </tr>
                      )}
                    </Fragment>
                  );
                })}

                <tr className="border-t border-border bg-elevated/70">
                  <td className="sticky left-0 z-10 bg-elevated px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Выполнено
                  </td>
                  {days.map((d) => {
                    const c = s.habits.filter((h) => s.isChecked(h.id, d)).length;
                    return (
                      <td
                        key={d}
                        className="num border-l border-border/60 px-0 py-2 text-center text-[11px] font-semibold"
                      >
                        {c || <span className="text-muted-foreground/40">·</span>}
                      </td>
                    );
                  })}
                  <td className="border-l border-border" />
                </tr>
                <tr className="border-t border-border/70 bg-elevated/70">
                  <td className="sticky left-0 z-10 bg-elevated px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Настроение
                  </td>
                  {days.map((d) => {
                    const r = s.ratings[d];
                    return (
                      <td key={d} className="border-l border-border/60 px-0 py-2 text-center">
                        <button
                          onClick={() => setRatingDay(d)}
                          className="mx-auto block h-2.5 w-2.5 rounded-sm transition-transform hover:scale-125"
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
                  <td className="border-l border-border" />
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

      {detail && <TaskModal habit={detail} onClose={() => setDetailId(null)} />}
    </AppShell>
  );
}

function SubtaskList({ habit }: { habit: Habit }) {
  const s = useSistema();
  const [title, setTitle] = useState("");
  const subs = habit.subtasks ?? [];

  const add = () => {
    if (!title.trim()) return;
    s.addSubtask(habit.id, title.trim());
    setTitle("");
  };

  return (
    <div className="space-y-1">
      {subs.map((t) => (
        <div key={t.id} className="flex items-center gap-2">
          <button
            onClick={() => s.toggleSubtask(habit.id, t.id)}
            className={cn(
              "grid h-4 w-4 shrink-0 place-items-center rounded-sm border",
              t.done ? "border-primary bg-primary text-primary-foreground" : "border-border",
            )}
            aria-label="Отметить подзадачу"
          >
            {t.done && <Check className="h-3 w-3" strokeWidth={3} />}
          </button>
          <span className={cn("truncate text-sm", t.done && "text-muted-foreground line-through")}>
            {t.title}
          </span>
          <button
            onClick={() => s.removeSubtask(habit.id, t.id)}
            className="ml-auto grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-muted"
            aria-label="Удалить подзадачу"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <div className="flex gap-1 pt-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Подзадача…"
          className="min-w-0 flex-1 rounded-md border border-input bg-card px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={add}
          className="rounded-md border border-border px-2 text-xs font-semibold hover:bg-muted"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function TaskModal({ habit, onClose }: { habit: Habit; onClose: () => void }) {
  const s = useSistema();
  const [name, setName] = useState(habit.name);
  const [note, setNote] = useState(habit.note ?? "");

  return (
    <Modal title="Задача" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <EmojiPicker value={habit.icon} onChange={(v) => s.updateHabit(habit.id, { icon: v })} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-input bg-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Описание
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Детали, критерий выполнения, контекст…"
            className="w-full resize-none rounded-md border border-input bg-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Подзадачи
          </div>
          <SubtaskList habit={habit} />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Закрыть
          </button>
          <button
            onClick={() => {
              s.updateHabit(habit.id, { name: name.trim() || "Без названия", note });
              onClose();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            Сохранить
          </button>
        </div>
      </div>
    </Modal>
  );
}

function RatingModal({
  date,
  initial,
  onClose,
  onSave,
}: {
  date: string;
  initial?: DayRating | undefined;
  onClose: () => void;
  onSave: (r: DayRating) => void;
}) {
  const [mood, setMood] = useState(initial?.mood ?? 3);
  const [motivation, setMotivation] = useState(initial?.motivation ?? 3);
  const [note, setNote] = useState(initial?.note ?? "");
  const dt = new Date(date);

  return (
    <Modal
      title={`Оценка дня · ${dt.getDate()} ${(MONTHS_RU[dt.getMonth()] ?? "").toLowerCase()}`}
      onClose={onClose}
    >
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
          className="w-full resize-none rounded-md border border-input bg-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Закрыть
        </button>
        <button
          onClick={() => onSave({ mood, motivation, note })}
          className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
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
              "grid h-11 flex-1 place-items-center rounded-md border text-xl transition-colors",
              value === i + 1
                ? "border-primary bg-primary-soft"
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
