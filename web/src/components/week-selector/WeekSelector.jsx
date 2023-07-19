import React, { useEffect, useState } from "react";
import { HonestWeekPicker } from "../week-picker/week-picker-js/HonestWeekPicker";
import turnsService from "../../services/turns";
import TurnItem from "../turns/turn-item/TurnItem";

function WeekSelector() {
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


  const [turns, setTurns] = useState([]);

  useEffect(() => {
    turnsService
      .list()
      .then((turns) => {
        const weekTurns = turns.filter(
          (turn) => turn.date >= initDate && turn.date <= finalDate
        );
        setTurns(weekTurns);
      })
      .catch((error) => console.error(error));
  }, [initDate, finalDate]);

  // console.log(turns)
  // console.log(`filtro Ini: ${initDate} Fin: ${finalDate}`)

  const firstDayTurns = turns.filter((turn) => turn.date === initDate);
  const seconDayTurns = turns.filter((turn) => turn.date === secondDay);
  const thirdDayTurns = turns.filter((turn) => turn.date === thirdDay);
  const fourthDayTurns = turns.filter((turn) => turn.date === fourthDay);
  const fifthDayTurns = turns.filter((turn) => turn.date === fifthDay);
  const sixthDayTurns = turns.filter((turn) => turn.date === sixthDay);
  



  return (
    <div>
      <HonestWeekPicker
        onChange={onChange}
        onInitDate={onInitDate}
        onFinalDate={onFinalDate}
      />

      <div className="p-2 mt-3 grid grid-cols-2 bg-white">
        <div className=" px-2 m-2 rounded-md flex-col bg-yellow-400">
          <h5 className="text-center">{initDate}</h5>
          {firstDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-2 rounded-md flex-col bg-emerald-500">
        <h5  className="text-center">{secondDay}</h5>
          {seconDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-2 rounded-md flex-col bg-violet-400">
        <h5  className="text-center">{thirdDay}</h5>
          {thirdDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-2 rounded-md flex-col bg-pink-400">
        <h5  className="text-center">{fourthDay}</h5>
          {fourthDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-2 rounded-md flex-col bg-cyan-400">
        <h5 className="text-center">{fifthDay}</h5>
          {fifthDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-2 rounded-md flex-col bg-orange-500">
        <h5  className="text-center">{sixthDay}</h5>
          {sixthDayTurns.map((turn) => (
            <TurnItem turn={turn} />
          ))}
        </div>
              
      </div>

    </div>
  );
}

export default WeekSelector;
