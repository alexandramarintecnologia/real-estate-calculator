import { AreaCostCalculator } from './area-cost.calculator.js';

describe('AreaCostCalculator', () => {
  let calculator: AreaCostCalculator;
  // Elegido para que los montos den redondos: 164 pesos por unidad de peso.
  const basePrice = 115_456_000;

  beforeEach(() => {
    calculator = new AreaCostCalculator();
  });

  describe('costo por area', () => {
    it('el costo de un area sale de su peso sobre el catalogo completo', () => {
      // cocina pesa 18 de 164 -> 18/164 * 20% del apartamento
      const [cocina] = calculator.calculate(basePrice, ['cocina']);
      const esperado = Math.round((basePrice * 20 * 18) / (100 * 164));
      expect(cocina.amount).toBe(esperado);
      expect(cocina.isManual).toBe(false);
    });

    it('marcar todo el catalogo activo cuesta el 20% del apartamento', () => {
      expect(calculator.calculate(basePrice, [])).toEqual([]);

      const ids = [
        'zona_social', 'cocina', 'bano_principal', 'bano_social',
        'habitacion_principal', 'habitaciones_secundarias', 'estudio_oficina',
        'balcon_terraza', 'instalacion_electrica', 'instalacion_hidraulica',
        'instalacion_gas', 'paredes', 'pisos', 'techos', 'puertas',
        'carpinteria', 'ventanas_cortinas', 'climatizacion', 'domotica',
        'entretenimiento', 'decoracion',
      ];
      const total = calculator
        .calculate(basePrice, ids)
        .reduce((sum, a) => sum + a.amount, 0);
      expect(total).toBe(basePrice * 0.2);
    });

    it('mas areas marcadas cuesta mas', () => {
      const una = calculator.calculate(basePrice, ['cocina']);
      const dos = calculator.calculate(basePrice, ['cocina', 'pisos']);
      const sum = (xs: { amount: number }[]) => xs.reduce((s, a) => s + a.amount, 0);
      expect(sum(dos)).toBeGreaterThan(sum(una));
    });

    it('conserva el orden del catalogo', () => {
      const result = calculator.calculate(basePrice, ['decoracion', 'cocina']);
      expect(result.map((a) => a.area)).toEqual(['cocina', 'decoracion']);
    });

    it('ignora las areas desactivadas aunque vengan en la peticion', () => {
      expect(calculator.calculate(basePrice, ['vestier'])).toEqual([]);
      expect(calculator.calculate(basePrice, ['cocina', 'zona_ropas'])).toHaveLength(1);
      expect(calculator.coverage(['entrada_hall'])).toBe(0);
    });

    it('ignora ids desconocidos y repetidos', () => {
      expect(calculator.calculate(basePrice, ['cocina', 'no_existe'])).toHaveLength(1);
      expect(calculator.calculate(basePrice, ['cocina', 'cocina'])).toHaveLength(1);
    });
  });

  describe('montos fijados a mano', () => {
    it('usa el monto manual y conserva el de referencia', () => {
      const [cocina] = calculator.calculate(basePrice, ['cocina'], {
        cocina: 50_000_000,
      });
      expect(cocina.amount).toBe(50_000_000);
      expect(cocina.isManual).toBe(true);
      expect(cocina.referenceAmount).toBe(
        Math.round((basePrice * 20 * 18) / (100 * 164)),
      );
    });

    it('acepta cero como monto manual valido', () => {
      const [cocina] = calculator.calculate(basePrice, ['cocina'], { cocina: 0 });
      expect(cocina.amount).toBe(0);
      expect(cocina.isManual).toBe(true);
    });

    it('ignora overrides negativos o no numericos', () => {
      const [a] = calculator.calculate(basePrice, ['cocina'], { cocina: -5 });
      const [b] = calculator.calculate(basePrice, ['cocina'], { cocina: Number.NaN });
      expect(a.isManual).toBe(false);
      expect(b.isManual).toBe(false);
    });
  });

  describe('coverage', () => {
    it('sin seleccion es 0', () => {
      expect(calculator.coverage([])).toBe(0);
    });

    it('con todo el catalogo activo es 100', () => {
      const ids = [
        'zona_social', 'cocina', 'bano_principal', 'bano_social',
        'habitacion_principal', 'habitaciones_secundarias', 'estudio_oficina',
        'balcon_terraza', 'instalacion_electrica', 'instalacion_hidraulica',
        'instalacion_gas', 'paredes', 'pisos', 'techos', 'puertas',
        'carpinteria', 'ventanas_cortinas', 'climatizacion', 'domotica',
        'entretenimiento', 'decoracion',
      ];
      expect(calculator.coverage(ids)).toBe(100);
    });

    it('es el peso relativo de lo seleccionado', () => {
      // cocina 18 de 164 = 11%
      expect(calculator.coverage(['cocina'])).toBe(11);
    });
  });
});
