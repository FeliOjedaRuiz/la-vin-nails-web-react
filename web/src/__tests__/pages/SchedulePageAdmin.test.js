import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import SchedulePageAdmin from '../../pages/SchedulePageAdmin';

// Mock de framer-motion
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

// Mock de componentes que hacen fetch o lógica compleja
jest.mock('../../components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin', () => () => <div data-testid="admin-turn-list">Admin Turn List</div>);
jest.mock('../../components/turns/turns-form/TurnsForm', () => () => <div>Turns Form</div>);

describe('SchedulePageAdmin', () => {
  it('se renderiza correctamente y el botón atrás NO está deshabilitado por defecto', () => {
    // Simulamos admin en localStorage
    localStorage.setItem('current-user', JSON.stringify({ name: 'Admin', role: 'admin' }));
    
    renderWithProviders(<SchedulePageAdmin />);
    
    expect(screen.getByText(/Turnos de la semana/i)).toBeInTheDocument();
    
    // El primer botón es el de "atrás"
    const prevButton = screen.getAllByRole('button')[0];
    
    // El admin debería poder ir atrás (disablePrev no debería estar presente o ser false)
    expect(prevButton).not.toBeDisabled();
    expect(prevButton).not.toHaveClass('cursor-not-allowed');
  });
});
