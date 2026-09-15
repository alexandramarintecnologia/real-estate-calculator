"use client";

import { useState, type ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
  /** Ancho maximo del contenido. Clases completas porque Tailwind no las arma en runtime. */
  maxWidth?: "max-w-5xl" | "max-w-6xl";
}

/**
 * Layout de la app autenticada: header arriba, menu lateral a la izquierda
 * y el contenido a la derecha. En movil el menu vive en un drawer.
 */
export default function AppShell({ children, maxWidth = "max-w-5xl" }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header onMenuClick={() => setMenuOpen(true)} />
      <div className="flex flex-1">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="min-w-0 flex-1">
          <div className={`mx-auto w-full ${maxWidth} px-4 py-6 sm:px-6`}>{children}</div>
        </main>
      </div>
    </>
  );
}
