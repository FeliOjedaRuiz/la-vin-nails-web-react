import React from "react";
import Layout from "../components/layouts/Layout";
import UsersSendRestoreEmail from "../components/users/users-send-restore-email/UsersSendRestoreEmail";

function SendRestoreEmailPage() {
  return (
    <>
      <Layout>
        <div className="px-6">
          <h1 className="text-center text-2xl font-bold my-8 text-pink-700">
            ¿Quieres restaurar tu contraseña?
          </h1>

          <div className="border-2 border-emerald-600 rounded-lg p-4 ">
            <p className="text-sm/4 mb-4">
              Ingresa tu email y te enviaremos un correo con un enlace para que
              puedas restaurar tu contraseña.
            </p>
            <UsersSendRestoreEmail />
          </div>
        </div>
      </Layout>
    </>
  );
}

export default SendRestoreEmailPage;
