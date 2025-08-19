import React, { useEffect, useState } from "react";
import Layout from "../components/layouts/Layout";
import { HonestWeekPicker } from "../components/week-picker/week-picker-js/HonestWeekPicker";
import TurnsForm from "../components/turns/turns-form/TurnsForm";
import TurnsListByWeekAdmin from "../components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin";
import { useCallback } from "react";

function SchedulePageAdmin() {
  const [initDate, setInitDate] = useState("2025-01-01");
  const [reload, setReload] = useState(false);

  const onInitDate = useCallback((date) => {
      setInitDate(date);
    }, []);
  

  useEffect(() => {
    setReload(!reload);
  }, [initDate]);

  const onTurnCreation = () => {
    setReload(!reload);
  };

  return (
    <Layout>
      <div className="p-4 flex flex-col justify-evenly h-full">
        <h3 className="mb-2 text-center text-2xl md:text-4xl lg:text-5xl font-bold text-emerald-700">
          Turnos de la semana
        </h3>
        <div className="px-2 flex justify-center mb-3">
          <HonestWeekPicker onInitDate={onInitDate} />
        </div>
        <div className="flex justify-center">
          <TurnsForm onTurnCreation={onTurnCreation} />
        </div>
        <div>
          <TurnsListByWeekAdmin initDate={initDate} reload={reload} />
        </div>
      </div>
    </Layout>
  );
}

export default SchedulePageAdmin;
