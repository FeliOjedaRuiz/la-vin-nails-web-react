import React from "react";
import LaVinLogo from "../images/la-vin-nails-logo.png";

import UpLayout from "../components/layouts/UpLayout";
import HomeCarusel from "../components/home-carrusel/HomeCarusel";
import DownLayout from "../components/layouts/DownLayout";

function HomePage() {
  return (
    <>
      <UpLayout/>
      <div className=" bg-pink-50">
        {/* <div className="text-center flex justify-center ">
          <img src={LaVinLogo} alt="logo la vin nails" className=" h-24 m-4" />
        </div> */}
        
        <HomeCarusel/>

        


        
      </div>
      <DownLayout/>
    </>
  );
}

export default HomePage;
