import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import usersService from "../../../services/users";

function UsersForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ mode: "onBlur" });
  const [serverError, setServerError] = useState(undefined);
  const navigate = useNavigate();

  const onUserSubmit = async (user) => {
    try {
      setServerError(undefined);
      console.debug("Registering...");
      user = await usersService.create(user);
      navigate("/login");
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

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onUserSubmit)}>
      {serverError && (
        <div className="self-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white">
          {serverError}
        </div>
      )}

      <div className="mb-2">
        <label for="name" className="ml-2 font-medium text-pink-800 text-lg">
          Nombre
        </label>
        <input
          type="text"
          placeholder="Jane"
          className="bg-white border border-pink-300 text-emerald-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
          {...register("name", {
            required: "Es necesario un nombre",
            minLength: {
              value: 2,
              message: "Se necesitan al menos 2 caracteres",
            },
            maxLength: {
              value: 20,
              message: "Máximo 20 caracteres",
            },
          })}
        />
        {errors.name && (
          <div className=" ml-2 text-red-600 font-medium">
            {errors.name?.message}
          </div>
        )}
      </div>

      <div className="mb-2">
        <label for="surname" className="ml-2 font-medium text-pink-800 text-lg">
          Apellido
        </label>
        <input
          type="text"
          placeholder="Doe"
          className="bg-white border border-pink-300 text-emerald-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
          {...register("surname", {
            required: "Se necesita un apellido",
            minLength: {
              value: 2,
              message: "Se necesitan al menos 2 caracteres",
            },
            maxLength: {
              value: 20,
              message: "Máximo 20 caracteres",
            },
          })}
        />
        {errors.surname && (
          <div className=" ml-2 text-red-600 font-medium">
            {errors.surname?.message}
          </div>
        )}
      </div>

      <div className="mb-2">
        <label for="phone" className="ml-2 font-medium text-pink-800 text-lg">
          Teléfono
        </label>
        <div className="flex">
          <div className="bg-white border border-pink-300 text-emerald-700 font-bold rounded-s-lg focus:ring-teal-500 focus:border-teal-500 p-2.5">
            +34
          </div>
          <input
            type="number"
            placeholder="XXX-XXX-XXX"
            className=" inline bg-white border border-pink-300 text-emerald-700 rounded-e-lg focus:ring-teal-500 focus:border-teal-500 w-full p-2.5"
            {...register("phone", {
              required: "Se necesita un número de teléfono",
              maxLength: {
                value: 12,
                message: "Máximo 12 números",
              },
            })}
          />
        </div>
        {errors.phone && (
          <div className=" ml-2 text-red-600 font-medium">
            {errors.phone?.message}
          </div>
        )}
      </div>

      <div className="mb-2">
        <label for="email" className="ml-2 font-medium text-pink-800 text-lg">
          E-mail
        </label>
        <input
          type="email"
          placeholder="user@example.org"
          className="bg-white border border-pink-300 text-emerald-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
          {...register("email", {
            required: "Se necesita un email",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Es necesario un email valido",
            },
          })}
        />
        {errors.email && (
          <div className=" ml-2 text-red-600 font-medium">
            {errors.email?.message}
          </div>
        )}
      </div>

      <div className="mb-2">
        <label
          for="password"
          className="ml-2 font-medium text-pink-800 text-lg"
        >
          Contraseña
        </label>
        <input
          type="password"
          placeholder="********"
          className="bg-white border border-pink-300 text-emerald-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
          {...register("password", {
            required: "Se necesita una contraseña",
            minLength: {
              value: 8,
              message: "Largo minimo 8 caracteres",
            },
          })}
        />
        {errors.password && (
          <div className=" ml-2 text-red-600 font-medium">
            {errors.password?.message}
          </div>
        )}
      </div>
      <button
        type="submit"
        className="text-white w-full bg-gradient-to-l from-emerald-700 via-green-500 to-emerald-700 shadow hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-md self-center px-4 py-1.5 mt-2 text-center"
      >
        Registrarse
      </button>
    </form>
  );
}

export default UsersForm;
