"use client";

import Image from "next/image";

interface LogoProps {
  /** Alto del logo en px. Por defecto 32. */
  height?: number;
  /** Si true, invierte colores para fondos oscuros. */
  invert?: boolean;
  /** Clases extra. */
  className?: string;
}

export default function Logo({ height = 32, invert = false, className = "" }: LogoProps) {
  // Ratio nativo del SVG: 1260 / 848
  const width = Math.round((height * 1260) / 848);

  return (
    <Image
      src="/logo.svg"
      alt="Alexandra Marín Bienes Raíces"
      width={width}
      height={height}
      className={`${invert ? "logo-invert" : ""} ${className}`.trim()}
      priority
    />
  );
}
