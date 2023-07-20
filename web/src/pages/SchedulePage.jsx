import React, { useEffect, useState } from "react";
import Layout from "../components/layouts/Layout";
import TurnsForm from "./../components/turns/turns-form/TurnsForm";
import turnsService from "../services/turns"
import TurnsList from "../components/turns/turns-list/TurnsList";
import TurnsListByDay from "../components/turns/turns-list-by-day/TurnsListByDay";
import WeekSelector from "../components/week-selector/WeekSelector";

function SchedulePage() {
  const [reload, setReload] = useState(false);

  const onTurnCreation = () => {
    setReload(!reload);
  };

  const [turns, setTurns] = useState([]);

  useEffect(() => {
    turnsService
      .list()
      .then((turns) => {
        setTurns(turns);
      })
      .catch((error) => console.error(error));
  }, [reload]);

  return (
    <>
      <Layout>
        <div className="p-6">
          <div className="mb-5 p-5 pt-3 bg-white/30 rounded-lg border-2 border-pink-300 shadow-lg">
            <TurnsForm onTurnCreation={onTurnCreation} />
          </div>
          <div className="p-1 bg-white/50 rounded-lg border-2 border-pink-300 shadow-lg">
            <WeekSelector turns={turns} />
          </div>
        </div>
      </Layout>
    </>
  );
}

export default SchedulePage;
