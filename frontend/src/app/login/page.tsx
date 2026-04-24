"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Logo from "@/components/layout/Logo";

const FEATURES = [
  {
    title: "Decisiones basadas en datos",
    description: "ROI, Cap Rate y evaluación de zona calculados al instante.",
  },
  {
    title: "Escenarios de remodelación",
    description: "Compara los 3 niveles de inversión y elige el mejor.",
  },
  {
    title: "Minimiza tus riesgos",
    description: "Identifica rápidamente si una propiedad es un buen negocio antes de invertir.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await login(email, password);
      router.replace(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      {/* Panel izquierdo — branding */}
      <aside
        className="brand-pattern relative flex flex-col justify-between overflow-hidden px-8 py-10 text-white lg:w-[45%] lg:px-14 lg:py-12"
        style={{
          background:
            "linear-gradient(135deg, #5B21B6 0%, #6D28D9 50%, #7C3AED 100%)",
        }}
      >
        {/* Blobs decorativos */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <Logo height={120} invert className="drop-shadow-lg" />
        </div>

        <div className="relative z-10 hidden lg:block">
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Invierte en propiedades con la confianza que dan los números.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            La herramienta profesional que te guía desde el análisis financiero hasta
            la evaluación de zona, en minutos y con precisión.
          </p>

          <ul className="mt-10 space-y-5">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="mt-0.5 text-xs text-white/70">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 hidden text-xs text-white/60 lg:block">
          © {new Date().getFullYear()} Alexandra Marín · Bienes Raíces
        </div>
      </aside>

      {/* Panel derecho — formulario */}
      <main className="flex flex-1 items-center justify-center bg-background px-4 py-10 sm:px-6 lg:py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo solo visible en móvil (en desktop está en el panel izq) */}
          <div className="mb-10 flex items-center justify-center lg:hidden">
            <Logo height={100} />
          </div>

          <div>
            <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
              Acceso privado
            </span>
            <h1 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">
              Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-sm text-muted">
              Inicia sesión con el correo y la contraseña que te entregaron al adquirir
              el curso.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label
                className="block text-xs font-medium uppercase tracking-wide text-muted"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-xs font-medium uppercase tracking-wide text-muted"
                htmlFor="password"
              >
                Contraseña
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Iniciar sesión
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted">
            ¿Problemas con tu acceso?{" "}
            <span className="font-medium text-foreground">
              Comunícate con el equipo de Alexandra Marín.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
