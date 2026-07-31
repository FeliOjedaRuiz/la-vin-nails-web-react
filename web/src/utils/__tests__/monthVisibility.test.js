import { getMonthVisibility, getVisibilityCeiling } from '../monthVisibility';

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

describe('getVisibilityCeiling — June & August exceptions (M+2)', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('en mayo aplica regla normal: techo = fin de junio (M+1)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-15T12:00:00'));

    const { maxVisibleDate, maxNavigationDate } = getVisibilityCeiling();

    expect(maxVisibleDate.getMonth()).toBe(5); // June (0-indexed)
    expect(maxVisibleDate.getDate()).toBe(30);
    expect(maxNavigationDate.getMonth()).toBe(6); // July
    expect(maxNavigationDate.getDate()).toBe(31);
  });

  it('el 1 de junio aplica excepción M+2: techo = fin de agosto', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-01T12:00:00'));

    const { maxVisibleDate, maxNavigationDate } = getVisibilityCeiling();

    expect(maxVisibleDate.getMonth()).toBe(7); // August (0-indexed)
    expect(maxVisibleDate.getDate()).toBe(31);
    expect(maxNavigationDate.getMonth()).toBe(8); // September
    expect(maxNavigationDate.getDate()).toBe(30);
  });

  it('el 1 de julio aplica regla normal: techo = fin de agosto (M+1)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-15T12:00:00'));

    const { maxVisibleDate } = getVisibilityCeiling();

    expect(maxVisibleDate.getMonth()).toBe(7); // August
    expect(maxVisibleDate.getDate()).toBe(31);
  });

  it('el 1 de agosto aplica excepción M+2: techo = fin de octubre', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-01T12:00:00'));

    const { maxVisibleDate, maxNavigationDate } = getVisibilityCeiling();

    expect(maxVisibleDate.getMonth()).toBe(9); // October (0-indexed)
    expect(maxVisibleDate.getDate()).toBe(31);
    expect(maxNavigationDate.getMonth()).toBe(10); // November
    expect(maxNavigationDate.getDate()).toBe(30);
  });

  it('en agosto (día 15) aplica excepción M+2: techo = fin de octubre', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-15T12:00:00'));

    const { maxVisibleDate } = getVisibilityCeiling();

    expect(maxVisibleDate.getMonth()).toBe(9); // October
    expect(maxVisibleDate.getDate()).toBe(31);
  });

  it('el 1 de septiembre vuelve a regla normal: techo = fin de octubre', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-01T12:00:00'));

    const { maxVisibleDate, maxNavigationDate } = getVisibilityCeiling();

    expect(maxVisibleDate.getMonth()).toBe(9); // October (0-indexed)
    expect(maxVisibleDate.getDate()).toBe(31);
    expect(maxNavigationDate.getMonth()).toBe(10); // November
    expect(maxNavigationDate.getDate()).toBe(30);
  });

  it('en diciembre aplica regla normal con salto de año: techo = fin de enero', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-12-15T12:00:00'));

    const { maxVisibleDate, maxNavigationDate } = getVisibilityCeiling();

    expect(maxVisibleDate.getFullYear()).toBe(2027);
    expect(maxVisibleDate.getMonth()).toBe(0); // January
    expect(maxVisibleDate.getDate()).toBe(31);
    expect(maxNavigationDate.getFullYear()).toBe(2027);
    expect(maxNavigationDate.getMonth()).toBe(1); // February
    expect(maxNavigationDate.getDate()).toBe(28);
  });
});
