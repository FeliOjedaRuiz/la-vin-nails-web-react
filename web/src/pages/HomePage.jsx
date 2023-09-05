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
          <a href="https://www.google.es/maps/place/La+Vin+Nails/@37.199055,-3.6219443,17z/data=!3m1!4b1!4m6!3m5!1s0xd71fdcc60fab787:0xffdd8e2502825163!8m2!3d37.1990508!4d-3.6193694!16s%2Fg%2F11tsjffhvt?entry=ttu" className="font-medium text-center mt-6">
          <p className="text-emerald-700">Calle Isla De La gomera 4, Esc 3, Bajo "E".</p>
          <p className="text-pink-800">Granada, Andalucía, España.</p>
          </a>
        </div>
        <div className="text-center text-sm bg-black/5 p-0.5 text-black/50 ">
          <a href={`https://wa.me/$+34630173975?text=`}>
            Web desarrollada por Feliciano Ojeda Ruiz
          </a>
        </div>
      </div>
    </Layout>
  );
}

export default HomePage;
