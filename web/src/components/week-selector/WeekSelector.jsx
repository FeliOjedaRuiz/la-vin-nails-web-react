import React, { useState } from "react";
import { HonestWeekPicker } from "../week-picker/week-picker-js/HonestWeekPicker";
import TurnItem from "../turns/turn-item/TurnItem";

function WeekSelector({ turns }) {
  const [initDate, setInitDate] = useState();
  const [finalDate, setFinalDate] = useState();

  const onInitDate = (date) => {
    setInitDate(date);
  };

  const onFinalDate = (date) => {
    setFinalDate(date);
  };

  const [week, setWeek] = useState({ firstDay: "02-02-2022" });

  const onChange = (week) => {
    setWeek(week);
  };

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


  // const [turns, setTurns] = useState([]);

  // useEffect(() => {
  //   turnsService
  //     .list()
  //     .then((turns) => {
  //       const weekTurns = turns.filter(
  //         (turn) => turn.date >= initDate && turn.date <= finalDate
  //       );
  //       setTurns(weekTurns);
  //     })
  //     .catch((error) => console.error(error));
  // }, [initDate, finalDate]);

  // console.log(turns)
  // console.log(`filtro Ini: ${initDate} Fin: ${finalDate}`)

  const firstDayTurns = turns.filter((turn) => turn.date === initDate);
  const seconDayTurns = turns.filter((turn) => turn.date === secondDay);
  const thirdDayTurns = turns.filter((turn) => turn.date === thirdDay);
  const fourthDayTurns = turns.filter((turn) => turn.date === fourthDay);
  const fifthDayTurns = turns.filter((turn) => turn.date === fifthDay);
  const sixthDayTurns = turns.filter((turn) => turn.date === sixthDay);
  



  return (
    <div className="">
      <h3 className="m-2 mb-1 text-center text-2xl font-bold text-pink-700">Selecciona una semana</h3>
      <div className="px-2">
      <HonestWeekPicker
        onChange={onChange}
        onInitDate={onInitDate}
        onFinalDate={onFinalDate}
      />
      </div>

      {/* <h1 className='text-xl m-3 font-bold text-center color text-pink-700'>Turnos</h1> */}
      <div className=" mt-3 grid grid-cols-2">
        <div className=" px-2 m-2 rounded-lg flex-col bg-emerald-100 border-2 border-emerald-300">
          <h5 className="text-center font-bold m-1">{showDate(initDate)}</h5>
          {firstDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-2 rounded-lg flex-col bg-emerald-100 border-2 border-emerald-300">
        <h5  className="text-center font-bold m-1">{showDate(secondDay)}</h5>
          {seconDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-2 rounded-lg flex-col bg-emerald-100 border-2 border-emerald-300">
        <h5  className="text-center font-bold m-1">{showDate(thirdDay)}</h5>
          {thirdDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-2 rounded-lg flex-col bg-emerald-100 border-2 border-emerald-300">
        <h5  className="text-center font-bold m-1">{showDate(fourthDay)}</h5>
          {fourthDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-2 rounded-lg flex-col bg-emerald-100 border-2 border-emerald-300">
        <h5 className="text-center font-bold m-1">{showDate(fifthDay)}</h5>
          {fifthDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-2 rounded-lg flex-col bg-emerald-100 border-2 border-emerald-300">
        <h5  className="text-center font-bold m-1">{showDate(sixthDay)}</h5>
          {sixthDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
              
      </div>

    </div>
  );
}

export default WeekSelector;
