import React from 'react';
import ServiceItem from '../service-item/ServiceItem';


function ServiceList({ services }) {

 

  return (
    <>
      
      <div className='pb-16'>
        {services.map((service) => (
          <ServiceItem service={service} />
        ))}    
      
        
      </div>
    </>
  )
}

export default ServiceList