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
        <div className='p-6'>
          <div className="mb-5 p-5 pt-3 bg-white/30 rounded-lg border-2 border-pink-300 shadow-lg">
            <TurnsForm />
          </div>
          <div className="p-1 bg-white/50 rounded-lg border-2 border-pink-300 shadow-lg">
            <WeekSelector />
          </div>
        </div>
      </Layout>
    </>
  );
}

export default SchedulePage;
