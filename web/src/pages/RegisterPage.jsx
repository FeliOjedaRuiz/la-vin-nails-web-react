import React from 'react'
import Layout from '../components/layouts/Layout'
import UsersForm from './../components/users/users-form/UsersForm';

function RegisterPage() {
  return (
    <>
      <Layout>
        <h1 className='text-center text-2xl font-bold m-4 text-green-600'>Crea tu cuenta</h1>
        <UsersForm />
        <div className='flex flex-col bg-gradient-to-b from-white to-gray-200 border border-gray-200 rounded-lg shadow mt-6 p-3'>
          <h1 className='text-center text-2xl font-bold text-green-600'>¿Ya tienes cuenta?</h1>
          <button className='text-white bg-pink-700 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-sm w-28 self-center px-4 py-1.5 mt-2 text-center'>Has login</button>
        </div>
      </Layout>
    </>
  )
}

export default RegisterPage