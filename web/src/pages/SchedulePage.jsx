import React, { useEffect, useState } from "react";
import Layout from "../components/layouts/Layout";
import TurnsForm from "./../components/turns/turns-form/TurnsForm";
import TurnsList from "../components/turns/turns-list/TurnsList";
import TurnsListByDay from "../components/turns/turns-list-by-day/TurnsListByDay";
import WeekSelector from "../components/week-selector/WeekSelector";

function SchedulePage() {
  

  return (
    <>
      <Layout>
        <div className="p-4">
          <WeekSelector />        
        </div>
      </Layout>
    </>
  );
}

export default SchedulePage;
