import React from 'react'
import Layout from '../components/layouts/Layout'
import UsersForm from './../components/users/users-form/UsersForm';

function RegisterPage() {
  return (
    <>
      <Layout>
        <div>RegisterPage</div>
        <UsersForm />
      </Layout>
    </>
  )
}

export default RegisterPage