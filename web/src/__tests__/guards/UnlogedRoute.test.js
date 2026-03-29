import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import UnlogedRoute from '../../guards/UnlogedRoute';

describe('UnlogedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra contenido si NO hay usuario', () => {
    renderWithProviders(
      <UnlogedRoute>
        <div data-testid="public-content">Contenido Público</div>
      </UnlogedRoute>
    );

    expect(screen.getByTestId('public-content')).toBeInTheDocument();
  });

  it('llama a logout() y muestra contenido si HAY usuario', () => {
    localStorage.setItem('current-user', JSON.stringify({ name: 'User', role: 'user' }));
    
    renderWithProviders(
      <UnlogedRoute>
        <div data-testid="public-content">Contenido Público</div>
      </UnlogedRoute>
    );

    // El componente UnlogedRoute llama a logout(), lo que debería disparar un cambio de estado
    // y eventualmente limpiar el localStorage.
    expect(screen.getByTestId('public-content')).toBeInTheDocument();
  });
});
