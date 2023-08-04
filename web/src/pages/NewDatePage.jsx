import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import servicesService from '../services/services';
import DatesForm from '../components/dates/dates-form/DatesForm';
import Layout from '../components/layouts/Layout';

function NewDatePage() {
  const { id } = useParams();
  const [service, setService] = useState({});
  const [serviceTypes, setServiceTypes] = useState([]);
  

  useEffect(() => {
    servicesService.detail(id)
      .then((service) => {
        setService(service)
        setServiceTypes(service.type) 
      })
      .catch(error => console.error(error));
  }, []);


  return (
    <div>
      <Layout>
        <div className='p-2'>          
          <DatesForm service={service} serviceTypes={serviceTypes} />
        </div>
      </Layout>      
    </div>
  )
}

export default NewDatePage