import React from 'react';

const permissionLabels = {
  granted: { label: 'Permitido', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  denied: { label: 'Bloqueado', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  default: { label: 'Sin definir', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
};

/**
 * Card que controla las notificaciones push del admin.
 * Permite activar/desactivar la suscripción y enviar una notificación de prueba.
 *
 * @param {{
 *   pushSupported: boolean,
 *   pushPermission: string|null,
 *   isSubscribed: boolean,
 *   isTogglingPush: boolean,
 *   togglePush: Function,
 *   sendTestNotification: Function,
 *   isSendingTest: boolean,
 *   testResult: {success: boolean, message: string}|null,
 * }} props
 */
const PushSettingsCard = ({
  pushSupported,
  pushPermission,
  isSubscribed,
  isTogglingPush,
  togglePush,
  sendTestNotification,
  isSendingTest,
  testResult,
  isDevMode,
}) => {
  const permConfig = permissionLabels[pushPermission] || permissionLabels.default;

  if (!pushSupported) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-50">
          <span className="text-xl">🔔</span>
          <h3 className="font-semibold text-gray-400 text-[15px]">Notificaciones Push</h3>
        </div>
        <p className="px-4 py-4 text-sm text-gray-400">
          Este navegador no soporta notificaciones push.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-pink-50">
        <span className="text-xl">🔔</span>
        <h3 className="font-semibold text-pink-800 text-[15px]">Notificaciones Push</h3>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        {/* Permiso del navegador */}
        {pushPermission && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${permConfig.bg} ${permConfig.border}`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${permConfig.dot}`} />
            <span className={`text-sm font-medium ${permConfig.color}`}>
              Permiso: {permConfig.label}
            </span>
          </div>
        )}

        {/* Toggle ON/OFF */}
        <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-pink-50 border border-pink-100">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-pink-900">
              {isSubscribed ? 'Activas en este dispositivo' : 'Desactivadas en este dispositivo'}
            </span>
            <span className="text-xs text-pink-500 mt-0.5">
              {isSubscribed
                ? 'Recibirás alertas de nuevas reservas.'
                : 'No recibirás alertas de nuevas reservas.'}
            </span>
          </div>

          <button
            onClick={togglePush}
            disabled={isTogglingPush || pushPermission === 'denied' || isDevMode}
            aria-label={isSubscribed ? 'Desactivar notificaciones' : 'Activar notificaciones'}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
              disabled:opacity-40 disabled:cursor-not-allowed
              ${isSubscribed ? 'bg-pink-600 border-pink-600' : 'bg-gray-200 border-gray-200'}`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 -mt-0.5 -ml-0.5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out
                ${isSubscribed ? 'translate-x-5' : 'translate-x-0'}`}
            />
            {isTogglingPush && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </span>
            )}
          </button>
        </div>

        {/* Permiso bloqueado — aviso */}
        {pushPermission === 'denied' && (
          <p className="text-xs text-red-500 px-1">
            El permiso está bloqueado en el navegador. Para activarlo, entrá en la configuración del sitio y cambiá el permiso de notificaciones manualmente.
          </p>
        )}

        {/* Botón probar notificación */}
        <button
          onClick={sendTestNotification}
          disabled={isSendingTest || !isSubscribed || isDevMode}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
            border-2 border-pink-600 text-pink-700
            hover:bg-pink-50 active:scale-[0.98]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200"
        >
          {isSendingTest ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Enviando...
            </>
          ) : (
            <>🔔 Probar notificación</>
          )}
        </button>

        {/* Resultado del test */}
        {testResult && (
          <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-sm animate-fade-in-down
            ${testResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <span className="shrink-0">{testResult.success ? '✅' : '❌'}</span>
            <span>{testResult.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PushSettingsCard;
