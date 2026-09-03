import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ---------------------------------- types --------------------------------- */

export type Subtask = { id: string; title: string; done: boolean };
export type Habit = {
  id: string;
  name: string;
  icon: string;
  note?: string;
  subtasks?: Subtask[];
};
export type DayRating = { mood: number; motivation: number; note: string };
export type FocusSession = {
  id: string;
  label: string;
  habitId: string | null;
  minutes: number;
  finishedAt: number;
};
export type BossDay = {
  id: string;
  date: string;
  strategy: string;
  status: "scheduled" | "passed" | "failed";
};
export type ReturnEntry = { id: string; date: string; trigger: string; reflection: string };
export type Webhook = { id: string; url: string; active: boolean };
export type Visibility = "private" | "friends" | "public";

export type FeedEvent = {
  id: string;
  kind: "level" | "streak" | "achievement" | "boss" | "focus";
  name: string;
  text: string;
  ago: string;
  reactions: { like: number; fire: number };
};

export type Member = {
  id: string;
  name: string;
  level: number;
  streak: number;
  xpWeek: number;
  xpMonth: number;
  xpAll: number;
  relation: "none" | "sent" | "incoming" | "friend" | "me";
};

export type SessionMode = "work" | "break";

type FocusState = {
  running: boolean;
  mode: SessionMode;
  endsAt: number | null;
  remaining: number; // seconds left when paused
  workMin: number;
  breakMin: number;
  longBreak: boolean;
  longBreakMin: number;
  cyclesBeforeLong: number;
  autoStart: boolean;
  label: string;
  habitId: string | null;
  cycle: number;
};

/* --------------------------------- helpers -------------------------------- */

export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const todayIso = () => iso(new Date());

export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

export const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const WEEKDAYS_RU = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export const levelSpan = (level: number) => 200 + (level - 1) * 60;

export function levelInfo(totalXp: number) {
  let level = 1;
  let rest = totalXp;
  while (rest >= levelSpan(level)) {
    rest -= levelSpan(level);
    level += 1;
  }
  return { level, into: rest, span: levelSpan(level) };
}

export const TIERS = ["Дерево", "Бронза", "Серебро", "Золото", "Платина", "Алмаз"] as const;
export const TIER_XP = [0, 300, 700, 1300, 2200, 3500];

export function tierFor(xp: number) {
  let i = 0;
  for (let k = 0; k < TIER_XP.length; k++) if (xp >= TIER_XP[k]) i = k;
  const next = i < TIERS.length - 1 ? TIERS[i + 1] : null;
  const floor = TIER_XP[i];
  const ceil = i < TIER_XP.length - 1 ? TIER_XP[i + 1] : floor + 1;
  return {
    tier: TIERS[i],
    next,
    progress: next ? Math.min(1, (xp - floor) / (ceil - floor)) : 1,
    toNext: next ? Math.max(0, ceil - xp) : 0,
  };
}

/* ------------------------------ journey stages ----------------------------- */

export type Stage = { day: number; title: string; lesson: string; boss: boolean };

const STAGE_TITLES = [
  "Точка отсчёта",
  "Одно Действие",
  "Минимальная планка",
  "Утренний якорь",
  "Тишина 10 минут",
  "Порядок вокруг",
  "Первый обзор недели",
  "Энергия тела",
  "Отказ от лишнего",
  "Один фокус-блок",
  "Сон как база",
  "Слово, которое держишь",
  "Границы внимания",
  "Босс: неделя без нуля",
  "Возврат после срыва",
  "Медленное утро",
  "Трудное первым",
  "Люди рядом",
  "Деньги и ясность",
  "Час без экрана",
  "Обзор целей",
  "Босс: два фокус-блока",
  "Привычка вглубь",
  "Отдых по плану",
  "Публичное обещание",
  "Сложный разговор",
  "Долгий фокус 90",
  "Инвентаризация системы",
  "План на 30 вперёд",
  "Босс: твоя система",
];

