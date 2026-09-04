import { useEffect, useRef, useState } from "react";
import { Search, Trash2, Upload, X } from "lucide-react";
import { useSistema } from "@/lib/sistema-store";
import { cn } from "@/lib/utils";

export const isSticker = (v: string) => /^(https?:|data:|blob:)/.test(v);

export function HabitIcon({ value, className }: { value: string; className?: string }) {
  if (isSticker(value)) {
    return (
      <img
        src={value}
        alt=""
        className={cn("h-5 w-5 shrink-0 rounded-sm object-cover", className)}
      />
    );
  }
  return <span className={cn("shrink-0 leading-none", className)}>{value}</span>;
}

const GROUPS: { name: string; items: string[] }[] = [
  {
    name: "Часто",
    items: ["✳️", "✅", "🔥", "⭐", "🎯", "⚡", "📌", "🧩", "🕒", "💡"],
  },
  {
    name: "Тело",
    items: ["🏋️", "🏃", "🚴", "🧘", "💪", "🥗", "💧", "😴", "🥦", "🍎", "🩺", "🧊"],
  },
  {
    name: "Разум",
    items: ["📖", "🧠", "✍️", "🎓", "🗒️", "🔬", "🧮", "🗣️", "🎧", "🖋️"],
  },
  {
    name: "Работа",
    items: ["💻", "📊", "📈", "📞", "📮", "🗂️", "🧾", "🛠️", "⚙️", "🚀"],
  },
  {
    name: "Быт",
    items: ["🏠", "🧹", "🧺", "🍳", "🛒", "🌱", "🐕", "🚿", "💸", "🧴"],
  },
  {
    name: "Настрой",
    items: ["🌅", "🌙", "☀️", "🌊", "🍀", "🕊️", "❤️", "🙏", "🎨", "🎵"],
  },
];

export function EmojiPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const s = useSistema();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [url, setUrl] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      s.addSticker(src);
      pick(src);
    };
    reader.readAsDataURL(file);
  };

  const query = q.trim().toLowerCase();
  const groups = query
    ? GROUPS.filter((g) => g.name.toLowerCase().includes(query))
    : GROUPS;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-md border border-input bg-elevated text-base hover:bg-accent"
        aria-label="Выбрать иконку"
      >
        <HabitIcon value={value} />
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-50 w-80 rounded-md border border-border bg-popover p-3 shadow-lift">
          <div className="mb-2 flex items-center gap-2 rounded-md border border-input bg-elevated px-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск иконки…"
              className="w-full bg-transparent py-2 text-sm outline-none"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Очистить">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto pr-1">
            {s.stickers.length > 0 && (
              <div className="mb-2">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Мои стикеры
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {s.stickers.map((src) => (
                    <div key={src} className="group relative">
                      <button
                        onClick={() => pick(src)}
                        className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
                      >
                        <HabitIcon value={src} />
                      </button>
                      <button
                        onClick={() => s.removeSticker(src)}
                        className="absolute -right-1 -top-1 hidden rounded-full bg-destructive p-0.5 text-destructive-foreground group-hover:block"
                        aria-label="Удалить стикер"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groups.map((g) => {
              const items = g.items;
              return (
                <div key={g.name} className="mb-2">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {g.name}
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {items.map((e) => (
                      <button
                        key={e + g.name}
                        onClick={() => pick(e)}
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-md text-base hover:bg-muted",
                          value === e && "bg-accent ring-1 ring-primary",
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 border-t border-border pt-2">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Свой стикер
            </div>
            <div className="flex gap-1">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ссылка на картинку…"
                className="min-w-0 flex-1 rounded-md border border-input bg-elevated px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => {
                  const v = url.trim();
                  if (!v) return;
                  s.addSticker(v);
                  setUrl("");
                  pick(v);
                }}
                className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground"
              >
                Ок
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="grid w-8 place-items-center rounded-md border border-border hover:bg-muted"
                aria-label="Загрузить файл"
              >
                <Upload className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
