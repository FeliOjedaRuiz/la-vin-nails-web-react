import React from "react";

function ButtonGreen({ children, styles }) {
  return (
    <button
      className={` flex items-center justify-center font-medium text-center text-lg px-3 py-1 rounded-md shadow text-white 
    bg-gradient-to-r from-emerald-800 via-emerald-500 to-emerald-800  hover:bg-green-700 focus:ring-4 focus:ring-pink-300 ${styles}`}
    >
      {children}
    </button>
  );
}

export default ButtonGreen;
