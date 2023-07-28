import React, { useContext, useEffect, useState } from 'react';
import turnsService from "../../../services/turns";
import TurnItemAdmin from '../turn-item-admin/TurnItemAdmin';
import TurnItemGuest from '../turn-item-guest/TurnItemGuest';
import { AuthContext } from '../../../contexts/AuthStore';


function TurnListByWeek({ initDate, reload }) {
  const [turns, setTurns] = useState([]);
  const { user } = useContext(AuthContext)
  const role = user.role

  const transformDate = (date) => {
    let dt = new Date(date);
    let year = dt.getFullYear();
    let month = dt.getMonth() + 1;
    let day = dt.getDate();

    if (month < 10) {
      month = "0" + month;
    }

    if (day < 10) {
      day = "0" + day;
    }

    return `${year}-${month}-${day}`;
  };

  const day = new Date(Date.parse(initDate));
  const secondDay = transformDate(day.setDate(day.getDate() + 1));
  const thirdDay = transformDate(day.setDate(day.getDate() + 1));
  const fourthDay = transformDate(day.setDate(day.getDate() + 1));
  const fifthDay = transformDate(day.setDate(day.getDate() + 1));
  const sixthDay = transformDate(day.setDate(day.getDate() + 1));

  // console.log(
  //   `Semana: ${initDate} - ${secondDay} - ${thirdDay} - ${fourthDay} - ${fifthDay} - ${sixthDay}`
  // );

  const months = [
    "Ene.",
    "Feb.",
    "Mar.",
    "Abr.",
    "May",
    "Jun.",
    "Jul.",
    "Ago.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dec."
  ];

  const days = {
    "1": "Lunes",
    "2": "Martes",
    "3": "Miérc.",
    "4": "Jueves",
    "5": "Viernes",
    "6": "Sábado",
    "7": "Domingo",
  };

  const showDate = (date) => {
    let dt = new Date(date);

    return `${days[dt.getDay()]} ${dt.getDate()} ${months[dt.getMonth()]}`;
  };

  useEffect(() => {
    turnsService
      .list()
      .then((turns) => {
        setTurns(turns);
      })
      .catch((error) => console.error(error));
  }, [reload]);

  const firstDayTurns = turns.filter((turn) => turn.date === initDate);
  const seconDayTurns = turns.filter((turn) => turn.date === secondDay);
  const thirdDayTurns = turns.filter((turn) => turn.date === thirdDay);
  const fourthDayTurns = turns.filter((turn) => turn.date === fourthDay);
  const fifthDayTurns = turns.filter((turn) => turn.date === fifthDay);
  const sixthDayTurns = turns.filter((turn) => turn.date === sixthDay);


  return (
    <div className="grid grid-cols-2">
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
        <h5 className="text-center font-bold m-1">{showDate(initDate)}</h5>
        {role === "admin" && firstDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
        ))}
        {role === "guest" && firstDayTurns.map((turn) => (
            <TurnItemGuest turn={turn} />
        ))}  
        
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
      <h5  className="text-center font-bold m-1">{showDate(secondDay)}</h5>
        {role === "admin" && seconDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
        ))}
        {role === "guest" && seconDayTurns.map((turn) => (
            <TurnItemGuest turn={turn} />
        ))} 
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
      <h5  className="text-center font-bold m-1">{showDate(thirdDay)}</h5>
        {role === "admin" && thirdDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
        ))}
        {role === "guest" && thirdDayTurns.map((turn) => (
            <TurnItemGuest turn={turn} />
        ))} 
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
      <h5  className="text-center font-bold m-1">{showDate(fourthDay)}</h5>
        {role === "admin" && fourthDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
        ))}
        {role === "guest" && fourthDayTurns.map((turn) => (
            <TurnItemGuest turn={turn} />
        ))} 
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
      <h5 className="text-center font-bold m-1">{showDate(fifthDay)}</h5>
        {role === "admin" && fifthDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
        ))}
        {role === "guest" && fifthDayTurns.map((turn) => (
            <TurnItemGuest turn={turn} />
        ))} 
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
      <h5  className="text-center font-bold m-1">{showDate(sixthDay)}</h5>
        {role === "admin" && sixthDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
        ))}
        {role === "guest" && sixthDayTurns.map((turn) => (
            <TurnItemGuest turn={turn} />
        ))} 
      </div>
            
    </div>
  )
}

export default TurnListByWeek