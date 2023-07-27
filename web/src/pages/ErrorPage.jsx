import React from 'react'
import Layout from '../components/layouts/Layout'
import errorImage from '../images/error500.png'

function ErrorPage() {
  return (
    <>
      <Layout>
        <div className='flex flex-col justify-center p-4'>
          <div className='text-center text-3xl'>
            Error Page
          </div>
          <div>
            <img alt='Oops! Error' src={errorImage}></img>
          </div>          
        </div>
      </Layout>
    </>
  )
}

export default ErrorPage