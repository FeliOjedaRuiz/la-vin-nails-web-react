import React from 'react';
import UsersLogin from '../components/users/users-login/UsersLogin';
import Layout from '../components/layouts/Layout';
import { NavLink } from 'react-router-dom';

function LoginPage() {
  return (
    <>
      <Layout>
        <div className='p-8'>
        <h1 className='text-center text-2xl font-bold mb-4 text-green-600'>Iniciar sesion</h1>
        <UsersLogin />
        </div>
        {/* <div className='flex flex-col bg-gradient-to-b from-white to-gray-200 border border-gray-200 rounded-lg shadow mt-8 p-5'>
          <h1 className='text-center text-3xl font-bold text-green-600'>¿No tienes cuenta?</h1>
          <NavLink to="/register" className='text-white bg-pink-700 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-md w-36 self-center px-4 py-1.5 mt-4 text-center'>Registrate</NavLink>
        </div> */}
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
          <NavLink
            to="/register"
            className="font-medium  mx-5 text-center text-lg w-32 py-1.5 self-center rounded-md shadow text-white
            bg-gradient-to-r from-pink-500 via-teal-500 via-60% to-green-600 to-90% hover:bg-green-700 focus:ring-4 focus:ring-pink-300"
          >
            {"Regístrate"}
          </NavLink>
        </div>        
      </Layout>
    </>
  )
}

export default LoginPage