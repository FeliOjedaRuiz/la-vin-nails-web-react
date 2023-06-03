import React from 'react'
import { NavLink } from 'react-router-dom'

function ServiceItem({ service }) {
  return (
    <>      
      <NavLink class="flex items-center m-3 bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100">
          <img class="object-cover rounded-l-lg h-28 w-28 md:h-auto md:w-48 md:rounded-none md:rounded-l-lg" src={service.image} alt=""/>
          <div class="flex flex-col justify-between p-4 leading-normal">
              <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{service.name}</h5>
              <p class="mb-3 text-xs font-normal text-gray-700 dark:text-gray-400"></p>
          </div>
      </NavLink>
    </>
  )
}

export default ServiceItem