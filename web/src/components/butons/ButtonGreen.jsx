import React from "react";

function ButtonGreen({ children, styles }) {
  return (
    <button
      className={`${styles} flex m-1 font-medium text-center text-lg px-3 py-1 self-center rounded-md shadow text-white 
    bg-gradient-to-r from-emerald-800 via-emerald-500 to-emerald-800  hover:bg-green-700 focus:ring-4 focus:ring-pink-300`}
    >
      {children}
    </button>
  );
}

export default ButtonGreen;
