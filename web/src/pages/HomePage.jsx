import React from "react";
import LaVinLogo from "../images/la-vin-nails-logo.png";
import HomeCarousel from "../components/home-carousel/HomeCarousel";
import Layout from "./../components/layouts/Layout";
import ServicesSlide from '../components/services/services-slide/ServicesSlide';
import LoginBanner from "../components/login-banner/LoginBanner";

function HomePage() {
  return (
    <>
      <Layout>
        <>
        <div className="">
          {/* <div className="text-center flex justify-center ">
          <img src={LaVinLogo} alt="logo la vin nails" className=" h-24 m-4" />
        </div> */}
          <HomeCarousel />
          <ServicesSlide/>
          <LoginBanner />
          
        </div>

      
       
        
        </>
      </Layout>
    </>
  );
}

export default HomePage;
