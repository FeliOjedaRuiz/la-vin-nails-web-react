import React from 'react'
import Layout from '../components/layouts/Layout'
import UsersRestorePassword from '../components/users/users-restore-password/UsersRestorePassword'

function RestorePasswordPage() {
  return (
    <>
      <Layout>
        <div className="px-6 flex flex-col items-center justify-center">
          <h1 className="text-center text-2xl font-bold my-8 text-emerald-700">
            Restaurar contraseña
          </h1>

          <div className="border-2 border-pink-600 rounded-lg p-4 ">
            <p className="text-sm/4 mb-4">
              Ingresa tu nueva contraseña y luego pulsa guardar.
            </p>
            <UsersRestorePassword />
          </div>
        </div>
      </Layout>
    </>
  )
}

export default RestorePasswordPage