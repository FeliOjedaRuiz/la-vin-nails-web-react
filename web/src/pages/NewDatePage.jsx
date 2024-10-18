import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import servicesService from "../services/services";
import DatesForm from "../components/dates/dates-form/DatesForm";
import Layout from "../components/layouts/Layout";
import Notices from "../components/notices/Notices";

function NewDatePage() {
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
      <Notices />
      <Layout>
        <div className="p-1.5">
          <DatesForm service={service} serviceTypes={serviceTypes} />
        </div>
      </Layout>
    </div>
  );
}

export default NewDatePage;
