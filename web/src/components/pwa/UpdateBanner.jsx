import React, { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "pwa_update_dismiss_count";
const AUTO_TRIGGER_THRESHOLD = 3;

const UpdateBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [dismissCount, setDismissCount] = useState(0);
  const autoTriggeredRef = useRef(false);

  useEffect(() => {
    // Leer contador de rechazos previos
    try {
      const stored = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
      setDismissCount(stored);
    } catch {
      setDismissCount(0);
    }

    const handleUpdate = (event) => {
      setSwRegistration(event.detail);
      setShowBanner(true);
    };

    window.addEventListener("pwaUpdate", handleUpdate);

    return () => {
      window.removeEventListener("pwaUpdate", handleUpdate);
    };
  }, []);

  // Cuando el usuario cambia de pestaña y ya rechazó N veces, forzar actualización
  useEffect(() => {
    if (dismissCount < AUTO_TRIGGER_THRESHOLD || autoTriggeredRef.current || !swRegistration) return;

    const handleVisibilityChange = () => {
      if (document.hidden && swRegistration?.waiting) {
        autoTriggeredRef.current = true;
        swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
        setTimeout(() => window.location.reload(), 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [dismissCount, swRegistration]);

  const triggerUpdate = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    setShowBanner(false);
    setTimeout(() => window.location.reload(), 200);
  };

  const handleUpdateClick = () => {
    // Resetear contador al actualizar exitosamente
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    triggerUpdate();
  };

  const handleDismiss = () => {
    const newCount = dismissCount + 1;
    setDismissCount(newCount);
    try { localStorage.setItem(STORAGE_KEY, String(newCount)); } catch { /* ignore */ }
    setShowBanner(false);

    // Si ya rechazó muchas veces, forzar al cambiar de pestaña
    if (newCount >= AUTO_TRIGGER_THRESHOLD && swRegistration?.waiting) {
      autoTriggeredRef.current = false; // allow auto-trigger
    }
  };

  if (!showBanner) return null;

  const isEscalated = dismissCount >= AUTO_TRIGGER_THRESHOLD;

  return (
    <div className="fixed top-[104px] left-0 right-0 z-[100] px-4 w-full max-w-md mx-auto animate-fade-in-down transition-all duration-500">
      <div className={`relative overflow-hidden rounded-2xl p-4 flex flex-col gap-3 shadow-lg border ${
        isEscalated
          ? "bg-gradient-to-br from-rose-600 to-pink-700 border-rose-400"
          : "bg-white/95 backdrop-blur-md border-pink-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
      }`}>

        {/* Barra superior decorativa */}
        <div className={`absolute top-0 left-0 w-full h-1 ${
          isEscalated ? "bg-rose-400" : "bg-gradient-to-r from-pink-400 to-rose-600"
        }`}></div>

        <button
          onClick={handleDismiss}
          className={`absolute top-3 right-3 rounded-full p-1 transition-colors ${
            isEscalated ? "text-rose-200 hover:text-white hover:bg-white/20" : "text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
          }`}
          aria-label="Cerrar notificación"
        >
          <svg className="w-4 h-4" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="flex items-start gap-4 pr-4">
          <div className={`shrink-0 p-2 rounded-xl border ${
            isEscalated ? "bg-rose-500/30 border-rose-400/40" : "bg-pink-50 border-pink-100"
          }`}>
            <img
              src={`${process.env.PUBLIC_URL}/icons/icon-192x192.png`}
              alt="La Vin Nails"
              className="w-10 h-10 object-contain rounded-lg shadow-sm"
            />
          </div>

          <div className="flex flex-col pt-1">
            <h3 className={`font-bold text-[15px] leading-tight mb-1 ${
              isEscalated ? "text-white" : "text-gray-900"
            }`}>
              {isEscalated ? "⚠️ Actualización obligatoria" : "¡Nueva versión disponible!"}
            </h3>
            <p className={`text-[13px] leading-snug ${
              isEscalated ? "text-rose-100" : "text-gray-600"
            }`}>
              {isEscalated
                ? "Esta versión tiene mejoras importantes. Se actualizará automáticamente al cambiar de pestaña."
                : "Hemos mejorado la aplicación. Actualiza ahora para disfrutar de las últimas novedades."
              }
            </p>
          </div>
        </div>

        <button
          onClick={handleUpdateClick}
          className={`w-full font-bold py-2.5 rounded-xl text-sm transition-all shadow-md mt-1 ${
            isEscalated
              ? "bg-white text-rose-700 hover:bg-rose-50 active:scale-[0.98]"
              : "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 active:scale-[0.98] text-white shadow-pink-200"
          }`}
        >
          Actualizar Ahora 🔄
        </button>
      </div>
    </div>
  );
};

export default UpdateBanner;
