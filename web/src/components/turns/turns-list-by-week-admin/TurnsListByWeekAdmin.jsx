import React, { useContext, useEffect, useState } from "react";
import turnsService from "../../../services/turns";
import TurnItemAdmin from "../turn-item-admin/TurnItemAdmin";
import { AuthContext } from "../../../contexts/AuthStore";

function TurnsListByWeekAdmin({ initDate, reload, onTurnSelection }) {
  const [turns, setTurns] = useState([]);
  const { user } = useContext(AuthContext);
  const role = user.role;

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

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiem.",
    "Octubre",
    "Noviem.",
    "Diciem.",
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
      .list()
      .then((turns) => {
        setTurns(turns);
      })
      .catch((error) => console.error(error));
  }, [reload]);

  const firstDayTurns = turns
    .filter((turn) => turn.date === initDate)
    .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));
  const seconDayTurns = turns
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
    <div className="grid grid-cols-2">
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm">
          {showDate(initDate)}
        </h5>
        {firstDayTurns.map((turn) => (
          <TurnItemAdmin turn={turn} />
        ))}
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm">
          {showDate(secondDay)}
        </h5>
        {seconDayTurns.map((turn) => (
          <TurnItemAdmin turn={turn} />
        ))}
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm">
          {showDate(thirdDay)}
        </h5>
        {thirdDayTurns.map((turn) => (
          <TurnItemAdmin turn={turn} />
        ))}
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm">
          {showDate(fourthDay)}
        </h5>
        {fourthDayTurns.map((turn) => (
          <TurnItemAdmin turn={turn} />
        ))}
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm">
          {showDate(fifthDay)}
        </h5>
        {fifthDayTurns.map((turn) => (
          <TurnItemAdmin turn={turn} />
        ))}
      </div>
      <div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
        <h5 className="text-center font-bold m-1 text-sm">
          {showDate(sixthDay)}
        </h5>
        {sixthDayTurns.map((turn) => (
          <TurnItemAdmin turn={turn} />
        ))}
      </div>
    </div>
  );
}

export default TurnsListByWeekAdmin;
