import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSistema } from "@/lib/sistema-store";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Вход — SISTEMA" },
      { name: "description", content: "Войди в SISTEMA и продолжи свою серию." },
      { property: "og:title", content: "Вход — SISTEMA" },
      { property: "og:description", content: "Войди в SISTEMA и продолжи свою серию." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useSistema();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthCard
      eyebrow="ВХОД"
      subtitle="Дисциплина любит возвращение. С возвращением."
      action="Войти"
      onSubmit={() => {
        login();
        navigate({ to: "/" });
      }}
      footer={
        <>
          Нет аккаунта?{" "}
          <Link to="/register" className="font-semibold text-primary">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@mail.ru" />
      <Field label="Пароль" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
    </AuthCard>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-elevated px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
