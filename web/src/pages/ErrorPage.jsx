import React from "react";
import Layout from "../components/layouts/Layout";
import errorImage from "../images/error500.png";

function ErrorPage() {
  return (
    <>
      <Layout>
        <div className="flex flex-col h-full justify-center items-center p-4">
          <p className="text-5xl -mb-16 font-bold text-pink-600">¡Opps!</p>
          <img className="max-w-xs" alt="Oops! Error" src={errorImage}></img>
          <p className="text-lg/5 text-center font-medium text-emerald-700">
            Ah ocurrido un error inesperado.
          </p>
          <div className="max-w-xs text-center mt-10">
            <p className="text-sm/4 font-medium text-pink-700">
              Disculpa el inconveniente, si el error persite, comunicate con el
              administrador.{" "}
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default ErrorPage;
