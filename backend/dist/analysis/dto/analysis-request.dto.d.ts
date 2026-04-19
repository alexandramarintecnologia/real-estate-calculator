export declare class PropertyDataDto {
    linkPortal?: string;
    direccion: string;
    torre?: string;
    piso?: number;
    numeroApto?: string;
    alcobas: number;
    banos: number;
    metrosCuadrados: number;
    m2Remodelacion: number;
    parqueadero: boolean;
    nombrePropietario?: string;
    celular?: string;
    gastosPosesionMensual: number;
    precioCompra: number;
    arriendoProyectado: number;
    precioVentaProyectado: number;
    mesesProyectadosVenta: number;
    observaciones?: string;
    puntuacionPersonal?: number;
    estadoNegociacion?: string;
}
export declare class RemodelingScenarioDto {
    selectedScenario: 1 | 2 | 3;
    adminPercentage?: number;
    customCostPerM2?: number;
}
export declare class ProjectExpensesDto {
    notaryFeesValue?: number;
    notaryFeesType?: 'percent' | 'fixed';
    brokerCommissionValue?: number;
    brokerCommissionType?: 'percent' | 'fixed';
    otherExpenses?: number;
}
export declare class QualitativeEvaluationDto {
    entorno: number;
    accesibilidad: number;
    transporte: number;
    seguridad: number;
    comercioOcio: number;
    documentacion: number;
}
export declare class AnalysisRequestDto {
    property: PropertyDataDto;
    remodeling: RemodelingScenarioDto;
    expenses: ProjectExpensesDto;
    qualitative: QualitativeEvaluationDto;
}
