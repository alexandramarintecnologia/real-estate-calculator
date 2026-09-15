"use client";

import Card from "@/components/ui/Card";
import type { AreaCatalog } from "@/types/remodeling.types";

interface AreaSelectorProps {
  catalog: AreaCatalog | null;
  selectedAreas: string[];
  onToggle: (areaId: string) => void;
  onSelectGroup: (areaIds: string[], select: boolean) => void;
}

export default function AreaSelector({
  catalog,
  selectedAreas,
  onToggle,
  onSelectGroup,
}: AreaSelectorProps) {
  if (!catalog) {
    return (
      <Card title="Áreas a remodelar">
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-card-hover" />
          ))}
        </div>
      </Card>
    );
  }

  const selected = new Set(selectedAreas);

  return (
    <Card
      title="Áreas a remodelar"
      description="Elegí en qué se va a ir el presupuesto. El monto se reparte entre lo seleccionado."
    >
      <div className="space-y-6">
        {catalog.groups.map((group) => {
          const groupAreas = catalog.areas.filter((a) => a.group === group.id);
          const ids = groupAreas.map((a) => a.id);
          const allSelected = ids.every((id) => selected.has(id));

          return (
            <fieldset key={group.id}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <legend className="text-sm font-semibold text-foreground">
                  {group.label}
                  <span className="ml-2 text-xs font-normal text-muted">
                    {group.description}
                  </span>
                </legend>
                <button
                  type="button"
                  onClick={() => onSelectGroup(ids, !allSelected)}
                  className="min-h-11 text-xs font-medium text-primary outline-none transition-colors hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {allSelected ? "Quitar todo" : "Seleccionar todo"}
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {groupAreas.map((area) => {
                  const isSelected = selected.has(area.id);
                  return (
                    <label
                      key={area.id}
                      className={[
                        "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5",
                        "transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40",
                        isSelected
                          ? "border-primary bg-primary-softer"
                          : "border-border bg-card hover:border-primary/30 hover:bg-card-hover",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(area.id)}
                        className="h-4 w-4 shrink-0 accent-primary outline-none"
                      />
                      <span
                        className={`text-sm ${isSelected ? "font-medium text-primary" : "text-foreground"}`}
                      >
                        {area.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      <p className="mt-5 border-t border-border pt-4 text-xs text-muted">
        {selectedAreas.length === 0
          ? "Ningún área seleccionada — el presupuesto queda sin repartir."
          : `${selectedAreas.length} de ${catalog.areas.length} áreas seleccionadas.`}
      </p>
    </Card>
  );
}
