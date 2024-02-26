import React from "react";
import Layout from "../components/layouts/Layout";
import ButtonGreen from "./../components/butons/ButtonGreen";

function RestorePasswordPage() {
  return (
    <>
      <Layout>
        <div className="px-8 pt-4">
          <h1 className="text-center text-2xl font-bold mb-4 text-pink-700">
            Restaurar contraseña
          </h1>
          <div>
            <p className="leading-5">
              1- Ingresa tu email y enviaremos un token para restaurar tu
              contraseña
            </p>
            <div className="border-2 border-emerald-600 rounded-lg p-2">
              <form action="">
                <input type="text" />
                <ButtonGreen>Eniar Token</ButtonGreen>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default RestorePasswordPage;
