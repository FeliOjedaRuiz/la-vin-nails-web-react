import React from "react";
import homeIcon from "../../images/icono-home.png";
import servicesIcon from "../../images/icono-servicios.png";
import datesIcon from "../../images/icono-agenda.png";
import profileIcon from "../../images/icono-perfil.png";
import { NavLink } from "react-router-dom";

function DownLayout() {
  return (
    <>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-pink-50 border-t-2 border-pink-400">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
          <NavLink
            to="/"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-100"
          >
            <img src={homeIcon} alt="icono home" className="w-7 h-7 mb-1" />
            <span className="text-xs text-pink-700 group-hover:text-pink-800">
              Home
            </span>
          </NavLink>

          <NavLink
            to="/services"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-100"
          >
            <img
              src={servicesIcon}
              alt="icono servicios"
              className="w-7 h-7 mb-1"
            />
            <span className="text-xs text-pink-700 group-hover:text-pink-800">
              Servicios
            </span>
          </NavLink>

          <NavLink
            to="/schedule"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-100"
          >
            <img src={datesIcon} alt="icono agenda" className="w-7 h-7 mb-1" />
            <span className="text-xs text-pink-700 group-hover:text-pink-800">
              Agenda
            </span>
          </NavLink>

          <NavLink
            to="/profile"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-100"
          >
            <img
              src={profileIcon}
              alt="icono perfil"
              className="w-7 h-7 mb-1"
            />
            <span className="text-xs text-pink-700 group-hover:text-pink-800">
              Perfil
            </span>
          </NavLink>
        </div>
      </div>
    </>
  );
}

export default DownLayout;
