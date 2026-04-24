"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { AnalysisResult, PropertyData } from "@/types/analysis.types";
import { Decision, Rating } from "@/types/analysis.types";

const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  foreground: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  background: "#FFFFFF",
  card: "#F8FAFC",
  success: "#059669",
  successLight: "#D1FAE5",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  primaryLight: "#DBEAFE",
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoText: {
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
  },
  brandTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: COLORS.foreground,
  },
  brandSubtitle: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  reportTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: COLORS.foreground,
  },
  reportDate: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 1,
  },
  decisionBanner: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    alignItems: "center",
  },
  decisionLabel: {
    fontSize: 9,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  decisionValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 8,
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingChipLabel: {
    fontSize: 8,
    color: COLORS.muted,
    marginRight: 4,
  },
  ratingBadge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: COLORS.foreground,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 8,
    color: COLORS.muted,
    marginBottom: 10,
  },
  section: {
    marginBottom: 14,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 10,
    backgroundColor: COLORS.background,
  },
  metricTitle: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: COLORS.foreground,
    marginTop: 4,
  },
  metricSubtitle: {
    fontSize: 7,
    color: COLORS.muted,
    marginTop: 2,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  rowLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },
  rowValue: {
    color: COLORS.foreground,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: COLORS.foreground,
  },
  totalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
  },
  propertyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  propertyItem: {
    width: "50%",
    paddingVertical: 4,
    paddingRight: 8,
  },
  propertyLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  propertyValue: {
    fontSize: 10,
    color: COLORS.foreground,
    marginTop: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: COLORS.muted,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableRowSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  tableCell: {
    fontSize: 10,
    color: COLORS.foreground,
  },
  qualitativeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  qualitativeItem: {
    width: "48%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 8,
  },
  qualitativeLabel: {
    fontSize: 9,
    color: COLORS.foreground,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 5,
  },
  recommendationBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 5,
    marginRight: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: COLORS.foreground,
  },
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

// Mapping helpers
const decisionLabels: Record<Decision, string> = {
  [Decision.COMPRAR]: "COMPRAR",
  [Decision.EVALUAR]: "EVALUAR CON CUIDADO",
  [Decision.NO_RECOMENDABLE]: "NO RECOMENDABLE",
};

const decisionColors: Record<Decision, string> = {
  [Decision.COMPRAR]: COLORS.success,
  [Decision.EVALUAR]: COLORS.warning,
  [Decision.NO_RECOMENDABLE]: COLORS.danger,
};

const ratingLabels: Record<Rating, string> = {
  [Rating.EXCELENTE]: "Excelente",
  [Rating.BUENA]: "Buena",
  [Rating.RIESGOSA]: "Riesgosa",
};

const ratingStyles: Record<Rating, { bg: string; color: string }> = {
  [Rating.EXCELENTE]: { bg: COLORS.successLight, color: COLORS.success },
  [Rating.BUENA]: { bg: COLORS.primaryLight, color: COLORS.primaryDark },
  [Rating.RIESGOSA]: { bg: COLORS.dangerLight, color: COLORS.danger },
};

const qualitativeLabels: Record<number, { label: string; bg: string; color: string }> = {
  0: { label: "Descartado", bg: COLORS.dangerLight, color: COLORS.danger },
  1: { label: "Regular", bg: COLORS.warningLight, color: COLORS.warning },
  2: { label: "Bueno", bg: COLORS.primaryLight, color: COLORS.primaryDark },
  3: { label: "Excelente", bg: COLORS.successLight, color: COLORS.success },
};

const factorLabels: Record<string, string> = {
  entorno: "Entorno",
  accesibilidad: "Accesibilidad",
  transporte: "Transporte",
  seguridad: "Seguridad",
  comercioOcio: "Comercio y Ocio",
  documentacion: "Documentación",
};

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatDate(d = new Date()): string {
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface AnalysisReportPDFProps {
  result: AnalysisResult;
  property: PropertyData;
  generatedBy?: string;
}

function RatingChip({ label, rating }: { label: string; rating: Rating }) {
  const style = ratingStyles[rating];
  return (
    <View style={styles.ratingChip}>
      <Text style={styles.ratingChipLabel}>{label}:</Text>
      <Text
        style={{
          ...styles.ratingBadge,
          backgroundColor: style.bg,
          color: style.color,
        }}
      >
        {ratingLabels[rating]}
      </Text>
    </View>
  );
}

export default function AnalysisReportPDF({
  result,
  property,
  generatedBy,
}: AnalysisReportPDFProps) {
  const { profitability, projectCosts, evaluation, qualitative, remodelingCosts, selectedRemodelingCost } = result;

  const decisionColor = decisionColors[evaluation.decision];

  return (
    <Document
      title="Reporte de Análisis Inmobiliario"
      author="Alexandra Marín Bienes Raíces"
      subject={`Análisis de ${property.direccion}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>AM</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>Calculadora Inmobiliaria</Text>
              <Text style={styles.brandSubtitle}>Alexandra Marín Bienes Raíces</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>Reporte de Análisis</Text>
            <Text style={styles.reportDate}>{formatDate()}</Text>
          </View>
        </View>

        {/* Property summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Inmueble</Text>
          <View style={styles.card}>
            <View style={styles.propertyGrid}>
              <View style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>Dirección</Text>
                <Text style={styles.propertyValue}>{property.direccion || "—"}</Text>
              </View>
              {property.torre && (
                <View style={styles.propertyItem}>
                  <Text style={styles.propertyLabel}>Torre</Text>
                  <Text style={styles.propertyValue}>{property.torre}</Text>
                </View>
              )}
              {property.numeroApto && (
                <View style={styles.propertyItem}>
                  <Text style={styles.propertyLabel}>N° Apto</Text>
                  <Text style={styles.propertyValue}>{property.numeroApto}</Text>
                </View>
              )}
              {typeof property.piso === "number" && (
                <View style={styles.propertyItem}>
                  <Text style={styles.propertyLabel}>Piso</Text>
                  <Text style={styles.propertyValue}>{property.piso}</Text>
                </View>
              )}
              <View style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>Alcobas</Text>
                <Text style={styles.propertyValue}>{property.alcobas}</Text>
              </View>
              <View style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>Baños</Text>
                <Text style={styles.propertyValue}>{property.banos}</Text>
              </View>
              <View style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>Área total</Text>
                <Text style={styles.propertyValue}>{property.metrosCuadrados} m²</Text>
              </View>
              <View style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>Área a remodelar</Text>
                <Text style={styles.propertyValue}>{property.m2Remodelacion} m²</Text>
              </View>
              <View style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>Parqueadero</Text>
                <Text style={styles.propertyValue}>{property.parqueadero ? "Sí" : "No"}</Text>
              </View>
              <View style={styles.propertyItem}>
                <Text style={styles.propertyLabel}>Meses proyectados de venta</Text>
                <Text style={styles.propertyValue}>{property.mesesProyectadosVenta}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Decision banner */}
        <View style={styles.decisionBanner}>
          <Text style={styles.decisionLabel}>Decisión de inversión</Text>
          <Text style={{ ...styles.decisionValue, color: decisionColor }}>
            {decisionLabels[evaluation.decision]}
          </Text>
          <View style={styles.ratingRow}>
            <RatingChip label="ROI" rating={evaluation.roiRating} />
            <RatingChip label="Cap Rate" rating={evaluation.capRateRating} />
            <RatingChip label="Zona" rating={evaluation.zoneRating} />
          </View>
        </View>

        {/* Key metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas Clave</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Ganancia Bruta</Text>
              <Text style={{ ...styles.metricValue, color: COLORS.success }}>
                {formatCOP(profitability.grossProfit)}
              </Text>
              <Text style={styles.metricSubtitle}>Precio venta - Costo total</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>ROI</Text>
              <Text style={styles.metricValue}>{formatPercent(profitability.roi)}</Text>
              <Text style={styles.metricSubtitle}>Retorno sobre inversión</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Arriendo Anual</Text>
              <Text style={styles.metricValue}>
                {formatCOP(profitability.annualRentalIncome)}
              </Text>
              <Text style={styles.metricSubtitle}>Ingreso por arriendo</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Cap Rate</Text>
              <Text style={styles.metricValue}>{formatPercent(profitability.capRate)}</Text>
              <Text style={styles.metricSubtitle}>Tasa de capitalización</Text>
            </View>
          </View>
        </View>

        {/* Project breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desglose del Proyecto</Text>
          <Text style={styles.sectionSubtitle}>Resumen de todos los costos involucrados</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Precio de compra</Text>
              <Text style={styles.rowValue}>{formatCOP(projectCosts.purchasePrice)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Remodelación</Text>
              <Text style={styles.rowValue}>{formatCOP(projectCosts.remodelingCost)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Escrituras públicas</Text>
              <Text style={styles.rowValue}>{formatCOP(projectCosts.notaryFees)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Comisión del asesor</Text>
              <Text style={styles.rowValue}>{formatCOP(projectCosts.brokerCommission)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Otros gastos</Text>
              <Text style={styles.rowValue}>{formatCOP(projectCosts.otherExpenses)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Gastos de posesión total</Text>
              <Text style={styles.rowValue}>
                {formatCOP(projectCosts.totalOwnershipExpenses)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Precio de venta proyectado</Text>
              <Text style={{ ...styles.totalValue, color: COLORS.success }}>
                {formatCOP(profitability.projectedSalePrice)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Costo total del proyecto</Text>
              <Text style={{ ...styles.totalValue, color: COLORS.foreground }}>
                {formatCOP(projectCosts.totalProjectCost)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{generatedBy ? `Generado por ${generatedBy}` : "Alexandra Marín Bienes Raíces"}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>

      {/* Page 2 - Remodeling + qualitative + recommendations */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>AM</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>Calculadora Inmobiliaria</Text>
              <Text style={styles.brandSubtitle}>Alexandra Marín Bienes Raíces</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>Reporte de Análisis</Text>
            <Text style={styles.reportDate}>{formatDate()}</Text>
          </View>
        </View>

        {/* Scenarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escenarios de Remodelación</Text>
          <Text style={styles.sectionSubtitle}>
            Escenario seleccionado: #{selectedRemodelingCost.scenario}
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderCell, flex: 1 }}>Escenario</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 1.3 }}>Costo por m²</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 1 }}>% Admin</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 1.6, textAlign: "right" }}>
                Costo total
              </Text>
            </View>
            {remodelingCosts.map((s) => {
              const isSelected = s.scenario === selectedRemodelingCost.scenario;
              return (
                <View
                  key={s.scenario}
                  style={isSelected ? { ...styles.tableRow, ...styles.tableRowSelected } : styles.tableRow}
                >
                  <Text style={{ ...styles.tableCell, flex: 1, fontFamily: isSelected ? "Helvetica-Bold" : "Helvetica" }}>
                    #{s.scenario}
                    {isSelected ? "  ✓" : ""}
                  </Text>
                  <Text style={{ ...styles.tableCell, flex: 1.3 }}>
                    {formatCOP(s.costPerM2)}
                  </Text>
                  <Text style={{ ...styles.tableCell, flex: 1 }}>
                    {s.adminPercentage ? `${s.adminPercentage}%` : "—"}
                  </Text>
                  <Text style={{ ...styles.tableCell, flex: 1.6, textAlign: "right", fontFamily: isSelected ? "Helvetica-Bold" : "Helvetica" }}>
                    {formatCOP(s.totalCost)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Qualitative evaluation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evaluación de Zona</Text>
          <Text style={styles.sectionSubtitle}>
            Promedio: {qualitative.average.toFixed(1)} / 3.0  ·  Calificación general: {ratingLabels[qualitative.rating]}
          </Text>
          <View style={styles.qualitativeGrid}>
            {Object.entries(qualitative.scores).map(([key, score]) => {
              const q = qualitativeLabels[score as number];
              return (
                <View key={key} style={styles.qualitativeItem}>
                  <Text style={styles.qualitativeLabel}>
                    {factorLabels[key] ?? key}
                  </Text>
                  <Text
                    style={{
                      ...styles.ratingBadge,
                      backgroundColor: q.bg,
                      color: q.color,
                    }}
                  >
                    {q.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendaciones</Text>
          <View style={styles.card}>
            {evaluation.recommendations.length === 0 ? (
              <Text style={{ fontSize: 10, color: COLORS.muted }}>
                Sin recomendaciones adicionales.
              </Text>
            ) : (
              evaluation.recommendations.map((rec, idx) => (
                <View key={idx} style={styles.recommendationItem}>
                  <View style={styles.recommendationBullet} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {property.observaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <View style={styles.card}>
              <Text style={{ fontSize: 10, lineHeight: 1.4, color: COLORS.foreground }}>
                {property.observaciones}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>{generatedBy ? `Generado por ${generatedBy}` : "Alexandra Marín Bienes Raíces"}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
