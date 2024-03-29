import React, { useEffect, useState } from "react";
import WhatsappIcon from "../../icons/WhatsappIcon";
import DeleteIcon from "../../icons/DeleteIcon";
import datesService from "../../../services/dates";
import turnsService from "../../../services/turns";
import Modal from "./../../modal/Modal";
import ButtonGreen from "../../butons/ButtonGreen";

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
    setModalState(!modalState);
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
    <div className="bg-white/50 p-4 mb-6 border-2 border-emerald-500 rounded-lg shadow-lg md:flex md:justify-around md:p-6">
      <div>
        <p className="text-lg font-medium text-pink-700">
          Fecha:{" "}
          <span className=" font-normal text-black ">{date.turn.date}</span>
        </p>
        <p className="text-lg font-medium text-pink-700">
          Hora:{" "}
          <span className=" font-normal text-black ">{date.turn.hour} hs.</span>
        </p>
        <p className="text-lg font-medium text-pink-700">
          Servicio:{" "}
          <span className=" font-normal text-black ">{date.service.name}</span>{" "}
        </p>
        <p className="text-lg font-medium text-pink-700">
          Tipo: <span className=" font-normal text-black ">{date.type}</span>{" "}
        </p>
        <p className="text-lg font-medium text-pink-700">
          Detalles:{" "}
          <span className=" font-normal text-black ">{date.designDetails}</span>{" "}
        </p>
        <p className="text-lg font-medium text-pink-700">
          Remoción:{" "}
          <span className=" font-normal text-black ">{date.needRemove}</span>{" "}
        </p>
        <p className="text-lg font-medium text-pink-700">
          Precio:{" "}
          <span className=" font-normal text-black ">
            {date.cost}
            {date.cost && <>€.</>} {!date.cost && <>sin confirmar.</>}{" "}
          </span>{" "}
        </p>
        <p className="text-lg font-medium text-pink-700">
          Duración estimada:{" "}
          <span className=" font-normal text-black ">
            {date.duration} {date.duration && <>hs.</>}{" "}
            {!date.duration && <>sin confirmar.</>}{" "}
          </span>{" "}
        </p>
        <a href="https://www.google.es/maps/place/La+Vin+Nails/@37.199055,-3.6219443,17z/data=!3m1!4b1!4m6!3m5!1s0xd71fdcc60fab787:0xffdd8e2502825163!8m2!3d37.1990508!4d-3.6193694!16s%2Fg%2F11tsjffhvt?entry=ttu">
          <p className="text-2xl font-medium text-center mt-1 text-emerald-800">
            Ver ubicación.
          </p>
        </a>
      </div>
      <div className="flex flex-col md:m-6">
        <div className="mt-2 mb-2 text-2xl text-center">
          <p className="  text-center font-bold text-pink-800">
            Estado:{" "}
          </p>
          <p className=" text-center font-medium  leading-snug text-black ">
            {state}
          </p>
        </div>
        <div className="flex flex-col">
          <div className=" flex flex-col items-center w-full ">
            <p className="text-center text-md font-medium text-pink-800">
              ¿Tienes una duda?{" "}
            </p>
            <a
              href={`https://wa.me/$+34699861930?text=%C2%A1Hola%21%20Tengo%20una%20duda%20sobre%20mi%20cita%20del%20${date.turn.date}%20a%20las%20${date.turn.hour}%20hs.`}
              className="flex items-center w-full justify-center"
            >
              {" "}
              <ButtonGreen styles={"flex items-center justify-center w-full m-1"}>
                {" "}
                <WhatsappIcon /> Consultar{" "}
              </ButtonGreen>
            </a>
          </div>
          <div className="flex justify-center items-center p-1 ">
            <button
              onClick={() => setModalState(!modalState)}
              className="flex w-full items-center mt-1 justify-center text-white py-1 px-4 font-medium rounded-md text-lg shadow-lg bg-red-700 hover:bg-red-800 hover:ring-2 hover:ring-red-500 focus:ring-2 focus:ring-red-500"
            >
              {" "}
              <DeleteIcon /> &nbsp; Cancelar cita
            </button>
          </div>
        </div>
      </div>
      <Modal modalState={modalState} setModalState={setModalState}>
        <div className="text-center mb-6">
          <p className="font-bold text-2xl">CANCELAR CITA</p>
        </div>

        <div className="text-center text-xl font-medium mb-6">
          <p>¿Estas seguro de que quieres cancelar tu cita?</p>
        </div>

        <div className="flex justify-around">
          <button
            onClick={() => setModalState(!modalState)}
            className="text-white  px-2 py-1 rounded bg-red-700 hover:bg-red-800 hover:ring-2 hover:ring-red-500 focus:ring-2 focus:ring-red-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleDeleteDate}
            className="text-white  px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-800 hover:ring-2 hover:ring-emerald-500 focus:ring-2 focus:ring-emerald-500"
          >
            Aceptar
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default DateDetail;
