import React from "react";
import LaVinLogo from "../images/la-vin-nails-logo.png";

import UpLayout from "../components/layouts/UpLayout";
import HomeCarusel from "../components/home-carrusel/HomeCarusel";

function HomePage() {
  return (
    <>
      <UpLayout></UpLayout>
      <div className=" bg-pink-50">
        {/* <div className="text-center flex justify-center ">
          <img src={LaVinLogo} alt="logo la vin nails" className=" h-24 m-4" />
        </div> */}
        
        <HomeCarusel/>
        

        <a className="carrucelfoot" type="button" href="/services/list">
          <div className="">Catalogo de servicios</div>
        </a>

        <div className="card mt-4">
          <div className="card-body text-center">
            <div className="mb-3">
              <i className="fa fa-user fa-2x reg-i mt-2 d-inline"></i>
              <h4 className="m-4 d-inline">¿Aún no eres cliente?</h4>
            </div>
            <a
              className="btn btn-outline btn-green col-12 mb-3"
              type="button"
              href="users/new"
            >
              Registrate
            </a>
            <p className="card-text">
              Lavin Nails es una empresa líder en el cuidado de uñas y
              manicuría, que ofrece servicios personalizados y de alta calidad
              en un ambiente relajante y satisfactorio. Visítalos para
              experimentar la diferencia de una empresa comprometida con tu
              bienestar.{" "}
              <a className="" href="/contact">
                Leer más...
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
