import React from "react";
import { Slideshow, Slide, TextoSlide } from "./Slideshow.js";
import "../../index.css";
import styled from "styled-components";

const img1 =
  "https://res.cloudinary.com/duoshgr3h/image/upload/v1696626702/Oto%C3%B1o-1_kg6c6g.jpg";
const img2 =
  "https://res.cloudinary.com/duoshgr3h/image/upload/v1696626702/Oto%C3%B1o-2_urslea.jpg";
const img3 =
  "https://res.cloudinary.com/duoshgr3h/image/upload/v1696626702/Oto%C3%B1o-3_fyzuzj.jpg";

const NewCarousel = () => {
  return (
    <main>
      {/* <Titulo>Productos Destacados</Titulo> */}
      <Slideshow controles={true}>
        <Slide>
          <div>
            <img src={img1} alt="Portada otoño" />
          </div>
          {/* <TextoSlide>
						<p>15% descuento en productos Apple</p>
					</TextoSlide> */}
        </Slide>
        <Slide>
          <div>
            <img src={img2} alt="Promo esmaltado permanente €12" />
          </div>
        </Slide>
        <Slide>
          <div>
            <img src={img3} alt="Promo uñas de gel €20" />
          </div>
        </Slide>
      </Slideshow>
    </main>
  );
};

const Titulo = styled.p`
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

export default NewCarousel;
