import React, { useEffect, useState } from "react";
import Layout from "../components/layouts/Layout";
import { HonestWeekPicker } from "../components/week-picker/week-picker-js/HonestWeekPicker";
import TurnsForm from "../components/turns/turns-form/TurnsForm";
import TurnsListByWeekAdmin from "../components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin";

function SchedulePage() {
  const [initDate, setInitDate] = useState();
  const [reload, setReload] = useState(false);

  const onInitDate = (date) => {
    setInitDate(date);
  };

  useEffect(() => {
    setReload(!reload);
  }, []);

  const onTurnCreation = () => {
    setReload(!reload);
  };

  return (
    <Layout>
      <div className="">
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
            <TurnsListByWeekAdmin initDate={initDate} reload={reload} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SchedulePage;
