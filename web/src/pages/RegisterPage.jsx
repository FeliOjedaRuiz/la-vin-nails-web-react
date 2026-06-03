import React, { useState, useEffect } from "react";
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
        <div className="px-6 pt-6 flex flex-col items-center animate-fade-in-down">
          {/* Closed state card */}
          <div className="w-full max-w-sm rounded-2xl border border-pink-100 bg-gradient-to-b from-pink-50/80 to-white shadow-sm overflow-hidden mb-6">
            {/* Icon header */}
            <div className="flex justify-center pt-6 pb-2">
              <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 text-center">
              <p className="text-sm font-medium text-pink-500 mb-1">¡Lo siento!</p>
              <h1 className="text-2xl font-bold text-pink-800 mb-3">
                Registro temporalmente cerrado
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                En este momento no podemos aceptar más clientas, vuelve a intentarlo más adelante.
              </p>
            </div>
          </div>
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
