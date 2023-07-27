import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import servicesService from '../services/services';
import DatesForm from '../components/dates/dates-form/DatesForm';
import Layout from '../components/layouts/Layout';

function NewDatePage() {
  const { id } = useParams();
  const [service, setService] = useState({});

  useEffect(() => {
    servicesService.detail(id)
      .then((service) => {
        setService(service)      
      })
      .catch(error => console.error(error));
  }, []);


  return (
    <div>
      <Layout>
        <div>
          <h1>Has elegido {service.name} </h1>
          <DatesForm />
        </div>
      </Layout>
      
    </div>
  )
}

export default NewDatePage