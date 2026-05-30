import React from "react";

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/**
 * Se muestra cuando un día pertenece a un mes cuya agenda aún no se ha abierto.
 * Se diferencia de NotAvailableTurn (días sin turnos en meses ya visibles) por:
 * - Color ámbar en vez de gris
 * - Mensaje informativo con la fecha de apertura
 *
 * @param {Date} openingDate — Primer día del mes en que se abre la agenda
 */
function AgendaNotAvailable({ openingDate }) {
  const monthName = months[openingDate.getMonth()];

  return (
    <div className="flex flex-col justify-center items-center h-[160px] bg-gray-100 rounded mb-[2px] shadow-inner w-full">
      <span 
        className="text-xl mb-1" 
        aria-hidden="true"
        style={{ filter: 'grayscale(100%)' }}
      >
        🔒
      </span>
      <p className="text-center font-medium text-[10px] md:text-xs leading-tight text-gray-500 px-1">
        Agenda no disponible hasta el 1 de {monthName}
      </p>
    </div>
  );
}

export default AgendaNotAvailable;
