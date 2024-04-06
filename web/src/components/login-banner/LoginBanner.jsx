import React from "react";
import { NavLink } from "react-router-dom";
import ButtonPrimary from "../butons/ButtonPrimary";

function LoginBanner() {
  return (
    <div className="flex flex-col items-center px-4 py-10 md:py-14 overflow-hidden">
      <h1
        className="
        transition duration-1000 translate-x-96
      text-4xl md:text-5xl mb-3 relative right-96 font-extrabold text-center text-pink-600"
      >
        ¿Ya te registraste?
      </h1>
      <p className="mb-6 text-xl/6 md:text-2xl/7 text-center font-medium text-pink-800">
        Accede para agendar tu cita <br /> y conseguir descuentos.
      </p>

      <NavLink to="/login">
        <ButtonPrimary>Iniciar sesión</ButtonPrimary>
      </NavLink>
    </div>
  );
}

export default LoginBanner;
