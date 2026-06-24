"use client";

import { useCallback } from "react";
import Input from "@/components/ui/Input";
import NumberInput from "@/components/ui/NumberInput";
import InlineNumberInput from "@/components/ui/InlineNumberInput";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormErrorSummary from "@/components/ui/FormErrorSummary";
import { useFormValidation } from "@/hooks/useFormValidation";
import { fieldSelectRightClass } from "@/lib/field-classes";
import { formatCOP } from "@/lib/formatters";
import type { PropertyData } from "@/types/analysis.types";

interface PropertyFormProps {
  data: PropertyData;
  onChange: (data: PropertyData) => void;
  onNext: () => void;
}

type RequiredField =
  | "alcobas"
  | "banos"
  | "metrosCuadrados"
  | "precioCompra"
  | "precioVentaProyectado"
  | "mesesProyectadosVenta";

const REQUIRED_FIELDS: RequiredField[] = [
  "alcobas",
  "banos",
  "metrosCuadrados",
  "precioCompra",
  "precioVentaProyectado",
  "mesesProyectadosVenta",
];

const clampArriendoPercent = (p: number) =>
  Math.min(10, Math.max(7, Number.isFinite(p) ? p : 7));

const monthlyRentFromAnnualPercent = (purchase: number, percent: number) =>
  purchase > 0
    ? Math.round((purchase * clampArriendoPercent(percent)) / 100 / 12)
    : 0;

