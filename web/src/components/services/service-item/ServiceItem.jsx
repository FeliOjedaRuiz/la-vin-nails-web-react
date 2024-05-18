import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import ButtonGreen from "../../butons/ButtonGreen";
import { AuthContext } from "../../../contexts/AuthStore";

function ServiceItem({ service }) {
  const [view, setView] = useState();
  const [box, setBox] = useState();
  const [bigBox, setBigBox] = useState();
  const [icon, setIcon] = useState();
  const { user } = useContext(AuthContext);
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
      <div className=" m-2 p-3 bg-white/60 border border-gray-200 rounded-lg shadow max-w-xl  md:max-w-xl">
        <div className="flex grid-flow-row mb-3">
          <img
            className="object-cover rounded h-36 w-36 "
            src={service.image}
            alt={service.name}
          />
          <div className="flex grow justify-center items-center">
            <div className="flex flex-col h-36 w-40 items-center justify-between pl-2 leading-normal">
              <h5 className=" text-lg mt-1 text-center leading-none font-bold tracking-tight text-pink-700">
                {service.name}
              </h5>
              <h6 className=" text-md text-center font-semibold italic tracking-tight text-emerald-600">
                desde €{service.price}
              </h6>
              <h6 className=" mb-1 text-xs text-center font-semibold tracking-tight text-pink-600">
                Duración: {service.dateDuration} hs. aprox.
              </h6>
              {user.role === "guest" && <NavLink to={`/new-date/${service.id}`}>
               
               <ButtonGreen ><p className="text-sm">Solicitar cita</p></ButtonGreen>
                
              </NavLink>}
              {user.role === "admin" && <NavLink to={`/new-date-admin/${service.id}`}>
               
               <ButtonGreen ><p className="text-sm">Solicitar cita</p></ButtonGreen>
                
              </NavLink>}
            </div>
          </div>
        </div>
        <div className={`${bigBox} border-gray-200 rounded`}>
          <div
            className={` ${box} flex justify-between items-center px-3 py-1 border-gray-200 rounded`}
            onClick={handleClick}
          >
            <h6 className=" text-base font-bold tracking-tight text-emerald-800 dark:text-white">
              Descripción:
            </h6>
            <svg
              className="w-4 h-4 text-emerald-600"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 8"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
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
