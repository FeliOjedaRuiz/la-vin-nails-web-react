import React from "react";

function TurnsColorsExplication() {
  return (
    <div className="w-full flex justify-center">
      <div className="flex justify-around w-full max-w-md my-1">
        <div className="flex items-center ">
          <div className="bg-pink-400 w-3.5 h-3.5 rounded mr-1.5"></div>
          <p className="text-sm font-medium text-gray-700">Disponible</p>
        </div>
        <div className="flex items-center ">
          <div className="bg-gray-400 w-3.5 h-3.5 rounded mr-1.5"></div>
          <p className="text-sm font-medium text-gray-700">Ocupado</p>
        </div>
        <div className="flex items-center ">
          <div className="bg-violet-400 w-3.5 h-3.5 rounded mr-1.5"></div>
          <p className="text-sm font-medium text-gray-700">Retiro</p>
        </div>
      </div>
    </div>
  );
}

export default TurnsColorsExplication;
