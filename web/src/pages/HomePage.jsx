import React from "react";
import LaVinLogo from "../images/la-vin-nails-logo.png";
import Layout from "./../components/layouts/Layout";
import ServicesSlide from "../components/services/services-slide/ServicesSlide";
import LoginBanner from "../components/login-banner/LoginBanner";
import NewCarousel from "../components/new-carousel/NewCarousel";
import InstagramIcon from "../components/icons/InstagramIcon";
import WhatsappIcon2 from "../components/icons/WhatsappIcon2";

function HomePage() {
  return (
    <Layout>
      <div className="">
        <NewCarousel />
        <ServicesSlide />
        <LoginBanner />
        <div className="p-8 flex flex-col items-center border-t-2 border-pink-400">
          <img src={LaVinLogo} alt="Logo La Vin Nails" className="w-60" />
          <div className="mt-5 flex justify-around w-full">
            <a
              href="https://www.instagram.com/nailsgranada.lavin/"
              className="flex"
            >
              <div className="w-7 h-7 mr-1 flex justify-center items-center bg-pink-700 rounded-full">
                <InstagramIcon />
              </div>
              La Vin Nails
            </a>
            <a
              href="https://wa.me/$+34699861930?text=¡Hola! tengo una duda sobre La Vin Nails..."
              className="flex"
            >
              <div className="w-7 h-7 mr-1 flex justify-center items-center bg-emerald-700 rounded-full">
                <WhatsappIcon2 />
              </div>
              +34699861930
            </a>
          </div>
        </div>
        <div className="text-center text-sm bg-black/5 p-0.5 text-black/50 ">
          <a href={`https://wa.me/$+34682126136?text=`}>
            Web desarrollada por Feliciano Ojeda Ruiz
          </a>
        </div>
      </div>
    </Layout>
  );
}

export default HomePage;
