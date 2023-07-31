import React, { useEffect, useState } from "react";
import turnsService from "../../../services/turns";
import datesService from "../../../services/dates";
import { useNavigate, useParams } from "react-router-dom";
import saveIcon from "../../../images/save icon2.svg";

function TurnDetailAndUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [turn, setTurn] = useState({});
  const [date, setDate] = useState(undefined);
  const [user, setUser] = useState();
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
    datesService.list()
    .then((dates) => {
      const thisDate = dates.filter((date) => date.turn.id === id)
      setDate(thisDate[0])      
    })
  }, [id]);

  console.log(date)

  // useEffect(() => {
  //   datesService.list()
  //     .then((dates) => {
  //       const thisDate = dates.filter((date) => date.turn.id === turn.id)
  //       setDate(thisDate[0])
  //       console.log(thisDate[0])
  //     })
  // }, [turn, id]);

  const handleChange = (ev) => {
    const key = ev.target.id;
    const value = ev.target.value;

    setTurn({
      ...turn,
      [key]: value,
    });
  };

  const [serverError, setServerError] = useState(undefined);
  const [error, setError] = useState(undefined);

  const handleSubmit = (ev) => {
    ev.preventDefault();
    onTurnSubmit(turn);
  };

  const onTurnSubmit = async (turn) => {
    try {
      setServerError();
      turn = await turnsService.update(id, turn);
      navigate("/schedule");
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach((inputName) =>
          setError(inputName, { message: errors[inputName] })
        );
      } else {
        setServerError(error.message);
      }
    }
  };

  return (
    <div className="bg-white/50 rounded-md p-3 shadow">
      <form onSubmit={handleSubmit}>
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
                onChange={handleChange}
                value={turn.date}
                className="rounded-lg h-10 w-48 px-2 border-2 border-pink-300"
              />
            </div>
            {/* {errors.date && (
              <div className="text-red-600 text-xs font-medium">
                {errors.date?.message}
              </div>
            )} */}
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
                onChange={handleChange}
                value={turn.hour}
                className="rounded-lg h-10 w-24 px-2 border-2 border-pink-300"
              />
            </div>
            {/* {errors.hour && (
              <div className="text-red-600 text-xs font-medium">
                {errors.hour?.message}
              </div>
            )} */}
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
                onChange={handleChange}
              >
                {turnStates.map((state) => (
                  <option className="" value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            {/* {errors.state && (
              <div className=" text-red-600 text-xs font-medium">
                {errors.state?.message}
              </div>
            )} */}
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
      { !date && <div>Este turno aún no fue solicitado</div> }
      { date && <div>
        <div className="mt-2">
          <span className="ml-2 font-medium text-pink-800 text-sm">
            Cliente: 
          </span>
          <span> {date.user.name}</span>
        </div>
        <div className="mt-2">
          <span className="ml-2 font-medium text-pink-800 text-sm">
            Servicio: 
          </span>
          <span>{date.service.name}  </span>
          <span className="ml-2 font-medium text-pink-800 text-sm">
            Tipo: 
          </span>
          <p className=" inline text-clip overflow-hidden">{date.type} </p>
        </div>
        <div className="mt-2">
          <span className="ml-2 font-medium text-pink-800 text-sm">
            Detalles: 
          </span>
          <span>{date.designDetails}</span>
        </div>
      </div>  }
      
    </div>
  );
}

export default TurnDetailAndUpdate;
