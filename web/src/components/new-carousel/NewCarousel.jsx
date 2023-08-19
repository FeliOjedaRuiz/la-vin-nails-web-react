import React from 'react';
import {Slideshow, Slide, TextoSlide} from './Slideshow.js'
import '../../index.css';
import styled from 'styled-components';
import img1 from './../../images/carrusel1.jpeg';
import img2 from './../../images/carrusel2.jpeg';
import img3 from './../../images/carrusel3.jpeg';
import img4 from './../../images/carrusel3.jpeg';

const NewCarousel = () => {
	return (
		<main>
			{/* <Titulo>Productos Destacados</Titulo> */}
			<Slideshow controles={true}>
				<Slide>
					<a href="/services">
						<img src={img1} alt=""/>
					</a>
					{/* <TextoSlide>
						<p>15% descuento en productos Apple</p>
					</TextoSlide> */}
				</Slide>
				<Slide>
					<a href="">
						<img src={img2} alt=""/>
					</a>
				</Slide>
				<Slide>
					<a href="">
						<img src={img3} alt=""/>
					</a>
				</Slide>
				<Slide>
					<a href="">
						<img src={img4} alt=""/>
					</a>
				</Slide>
			</Slideshow>
		</main>
	);
}

const Titulo = styled.p`
	font-size: 18px;
	font-weight: 700;
	text-transform: uppercase;
	margin-bottom: 10px;
`;
 
export default NewCarousel;