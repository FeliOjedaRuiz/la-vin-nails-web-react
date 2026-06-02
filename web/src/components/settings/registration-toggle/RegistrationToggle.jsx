import React, { useState, useEffect } from 'react';
import settingsApi from '../../../services/settings';

const RegistrationToggle = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    settingsApi.getByKey('registration.enabled')
      .then(({ value }) => setIsEnabled(value))
      .catch(() => {
        // fail-open: default to enabled if fetch fails
        setIsEnabled(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = () => {
    const newValue = !isEnabled;
    setIsUpdating(true);
    setError(null);

    // Optimistic update
    setIsEnabled(newValue);

    settingsApi.update('registration.enabled', newValue)
      .then(() => {
        setIsUpdating(false);
      })
      .catch((err) => {
        // Revert on error
        setIsEnabled(!newValue);
        setError('No se pudo actualizar el estado. Intenta de nuevo.');
        setIsUpdating(false);
      });
  };

  return (
    <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-pink-50">
        <span className="text-xl">📋</span>
        <h3 className="font-semibold text-pink-800 text-[15px]">Registro de nuevas clientas</h3>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        {/* Description */}
        <p className="text-sm text-gray-500">
          Permití o bloqueá la creación de nuevas cuentas
        </p>

        {/* Toggle row */}
        <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-pink-50 border border-pink-100">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-pink-900">
              {isEnabled ? 'Registro abierto' : 'Registro cerrado'}
            </span>
            <span className="text-xs text-pink-500 mt-0.5">
              {isEnabled
                ? 'Nuevas clientas pueden registrarse.'
                : 'El registro de nuevas cuentas está bloqueado.'}
            </span>
          </div>

          <button
            onClick={handleToggle}
            disabled={isLoading || isUpdating}
            aria-label={isEnabled ? 'Cerrar registro' : 'Abrir registro'}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
              disabled:opacity-40 disabled:cursor-not-allowed
              ${isEnabled ? 'bg-pink-600 border-pink-600' : 'bg-gray-200 border-gray-200'}`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 -mt-0.5 -ml-0.5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out
                ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
            {(isLoading || isUpdating) && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full">
                <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </span>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border bg-red-50 border-red-200 text-sm text-red-700 animate-fade-in-down">
            <span className="shrink-0">❌</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationToggle;