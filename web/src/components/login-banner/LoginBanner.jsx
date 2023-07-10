import React from "react";
import { NavLink } from "react-router-dom";

function LoginBanner() {
  return (
    <div className="flex flex-col items-center px-4 py-6 overflow-hidden">
      <h1
        className="
        transition duration-1000 translate-x-96
      text-4xl mb-3 relative right-96 font-extrabold text-center text-pink-600"
      >
        ¿Ya te registraste?
      </h1>
      <p className="mb-6 text-xl/5 text-center font-medium text-pink-800">
        Accede para agendar tu cita <br /> y conseguir descuentos.
      </p>
      <NavLink
        to="/login"
        className="font-medium mx-5 text-center text-lg w-32 py-1.5 self-center rounded-md shadow text-white
        bg-gradient-to-r from-green-600 from-5% via-teal-500 via-40% to-pink-500 hover:bg-green-700 focus:ring-4 focus:ring-pink-300"
      >
        {"Inicia sesión"}
      </NavLink>
    </div>
  );
}

export default LoginBanner;
