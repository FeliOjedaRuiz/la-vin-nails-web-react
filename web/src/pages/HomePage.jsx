import React from "react";
import LaVinLogo from "../images/la-vin-nails-logo.png";
import Carrusel1 from "../images/carrusel1.jpeg";
import Carrusel2 from "../images/carrusel2.jpeg";
import Carrusel3 from "../images/carrusel3.jpeg";

function HomePage() {
  return (
    <>
      <div className=" bg-pink-50">
        <div className="text-center flex justify-center mt-4">
          <img src={LaVinLogo} alt="logo la vin nails" className=" h-24 m-4" />
        </div>

        <h1 className="text-center m-4">- Bienvenidos -</h1>

        <div
          id="default-carousel"
          class="relative w-full"
          data-carousel="slide"
        >
          <div class="relative h-56 overflow-hidden rounded-lg md:h-96">
            <div class="hidden duration-1000 ease-in-out" data-carousel-item>
              <img
                src={Carrusel1}
                class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                alt="..."
              />
            </div>

            <div class="hidden duration-1000 ease-in-out" data-carousel-item>
              <img
                src={Carrusel2}
                class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                alt="..."
              />
            </div>

            <div class="hidden duration-1000 ease-in-out" data-carousel-item>
              <img
                src={Carrusel3}
                class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                alt="..."
              />
            </div>
          </div>

          <div class="absolute z-30 flex space-x-3 -translate-x-1/2 bottom-5 left-1/2">
            <button
              type="button"
              class="w-3 h-3 rounded-full"
              aria-current="true"
              aria-label="Slide 1"
              data-carousel-slide-to="0"
            ></button>
            <button
              type="button"
              class="w-3 h-3 rounded-full"
              aria-current="false"
              aria-label="Slide 2"
              data-carousel-slide-to="1"
            ></button>
            <button
              type="button"
              class="w-3 h-3 rounded-full"
              aria-current="false"
              aria-label="Slide 3"
              data-carousel-slide-to="2"
            ></button>
            <button
              type="button"
              class="w-3 h-3 rounded-full"
              aria-current="false"
              aria-label="Slide 4"
              data-carousel-slide-to="3"
            ></button>
            <button
              type="button"
              class="w-3 h-3 rounded-full"
              aria-current="false"
              aria-label="Slide 5"
              data-carousel-slide-to="4"
            ></button>
          </div>

          <button
            type="button"
            class="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
            data-carousel-prev
          >
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
              <svg
                aria-hidden="true"
                class="w-5 h-5 text-white sm:w-6 sm:h-6 dark:text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              <span class="sr-only">Previous</span>
            </span>
          </button>
          <button
            type="button"
            class="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
            data-carousel-next
          >
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
              <svg
                aria-hidden="true"
                class="w-5 h-5 text-white sm:w-6 sm:h-6 dark:text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
              <span class="sr-only">Next</span>
            </span>
          </button>
        </div>

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