export const STAGES: Stage[] = STAGE_TITLES.map((title, i) => ({
  day: i + 1,
  title,
  boss: (i + 1) % 7 === 0 || i + 1 === 30,
  lesson:
    "Сегодня твоя задача — сделать одно точное действие и зафиксировать его. Не идеально, а честно. Система строится из повторов, а не из вдохновения: снижай планку до выполнимой и закрывай день.",
}));

/* --------------------------------- defaults -------------------------------- */

const DEFAULT_HABITS: Habit[] = [
  { id: "h1", name: "Чтение 20 минут", icon: "📖" },
  { id: "h2", name: "Тренировка", icon: "🏋️" },
  { id: "h3", name: "Без сахара", icon: "🥗" },
  { id: "h4", name: "Ранний подъём", icon: "🌅" },
];

export const MEMBERS: Member[] = [
  {
    id: "u1",
    name: "Вы",
    level: 1,
    streak: 0,
    xpWeek: 0,
    xpMonth: 0,
    xpAll: 0,
    relation: "me",
  },
  {
    id: "u2",
    name: "Марк Соловьёв",
    level: 12,
    streak: 41,
    xpWeek: 940,
    xpMonth: 3120,
    xpAll: 12480,
    relation: "friend",
  },
  {
    id: "u3",
    name: "Ника Орлова",
    level: 9,
    streak: 23,
    xpWeek: 720,
    xpMonth: 2480,
    xpAll: 8130,
    relation: "friend",
  },
  {
    id: "u4",
    name: "Тимур Ким",
    level: 7,
    streak: 12,
    xpWeek: 510,
    xpMonth: 1740,
    xpAll: 5220,
    relation: "incoming",
  },
  {
    id: "u5",
    name: "Аня Петрова",
    level: 15,
    streak: 64,
    xpWeek: 1180,
    xpMonth: 4010,
    xpAll: 18900,
    relation: "none",
  },
  {
    id: "u6",
    name: "Лев Дорохов",
    level: 4,
    streak: 5,
    xpWeek: 260,
    xpMonth: 880,
    xpAll: 1960,
    relation: "sent",
  },
  {
    id: "u7",
    name: "Саша Гринь",
    level: 6,
    streak: 9,
    xpWeek: 400,
    xpMonth: 1290,
    xpAll: 3450,
    relation: "none",
  },
];

export const FEED: FeedEvent[] = [
  {
    id: "f1",
    kind: "level",
    name: "Аня Петрова",
    text: "взяла 15 уровень",
    ago: "12 мин назад",
    reactions: { like: 6, fire: 11 },
  },
  {
    id: "f2",
    kind: "boss",
    name: "Марк Соловьёв",
    text: "прошёл boss-день «Перелёт и дедлайн»",
    ago: "1 ч назад",
    reactions: { like: 9, fire: 14 },
  },
  {
    id: "f3",
    kind: "streak",
    name: "Ника Орлова",
    text: "держит серию 23 дня",
    ago: "3 ч назад",
    reactions: { like: 4, fire: 7 },
  },
  {
    id: "f4",
    kind: "focus",
    name: "Тимур Ким",
    text: "сфокусировался 50 мин на «Диплом»",
    ago: "5 ч назад",
    reactions: { like: 3, fire: 5 },
  },
  {
    id: "f5",
    kind: "achievement",
    name: "Саша Гринь",
    text: "получил достижение «Неделя без нуля»",
    ago: "вчера",
    reactions: { like: 8, fire: 6 },
  },
];

/* ---------------------------------- store ---------------------------------- */

type XpFly = { id: number; amount: number; reason: string };

