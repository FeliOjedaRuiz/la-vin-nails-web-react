import React, { useEffect, useState } from "react";

function TurnItemGuest({ turn }) {
  const [bg, setBg] = useState("");
  const [textColor, setTextColor] = useState("");
  const id = turn.id


  useEffect(() => {
    switch (turn.state) {
      case "Disponible":
        setBg("bg-green-500");
        setTextColor("text-white");
        break;
      case "Solicitado":
        setBg("bg-gray-300");
        setTextColor("text-black");
        break;
      case "Confirmado":
        setBg("bg-gray-300");
        setTextColor("text-black");
        break;
      case "Cancelado":
        setBg("bg-green-500");
        setTextColor("text-white");
        break;
      default:
        break;
    }
  }, [turn]);

  return (
    
      <div className={`mb-1.5 ${bg} rounded shadow py-0.5 px-1.5 flex-col`}>
        <p className={`text-center font-medium  text-md truncate ${textColor}`}>{turn.hour} Hs.</p>
      </div>
    
  );
}

export default TurnItemGuest;