"use client";

import { useState } from "react";
import { expectedPath, galleryCandidates } from "@/lib/room-gallery";
import type { BudgetTierId } from "@/types/remodeling.types";

interface GalleryImageProps {
  roomId: string;
  tier: BudgetTierId;
  alt: string;
}

/**
 * Imagen de referencia. Prueba las extensiones admitidas en orden (.jpg,
 * .jpeg, .png, .webp, .avif) y, si no encuentra ninguna, dice que archivo
 * hace falta.
 *
 * El recorrido por onError tambien cubre el caso de un navegador que no sabe
 * decodificar avif: falla la carga y cae al siguiente formato disponible.
 *
 * Usa <img> y no next/image a proposito: la existencia del archivo se descubre
 * en el navegador por el onError, y el optimizador de Next falla en build
 * cuando la ruta todavia no existe.
 */
export default function GalleryImage({ roomId, tier, alt }: GalleryImageProps) {
  const candidates = galleryCandidates(roomId, tier);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  if (index >= candidates.length) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-card-hover p-3 text-center">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="text-muted"
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <p className="text-[11px] font-medium text-foreground">Falta la imagen</p>
        <code className="break-all rounded bg-foreground/5 px-1.5 py-0.5 text-[10px] text-muted">
          {expectedPath(roomId, tier)}
        </code>
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-card-hover" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={candidates[index]}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setIndex((i) => i + 1)}
      />
    </>
  );
}
