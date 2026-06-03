import React, { useState } from 'react';

const statusConfig = {
  active: {
    label: 'Activo',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  waiting: {
    label: 'Actualización pendiente',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  installing: {
    label: 'Instalando...',
    color: 'text-pink-700',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    dot: 'bg-pink-500 animate-pulse',
  },
  none: {
    label: 'No registrado',
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
  unsupported: {
    label: 'No compatible',
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-300',
  },
};

/**
 * Card que muestra el estado del Service Worker y permite buscar actualizaciones.
 * @param {{ swStatus: string, isDevMode: boolean, checkForUpdate: Function, isCheckingUpdate: boolean }} props
 */
const PwaStatusCard = ({ swStatus, isDevMode, checkForUpdate, isCheckingUpdate }) => {
  const [updateFeedback, setUpdateFeedback] = useState(null);
  const config = statusConfig[swStatus] || statusConfig.none;

  const handleCheckUpdate = async () => {
    setUpdateFeedback(null);
    const { hasUpdate } = await checkForUpdate();
    if (!hasUpdate) {
      setUpdateFeedback('upToDate');
      setTimeout(() => setUpdateFeedback(null), 4000);
    }
    // Si hay update, UpdateBanner toma el control automáticamente
  };

  return (
    <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-pink-50">
        <span className="text-xl">📱</span>
        <h3 className="font-semibold text-pink-800 text-[15px]">Estado de la App</h3>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        {/* SW Status badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${config.bg} ${config.border}`}>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${config.dot}`} />
          <span className={`text-sm font-medium ${config.color}`}>
            Service Worker: {config.label}
          </span>
        </div>

        {/* Aviso modo desarrollo */}
        {isDevMode && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 animate-fade-in-down">
            <span className="shrink-0">⚠️</span>
            <span className="text-xs text-amber-700">
              Modo desarrollo — el Service Worker solo se activa en el build de producción. Las funciones de actualización y push no estarán disponibles en local.
            </span>
          </div>
        )}

        {/* Feedback de "al día" */}
        {updateFeedback === 'upToDate' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 animate-fade-in-down">
            <span className="text-emerald-600 text-base">✅</span>
            <span className="text-sm font-medium text-emerald-700">Estás al día — última versión activa.</span>
          </div>
        )}

        {/* Botón buscar actualización */}
        <button
          onClick={handleCheckUpdate}
          disabled={isCheckingUpdate || swStatus === 'unsupported' || isDevMode}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-pink-600 to-pink-700 text-white
            hover:from-pink-700 hover:to-pink-800 active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 shadow-sm shadow-pink-200"
        >
          {isCheckingUpdate ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Buscando...
            </>
          ) : (
            <>🔄 Buscar actualización</>
          )}
        </button>
      </div>
    </div>
  );
};

export default PwaStatusCard;
