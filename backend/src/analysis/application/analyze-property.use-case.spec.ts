import { AnalyzePropertyUseCase } from './analyze-property.use-case.js';
import { RemodelingCalculator } from '../domain/calculators/remodeling.calculator.js';
import { ProjectCostCalculator } from '../domain/calculators/project-cost.calculator.js';
import { ProfitabilityCalculator } from '../domain/calculators/profitability.calculator.js';
import { QualitativeEvaluator } from '../domain/evaluators/qualitative.evaluator.js';
import { InvestmentEvaluator } from '../domain/evaluators/investment.evaluator.js';
import type { AnalysisRequestDto } from '../dto/analysis-request.dto.js';

describe('AnalyzePropertyUseCase', () => {
  let useCase: AnalyzePropertyUseCase;

  beforeEach(() => {
    useCase = new AnalyzePropertyUseCase(
      new RemodelingCalculator(),
      new ProjectCostCalculator(),
      new ProfitabilityCalculator(),
      new QualitativeEvaluator(),
      new InvestmentEvaluator(),
    );
  });

  const makeRequest = (
    overrides: Partial<AnalysisRequestDto['property']> = {},
    remodeling: Partial<AnalysisRequestDto['remodeling']> = {},
  ): AnalysisRequestDto =>
    ({
      property: {
        alcobas: 3,
        banos: 2,
        metrosCuadrados: 80,
        m2Remodelacion: 40,
        parqueadero: true,
        gastosPosesionMensual: 0,
        precioCompra: 100_000_000,
        arriendoProyectado: 0,
        precioVentaProyectado: 0,
        mesesProyectadosVenta: 6,
        ...overrides,
      },
      remodeling: { selectedScenario: 1, ...remodeling },
      expenses: {},
      qualitative: {
        entorno: 2,
        accesibilidad: 2,
        transporte: 2,
        seguridad: 2,
        comercioOcio: 2,
        documentacion: 2,
      },
    }) as AnalysisRequestDto;

  describe('precio de venta proyectado', () => {
    it('usa el monto fijo cuando precioVentaType es fixed', () => {
      const result = useCase.execute(
        makeRequest({
          precioVentaType: 'fixed',
          precioVentaProyectado: 400_000_000,
        }),
      );

      expect(result.profitability.projectedSalePrice).toBe(400_000_000);
    });

    it('aplica el % sobre compra + remodelacion, ignorando el monto del formulario', () => {
      // Escenario 2: 15% de 100M = 15M de remodelacion.
      // Base 115M, +30% => 149.5M. El precioVentaProyectado que llega es basura
      // a proposito: el dominio debe recalcularlo.
      const result = useCase.execute(
        makeRequest(
          {
            precioVentaType: 'percent',
            precioVentaPercent: 30,
            precioVentaProyectado: 999_999_999,
          },
          { selectedScenario: 2, remodelingPercent: 15 },
        ),
      );

      expect(result.selectedRemodelingCost.totalCost).toBe(15_000_000);
      expect(result.profitability.projectedSalePrice).toBe(149_500_000);
    });

    it('incluye la administracion del escenario 3 en la base del precio de venta', () => {
      // Base 15M + 18% admin = 17.7M. (100M + 17.7M) * 1.30 = 153.01M
      const result = useCase.execute(
        makeRequest(
          {
            precioVentaType: 'percent',
            precioVentaPercent: 30,
            precioVentaProyectado: 0,
          },
          { selectedScenario: 3, remodelingPercent: 15, adminPercentage: 18 },
        ),
      );

      expect(result.selectedRemodelingCost.totalCost).toBe(17_700_000);
      expect(result.profitability.projectedSalePrice).toBe(153_010_000);
    });
  });
});
