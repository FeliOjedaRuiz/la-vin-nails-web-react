import React from 'react';
import InstagramIcon from '../icons/InstagramIcon';
import WhatsappIcon2 from '../icons/WhatsappIcon2';
import LaVinLogo from '../../images/la-vin-nails-logo.webp';

function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="p-12 px-4 border-t-2 border-pink-400">
			<div className="container mx-auto max-w-6xl ">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="text-center flex flex-col items-center justify-center">
						
            <img src={LaVinLogo} alt="Logo La Vin Nails" className="w-40 pb-4" />
						<p className="mb-4 leading-tight text-pink-700 font-medium">
							Estudio de manicura profesional en Granada. <br />Transformamos tus uñas
							en obras de arte.
						</p>
					</div>

					<div className="flex flex-col justify-center items-center">
						<a
							href="https://www.instagram.com/nailsgranada.lavin/"
							className="flex m-3"
						>
							<div className="w-7 h-7 mr-1 flex justify-center items-center bg-pink-700 rounded-full">
								<InstagramIcon />
							</div>
							La Vin Nails
						</a>

						<a
							href="https://wa.me/34699861930?text=¡Hola! tengo una duda sobre La Vin Nails..."
							className="flex m-3"
						>
							<div className="w-7 h-7 mr-1 flex justify-center items-center bg-emerald-700 rounded-full">
								<WhatsappIcon2 />
							</div>
							+34 699 86 19 30
						</a>

						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://www.google.es/maps/place/La+Vin+Nails/@37.199055,-3.6219443,17z/data=!3m1!4b1!4m6!3m5!1s0xd71fdcc60fab787:0xffdd8e2502825163!8m2!3d37.1990508!4d-3.6193694!16s%2Fg%2F11tsjffhvt?entry=ttu"
							className="font-medium text-center m-3"
						>
							<p className="text-emerald-700">
								C. Periodista Rafael Gago Palomo 7, local 3.
							</p>
							<p className="text-pink-800">Granada, Andalucía, España.</p>
						</a>
					</div>
				</div>

				<div className="border-t border-border mt-8 pt-8 text-center text-sm  ">
					<p className="text-muted-foreground text-sm text-pink-700">
						© {currentYear} La Vin! Nails. Todos los derechos reservados.
					</p>
					<a
						className="text-teal-700"
						href="https://wa.me/34630173975?text=¡Hola! Vi tu web de La Vin Nails..."
					>
						Web desarrollada por Feliciano Ojeda Ruiz
					</a>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