type Store = {
  ready: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;

  authed: boolean;
  displayName: string;
  visibility: Visibility;
  setProfile: (name: string, visibility: Visibility) => void;
  login: (name?: string) => void;
  logout: () => void;

  xp: number;
  level: number;
  into: number;
  span: number;
  streak: number;
  levelUp: boolean;

  habits: Habit[];
  addHabit: (name: string, icon?: string) => void;
  renameHabit: (id: string, name: string) => void;
  removeHabit: (id: string) => void;
  updateHabit: (id: string, patch: Partial<Omit<Habit, "id">>) => void;
  addSubtask: (habitId: string, title: string) => void;
  toggleSubtask: (habitId: string, subtaskId: string) => void;
  renameSubtask: (habitId: string, subtaskId: string, title: string) => void;
  removeSubtask: (habitId: string, subtaskId: string) => void;

  stickers: string[];
  addSticker: (src: string) => void;
  removeSticker: (src: string) => void;

  checks: Record<string, boolean>;
  isChecked: (habitId: string, date: string) => boolean;
  toggleCheck: (habitId: string, date: string) => void;

  ratings: Record<string, DayRating>;
  setRating: (date: string, r: DayRating) => void;

  journeyDone: number;
  attributes: Record<string, number>;
  completeStage: (day: number, reflection: string) => void;
  reflections: Record<number, string>;

  missionDone: boolean;
  completeMission: () => void;
  bossDays: BossDay[];
  addBossDay: (date: string, strategy: string) => void;
  resolveBossDay: (id: string, survived: boolean) => void;
  returns: ReturnEntry[];
  addReturn: (trigger: string, reflection: string) => void;

  webhooks: Webhook[];
  addWebhook: (url: string) => void;
  toggleWebhook: (id: string) => void;
  removeWebhook: (id: string) => void;

  focus: FocusState;
  focusRemaining: number;
  focusSessions: FocusSession[];
  startFocus: () => void;
  pauseFocus: () => void;
  resetFocus: () => void;
  skipBreak: () => void;
  configureFocus: (
    patch: Partial<
      Pick<
        FocusState,
        | "workMin"
        | "breakMin"
        | "longBreak"
        | "longBreakMin"
        | "cyclesBeforeLong"
        | "autoStart"
        | "label"
        | "habitId"
      >
    >,
  ) => void;

  flies: XpFly[];
  exportData: () => void;

  leaderboardVisible: boolean;
  setLeaderboardVisible: (v: boolean) => void;
  friends: string[];
  requests: string[];
  sent: string[];
  acceptFriend: (id: string) => void;
  declineFriend: (id: string) => void;
  removeFriend: (id: string) => void;
  sendRequest: (id: string) => void;
  reactions: Record<string, { like: boolean; fire: boolean }>;
  react: (id: string, kind: "like" | "fire") => void;
};

const Ctx = createContext<Store | null>(null);

const KEY = "sistema.state.v1";

type Persisted = {
  theme: "light" | "dark";
  authed: boolean;
  displayName: string;
  visibility: Visibility;
  xp: number;
  habits: Habit[];
  stickers: string[];
  checks: Record<string, boolean>;
  ratings: Record<string, DayRating>;
  journeyDone: number;
  reflections: Record<number, string>;
  attributes: Record<string, number>;
  missionDate: string | null;
  bossDays: BossDay[];
  returns: ReturnEntry[];
  webhooks: Webhook[];
  focus: FocusState;
  focusSessions: FocusSession[];
  leaderboardVisible: boolean;
  friends: string[];
  requests: string[];
  sent: string[];
  reactions: Record<string, { like: boolean; fire: boolean }>;
};

const seedChecks = () => {
  const out: Record<string, boolean> = {};
  const now = new Date();
  for (let back = 1; back <= 14; back++) {
    const d = new Date(now);
    d.setDate(now.getDate() - back);
    DEFAULT_HABITS.forEach((h, idx) => {
      if ((back + idx) % 3 !== 0) out[`${h.id}|${iso(d)}`] = true;
    });
  }
  return out;
};

