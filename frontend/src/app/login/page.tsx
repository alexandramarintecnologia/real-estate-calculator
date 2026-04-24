"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/layout/Logo";
import { ApiError } from "@/lib/api-client";

const FEATURES = [
  {
    title: "Maximiza tu retorno de inversión",
    description: "Calcula ROI y Cap Rate con precisión profesional",
  },
  {
    title: "Escenarios de remodelación",
    description: "Evalúa costos y beneficios de renovaciones",
  },
  {
    title: "Análisis comparativo de zonas",
    description: "Compara rentabilidades por ubicación",
  },
];

type Mode = "login" | "set-password";

const inputBaseClass =
  "block w-full rounded-2xl border border-border/80 bg-white py-3.5 pl-12 pr-12 text-sm text-foreground placeholder:text-muted/50 transition-colors focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20";

export default function LoginPage() {
  const router = useRouter();
  const { login, setInitialPassword } = useAuth();

  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const goAfterAuth = (role: string) => {
    router.replace(role === "admin" ? "/admin" : "/");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await login(email, password);
      goAfterAuth(user.role);
    } catch (err) {
      if (err instanceof ApiError && err.code === "PASSWORD_NOT_SET") {
        setMode("set-password");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      const user = await setInitialPassword(email, newPassword);
      goAfterAuth(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const backToLogin = () => {
    setMode("login");
    setError(null);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      {/* Panel izquierdo — branding */}
      <aside
        className="brand-pattern relative hidden flex-col justify-between overflow-hidden px-8 py-10 text-white lg:flex lg:w-[45%] lg:px-14 lg:py-12"
        style={{
          background:
            "linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #8B5CF6 100%)",
        }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <Logo height={120} invert className="drop-shadow-lg" />
        </div>

        <div className="relative z-10 hidden lg:block">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Invierte en propiedades con la confianza que dan los números.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/90">
            Analiza inversiones inmobiliarias con datos precisos y toma
            decisiones informadas para maximizar tu rentabilidad.
          </p>

          <ul className="mt-10 space-y-6">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex items-start gap-4">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">{feature.title}</p>
                  <p className="mt-0.5 text-sm text-white/80">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 hidden text-xs text-white/70 lg:block">
          © {new Date().getFullYear()} AM Bienes Raíces. Todos los derechos reservados.
        </div>
      </aside>

      {/* Panel derecho — formulario */}
      <main className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-10 sm:px-6 lg:py-12">
        {/* Franja decorativa superior (solo móvil) */}
        <div className="absolute left-0 top-0 h-16 w-full bg-gradient-to-r from-[#4C1D95] via-[#7C3AED] to-[#8B5CF6] lg:hidden" />

        <div className="mt-16 w-full max-w-[420px] animate-fade-in-up lg:mt-0">
          {/* Logo solo visible en móvil */}
          <div className="mb-10 flex items-center justify-center lg:hidden">
            <Logo height={100} />
          </div>

          {mode === "login" ? (
            <>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-[#1e1b4b]">
                  Bienvenido de nuevo
                </h1>
                <p className="mt-3 text-sm text-muted">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              <form onSubmit={handleLogin} className="mt-10 space-y-6">
                <EmailField
                  value={email}
                  onChange={setEmail}
                  autoFocus
                />

                <PasswordField
                  id="password"
                  label="Contraseña"
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  onToggleShow={() => setShowPassword((v) => !v)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border/80 text-[#7C3AED] focus:ring-[#7C3AED]"
                    />
                    Recordarme
                  </label>
                  <a
                    href="#"
                    className="text-sm font-medium text-[#7C3AED] transition-colors hover:text-[#6D28D9] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <SubmitButton isLoading={isLoading} label="Iniciar sesión" />
              </form>

              <p className="mt-10 text-center text-sm text-muted">
                ¿No tienes una cuenta?{" "}
                <a
                  href="#"
                  className="font-medium text-[#7C3AED] transition-colors hover:text-[#6D28D9] hover:underline"
                >
                  Contacta al administrador
                </a>
              </p>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDE9FE]">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-[#1e1b4b]">
                  Crea tu contraseña
                </h1>
                <p className="mt-3 text-sm text-muted">
                  Es tu primer ingreso. Define la contraseña que usarás de ahora
                  en adelante para acceder a la plataforma.
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">{email}</p>
              </div>

              <form onSubmit={handleSetPassword} className="mt-8 space-y-5">
                <PasswordField
                  id="new-password"
                  label="Nueva contraseña"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showNewPassword}
                  onToggleShow={() => setShowNewPassword((v) => !v)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  autoFocus
                  hint="Usa al menos 6 caracteres. Te recomendamos combinar letras y números."
                />

                <PasswordField
                  id="confirm-password"
                  label="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showNewPassword}
                  onToggleShow={() => setShowNewPassword((v) => !v)}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                />

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <SubmitButton isLoading={isLoading} label="Guardar y entrar" />

                <button
                  type="button"
                  onClick={backToLogin}
                  className="block w-full text-center text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  ← Volver al inicio de sesión
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function EmailField({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label
        className="block text-sm font-semibold text-[#1e1b4b]"
        htmlFor="email"
      >
        Correo Electrónico
      </label>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted/70"
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
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBaseClass} pr-4`}
          placeholder="tu@email.com"
        />
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
  autoComplete,
  autoFocus,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#1e1b4b]" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted/70"
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
          id={id}
          type={show ? "text" : "password"}
          required
          minLength={6}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputBaseClass}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {hint && <p className="pl-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
      <svg
        className="mt-0.5 h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

function SubmitButton({ isLoading, label }: { isLoading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#7C3AED] py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(124,58,237,0.5)] transition-all hover:bg-[#6D28D9] hover:shadow-[0_8px_20px_-6px_rgba(109,40,217,0.5)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 disabled:opacity-70"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
          </svg>
          Procesando...
        </span>
      ) : (
        <>
          {label}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </>
      )}
    </button>
  );
}
