import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import SchedulePageGuest from '../../pages/SchedulePageGuest';

// Mock de framer-motion para evitar errores con useAnimation y componentes motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  useAnimation: () => ({
    start: jest.fn(),
    set: jest.fn(),
    stop: jest.fn(),
  }),
}));

// Mock de componentes que hacen fetch
jest.mock('../../components/turns/turn-list-by-week/TurnListByWeek', () => () => <div data-testid="turn-list">Turn List</div>);

describe('SchedulePageGuest', () => {
  it('se renderiza correctamente y muestra el título', () => {
    renderWithProviders(<SchedulePageGuest />);
    expect(screen.getByText(/Turnos disponibles/i)).toBeInTheDocument();
  });

  it('el navegador de semanas tiene disablePrev activo por defecto (semana actual)', () => {
    renderWithProviders(<SchedulePageGuest />);
    
    // El primer botón es el de "atrás"
    const prevButton = screen.getAllByRole('button')[0];
    expect(prevButton).toBeDisabled();
  });

  it('muestra el componente de lista de turnos', () => {
    renderWithProviders(<SchedulePageGuest />);
    const turnLists = screen.getAllByTestId('turn-list');
    expect(turnLists.length).toBeGreaterThan(0);
  });
});

