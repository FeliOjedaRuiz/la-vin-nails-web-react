import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import usersService from "../../../services/users";
import { AuthContext } from "../../../contexts/AuthStore";
import { useNavigate } from "react-router-dom";

function UsersLogin() {
  const {register, handleSubmit, setError, formState: { errors } } = useForm({ mode: "onBlur" });
  const [serverError, setServerError] = useState(undefined);
  const { onUserChange } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLoginSubmit = async (user) => {
    console.log(user)
    try {
      setServerError();
      user = await usersService.login(user);
      onUserChange(user);
      navigate('/profile')
    } catch (error) {       
      const errors = error.response?.data?.errors;
      console.log(`MMM${errors}`)  
      if (errors) {
        Object.keys(errors)
          .forEach((inputName) => setError(inputName, { message: errors[inputName] }))
      } else {
        setServerError(error.message)
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onLoginSubmit)}>
        {serverError && <div className='text-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white'>{serverError}</div>}
        <div className="mb-3">
          <label for="email" className='ml-2 font-medium text-pink-800 text-lg'>E-mail</label>
          <input
            type="email"
            placeholder="Email"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
            {...register("email", {
              required: "Se necesita un email",
            })}
          />
          {errors.email && <div className=" ml-2 text-red-600 font-medium">{errors.email?.message}</div>}
        </div>

        <div className="mb-3">
          <label for="password" className='ml-2 font-medium text-pink-800 text-lg'>Contraseña</label>    
          <input
            type="password"
            placeholder="Contraseña"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
            {...register("password", {
              required: "Se necesita una contraseña",
            })}
          />
          {errors.password && <div className=" ml-2 text-red-600 font-medium">{errors.password?.message}</div>}
        </div>
        <button type='submit' className='text-white w-full bg-gradient-to-l from-emerald-700 via-green-500 to-emerald-700 shadow hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-md self-center py-1.5 mt-2 text-center'>Comenzar</button>
      </form>
    </>
  );
}

export default UsersLogin;
