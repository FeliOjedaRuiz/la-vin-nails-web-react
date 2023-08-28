import React from "react";
import { NavLink } from "react-router-dom";

function ServiceMicroItem({ service }) {
  return (
    <NavLink
      to={`/new-date/${service.id}`}
      className="mx-2 flex flex-col items-center w-36 bg-green-50  rounded-lg shadow hover:outline hover:outline-pink-700 "
    >
      <img
        className="h-36 w-36 mb-2 rounded-t-lg"
        src={service.image}
        alt={service.name}
      />

      <div className="w-36 h-12 overflow-hidden -mt-3 p-1 flex justify-center items-center">
        <h5 className=" text-md text-center mt-1 font-bold leading-none text-pink-700">
          {service.name}
        </h5>
      </div>

      <h6 className="mb-2 text-sm text-center font-medium text-green-600">
        desde €{service.price}
      </h6>
    </NavLink>
  );
}

export default ServiceMicroItem;
