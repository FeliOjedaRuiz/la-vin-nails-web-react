import React from 'react'

function DateDetail({ date }) {

  return (
    <div className='bg-white/50 p-3 mb-2 rounded-md shadow'>
      <p>Fecha: {date.turn.date}</p>
      <p>Hora: {date.turn.hour} hs.</p>
      <p>Cliente: {date.user.name} </p>
      <p>Servicio: {date.service.name} </p>
      <p>Tipo: {date.type} </p>
      <p>Detalles: {date.designDetails} </p>
    </div>
  )
}

export default DateDetail