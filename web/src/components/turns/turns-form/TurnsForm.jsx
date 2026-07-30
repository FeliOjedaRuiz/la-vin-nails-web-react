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
  const [isRetiro, setIsRetiro] = useState(false);

  const onTurnSubmit = async (turn) => {
    try {
      setServerError();
      const payload = {
        ...turn,
        category: isRetiro ? "retiro" : "normal",
      };
      turn = await turnsService.create(payload);
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
    <div className="px-2 pt-1 my-1 flex justify-center w-full bg-white/50 rounded-lg border-2 border-pink-300 shadow-md">
      
      <form className="w-full mb-1 flex flex-col" onSubmit={handleSubmit(onTurnSubmit)}>
        {serverError && (
          <div className="text-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white">
            {serverError}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <label
              htmlFor="date"
              className="ml-1 font-medium text-pink-800 text-sm"
            >
              Fecha
            </label>
            <input
              id="date"
              type="date"
              placeholder="Hora"
              {...register("date", { required: "Debes seleccionar un día" })}
              className="rounded-lg w-full h-8 px-2 border-2 border-pink-300"
            />
            {errors.date && (
              <div className="text-xs text-red-600 font-medium">
                {errors.date?.message}
              </div>
            )}
          </div>

          <div className="w-24 shrink-0">
            <label
              htmlFor="hour"
              className="ml-1 font-medium text-pink-800 text-sm"
            >
              Hora
            </label>
            <input
              id="hour"
              type="time"
              placeholder="Hora"
              {...register("hour", {
                required: "Debes seleccionar una hora",
              })}
              className="rounded-lg w-full h-8 px-2 border-2 border-pink-300"
            />
            {errors.hour && (
              <div className="text-xs text-red-600 font-medium">
                {errors.hour?.message}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 mb-1">
            <input
              id="isRetiro"
              type="checkbox"
              checked={isRetiro}
              onChange={(e) => setIsRetiro(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            <label
              htmlFor="isRetiro"
              className="text-xs font-medium text-pink-800 cursor-pointer select-none leading-tight"
            >
              Es turno<br />para retiro
            </label>
          </div>

          <button className="shrink-0 mb-px" type="submit">
            <ButtonGreen styles={" h-8 w-8 text-xl font-bold"}>+</ButtonGreen>
          </button>
        </div>
      </form>
    </div>
  );
}

export default TurnsForm;
