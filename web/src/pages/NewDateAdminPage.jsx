import React, { useEffect, useState } from 'react'
import Layout from '../components/layouts/Layout'
import DatesFormAdmin from '../components/dates/dates-form/DatesFormAdmin'
import { useParams } from 'react-router-dom';
import servicesService from "../services/services";

function NewDateAdminPage() {
  const { id } = useParams();
  const [service, setService] = useState({});
  const [serviceTypes, setServiceTypes] = useState([]);

  useEffect(() => {
    servicesService
      .detail(id)
      .then((service) => {
        setService(service);
        setServiceTypes(service.type);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <Layout>
        <div className="p-1.5">
          <DatesFormAdmin service={service} serviceTypes={serviceTypes} />
        </div>
      </Layout>
    </div>
  )
}

export default NewDateAdminPage