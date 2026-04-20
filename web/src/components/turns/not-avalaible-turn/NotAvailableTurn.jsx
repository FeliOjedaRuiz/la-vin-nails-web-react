import React from "react";

function NotAvailableTurn() {
  return (
    <div className="flex flex-col justify-center items-center h-[160px] bg-gray-100 rounded mb-[2px] shadow-inner w-full">
      <p className="text-center font-medium text-[10px] md:text-xs leading-tight text-gray-500 px-0.5">
        No hay turnos disponibles este día.
      </p>
    </div>
  );
}

export default NotAvailableTurn;
