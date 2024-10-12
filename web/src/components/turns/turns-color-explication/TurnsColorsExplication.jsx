import React from "react";

function TurnsColorsExplication() {
  return (
    <div className="w-full flex justify-center">
      <div className="flex justify-around w-full max-w-md my-4">
        <div className="flex items-center ">
          <div className="bg-pink-400 w-5 h-5 rounded mr-1.5"></div>
          <p>Disponible</p>
        </div>
        <div className="flex items-center ">
          <div className="bg-gray-400 w-5 h-5 rounded mr-1.5"></div>
          <p>Ocupado</p>
        </div>
      </div>
    </div>
  );
}

export default TurnsColorsExplication;