export default function PropertyForm({ data, onChange, onNext }: PropertyFormProps) {
  const update = <K extends keyof PropertyData>(key: K, value: PropertyData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const handlePrecioCompraChange = (n: number | undefined) => {
    const precio = n ?? 0;
    const updates: Partial<PropertyData> = { precioCompra: precio };
    const currentVentaType = data.precioVentaType ?? "percent";
    if (currentVentaType === "percent") {
      const percent = data.precioVentaPercent ?? 30;
      updates.precioVentaProyectado = precio * (1 + percent / 100);
    }
    const currentArriendoType = data.arriendoType ?? "percent";
    if (currentArriendoType === "percent") {
      const ap = clampArriendoPercent(data.arriendoPercent ?? 7);
      updates.arriendoPercent = ap;
      updates.arriendoProyectado = monthlyRentFromAnnualPercent(precio, ap);
    }
    onChange({ ...data, ...updates });
  };

  const ventaType = data.precioVentaType ?? "percent";
  const arriendoType = data.arriendoType ?? "percent";

  const getErrors = useCallback((): Partial<Record<RequiredField, string>> => {
    const errors: Partial<Record<RequiredField, string>> = {};
    if (data.alcobas === undefined) {
      errors.alcobas = "Ingresa el número de alcobas";
    } else if (data.alcobas < 0) {
      errors.alcobas = "El número de alcobas no puede ser negativo";
    }
    if (data.banos === undefined) {
      errors.banos = "Ingresa el número de baños";
    } else if (data.banos < 0) {
      errors.banos = "El número de baños no puede ser negativo";
    }
    if (data.metrosCuadrados <= 0) {
      errors.metrosCuadrados = "Ingresa el área total del inmueble en m²";
    }
    if (data.precioCompra <= 0) {
      errors.precioCompra = "Ingresa el precio de compra";
    }
    if (data.precioVentaProyectado <= 0) {
      errors.precioVentaProyectado =
        ventaType === "percent"
          ? "Define la rentabilidad esperada o el precio de compra"
          : "Ingresa el precio de venta proyectado";
    }
    if (data.mesesProyectadosVenta <= 0) {
      errors.mesesProyectadosVenta = "Ingresa los meses proyectados para vender";
    }
    return errors;
  }, [
    data.alcobas,
    data.banos,
    data.metrosCuadrados,
    data.precioCompra,
    data.precioVentaProyectado,
    data.mesesProyectadosVenta,
    ventaType,
  ]);

  const { getError, touch, validateAll, submitted, hasErrors, firstInvalidField } =
    useFormValidation<RequiredField>({
      fields: REQUIRED_FIELDS,
      getErrors,
    });

  const handleNext = () => {
    if (!validateAll()) {
      if (firstInvalidField) {
        document
          .getElementById(`field-${firstInvalidField}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    onNext();
  };

  const summaryErrors = submitted && hasErrors
    ? Array.from(new Set(REQUIRED_FIELDS.map((field) => getErrors()[field]).filter(Boolean) as string[]))
    : [];

  return (
    <div className="space-y-6">
      {summaryErrors.length > 0 && <FormErrorSummary errors={summaryErrors} />}

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
          <NumberInput
            label="Piso (opcional)"
            value={data.piso}
            min={0}
            allowEmpty
            onChange={(value) => update("piso", value)}
          />
          <Input
            label="Número de Apto (opcional)"
            value={data.numeroApto ?? ""}
            onChange={(e) => update("numeroApto", e.target.value)}
          />
          <div id="field-alcobas">
            <NumberInput
              label="Alcobas"
              value={data.alcobas}
              min={0}
              allowEmpty
              onChange={(value) => update("alcobas", value)}
              onBlur={() => touch("alcobas")}
              required
              error={getError("alcobas")}
            />
          </div>
          <div id="field-banos">
            <NumberInput
              label="Baños"
              value={data.banos}
              min={0}
              allowEmpty
              onChange={(value) => update("banos", value)}
              onBlur={() => touch("banos")}
              required
              error={getError("banos")}
            />
          </div>
          <div id="field-metrosCuadrados">
            <NumberInput
              label="Área total (m²)"
              value={data.metrosCuadrados || undefined}
              min={1}
              onChange={(value) => update("metrosCuadrados", value ?? 0)}
              onBlur={() => touch("metrosCuadrados")}
              suffix="m²"
              required
              error={getError("metrosCuadrados")}
            />
          </div>
          <NumberInput
            label="m² que necesitan remodelación (opcional)"
            value={data.m2Remodelacion || undefined}
            min={0}
            onChange={(value) => update("m2Remodelacion", value ?? 0)}
            suffix="m²"
          />
          <Select
            label="Parqueadero"
            required
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
          <div id="field-precioCompra">
            <NumberInput
              label="Precio de compra"
              value={data.precioCompra || undefined}
              min={0}
              onChange={handlePrecioCompraChange}
              onBlur={() => touch("precioCompra")}
              prefix="$"
              hint="Precio del inmueble en COP"
              required
              error={getError("precioCompra")}
            />
          </div>
          <div id="field-precioVentaProyectado" className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Precio de venta proyectado{" "}
              {ventaType === "percent" ? "(Rentabilidad %)" : "(Monto en $)"}
              <span className="text-danger" aria-hidden="true">
                {" "}
                *
              </span>
              <span className="sr-only"> (obligatorio)</span>
            </label>
            <div className="flex">
              <InlineNumberInput
                value={
                  ventaType === "percent"
                    ? data.precioVentaPercent
                    : data.precioVentaProyectado || undefined
                }
                decimals={ventaType === "percent"}
                min={0}
                onChange={(val) => {
                  const amount = val ?? 0;
                  if (ventaType === "percent") {
                    onChange({
                      ...data,
                      precioVentaPercent: amount,
                      precioVentaProyectado: data.precioCompra * (1 + amount / 100),
                    });
                  } else {
                    onChange({
                      ...data,
                      precioVentaProyectado: amount,
                    });
                  }
                }}
                onBlur={() => touch("precioVentaProyectado")}
                hasError={!!getError("precioVentaProyectado")}
                aria-invalid={!!getError("precioVentaProyectado")}
                aria-describedby={
                  getError("precioVentaProyectado")
                    ? "precio-venta-error"
                    : ventaType === "percent"
                      ? "precio-venta-hint"
                      : undefined
                }
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
                      precioVentaProyectado: newProyectado,
                    });
                  } else {
                    onChange({
                      ...data,
                      precioVentaType: newType,
                    });
                  }
                }}
                className={fieldSelectRightClass(!!getError("precioVentaProyectado"))}
              >
                <option value="percent">%</option>
                <option value="fixed">$ (COP)</option>
              </select>
            </div>
            {getError("precioVentaProyectado") && (
              <p id="precio-venta-error" className="text-xs text-danger">
                {getError("precioVentaProyectado")}
              </p>
            )}
            {!getError("precioVentaProyectado") && ventaType === "percent" && data.precioVentaProyectado > 0 && (
              <p className="text-xs text-muted">
                Precio calculado: {formatCOP(data.precioVentaProyectado)}
              </p>
            )}
            {!getError("precioVentaProyectado") && ventaType === "percent" && (
              <p id="precio-venta-hint" className="text-xs text-muted">
                Ingresa el porcentaje de rentabilidad esperada (ej: 20 al 50%) sobre el precio de compra.
              </p>
            )}
          </div>
          <div id="field-mesesProyectadosVenta">
            <NumberInput
              label="Meses proyectados para vender"
              value={data.mesesProyectadosVenta || undefined}
              min={1}
              onChange={(value) => update("mesesProyectadosVenta", value ?? 0)}
              onBlur={() => touch("mesesProyectadosVenta")}
              suffix="meses"
              required
              error={getError("mesesProyectadosVenta")}
            />
          </div>
          <NumberInput
            label="Gastos de posesión (mensual) (opcional)"
            value={data.gastosPosesionMensual || undefined}
            min={0}
            onChange={(value) => update("gastosPosesionMensual", value ?? 0)}
            prefix="$"
            hint="Administración, servicios, etc."
          />
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-sm font-medium text-foreground">
              Arriendo proyectado (mensual) (opcional){" "}
              {arriendoType === "percent" ? "(% anual sobre compra)" : "(Monto en $)"}
            </label>
            <p className="text-xs text-muted">
              {arriendoType === "percent"
                ? "Puedes cambiar a monto fijo en pesos ($) con el selector a la derecha."
                : "Puedes cambiar a porcentaje (%) con el selector a la derecha."}
            </p>
            <div className="flex max-w-full sm:max-w-md">
              <InlineNumberInput
                value={
                  arriendoType === "percent"
                    ? data.arriendoPercent ?? 7
                    : data.arriendoProyectado || undefined
                }
                decimals={arriendoType === "percent"}
                min={arriendoType === "percent" ? 7 : 0}
                max={arriendoType === "percent" ? 10 : undefined}
                onChange={(val) => {
                  if (arriendoType === "percent") {
                    const ap = clampArriendoPercent(val ?? 7);
                    onChange({
                      ...data,
                      arriendoPercent: ap,
                      arriendoProyectado: monthlyRentFromAnnualPercent(data.precioCompra, ap),
                    });
                  } else {
                    onChange({ ...data, arriendoProyectado: val ?? 0 });
                  }
                }}
                placeholder={arriendoType === "percent" ? "7 a 10" : "Ej: 2500000"}
              />
              <select
                value={arriendoType}
                onChange={(e) => {
                  const newType = e.target.value as "percent" | "fixed";
                  if (newType === "percent") {
                    const ap = clampArriendoPercent(data.arriendoPercent ?? 7);
                    onChange({
                      ...data,
                      arriendoType: newType,
                      arriendoPercent: ap,
                      arriendoProyectado: monthlyRentFromAnnualPercent(data.precioCompra, ap),
                    });
                  } else {
                    onChange({ ...data, arriendoType: newType });
                  }
                }}
                className={fieldSelectRightClass(false)}
              >
                <option value="percent">%</option>
                <option value="fixed">$ (COP)</option>
              </select>
            </div>
            {arriendoType === "percent" && (
              <p className="text-xs text-muted">
                Por defecto 7% anual del precio de compra (rango 7%–10%). El canon mensual es ese porcentaje
                dividido en 12.
              </p>
            )}
            {arriendoType === "percent" && data.precioCompra > 0 && data.arriendoProyectado > 0 && (
              <p className="text-xs font-medium text-foreground">
                Canon mensual calculado: {formatCOP(data.arriendoProyectado)}
              </p>
            )}
            {arriendoType === "fixed" && (
              <p className="text-xs text-muted">Ingresa el canon mensual estimado en pesos.</p>
            )}
          </div>
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
        <Button onClick={handleNext}>Siguiente: Remodelación →</Button>
      </div>
    </div>
  );
}
