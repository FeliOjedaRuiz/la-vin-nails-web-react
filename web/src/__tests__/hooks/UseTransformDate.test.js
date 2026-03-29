import useTransformDate from '../../hooks/UseTransformDate';

describe('useTransformDate hook', () => {
  it('transforma un objeto Date a formato YYYY-MM-DD', () => {
    const date = new Date(2026, 3, 28); // 28 de Abril (0-indexed)
    expect(useTransformDate(date)).toBe('2026-04-28');
  });

  it('transforma un string de fecha ISO a formato YYYY-MM-DD', () => {
    const dateStr = '2026-05-10T14:00:00Z';
    expect(useTransformDate(dateStr)).toBe('2026-05-10');
  });

  it('maneja correctamente meses de un solo dígito', () => {
    const date = new Date(2026, 0, 5); // 5 de Enero
    expect(useTransformDate(date)).toBe('2026-01-05');
  });

  it('¡ALERTA SAFARI! debería manejar formatos con espacios (yyyy-mm-dd hh:mm:ss)', () => {
    // Nota: Safari a veces falla con el espacio si no es ISO. 
    // JSDOM suele aceptarlo, pero este test asegura que el resultado sea el esperado.
    const dateStr = '2026-12-25 10:00:00';
    expect(useTransformDate(dateStr)).toBe('2026-12-25');
  });
});
