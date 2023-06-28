import React from 'react';
import ServiceItem from '../service-item/ServiceItem';


function ServiceList({ services }) {

 

  return (
    <>
      
      <div className='pb-16 grid grid-cols-1 justify-center md:grid-cols-2 grid-flow-row'>
        {services.map((service) => (
          <ServiceItem service={service} />
        ))}    
      
        
      </div>
    </>
  )
}

export default ServiceList