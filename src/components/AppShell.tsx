import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, Timer, Pause, Square, LogOut, Settings as Gear } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { fmtTime, useSistema } from "@/lib/sistema-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Планер" },
  { to: "/analytics", label: "Аналитика" },
  { to: "/community", label: "Рейтинг" },
  { to: "/journey", label: "Путь" },
  { to: "/resilience", label: "Стойкость" },
  { to: "/focus", label: "Фокус" },
] as const;

export function Hud() {
  const { level, into, span, streak, levelUp } = useSistema();
  const pct = Math.round((into / span) * 100);
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "level-chip num grid h-9 w-14 place-items-center rounded-xl text-sm font-bold shadow-glow",
          levelUp && "animate-level-pulse",
        )}
        title="Уровень"
      >
        Lv {level}
      </div>
      <div className="hidden w-40 sm:block">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="xp-bar h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="num mt-1 text-[11px] text-muted-foreground">
          {into}/{span} XP
        </div>
      </div>
      <div className="flame-chip flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm font-semibold">
        <span className="animate-flicker">🔥</span>
        <span className="num">{streak}</span>
      </div>
    </div>
  );
}

function FocusWidget() {
  const { focus, focusRemaining, pauseFocus, resetFocus } = useSistema();
  const navigate = useNavigate();
  if (!focus.running && focusRemaining === focus.workMin * 60 && focus.mode === "work") {
    return (
      <button
        onClick={() => navigate({ to: "/focus" })}
        className="flex items-center gap-2 rounded-xl border border-border bg-elevated px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        <Timer className="h-4 w-4 text-primary" />
        Фокус
      </button>
    );
  }
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-2.5 py-1.5",
        focus.mode === "work"
          ? "border-primary/40 bg-primary-soft/50"
          : "border-calm/40 bg-calm/15",
      )}
    >
      <button onClick={() => navigate({ to: "/focus" })} className="num text-sm font-bold">
        {fmtTime(focusRemaining)}
      </button>
      <button
        onClick={pauseFocus}
        className="grid h-6 w-6 place-items-center rounded-md hover:bg-background/60"
        aria-label="Пауза"
      >
        <Pause className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={resetFocus}
        className="grid h-6 w-6 place-items-center rounded-md hover:bg-background/60"
        aria-label="Стоп"
      >
        <Square className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function XpFlies() {
  const { flies } = useSistema();
  return (
    <div className="pointer-events-none fixed right-6 top-16 z-50 flex flex-col items-end gap-1">
      {flies.map((f) => (
        <div
          key={f.id}
          className="animate-rise rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-glow"
        >
          <span className="num">
            {f.amount > 0 ? "+" : ""}
            {f.amount} XP
          </span>
          <span className="ml-2 text-xs font-medium opacity-80">{f.reason}</span>
        </div>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme, displayName, authed, logout, ready } = useSistema();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !authed) navigate({ to: "/login" });
  }, [ready, authed, navigate]);

  if (!ready || !authed) return null;

  return (
    <div className="min-h-screen bg-background">
      <XpFlies />
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-8">
          <Link to="/" className="font-display text-lg font-bold tracking-tight">
            SISTEMA<span className="text-primary">.</span>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  pathname === n.to && "bg-accent text-accent-foreground",
                )}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/settings"
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                pathname === "/settings" && "bg-accent text-accent-foreground",
              )}
              aria-label="Настройки"
            >
              <Gear className="h-4 w-4" />
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <FocusWidget />
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-elevated transition-colors hover:bg-accent"
              aria-label="Тема"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="hidden md:block">
              <Hud />
            </div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-calm text-sm font-bold text-primary-foreground">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium xl:block">{displayName}</span>
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
                className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Выйти"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground",
                pathname === n.to && "bg-accent text-accent-foreground",
              )}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/settings"
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground"
          >
            Настройки
          </Link>
        </div>
        <div className="flex justify-center pb-2 md:hidden">
          <Hud />
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] animate-fade-in px-4 py-8 lg:px-8">{children}</main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-1 text-3xl font-bold">{title}</h1>
      </div>
      {right}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-elevated p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all",
            value === o.value && "bg-primary text-primary-foreground shadow-soft",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
