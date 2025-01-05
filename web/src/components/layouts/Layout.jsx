import React, { useContext, useEffect, useState } from "react";
import layoutLogo from "../../images/logo-la-vin-simplificado-3.webp";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthStore";

function Layout({ children }) {
  const { user } = useContext(AuthContext);
  const [role, setRole] = useState("guest");

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
        <Link to="/">
          <img
            src={layoutLogo}
            alt="logo la vin nails simplificado"
            className="h-8 m-2 "
          />
        </Link>
      </div>

      <div className="flex w-full justify-center relative pt-12 pb-16 min-h-screen bg-gradient-to-b from-pink-50 via-white to-green-50">
        <div className=" container w-screen flex flex-col  overflow-hidden bg-white/30 shadow-lg ">
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
              src="https://res.cloudinary.com/duoshgr3h/image/upload/v1723136075/Home_b3gm80.svg"
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
            <img src="https://res.cloudinary.com/duoshgr3h/image/upload/v1723136078/Services_d0amso.svg" alt="icono servicios" className="w-7 h-7" />
            <span className="text-sm text-pink-700 group-hover:text-pink-800">
              Servicios
            </span>
          </NavLink>

          {role === "guest" && (
            <NavLink
              to="/guest-schedule"
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-200"
            >
              <img src="https://res.cloudinary.com/duoshgr3h/image/upload/v1723136077/Schedule_qe0mgz.svg" alt="icono agenda" className="w-7 h-7" />
              <span className="text-sm text-pink-700 group-hover:text-pink-800">
                Agenda
              </span>
            </NavLink>
          )}

          {role === "admin" && (
            <NavLink
              to="/admin-schedule"
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-200"
            >
              <img src="https://res.cloudinary.com/duoshgr3h/image/upload/v1723136077/Schedule_qe0mgz.svg" alt="icono agenda" className="w-7 h-7" />
              <span className="text-sm text-pink-700 group-hover:text-pink-800">
                Agenda
              </span>
            </NavLink>
          )}

          {role === "guest" && (
            <NavLink
              to={`/profile`}
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-200"
            >
              <img src="https://res.cloudinary.com/duoshgr3h/image/upload/v1723136076/Profile_kkdy2j.svg" alt="icono perfil" className="w-7 h-7" />
              <span className="text-sm text-pink-700 group-hover:text-pink-800">
                Perfil
              </span>
            </NavLink>
          )}

          {role === "admin" && (
            <NavLink
              to={`/admin`}
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-200"
            >
              <img src="https://res.cloudinary.com/duoshgr3h/image/upload/v1723136076/Profile_kkdy2j.svg" alt="icono perfil" className="w-7 h-7" />
              <span className="text-sm text-pink-700 group-hover:text-pink-800">
                Admin
              </span>
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

export default Layout;
