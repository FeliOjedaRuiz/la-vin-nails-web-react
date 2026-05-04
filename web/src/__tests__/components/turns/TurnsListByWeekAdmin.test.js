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
    expect(turnsService.list).toHaveBeenCalledWith(initDate, expect.any(String));

    // Verificación 3: Tras resolver la API, se muestran los datos nuevos
    await waitFor(() => {
      expect(screen.getByText('11:00')).toBeInTheDocument();
    });
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
