import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/AuthStore";
import { useForm } from "react-hook-form";
import datesService from "../../../services/dates";
import turnsService from "../../../services/turns";
import { useNavigate } from "react-router-dom";
import { HonestWeekPicker } from "../../week-picker/week-picker-js/HonestWeekPicker";
import TurnListByWeek from "../../turns/turn-list-by-week/TurnListByWeek";
import Modal from "../../modal/Modal";

function DatesForm({ service, serviceTypes }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ mode: "onBlur" });
  const [serverError, setServerError] = useState(undefined);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [initDate, setInitDate] = useState();
  const [selectedTurn, setSelectedTurn] = useState({});
  const [selectedDate, setSelectedDate] = useState({});
  // const [alert, setAlert] = useState("false")

  const onInitDate = (date) => {
    setInitDate(date);
  };

  const onTurnSelection = (turn) => {
    setSelectedTurn(turn);
  };

  useEffect(() => {
    // setAlert("hidden")
    setSelectedDate(selectedTurn.date);
  }, [selectedTurn]);

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const days = {
    1: "Lunes",
    2: "Martes",
    3: "Miérc.",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
  };

  const showDate = (selectedDate) => {
    let dt = new Date(selectedDate);

    return `${days[dt.getDay()]} ${dt.getDate()} ${months[dt.getMonth()]}`;
  };

  const onTurnSubmit = async (turn) => {
    selectedTurn.state = "Solicitado";
    try {
      turn = await turnsService.update(selectedTurn.id, selectedTurn);
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

  // const handleClick = () => {
  //   setAlert(alert === "" ? "hidden" : "")
  // };

  const onDateSubmit = async (date) => {
    date.user = user.id;
    date.service = service.id;
    date.turn = selectedTurn.id;
    try {
      setServerError(undefined);
      console.debug("Sending date application...");
      date = await datesService.create(date);
      onTurnSubmit();
      navigate("/my-schedule");
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        console.error(error.message, errors);
        Object.keys(errors).forEach((inputName) =>
          setError(inputName, { message: errors[inputName] })
        );
      } else {
        console.error(error);
        setServerError(error.message);
      }
    }
  };

  const [modalState, setModalState] = useState(false);

  return (
    <div className="relative flex flex-col ">
      <form className="flex flex-col" onSubmit={handleSubmit(onDateSubmit)}>
        {serverError && (
          <div className="self-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white">
            {serverError}
          </div>
        )}
        <div className="flex flex-col p-2">
          <div className="flex flex-col bg-white/50 p-2 rounded-lg border-2 border-pink-300">
            <h1 className="ml-2 font-bold text-pink-600 text-lg self-center text-center">
              Completa el formulario para tu cita de:
            </h1>
            <h2 className="ml-2 font-bold text-green-700 text-2xl self-center">
              {service.name}
            </h2>
          </div>
          <div className="mb-3 mt-3">
            <label
              for="type"
              className="ml-2 font-medium text-pink-800 text-lg"
            >
              Selecciona tipo de decoración
            </label>
            <div>
              <select
                {...register("type", { required: true })}
                className="rounded-lg  w-full text-green-700 font-medium border-2 border-pink-300 "
              >
                {serviceTypes.map((type) => (
                  <option className="w-80 font-medium" value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {errors.state && (
              <div className=" ml-2 text-red-600 font-medium">
                {errors.state?.message}
              </div>
            )}
          </div>
          <div className="mb-2">
            <label
              for="designDetails"
              className="ml-2 font-medium text-pink-800 text-lg"
            >
              Describe los detalles:
            </label>
            <textarea
              placeholder="Describe los detalles del diseño..."
              className="bg-gray-50 border-2 text-green-700 border-pink-300 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
              {...register("designDetails", {
                required: "Son necesarios los detalles",
                // minLength: {
                //   value: 5,
                //   message: "Se necesitan al menos 5 caracteres"},
                maxLength: {
                  value: 300,
                  message: "Máximo 300 caracteres",
                },
              })}
            />
            {errors.name && (
              <div className=" ml-2 text-red-600 font-medium">
                {errors.name?.message}
              </div>
            )}
          </div>
        </div>

        <div className="px-2">
          <HonestWeekPicker onInitDate={onInitDate} />
        </div>
        <div>
          <TurnListByWeek
            initDate={initDate}
            onTurnSelection={onTurnSelection}
          />
        </div>

        <div className="flex flex-col p-2 justify-center items-center ">
          {selectedTurn.hour && (
            <div className=" bg-pink-700 text-white rounded-md text-center  font-medium py-1 px-3 shadow-md">
              <p className="text-lg"> Turno selecionado: </p>
              <p className="text-md">
                {showDate(selectedDate)} a las {selectedTurn.hour}{" "}
              </p>
            </div>
          )}

          {!selectedTurn.hour && (
            <div className=" bg-yellow-300 rounded-md text-center font-medium py-1 px-3  shadow-md">
              <p>Debes seleccionar un turno</p>
            </div>
          )}

          <Modal modalState={modalState} setModalState={setModalState}>
            <div className="text-center mb-6">
            <p className="font-medium">Solicitar cita de <span className="text-pink-700 font-bold">{service.name}</span>  para el  </p>
            <p className="font-bold text-pink-700">{showDate(selectedDate)} a las {selectedTurn.hour} hs.</p>
            </div>

            <div className="text-center mb-6">
            <p>Tu solicitud será confirmada a la mayor brevedad posible.</p>

            </div>

            <div className="flex justify-around">
              <button
                onClick={() => setModalState(!modalState)}
                className="bg-red-600 text-white  px-2 py-1 rounded "
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white  px-2 py-1 rounded "
              >
                Aceptar
              </button>
            </div>
            
          </Modal>
        </div>
      </form>
      {selectedTurn.hour && 
      <div className="p-2">
        <button
          onClick={() => setModalState(!modalState)}
          className="text-white w-full bg-gradient-to-l from-emerald-700 via-green-500 to-emerald-700 shadow hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-xl self-center px-4 py-1.5 mt-2 text-center"
        >
          Solicitar cita
        </button>
      </div> }
      {!selectedTurn.hour && 
      <div className="p-2">
        <button
          
          className="text-gray-500 w-full bg-gray-300 shadow  font-medium rounded-lg text-xl self-center px-4 py-1.5 mt-2 text-center"
        >
          Solicitar cita
        </button>
      </div> }
    </div>
  );
}

export default DatesForm;
