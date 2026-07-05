import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthStore, { AuthContext } from '../../../contexts/AuthStore';
import UserItem from '../../../components/users/user-item/UserItem';
import usersService from '../../../services/users';

jest.mock('../../../services/users');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, onClick, ...props }) => (
    <a {...props} onClick={onClick}>
      {children}
    </a>
  ),
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

describe('UserItem', () => {
  const unblockedUser = {
    id: 'user-1',
    name: 'María',
    surname: 'García',
    phone: 612345678,
    email: 'maria@test.com',
    blocked: false,
  };

  const blockedUser = {
    id: 'user-2',
    name: 'Ana',
    surname: 'López',
    phone: 612345679,
    email: 'ana@test.com',
    blocked: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Blocked badge', () => {
    it('renders "Bloqueada" badge when user.blocked is true', () => {
      renderWithAuthContext(<UserItem user={blockedUser} />);
      expect(screen.getByText('Bloqueada')).toBeInTheDocument();
    });

    it('does NOT render badge when user.blocked is false', () => {
      renderWithAuthContext(<UserItem user={unblockedUser} />);
      expect(screen.queryByText('Bloqueada')).not.toBeInTheDocument();
    });
  });

  describe('Block toggle button (admin-only)', () => {
    it('renders "Bloquear" button for admin when user is unblocked', () => {
      renderWithAuthContext(<UserItem user={unblockedUser} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      expect(screen.getByText('Bloquear')).toBeInTheDocument();
    });

    it('renders "Desbloquear" button for admin when user is blocked', () => {
      renderWithAuthContext(<UserItem user={blockedUser} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      expect(screen.getByText('Desbloquear')).toBeInTheDocument();
    });

    it('does NOT render toggle button for non-admin (guest)', () => {
      renderWithAuthContext(<UserItem user={unblockedUser} />, {
        user: { id: 'guest-1', role: 'guest' },
      });
      expect(screen.queryByText('Bloquear')).not.toBeInTheDocument();
    });

    it('does NOT render toggle button when no user is logged in', () => {
      renderWithAuthContext(<UserItem user={unblockedUser} />, { user: null });
      expect(screen.queryByText('Bloquear')).not.toBeInTheDocument();
    });
  });

  describe('Confirmation modal', () => {
    it('opens modal with block message when clicking "Bloquear"', async () => {
      renderWithAuthContext(<UserItem user={unblockedUser} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      fireEvent.click(screen.getByText('Bloquear'));
      await waitFor(() => {
        expect(
          screen.getByText(/Estás seguro de que querés bloquear a María/)
        ).toBeInTheDocument();
      });
    });

    it('opens modal with unblock message when clicking "Desbloquear"', async () => {
      renderWithAuthContext(<UserItem user={blockedUser} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      fireEvent.click(screen.getByText('Desbloquear'));
      await waitFor(() => {
        expect(
          screen.getByText(/Estás seguro de que querés desbloquear a Ana/)
        ).toBeInTheDocument();
      });
    });

    it('closes modal when Cancelar is clicked', async () => {
      renderWithAuthContext(<UserItem user={unblockedUser} />, {
        user: { id: 'admin-1', role: 'admin' },
      });
      fireEvent.click(screen.getByText('Bloquear'));
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
        <UserItem user={unblockedUser} onToggleBlock={onToggleBlock} />,
        { user: { id: 'admin-1', role: 'admin' } }
      );
      fireEvent.click(screen.getByText('Bloquear'));
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
});
