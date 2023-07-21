import React, { useEffect, useState } from "react";

function TurnItemAdmin({ turn }) {
  const [bg, setBg] = useState("");
  const [textColor, setTextColor] = useState("");

  useEffect(() => {
    switch (turn.state) {
      case "Disponible":
        setBg("bg-white border border-green-500");
        setTextColor("text-black");
        break;
      case "Solicitado":
        setBg("bg-yellow-300");
        setTextColor("text-black");
        break;
      case "Confirmado":
        setBg("bg-green-500");
        setTextColor("text-white") 
        break;
      case "Cancelado":
        setBg("bg-red-600");
        setTextColor("text-white") 
        break;
      default:
        break;
    }
  }, [turn]);

  return (
    <div className={`mb-3 ${bg} rounded shadow-md py-0.5 px-1.5 flex-col`}>
      <p className={`text-center font-medium  text-xs truncate ${textColor}`}>{turn.hour} Hs. - Cristina Ruiz</p>
      <p className={`text-center font-medium  text-xs truncate ${textColor}`}>Soft Gel - €20</p>
    </div>
  );
}

export default TurnItemAdmin;
