import React, { useEffect, useState } from 'react';
import servicesService from '../../../services/services';
import ServiceMicroItem from '../service-micro-item/ServiceMicroItem';


function ServicesSlide() {
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
      
      <div className='pb-4 px-2 w-screen overflow-scroll bg-white/10 border-y-2 border-pink-400'>
        <div className='absolute ml-2 m-2 text-center font-bold text-xl text-green-700'>Servicios destacados</div>
        <div className='flex mt-11 grid-flow-row'>
        {services.map((service) => (
          <ServiceMicroItem service={service} />
        ))} 
        </div>
      </div>
    </>
  )
}

export default ServicesSlide