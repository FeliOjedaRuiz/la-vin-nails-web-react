import React from "react";

function ButtonPrimary({ children, styles }) {
  return (
    <div
      className={`${styles}font-medium text-center text-lg px-3 py-1 self-center rounded-md shadow text-white
    bg-gradient-to-r from-emerald-500 via-teal-500 via-25%  to-pink-400  hover:bg-green-700 focus:ring-4 focus:ring-pink-300`}
    >
      {children}
    </div>
  );
}

export default ButtonPrimary;
