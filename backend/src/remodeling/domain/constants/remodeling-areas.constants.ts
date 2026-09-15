/**
 * Areas de remodelacion sobre las que se reparte el presupuesto de un nivel.
 *
 * Los pesos son RELATIVOS, no porcentajes: la distribucion normaliza sobre las
 * areas que el usuario haya seleccionado. Asi, elegir solo cocina y bano
 * principal reparte el 100% entre esas dos respetando su proporcion (18 vs 12).
 *
 * Los valores son una referencia de arranque y se pueden ajustar a mano desde
 * la vista. No salen de un estudio de costos: hay que validarlos con negocio.
 */

export type AreaGroupId = 'espacios' | 'instalaciones' | 'acabados' | 'confort';

export interface AreaGroupConfig {
  id: AreaGroupId;
  label: string;
  description: string;
}

export const AREA_GROUPS: Record<AreaGroupId, AreaGroupConfig> = {
  espacios: {
    id: 'espacios',
    label: 'Espacios',
    description: 'Ambientes del apartamento que se intervienen.',
  },
  instalaciones: {
    id: 'instalaciones',
    label: 'Instalaciones',
    description: 'Redes tecnicas que atraviesan todo el apartamento.',
  },
  acabados: {
    id: 'acabados',
    label: 'Acabados y carpinteria',
    description: 'Superficies y elementos transversales a los ambientes.',
  },
  confort: {
    id: 'confort',
    label: 'Confort y equipamiento',
    description: 'Sistemas y terminados que suman habitabilidad.',
  },
};

export interface RemodelingAreaConfig {
  id: string;
  label: string;
  group: AreaGroupId;
  /** Peso relativo dentro del reparto. */
  weight: number;
  /**
   * Areas desactivadas: no se ofrecen para seleccionar ni cuentan en el total
   * del catalogo. Se conservan aqui, en vez de borrarlas, para poder volver a
   * habilitarlas cambiando una sola bandera.
   */
  enabled: boolean;
}

export const REMODELING_AREAS: RemodelingAreaConfig[] = [
  // Espacios
  { id: 'zona_social', label: 'Zona social', group: 'espacios', weight: 12, enabled: true },
  { id: 'cocina', label: 'Cocina', group: 'espacios', weight: 18, enabled: true },
  { id: 'bano_principal', label: 'Baño principal', group: 'espacios', weight: 12, enabled: true },
  { id: 'bano_social', label: 'Baño social', group: 'espacios', weight: 8, enabled: true },
  { id: 'habitacion_principal', label: 'Habitación principal', group: 'espacios', weight: 9, enabled: true },
  { id: 'vestier', label: 'Vestier', group: 'espacios', weight: 5, enabled: false },
  { id: 'habitaciones_secundarias', label: 'Habitaciones secundarias', group: 'espacios', weight: 8, enabled: true },
  { id: 'estudio_oficina', label: 'Estudio / Oficina', group: 'espacios', weight: 5, enabled: true },
  { id: 'zona_ropas', label: 'Zona de ropas', group: 'espacios', weight: 4, enabled: false },
  { id: 'balcon_terraza', label: 'Balcón / Terraza', group: 'espacios', weight: 5, enabled: true },
  { id: 'entrada_hall', label: 'Entrada / Hall', group: 'espacios', weight: 3, enabled: false },

  // Instalaciones
  { id: 'instalacion_electrica', label: 'Instalación eléctrica', group: 'instalaciones', weight: 8, enabled: true },
  { id: 'instalacion_hidraulica', label: 'Instalación hidráulica y sanitaria', group: 'instalaciones', weight: 8, enabled: true },
  { id: 'instalacion_gas', label: 'Instalación de gas', group: 'instalaciones', weight: 3, enabled: true },

  // Acabados
  { id: 'paredes', label: 'Paredes', group: 'acabados', weight: 7, enabled: true },
  { id: 'pisos', label: 'Pisos', group: 'acabados', weight: 12, enabled: true },
  { id: 'techos', label: 'Techos / Cielos rasos', group: 'acabados', weight: 6, enabled: true },
  { id: 'puertas', label: 'Puertas', group: 'acabados', weight: 5, enabled: true },
  { id: 'carpinteria', label: 'Carpintería', group: 'acabados', weight: 10, enabled: true },
  { id: 'ventanas_cortinas', label: 'Ventanas y cortinas', group: 'acabados', weight: 7, enabled: true },

  // Confort
  { id: 'climatizacion', label: 'Climatización', group: 'confort', weight: 6, enabled: true },
  { id: 'domotica', label: 'Tecnología / Domótica', group: 'confort', weight: 5, enabled: true },
  { id: 'entretenimiento', label: 'Entretenimiento', group: 'confort', weight: 4, enabled: true },
  { id: 'decoracion', label: 'Decoración', group: 'confort', weight: 6, enabled: true },
];

/** Solo las areas que hoy se ofrecen. Es lo que ve el usuario y la base del reparto. */
export const ACTIVE_AREAS: RemodelingAreaConfig[] = REMODELING_AREAS.filter(
  (a) => a.enabled,
);

export const AREA_IDS: string[] = ACTIVE_AREAS.map((a) => a.id);

export const AREA_BY_ID: Record<string, RemodelingAreaConfig> = Object.fromEntries(
  REMODELING_AREAS.map((a) => [a.id, a]),
);
