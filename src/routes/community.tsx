import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2, X, Crown, Flame, Star, Trophy, Timer } from "lucide-react";
import { AppShell, PageHeader, Segmented } from "@/components/AppShell";
import { FEED, MEMBERS, TIERS, tierFor, useSistema, type Member } from "@/lib/sistema-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Рейтинг — SISTEMA" },
      {
        name: "description",
        content: "Лига недели, таблица лидеров, лента событий и друзья в SISTEMA.",
      },
      { property: "og:title", content: "Рейтинг — SISTEMA" },
      {
        property: "og:description",
        content: "Лига недели, таблица лидеров, лента событий и друзья в SISTEMA.",
      },
    ],
  }),
  component: CommunityPage,
});

type Metric = "xp" | "level" | "streak";
type Period = "week" | "month" | "all";
type Scope = "all" | "friends";

const TIER_COLOR: Record<string, string> = {
  Дерево: "from-amber-900/60 to-amber-700/40",
  Бронза: "from-orange-700/60 to-amber-600/40",
  Серебро: "from-slate-400/60 to-slate-200/40",
  Золото: "from-yellow-500/70 to-amber-300/50",
  Платина: "from-cyan-400/60 to-sky-200/40",
  Алмаз: "from-violet-500/60 to-cyan-300/40",
};

