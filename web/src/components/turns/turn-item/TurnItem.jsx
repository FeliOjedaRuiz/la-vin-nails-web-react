import React from 'react';

function TurnItem({ turn }) {
  return (
    <div className='mb-1 w-24 bg-white rounded-md flex-col'>
      <p className='text-center'> {turn.date} </p>
      <p className='text-center' >{turn.hour} Hs.</p>
    </div>
  )
}

export default TurnItem;