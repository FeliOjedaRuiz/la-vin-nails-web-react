import React from "react";
import Layout from "../components/layouts/Layout";
import TurnsForm from './../components/turns/turns-form/TurnsForm';
import TurnsList from '../components/turns/turns-list/TurnsList';
import TurnsListByDay from "../components/turns/turns-list-by-day/TurnsListByDay";
import WeekPicker from "../components/week-picker/WeekPicker";
import WeekSelector from "../components/week-selector/WeekSelector";

function SchedulePage() {


  return (
    <>
      <Layout>
        <div className='p-8'>
          <TurnsForm />
          <h1 className='text-3xl mb-5 font-bold text-center color text-pink-700'>Turnos</h1>       
          <WeekSelector />
        </div>
      </Layout>
    </>
  );
}

export default SchedulePage;