function CommunityPage() {
  const s = useSistema();
  const [metric, setMetric] = useState<Metric>("xp");
  const [period, setPeriod] = useState<Period>("week");
  const [scope, setScope] = useState<Scope>("all");

  const me: Member = {
    id: "u1",
    name: s.displayName,
    level: s.level,
    streak: s.streak,
    xpWeek: Math.round(s.xp * 0.2),
    xpMonth: Math.round(s.xp * 0.6),
    xpAll: s.xp,
    relation: "me",
  };

  const people = useMemo(
    () => [me, ...MEMBERS.filter((m) => m.relation !== "me")],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.displayName, s.level, s.streak, s.xp],
  );

  const relationOf = (m: Member): Member["relation"] => {
    if (m.relation === "me") return "me";
    if (s.friends.includes(m.id)) return "friend";
    if (s.requests.includes(m.id)) return "incoming";
    if (s.sent.includes(m.id)) return "sent";
    return "none";
  };

  const scoreOf = (m: Member) => {
    if (metric === "level") return m.level;
    if (metric === "streak") return m.streak;
    return period === "week" ? m.xpWeek : period === "month" ? m.xpMonth : m.xpAll;
  };
  const unit = metric === "level" ? "" : metric === "streak" ? "дн" : "XP";

  const board = people
    .filter((m) => (scope === "friends" ? relationOf(m) === "friend" || m.relation === "me" : true))
    .filter((m) => (m.relation === "me" ? s.leaderboardVisible : true))
    .sort((a, b) => scoreOf(b) - scoreOf(a));

  const league = [me, ...MEMBERS.filter((m) => s.friends.includes(m.id))].sort(
    (a, b) => b.xpWeek - a.xpWeek,
  );
  const myRank = league.findIndex((m) => m.relation === "me") + 1;
  const t = tierFor(me.xpWeek);

  return (
    <AppShell>
      <PageHeader eyebrow="СОЦИАЛЬНЫЙ СЛОЙ" title="Рейтинг" />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* League */}
          <section className="surface overflow-hidden">
            <div className={cn("bg-gradient-to-r p-6", TIER_COLOR[t.tier])}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.25em] opacity-80">
                    Лига недели
                  </div>
                  <div className="num mt-1 text-3xl font-bold">{t.tier}</div>
                </div>
                <div className="text-right">
                  <div className="num text-3xl font-bold">
                    #{myRank || "—"}{" "}
                    <span className="text-base font-medium opacity-70">/ {league.length}</span>
                  </div>
                  <div className="text-xs opacity-80">твоё место среди друзей</div>
                </div>
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-background/40">
                <div
                  className="h-full rounded-full bg-foreground/80 transition-all duration-700"
                  style={{ width: `${Math.round(t.progress * 100)}%` }}
                />
              </div>
              <div className="num mt-2 text-xs font-semibold">
                {me.xpWeek} XP{" "}
                {t.next ? `· до «${t.next}»: ${t.toNext} XP` : "· максимальная лига"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              {TIERS.map((tier) => (
                <span
                  key={tier}
                  className={cn(
                    "rounded-lg border border-border px-2.5 py-1 text-xs font-semibold",
                    tier === t.tier
                      ? "border-primary bg-primary-soft text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {tier}
                </span>
              ))}
            </div>
          </section>

          {/* Leaderboard */}
          <section className="surface p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                value={metric}
                onChange={setMetric}
                options={[
                  { value: "xp", label: "XP" },
                  { value: "level", label: "Уровень" },
                  { value: "streak", label: "Серия" },
                ]}
              />
              <Segmented
                value={period}
                onChange={setPeriod}
                options={[
                  { value: "week", label: "Неделя" },
                  { value: "month", label: "Месяц" },
                  { value: "all", label: "Всё время" },
                ]}
              />
              <Segmented
                value={scope}
                onChange={setScope}
                options={[
                  { value: "all", label: "Все" },
                  { value: "friends", label: "Друзья" },
                ]}
              />
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-elevated p-3">
              <input
                type="checkbox"
                checked={s.leaderboardVisible}
                onChange={(e) => s.setLeaderboardVisible(e.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span className="text-sm font-medium">Показывать меня в рейтинге</span>
              <span className="text-xs text-muted-foreground">
                включи видимость, чтобы попасть в рейтинг
              </span>
            </label>

            <div className="mt-4 space-y-2">
              {board.map((m, i) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-border bg-elevated px-3 py-2.5",
                    m.relation === "me" && "border-primary/60 bg-primary-soft/40",
                  )}
                >
                  <span
                    className={cn(
                      "num grid h-8 w-8 place-items-center rounded-lg text-sm font-bold",
                      i === 0 && "bg-gradient-to-br from-yellow-400 to-amber-600 text-black",
                      i === 1 && "bg-gradient-to-br from-slate-300 to-slate-500 text-black",
                      i === 2 && "bg-gradient-to-br from-orange-400 to-orange-700 text-black",
                      i > 2 && "bg-muted text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="font-medium">
                    {m.name}
                    {m.relation === "me" && (
                      <span className="ml-2 text-xs font-semibold text-primary">вы</span>
                    )}
                  </span>
                  <span className="num ml-auto text-xs text-muted-foreground">Lv {m.level}</span>
                  <span className="num flex items-center gap-1 text-xs text-flame">
                    <Flame className="h-3.5 w-3.5" />
                    {m.streak}
                  </span>
                  <span className="num w-24 text-right font-bold">
                    {scoreOf(m)} <span className="text-xs font-medium text-muted-foreground">{unit}</span>
                  </span>
                </div>
              ))}
              {board.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Пока никого. Включи видимость профиля, чтобы участвовать.
                </p>
              )}
            </div>
          </section>

          {/* Members */}
          <section className="surface p-6">
            <h2 className="mb-4 text-lg font-bold">Участники</h2>
            <div className="space-y-2">
              {MEMBERS.filter((m) => m.relation !== "me").map((m) => {
                const rel = relationOf(m);
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-elevated px-3 py-2.5"
                  >
                    <Avatar name={m.name} />
                    <span className="font-medium">{m.name}</span>
                    <span className="num ml-auto text-xs text-muted-foreground">Lv {m.level}</span>
                    <span className="num flex items-center gap-1 text-xs text-flame">
                      <Flame className="h-3.5 w-3.5" />
                      {m.streak}
                    </span>
                    {rel === "none" ? (
                      <button
                        onClick={() => s.sendRequest(m.id)}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                      >
                        В друзья
                      </button>
                    ) : (
                      <span className="w-36 text-right text-xs text-muted-foreground">
                        {rel === "sent"
                          ? "заявка отправлена"
                          : rel === "incoming"
                            ? "ждёт вашего ответа"
                            : rel === "friend"
                              ? "в друзьях"
                              : "вы"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Feed */}
          <section className="surface p-6">
            <h2 className="mb-4 text-lg font-bold">Лента</h2>
            <div className="space-y-3">
              {FEED.map((e) => {
                const r = s.reactions[e.id] ?? { like: false, fire: false };
                const Icon =
                  e.kind === "level"
                    ? Star
                    : e.kind === "boss"
                      ? Crown
                      : e.kind === "streak"
                        ? Flame
                        : e.kind === "focus"
                          ? Timer
                          : Trophy;
                return (
                  <div key={e.id} className="rounded-xl border border-border bg-elevated p-3">
                    <div className="flex items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{e.name}</span> {e.text}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{e.ago}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => s.react(e.id, "like")}
                        className={cn(
                          "num rounded-lg border border-border px-2.5 py-1 text-xs font-semibold",
                          r.like && "border-primary bg-primary-soft",
                        )}
                      >
                        👍 {e.reactions.like + (r.like ? 1 : 0)}
                      </button>
                      <button
                        onClick={() => s.react(e.id, "fire")}
                        className={cn(
                          "num rounded-lg border border-border px-2.5 py-1 text-xs font-semibold",
                          r.fire && "border-flame bg-flame/20",
                        )}
                      >
                        🔥 {e.reactions.fire + (r.fire ? 1 : 0)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Friends */}
          <section className="surface p-6">
            <h2 className="mb-4 text-lg font-bold">Друзья</h2>

            {s.requests.length > 0 && (
              <>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Входящие заявки
                </div>
                <div className="mb-5 space-y-2">
                  {s.requests.map((id) => {
                    const m = MEMBERS.find((x) => x.id === id)!;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 rounded-xl border border-border bg-elevated px-3 py-2"
                      >
                        <Avatar name={m.name} />
                        <span className="text-sm font-medium">{m.name}</span>
                        <button
                          onClick={() => s.acceptFriend(id)}
                          className="ml-auto rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                        >
                          Принять
                        </button>
                        <button
                          onClick={() => s.declineFriend(id)}
                          className="grid h-7 w-7 place-items-center rounded-lg hover:bg-muted"
                          aria-label="Отклонить"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Мои друзья
            </div>
            <div className="space-y-2">
              {s.friends.map((id) => {
                const m = MEMBERS.find((x) => x.id === id);
                if (!m) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-xl border border-border bg-elevated px-3 py-2"
                  >
                    <Avatar name={m.name} />
                    <span className="text-sm font-medium">{m.name}</span>
                    <span className="num ml-auto text-xs text-muted-foreground">Lv {m.level}</span>
                    <span className="num flex items-center gap-1 text-xs text-flame">
                      <Flame className="h-3.5 w-3.5" />
                      {m.streak}
                    </span>
                    <button
                      onClick={() => s.removeFriend(id)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                      aria-label="Удалить из друзей"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              {s.friends.length === 0 && (
                <p className="text-sm text-muted-foreground">Пока никого. Найди своих в «Участниках».</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-calm text-xs font-bold text-primary-foreground">
      {name.slice(0, 1)}
    </span>
  );
}
