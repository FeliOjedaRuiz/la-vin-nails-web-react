import { useEffect, useState } from "react"
import photosService from "../../services/photos"
import LeftIcon from "../icons/LeftIcon";
import RightIcon from './../icons/RightIcon';

export function RecentWork() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [recentWorks, setRecentWorks] = useState([]);

  useEffect(() => {
    photosService
      .list()
      .then((photos) => {
        console.log(photos);
        setRecentWorks(photos);
        console.log(recentWorks)
      })
      .catch((error) => console.error(error));
  }, []);

  const itemsPerView = 1
  const maxIndex = Math.max(0, recentWorks.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }


  return (
    <section className="py-12 px-4 bg-gradient-to-b from-background to-card/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-pink-600 mb-4">Mis Últimos Trabajos</h2>
          <p className="text-emerald-700 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Descubre mis últimas creaciones. <br /> Para cada clienta un diseño único y personalizado.
          </p>
        </div>

        <div className="md:hidden">
          <div className="relative m-4">
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {recentWorks.map((work) => (
                  <div key={work.id} className="w-full flex-shrink-0 aspect-square ">                    

                      <div className="relative">

                        <img
                          src={work.photoUrl || "/placeholder.svg"}
                          alt="Foto de trabajo reciente"
                          className="w-full  object-cover aspect-square"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      
                      </div>
                      
                      
                    
                  </div>
                ))}
              </div>
            </div>

            <button              
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={prevSlide}
            >
              <LeftIcon className="h-4 w-4" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={nextSlide}
            >
              <RightIcon className="h-4 w-4" />
            </button>

          </div>

          <div className="flex justify-center items-center mt-6 space-x-4">
            <div className="flex space-x-2">
              {recentWorks.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Grid - sin cambios */}
        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-4 gap-6">
          {recentWorks.slice(0, 8).map((work) => (
            <div key={work.id} className="overflow-hidden hover:shadow-lg transition-shadow rounded-lg">
              <div className="relative group">
                <img
                  src={work.photoUrl || "/placeholder.svg"}
                  alt="Foto de trabajo reciente"
                  className="w-full aspect-square  object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
              </div>
              
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="px-8 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-colors ">
            Ver Más Trabajos
          </button>
        </div>
      </div>
    </section>
  )
}
