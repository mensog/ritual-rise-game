import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useSistema, type Visibility } from "@/lib/sistema-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Профиль и данные — SISTEMA" },
      {
        name: "description",
        content: "Настройки профиля, приватность, экспорт данных и вебхуки событий.",
      },
      { property: "og:title", content: "Профиль и данные — SISTEMA" },
      {
        property: "og:description",
        content: "Настройки профиля, приватность, экспорт данных и вебхуки событий.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = useSistema();
  const [name, setName] = useState(s.displayName);
  const [visibility, setVisibility] = useState<Visibility>(s.visibility);
  const [url, setUrl] = useState("");
  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "—";

  return (
    <AppShell>
      <PageHeader eyebrow="АККАУНТ" title="Профиль и данные" />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-6">
          <h2 className="mb-5 text-lg font-bold">Профиль</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Отображаемое имя
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как тебя видят другие"
                className="w-full rounded-xl border border-input bg-elevated px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Видимость профиля
              </span>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
                className="w-full rounded-xl border border-input bg-elevated px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="private">Приватный</option>
                <option value="friends">Только друзья</option>
                <option value="public">Публичный (в рейтинге)</option>
              </select>
              <span className="mt-1.5 block text-xs text-muted-foreground">
                По умолчанию профиль приватный: в рейтинге видны только те, кто включил видимость.
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Таймзона
              </span>
              <input
                value={tz}
                readOnly
                className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground"
              />
            </label>
            <button
              onClick={() => {
                s.setProfile(name.trim() || "Без имени", visibility);
                toast.success("Профиль сохранён");
              }}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Сохранить
            </button>
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="mb-3 text-lg font-bold">Данные</h2>
          <p className="text-sm text-muted-foreground">
            Забери всё, что накопил: привычки, отметки, XP, программа, миссии.
          </p>
          <button
            onClick={s.exportData}
            className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-elevated px-5 py-2.5 text-sm font-semibold hover:bg-accent"
          >
            <Download className="h-4 w-4" /> Скачать мои данные (JSON)
          </button>
        </section>

        <section className="surface p-6 lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold">Вебхуки</h2>
          <p className="text-sm text-muted-foreground">
            События (уровень, серия, достижение, boss) уходят POST-запросом на твой адрес —
            Telegram-бот, Discord, Zapier.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.example.com/sistema"
              className="min-w-64 flex-1 rounded-xl border border-input bg-elevated px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => {
                if (!url.trim()) return;
                s.addWebhook(url.trim());
                setUrl("");
              }}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Добавить
            </button>
          </div>

          <div className="mt-5 space-y-2">
            {s.webhooks.map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-elevated px-4 py-2.5"
              >
                <span className="truncate text-sm">{w.url}</span>
                <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={w.active}
                    onChange={() => s.toggleWebhook(w.id)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  активен
                </label>
                <button
                  onClick={() => s.removeWebhook(w.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                  aria-label="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {s.webhooks.length === 0 && (
              <p className="text-sm text-muted-foreground">Вебхуков пока нет.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
