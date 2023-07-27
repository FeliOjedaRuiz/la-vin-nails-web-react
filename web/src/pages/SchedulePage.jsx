import React, { useContext } from "react";
import Layout from "../components/layouts/Layout";
import WeekSelector from "../components/week-selector/WeekSelector";
import { AuthContext } from "../contexts/AuthStore";

function SchedulePage() {
  const { user } = useContext(AuthContext)
  const role = user.role

  return (
    <>
      <Layout>
        <div className="p-4">
          <WeekSelector role={role} />        
        </div>
      </Layout>
    </>
  );
}

export default SchedulePage;
