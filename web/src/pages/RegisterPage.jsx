import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layouts/Layout";
import UsersForm from "./../components/users/users-form/UsersForm";
import LoginBanner from "../components/login-banner/LoginBanner";
import settingsApi from "../services/settings";

function RegisterPage() {
  const [isOpen, setIsOpen] = useState(true); // fail-open default
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    settingsApi.getByKey("registration.enabled")
      .then((setting) => {
        const value = setting?.value ?? setting;
        setIsOpen(typeof value === "boolean" ? value : true);
      })
      .catch(() => {
        // fail-open on fetch error
        setIsOpen(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="px-8 pt-4 flex flex-col justify-center items-center">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 animate-spin text-pink-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm text-pink-500">Cargando...</span>
          </div>
        </div>
        <LoginBanner />
      </Layout>
    );
  }

  if (!isOpen) {
    return (
      <Layout>
        <div className="px-8 pt-4 flex flex-col justify-center items-center">
          <div className="text-4xl mb-4"></div>
          <h1 className="text-center text-2xl font-bold mb-3 text-gray-700">
            Registro temporalmente cerrado
          </h1>
          <p className="text-center text-sm text-gray-500 mb-2">
            En este momento no estamos aceptando nuevas clientas.
          </p>
          <p className="text-center text-sm text-gray-500 mb-6">
            Disculpá las molestias. Volvé a intentar más tarde o contactanos por Instagram.
          </p>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold
              bg-pink-600 text-white
              hover:bg-pink-700 active:scale-[0.98]
              transition-all duration-200"
          >
            Ir a iniciar sesión
          </Link>
        </div>
        <LoginBanner />
      </Layout>
    );
  }

  return (
    <>
      <Layout>
        <div className="px-8 pt-4 flex flex-col justify-center items-center">
          <h1 className="text-center text-2xl font-bold mb-4 text-emerald-600">
            Crea tu cuenta
          </h1>
          <UsersForm />
        </div>
        <LoginBanner />
      </Layout>
    </>
  );
}

export default RegisterPage;
