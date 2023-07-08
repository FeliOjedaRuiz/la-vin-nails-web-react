import React from 'react'

function ServiceMicroItem({ service }) {



  return (
    <div className="mx-2 flex flex-col items-center w-36 bg-green-50  rounded-lg shadow hover:outline hover:outline-pink-700 ">
        
      <img
        className="h-36 w-36 mb-2 rounded-t-lg"
        src={service.image}
        alt={service.name}
      />
      
      <div className='w-36 h-8 overflow-hidden -mt-3'>
      <h5 className=" text-md text-center mt-2 font-bold text-pink-700">
        {service.name}
      </h5>
      </div>
      
      <h6 className="mb-2 text-sm text-center font-medium text-green-600">
        desde €{service.price}
      </h6>
      

    </div>
  )
}

export default ServiceMicroItem