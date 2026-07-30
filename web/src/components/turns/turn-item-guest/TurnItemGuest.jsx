import React from "react";

function TurnItemGuest({ turn, onTurnSelection, isSelected }) {
  const isAvailable = turn.state === "Disponible";
  const isRetiro = turn.category === "retiro";

  const style = isAvailable
    ? (isSelected
        ? (isRetiro
            ? "bg-violet-600 text-white ring-2 ring-violet-400 scale-105 shadow-md transition-all font-bold cursor-pointer z-10"
            : "bg-emerald-600 text-white ring-2 ring-emerald-400 scale-105 shadow-md transition-all font-bold cursor-pointer z-10")
        : (isRetiro
            ? "bg-violet-400 text-white active:scale-95 transition-transform cursor-pointer"
            : "bg-pink-400 text-white active:scale-95 transition-transform cursor-pointer"))
    : "bg-gray-300 text-gray-700 opacity-90 cursor-not-allowed";

  const handleClick = (e) => {
    // Evitamos propagación solo por seguridad en el carrusel
    e.stopPropagation();
    if (isAvailable && onTurnSelection) {
      onTurnSelection(turn);
    }
  };

  return (
    <div
      className={`mb-0.5 ${style} rounded shadow-sm py-[2px] flex-col`}
      onClick={handleClick}
    >
      <p className={`text-center font-medium text-[10px] md:text-xs leading-[14px] truncate`}>
        {turn.hour} hs.
      </p>
    </div>
  );
}

export default React.memo(TurnItemGuest);
