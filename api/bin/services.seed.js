const services = [
  {
    name: "Semipermanente pies",
    type: ["sin limado", "con limado de durezas"],
    image: "/images/esmaltado.jpeg",
    description:
      "Este servicio se realiza con esmaltes semipermanentes, que se aplican de forma rápida y fácil secando con luz UV y que consigue la durabilidad y brillo que caracterizan a las uñas esculpidas. Con los cuidados necesarios, una aplicación puede llegar a durar hasta 3 semanas.",
    price: 10,
    dateDuration: "1",
  },
  {
    name: "Retiro",
    type: ["uñas de gel", "esmaltado semipermanente"],
    image: "/images/baño-de-gel.jpeg",
    description:
      "Remoción total del material dejando la uña natural limpia y con un protector y endurecedor de calcio. Se efectua una limpieza y manicuria express (limado, corte de cuticulas y pulido de pieles).",
    price: 5,
    dateDuration: "0:30",
  },
  {
    name: "Relleno",
    type: [
      "esmalte liso",
      "decoración sensilla",
      "decoración especial",
      "francesitas",
    ],
    image: "/images/baño-de-gel.jpeg",
    description:
      "Este servicio se aplica a aquellas uñas que traen crecimiento y solo se emplea acrigel o ruber base. Unicamente para uñas de gel (No acrilico).",
    price: 18,
    dateDuration: "1:30",
  },
  {
    name: "Micro extención",
    type: [
      "esmalte liso",
      "decoración sensilla",
      "decoración especial",
      "francesitas",
    ],
    image: "/images/baño-de-gel.jpeg",
    description:
      "Este servicio se adapta mejor a aquellas uñas partidas, maltratadas o extremadamente cortas. Se aplica con acrigel y la extención máxima es de 5 mm.",
    price: 18,
    dateDuration: "1:30",
  },
  {
    name: "Uñas de Acrigel",
    type: [
      "esmalte liso",
      "decoración sensilla",
      "decoración especial",
      "francesitas",
    ],
    image: "/images/uñas-de-gel.jpeg",
    description:
      "Este servicio es para quienes tienden a llevar uñas cortas o largas con un aspecto más brillante y natural. Son estructuralmente finas y delicadas. El producto que se utiliza no tiene olor y el riesgo de reacciones alérgicas es nulo. Su duración es de 18 a 21 días.",
    price: 30,
    dateDuration: "2:00",
  },
  {
    name: "Uñas de gel X-press",
    type: [
      "esmalte liso",
      "decoración sensilla",
      "decoración especial",
      "francesitas",
    ],
    image: "/images/soft-gel.jpeg",
    description:
      "Aplicación con típs fabricados de gel, es la aplicación más elegida por la rapidez en su colocación, se extienden las uñas en pocos minutos. Dan una apariencia de uñas ligeras y flexibles, más realistas. Son Cómodas de llevar ya que apenas aumenta el grosor de la uña. Tienen una duración de hasta 25 días. Éstas no se rellenan el crecimiento, sino que se retiran fácilmente, y vuelven a aplicar en pocos minutos.",
    price: 25,
    dateDuration: "1:30",
  },
  {
    name: "Semipermanente manos con refuerzo de gel",
    type: [
      "esmalte liso",
      "decoración sensilla",
      "decoración especial",
      "francesitas",
    ],
    image: "/images/esmaltado.jpeg",
    description:
      "Este servicio se realiza con esmaltes semipermanentes, que se aplican de forma rápida y fácil secando con luz UV y que consigue la durabilidad y brillo que caracterizan a las uñas esculpidas. Con los cuidados necesarios, una aplicación puede llegar a durar hasta 3 semanas.",
    price: 15,
    dateDuration: "1:15",
  },
];

const mongoose = require("mongoose");
const URI = process.env.MONGODB_URI;
const Service = require("../models/service.model");

mongoose
  .connect(URI)
  .then(() => {
    Service.create(services).then(() => {
      mongoose.disconnect();
    });
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });

// const mongoose = require("mongoose");

// const MONGODB_URI = process.env.MONGODB_URI

// mongoose
//   .connect(MONGODB_URI)
//   .then(() => console.info(`Successfully connect to the database`))
//   .catch((error) =>
//     console.error("An error ocurred trying to connect to the database", error)
//   );
