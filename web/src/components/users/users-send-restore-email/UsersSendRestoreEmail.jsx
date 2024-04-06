import React, { useState } from "react";
import { useForm } from "react-hook-form";
import usersService from "../../../services/users";
import ButtonGreen from "../../butons/ButtonGreen";
import Modal from "./../../modal/Modal";

function UsersSendRestoreEmail() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ mode: "onBlur" });
  const [serverError, setServerError] = useState(undefined);
  const [modalState, setModalState] = useState(false);

  const onEmailSubmit = async (user) => {
    try {
      setModalState(true)
      setServerError(undefined);      
      const email = user.email;
      user = await usersService.sendRestoreEmail(email);
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
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
    <>
      <form
        className="max-w-md w-full mb-0"
        onSubmit={handleSubmit(onEmailSubmit)}
      > 
        {serverError && (
          <div className="text-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white">
            {serverError}
          </div>
        )}
        <div className="mb-3">
          <label for="email" className="ml-2 font-medium text-pink-800 text-lg">
            E-mail
          </label>
          <input
            type="email"
            placeholder="E-mail"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
            {...register("email", {
              required: "Se necesita un email",
            })}
          />
          {errors.email && (
            <div className=" ml-2 text-red-600 font-medium">
              {errors.email?.message}
            </div>
          )}
        </div>
        <button className="w-full">
          <ButtonGreen styles="w-full text-center mt-6">Enviar</ButtonGreen>
        </button>
      </form>
      <Modal modalState={modalState} setModalState={setModalState}>
        <div className="text-center mb-6">
          <p className="font-bold text-2xl text-pink-700">E-mail enviado</p>
        </div>

        <div className="text-center text-xl font-medium mb-6 text-emerald-700">
          <p>
            Revisa tu casilla de E-mail y encontraras el enlace para restaurar
            tu 
          </p>
        </div>

        <div className="flex justify-around">
          <button
            onClick={() => setModalState(!modalState)}
            className="text-white  px-4 py-1 rounded bg-emerald-700 hover:bg-emerald-800 hover:ring-2 hover:ring-emerald-500 focus:ring-2 focus:ring-emerald-500"
          >
            Ok
          </button>
        </div>
      </Modal>
    </>
  );
}

export default UsersSendRestoreEmail;
