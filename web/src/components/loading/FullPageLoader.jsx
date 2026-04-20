import React from 'react';
import LoadingIcon from '../icons/LoadingIcon';

const FullPageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] w-full animate-in fade-in duration-500">
      <LoadingIcon className="w-12 h-12 animate-spin text-pink-600 mb-4" />
      <p className="text-pink-700 font-medium animate-pulse">Cargando...</p>
    </div>
  );
};

export default FullPageLoader;
