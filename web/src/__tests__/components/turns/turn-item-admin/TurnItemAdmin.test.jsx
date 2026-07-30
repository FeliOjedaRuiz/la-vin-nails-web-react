import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '../../../../test-utils';
import TurnItemAdmin from '../../../../components/turns/turn-item-admin/TurnItemAdmin';
import datesService from '../../../../services/dates';

jest.mock('../../../../services/dates');

describe('TurnItemAdmin retiro badge', () => {
  const baseTurn = {
    id: 't1',
    hour: '10:00',
    state: 'Solicitado',
    dateData: {
      id: 'd1',
      user: { id: 'u1', name: 'Ana' },
      service: { id: 's1', name: 'Manicura' },
      state: 'Solicitada',
    },
  };

  it('muestra un indicador violeta cuando el turno es de retiro', () => {
    renderWithProviders(<TurnItemAdmin turn={{ ...baseTurn, category: 'retiro' }} />);

    expect(screen.getByLabelText(/categoría retiro/i)).toBeInTheDocument();
  });

  it('no muestra indicador violeta cuando el turno es normal', () => {
    renderWithProviders(<TurnItemAdmin turn={{ ...baseTurn, category: 'normal' }} />);

    expect(screen.queryByLabelText(/categoría retiro/i)).not.toBeInTheDocument();
  });

  it('conserva el color de estado cuando el turno es de retiro', () => {
    const { container } = renderWithProviders(
      <TurnItemAdmin turn={{ ...baseTurn, category: 'retiro', state: 'Solicitado' }} />
    );

    const stateSlot = container.querySelector('[class*="bg-yellow-500"]');
    expect(stateSlot).toBeInTheDocument();
    expect(screen.getByLabelText(/categoría retiro/i)).toBeInTheDocument();
  });
});
