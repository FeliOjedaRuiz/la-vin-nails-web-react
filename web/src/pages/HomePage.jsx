import React from "react";
import LaVinLogo from "../images/la-vin-nails-logo.png";
import Layout from "./../components/layouts/Layout";
import ServicesSlide from "../components/services/services-slide/ServicesSlide";
import LoginBanner from "../components/login-banner/LoginBanner";
import NewCarousel from "../components/new-carousel/NewCarousel";
import WhatsappIcon from "../components/icons/WhatsappIcon";

function HomePage() {
  return (
    <>
      <Layout>
        <>
          <div className="">
            <NewCarousel />
            <ServicesSlide />
            <LoginBanner />
            <div className="p-8 flex flex-col items-center border-t-2 border-pink-400">
              <img src={LaVinLogo} alt="Logo La Vin Nails" className="w-60" />
              <p>La Vin Nails es...</p>
              <div className="mt-3 flex justify-around w-full">
                <a href="https://www.instagram.com/nailsgranada.lavin/" className="flex">
                  <div>
                    <WhatsappIcon />
                  </div>
                  instagram
                </a>
                <a href="https://wa.me/$+34699861930?text=¡Hola! tengo una duda sobre La Vin Nails..." className="flex">
                  <div>
                    <WhatsappIcon />
                  </div>
                  +34699861930
                </a>
              </div>
            </div>
          </div>
        </>
      </Layout>
    </>
  );
}

export default HomePage;
