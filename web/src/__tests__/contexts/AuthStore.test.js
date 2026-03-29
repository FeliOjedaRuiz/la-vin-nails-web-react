import React, { useContext } from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthStore, { AuthContext } from '../../contexts/AuthStore';

// Componente dummy para consumir el contexto
const Consumer = () => {
  const { user, onUserChange, logout, onDateSelect, currentDate } = useContext(AuthContext);
  return (
    <div>
      <div data-testid="user-name">{user?.name || 'No User'}</div>
      <div data-testid="date">{currentDate || 'No Date'}</div>
      <button onClick={() => onUserChange({ name: 'Feli', token: 'jwt-123', role: 'admin' })} data-testid="login">Login</button>
      <button onClick={() => onDateSelect('2026-04-10')} data-testid="set-date">Set Date</button>
      <button onClick={logout} data-testid="logout">Logout</button>
    </div>
  );
};

describe('AuthStore Context', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('inicializa con valores vacíos si localStorage está limpio', () => {
    render(
      <MemoryRouter>
        <AuthStore>
          <Consumer />
        </AuthStore>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
    expect(screen.getByTestId('date')).toHaveTextContent('No Date');
  });

  it('recupera usuario del localStorage al inicializar', () => {
    localStorage.setItem('current-user', JSON.stringify({ name: 'Maria' }));
    
    render(
      <MemoryRouter>
        <AuthStore>
          <Consumer />
        </AuthStore>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('Maria');
  });

  it('onUserChange persiste en localStorage y actualiza estado', () => {
    render(
      <MemoryRouter>
        <AuthStore>
          <Consumer />
        </AuthStore>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('login'));

    expect(screen.getByTestId('user-name')).toHaveTextContent('Feli');
    expect(localStorage.getItem('user-access-token')).toBe('jwt-123');
    expect(JSON.parse(localStorage.getItem('current-user'))).toEqual({ name: 'Feli', token: 'jwt-123', role: 'admin' });
  });

  it('logout limpia localStorage y estado', () => {
    localStorage.setItem('current-user', JSON.stringify({ name: 'Old' }));
    
    render(
      <MemoryRouter>
        <AuthStore>
          <Consumer />
        </AuthStore>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('logout'));

    expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
    expect(localStorage.getItem('current-user')).toBeNull();
  });

  it('onDateSelect persiste la fecha', () => {
    render(
      <MemoryRouter>
        <AuthStore>
          <Consumer />
        </AuthStore>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('set-date'));

    expect(screen.getByTestId('date')).toHaveTextContent('2026-04-10');
    expect(localStorage.getItem('current-date')).toBe('"2026-04-10"'); // JSON.stringify("string")
  });
});
