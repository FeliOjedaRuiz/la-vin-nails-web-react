import React, { useEffect, useState } from 'react';
import turnsService from '../../../services/turns';
import { useParams } from "react-router-dom";

function TurnDetailCard() {
  const { id } = useParams();
  const [turn, setTurn] = useState({})  

  useEffect(() => {
    turnsService.detail(id)
      .then((turn) => {
        setTurn(turn)        
      })
      .catch(error => console.error(error));
  }, [id]);

  console.log(`XX ${turn}`)

  return (
    <div className='bg-white/50 rounded-md p-3 shadow'>
      <p>{turn.date} | {turn.hour} Hs.</p>
      <p>Estado: {turn.state}</p>
    </div>

  )
}

export default TurnDetailCard