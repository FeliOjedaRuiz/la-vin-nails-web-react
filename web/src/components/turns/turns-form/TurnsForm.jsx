import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import turnsService from "../../../services/turns"

function TurnsForm({ onTurnCreation }) {
  const {register, handleSubmit, setError, formState: { errors } } = useForm({ mode: "onBlur" });
  const [serverError, setServerError] = useState(undefined);

  // const turnState = ["Disponible", "Solicitada", "Confirmada", "Cancelada"];

  const onTurnSubmit = async (turn) => {
    console.log(turn)
    try {
      setServerError();
      turn = await turnsService.create(turn);
      onTurnCreation()
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.keys(errors)
          .forEach((inputName) => setError(inputName, { message: errors[inputName] }))
      } else {
        setServerError(error.message)
      }
    }
  }


  return (
    <div className='p-2 pt-1 m-2 bg-white/50 rounded-lg border-2 border-pink-300 shadow-lg'>
      {/* <h2 className='text-center -mt-1 font-bold text-xl text-pink-800'>Agregar turnos</h2> */}
      <form onSubmit={handleSubmit(onTurnSubmit)}>
        {serverError && <div className='text-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white'>{serverError}</div>}
        
        <div className='flex justify-between'>
        <div className="">
          <label for="date" className='ml-2 font-medium text-pink-800 text-sm'>Fecha</label>
          <div><input type="date" placeholder="Hora" {...register("date", { required: "Debes seleccionar un día" })}
            className='rounded-lg w-40 h-8 px-2 border-2 border-pink-300 '
          /></div>
          {errors.date && <div className=" ml-2 text-red-600 font-medium">{errors.date?.message}</div>}
        </div>

        <div className="">
          <label for="hour" className='ml-2 font-medium text-pink-800 text-sm'>Hora</label>
          <div><input type="time" placeholder="Hora" {...register("hour", { required: "Debes seleccionar una hora" })}
            className='rounded-lg w-24 h-8 px-2 border-2 border-pink-300 '
          /></div>
          {errors.hour && <div className=" ml-2 text-red-600 font-medium">{errors.hour?.message}</div>}
        </div>

        {/* <div className="mb-3">
          <label for="state" className='ml-2 font-medium text-pink-800 text-lg'>Estado</label>
          <div>
          <select {...register("state", { required: true })}
            className='rounded border-0 w-80'>
            {turnState.map((turnState) => (
              <option className='w-80' value={turnState}>{turnState}</option>
            ))}         
          </select>
          </div>
          {errors.state && <div className=" ml-2 text-red-600 font-medium">{errors.state?.message}</div>}
        </div> */}
        <div className='flex items-end'>
        <button type='submit' className='text-white shadow-lg h-8 w-8 bg-gradient-to-l from-emerald-700 via-green-500 to-emerald-700 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-full text-xl text-center'>+</button>
        </div>
        </div>
      </form>
    </div>
  )
}

export default TurnsForm