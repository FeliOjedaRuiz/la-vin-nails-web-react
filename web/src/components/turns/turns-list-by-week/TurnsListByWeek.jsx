import React, { useEffect, useState } from 'react';
import { HonestWeekPicker } from '../../week-picker/week-picker-js/HonestWeekPicker';
import turnsService from '../../../services/turns';
import TurnItem from '../turn-item/TurnItem';


function TurnsListByWeek() {
  const [initDate, setInitDate] = useState()
  const [finalDate, setFinalDate] = useState()

  const onInitDate = (date) => {
    setInitDate(date)
  }

  const onFinalDate = (date) => {
    setFinalDate(date)
  }

  const [week, setWeek] = useState({ firstDay: "02-02-2022" });

  const onChange = (week) => {
    setWeek(week);
  };
  
 

  const [turns, setTurns] = useState([]);

  useEffect(() => {
    turnsService.list()
      .then((turns) => {
        console.log(`filtro Ini: ${initDate} Fin: ${finalDate}`)
        const weekTurns = turns.filter(turn => turn.date >= initDate && turn.date <= finalDate)
        setTurns(weekTurns)        
      })
      .catch(error => console.error(error));
  }, [initDate]); 

  console.log(turns)
  

  return (
    <div>
    
    <HonestWeekPicker onChange={onChange} onInitDate={onInitDate} onFinalDate={onFinalDate} />

    <div>
    {turns.map((turn) => (
          <TurnItem turn={turn} />
        ))}
    </div>

    
      
    </div>
  )
}

export default TurnsListByWeek