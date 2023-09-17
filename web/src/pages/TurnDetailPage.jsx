import React from "react";
import Layout from "../components/layouts/Layout";
import TurnDetailAndUpdate from "../components/turns/turn-detail-and-update/TurnDetailAndUpdate";
import { useNavigate } from "react-router-dom";

function TurnDetailPage() {
  const navigate = useNavigate();

  return (
    <>
      <Layout>
        <div className="p-4">
          <TurnDetailAndUpdate />
        </div>
        {/* <button onClick={() => navigate(-1)}>Go back</button> */}
      </Layout>
    </>
  );
}

export default TurnDetailPage;
