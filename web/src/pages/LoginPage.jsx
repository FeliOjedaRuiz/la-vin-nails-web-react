import React from "react";
import UsersLogin from "../components/users/users-login/UsersLogin";
import Layout from "../components/layouts/Layout";
import { Link, NavLink } from "react-router-dom";
import ButtonPrimary from "../components/butons/ButtonPrimary";

function LoginPage() {
  return (
    <>
      <Layout>
        <div className="p-8 flex flex-col justify-center items-center">
          <h1 className="text-2xl sm:text-4xl font-bold mb-1  text-emerald-600">
            Inicia sesion 
          </h1>
          <p className="mb-8 text-center text-pink-600 text-xl leading-5">Administra tus citas y <br /> perfil de usuario. </p>
          <UsersLogin />
          <Link
            to="/restore"
            className="text-center font-medium leading-5 text-pink-600"
          >
            <p className="font-bold mt-2">¿Olvidaste tu contraseña?</p>
            <p>Click aqui para restaurarla.</p>
          </Link>
        </div>
        <div className="flex flex-col items-center p-6 mt-5 overflow-hidden ">
          <h1
            className="transition delay-300 duration-1000 translate-x-96
          text-2xl sm:text-4xl mb-3 relative right-96 font-extrabold text-center text-emerald-700"
          >
            ¿No tienes cuenta?
          </h1>
          <p className="mb-6 text-xl/5 text-center font-medium text-pink-800">
            Accede para agendar tu cita <br /> y conseguir descuentos.
          </p>
          <NavLink to="/register">
            <ButtonPrimary>Regístrate</ButtonPrimary>
          </NavLink>
        </div>
      </Layout>
    </>
  );
}

export default LoginPage;
