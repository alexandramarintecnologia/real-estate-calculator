"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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

  const isValid =
    data.direccion.trim() !== "" &&
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
              label="Dirección"
              value={data.direccion}
              onChange={(e) => update("direccion", e.target.value)}
              placeholder="Ej: Calle 100 #15-20, Bogotá"
              required
            />
          </div>
          <Input
            label="Link del portal inmobiliario"
            value={data.linkPortal ?? ""}
            onChange={(e) => update("linkPortal", e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Torre"
            value={data.torre ?? ""}
            onChange={(e) => update("torre", e.target.value)}
          />
          <Input
            label="Piso"
            type="number"
            value={data.piso ?? ""}
            onChange={(e) => numField("piso", e.target.value)}
          />
          <Input
            label="Número de Apto"
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
            label="m² que necesitan remodelación"
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

      <Card title="Datos del Propietario" description="Información de contacto (opcional)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre del propietario"
            value={data.nombrePropietario ?? ""}
            onChange={(e) => update("nombrePropietario", e.target.value)}
          />
          <Input
            label="Celular"
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
            onChange={(e) => numField("precioCompra", e.target.value)}
            prefix="$"
            hint="Precio del inmueble en COP"
            required
          />
          <Input
            label="Precio de venta proyectado"
            type="number"
            min={0}
            value={data.precioVentaProyectado || ""}
            onChange={(e) => numField("precioVentaProyectado", e.target.value)}
            prefix="$"
            required
          />
          <Input
            label="Arriendo proyectado (mensual)"
            type="number"
            min={0}
            value={data.arriendoProyectado || ""}
            onChange={(e) => numField("arriendoProyectado", e.target.value)}
            prefix="$"
            hint="Canon de arriendo mensual estimado"
          />
          <Input
            label="Gastos de posesión (mensual)"
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
          <Input
            label="Puntuación personal"
            type="number"
            min={0}
            max={10}
            value={data.puntuacionPersonal ?? ""}
            onChange={(e) => numField("puntuacionPersonal", e.target.value)}
            hint="De 0 a 10"
          />
          <Select
            label="Estado de negociación"
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
              label="Observaciones"
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
