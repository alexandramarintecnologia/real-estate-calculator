"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { formatCOP } from "@/lib/formatters";
import type { PropertyData } from "@/types/analysis.types";

interface PropertyFormProps {
  data: PropertyData;
  onChange: (data: PropertyData) => void;
  onNext: () => void;
}

export default function PropertyForm({ data, onChange, onNext }: PropertyFormProps) {
  const update = <K extends keyof PropertyData>(key: K, value: PropertyData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const numField = (key: keyof PropertyData, value: string) => {
    const n = value === "" ? 0 : Number(value);
    if (!isNaN(n)) update(key, n as PropertyData[typeof key]);
  };

  const handlePrecioCompraChange = (val: string) => {
    const n = val === "" ? 0 : Number(val);
    if (!isNaN(n)) {
      const updates: Partial<PropertyData> = { precioCompra: n };
      const currentVentaType = data.precioVentaType ?? "percent";
      if (currentVentaType === "percent") {
        const percent = data.precioVentaPercent ?? 30;
        updates.precioVentaProyectado = n * (1 + percent / 100);
      }
      onChange({ ...data, ...updates });
    }
  };

  const ventaType = data.precioVentaType ?? "percent";

  const isValid =
    data.metrosCuadrados > 0 &&
    data.precioCompra > 0 &&
    data.precioVentaProyectado > 0 &&
    data.mesesProyectadosVenta > 0;

  return (
    <div className="space-y-6">
      <Card title="Información del Inmueble" description="Datos básicos de la propiedad a analizar">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Dirección (opcional)"
              value={data.direccion ?? ""}
              onChange={(e) => update("direccion", e.target.value)}
              placeholder="Ej: Calle 100 #15-20, Bogotá"
            />
          </div>
          <Input
            label="Link del portal inmobiliario (opcional)"
            value={data.linkPortal ?? ""}
            onChange={(e) => update("linkPortal", e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Torre (opcional)"
            value={data.torre ?? ""}
            onChange={(e) => update("torre", e.target.value)}
          />
          <Input
            label="Piso (opcional)"
            type="number"
            value={data.piso ?? ""}
            onChange={(e) => numField("piso", e.target.value)}
          />
          <Input
            label="Número de Apto (opcional)"
            value={data.numeroApto ?? ""}
            onChange={(e) => update("numeroApto", e.target.value)}
          />
          <Input
            label="Alcobas"
            type="number"
            min={0}
            value={data.alcobas || ""}
            onChange={(e) => numField("alcobas", e.target.value)}
          />
          <Input
            label="Baños"
            type="number"
            min={0}
            value={data.banos || ""}
            onChange={(e) => numField("banos", e.target.value)}
          />
          <Input
            label="Área total (m²)"
            type="number"
            min={1}
            value={data.metrosCuadrados || ""}
            onChange={(e) => numField("metrosCuadrados", e.target.value)}
            suffix="m²"
            required
          />
          <Input
            label="m² que necesitan remodelación (opcional)"
            type="number"
            min={0}
            value={data.m2Remodelacion || ""}
            onChange={(e) => numField("m2Remodelacion", e.target.value)}
            suffix="m²"
          />
          <Select
            label="Parqueadero"
            options={[
              { value: "true", label: "Sí" },
              { value: "false", label: "No" },
            ]}
            value={String(data.parqueadero)}
            onChange={(e) => update("parqueadero", e.target.value === "true")}
          />
        </div>
      </Card>

      <Card title="Datos del Propietario" description="Información de contacto">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre del propietario (opcional)"
            value={data.nombrePropietario ?? ""}
            onChange={(e) => update("nombrePropietario", e.target.value)}
          />
          <Input
            label="Celular (opcional)"
            value={data.celular ?? ""}
            onChange={(e) => update("celular", e.target.value)}
            placeholder="300 123 4567"
          />
        </div>
      </Card>

      <Card title="Proyección Financiera" description="Datos financieros del inmueble">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Precio de compra"
            type="number"
            min={0}
            value={data.precioCompra || ""}
            onChange={(e) => handlePrecioCompraChange(e.target.value)}
            prefix="$"
            hint="Precio del inmueble en COP"
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Precio de venta proyectado {ventaType === "percent" ? "(Rentabilidad %)" : "(Monto en $)"}
            </label>
            <div className="flex">
              <input
                type="number"
                min={0}
                value={ventaType === "percent" ? (data.precioVentaPercent ?? "") : (data.precioVentaProyectado || "")}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : 0;
                  if (ventaType === "percent") {
                    const newProyectado = data.precioCompra * (1 + val / 100);
                    onChange({
                      ...data,
                      precioVentaPercent: val,
                      precioVentaProyectado: newProyectado
                    });
                  } else {
                    onChange({
                      ...data,
                      precioVentaProyectado: val
                    });
                  }
                }}
                className="block w-full rounded-l-lg border border-r-0 border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={ventaType === "percent" ? "Ej: 30" : "Ej: 400000000"}
              />
              <select
                value={ventaType}
                onChange={(e) => {
                  const newType = e.target.value as "percent" | "fixed";
                  if (newType === "percent") {
                    const percent = data.precioVentaPercent ?? 30;
                    const newProyectado = data.precioCompra * (1 + percent / 100);
                    onChange({
                      ...data,
                      precioVentaType: newType,
                      precioVentaPercent: percent,
                      precioVentaProyectado: newProyectado
                    });
                  } else {
                    onChange({
                      ...data,
                      precioVentaType: newType
                    });
                  }
                }}
                className="rounded-r-lg border border-border bg-foreground/5 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="percent">%</option>
                <option value="fixed">$ (COP)</option>
              </select>
            </div>
            {ventaType === "percent" && data.precioVentaProyectado > 0 && (
              <p className="text-xs text-muted">
                Precio calculado: {formatCOP(data.precioVentaProyectado)}
              </p>
            )}
            {ventaType === "percent" && (
              <p className="text-xs text-muted">
                Ingresa el porcentaje de rentabilidad esperada (ej: 20 al 50%) sobre el precio de compra.
              </p>
            )}
          </div>
          <Input
            label="Arriendo proyectado (mensual) (opcional)"
            type="number"
            min={0}
            value={data.arriendoProyectado || ""}
            onChange={(e) => numField("arriendoProyectado", e.target.value)}
            prefix="$"
            hint="Canon de arriendo mensual estimado"
          />
          <Input
            label="Gastos de posesión (mensual) (opcional)"
            type="number"
            min={0}
            value={data.gastosPosesionMensual || ""}
            onChange={(e) => numField("gastosPosesionMensual", e.target.value)}
            prefix="$"
            hint="Administración, servicios, etc."
          />
          <Input
            label="Meses proyectados para vender"
            type="number"
            min={1}
            value={data.mesesProyectadosVenta || ""}
            onChange={(e) => numField("mesesProyectadosVenta", e.target.value)}
            suffix="meses"
            required
          />
        </div>
      </Card>

      <Card title="Observaciones" description="Notas adicionales sobre la propiedad">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Estado de negociación (opcional)"
            options={[
              { value: "pendiente", label: "Pendiente" },
              { value: "en_negociacion", label: "En negociación" },
              { value: "en_documentos", label: "En documentos" },
              { value: "descartado", label: "Descartado" },
            ]}
            value={data.estadoNegociacion ?? "pendiente"}
            onChange={(e) => update("estadoNegociacion", e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Observaciones (opcional)"
              value={data.observaciones ?? ""}
              onChange={(e) => update("observaciones", e.target.value)}
              placeholder="Notas adicionales..."
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!isValid}>
          Siguiente: Remodelación →
        </Button>
      </div>
    </div>
  );
}
