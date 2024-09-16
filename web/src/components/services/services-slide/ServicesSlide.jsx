import React from "react";
import ServiceMicroItem from "../service-micro-item/ServiceMicroItem";

function ServicesSlide() {
  const services = [{
    "id": "64e1e8f4c7d250c0a7d4c112",
    "name": "Semipermanente + refuerzo",
    "type": [
      "esmalte liso",
      "decoración sensilla",
      "decoración especial",
      "francesitas"
    ],
    "image": "https://res.cloudinary.com/duoshgr3h/image/upload/v1722880052/semi-mano_uhpm7o.webp",
    "description": "Este servicio se realiza con esmaltes semipermanentes, que se aplican de forma rápida y fácil secando con luz UV y que consigue la durabilidad y brillo que caracterizan a las uñas esculpidas. Con los cuidados necesarios, una aplicación puede llegar a durar hasta 3 semanas.",
    "price": 12,
    "dateDuration": "1:15",
    "createdAt": {
      "$date": "2023-08-20T10:20:36.686Z"
    },
    "updatedAt": {
      "$date": "2023-08-20T10:20:36.686Z"
    },
    "__v": 0
  },
  {
    "id": "64e1e934f0ccf5e38547aead",
    "name": "Uñas de gel X-press",
    "type": [
      "esmalte liso",
      "decoración sensilla",
      "decoración especial",
      "francesitas"
    ],
    "image": "https://res.cloudinary.com/duoshgr3h/image/upload/v1722880050/x-press_quinau.webp",
    "description": "Aplicación con típs fabricados de gel, es la aplicación más elegida por la rapidez en su colocación, se extienden las uñas en pocos minutos. Dan una apariencia de uñas ligeras y flexibles, más realistas. Son Cómodas de llevar ya que apenas aumenta el grosor de la uña. Tienen una duración de hasta 25 días. Éstas no se rellenan el crecimiento, sino que se retiran fácilmente, y vuelven a aplicar en pocos minutos.",
    "price": 25,
    "dateDuration": "1:30",
    "createdAt": {
      "$date": "2023-08-20T10:21:40.275Z"
    },
    "updatedAt": {
      "$date": "2023-08-20T10:21:40.275Z"
    },
    "__v": 0
  },
  {
    "id": "64e1e94b785c6cfcdea6a7f7",
    "name": "Uñas de Acrigel",
    "type": [
      "esmalte liso",
      "decoración sensilla",
      "decoración especial",
      "francesitas"
    ],
    "image": "https://res.cloudinary.com/duoshgr3h/image/upload/v1722880056/acrigel_lvmmnu.webp",
    "description": "Este servicio es para quienes tienden a llevar uñas cortas o largas con un aspecto más brillante y natural. Son estructuralmente finas y delicadas. El producto que se utiliza no tiene olor y el riesgo de reacciones alérgicas es nulo. Su duración es de 18 a 21 días.",
    "price": 30,
    "dateDuration": "2:00",
    "createdAt": {
      "$date": "2023-08-20T10:22:03.343Z"
    },
    "updatedAt": {
      "$date": "2023-08-20T10:22:03.343Z"
    },
    "__v": 0
  },
  {
    "id": "64e1e96235c094fecabad700",
    "name": "Micro extención",
    "type": [
      "esmalte liso",
      "decoración sensilla",
      "decoración especial",
      "francesitas"
    ],
    "image": "https://res.cloudinary.com/duoshgr3h/image/upload/v1722880055/microextenci%C3%B3n_fbsyn6.webp",
    "description": "Este servicio se adapta mejor a aquellas uñas partidas, maltratadas o extremadamente cortas. Se aplica con acrigel y la extención máxima es de 5 mm.",
    "price": 18,
    "dateDuration": "1:30",
    "createdAt": {
      "$date": "2023-08-20T10:22:26.259Z"
    },
    "updatedAt": {
      "$date": "2023-08-20T10:22:26.259Z"
    },
    "__v": 0
  },
  {
    "id": "64e1e97e4dc4ecdf1c715c01",
    "name": "Relleno",
    "type": [
      "esmalte liso",
      "decoración sensilla",
      "decoración especial",
      "francesitas"
    ],
    "image": "https://res.cloudinary.com/duoshgr3h/image/upload/v1722880054/relleno_fhfnaj.webp",
    "description": "Este servicio se aplica a aquellas uñas que traen crecimiento y solo se emplea acrigel o ruber base. Unicamente para uñas de gel (No acrilico).",
    "price": 18,
    "dateDuration": "1:30",
    "createdAt": {
      "$date": "2023-08-20T10:22:54.207Z"
    },
    "updatedAt": {
      "$date": "2023-08-20T10:22:54.207Z"
    },
    "__v": 0
  },
  {
    "id": "64e1e98aea6ed46c5e919bfa",
    "name": "Retiro",
    "type": [
      "uñas de gel",
      "esmaltado semipermanente"
    ],
    "image": "https://res.cloudinary.com/duoshgr3h/image/upload/v1722880058/retiro_tf9ihq.webp",
    "description": "Remoción total del material dejando la uña natural limpia y con un protector y endurecedor de calcio. Se efectua una limpieza y manicuria express (limado, corte de cuticulas y pulido de pieles).",
    "price": 5,
    "dateDuration": "0:30",
    "createdAt": {
      "$date": "2023-08-20T10:23:06.967Z"
    },
    "updatedAt": {
      "$date": "2023-08-20T10:23:06.967Z"
    },
    "__v": 0
  },
  {
    "id": "64e1e98aea6ed46c5e919bfb",
    "name": "Semipermanente pies",
    "type": [
      "sin limado",
      "con limado de durezas"
    ],
    "image": "https://res.cloudinary.com/duoshgr3h/image/upload/v1722880049/semi-pies_wrixek.webp",
    "description": "Este servicio se realiza con esmaltes semipermanentes, que se aplican de forma rápida y fácil secando con luz UV y que consigue la durabilidad y brillo que caracterizan a las uñas esculpidas. Con los cuidados necesarios, una aplicación puede llegar a durar hasta 3 semanas.",
    "price": 10,
    "dateDuration": "1",
    "createdAt": {
      "$date": "2023-08-20T10:23:06.968Z"
    },
    "updatedAt": {
      "$date": "2023-08-20T10:23:06.968Z"
    },
    "__v": 0
  }]
  
  // const [services, setServices] = useState([]);

  // useEffect(() => {
  //   servicesService
  //     .list()
  //     .then((services) => {
  //       setServices(services);
  //     })
  //     .catch((error) => console.error(error));
  // }, []);

  return (
    <div className="border-y-2 border-pink-400 pb-4">
      <h2 className="p-4 lg:p-6 mt-2 italic font-bold text-2xl lg:text-4xl text-emerald-600">
        Nuestros servicios
      </h2>
      <div className=" overflow-scroll bg-white/10  ">
        <div className="flex w-fit mx-2 mb-2  grid-flow-row">
          {services.map((service) => (
            <ServiceMicroItem service={service} key={service.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ServicesSlide;
