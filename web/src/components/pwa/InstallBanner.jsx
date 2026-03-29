import React, { useState, useEffect } from "react";

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detect if it's already installed (standalone moded)
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    if (isInStandaloneMode) {
      setIsStandalone(true);
      return; 
    }

    // 2. Check if the user dismissed it this session
    const isDismissed = sessionStorage.getItem("pwa_install_dismissed");
    if (isDismissed) {
      return;
    }

    // 3. Detect iOS webkit
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

    if (isIosDevice) {
      setIsIOS(true);
      // Retrasar la aparición ligeramente para no abrumar en primera carga
      setTimeout(() => setShowBanner(true), 2500);
    }

    // 4. Listen for Chrome/Android generic beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Evitar el mini-infobar automático
      setDeferredPrompt(e); // Guardar evento
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Mostrar prompt nativo del SO
    deferredPrompt.prompt();
    
    // Esperar elección
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("PWA Instalada");
    }
    
    // Limpiar prompt (solo se puede usar una vez)
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_install_dismissed", "true");
    setShowBanner(false);
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className="fixed top-12 left-0 right-0 z-[100] px-4 w-full max-w-md mx-auto animate-fade-in-down transition-all duration-500">
      <div className="bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-pink-100 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
        
        {/* Decoración superior */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-rose-600"></div>

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full p-1 transition-colors"
          aria-label="Cerrar notificación"
        >
          <svg className="w-4 h-4" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="flex items-start gap-4 pr-4">
          <div className="shrink-0 bg-pink-50 p-2 rounded-xl border border-pink-100">
            <img src={`${process.env.PUBLIC_URL}/icons/icon-192x192.png`} alt="La Vin Nails Icon" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
          </div>
          
          <div className="flex flex-col pt-1">
            <h3 className="text-gray-900 font-bold text-[15px] leading-tight mb-1">
              Instala la App Oficial
            </h3>
            
            <p className="text-gray-600 text-[13px] leading-snug">
              {isIOS ? (
                <span>
                  Para una experiencia premium y nativa gestionando tus citas, toca{" "}
                  <svg className="w-[18px] h-[18px] inline-block mx-[2px] mb-[2px] text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>{" "}
                  y selecciona <strong>"Añadir a inicio"</strong>.
                </span>
              ) : (
                "Acceso directo y ultra-rápido a todos nuestros servicios de belleza desde tu pantalla."
              )}
            </p>
          </div>
        </div>

        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 active:scale-[0.98] text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-pink-200 mt-1"
          >
            Obtener la Aplicación 🚀
          </button>
        )}
      </div>
    </div>
  );
};

export default InstallBanner;
