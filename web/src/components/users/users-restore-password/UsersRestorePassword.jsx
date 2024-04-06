import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import usersService from "../../../services/users";
import ButtonGreen from "../../butons/ButtonGreen";

function UsersRestorePassword() {
  const { userId } = useParams();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ mode: "onBlur" });
  const [serverError, setServerError] = useState(undefined);
  const navigate = useNavigate();

  const onPasswordSubmit = async (user) => {
    try {
      setServerError();
      user = await usersService.restorePassword(user, userId);
      navigate("/login");
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
    <>
      <form
        className="max-w-md w-full mb-0"
        onSubmit={handleSubmit(onPasswordSubmit)}
      >
        {serverError && (
          <div className="text-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white">
            {serverError}
          </div>
        )}
        <div className="mb-3">
          <label
            for="password"
            className="ml-2 font-medium text-pink-800 text-lg"
          >
            Nueva contraseña
          </label>
          <input
            type="password"
            placeholder="Nueva contraseña"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
            {...register("password", {
              required: "Se necesita una contraseña",
            })}
          />
          {errors.password && (
            <div className=" ml-2 text-red-600 font-medium">
              {errors.password?.message}
            </div>
          )}
        </div>
        <button className="w-full">
          <ButtonGreen styles="w-full text-center mt-6">Guardar</ButtonGreen>
        </button>
      </form>
    </>
  );
}

export default UsersRestorePassword;
