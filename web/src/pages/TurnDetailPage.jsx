import React from "react";
import Layout from "../components/layouts/Layout";

import TurnDetailAndUpdate from "../components/turns/turn-detail-and-update/TurnDetailAndUpdate";

function TurnDetailPage() {
  

  return (
    <>
      <Layout>
        <div className="p-4">          
          <TurnDetailAndUpdate />
        </div>
      </Layout>
    </>
  );
}

export default TurnDetailPage;
