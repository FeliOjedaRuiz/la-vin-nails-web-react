import React, { useEffect, useState } from 'react';
import servicesService from '../services/services';
import Layout from '../components/layouts/Layout'
import ServiceList from '../components/services/service-list/ServiceList';

function ServicesPage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    servicesService.list()
      .then((services) => {
        setServices(services)        
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <>
      <Layout>
        <div>
          <h1 className='text-3xl mb-3 font-bold text-center color text-pink-600'>Servicios ofrecidos</h1>
          <ServiceList services={services} />
        </div>
      </Layout>
    </>
  );
}

export default ServicesPage;