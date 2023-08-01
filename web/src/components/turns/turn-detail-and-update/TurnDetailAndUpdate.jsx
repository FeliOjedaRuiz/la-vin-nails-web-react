import React, { useEffect, useState } from "react";
import turnsService from "../../../services/turns";
import { useParams } from "react-router-dom";
import saveIcon from "../../../images/save icon2.svg";
import DateUpdateForm from "../../dates/date-update/DateUpdateForm";

function TurnDetailAndUpdate() {
  const { id } = useParams();
  // const [turnId, setTurnId] = useState(id)
  const [turn, setTurn] = useState({});
  const [turnStates, setTurnStates] = useState([
    "Disponible",
    "Solicitado",
    "Confirmado",
    "Cancelado",
  ]);
  let states = [];

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
  }, [id]);  

  const handleTurnChange = (ev) => {
    const key = ev.target.id;
    const value = ev.target.value;

    setTurn({
      ...turn,
      [key]: value,
    });
  };

  const [serverError, setServerError] = useState(undefined);

  const handleTurnSubmit = (ev) => {
    ev.preventDefault();
    onTurnSubmit(turn);
  };

  const onTurnSubmit = async (turn) => {
    try {
      setServerError();
      turn = await turnsService.update(id, turn);
      // navigate("/schedule");
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <div className="bg-white/50 rounded-md p-3 shadow">
      <h2 className="text-2xl mb-2 font-bold text-center color text-pink-700">
        Detalle del turno
      </h2>
      <form onSubmit={handleTurnSubmit}>
        {serverError && (
          <div className="text-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white">
            {serverError}
          </div>
        )}

        <div className="flex justify-between mb-2">
          <div className="">
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
                className="rounded-lg h-10 w-48 px-2 border-2 border-pink-300"
              />
            </div>
          </div>

          <div className="">
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
                className="rounded-lg h-10 w-24 px-2 border-2 border-pink-300"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="">
            <label
              for="state"
              className="ml-2 font-medium text-pink-800 text-sm"
            >
              Estado
            </label>
            <div>
              <select
                className="rounded-lg px-2 w-48 border-2 border-pink-300 align-top "
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
          <div className="flex items-end">
            <button
              type="submit"
              className="text-white flex justify-center items-center shadow-lg h-10 w-10 mb-1 bg-gradient-to-l from-emerald-700 via-green-500 to-emerald-700 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-full text-xl"
            >
              <img className="h-6 w-6 " src={saveIcon} alt="save icon"></img>
            </button>
          </div>
        </div>
      </form>
      <DateUpdateForm  />
    </div>
  );
}

export default TurnDetailAndUpdate;
