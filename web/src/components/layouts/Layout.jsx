import React, { useContext, useEffect, useState } from "react";
import layoutLogo from "../../images/logo-la-vin-simplificado-3.png";
import homeIcon from "../../images/icono-home.png";
import servicesIcon from "../../images/icono-servicios.png";
import datesIcon from "../../images/icono-agenda.png";
import profileIcon from "../../images/icono-perfil.png";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthStore";

function Layout({ children }) {
  const { user } = useContext(AuthContext);
  const [role, setRole] = useState("");

  useEffect(() => {
    if (!user) {
      setRole("guest");
    } else {
      setRole(user.role);
    }
  }, [user]);

  return (
    <div className="flex flex-col">
      <div className="flex fixed z-10 w-screen justify-center bg-gradient-to-r from-pink-50 via-white to-green-50 border-b-2 border-pink-400 ">
        <img
          src={layoutLogo}
          alt="logo la vin nails simplificado"
          className="h-8 m-2 "
        />
      </div>

      <div className="flex w-full justify-center relative pt-12 pb-16 min-h-screen bg-gradient-to-b from-pink-50 via-white to-green-50">
        <div className=" container w-screen overflow-hidden bg-white/30 shadow-lg ">
          {children}
        </div>
      </div>


      <div className="fixed bottom-0 left-0  w-full h-16 bg-pink-50 border-t-2 border-pink-400">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
          <NavLink
            to="/"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-200"
          >
            <img
              src={homeIcon}
              alt="icono home"
              className="w-7 h-7 group-hover:text-purple-700 "
            />
            <span className="text-sm text-pink-700 group-hover:text-pink-700">
              Home
            </span>
          </NavLink>

          <NavLink
            to="/services"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-200"
          >
            <img src={servicesIcon} alt="icono servicios" className="w-7 h-7" />
            <span className="text-sm text-pink-700 group-hover:text-pink-800">
              Servicios
            </span>
          </NavLink>

          {role === "guest" && (
            <NavLink
              to="/my-schedule"
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-200"
            >
              <img src={datesIcon} alt="icono agenda" className="w-7 h-7" />
              <span className="text-sm text-pink-700 group-hover:text-pink-800">
                Agenda
              </span>
            </NavLink>
          )}

          {role === "admin" && (
            <NavLink
              to="/schedule"
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-200"
            >
              <img src={datesIcon} alt="icono agenda" className="w-7 h-7" />
              <span className="text-sm text-pink-700 group-hover:text-pink-800">
                Agenda
              </span>
            </NavLink>
          )}

          <NavLink
            to="/profile"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-200"
          >
            <img src={profileIcon} alt="icono perfil" className="w-7 h-7" />
            <span className="text-sm text-pink-700 group-hover:text-pink-800">
              Perfil
            </span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Layout;
