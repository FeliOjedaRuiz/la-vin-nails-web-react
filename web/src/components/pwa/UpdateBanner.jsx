import React, { useState, useEffect } from "react";

const UpdateBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    const handleUpdate = (event) => {
      setSwRegistration(event.detail);
      setShowBanner(true);
    };

    window.addEventListener("pwaUpdate", handleUpdate);

    return () => {
      window.removeEventListener("pwaUpdate", handleUpdate);
    };
  }, []);

  const handleUpdateClick = () => {
    if (swRegistration && swRegistration.waiting) {
      // Envía el mensaje para que el SW se active e instale la nuev versión
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    setShowBanner(false);
    
    // Recargamos la página brevemente después para aplicar los cambios del caché
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-[104px] left-0 right-0 z-[100] px-4 w-full max-w-md mx-auto animate-fade-in-down transition-all duration-500">
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
            <img 
              src={`${process.env.PUBLIC_URL}/icons/icon-192x192.png`} 
              alt="La Vin Nails Actualización" 
              className="w-10 h-10 object-contain rounded-lg shadow-sm" 
            />
          </div>
          
          <div className="flex flex-col pt-1">
            <h3 className="text-gray-900 font-bold text-[15px] leading-tight mb-1">
              ¡Nueva versión disponible!
            </h3>
            
            <p className="text-gray-600 text-[13px] leading-snug">
              Hemos mejorado la aplicación. Actualiza ahora para disfrutar de las últimas novedades.
            </p>
          </div>
        </div>

        <button
          onClick={handleUpdateClick}
          className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 active:scale-[0.98] text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-pink-200 mt-1"
        >
          Actualizar Ahora 🔄
        </button>
      </div>
    </div>
  );
};

export default UpdateBanner;
