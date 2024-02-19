import React from "react";
import Layout from "../components/layouts/Layout";
import ServiceList from "../components/services/service-list/ServiceList";

function ServicesPage() {
  return (
    <>
      <Layout>
        <div className="p-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl m-5 font-bold text-center color text-pink-700">
            Servicios ofrecidos
          </h1>
          <ServiceList />
        </div>
      </Layout>
    </>
  );
}

export default ServicesPage;
