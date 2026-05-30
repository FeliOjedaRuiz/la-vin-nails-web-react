import { getMonthVisibility } from '../monthVisibility';

describe('getMonthVisibility utility', () => {
  // Hoy = 1 Mayo 2026
  // Techo (maxVisibleDate) = Fin de Junio 2026 (30 de Junio)
  const maxVisibleDate = new Date(2026, 5, 30, 23, 59, 59); // Junio es 5 (0-indexed)

  it('debe devolver isLocked: false para una fecha en el mes actual (mayo)', () => {
    const result = getMonthVisibility('2026-05-15', maxVisibleDate);
    expect(result.isLocked).toBe(false);
  });

  it('debe devolver isLocked: false para una fecha en el mes siguiente (junio)', () => {
    const result = getMonthVisibility('2026-06-20', maxVisibleDate);
    expect(result.isLocked).toBe(false);
  });

  it('debe devolver isLocked: true para una fecha en el mes posterior (julio)', () => {
    const result = getMonthVisibility('2026-07-01', maxVisibleDate);
    expect(result.isLocked).toBe(true);
    // Opening date debe ser el 1 de Junio (para la agenda de Julio)
    expect(result.openingDate.getFullYear()).toBe(2026);
    expect(result.openingDate.getMonth()).toBe(5); // Junio
    expect(result.openingDate.getDate()).toBe(1);
  });

  it('debe devolver isLocked: false si maxVisibleDate no se proporciona', () => {
    const result = getMonthVisibility('2026-12-31', null);
    expect(result.isLocked).toBe(false);
  });
});
