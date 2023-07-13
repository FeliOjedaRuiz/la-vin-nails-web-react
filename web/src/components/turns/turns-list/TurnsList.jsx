import React, { useEffect, useState } from 'react';
import turnsService from '../../../services/turns';
import TurnItem from '../turn-item/TurnItem';

function TurnsList() {
  const [turns, setTurns] = useState([]);

  useEffect(() => {
    turnsService.list()
      .then((turns) => {
        setTurns(turns)        
      })
      .catch(error => console.error(error));
  }, [turns]);


  return (
    <>      
      <div className='grid grid-cols-1 justify-center md:grid-cols-2 grid-flow-row'>
        {turns.map((turn) => (
          <TurnItem turn={turn} />
        ))}
      </div>
    </>
  )
}

export default TurnsList