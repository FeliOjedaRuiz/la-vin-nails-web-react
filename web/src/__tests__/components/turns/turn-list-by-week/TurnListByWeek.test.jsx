import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../test-utils';
import TurnListByWeek, { clearGuestTurnsCache } from '../../../../components/turns/turn-list-by-week/TurnListByWeek';
import turnsService from '../../../../services/turns';

jest.mock('../../../../services/turns');

describe('TurnListByWeek category-aware cache', () => {
  const initDate = '2026-05-04';

  beforeEach(() => {
    jest.clearAllMocks();
    clearGuestTurnsCache();
    turnsService.list.mockResolvedValue([]);
  });

  const flushAsyncEffect = () =>
    waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

  it('llama a turnsService.list con category "retiro" cuando se le pasa category="retiro"', async () => {
    renderWithProviders(
      <TurnListByWeek initDate={initDate} category="retiro" onTurnSelection={jest.fn()} />
    );

    await waitFor(() => {
      expect(turnsService.list).toHaveBeenCalledWith(
        initDate,
        expect.any(String),
        'retiro',
        expect.objectContaining({ aborted: false })
      );
    });
    await flushAsyncEffect();
  });

  it('llama a turnsService.list con category "normal" por defecto', async () => {
    renderWithProviders(
      <TurnListByWeek initDate={initDate} onTurnSelection={jest.fn()} />
    );

    await waitFor(() => {
      expect(turnsService.list).toHaveBeenCalledWith(
        initDate,
        expect.any(String),
        'normal',
        expect.objectContaining({ aborted: false })
      );
    });
    await flushAsyncEffect();
  });

  it('refetcha al cambiar de category sin reutilizar el caché de otra category', async () => {
    const { rerender } = renderWithProviders(
      <TurnListByWeek initDate={initDate} category="retiro" onTurnSelection={jest.fn()} />
    );

    await waitFor(() => expect(turnsService.list).toHaveBeenCalledTimes(1));

    rerender(
      <TurnListByWeek initDate={initDate} category="normal" onTurnSelection={jest.fn()} />
    );

    await waitFor(() => {
      expect(turnsService.list).toHaveBeenLastCalledWith(
        initDate,
        expect.any(String),
        'normal',
        expect.objectContaining({ aborted: false })
      );
    });
    await flushAsyncEffect();
  });
});
