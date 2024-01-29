import React from "react";
import UsersLogin from "../components/users/users-login/UsersLogin";
import Layout from "../components/layouts/Layout";
import { NavLink } from "react-router-dom";
import ButtonPrimary from "../components/butons/ButtonPrimary";

function LoginPage() {
  return (
    <>
      <Layout>
        <div className="p-8">
          <h1 className="text-center text-2xl font-bold mb-4 text-green-600">
            Iniciar sesion
          </h1>
          <UsersLogin />
        </div>
        <div className="flex flex-col items-center p-6 mt-5 overflow-hidden ">
          <h1
            className="transition delay-300 duration-1000 translate-x-96
          text-4xl mb-3 relative right-96 font-extrabold text-center text-emerald-700"
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
