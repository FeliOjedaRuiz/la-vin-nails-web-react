import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import PrivateRoute from '../../guards/PrivateRoute';


// Mock de Navigate para verificar redirecciones
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn(() => <div data-testid="navigate">Redirect</div>),
}));

describe('PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('redirecciona a /login si no hay usuario', () => {
    const { Navigate } = require('react-router-dom');
    renderWithProviders(
      <PrivateRoute>
        <div data-testid="private-content">Contenido Privado</div>
      </PrivateRoute>
    );

    expect(Navigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/login', replace: true }),
      expect.anything()
    );
    expect(screen.queryByTestId('private-content')).not.toBeInTheDocument();
  });

  it('muestra el contenido si hay un usuario autenticado', () => {
    localStorage.setItem('current-user', JSON.stringify({ name: 'Test User', role: 'user' }));
    
    renderWithProviders(
      <PrivateRoute>
        <div data-testid="private-content">Contenido Privado</div>
      </PrivateRoute>
    );

    expect(screen.getByTestId('private-content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('redirecciona a /error-page si el rol no coincide', () => {
    const { Navigate } = require('react-router-dom');
    localStorage.setItem('current-user', JSON.stringify({ name: 'User', role: 'user' }));
    
    renderWithProviders(
      <PrivateRoute role="admin">
        <div data-testid="admin-content">Solo Admin</div>
      </PrivateRoute>
    );

    expect(Navigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/error-page', replace: true }),
      expect.anything()
    );
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('muestra el contenido si el rol coincide (admin)', () => {
    localStorage.setItem('current-user', JSON.stringify({ name: 'Admin', role: 'admin' }));
    
    renderWithProviders(
      <PrivateRoute role="admin">
        <div data-testid="admin-content">Solo Admin</div>
      </PrivateRoute>
    );

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });
});
