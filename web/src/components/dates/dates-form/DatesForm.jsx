import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../contexts/AuthStore';
import { useForm } from 'react-hook-form';
import datesService from '../../../services/dates'
import { useNavigate } from 'react-router-dom';



function DatesForm({ service, serviceTypes }) {
  const {register, handleSubmit, setError, formState: { errors } } = useForm({ mode: "onBlur" });
  const [serverError, setServerError] = useState(undefined);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext)

  const onDateSubmit = async (date) => {
    date.user = user.id
    date.service = service.id
    try {
      setServerError(undefined);
      console.debug('Sending date application...')
      date = await datesService.create(date);
      navigate('/schedule');
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        console.error(error.message, errors);
        Object.keys(errors)
          .forEach((inputName) => setError(inputName, { message: errors[inputName] }));
      } else {
        console.error(error);
        setServerError(error.message);
      }
    }
  }
  




  return (
    <form className='flex flex-col' onSubmit={handleSubmit(onDateSubmit)}>
    {serverError && <div className='self-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white' >{serverError}</div>}
      <h1>Has elegido {service.name} </h1>
      <div className="mb-3">
        <label for="type" className='ml-2 font-medium text-pink-800 text-lg'>Selecciona tipo de servicio</label>
        <div>
        <select {...register("type", { required: true })}
          className='rounded border-0 w-80'>
          {serviceTypes.map((type) => (
            <option className='w-80' value={type}>{type}</option>
          ))}         
        </select>
        </div>
        {errors.state && <div className=" ml-2 text-red-600 font-medium">{errors.state?.message}</div>}
      </div>
      <div className='mb-2'>
        <label for="designDetails" className='ml-2 font-medium text-pink-800 text-lg'>Detalles</label>   
        <textarea placeholder='Describe los detalles del diseño...' className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5'
        {...register('designDetails', {
          required: "Son necesarios los detalles",
          minLength: {
            value: 2,
            message: "Se necesitan al menos 5 caracteres"},
          maxLength: {
            value: 300,
            message: "Máximo 300 caracteres",}
        })} />
        {errors.name && <div className=" ml-2 text-red-600 font-medium">{errors.name?.message}</div>}
      </div>
      <button type='submit' className='text-white w-full bg-gradient-to-l from-emerald-700 via-green-500 to-emerald-700 shadow hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-md self-center px-4 py-1.5 mt-2 text-center'>Solicitar cita</button>
    </form>
  
  )
}

export default DatesForm