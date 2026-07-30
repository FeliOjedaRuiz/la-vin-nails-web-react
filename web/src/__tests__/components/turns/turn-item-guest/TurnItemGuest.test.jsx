import React from 'react';
import { render, screen } from '@testing-library/react';
import TurnItemGuest from '../../../../components/turns/turn-item-guest/TurnItemGuest';

describe('TurnItemGuest retiro color override', () => {
  const baseTurn = { id: 't1', hour: '10:00', state: 'Disponible' };

  it('usa bg-violet-400 cuando el turno es retiro y está disponible', () => {
    const { container } = render(
      <TurnItemGuest turn={{ ...baseTurn, category: 'retiro' }} onTurnSelection={jest.fn()} />
    );

    const slot = container.firstChild;
    expect(slot.className).toContain('bg-violet-400');
    expect(slot.className).not.toContain('bg-pink-400');
    expect(screen.getByText('10:00 hs.')).toBeInTheDocument();
  });

  it('usa bg-pink-400 cuando el turno es normal y está disponible', () => {
    const { container } = render(
      <TurnItemGuest turn={{ ...baseTurn, category: 'normal' }} onTurnSelection={jest.fn()} />
    );

    const slot = container.firstChild;
    expect(slot.className).toContain('bg-pink-400');
    expect(slot.className).not.toContain('bg-violet-400');
  });

  it('mantiene el gris ocupado sin violeta cuando el turno es retiro pero no disponible', () => {
    const { container } = render(
      <TurnItemGuest turn={{ ...baseTurn, category: 'retiro', state: 'Solicitado' }} onTurnSelection={jest.fn()} />
    );

    const slot = container.firstChild;
    expect(slot.className).toContain('bg-gray-300');
    expect(slot.className).not.toContain('bg-violet-400');
    expect(slot.className).not.toContain('bg-pink-400');
  });

  it('usa bg-violet-600 cuando el turno retiro disponible está seleccionado', () => {
    const { container } = render(
      <TurnItemGuest turn={{ ...baseTurn, category: 'retiro' }} onTurnSelection={jest.fn()} isSelected />
    );

    const slot = container.firstChild;
    expect(slot.className).toContain('bg-violet-600');
    expect(slot.className).not.toContain('bg-emerald-600');
  });
});
