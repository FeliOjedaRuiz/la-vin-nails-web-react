import React from 'react'

function ServiceMicroItem({ service }) {



  return (
    <div className="mx-2  w-36 bg-green-50 border border-gray-200 rounded-lg shadow ">
        
      <img
        className="rounded h-32 w-32 m-2 "
        src={service.image}
        alt={service.name}
      />
      
      <div className='w-36 h-8 overflow-hidden -mt-3'>
      <h5 className=" text-md text-center mt-2 font-bold text-pink-700">
        {service.name}
      </h5>
      </div>
      
      <h6 className="mb-2 text-sm text-center font-bold text-green-600">
        desde €{service.price}
      </h6>
      

    </div>
  )
}

export default ServiceMicroItem