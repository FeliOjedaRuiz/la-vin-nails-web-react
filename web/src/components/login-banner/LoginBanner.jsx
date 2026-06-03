import React from "react";
import { NavLink } from "react-router-dom";
import ButtonPrimary from "../butons/ButtonPrimary";

function LoginBanner() {
  return (
    <div className="flex flex-col items-center px-4 py-10 md:py-14 overflow-hidden">
      <h1
        className="
        transition duration-1000 translate-x-96
      text-2xl md:text-3xl mb-2 relative right-96 font-bold text-center text-pink-600"
      >
        ¿Ya eres clienta?
      </h1>
      <p className="mb-6 text-base md:text-lg text-center font-medium text-pink-800">
        Accede para agendar tu cita.
      </p>

      <NavLink to="/login">
        <ButtonPrimary>Iniciar sesión</ButtonPrimary>
      </NavLink>
    </div>
  );
}

export default LoginBanner;
