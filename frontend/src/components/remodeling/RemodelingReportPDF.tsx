"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { RemodelingEstimate } from "@/types/remodeling.types";

/**
 * Reporte del presupuesto de remodelacion.
 *
 * Comparte identidad visual con el reporte de la calculadora: mismo encabezado,
 * misma paleta y mismo pie con numeracion. Los estilos se repiten aqui en vez
 * de importarse porque @react-pdf usa su propio StyleSheet, ajeno al de la app.
 */

const COLORS = {
  primary: "#6D28D9",
  primaryLight: "#EDE9FE",
  primarySofter: "#F5F3FF",
  foreground: "#18181B",
  muted: "#71717A",
  border: "#E4E4E7",
  background: "#FFFFFF",
  card: "#FAFAFA",
  success: "#059669",
  danger: "#DC2626",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.foreground,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    marginBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logoImage: { width: 64, height: 44, objectFit: "contain", marginRight: 12 },
  brandTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: COLORS.foreground },
  brandSubtitle: { fontSize: 8, color: COLORS.muted, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  reportTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: COLORS.primary },
  reportDate: { fontSize: 8, color: COLORS.muted, marginTop: 2 },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: COLORS.foreground,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
  },

  highlight: {
    backgroundColor: COLORS.primarySofter,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 6,
    padding: 14,
    marginBottom: 14,
  },
  highlightLabel: { fontSize: 8, color: COLORS.muted, textTransform: "uppercase" },
  highlightValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    marginTop: 4,
  },
  highlightNote: { fontSize: 9, color: COLORS.foreground, marginTop: 4 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLast: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  label: { color: COLORS.muted },
  value: { fontFamily: "Helvetica-Bold" },

  tierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tierRowActive: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: COLORS.primarySofter,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  badge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.background,
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 6,
  },

  tableHead: {
    flexDirection: "row",
    backgroundColor: COLORS.primarySofter,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  th: { fontSize: 8, fontFamily: "Helvetica-Bold", color: COLORS.primary },
  tr: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  colArea: { flex: 3 },
  colGroup: { flex: 2, color: COLORS.muted },
  colShare: { flex: 1, textAlign: "right", color: COLORS.muted },
  colAmount: { flex: 2, textAlign: "right", fontFamily: "Helvetica-Bold" },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: COLORS.card,
  },

  note: { fontSize: 8, color: COLORS.muted, marginTop: 8, lineHeight: 1.4 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    fontSize: 8,
    color: COLORS.muted,
  },
});

const GROUP_LABELS: Record<string, string> = {
  espacios: "Espacios",
  instalaciones: "Instalaciones",
  acabados: "Acabados",
  confort: "Confort",
};

