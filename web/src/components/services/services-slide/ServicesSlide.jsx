import React, { useEffect, useState } from "react";
import servicesService from "../../../services/services";
import ServiceMicroItem from "../service-micro-item/ServiceMicroItem";

function ServicesSlide() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    servicesService
      .list()
      .then((services) => {
        setServices(services);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="border-y-2 border-pink-400">
      <h2 className="p-4 lg:p-6 mt-2 italic font-bold text-3xl lg:text-4xl text-emerald-600">
        Nuestros servicios
      </h2>
      <div className=" overflow-scroll bg-white/10  ">
        <div className="flex w-fit mx-2 mb-2  grid-flow-row">
          {services.map((service) => (
            <ServiceMicroItem service={service} key={service.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ServicesSlide;
