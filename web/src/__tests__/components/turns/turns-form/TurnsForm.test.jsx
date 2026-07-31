import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../test-utils';
import TurnsForm from '../../../../components/turns/turns-form/TurnsForm';
import turnsService from '../../../../services/turns';

jest.mock('../../../../services/turns');

describe('TurnsForm category toggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    turnsService.create.mockResolvedValue({ id: 'new-turn', date: '2026-08-03', hour: '10:00' });
  });

  const fillAndSubmit = () => {
    fireEvent.change(screen.getByLabelText(/fecha/i), { target: { value: '2026-08-03' } });
    fireEvent.change(screen.getByLabelText(/hora/i), { target: { value: '10:00' } });
    fireEvent.click(screen.getByRole('button'));
  };

  it('envía category "normal" cuando el toggle de retiro está desmarcado', async () => {
    const onTurnCreation = jest.fn();
    renderWithProviders(<TurnsForm onTurnCreation={onTurnCreation} />);

    fillAndSubmit();

    await waitFor(() => {
      expect(turnsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'normal' })
      );
    });
    expect(onTurnCreation).toHaveBeenCalled();
  });

  it('envía category "retiro" cuando el toggle de retiro está marcado', async () => {
    const onTurnCreation = jest.fn();
    renderWithProviders(<TurnsForm onTurnCreation={onTurnCreation} />);

    fireEvent.click(screen.getByRole('checkbox'));
    fillAndSubmit();

    await waitFor(() => {
      expect(turnsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'retiro' })
      );
    });
    expect(onTurnCreation).toHaveBeenCalled();
  });
});
