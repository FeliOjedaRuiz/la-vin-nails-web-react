const services = [
  {
    name: "Esmalte semipermanente",
    type: [
      "liso de uno o varios colores",
      "francesitas",
      "diseño a mano alzada (€1 por uña)",
      "pegatinas",
    ],
    image: "/images/esmaltado.jpeg",
    description: " Este servicio se realiza con esmaltes permanentes, que se aplica de forma rápida y fácil al secado de luz UV y que consigue la durabilidad y brillo que caracterizan a las uñas esculpidas. Con los cuidados necesarios, una aplicación puede llegar a durar hasta 3 semanas. ",
    price: 12,
  },
  {
    name: "Baño de gel",
    type: [
      "sobre uña natural",
      "con micro extención",
      "con extención",
    ],
    image: "/images/baño-de-gel.jpeg",
    description: "Este capping se realiza con una base niveladora que le proporciona más dureza y grosor a la uña natural. Este servicio es perfecto para quienes tienen sus uñas frágiles  o para quienes tienden a morderse sus uñas. Por sobre el baño de gel, se suelen realizar esmaltados para lucir las uñas arregladas.",
    price: 8,
  },
  {
    name: "Uñas acrílicas",
    type: [
      "con esmalte liso",
      "con decoración simple",
      "con decoración especial",
      "Francesitas",
    ],
    image: "/images/acrilicas.jpeg",
    description: "Son estructuralmente más fuertes y resistentes. A simple vista se nota que es una construcción artificial, el proceso de relleno o retiro es muy sencillo. Para su aplicación se requiere acrílico en polvo y monómero liquido,  lo que genera un olor fuerte. Con el correcto cuidado, estas uñas pueden durar hasta 6 meses haciendo los mantenimientos de relleno de crecimiento cada 15/20 días.",
    price: 30,
  },
  {
    name: "Uñas de gel",
    type: [
      "con esmalte liso",
      "con decoración simple",
      "con decoración especial",
      "Francesitas",
    ],
    image:
      "/images/uñas-de-gel.jpeg",
    description: "Este servicio es para quienes tienden a llevar uñas cortas o largas con un aspecto más brillante y natural. Son estructuralmente finas y delicadas. El producto que se utiliza no tiene olor y el riesgo de reacciones alérgicas es nulo. Su duración es de 18 a 21 días.",
    price: 35,
  },
  {
    name: "Soft gel",
    type: [
      "con esmalte liso",
      "con decoración simple",
      "con decoración especial",
      "Francesitas",
    ],
    image: "/images/soft-gel.jpeg",
    description: "Aplicación con típs fabricados de gel, es la aplicación más elegida por la rapidez en su colocación, se extienden las uñas en pocos minutos. Dan una apariencia de uñas ligeras y flexibles, más realistas. Son Cómodas de llevar ya que apenas aumenta el grosor de la uña. Tienen una duración de hasta 25 días. Éstas no se rellenan el crecimiento, sino que se retiran fácilmente, y vuelven a aplicar en pocos minutos.",
    price: 25,
  },
];

const mongoose = require("mongoose");
const URI = process.env.MONGODB_URI
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
