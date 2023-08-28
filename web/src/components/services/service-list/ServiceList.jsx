import React, { useEffect, useState } from "react";
import ServiceItem from "../service-item/ServiceItem";
import servicesService from "../../../services/services";

function ServiceList() {
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
    <>
      <div className="grid grid-cols-1 justify-center md:grid-cols-2 grid-flow-row">
        {services.map((service) => (
          <div key={service.id}>
            <ServiceItem service={service} />
          </div>
        ))}
      </div>
    </>
  );
}

export default ServiceList;
