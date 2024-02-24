import React, { useEffect, useState } from "react";
import turnsService from "../../../services/turns";
import datesService from "../../../services/dates";
import { useParams } from "react-router-dom";
import SaveIconSVG from "../../icons/SaveIconSVG";
import WhatsappIcon from "../../icons/WhatsappIcon";
import { useNavigate } from "react-router-dom";
import Modal from "../../modal/Modal";
import DeleteIcon from "../../icons/DeleteIcon";
import ButtonGreen from "../../butons/ButtonGreen";

function TurnDetailAndUpdate() {
  const { id } = useParams();
  const [turn, setTurn] = useState({});
  const [date, setDate] = useState(undefined);
  const navigate = useNavigate();
  const [turnStates, setTurnStates] = useState([
    "Disponible",
    "Solicitado",
    "Confirmado",
    "Cancelado",
  ]);
  let states = [];
  const [modalState, setModalState] = useState(false);
  const [modalDateState, setModalDateState] = useState(false);
  const [reload, setReload] = useState(false);

  const [serverError, setServerError] = useState(undefined);

  useEffect(() => {
    const query = {};
    query.turn = id;

    datesService
      .list(query)
      .then((dates) => {
        setDate(dates[0]);
      })
      .catch((error) => console.error(error));
  }, [reload]);

  useEffect(() => {
    turnsService
      .detail(id)
      .then((turn) => {
        setTurn(turn);
        states = turnStates.filter((state) => turn.state !== state);
        states.unshift(turn.state);
        setTurnStates(states);
      })
      .catch((error) => console.error(error));
  }, [reload]);

  const handleTurnChange = (ev) => {
    const key = ev.target.id;
    const value = ev.target.value;

    setTurn({
      ...turn,
      [key]: value,
    });
  };

  const handleDateChange = (ev) => {
    const key = ev.target.id;
    const value = ev.target.value;

    setDate({
      ...date,
      [key]: value,
    });
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    onTurnSubmit(turn);
    if (date) {
      onDateSubmit(date);
    }
    navigate("/schedule");
  };

  const onTurnSubmit = async (turn) => {
    try {
      setServerError();
      turn = await turnsService.update(id, turn);
    } catch (error) {
      setServerError(error.message);
    }
  };

  const onDateSubmit = async (date) => {
    date.user = date.user.id;
    date.turn = date.turn.id;
    date.service = date.service.id;
    const dateId = date.id;
    try {
      setServerError();
      date = await datesService.update(dateId, date);
    } catch (error) {
      setServerError(error.message);
    }
  };

  const handleDeleteTurn = () => {
    turnsService
      .deleteTurn(id)
      .then(navigateToSchedule)
      .catch((error) => console.error(error));
  };

  const navigateToSchedule = () => {
    navigate("/schedule");
  };

  const handleDeleteDate = () => {
    setModalDateState(!modalDateState);
    datesService
      .deleteDate(date.id)
      .then(updateTurnState)
      .catch((error) => console.error(error));
  };

  const onDateDelete = () => {
    setReload(!reload);
  };

  const updateTurnState = () => {
    const turn = date.turn;
    turn.state = "Cancelado";

    turnsService
      .update(id, turn)
      .then(onDateDelete)
      .catch((error) => console.error(error));
  };

  return (
    <div className="bg-white/50 rounded-lg px-2 pt-3 md:p-6 shadow ">
      <h2 className="text-3xl md:text-4xl md:mb-4 mb-2 font-bold text-center color text-pink-700">
        Detalle del turno
      </h2>
      <form onSubmit={handleSubmit}>
        {serverError && (
          <div className="text-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white">
            {serverError}
          </div>
        )}

        <div className="flex flex-wrap px-2 ">
          <div className="mr-5 mb-2">
            <label
              for="date"
              className="ml-2 font-medium text-pink-800 text-sm"
            >
              Fecha
            </label>
            <div>
              <input
                type="date"
                id="date"
                onChange={handleTurnChange}
                value={turn.date}
                className="rounded-lg h-10 w-36 px-2 border-2 border-pink-300"
              />
            </div>
          </div>

          <div className="mr-5 mb-2">
            <div>
              <label
                for="hour"
                className="ml-2 font-medium text-pink-800 text-sm"
              >
                Hora
              </label>
              <div>
                <input
                  type="time"
                  id="hour"
                  onChange={handleTurnChange}
                  value={turn.hour}
                  className="rounded-lg h-10 max-w-min px-2 border-2 border-pink-300"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="mr-5">
              <label
                for="state"
                className="ml-2 font-medium text-pink-800 text-sm"
              >
                Estado
              </label>
              <div>
                <select
                  className="rounded-lg px-2 h-10 w-36 border-2 border-pink-300 align-top "
                  id="state"
                  onChange={handleTurnChange}
                >
                  {turnStates.map((state) => (
                    <option className="" value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {!date && (
              <div className="flex items-end justify-start pt-2">
                <button
                  onClick={() => setModalState(!modalState)}
                  className="flex justify-center items-center h-10 w-10 text-white font-medium rounded-lg text-lg shadow-lg bg-red-700 hover:bg-red-800 hover:ring-2 hover:ring-red-500 focus:ring-2 focus:ring-red-500"
                >
                  {" "}
                  <DeleteIcon />
                </button>
              </div>
            )}
          </div>
        </div>


        <Modal modalState={modalState} setModalState={setModalState}>
          <div className="text-center mb-6">
            <p className="font-bold text-2xl">Eliminar Turno</p>
          </div>

          <div className="text-center text-xl font-medium mb-6">
            <p>¿Quieres eliminar el turno?</p>
          </div>

          <div className="flex justify-around">
            <button
              onClick={() => setModalState(!modalState)}
              className="bg-red-600 text-white  px-2 py-1 rounded "
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteTurn}
              className="bg-green-600 text-white  px-2 py-1 rounded "
            >
              Aceptar
            </button>
          </div>
        </Modal>

        {!date && (
          <div className=" text-center mt-4 p-0.5 text-pink-600 text-xl font-bold">
            ¡Este turno aún no fue solicitado!
          </div>
        )}
        {date && (
          <div className="my-6">
            <h2 className="text-2xl mb-2 font-bold text-center color text-pink-700">
              Detalle de la cita
            </h2>
            <div className="mt-2">
              <span className="ml-2 font-medium text-emerald-800 text-base">
                Cliente:
              </span>
              <span>
                {" "}
                {date.user.name} {date.user.surname}
              </span>
            </div>
            <div className="">
              <span className="ml-2 font-medium text-emerald-800 text-base">
                Teléfono:
              </span>
              <span> {date.user.phone}</span>
            </div>
            <div className="">
              <span className="ml-2 font-medium text-emerald-800 text-base">
                Email:
              </span>
              <span> {date.user.email}</span>
            </div>
            <div className="mt-1">
              <span className="ml-2 font-medium text-pink-800 text-base">
                Servicio:
              </span>
              <span> {date.service.name} </span>
            </div>
            <div className="mt-1">
              <span className="ml-2 font-medium text-pink-800 text-base">
                Tipo:
              </span>
              <span className=" inline text-clip overflow-hidden">
                {" "}
                {date.type}
              </span>
            </div>
            <div className="mt-1">
              <span className="ml-2 font-medium text-pink-800 text-base">
                Remoción:
              </span>
              <span className=" inline text-clip overflow-hidden">
                {" "}
                {date.needRemove}
              </span>
            </div>
            <div className="mt-1">
              <span className="ml-2 font-medium text-pink-800 text-base">
                Detalles:
              </span>
              <span className=""> {date.designDetails}</span>
            </div>

            <div
              className="flex mb-2 mt-1
               items-center"
            >
              <label
                for="cost"
                className="mx-2 font-medium text-pink-800 text-base"
              >
                Costo:
              </label>
              <input
                type="number"
                id="cost"
                onChange={handleDateChange}
                value={date.cost}
                className=" h-7 w-14 p-2 border-2 border-pink-300 text-md rounded-lg focus:ring-teal-500  focus:border-teal-500"
                placeholder="00"
              />
              <span className="ml-1 font-medium text-pink-800 text-base">
                €.
              </span>
            </div>
            <div className=" flex items-center">
              <label
                for="duration"
                className="mx-2 font-medium text-pink-800 text-base"
              >
                Duración:
              </label>
              <input
                type="text"
                id="duration"
                onChange={handleDateChange}
                value={date.duration}
                className="h-7 p-2 border-2 w-14 border-pink-300 text-md rounded-lg focus:ring-teal-500  focus:border-teal-500"
                placeholder="0:00"
              />{" "}
              <span className="ml-1 font-medium text-pink-800 text-lg">
                {" "}
                hs.
              </span>
            </div>
          </div>
        )}
        <div className="flex mt-8 justify-evenly">
          <button
            type="submit"
            className=" flex justify-center m-1 items-center text-white py-1 px-3 font-medium rounded-md text-lg shadow-lg bg-gradient-to-l from-pink-700 via-pink-500 to-pink-700 hover:bg-pink-700 hover:ring-2 hover:ring-pink-400 focus:ring-2 focus:ring-pink-400"
          >
            <SaveIconSVG />
            Guardar
          </button>

          {date && (
            <a
              href={`https://wa.me/+34${date.user.phone}?text=¡Hola! Tu cita de ${date.service.name} para el ${date.turn.date} a las ${date.turn.hour} hs. *ha sido confirmada* con un precio de ${date.cost}€ y una duración estimada de ${date.duration} hs.
              
              *¡Te espero en la NUEVA DIRECCIÓN, C. Periodista Rafael Gago Palomo 7, local 3!*
              
              https://goo.gl/maps/LBXqKgxpGdbYarhm8
              
              🕑 Se tolerarán hasta 10' de demora, de lo contrario queda cancelada! 💅 Es importante que decidas antes que diseño hacerte o una idea general para evitar demoras. De acuerdo al tiempo disponible, quedará a criterio de la manicurista reducir detalles en diseños más elaborados.
              import ButtonGreen from './../../butons/ButtonGreen';

              🧼 ¡Recuerda higienizar bien tus manos antes de la cita!
              
              🤑 Puedes abonar con bizum a este número o efectivo preferentemente`}
              className="flex items-center justify-center"
            >
              {" "}
              <ButtonGreen styles={"py-1.5"}>
                {" "}
                <WhatsappIcon /> Escribir
              </ButtonGreen>
            </a>
          )}
          {date && (
            <button
              onClick={() => setModalDateState(!modalDateState)}
              className="flex justify-center items-center text-white m-1 h-10 w-10 font-medium rounded-lg text-lg shadow-lg bg-red-700 hover:bg-red-800 hover:ring-2 hover:ring-red-500 focus:ring-2 focus:ring-red-500"
            >
              {" "}
              <DeleteIcon />
            </button>
          )}
        </div>
      </form>
      <Modal modalState={modalDateState} setModalDateState={setModalDateState}>
        <div className="text-center mb-6">
          <p className="font-bold text-2xl">Cancelar Cita</p>
        </div>

        <div className="text-center text-xl font-medium mb-6">
          <p>¿Quieres cancelar la cita?</p>
        </div>

        <div className="flex justify-around">
          <button
            onClick={() => setModalDateState(!modalDateState)}
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

export default TurnDetailAndUpdate;
