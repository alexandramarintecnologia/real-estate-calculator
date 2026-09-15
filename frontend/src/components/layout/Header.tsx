"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "./Logo";

interface HeaderProps {
  /** Abre el drawer de navegacion. Solo se usa en movil. */
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {user && onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Abrir menu de navegacion"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground outline-none transition-colors hover:bg-card-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Logo height={36} />
            <div className="hidden border-l border-border pl-3 sm:block">
              <h1 className="text-xs font-semibold uppercase tracking-wider text-foreground leading-tight">
                Calculadora Inmobiliaria
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-muted">
                Bienes Raíces
              </p>
            </div>
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="hidden min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:border-primary/30 hover:bg-primary-softer hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 sm:inline-flex"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                </svg>
                Admin
              </Link>
            )}

            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                {user.fullName
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="max-w-[140px] truncate text-xs font-medium text-foreground leading-tight">
                  {user.fullName}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted">
                  {user.role === "admin" ? "Administrador" : "Estudiante"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:border-danger/40 hover:bg-danger/5 hover:text-danger focus-visible:ring-2 focus-visible:ring-danger/30"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
