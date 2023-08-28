import React from "react";
import { Slideshow, Slide, TextoSlide } from "./Slideshow.js";
import "../../index.css";
import styled from "styled-components";

const img1 =
  "https://res.cloudinary.com/duoshgr3h/image/upload/v1692560886/Carousel_j14opp.jpg";
const img2 =
  "https://res.cloudinary.com/duoshgr3h/image/upload/v1692560887/Carousel1_ojnbu8.jpg";
const img3 =
  "https://res.cloudinary.com/duoshgr3h/image/upload/v1692560887/Carousel2_cgmgbe.jpg";
const img4 =
  "https://res.cloudinary.com/duoshgr3h/image/upload/v1692560887/Carousel4_jmox6x.jpg";
const img5 =
  "https://res.cloudinary.com/duoshgr3h/image/upload/v1692560887/Carousel3_fkkqjz.jpg";

const NewCarousel = () => {
  return (
    <main>
      {/* <Titulo>Productos Destacados</Titulo> */}
      <Slideshow controles={true}>
        <Slide>
          <div>
            <img src={img1} alt="" />
          </div>
          {/* <TextoSlide>
						<p>15% descuento en productos Apple</p>
					</TextoSlide> */}
        </Slide>
        <Slide>
          <div>
            <img src={img2} alt="" />
          </div>
        </Slide>
        <Slide>
          <div>
            <img src={img3} alt="" />
          </div>
        </Slide>
        <Slide>
          <div>
            <img src={img4} alt="" />
          </div>
        </Slide>
        <Slide>
          <div>
            <img src={img5} alt="" />
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
