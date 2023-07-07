import React from 'react';
import Layout from '../components/layouts/Layout'
import ServiceList from '../components/services/service-list/ServiceList';

function ServicesPage() {
  
  return (
    <>
      <Layout>
        <div className='p-4'>
          <h1 className='text-3xl mb-5 font-bold text-center color text-pink-600'>Servicios ofrecidos</h1>
          <ServiceList />
        </div>
      </Layout>
    </>
  );
}

export default ServicesPage;