const seedRatings = () => {
  const out: Record<string, DayRating> = {};
  const now = new Date();
  for (let back = 1; back <= 10; back += 2) {
    const d = new Date(now);
    d.setDate(now.getDate() - back);
    out[iso(d)] = {
      mood: 3 + (back % 3),
      motivation: 2 + (back % 4),
      note: "",
    };
  }
  return out;
};

const initial = (): Persisted => ({
  theme: "dark",
  authed: false,
  displayName: "Абдулла",
  visibility: "private",
  xp: 640,
  habits: DEFAULT_HABITS,
  stickers: [],
  checks: seedChecks(),
  ratings: seedRatings(),
  journeyDone: 4,
  reflections: {},
  attributes: { Дисциплина: 2, Устойчивость: 1, Характер: 1, "Внутренний стержень": 0 },
  missionDate: null,
  bossDays: [],
  returns: [],
  webhooks: [],
  focus: {
    running: false,
    mode: "work",
    endsAt: null,
    remaining: 25 * 60,
    workMin: 25,
    breakMin: 5,
    longBreak: true,
    longBreakMin: 15,
    cyclesBeforeLong: 4,
    autoStart: false,
    label: "",
    habitId: null,
    cycle: 0,
  },
  focusSessions: [],
  leaderboardVisible: false,
  friends: ["u2", "u3"],
  requests: ["u4"],
  sent: ["u6"],
  reactions: {},
});

