import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import TurnsListByWeekAdmin, { turnsCache, clearAdminTurnsCache } from '../../../components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin';
import turnsService from '../../../services/turns';
import datesService from '../../../services/dates';

// Mock de servicios
jest.mock('../../../services/turns');
jest.mock('../../../services/dates');

describe('TurnsListByWeekAdmin (SWR Strategy)', () => {
  const initDate = '2026-05-04'; // Lunes
  const mockCachedTurns = [
    { id: '1', date: '2026-05-05', hour: '10:00', state: 'Confirmado' }
  ];
  const mockFreshTurns = [
    { id: '1', date: '2026-05-05', hour: '10:00', state: 'Confirmado' },
    { id: '2', date: '2026-05-06', hour: '11:00', state: 'Disponible' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    clearAdminTurnsCache();
    // Evitar errores de TurnItemAdmin
    datesService.list.mockResolvedValue([]);
  });

  it('debe mostrar datos del caché inmediatamente y revalidar en background', async () => {
    // 1. Pre-poblar el caché
    turnsCache[initDate] = mockCachedTurns;
    
    // Mock de la API que responde con datos frescos
    turnsService.list.mockResolvedValue(mockFreshTurns);

    renderWithProviders(<TurnsListByWeekAdmin initDate={initDate} reload={false} />);

    // Verificación 1: Render inmediato del caché (sin loading spinner si lo hubiera)
    // Buscamos el turno que ya estaba en caché
    expect(screen.getByText('10:00')).toBeInTheDocument();
    
    // Verificación 2: La API ha sido llamada a pesar de tener caché (SWR)
    expect(turnsService.list).toHaveBeenCalledWith(initDate, expect.any(String), expect.any(Object));

    // Verificación 3: Tras resolver la API, se muestran los datos nuevos
    await waitFor(() => {
      expect(screen.getByText('11:00')).toBeInTheDocument();
    });
  });

  it('debe cancelar el AbortController al cambiar de initDate', async () => {
    // Pre-poblar el caché para activar la ruta SWR
    turnsCache[initDate] = mockCachedTurns;

    // Mock que retorna una promesa controlable (simula fetch lento)
    let resolveSwr;
    const swrPromise = new Promise((resolve) => { resolveSwr = resolve; });
    turnsService.list.mockReturnValue(swrPromise);

    const { unmount } = renderWithProviders(<TurnsListByWeekAdmin initDate={initDate} reload={false} />);

    // Verificar que el servicio fue llamado con un signal (AbortController)
    expect(turnsService.list).toHaveBeenCalledWith(
      initDate,
      expect.any(String),
      expect.objectContaining({ aborted: false })
    );

    // Extraer el signal que se pasó al servicio
    const signal = turnsService.list.mock.calls[0][2];

    // Simular desmontaje del componente (cambio de semana → nuevo render)
    unmount();

    // Verificar que el AbortController fue abortado al desmontar
    expect(signal.aborted).toBe(true);

    // Resolver la promesa — la respuesta DEBE ser descartada
    resolveSwr(mockFreshTurns);
    await new Promise((r) => setTimeout(r, 10));
    
    // El test pasa si no hay errores — la respuesta obsoleta fue ignorada
  });

  it('debe mostrar loading si NO hay datos en caché', async () => {
    turnsService.list.mockResolvedValue(mockFreshTurns);

    renderWithProviders(<TurnsListByWeekAdmin initDate={initDate} reload={false} />);

    // Debería estar en loading inicialmente (podríamos buscar un spinner si existiera, 
    // pero aquí simplemente verificamos que 10:00 no aparece de inmediato)
    expect(screen.queryByText('10:00')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('11:00')).toBeInTheDocument();
    });
  });
});
