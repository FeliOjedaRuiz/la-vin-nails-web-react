import React from "react";
import { NavLink } from "react-router-dom";

function ServiceMicroItem({ service }) {
  return (
    <NavLink
      to={`/new-date/${service.id}`}
      className="m-2 lg:m-4 flex flex-col items-center bg-white  rounded-lg shadow-md hover:outline hover:outline-pink-700 "
    >
      <img
        className="w-fit rounded-t-lg"
        src={service.image}
        alt={service.name}
      />

      <div className="w-36 lg:w-44 h-11 lg:h-12 overflow-hidden  p-1 flex justify-center items-center">
        <h5 className=" text-sm lg:text-lg text-center font-semibold leading-4 lg:leading-5 text-pink-700">
          {service.name}
        </h5>
      </div>

      <h6 className="mb-1 text-sm italic lg:text-lg text-center font-medium text-emerald-600">
        desde €{service.price}
      </h6>
    </NavLink>
  );
}

export default ServiceMicroItem;
