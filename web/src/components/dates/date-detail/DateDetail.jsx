import React, { useEffect, useState } from "react";
import WhatsappIcon from "../../icons/WhatsappIcon";

function DateDetail({ date }) {
  const [state, setState] = useState("");

  useEffect(() => {
    if (date.turn.state === "Solicitado") {
      setState("Sin confirmación");
    } else {
      setState(date.turn.state);
    }
  });

  return (
    <div className="bg-white/50 p-4 mb-4 rounded-md shadow">
      <p className="text-xl font-medium text-pink-700">
        Fecha:{" "}
        <span className=" font-normal text-black ">{date.turn.date}</span>
      </p>
      <p className="text-xl font-medium text-pink-700">
        Hora:{" "}
        <span className=" font-normal text-black ">{date.turn.hour} hs.</span>
      </p>
      <p className="text-xl font-medium text-pink-700">
        Servicio:{" "}
        <span className=" font-normal text-black ">{date.service.name}</span>{" "}
      </p>
      <p className="text-xl font-medium text-pink-700">
        Tipo: <span className=" font-normal text-black ">{date.type}</span>{" "}
      </p>
      <p className="text-xl font-medium text-pink-700">
        Detalles:{" "}
        <span className=" font-normal text-black ">{date.designDetails}</span>{" "}
      </p>
      <p className="text-xl font-medium text-pink-700">
        Precio:{" "}
        <span className=" font-normal text-black ">{date.cost} €.</span>{" "}
      </p>
      <p className="text-xl font-medium text-pink-700">
        Duración estimada:{" "}
        <span className=" font-normal text-black ">{date.duration} hs.</span>{" "}
      </p>
      
      <div className="flex items-center ">
        <div className=" w-1/2">
          <p className="mt-2 text-2xl text-center font-bold text-pink-700">
            Estado:{" "}
          </p>
          <p className=" text-center font-medium text-lg leading-snug text-black ">
            {state}
          </p>
        </div>
        <div className="w-1/2 flex flex-col items-center justify-around ml-2 mt-3">
          <p className="text-center text-lg font-medium text-pink-800">
            ¿Tienes una duda?{" "}
          </p>
          <a
            href={`https://wa.me/$+34699861930?text=%C2%A1Hola%21%20Tengo%20una%20duda%20sobre%20mi%20cita%20del%20${date.turn.date}%20a%20las%20${date.turn.hour}%20hs.`}
            className="flex items-center w-full mt-1 justify-center text-white py-1 px-3 font-medium rounded-md text-lg shadow-lg bg-[#128C7E] hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300"
          >
            {" "}
            <WhatsappIcon /> Consultar
          </a>
        </div>
      </div>
    </div>
  );
}

export default DateDetail;
