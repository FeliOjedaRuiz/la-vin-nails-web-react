import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthStore, { AuthContext } from '../../../contexts/AuthStore';
import UserProfile from '../../../components/users/user-profile/UserProfile';
import usersService from '../../../services/users';

jest.mock('../../../services/users');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithAuthContext = (ui, { user = null } = {}) => {
  const mockContextValue = {
    user,
    currentWeek: undefined,
    currentDate: undefined,
    deleteDate: jest.fn(),
    onUserChange: jest.fn(),
    logout: jest.fn(),
    onWeekSelect: jest.fn(),
    onDateSelect: jest.fn(),
  };

  return render(
    <AuthContext.Provider value={mockContextValue}>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('UserProfile', () => {
  const unblockedUser = {
    id: 'user-1',
    name: 'María',
    surname: 'García',
    phone: 612345678,
    email: 'maria@test.com',
    blocked: false,
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const blockedUser = {
    id: 'user-2',
    name: 'Ana',
    surname: 'López',
    phone: 612345679,
    email: 'ana@test.com',
    blocked: true,
    avatarUrl: 'https://example.com/avatar2.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Blocked badge', () => {
    it('renders "Bloqueada" badge when user.blocked is true', () => {
      renderWithAuthContext(<UserProfile user={blockedUser} onToggleBlock={jest.fn()} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      expect(screen.getByText('Bloqueada')).toBeInTheDocument();
    });

    it('does NOT render badge when user.blocked is false', () => {
      renderWithAuthContext(<UserProfile user={unblockedUser} onToggleBlock={jest.fn()} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      expect(screen.queryByText('Bloqueada')).not.toBeInTheDocument();
    });
  });

  describe('Block toggle button (admin-only)', () => {
    it('renders "Bloquear usuario" button for admin when user is unblocked', () => {
      renderWithAuthContext(<UserProfile user={unblockedUser} onToggleBlock={jest.fn()} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      expect(screen.getByText('Bloquear usuario')).toBeInTheDocument();
    });

    it('renders "Desbloquear usuario" button for admin when user is blocked', () => {
      renderWithAuthContext(<UserProfile user={blockedUser} onToggleBlock={jest.fn()} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      expect(screen.getByText('Desbloquear usuario')).toBeInTheDocument();
    });

    it('does NOT render toggle button when onToggleBlock is NOT provided (guest/backward-compat)', () => {
      renderWithAuthContext(<UserProfile user={unblockedUser} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      expect(screen.queryByText('Bloquear usuario')).not.toBeInTheDocument();
      expect(screen.queryByText('Desbloquear usuario')).not.toBeInTheDocument();
    });

    it('does NOT render toggle button when no user is logged in', () => {
      renderWithAuthContext(<UserProfile user={unblockedUser} onToggleBlock={jest.fn()} />, {
        user: null,
      });
      expect(screen.queryByText('Bloquear usuario')).not.toBeInTheDocument();
    });
  });

  describe('Confirmation modal', () => {
    it('opens modal with block message when clicking "Bloquear usuario"', async () => {
      renderWithAuthContext(<UserProfile user={unblockedUser} onToggleBlock={jest.fn()} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      fireEvent.click(screen.getByText('Bloquear usuario'));
      await waitFor(() => {
        expect(
          screen.getByText(/Estás seguro de que querés bloquear a María/)
        ).toBeInTheDocument();
      });
    });

    it('opens modal with unblock message when clicking "Desbloquear usuario"', async () => {
      renderWithAuthContext(<UserProfile user={blockedUser} onToggleBlock={jest.fn()} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      fireEvent.click(screen.getByText('Desbloquear usuario'));
      await waitFor(() => {
        expect(
          screen.getByText(/Estás seguro de que querés desbloquear a Ana/)
        ).toBeInTheDocument();
      });
    });

    it('closes modal when Cancelar is clicked', async () => {
      renderWithAuthContext(<UserProfile user={unblockedUser} onToggleBlock={jest.fn()} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      fireEvent.click(screen.getByText('Bloquear usuario'));
      await waitFor(() => {
        expect(screen.getByText(/Estás seguro/)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Cancelar'));
      await waitFor(() => {
        expect(screen.queryByText(/Estás seguro/)).not.toBeInTheDocument();
      });
    });

    it('calls toggleBlock and onToggleBlock when Confirmar is clicked', async () => {
      const onToggleBlock = jest.fn();
      usersService.toggleBlock.mockResolvedValue({ id: 'user-1', blocked: true });
      renderWithAuthContext(
        <UserProfile user={unblockedUser} onToggleBlock={onToggleBlock} />,
        { user: { id: 'admin-1', role: 'admin' } }
      );
      fireEvent.click(screen.getByText('Bloquear usuario'));
      await waitFor(() => {
        expect(
          screen.getByText(/Estás seguro de que querés bloquear a María/)
        ).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Confirmar'));
      await waitFor(() => {
        expect(usersService.toggleBlock).toHaveBeenCalledWith('user-1');
        expect(onToggleBlock).toHaveBeenCalledWith('user-1');
      });
    });
  });

  describe('Error feedback on toggle failure', () => {
    it('shows error message when toggle fails', async () => {
      usersService.toggleBlock.mockRejectedValue(new Error('Network error'));
      const onToggleBlock = jest.fn();
      renderWithAuthContext(
        <UserProfile user={unblockedUser} onToggleBlock={onToggleBlock} />,
        { user: { id: 'admin-1', role: 'admin' } }
      );
      fireEvent.click(screen.getByText('Bloquear usuario'));
      await waitFor(() => {
        expect(screen.getByText(/Estás seguro/)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Confirmar'));
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Error al cambiar el estado/);
      });
    });

    it('reopens modal with error message when toggle fails', async () => {
      usersService.toggleBlock.mockRejectedValue(new Error('Network error'));
      const onToggleBlock = jest.fn();
      renderWithAuthContext(
        <UserProfile user={unblockedUser} onToggleBlock={onToggleBlock} />,
        { user: { id: 'admin-1', role: 'admin' } }
      );
      fireEvent.click(screen.getByText('Bloquear usuario'));
      await waitFor(() => {
        expect(screen.getByText(/Estás seguro/)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Confirmar'));
      await waitFor(() => {
        // Modal should reopen with error
        expect(screen.getByRole('alert')).toBeInTheDocument();
        // onToggleBlock should NOT have been called
        expect(onToggleBlock).not.toHaveBeenCalled();
      });
    });
  });
});
