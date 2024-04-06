import React, { useState } from "react";
import { useForm } from "react-hook-form";
import turnsService from "../../../services/turns";
import ButtonGreen from "../../butons/ButtonGreen";

function TurnsForm({ onTurnCreation }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ mode: "onBlur" });
  const [serverError, setServerError] = useState(undefined);

  // const turnState = ["Disponible", "Solicitada", "Confirmada", "Cancelada"];

  const onTurnSubmit = async (turn) => {
    try {
      setServerError();
      turn = await turnsService.create(turn);
      onTurnCreation();
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
    <div className="px-2 pt-1 m-2 flex justify-center max-w-sm w-full bg-white/50 rounded-lg border-2 border-pink-300 shadow-md">
      
      <form className="w-full mb-2" onSubmit={handleSubmit(onTurnSubmit)}>
        {serverError && (
          <div className="text-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white">
            {serverError}
          </div>
        )}

        <div className="flex justify-between">
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
                placeholder="Hora"
                {...register("date", { required: "Debes seleccionar un día" })}
                className="rounded-lg w-40 h-8 px-2 border-2 border-pink-300 "
              />
            </div>
            {errors.date && (
              <div className="text-xs  text-red-600 font-medium">
                {errors.date?.message}
              </div>
            )}
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
                placeholder="Hora"
                {...register("hour", {
                  required: "Debes seleccionar una hora",
                })}
                className="rounded-lg w-24 h-8 px-2 border-2 border-pink-300 "
              />
            </div>
            {errors.hour && (
              <div className="text-xs  text-red-600 font-medium">
                {errors.hour?.message}
              </div>
            )}
          </div>

          <button className="flex items-end">
            <ButtonGreen styles={" h-8 w-8 text-xl font-bold"}>+</ButtonGreen>
          </button>
        </div>
      </form>
    </div>
  );
}

export default TurnsForm;
