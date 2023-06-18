import React from 'react'

function ServiceItem({ service }) {
  

  return (
    <>      
      <div className=" mx-1 mb-4 p-3 bg-gradient-to-b from-white to-gray-200 border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100">
          <div className='flex grid-flow-row mb-3'>
            <img className="object-cover rounded h-36 w-36 md:h-48 md:w-48" src={service.image} alt={service.name}/>
            <div className='flex grow justify-center'>
              <div className="flex flex-col h-36 w-40 items-center justify-between pl-2 leading-normal">
                  <h5 className=" text-2xl text-center mt-2 leading-none font-bold tracking-tight text-pink-700">{service.name}</h5>
                  <h6 className=" text-xl text-center font-bold tracking-tight text-green-600">desde €{service.price}</h6>
                  <button type="button" class="text-white bg-gradient-to-r from-teal-500 to-pink-600 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 font-medium w-32 rounded-lg text-md px-3 py-1.5 text-center mb-2">Solicitar cita</button>
              </div>
            </div>
            
          </div>
          <div>
          <h6 className=" text-base font-bold tracking-tight text-gray-900 dark:text-white">Descripción:</h6>  
          <p className=" text-xs font-normal text-gray-700 dark:text-gray-400">{service.description}</p>
            
            


          </div>
      </div>


      
        


      
     
    </>
  )
}

export default ServiceItem