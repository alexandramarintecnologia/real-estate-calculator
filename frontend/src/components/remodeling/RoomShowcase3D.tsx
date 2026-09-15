"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Card from "@/components/ui/Card";
import GalleryImage from "./GalleryImage";
import { APARTMENT_ROOMS } from "@/lib/apartment-layout";
import { hasInterior } from "@/lib/room-interiors";
import { formatCOP } from "@/lib/formatters";
import type { AreaCost, BudgetTierEstimate, BudgetTierId } from "@/types/remodeling.types";

// Three.js solo hace falta aca: con dynamic + ssr:false no entra al bundle de
// las demas paginas ni se intenta renderizar donde no existe WebGL.
const RoomScene = dynamic(() => import("./RoomScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">
      Cargando vista 3D…
    </div>
  ),
});

interface RoomShowcase3DProps {
  areaCosts: AreaCost[];
  tiers: BudgetTierEstimate[];
  recommendedTier: BudgetTierId | null;
}

const TIER_BLURB: Record<BudgetTierId, string> = {
  bajo: "Acabados básicos: baldosa mate, carpintería blanca, mesón laminado y plafón central.",
  medio: "Cuarzo en mesones, salpicadero en baldosín, carpintería en madera, cortinas y luz de cornisa.",
  alto: "Mármol, carpintería oscura, herrajes en latón, lámparas colgantes y decoración completa.",
};

export default function RoomShowcase3D({
  areaCosts,
  tiers,
  recommendedTier,
}: RoomShowcase3DProps) {
  const rooms = useMemo(() => areaCosts.filter((a) => hasInterior(a.area)), [areaCosts]);
  const crossCutting = useMemo(
    () => areaCosts.filter((a) => !hasInterior(a.area)),
    [areaCosts],
  );

  const [roomId, setRoomId] = useState<string | null>(rooms[0]?.area ?? null);
  const [tier, setTier] = useState<BudgetTierId>(recommendedTier ?? "medio");

  // Si cambia la seleccion y el ambiente activo ya no esta, se cae al primero.
  const activeRoom = rooms.some((r) => r.area === roomId) ? roomId : (rooms[0]?.area ?? null);
  const activeTier = tiers.find((t) => t.tier === tier);
  const roomLabel = APARTMENT_ROOMS.find((r) => r.id === activeRoom)?.label ?? "";

  if (rooms.length === 0 || !activeRoom) {
    return (
      <Card title="Diseño 3D" description="Cómo queda cada ambiente en los tres niveles.">
        <p className="text-sm text-muted">
          Marcá al menos un ambiente (cocina, baño, habitación…) para ver el resultado.
          {crossCutting.length > 0 &&
            " Las áreas transversales que marcaste no son un recinto que se pueda mostrar."}
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="Diseño 3D por ambiente"
      description="Recorré cada ambiente y compará cómo queda con cada nivel de presupuesto."
    >
      {/* Ambientes marcados */}
      <div role="tablist" aria-label="Ambiente" className="mb-4 flex flex-wrap gap-2">
        {rooms.map((room) => {
          const active = room.area === activeRoom;
          return (
            <button
              key={room.area}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setRoomId(room.area)}
              className={[
                "min-h-11 rounded-lg border px-4 py-2 text-sm font-medium",
                "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                active
                  ? "border-primary bg-primary-softer text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-card-hover",
              ].join(" ")}
            >
              {room.label}
            </button>
          );
        })}
      </div>
      {/* Las referencias van primero: es lo que mas rapido comunica la
          diferencia entre niveles. El recorrido 3D queda debajo. */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">
          Así queda {roomLabel.toLowerCase()} en cada nivel
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {tiers.map((t) => {
            const active = t.tier === tier;
            return (
              <button
                key={t.tier}
                type="button"
                onClick={() => setTier(t.tier)}
                aria-pressed={active}
                className={[
                  "group overflow-hidden rounded-xl border text-left outline-none",
                  "transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
                  active
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/40",
                ].join(" ")}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-card-hover">
                  <GalleryImage
                    roomId={activeRoom}
                    tier={t.tier}
                    alt={`${roomLabel} con presupuesto ${t.label}`}
                  />
                  <span
                    className={[
                      "absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white",
                      active ? "bg-primary" : "bg-foreground/80",
                    ].join(" ")}
                  >
                    {t.label}
                  </span>
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs font-medium text-foreground">
                    {formatCOP(t.totalBudget)}
                  </p>
                  <p className="text-[11px] text-muted">{t.percent}% del apartamento</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>


      {/* Los niveles van entre las fotos y el 3D: se elige mirando las
          referencias y el resultado se ve enseguida en el recorrido. */}
      <div role="radiogroup" aria-label="Nivel de presupuesto" className="mt-5 grid gap-2 sm:grid-cols-3">
        {tiers.map((t) => {
          const active = t.tier === tier;
          return (
            <button
              key={t.tier}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTier(t.tier)}
              className={[
                "flex min-h-11 flex-col items-start rounded-lg border px-4 py-2.5 text-left",
                "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                active
                  ? "border-primary bg-primary-softer"
                  : "border-border bg-card hover:border-primary/30 hover:bg-card-hover",
              ].join(" ")}
            >
              <span className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                  {t.label}
                </span>
                <span className="text-xs text-muted">{t.percent}%</span>
                {t.tier === recommendedTier && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Tu nivel
                  </span>
                )}
              </span>
              <span className="text-xs text-muted">{formatCOP(t.totalBudget)}</span>
            </button>
          );
        })}
      </div>



      <div className="mt-6 border-t border-border pt-5">
        <p className="mb-3 text-sm font-semibold text-foreground">
          Recorrido 3D del espacio
        </p>
      {/* Sin key a proposito: remontar el componente creaba un contexto WebGL
          nuevo en cada cambio y el navegador los termina bloqueando. */}
      <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-border bg-background">
        <RoomScene roomId={activeRoom} tier={tier} />
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-foreground/85 px-3 py-1.5 text-xs font-medium text-white">
          {roomLabel} · Nivel {activeTier?.label ?? ""}
        </div>
        <p className="pointer-events-none absolute bottom-3 right-3 text-[11px] text-muted">
          Arrastrá para mirar alrededor · rueda para acercar
        </p>
      </div>

        <p className="mt-3 text-xs text-muted">{TIER_BLURB[tier]}</p>
      </div>
      {crossCutting.length > 0 && (
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
          <span className="font-medium text-foreground">También marcaste:</span>{" "}
          {crossCutting.map((c) => c.label).join(", ")}. Se reflejan en los acabados de
          cada ambiente, no como un espacio aparte.
        </p>
      )}
    </Card>
  );
}
