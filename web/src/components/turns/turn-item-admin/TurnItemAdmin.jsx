import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import datesService from "../../../services/dates";

function TurnItemAdmin({ turn }) {
  const [bg, setBg] = useState("");
  const [textColor, setTextColor] = useState("");
  const id = turn.id;

  const [date, setDate] = useState(); 

  useEffect(() => {  
    const query = {}  
    query.turn = id

    datesService.list(query)
    .then((dates) => {
      const thisDate = dates.filter((date) => date.turn.id === id);
      setDate(thisDate[0]);
    })
    .catch((error) => console.error(error));;
  }, [])

  useEffect(() => {
    switch (turn.state) {
      case "Disponible":
        setBg("bg-white border border-green-500");
        setTextColor("text-black");
        break;
      case "Solicitado":
        setBg("bg-yellow-300");
        setTextColor("text-black");
        break;
      case "Confirmado":
        setBg("bg-green-500");
        setTextColor("text-white");
        break;
      case "Cancelado":
        setBg("bg-red-600");
        setTextColor("text-white");
        break;
      default:
        break;
    }
  }, [turn]);

  return (
    <NavLink to={`/turns/${id}`}>
      <div className={`mb-1.5 ${bg} rounded shadow py-0.5 px-1.5 flex-col`}>
        <p className={`text-center font-medium  text-md truncate ${textColor}`}>{turn.hour} - {date && date.user.name} {!date && "Disponible"} </p>
        <p className={`text-center font-medium  text-xs truncate ${textColor}`}> {date && date.service.name + " - " + date.type} </p>
      </div>
    </NavLink>
  );
}

export default TurnItemAdmin;
