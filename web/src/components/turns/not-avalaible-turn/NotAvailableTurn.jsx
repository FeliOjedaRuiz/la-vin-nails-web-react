import React from "react";

function NotAvailableTurn() {
  return (
    <div className="text-center h-full flex items-center font-medium bg-gray-200 rounded-lg p-2 mb-2">
      <p className="text-balance">No hay turnos disponibles este día.</p>
    </div>
  );
}

export default NotAvailableTurn;
