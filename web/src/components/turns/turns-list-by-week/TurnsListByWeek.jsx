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
        const weekTurns = turns.filter(turn => turn.date >= initDate && turn.date <= finalDate)
        setTurns(weekTurns)        
      })
      .catch(error => console.error(error));
  }, [initDate]); 

  // console.log(turns)
  // console.log(`filtro Ini: ${initDate} Fin: ${finalDate}`)

  // const dayStr = new Date(initDate)
  // const utcDay = Date.parse(initDate)

  const dia = new Date(Date.parse(initDate))
 

  const transformDate = (date) => {    
    let dt = new Date(date);
    const year = dt.getFullYear()
    let month = dt.getMonth() +1
    let day = dt.getDate()

    if (month < 10) {
      month = "0"+month
    }

    if (day < 10){
      day = "0"+day
    }

    return `${year}-${month}-${day}`;
  };

  const secondDay = transformDate(dia.setDate(dia.getDate() + 1))
  const thirdDay = transformDate(dia.setDate(dia.getDate() + 2))
  const fourthDay = transformDate(dia.setDate(dia.getDate() + 3))
  const fifthDay = transformDate(dia.setDate(dia.getDate() + 4))
  const sixthDay = transformDate(dia.setDate(dia.getDate() + 5))

  console.log(`Semana: ${initDate} - ${secondDay} - ${thirdDay}`)
  
  

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