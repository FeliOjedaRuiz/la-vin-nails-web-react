import React, { useEffect, useState } from "react";
import WhatsappIcon from "../../icons/WhatsappIcon";
import DeleteIcon from "../../icons/DeleteIcon";
import datesService from "../../../services/dates";
import turnsService from "../../../services/turns";
import Modal from "./../../modal/Modal";

function DateDetail({ date, onDateDelete }) {
  const [state, setState] = useState("");
  const [serverError, setServerError] = useState(undefined);
  const [modalState, setModalState] = useState(false);

  useEffect(() => {
    if (date.turn.state === "Solicitado") {
      setState("Sin confirmación");
    } else {
      setState(date.turn.state);
    }
  }, []);

  const handleDeleteDate = () => {
    setModalState(!modalState)
    datesService
      .deleteDate(date.id)
      .then(updateTurnState)
      .catch((error) => console.error(error));
  };

  const updateTurnState = () => {
    const id = date.turn.id;
    const turn = date.turn;
    turn.state = "Cancelado";

    turnsService
      .update(id, turn)
      .then(onDateDelete)
      .catch((error) => console.error(error));
  };

  return (
    <div className="bg-white/50 p-4 mb-4 rounded-md shadow md:flex md:justify-around md:p-6">
      <div>
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
      </div>
      <div className="flex flex-col">
        <div className="mt-2 mb-2 text-2xl text-center">
          <span className="  text-center font-bold text-emerald-800">
            Estado:{" "}
          </span>
          <span className=" text-center font-medium  leading-snug text-black ">
            {state}
          </span>
        </div>
        <div className="flex items-end justify-around md:flex-col">
          <div className=" flex flex-col items-center w-full mr-4 md:mr-0 md:m-4">
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
          <div className=" ">
            <div
              onClick={() => setModalState(!modalState)}
              className="flex items-center mt-1 justify-center text-white py-1 px-4 font-medium rounded-md text-lg shadow-lg bg-red-700 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300"
            >
              {" "}
              <DeleteIcon /> Cancelar
            </div>
          </div>
        </div>
      </div>
      <Modal modalState={modalState} setModalState={setModalState}>
        <div className="text-center mb-6">
          <p className="font-bold text-2xl">
            CANCELAR CITA           
          </p>
          
        </div>

        <div className="text-center text-xl font-medium mb-6">
          <p>¿Estas seguro de que quieres cancelar tu cita?</p>
        </div>

        <div className="flex justify-around">
          <button
            onClick={() => setModalState(!modalState)}
            className="bg-red-600 text-white  px-2 py-1 rounded "
          >
            Cancelar
          </button>
          <button
          onClick={handleDeleteDate}
            className="bg-green-600 text-white  px-2 py-1 rounded "
          >
            Aceptar
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default DateDetail;
