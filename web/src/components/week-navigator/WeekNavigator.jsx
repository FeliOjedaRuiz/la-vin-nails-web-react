import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const WeekNavigator = ({ currentWeek, onPrev, onNext, disablePrev = false, disableNext = false }) => {
  if (!currentWeek?.firstDay) return null;

  const formatDate = (dateString) => {
    return format(new Date(dateString), "d 'de' MMMM", { locale: es });
  };

  return (
    <div className="flex items-center justify-between w-full bg-white/50 border-2 border-emerald-500 rounded-full shadow-md px-4 py-2 my-2 text-emerald-800 font-bold">
      <button 
        type="button"
        onClick={disablePrev ? undefined : onPrev}
        disabled={disablePrev}
        className={`p-2 rounded-full transition-colors ${
          disablePrev
            ? "text-gray-300 cursor-not-allowed"
            : "text-emerald-600 hover:bg-emerald-100 active:scale-95"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex flex-col items-center">
        <p className="text-xs uppercase text-emerald-600 -mb-1 opacity-80">Semana seleccionada</p>
        <p className="text-center text-sm md:text-base select-none">
          {formatDate(currentWeek.firstDay)} al {formatDate(currentWeek.lastDay)}
        </p>
      </div>

      <button 
        type="button"
        onClick={disableNext ? undefined : onNext}
        disabled={disableNext}
        className={`p-2 rounded-full transition-colors ${
          disableNext
            ? "text-gray-300 cursor-not-allowed"
            : "text-emerald-600 hover:bg-emerald-100 active:scale-95"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default WeekNavigator;

