import React from "react";
import Layout from "../components/layouts/Layout";
import TurnsForm from './../components/turns/turns-form/TurnsForm';
import TurnsList from '../components/turns/turns-list/TurnsList';

function SchedulePage() {
  return (
    <>
      <Layout>
        <div className='p-8'>
          <TurnsForm />
          <h1 className='text-3xl mb-5 font-bold text-center color text-pink-700'>Turnos</h1>
          <TurnsList />
        </div>
      </Layout>
    </>
  );
}

export default SchedulePage;
