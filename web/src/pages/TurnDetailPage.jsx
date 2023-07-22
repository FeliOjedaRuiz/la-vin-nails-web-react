import React from "react";
import Layout from "../components/layouts/Layout";

import TurnDetailCard from "../components/turns/turn-detail-card/TurnDetailCard";

function TurnDetailPage() {
  

  return (
    <>
      <Layout>
        <div className="p-4">
          <h1 className="text-2xl mb-5 font-bold text-center color text-pink-700">
            Detalle del turno
          </h1>
          <TurnDetailCard />
        </div>
      </Layout>
    </>
  );
}

export default TurnDetailPage;
