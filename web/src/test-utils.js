import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthStore from './contexts/AuthStore';

/**
 * Helper para renderizar componentes con los providers necesarios (Router, Theme, Auth).
 * @param {React.ReactElement} ui - El componente a testear.
 * @param {Object} options - Opciones de render adicionales.
 * @returns {import('@testing-library/react').RenderResult}
 */
export function renderWithProviders(ui, { route = '/', ...options } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthStore>{ui}</AuthStore>
    </MemoryRouter>,
    options
  );
}

/**
 * Mock manual de localStorage para tests si el entorno JSDOM falla.
 */
export const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