export function SistemaProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Persisted>(initial);
  const [ready, setReady] = useState(false);
  const [flies, setFlies] = useState<XpFly[]>([]);
  const [levelUp, setLevelUp] = useState(false);
  const [tick, setTick] = useState(0);
  const flyId = useRef(0);

  // hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const base = initial();
        const saved = JSON.parse(raw) as Partial<Persisted>;
        setS({ ...base, ...saved, focus: { ...base.focus, ...(saved.focus ?? {}) } });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(s));
  }, [s, ready]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", s.theme === "dark");
  }, [s.theme]);

  // focus ticking
  useEffect(() => {
    if (!s.focus.running) return;
    const t = setInterval(() => setTick((n) => n + 1), 500);
    return () => clearInterval(t);
  }, [s.focus.running]);

  const focusRemaining = s.focus.running
    ? Math.max(0, Math.round(((s.focus.endsAt ?? Date.now()) - Date.now()) / 1000))
    : s.focus.remaining;

  const fly = useCallback((amount: number, reason: string) => {
    flyId.current += 1;
    const id = flyId.current;
    setFlies((f) => [...f, { id, amount, reason }]);
    setTimeout(() => setFlies((f) => f.filter((x) => x.id !== id)), 1800);
  }, []);

  const award = useCallback(
    (amount: number, reason: string) => {
      setS((p) => {
        const before = levelInfo(p.xp).level;
        const after = levelInfo(p.xp + amount).level;
        if (after > before) {
          setLevelUp(true);
          setTimeout(() => setLevelUp(false), 2600);
        }
        return { ...p, xp: Math.max(0, p.xp + amount) };
      });
      if (amount > 0) fly(amount, reason);
    },
    [fly],
  );

  // session completion
  useEffect(() => {
    if (!s.focus.running || !s.focus.endsAt) return;
    if (Date.now() < s.focus.endsAt) return;
    const wasWork = s.focus.mode === "work";
    setS((p) => {
      const nextMode: SessionMode = wasWork ? "break" : "work";
      const cycle = wasWork ? p.focus.cycle + 1 : p.focus.cycle;
      const breakLen =
        p.focus.longBreak && cycle > 0 && cycle % 4 === 0 ? 15 : p.focus.breakMin;
      const nextMin = nextMode === "work" ? p.focus.workMin : breakLen;
      return {
        ...p,
        focusSessions: wasWork
          ? [
              {
                id: crypto.randomUUID(),
                label: p.focus.label || "Фокус",
                habitId: p.focus.habitId,
                minutes: p.focus.workMin,
                finishedAt: Date.now(),
              },
              ...p.focusSessions,
            ]
          : p.focusSessions,
        focus: {
          ...p.focus,
          mode: nextMode,
          cycle,
          running: false,
          endsAt: null,
          remaining: nextMin * 60,
        },
      };
    });
    if (wasWork) award(20, "фокус-сессия");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const streak = useMemo(() => {
    let count = 0;
    let misses = 0;
    const d = new Date();
    for (let i = 0; i < 400; i++) {
      const day = iso(d);
      const any = s.habits.some((h) => s.checks[`${h.id}|${day}`]);
      if (any) {
        count += 1;
        misses = 0;
      } else if (i > 0) {
        misses += 1;
        if (misses >= 2) break;
      }
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [s.checks, s.habits]);

  const { level, into, span } = levelInfo(s.xp);

  const value: Store = {
    ready,
    theme: s.theme,
    toggleTheme: () => setS((p) => ({ ...p, theme: p.theme === "dark" ? "light" : "dark" })),

    authed: s.authed,
    displayName: s.displayName,
    visibility: s.visibility,
    setProfile: (displayName, visibility) => setS((p) => ({ ...p, displayName, visibility })),
    login: (name) => setS((p) => ({ ...p, authed: true, displayName: name || p.displayName })),
    logout: () => setS((p) => ({ ...p, authed: false })),

    xp: s.xp,
    level,
    into,
    span,
    streak,
    levelUp,

    habits: s.habits,
    addHabit: (name, icon = "✳️") =>
      setS((p) => ({
        ...p,
        habits: [...p.habits, { id: crypto.randomUUID(), name, icon }],
      })),
    renameHabit: (id, name) =>
      setS((p) => ({ ...p, habits: p.habits.map((h) => (h.id === id ? { ...h, name } : h)) })),
    removeHabit: (id) => setS((p) => ({ ...p, habits: p.habits.filter((h) => h.id !== id) })),

    checks: s.checks,
    isChecked: (habitId, date) => !!s.checks[`${habitId}|${date}`],
    toggleCheck: (habitId, date) => {
      const key = `${habitId}|${date}`;
      const on = !s.checks[key];
      setS((p) => {
        const checks = { ...p.checks };
        if (on) checks[key] = true;
        else delete checks[key];
        return { ...p, checks };
      });
      award(on ? 10 : -10, on ? "привычка закрыта" : "отметка снята");
    },

    ratings: s.ratings,
    setRating: (date, r) => setS((p) => ({ ...p, ratings: { ...p.ratings, [date]: r } })),

    journeyDone: s.journeyDone,
    attributes: s.attributes,
    reflections: s.reflections,
    completeStage: (day, reflection) => {
      const stage = STAGES[day - 1];
      setS((p) => {
        const attributes = { ...p.attributes };
        if (stage?.boss) {
          const keys = Object.keys(attributes);
          const k = keys[(day / 7 - 1 + keys.length) % keys.length] ?? keys[0];
          attributes[k] = (attributes[k] ?? 0) + 1;
        }
        return {
          ...p,
          journeyDone: Math.max(p.journeyDone, day),
          reflections: { ...p.reflections, [day]: reflection },
          attributes,
        };
      });
      award(stage?.boss ? 60 : 25, stage?.boss ? "boss-этап пройден" : "этап пути пройден");
    },

    missionDone: s.missionDate === todayIso(),
    completeMission: () => {
      if (s.missionDate === todayIso()) return;
      setS((p) => ({ ...p, missionDate: todayIso() }));
      award(15, "миссия дня");
    },
    bossDays: s.bossDays,
    addBossDay: (date, strategy) =>
      setS((p) => ({
        ...p,
        bossDays: [
          ...p.bossDays,
          { id: crypto.randomUUID(), date, strategy, status: "scheduled" as const },
        ].sort((a, b) => a.date.localeCompare(b.date)),
      })),
    resolveBossDay: (id, survived) => {
      setS((p) => ({
        ...p,
        bossDays: p.bossDays.map((b) =>
          b.id === id ? { ...b, status: survived ? "passed" : "failed" } : b,
        ),
        attributes: survived
          ? { ...p.attributes, Устойчивость: (p.attributes["Устойчивость"] ?? 0) + 1 }
          : p.attributes,
      }));
      if (survived) award(50, "boss-день пройден");
    },
    returns: s.returns,
    addReturn: (trigger, reflection) =>
      setS((p) => ({
        ...p,
        returns: [
          { id: crypto.randomUUID(), date: todayIso(), trigger, reflection },
          ...p.returns,
        ],
      })),

    webhooks: s.webhooks,
    addWebhook: (url) =>
      setS((p) => ({
        ...p,
        webhooks: [...p.webhooks, { id: crypto.randomUUID(), url, active: true }],
      })),
    toggleWebhook: (id) =>
      setS((p) => ({
        ...p,
        webhooks: p.webhooks.map((w) => (w.id === id ? { ...w, active: !w.active } : w)),
      })),
    removeWebhook: (id) =>
      setS((p) => ({ ...p, webhooks: p.webhooks.filter((w) => w.id !== id) })),

    focus: s.focus,
    focusRemaining,
    focusSessions: s.focusSessions,
    startFocus: () =>
      setS((p) => ({
        ...p,
        focus: {
          ...p.focus,
          running: true,
          endsAt: Date.now() + p.focus.remaining * 1000,
        },
      })),
    pauseFocus: () =>
      setS((p) => ({
        ...p,
        focus: {
          ...p.focus,
          running: false,
          remaining: Math.max(0, Math.round(((p.focus.endsAt ?? Date.now()) - Date.now()) / 1000)),
          endsAt: null,
        },
      })),
    resetFocus: () =>
      setS((p) => ({
        ...p,
        focus: {
          ...p.focus,
          running: false,
          endsAt: null,
          mode: "work",
          remaining: p.focus.workMin * 60,
        },
      })),
    skipBreak: () =>
      setS((p) => ({
        ...p,
        focus: {
          ...p.focus,
          running: false,
          endsAt: null,
          mode: "work",
          remaining: p.focus.workMin * 60,
        },
      })),
    configureFocus: (patch) =>
      setS((p) => {
        const focus = { ...p.focus, ...patch };
        if (patch.workMin && focus.mode === "work" && !focus.running) {
          focus.remaining = patch.workMin * 60;
        }
        if (patch.breakMin && focus.mode === "break" && !focus.running) {
          focus.remaining = patch.breakMin * 60;
        }
        return { ...p, focus };
      }),

    flies,
    exportData: () => {
      const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sistema-data.json";
      a.click();
      URL.revokeObjectURL(url);
    },

    leaderboardVisible: s.leaderboardVisible,
    setLeaderboardVisible: (v) => setS((p) => ({ ...p, leaderboardVisible: v })),
    friends: s.friends,
    requests: s.requests,
    sent: s.sent,
    acceptFriend: (id) =>
      setS((p) => ({ ...p, requests: p.requests.filter((r) => r !== id), friends: [...p.friends, id] })),
    declineFriend: (id) => setS((p) => ({ ...p, requests: p.requests.filter((r) => r !== id) })),
    removeFriend: (id) => setS((p) => ({ ...p, friends: p.friends.filter((f) => f !== id) })),
    sendRequest: (id) => setS((p) => ({ ...p, sent: [...p.sent, id] })),
    reactions: s.reactions,
    react: (id, kind) =>
      setS((p) => {
        const cur = p.reactions[id] ?? { like: false, fire: false };
        return { ...p, reactions: { ...p.reactions, [id]: { ...cur, [kind]: !cur[kind] } } };
      }),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSistema() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSistema must be used inside SistemaProvider");
  return ctx;
}

export const fmtTime = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
