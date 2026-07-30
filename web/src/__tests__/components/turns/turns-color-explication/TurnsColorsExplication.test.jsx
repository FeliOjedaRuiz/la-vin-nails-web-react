import React from 'react';
import { render, screen } from '@testing-library/react';
import TurnsColorsExplication from '../../../../components/turns/turns-color-explication/TurnsColorsExplication';

describe('TurnsColorsExplication', () => {
  it('muestra el ítem de leyenda "Retiro" con su muestra violeta', () => {
    const { container } = render(<TurnsColorsExplication />);

    expect(screen.getByText('Retiro')).toBeInTheDocument();

    const swatch = container.querySelector('[class*="bg-violet-400"]');
    expect(swatch).toBeInTheDocument();
  });
});
