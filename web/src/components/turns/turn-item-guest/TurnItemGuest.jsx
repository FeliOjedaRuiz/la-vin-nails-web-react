import React, { useEffect, useState } from "react";

function TurnItemGuest({ turn }) {
  const [style, setStyle] = useState("");
  const id = turn.id


  useEffect(() => {
    switch (turn.state) {
      case "Disponible":
        setStyle("bg-green-500 text-white hover:animate-bounce hover:ring hover:ring-lime-400 ");
        break;
      case "Solicitado":
        setStyle("bg-gray-300 text-gray-400");
        break;
      case "Confirmado":
        setStyle("bg-gray-300 text-gray-400");
        break;
      case "Cancelado":
        setStyle("bg-green-500 text-white hover:animate-bounce hover:ring hover:ring-lime-400 ");
        break;
      default:
        break;
    }
  }, [turn]);

  return (
    
      <div className={`mb-1.5 ${style} rounded shadow py-0.5 px-1.5 flex-col`}>
        <p className={`text-center font-medium  text-md truncate`}>{turn.hour} Hs.</p>
      </div>
    
  );
}

export default TurnItemGuest;