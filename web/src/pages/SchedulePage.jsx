import React from "react";
import Layout from "../components/layouts/Layout";
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
