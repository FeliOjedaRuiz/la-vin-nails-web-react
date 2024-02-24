import React from "react";

function ButtonGreen({ children, styles }) {
  return (
    <button
      className={` flex items-center justify-center font-medium text-center text-lg px-3 py-1 rounded-md shadow text-white 
    bg-gradient-to-r from-emerald-800 via-emerald-500 to-emerald-800 hover:bg-emerald-700 hover:ring-2 hover:ring-emerald-500 focus:ring-2 focus:ring-emerald-500 ${styles}`}
    >
      {children}
    </button>
  );
}

export default ButtonGreen;
