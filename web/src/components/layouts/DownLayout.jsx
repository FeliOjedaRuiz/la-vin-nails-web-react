import React from "react";
import homeIcon from "../../images/icono-home.png";
import servicesIcon from "../../images/icono-servicios.png";
import datesIcon from "../../images/icono-agenda.png";
import profileIcon from "../../images/icono-perfil.png";

function DownLayout() {
  return (
    <>
      <div class="fixed bottom-0 left-0 z-50 w-full h-20 bg-pink-50 border-t-2 border-pink-400">
        <div class="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
          <button
            type="button"
            class="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-100"
          >
            <img src={homeIcon} alt="icono home" className="w-10 h-10 mb-1" />
            <span class="text-sm text-pink-700 group-hover:text-pink-800">
              Home
            </span>
          </button>
          <button
            type="button"
            class="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-100"
          >
            <img src={servicesIcon} alt="icono servicios" className="w-10 h-10 mb-1" />
            <span class="text-sm text-pink-700 group-hover:text-pink-800">
              Servicios
            </span>
          </button>
          <button
            type="button"
            class="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-100"
          >
            <img src={datesIcon} alt="icono agenda" className="w-10 h-10 mb-1" />
            <span class="text-sm text-pink-700 group-hover:text-pink-800">
              Agenda
            </span>
          </button>
          <button
            type="button"
            class="inline-flex flex-col items-center justify-center px-5 hover:bg-pink-100"
          >
            <img src={profileIcon} alt="icono perfil" className="w-10 h-10 mb-1" />
            <span class="text-sm text-pink-700 group-hover:text-pink-800">
              Perfil
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

export default DownLayout;
