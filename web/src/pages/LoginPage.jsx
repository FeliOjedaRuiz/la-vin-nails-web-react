import React from 'react';
import UsersLogin from '../components/users/users-login/UsersLogin';
import Layout from '../components/layouts/Layout';
import { NavLink } from 'react-router-dom';

function LoginPage() {
  return (
    <>
      <Layout>
        <div className='p-4'>
          <h1 className='text-center text-3xl font-bold mb-4 text-green-600'>Iniciar sesion</h1>
          <UsersLogin />
          <div className='flex flex-col bg-gradient-to-b from-white to-gray-200 border border-gray-200 rounded-lg shadow mt-8 p-5'>
            <h1 className='text-center text-3xl font-bold text-green-600'>¿No tienes cuenta?</h1>
            <NavLink to="/register" className='text-white bg-pink-700 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-md w-36 self-center px-4 py-1.5 mt-4 text-center'>Registrate</NavLink>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default LoginPage