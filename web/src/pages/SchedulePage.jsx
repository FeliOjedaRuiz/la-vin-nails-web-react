import React from "react";
import Layout from "../components/layouts/Layout";
import TurnsForm from './../components/turns/turns-form/TurnsForm';

function SchedulePage() {
  return (
    <>
      <Layout>
        <div>
          <TurnsForm />          
        </div>
      </Layout>
    </>
  );
}

export default SchedulePage;
