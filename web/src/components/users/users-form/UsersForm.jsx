import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import usersService from '../../../services/users';

function UsersForm() {
  const { register, handleSubmit, watch, setError, formState: { errors }} = useForm({ mode: 'onBlur' })
  const [serverError, setServerError] = useState(undefined);
  const navigate = useNavigate();

  console.debug(`Tags: ${watch('tags')}`);

  const onUserSubmit = async (user) => {
    try {
      setServerError(undefined);
      console.debug('Registering...')
      user = await usersService.create(user);
      navigate('/login');
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
    <form className='flex flex-col' onSubmit={handleSubmit(onUserSubmit)}>
    {serverError && <div>{serverError}</div>}

    <div className='mb-3'>    
      <input type='text' placeholder='Nombre' className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5'
      {...register('name', {
        required: 'Se necesita un nombre'
      })} />
      {errors.name && <div>{errors.name?.message}</div>}
    </div>

    <div className='mb-3'>    
      <input type='text' placeholder='Apellido' className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5'
      {...register('surname', {
        required: 'Se necesita un apellido'
      })} />
      {errors.surname && <div>{errors.surname?.message}</div>}
    </div>

    <div className='mb-3'>  
      <input type='number' placeholder='Teléfono' className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5'
      {...register('phone', {
        required: 'Se necesita un número de teléfono'
      })} />
      {errors.phone && <div>{errors.phone?.message}</div>}
    </div>
    
    <div className='mb-3'>
      <input type='email' placeholder='Email' className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5'
      {...register('email', {
        required: 'Se necesita un email'
      })} />
      {errors.email && <div>{errors.email?.message}</div>}
    </div>
    
    <div className='mb-3'>    
      <input type='password' placeholder='Contraseña' className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5'
      {...register('password', {
        required: 'Se necesita una contraseña'
      })} />
      {errors.password && <div>{errors.password?.message}</div>}
    </div>
    <button type='submit' className='text-white bg-green-600 hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-md w-36 self-center px-4 py-1.5 mt-2 text-center'>Registrarse</button>
  </form>
  )
}

export default UsersForm