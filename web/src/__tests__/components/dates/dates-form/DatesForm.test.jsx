import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../test-utils';
import DatesForm from '../../../../components/dates/dates-form/DatesForm';
import turnsService from '../../../../services/turns';
import datesService from '../../../../services/dates';
import TurnListByWeek from '../../../../components/turns/turn-list-by-week/TurnListByWeek';

jest.mock('../../../../services/turns');
jest.mock('../../../../services/dates');
jest.mock('../../../../components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin', () => ({
  __esModule: true,
  default: () => null,
  clearAdminTurnsCache: jest.fn(),
}));
jest.mock('../../../../components/week-navigator/WeekNavigator', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../../../components/carousel/WeekCarousel', () => ({
  __esModule: true,
  default: function MockWeekCarousel(props) {
    return props.renderItem ? props.renderItem('2026-08-03') : null;
  },
}));

jest.mock('../../../../components/turns/turn-list-by-week/TurnListByWeek', () => ({
  __esModule: true,
  default: jest.fn(),
  clearGuestTurnsCache: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('DatesForm category-aware booking', () => {
  const baseService = { id: 'svc-1', name: 'Manicura' };
  const retiroService = { id: 'svc-2', name: 'Retiro' };
  const serviceTypes = ['Semipermanente'];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('current-user', JSON.stringify({ id: 'user-1', token: 'token' }));
    turnsService.update.mockResolvedValue({});
    TurnListByWeek.mockImplementation(({ onTurnSelection }) => (
      <button type="button" onClick={() => onTurnSelection && onTurnSelection({ id: 'turn-1', date: '2026-08-03', hour: '10:00', state: 'Disponible' })}>
        Seleccionar turno
      </button>
    ));
  });

  afterEach(() => {
    localStorage.clear();
  });

  const fillFormAndSelectTurn = async () => {
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Semipermanente' } });
    fireEvent.change(screen.getByPlaceholderText(/detalles del diseño/i), { target: { value: 'Detalles' } });
    const noRadio = screen.getAllByRole('radio').find((el) => el.value === 'No');
    fireEvent.click(noRadio);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /seleccionar turno/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /seleccionar turno/i }));
  };

  it('pasa category "retiro" a TurnListByWeek cuando el servicio es Retiro', async () => {
    renderWithProviders(<DatesForm service={retiroService} serviceTypes={serviceTypes} />);

    await waitFor(() => {
      expect(TurnListByWeek).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'retiro' }),
        expect.anything()
      );
    });
  });

  it('pasa category "normal" a TurnListByWeek cuando el servicio no es Retiro', async () => {
    renderWithProviders(<DatesForm service={baseService} serviceTypes={serviceTypes} />);

    await waitFor(() => {
      expect(TurnListByWeek).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'normal' }),
        expect.anything()
      );
    });
  });

  it('en rollback envía únicamente { state: "Disponible" }', async () => {
    datesService.create.mockRejectedValue(new Error('Category mismatch'));

    renderWithProviders(<DatesForm service={retiroService} serviceTypes={serviceTypes} />);

    await fillFormAndSelectTurn();

    fireEvent.click(screen.getByRole('button', { name: /solicitar cita/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(turnsService.update).toHaveBeenCalledTimes(2);
    });

    expect(turnsService.update).toHaveBeenLastCalledWith(
      'turn-1',
      expect.objectContaining({ state: 'Disponible' })
    );
    const rollbackCallArg = turnsService.update.mock.calls[1][1];
    expect(rollbackCallArg).not.toHaveProperty('category');
  });
});
