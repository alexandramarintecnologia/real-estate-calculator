import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  /** Descripcion corta, se muestra en el drawer movil. */
  hint: string;
  icon: ReactNode;
  /** Si true, solo marca activo con coincidencia exacta de ruta. */
  exact?: boolean;
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Calculadora Inmobiliaria",
    hint: "Analizar un inmueble nuevo",
    exact: true,
    icon: (
      <svg {...iconProps}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="11" x2="8" y2="11" />
        <line x1="12" y1="11" x2="12" y2="11" />
        <line x1="16" y1="11" x2="16" y2="11" />
        <line x1="8" y1="15" x2="8" y2="15" />
        <line x1="12" y1="15" x2="12" y2="15" />
        <line x1="16" y1="15" x2="16" y2="19" />
        <line x1="8" y1="19" x2="12" y2="19" />
      </svg>
    ),
  },
  {
    href: "/remodelaciones",
    label: "Remodelaciones",
    hint: "Proyectar el costo de una remodelacion",
    icon: (
      <svg {...iconProps}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    href: "/comparar",
    label: "Comparar",
    hint: "Enfrentar dos o mas inmuebles",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="18" rx="1" />
        <rect x="14" y="3" width="7" height="18" rx="1" />
      </svg>
    ),
  },
  {
    href: "/historial",
    label: "Historial",
    hint: "Analisis guardados",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

/** Marca activo el item cuya ruta coincide (exacta o como prefijo de segmento). */
export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
