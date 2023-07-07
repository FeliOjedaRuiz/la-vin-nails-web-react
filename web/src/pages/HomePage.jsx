import React from "react";
import LaVinLogo from "../images/la-vin-nails-logo.png";
import HomeCarusel from "../components/home-carrusel/HomeCarusel";
import Layout from "./../components/layouts/Layout";
import ServicesCarrusel from './../components/services/services-carrusel/ServicesCarrusel';

function HomePage() {
  return (
    <>
      <Layout>
        <>
        <div className=" bg-pink-50">
          {/* <div className="text-center flex justify-center ">
          <img src={LaVinLogo} alt="logo la vin nails" className=" h-24 m-4" />
        </div> */}
          <HomeCarusel />
          <ServicesCarrusel/>
        </div>

      
       
        
        </>
      </Layout>
    </>
  );
}

export default HomePage;
