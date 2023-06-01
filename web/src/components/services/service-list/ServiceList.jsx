import React from 'react';
import ServiceItem from '../service-item/ServiceItem';


function ServiceList({ services }) {
  

  console.log(services)

  return (
    <>
      <div>
        {services.map((service) => (
          <ServiceItem service={service} />
        ))}    
      
        
      </div>
    </>
  )
}

export default ServiceList