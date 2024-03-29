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

  const onInitDate = (date) => {
    setInitDate(date);
  };

  const onTurnSelection = (turn) => {
    setSelectedTurn(turn);
  };

  useEffect(() => {
    setSelectedDate(selectedTurn.date);
  }, [selectedTurn]);

  const months = [
    "Enero",
    "Feb.",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Ago.",
    "Sept.",
    "Oct.",
    "Nov.",
    "Dic.",
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

  // const nodemailer = require("nodemailer");

  // const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: "melisaoviedo.92.22@gmail.com",
  //     pass: EMAIL_PASSWORD,
  //   },
  // });

  const onDateSubmit = async (date) => {
    date.user = user.id;
    date.service = service.id;
    date.turn = selectedTurn.id;
    try {
      setServerError(undefined);
      console.debug("Sending date application...");
      date = await datesService.create(date);
      onTurnSubmit();
      // transporter
      //   .sendMail({
      //     from: "La Vin Nails Admin <melisaoviedo.92.22@gmail.com>",
      //     to: "m.o.92gm@gmail.com",
      //     subject: "Nueva solicitud de cita",
      //     html: `<h1>Tienes una nueva solicitud de cita</h1> <h3>De: ${user.name} ${user.surname}</h3> <h3>mail: ${user.email} </h3> <h3>Móvil: +34 ${user.phone} </h3> <h3>Servicio: ${service.name}</h3> <h3>Día: ${selectedTurn.date} hora: ${selectedTurn.turn.hour}</h3> <a href="https://la-vin-nails-app.fly.dev/">Ir a la app</a>`,
      //   })
      //   .then((info) => console.log(info))
      //   .catch((error) => console.log(error));
      navigate("/profile");
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
    <div className="relative flex flex-col items-center ">
      <form className="flex flex-col" onSubmit={handleSubmit(onDateSubmit)}>
        {serverError && (
          <div className="self-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white">
            {serverError}
          </div>
        )}
        <div className="flex flex-col p-2 justify-center items-center ">
          <div className="flex flex-col p-2 rounded-xl w-full max-w-2xl border-4 border-emerald-700  bg-emerald-500 ">
            <p className="text-center text-xl font-medium text-white ">
              Solicitud de cita para:
            </p>
            <p className="font-semibold text-white text-center text-md self-center">
              {service.name}
            </p>
          </div>
          <p className="ml-2 mt-5 font-bold leading-tight text-pink-600 text-xl self-center text-center">
            Completa los siguientes 4 pasos:
          </p>
          <div className="mb-2 mt-3 p-3 border-2 border-emerald-500 rounded-lg w-full max-w-2xl">
            <label
              for="type"
              className="ml-1 text-emerald-800 font-bold text-md md:text-lg lg:text-xl"
            >
              1- Selecciona una opción de servicio:
            </label>
            <div>
              <select
                {...register("type", {
                  required: "Debes seleccionar un tipo de decoración.",
                })}
                className="rounded-lg bg-white pl-1 h-9 w-full mt-2 text-emerald-700 font-medium border-2 border-pink-300 "
              >
                {serviceTypes.map((type) => (
                  <option className="w-80 font-medium" value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && (
                <div className=" ml-2 mt-2 text-red-600 font-medium">
                  {errors.type?.message}
                </div>
              )}
            </div>
          </div>
          <div className="mb-2 mt-3 p-3 border-2 border-emerald-500 rounded-lg w-full max-w-2xl">
            <label
              for="designDetails"
              className="ml-1 text-emerald-800 font-bold text-md md:text-lg lg:text-xl"
            >
              2- Describe los detalles:
            </label>
            <textarea
              placeholder="Describe los detalles del diseño..."
              className="bg-white mt-2 border-2 text-emerald-700 border-pink-300 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
              {...register("designDetails", {
                required: "Son necesarios los detalles",
                minLength: {
                  value: 5,
                  message: "Se necesitan al menos 5 caracteres",
                },
                maxLength: {
                  value: 300,
                  message: "Máximo 300 caracteres",
                },
              })}
            />
            {errors.designDetails && (
              <div className=" ml-2 mt-2 text-red-600 font-medium">
                {errors.designDetails?.message}
              </div>
            )}
          </div>
          <div className="mb-2 mt-3 p-3 border-2 border-emerald-500 rounded-lg w-full max-w-2xl">
            <label
              for="needRemove"
              className="ml-1 text-emerald-800 font-bold text-md md:text-lg lg:text-xl tracking-tight"
            >
              3- ¿Traes uñas limpias o hay que retirar?
            </label>
            <div className="ml-1 mt-2 flex items-center justify-around font-medium text-emerald-700">
              <div className="flex items-center">
                <span>Uñas limpias</span>
                <input
                  className="mr-4 ml-2 h-5 w-5 hover:ring-pink-600 hover:bg-pink-600"
                  {...register("needRemove", {
                    required: "Debes seleccionar una opción.",
                  })}
                  type="radio"
                  value="No"
                />
              </div>
              <div className="flex items-center">
                <span>Con remoción</span>
                <input
                  className="mr-4 ml-2 h-5 w-5 hover:ring-pink-600 hover:bg-pink-600"
                  type="radio"
                  value="Sí"
                  {...register("needRemove", {
                    required: "Debes seleccionar una opción.",
                  })}
                />
              </div>
              {/* {errors.needRemove && (
              <div className=" ml-2 text-red-600 font-medium">
                {errors.needRemove?.message}
              </div>
            )} */}
            </div>
            {errors.needRemove && (
              <div className=" ml-2 mt-2 text-red-600 font-medium">
                {errors.needRemove?.message}
              </div>
            )}
          </div>
        </div>
        <div className="mb-2 m-2 pt-3 p-2 border-2 border-emerald-500 rounded-lg">
          <p className="ml-2 mb-2 text-emerald-800 font-bold text-md md:text-lg lg:text-xl">
            4- Selecciona un turno
          </p>
          <div className="px-2 flex justify-center mb-3">
            <HonestWeekPicker onInitDate={onInitDate} />
          </div>
          <div>
            <TurnListByWeek
              initDate={initDate}
              onTurnSelection={onTurnSelection}
            />
          </div>
        </div>

        <div className="flex flex-col p-2 justify-center items-center mt-2 ">
          {selectedTurn.hour && (
            <div className=" bg-lime-50 border-2 border-lime-500 rounded-lg text-center  font-medium py-3 px-5 shadow">
              <p className="text-lg leading-tight text-emerald-700">
                {" "}
                Turno selecionado:{" "}
              </p>
              <p className="text-lg font-bold leading-tight text-emerald-700">
                {showDate(selectedDate)} a las {selectedTurn.hour}{" "}
              </p>
            </div>
          )}

          {!selectedTurn.hour && (
            <div className=" bg-yellow-500 rounded-md text-center text-lg font-medium py-1.5 px-3  shadow-md">
              <p>Debes seleccionar un turno</p>
            </div>
          )}

          <Modal modalState={modalState} setModalState={setModalState}>
            <div className="mb-8">
              <p className="text-center leading-tight font-bold text-4xl uppercase mb-1 text-pink-700">
                ¡Atención!
              </p>
              <p className="text-center leading-tight font-bold text-lg text-emerald-600">
                Para poder solicitar tu cita es imprescindible completar los 4
                pasos anteriores.
              </p>
            </div>
            <div className="text-center  leading-tight  mb-6">
              <p className="font-medium">
                Solicitar cita de{" "}
                <span className="text-pink-700 font-bold">{service.name}</span>{" "}
                para el{" "}
              </p>
              <p className="font-bold text-pink-700">
                {showDate(selectedDate)} a las {selectedTurn.hour} hs.
              </p>
            </div>

            <div className="text-center text-xl mb-6 font-medium leading-tight text-emerald-700">
              <p>Tu solicitud será confirmada a la mayor brevedad posible.</p>
            </div>

            <div className="flex justify-around font-medium text-lg">
              <button
                onClick={() => setModalState(!modalState)}
                className="bg-red-600 text-white  px-2 py-1 rounded "
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-emerald-600 text-white  px-2 py-1 rounded "
              >
                Aceptar
              </button>
            </div>
          </Modal>
        </div>
      </form>
      {selectedTurn.hour && (
        <div className="p-2">
          <button
            onClick={() => setModalState(!modalState)}
            className="text-white w-full bg-gradient-to-l from-emerald-700 via-emerald-500 to-emerald-700 shadow hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-xl self-center px-4 py-1.5 mt-2 text-center"
          >
            Solicitar cita
          </button>
        </div>
      )}
      {!selectedTurn.hour && (
        <div className="p-2">
          <button className="text-gray-500 w-full bg-gray-300 shadow  font-medium rounded-lg text-xl self-center px-4 py-1.5 mt-2 text-center">
            Solicitar cita
          </button>
        </div>
      )}
    </div>
  );
}

export default DatesForm;
