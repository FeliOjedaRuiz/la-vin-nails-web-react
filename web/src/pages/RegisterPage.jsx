import React from 'react'
import Layout from '../components/layouts/Layout'
import UsersForm from './../components/users/users-form/UsersForm';
import { NavLink } from 'react-router-dom';
import LoginBanner from '../components/login-banner/LoginBanner';

function RegisterPage() {
  return (
    <>
      <Layout>
        <div className='p-4'>
          <h1 className='text-center text-3xl font-bold mb-4 text-green-600'>Crea tu cuenta</h1>
          <UsersForm />          
        </div>
        <LoginBanner />
      </Layout>
    </>
  )
}

export default RegisterPage