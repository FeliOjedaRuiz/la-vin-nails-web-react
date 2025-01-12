import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import datesService from "../../../services/dates";

function TurnItemAdmin({ turn }) {
  const [bg, setBg] = useState("");
  const [textColor, setTextColor] = useState("");
  const id = turn.id;

  const [date, setDate] = useState();
  

  useEffect(() => {
    const query = {};
    query.turn = id;


    datesService
      .list(query)
      .then((date) => {        
        setDate(date[0]);
      })
      .catch((error) => console.error(error));
  }, [turn]);

  useEffect(() => {
    switch (turn.state) {
      case "Reservado":
        setBg("bg-orange-600");
        setTextColor("text-black");
        break;
      case "Disponible":
        setBg("bg-white border-2 border-emerald-500");
        setTextColor("text-black");
        break;
      case "Solicitado":
        setBg("bg-yellow-500");
        setTextColor("text-black");
        break;
      case "Confirmado":
        setBg("bg-emerald-500");
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
    
      <div className={`mb-1.5 ${bg} rounded shadow py-1 px-1.5  flex flex-col `}>
      
      
        <p className={` font-medium  text-sm truncate ${textColor}`}>
          {turn.hour} - {date && date.user.name} {date && date.user.surname} {!date && turn.state}{" "}
        </p>
      
        {/* <p className={`font-medium text-xs truncate ${textColor}`}>
          {" "}
          {date && date.service.name}
        </p> */}
      </div>
    </NavLink>
  );
}

export default TurnItemAdmin;
