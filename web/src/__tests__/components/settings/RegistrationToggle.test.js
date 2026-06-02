import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RegistrationToggle from '../../../components/settings/registration-toggle/RegistrationToggle';
import settingsApi from '../../../services/settings';

jest.mock('../../../services/settings');

describe('RegistrationToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render and loading state', () => {
    it('shows loading spinner on initial mount', () => {
      settingsApi.getByKey.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ value: true }), 100))
      );

      render(<RegistrationToggle />);

      const toggleButton = screen.getByRole('button', { name: /abrir registro/i });
      expect(toggleButton).toBeDisabled();
    });
  });

  describe('Display current state on mount', () => {
    it('renders toggle as ON when registration.enabled is true', async () => {
      settingsApi.getByKey.mockResolvedValue({ value: true });

      render(<RegistrationToggle />);

      await waitFor(() => {
        expect(screen.getByText('Registro abierto')).toBeInTheDocument();
      });

      const toggleButton = screen.getByRole('button', { name: /cerrar registro/i });
      expect(toggleButton).not.toBeDisabled();
      expect(toggleButton).toHaveClass('bg-pink-600');
    });

    it('renders toggle as OFF when registration.enabled is false', async () => {
      settingsApi.getByKey.mockResolvedValue({ value: false });

      render(<RegistrationToggle />);

      await waitFor(() => {
        expect(screen.getByText('Registro cerrado')).toBeInTheDocument();
      });

      const toggleButton = screen.getByRole('button', { name: /abrir registro/i });
      expect(toggleButton).not.toBeDisabled();
      expect(toggleButton).toHaveClass('bg-gray-200');
    });
  });

  describe('Toggle from open to closed', () => {
    it('shows loading during PATCH request and updates state on success', async () => {
      settingsApi.getByKey.mockResolvedValue({ value: true });
      settingsApi.update.mockResolvedValue({ key: 'registration.enabled', value: false });

      render(<RegistrationToggle />);

      await waitFor(() => {
        expect(screen.getByText('Registro abierto')).toBeInTheDocument();
      });

      const toggleButton = screen.getByRole('button', { name: /cerrar registro/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Registro cerrado')).toBeInTheDocument();
      });

      expect(settingsApi.update).toHaveBeenCalledWith('registration.enabled', false);
    });
  });

  describe('Toggle from closed to open', () => {
    it('updates state when reopening registration', async () => {
      settingsApi.getByKey.mockResolvedValue({ value: false });
      settingsApi.update.mockResolvedValue({ key: 'registration.enabled', value: true });

      render(<RegistrationToggle />);

      await waitFor(() => {
        expect(screen.getByText('Registro cerrado')).toBeInTheDocument();
      });

      const toggleButton = screen.getByRole('button', { name: /abrir registro/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Registro abierto')).toBeInTheDocument();
      });

      expect(settingsApi.update).toHaveBeenCalledWith('registration.enabled', true);
    });
  });

  describe('Toggle failure - shows error and reverts', () => {
    it('reverts toggle and shows error message on PATCH failure', async () => {
      settingsApi.getByKey.mockResolvedValue({ value: true });
      settingsApi.update.mockRejectedValue(new Error('Network error'));

      render(<RegistrationToggle />);

      await waitFor(() => {
        expect(screen.getByText('Registro abierto')).toBeInTheDocument();
      });

      const toggleButton = screen.getByRole('button', { name: /cerrar registro/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('No se pudo actualizar el estado. Intenta de nuevo.')).toBeInTheDocument();
      });

      // Toggle should revert to ON state
      expect(screen.getByText('Registro abierto')).toBeInTheDocument();
    });
  });

  describe('Fail-open on mount', () => {
    it('defaults to open state if GET fails', async () => {
      settingsApi.getByKey.mockRejectedValue(new Error('Server error'));

      render(<RegistrationToggle />);

      await waitFor(() => {
        expect(screen.getByText('Registro abierto')).toBeInTheDocument();
      });
    });
  });
});