function formatCOP(value: number): string {
  return `$ ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatDate(d = new Date()): string {
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface RemodelingReportPDFProps {
  estimate: RemodelingEstimate;
  /** Etiqueta del analisis de origen, si el precio vino del historial. */
  analysisLabel?: string;
  generatedBy?: string;
}

export default function RemodelingReportPDF({
  estimate,
  analysisLabel,
  generatedBy,
}: RemodelingReportPDFProps) {
  const {
    basePrice,
    basePriceSource,
    requiredAmount,
    requiredPercent,
    coverage,
    recommendedTier,
    exceedsTopTier,
    tiers,
    areaCosts,
  } = estimate;

  const recommended = tiers.find((t) => t.tier === recommendedTier);
  const topPercent = Math.max(...tiers.map((t) => t.percent));

  return (
    <Document
      title="Presupuesto de Remodelación"
      author="Alexandra Marín Bienes Raíces"
      subject="Proyección de costos de remodelación"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Image de @react-pdf/renderer, no un <img>: no admite alt. */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/logo.png" style={styles.logoImage} />
            <View>
              <Text style={styles.brandTitle}>Remodelaciones</Text>
              <Text style={styles.brandSubtitle}>Alexandra Marín Bienes Raíces</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>Presupuesto de Remodelación</Text>
            <Text style={styles.reportDate}>{formatDate()}</Text>
          </View>
        </View>

        {/* Monto necesario */}
        <View style={styles.highlight}>
          <Text style={styles.highlightLabel}>Monto que se necesita</Text>
          <Text style={styles.highlightValue}>{formatCOP(requiredAmount)}</Text>
          <Text style={styles.highlightNote}>
            {requiredPercent}% del costo del apartamento ({formatCOP(basePrice)}) ·
            cubre el {coverage}% de una remodelación integral
          </Text>
        </View>

        {/* Punto de partida */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Punto de partida</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Costo del apartamento</Text>
              <Text style={styles.value}>{formatCOP(basePrice)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Origen del valor</Text>
              <Text style={styles.value}>
                {basePriceSource === "analysis"
                  ? `Análisis guardado${analysisLabel ? ` — ${analysisLabel}` : ""}`
                  : "Ingresado manualmente"}
              </Text>
            </View>
            <View style={styles.rowLast}>
              <Text style={styles.label}>Áreas seleccionadas</Text>
              <Text style={styles.value}>{areaCosts.length}</Text>
            </View>
          </View>
        </View>

        {/* Niveles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nivel de presupuesto</Text>
          <View style={styles.card}>
            {exceedsTopTier ? (
              <Text style={{ color: COLORS.danger, marginBottom: 8 }}>
                Lo seleccionado cuesta {requiredPercent}%, por encima del {topPercent}%
                del nivel más alto. Conviene quitar áreas o ajustar montos.
              </Text>
            ) : recommended ? (
              <Text style={{ marginBottom: 8 }}>
                Nivel <Text style={styles.value}>{recommended.label}</Text> — cubre hasta{" "}
                {recommended.percent}% ({formatCOP(recommended.totalBudget)}). Margen
                disponible:{" "}
                <Text style={{ color: COLORS.success, fontFamily: "Helvetica-Bold" }}>
                  {formatCOP(recommended.totalBudget - requiredAmount)}
                </Text>
              </Text>
            ) : (
              <Text style={{ marginBottom: 8, color: COLORS.muted }}>
                Sin áreas seleccionadas.
              </Text>
            )}

            {tiers.map((tier, i) => {
              const isMatch = tier.tier === recommendedTier;
              const covers = requiredAmount <= tier.totalBudget;
              return (
                <View
                  key={tier.tier}
                  style={isMatch ? styles.tierRowActive : styles.tierRow}
                  wrap={false}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontFamily: "Helvetica-Bold" }}>{tier.label}</Text>
                    <Text style={{ color: COLORS.muted, marginLeft: 6 }}>
                      {tier.percent}%
                    </Text>
                    {isMatch && <Text style={[styles.badge, { marginLeft: 6 }]}>NECESARIO</Text>}
                  </View>
                  <Text
                    style={{
                      fontFamily: "Helvetica-Bold",
                      color: covers ? COLORS.foreground : COLORS.muted,
                    }}
                  >
                    {formatCOP(tier.totalBudget)}
                    {!covers ? "  (no alcanza)" : ""}
                  </Text>
                  {i === -1 && <Text />}
                </View>
              );
            })}
          </View>
        </View>

        {/* Desglose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>En qué se va el dinero</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colArea]}>Área</Text>
            <Text style={[styles.th, styles.colGroup]}>Grupo</Text>
            <Text style={[styles.th, styles.colShare]}>%</Text>
            <Text style={[styles.th, styles.colAmount]}>Monto</Text>
          </View>
          {areaCosts.map((area) => {
            const share =
              requiredAmount > 0
                ? Math.round((area.amount / requiredAmount) * 1000) / 10
                : 0;
            return (
              <View key={area.area} style={styles.tr} wrap={false}>
                <Text style={styles.colArea}>
                  {area.label}
                  {area.isManual ? " *" : ""}
                </Text>
                <Text style={styles.colGroup}>
                  {GROUP_LABELS[area.group] ?? area.group}
                </Text>
                <Text style={styles.colShare}>{share}%</Text>
                <Text style={styles.colAmount}>{formatCOP(area.amount)}</Text>
              </View>
            );
          })}
          <View style={styles.totalRow}>
            <Text style={[styles.colArea, { fontFamily: "Helvetica-Bold" }]}>Total</Text>
            <Text style={styles.colGroup} />
            <Text style={styles.colShare} />
            <Text style={[styles.colAmount, { color: COLORS.primary }]}>
              {formatCOP(requiredAmount)}
            </Text>
          </View>

          {areaCosts.some((a) => a.isManual) && (
            <Text style={styles.note}>
              * Monto fijado manualmente, no calculado a partir del porcentaje de
              referencia del área.
            </Text>
          )}
          <Text style={styles.note}>
            Los porcentajes por área son valores de referencia para proyectar el
            presupuesto. No reemplazan una cotización de obra.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>
            {generatedBy ? `Generado por ${generatedBy}` : "Alexandra Marín Bienes Raíces"}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
