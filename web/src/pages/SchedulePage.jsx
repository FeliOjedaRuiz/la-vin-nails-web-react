import React, { useState } from "react";
import Layout from "../components/layouts/Layout";
import { HonestWeekPicker } from "../components/week-picker/week-picker-js/HonestWeekPicker";
import TurnsForm from "../components/turns/turns-form/TurnsForm";
import TurnListByWeek from "../components/turns/turn-list-by-week/TurnListByWeek";

function SchedulePage() {
  const [initDate, setInitDate] = useState();
  const [reload, setReload] = useState(false);

  const onInitDate = (date) => {
    setInitDate(date);
  };

  const onTurnCreation = () => {
    setReload(!reload);
  };

  return (
    <>
      <Layout>
        <div className="p-4">
        <h3 className="mb-1 text-center text-2xl font-bold text-emerald-700">
        Turnos de la semana
        </h3>
        <div className="px-2">
          <HonestWeekPicker onInitDate={onInitDate} />
        </div>
        <div>
          <TurnsForm onTurnCreation={onTurnCreation} />
        </div>
        <div>
          <TurnListByWeek initDate={initDate} reload={reload} />
        </div>        
        </div>
      </Layout>
    </>
  );
}

export default SchedulePage;
