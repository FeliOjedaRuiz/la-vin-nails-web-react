import React from "react";
import ServiceItem from "../service-item/ServiceItem";
import { services } from "../LaVinServices/LaVinServices.js"

function ServiceList() {
  // TRAER SERVICIO DE BASE DE DATOS

  // const [services, setServices] = useState([]);

  // useEffect(() => {
  //   servicesService
  //     .list()
  //     .then((services) => {
  //       setServices(services);
  //     })
  //     .catch((error) => console.error(error));
  // }, []);

  return (
    <>
      <div className="grid grid-cols-1 justify-center md:grid-cols-2 xl:grid-cols-3 grid-flow-row">
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
