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
    <form onSubmit={handleSubmit(onUserSubmit)}>
    {serverError && <div>{serverError}</div>}

    <div className='mb-6'>
    <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Nombre</label>
      <input type='text' placeholder='nombre' className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5'
      {...register('name', {
        required: 'Se necesita un nombre'
      })} />
      {errors.name && <div>{errors.name?.message}</div>}
    </div>

    <div className='mb-6'>
    <label for="surname" class="block mb-2 text-sm font-medium text-gray-900">Apellido</label>
      <input type='text' placeholder='Apellido' className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5'
      {...register('surname', {
        required: 'Se necesita un apellido'
      })} />
      {errors.surname && <div>{errors.surname?.message}</div>}
    </div>

    <div className='mb-6'>
    <label for="phone" class="block mb-2 text-sm font-medium text-gray-900">Teléfono</label>
      <input type='number' placeholder='Teléfono' className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5'
      {...register('phone', {
        required: 'Se necesita un número de teléfono'
      })} />
      {errors.phone && <div>{errors.phone?.message}</div>}
    </div>
    
    <div className='mb-6'>
    <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
      <input type='email' placeholder='Email' className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5'
      {...register('email')} />
      {errors.email && <div>{errors.email?.message}</div>}
    </div>
    
    <div className='mb-6'>
    <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Contraseña</label>
      <input type='password' placeholder='Contraseña' className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5'
      {...register('password')} />
      {errors.password && <div>{errors.password?.message}</div>}
    </div>
    <button type='submit' className='text-white bg-teal-500 hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-sm w-full sm:w-auto px-4 py-1.5 text-center '>Register</button>
  </form>
  )
}

export default UsersForm