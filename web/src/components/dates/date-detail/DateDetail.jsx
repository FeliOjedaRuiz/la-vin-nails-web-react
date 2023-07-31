import React, { useEffect, useState } from 'react'

function DateDetail({ date }) {
  const [state, setState] = useState("");

  useEffect(() => {
    if (date.turn.state === "Solicitado") {
      setState("Aguardando confirmación...")      
    } else {
      setState(date.turn.state)
    }
  })

  return (
    <div className='bg-white/50 p-3 mb-2 rounded-md shadow'>
      <p>Fecha: {date.turn.date}</p>
      <p>Hora: {date.turn.hour} hs.</p>
      <p>Cliente: {date.user.name} </p>
      <p>Servicio: {date.service.name} </p>
      <p>Tipo: {date.type} </p>
      <p>Detalles: {date.designDetails} </p>
      <p>Estado: {state}</p>
    </div>
  )
}

export default DateDetail