import React from "react";
import Layout from "../components/layouts/Layout";

import TurnDetailAndUpdate from "../components/turns/turn-detail-and-update/TurnDetailAndUpdate";

function TurnDetailPage() {
  

  return (
    <>
      <Layout>
        <div className="p-4">
          <h1 className="text-2xl mb-5 font-bold text-center color text-pink-700">
            Detalle del turno
          </h1>
          <TurnDetailAndUpdate />
        </div>
      </Layout>
    </>
  );
}

export default TurnDetailPage;
