import React, { useEffect, useState } from "react";

function TurnItem({ turn }) {
  const [bg, setBg] = useState("");
  const [textColor, setTextColor] = useState("");

  useEffect(() => {
    switch (turn.state) {
      case "Disponible":
        setBg("bg-green-600 hover:animate-bounce hover:bg-lime-600");
        setTextColor("text-white");
        break;
      case "Solicitado":
        setBg("bg-gray-400/50");
        setTextColor("text-gray-400");
        break;
      case "Confirmado":
        setBg("bg-gray-400/50");
        setTextColor("text-gray-400") 
        break;
      case "Cancelado":
        setBg("bg-green-600 hover:animate-bounce hover:bg-lime-600");
        setTextColor("text-white") 
        break;
      default:
        break;
    }
  }, [turn]);

  return (
    <div className={`mb-3 ${bg} rounded-md shadow-md p-0.5 flex-col`}>
      <p className={`text-center font-bold ${textColor}`}>{turn.hour} Hs.</p>
    </div>
  );
}

export default TurnItem;
