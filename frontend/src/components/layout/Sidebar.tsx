"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { NAV_ITEMS, isNavItemActive, type NavItem } from "./nav-items";

const COLLAPSE_KEY = "sidebar:collapsed";

// ─── Store del colapso ───────────────────────────────────────────────────────
// La preferencia vive en localStorage, que es un sistema externo a React.
// useSyncExternalStore la lee sin desincronizar el render del servidor: el
// snapshot de servidor siempre es "expandido" y el cliente corrige tras hidratar.

const collapseListeners = new Set<() => void>();
let collapsedCache: boolean | null = null;

function readCollapsed(): boolean {
  if (collapsedCache === null) {
    try {
      collapsedCache = window.localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      // localStorage puede fallar en modo privado; el default (expandido) sirve.
      collapsedCache = false;
    }
  }
  return collapsedCache;
}

function subscribeCollapsed(onChange: () => void): () => void {
  collapseListeners.add(onChange);
  return () => {
    collapseListeners.delete(onChange);
  };
}

function writeCollapsed(next: boolean): void {
  collapsedCache = next;
  try {
    window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
  } catch {
    // Sin persistencia, pero el toggle igual funciona en la sesion.
  }
  collapseListeners.forEach((listener) => listener());
}

interface SidebarProps {
  /** Estado del drawer en movil. */
  open: boolean;
  onClose: () => void;
}

// ─── Item de navegacion ──────────────────────────────────────────────────────

interface NavLinkProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  showHint: boolean;
  onNavigate?: () => void;
}

function NavLink({ item, active, collapsed, showHint, onNavigate }: NavLinkProps) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      // Cuando esta colapsado el texto se oculta, asi que el label va en title
      // para que quede accesible con mouse y lectores de pantalla.
      title={collapsed ? item.label : undefined}
      className={[
        "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5",
        "text-sm transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/40",
        "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
        collapsed ? "justify-center px-0" : "",
        active
          ? "bg-primary-softer font-semibold text-primary"
          : "font-medium text-foreground hover:bg-card-hover hover:text-primary",
      ].join(" ")}
    >
      {/* Barra indicadora del item activo */}
      <span
        aria-hidden
        className={[
          "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary",
          "transition-opacity motion-reduce:transition-none",
          active ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <span className={active ? "text-primary" : "text-muted group-hover:text-primary"}>
        {item.icon}
      </span>
      {!collapsed && (
        <span className="flex min-w-0 flex-col">
          <span className="truncate leading-tight">{item.label}</span>
          {showHint && (
            <span className="truncate text-[11px] font-normal text-muted">{item.hint}</span>
          )}
        </span>
      )}
    </Link>
  );
}

// ─── Lista ───────────────────────────────────────────────────────────────────

function NavList({
  items,
  pathname,
  collapsed,
  showHint,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  showHint: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item.href}>
          <NavLink
            item={item}
            active={isNavItemActive(pathname, item)}
            collapsed={collapsed}
            showHint={showHint}
            onNavigate={onNavigate}
          />
        </li>
      ))}
    </ul>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);

  const toggleCollapsed = useCallback(() => {
    writeCollapsed(!readCollapsed());
  }, []);

  // Drawer movil: Escape cierra, y el scroll del fondo se bloquea.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!user) return null;

  return (
    <>
      {/* ── Desktop: columna persistente ── */}
      <aside
        aria-label="Navegacion principal"
        className={[
          "sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 self-start",
          "border-r border-border bg-card/60 lg:flex lg:flex-col",
          "transition-[width] duration-200 motion-reduce:transition-none",
          collapsed ? "w-[76px]" : "w-64",
        ].join(" ")}
      >
        <nav className="flex-1 overflow-y-auto p-3">
          <NavList items={NAV_ITEMS} pathname={pathname} collapsed={collapsed} showHint={false} />
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expandir menu lateral" : "Colapsar menu lateral"}
            className={[
              "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
              "text-muted transition-colors outline-none hover:bg-card-hover hover:text-foreground",
              "focus-visible:ring-2 focus-visible:ring-primary/40",
              collapsed ? "justify-center px-0" : "",
            ].join(" ")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={`transition-transform motion-reduce:transition-none ${collapsed ? "rotate-180" : ""}`}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {!collapsed && <span>Colapsar</span>}
          </button>
        </div>
      </aside>

      {/* ── Movil: drawer ── */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={onClose}
          className={[
            "absolute inset-0 bg-foreground/40 backdrop-blur-sm",
            "transition-opacity duration-200 motion-reduce:transition-none",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navegacion principal"
          tabIndex={-1}
          className={[
            "absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-card shadow-xl outline-none",
            "transition-transform duration-200 motion-reduce:transition-none",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Menu</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menu"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-muted outline-none transition-colors hover:bg-card-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3">
            <NavList
              items={NAV_ITEMS}
              pathname={pathname}
              collapsed={false}
              showHint
              onNavigate={onClose}
            />
          </nav>
        </div>
      </div>
    </>
  );
}
