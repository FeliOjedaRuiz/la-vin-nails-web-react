import React, { useEffect, useState } from 'react';
import servicesService from '../../../services/services';
import ServiceMicroItem from '../service-micro-item/ServiceMicroItem';


function ServicesCarrusel() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    servicesService.list()
      .then((services) => {
        setServices(services)        
      })
      .catch(error => console.error(error));
  }, []);

 

  return (
    <>
      
      <div className='py-4 px-2 w-screen overflow-scroll'>
        <div className='flex grid-flow-row'>
        {services.map((service) => (
          <ServiceMicroItem service={service} />
        ))} 
        </div>
      </div>
    </>
  )
}

export default ServicesCarrusel