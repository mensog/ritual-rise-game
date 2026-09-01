import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSistema } from "@/lib/sistema-store";
import { AuthCard } from "@/components/AuthCard";
import { Field } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Регистрация — SISTEMA" },
      { name: "description", content: "Создай аккаунт SISTEMA и начни путь на 30 дней." },
      { property: "og:title", content: "Регистрация — SISTEMA" },
      {
        property: "og:description",
        content: "Создай аккаунт SISTEMA и начни путь на 30 дней.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { login } = useSistema();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthCard
      eyebrow="РЕГИСТРАЦИЯ"
      subtitle="Начни с малого. Система сделает остальное."
      action="Зарегистрироваться"
      onSubmit={() => {
        login(name || undefined);
        navigate({ to: "/" });
      }}
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link to="/login" className="font-semibold text-primary">
            Войти
          </Link>
        </>
      }
    >
      <Field label="Имя" value={name} onChange={setName} placeholder="Как тебя видят другие" />
      <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@mail.ru" />
      <Field
        label="Пароль"
        value={password}
        onChange={setPassword}
        type="password"
        placeholder="••••••••"
      />
    </AuthCard>
  );
}
