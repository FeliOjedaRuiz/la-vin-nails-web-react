import React from 'react'

function DailyResults({ dates }) {
  let result = 0

  dates.forEach(date => {
    console.log(`Costo ${date.cost}`)
    if (date.cost) {
      result = result + date.cost
    }    
  });


  return (
    <div className='flex'>
    <p>ResultadosDiarios </p>
    <p>{result}</p>
    </div>
  )
}

export default DailyResults