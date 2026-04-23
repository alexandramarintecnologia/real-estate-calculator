"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            AM
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-tight">
              Calculadora Inmobiliaria
            </h1>
            <p className="text-xs text-muted">Alexandra Marín Bienes Raíces</p>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="hidden rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card-hover sm:inline-flex"
              >
                Panel de Admin
              </Link>
            )}
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-foreground leading-tight">
                {user.fullName}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted">
                {user.role === "admin" ? "Administrador" : "Estudiante"}
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-danger/10 hover:text-danger hover:border-danger/40 transition-colors"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
