import React, { useContext } from 'react';
import { screen, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthStore, { AuthContext } from '../../contexts/AuthStore';

// Dummy component to consume the context
const Consumer = () => {
  const { user } = useContext(AuthContext);
  return (
    <div>
      <div data-testid="user-name">{user?.name || 'No User'}</div>
    </div>
  );
};

describe('AuthStore - Restricted Environment (In-App Browser)', () => {
  const originalGetItem = localStorage.getItem;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.getItem = originalGetItem;
  });

  it('no crashea si localStorage.getItem lanza un error (caso Instagram iOS)', () => {
    // Simulamos el fallo de seguridad/privacidad de iOS WebKit
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: The operation is insecure.');
    });

    render(
      <MemoryRouter>
        <AuthStore>
          <Consumer />
        </AuthStore>
      </MemoryRouter>
    );

    // Debería inicializar con un usuario vacío (undefined) pero NO romper la app
    expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
  });

  it('no crashea si localStorage.setItem lanza un error', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
    });

    // Solo comprobamos que el componente se renderiza sin explotar si intentara escribir
    render(
      <MemoryRouter>
        <AuthStore>
          <Consumer />
        </AuthStore>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-name')).toBeInTheDocument();
  });
});
