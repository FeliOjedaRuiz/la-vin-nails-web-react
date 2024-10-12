import React, { useEffect, useState } from "react";

function TurnItemGuest({ turn, onTurnSelection }) {
  const [style, setStyle] = useState("");
  const [isAvalaible, setIsAvalaible] = useState(false)
  const handleClick = () => {
    if (turn.state === "Disponible") {
      onTurnSelection(turn);
    }
  };

  useEffect(() => {
    if (turn.state === "Disponible") {
      setStyle(
        "bg-pink-400 text-white hover:animate-bounce hover:ring hover:ring-lime-400 "
      ); 
      setIsAvalaible(true)     
    } else {
      setStyle("bg-gray-300 text-gray-400");
      setIsAvalaible(false) 
    }
  }, [turn]);

  return (
    <div
      className={`mb-1.5 ${style} rounded shadow py-0.5 px-1.5 xl:py-1.5 xl:px-2 flex-col`}
      onClick={handleClick}
    >
      <p className={`text-center font-medium text-xs md:text-lg xl:text-xl truncate`}>
        {turn.hour} Hs. {!isAvalaible && ("OCUPADO")}
      </p>
    </div>
  );
}

export default TurnItemGuest;
