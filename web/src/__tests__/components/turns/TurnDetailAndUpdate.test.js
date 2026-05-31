import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import TurnDetailAndUpdate from '../../../components/turns/turn-detail-and-update/TurnDetailAndUpdate';
import turnsService from '../../../services/turns';
import datesService from '../../../services/dates';
import { clearAdminTurnsCache } from '../../../components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin';
import { clearGuestTurnsCache } from '../../../components/turns/turn-list-by-week/TurnListByWeek';

// Mock de servicios
jest.mock('../../../services/turns');
jest.mock('../../../services/dates');

// Mock de utilidades de caché
jest.mock('../../../components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin', () => ({
  __esModule: true,
  default: () => null, // El componente por defecto
  clearAdminTurnsCache: jest.fn(),
}));

jest.mock('../../../components/turns/turn-list-by-week/TurnListByWeek', () => ({
  __esModule: true,
  default: () => null,
  clearGuestTurnsCache: jest.fn(),
}));

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '123' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('TurnDetailAndUpdate', () => {
  const mockTurn = {
    id: '123',
    date: '2026-05-04',
    hour: '10:00',
    state: 'Confirmado',
  };

  const mockDate = {
    id: '456',
    user: { id: 'user1', name: 'Test User', phone: '123456789' },
    turn: { id: '123' },
    service: { id: 'serv1', name: 'Manicura' },
    type: 'Semipermanente',
    needRemove: 'No',
    designDetails: 'Ninguno',
    cost: 20,
    duration: '1:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    turnsService.detail.mockResolvedValue(mockTurn);
    // Para simplificar el test de handleSubmit, asumimos que no hay cita (date) inicialmente
    // o mockeamos que AuthContext la provee si quisiéramos testear ambos, pero el bug era en el await general.
  });

  it('debe esperar a que termine el guardado antes de limpiar caché y navegar (evita race condition)', async () => {
    let resolveUpdate;
    const updatePromise = new Promise((resolve) => {
      resolveUpdate = () => resolve(mockTurn);
    });

    turnsService.update.mockReturnValue(updatePromise);

    renderWithProviders(<TurnDetailAndUpdate />);

    // Esperar a que cargue el detalle
    await waitFor(() => expect(screen.getByDisplayValue('10:00')).toBeInTheDocument());

    // Hacer submit
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    // Verificación: Se ha llamado a update pero NO a limpiar caché ni a navegar todavía
    expect(turnsService.update).toHaveBeenCalled();
    expect(clearAdminTurnsCache).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    // Resolvemos el guardado
    resolveUpdate();

    // Ahora sí debe haber limpiado y navegado
    await waitFor(() => {
      expect(clearAdminTurnsCache).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/admin-schedule');
    });
  });

  it('debe usar turn.dateData como fallback cuando currentDate no está en contexto', async () => {
    // Turn con dateData populado por el backend (como viene de la API real)
    const turnWithDateData = {
      ...mockTurn,
      dateData: {
        id: '456',
        user: { id: 'user1', name: 'Test User', phone: '123456789' },
        service: { id: 'serv1', name: 'Manicura' },
        type: 'Semipermanente',
        needRemove: 'No',
        designDetails: 'Ninguno',
        cost: 20,
        duration: '1:00',
      },
    };

    turnsService.detail.mockResolvedValue(turnWithDateData);

    // Render sin currentDate en contexto (simula navegación directa)
    renderWithProviders(<TurnDetailAndUpdate />, { route: '/turns/123' });

    // Esperar a que cargue el detalle
    await waitFor(() => expect(screen.getByDisplayValue('10:00')).toBeInTheDocument());

    // Verificación: Debe mostrar detalles de la cita (no el mensaje "aún no fue solicitado")
    expect(screen.queryByText(/aún no fue solicitado/i)).not.toBeInTheDocument();
    expect(screen.getByText('Manicura')).toBeInTheDocument();
    expect(screen.getByText('Semipermanente')).toBeInTheDocument();
  });
});
