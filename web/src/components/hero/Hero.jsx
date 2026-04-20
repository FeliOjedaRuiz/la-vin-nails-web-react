'use client';
import LaVinLogo from '../../images/la-vin-nails-logo.webp';
import LocationIcon from '../icons/LocationIcon';
import WhatsappIcon2 from '../icons/WhatsappIcon2';

// URL optimizada de Cloudinary (auto-format, auto-quality, max-width 2000px)
const HERO_IMAGE_URL = "https://res.cloudinary.com/duoshgr3h/image/upload/f_auto,q_auto,w_2000/v1775121424/web-la-vin-heroes/hero-main-v2.webp";

export function Hero() {
	return (
		<section className="relative h-[calc(100vh-112px)] min-h-[400px]  flex items-center justify-center overflow-hidden">

			{/* Background Image */}
			<div className="absolute inset-0 z-0">
				<img
					src={HERO_IMAGE_URL}
					alt="Manicura profesional La Vin Nails"
					className="w-full h-full object-cover"
					fetchpriority="high"
					loading="eager"
					width="1920"
					height="1080"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
			</div>

			{/* Content */}
			<div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
				<h1 className="sr-only">La Vin Nails - Estudio de Manicura Profesional en Granada</h1>
				<div className="mb-8">
					<img
						src={LaVinLogo}
						alt="Logo La Vin Nails"
						className="w-48 lg:w-72 xl:w-96 m-auto drop-shadow-lg"
						decoding="async"
					/>
					<p className="text-base md:text-lg italic font-medium text-white mb-8 mt-6 leading-relaxed drop-shadow">
						Transforma tus uñas en obras de arte. <br /> Agenda tu cita y
						descubre la diferencia profesional.
					</p>
				</div>

				<div className="space-y-4 mb-8">
					<a href="/services">
						<button className="w-full sm:w-auto text-base font-semibold px-6 py-3 h-auto rounded-lg border-2 bg-white border-pink-700 text-pink-700 hover:bg-pink-600 hover:text-white hover:border-pink-900 mb-4 sm:mb-0">
							{/* <Calendar className="mr-2 h-5 w-5" /> */}
							Agendar Cita
						</button>
					</a>

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://www.google.es/maps/place/La+Vin+Nails/@37.199055,-3.6219443,17z/data=!3m1!4b1!4m6!3m5!1s0xd71fdcc60fab787:0xffdd8e2502825163!8m2!3d37.1990508!4d-3.6193694!16s%2Fg%2F11tsjffhvt?entry=ttu"
						>
							<button className="flex justify-center w-full items-center rounded-lg border text-base font-semibold px-6 py-3 bg-white/20 border-white text-white hover:bg-white/40">
								<LocationIcon />
								Ubicación
							</button>
						</a>

						<a href="https://wa.me/34699861930?text=¡Hola! Quiero hacer una consulta...">
							<button className="flex justify-center w-full items-center rounded-lg border text-base font-semibold px-6 py-3 bg-white/20 border-white text-white hover:bg-white/40">
								<WhatsappIcon2 className="mr-2 h-5 w-5" />
								<p>Consultar</p>
							</button>
						</a>
					</div>

				</div>

			</div>
		</section>
	);
}
