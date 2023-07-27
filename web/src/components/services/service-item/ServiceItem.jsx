import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

function ServiceItem({ service }) {
  const [view, setView] = useState();
  const [box, setBox] = useState();
  const [bigBox, setBigBox] = useState();
  const [icon, setIcon] = useState();
  const visible = "visible";
  const hidden = "hidden";
  const active = "border";
  const inactive = "";
  const up = "M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7";
  const down = "m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1";

  useEffect(() => {
    setView(hidden);
    setBox(active);
    setBigBox(inactive);
    setIcon(down);
  }, []);

  const handleClick = () => {
    setView(view === hidden ? visible : hidden);
    setBox(box === active ? inactive : active);
    setBigBox(bigBox === active ? inactive : active);
    setIcon(icon === down ? up : down);
  };

  return (
    <>
      <div className=" mx-1 mb-5 p-3 bg-green-50 border border-gray-200 rounded-lg shadow max-w-xl  md:max-w-xl">
        <div className="flex grid-flow-row mb-3">
          <img
            className="object-cover rounded h-36 w-36 "
            src={service.image}
            alt={service.name}
          />
          <div className="flex grow justify-center">
            <div className="flex flex-col h-36 w-40 items-center justify-between pl-2 leading-normal">
              <h5 className=" text-2xl text-center mt-2 leading-none font-bold tracking-tight text-pink-700">
                {service.name}
              </h5>
              <h6 className=" text-xl text-center font-bold tracking-tight text-green-600">
                desde €{service.price}
              </h6>
              <h6 className=" text-sm text-center font-bold tracking-tight text-pink-600">
                Duración: 1h 30' aprox.
              </h6>
              <NavLink to={`/new-date/${service.id}`}>
              <button
                type="button"
                class="text-white shadow bg-gradient-to-l from-emerald-700 via-green-500 to-emerald-700  hover:bg-pink-600 focus:ring-4 focus:outline-none focus:ring-pink-200 font-medium w-32 rounded-lg text-md px-3 py-1.5 text-center mb-2"
              >
                Solicitar cita
              </button>
              </NavLink>
            </div>
          </div>
        </div>
        <div className={`${bigBox} border-gray-200 rounded`}>
          <div
            className={` ${box} flex justify-between items-center px-3 py-1 border-gray-200 rounded`}
            onClick={handleClick}
          >
            <h6 className=" text-base font-bold tracking-tight text-green-700 dark:text-white">
              Descripción:
            </h6>
            <svg
              class="w-4 h-4 text-pink-800"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 8"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d={`${icon}`}
              />
            </svg>
          </div>
          <p
            className={` ${view} text-md font-medium mx-3 whitespace-normal leading-snug mt-1 mb-3 text-pink-800 dark:text-gray-400`}
          >
            {service.description}
          </p>
        </div>
      </div>
    </>
  );
}

export default ServiceItem;
