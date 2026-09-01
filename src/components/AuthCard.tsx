import type { ReactNode } from "react";

export function AuthCard({
  eyebrow,
  subtitle,
  action,
  onSubmit,
  children,
  footer,
}: {
  eyebrow: string;
  subtitle: string;
  action: string;
  onSubmit: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-[320px] w-[320px] rounded-full bg-flame/15 blur-[120px]" />

      <div className="surface relative w-full max-w-md p-8 shadow-lift">
        <div className="text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
            {eyebrow}
          </div>
          <h1 className="mt-2 text-4xl font-bold">
            SISTEMA<span className="text-primary">.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {children}
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {action}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
