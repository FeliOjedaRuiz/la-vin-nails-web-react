import React, { useEffect, useState } from "react";
import turnsService from "../../../services/turns";
import TurnItemGuest from "../turn-item-guest/TurnItemGuest";
import NotAvailableTurn from "../not-avalaible-turn/NotAvailableTurn";

function TurnListByWeek({ initDate, reload, onTurnSelection }) {
  const [turns, setTurns] = useState([]);

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
  const firstDay = transformDate(day.setDate(day.getDate() + 1));
  const secondDay = transformDate(day.setDate(day.getDate() + 1));
  const thirdDay = transformDate(day.setDate(day.getDate() + 1));
  const fourthDay = transformDate(day.setDate(day.getDate() + 1));
  const fifthDay = transformDate(day.setDate(day.getDate() + 1));
  const sixthDay = transformDate(day.setDate(day.getDate() + 1));

  const months = [
    "Enero",
    "Feb.",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Ago.",
    "Sept.",
    "Oct.",
    "Nov.",
    "Dic.",
  ];

  const days = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
  };

  const showDate = (date) => {
    let dt = new Date(date);

    return `${days[dt.getDay()]} ${dt.getDate()} ${months[dt.getMonth()]}`;
  };

  useEffect(() => {
    turnsService
      .list(initDate)
      .then((turns) => {
        setTurns(turns);
      })
      .catch((error) => console.error(error));
  }, [reload, initDate]);

  const firstDayTurns = turns
    .filter((turn) => turn.date === firstDay)
    .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));
  const secondDayTurns = turns
    .filter((turn) => turn.date === secondDay)
    .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));
  const thirdDayTurns = turns
    .filter((turn) => turn.date === thirdDay)
    .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));
  const fourthDayTurns = turns
    .filter((turn) => turn.date === fourthDay)
    .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));
  const fifthDayTurns = turns
    .filter((turn) => turn.date === fifthDay)
    .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));
  const sixthDayTurns = turns
    .filter((turn) => turn.date === sixthDay)
    .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      <div className=" px-2 m-1.5 rounded-lg flex flex-col border-2 bg-white/50 border-emerald-500 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm lg:text-lg">
          {showDate(firstDay)}
        </h5>
        {!firstDayTurns[0] && (
          <NotAvailableTurn />
        )}
        {firstDayTurns.map((turn) => (
          <TurnItemGuest key={turn.id} turn={turn} onTurnSelection={onTurnSelection} />
        ))}
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex flex-col border-2 bg-white/50 border-emerald-500 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm lg:text-lg">
          {showDate(secondDay)}
        </h5>
        {!secondDayTurns[0] && (
          <NotAvailableTurn />
        )}
        {secondDayTurns.map((turn) => (
          <TurnItemGuest key={turn.id} turn={turn} onTurnSelection={onTurnSelection} />
        ))}
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex flex-col border-2 bg-white/50 border-emerald-500 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm lg:text-lg">
          {showDate(thirdDay)}
        </h5>
        {!thirdDayTurns[0] && (
          <NotAvailableTurn />
        )}
        {thirdDayTurns.map((turn) => (
          <TurnItemGuest key={turn.id} turn={turn} onTurnSelection={onTurnSelection} />
        ))}
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex flex-col border-2 bg-white/50 border-emerald-500 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm lg:text-lg">
          {showDate(fourthDay)}
        </h5>
        {!fourthDayTurns[0] && (
          <NotAvailableTurn />
        )}
        {fourthDayTurns.map((turn) => (
          <TurnItemGuest key={turn.id} turn={turn} onTurnSelection={onTurnSelection} />
        ))}
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex flex-col border-2 bg-white/50 border-emerald-500 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm lg:text-lg">
          {showDate(fifthDay)}
        </h5>
        {!fifthDayTurns[0] && (
          <NotAvailableTurn />
          
        )}
        {fifthDayTurns.map((turn) => (
          <TurnItemGuest key={turn.id} turn={turn} onTurnSelection={onTurnSelection} />
        ))}
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex flex-col border-2 bg-white/50 border-emerald-500 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm lg:text-lg">
          {showDate(sixthDay)}
        </h5>
        {!sixthDayTurns[0] && (
          <NotAvailableTurn />
        )}
        {sixthDayTurns.map((turn) => (
          <TurnItemGuest key={turn.id} turn={turn} onTurnSelection={onTurnSelection} />
        ))}
      </div>
    </div>
  );
}

export default TurnListByWeek;
