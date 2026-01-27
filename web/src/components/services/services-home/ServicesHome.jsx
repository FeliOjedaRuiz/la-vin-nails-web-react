import React from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthStore';
import { services } from '../LaVinServices/LaVinServices';
import StarIcon from '../../icons/StarIcon';

// Icons
const ChevronLeft = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="m15 18-6-6 6-6" />
	</svg>
);

const ChevronRight = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="m9 18 6-6-6-6" />
	</svg>
);

// UI Components built with Tailwind to match the design
const Card = ({ className, children }) => (
	<div
		className={`rounded-lg border bg-white text-gray-950 shadow-sm ${className}`}
	>
		{children}
	</div>
);

const CardHeader = ({ className, children }) => (
	<div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ className, children }) => (
	<h3
		className={`text-2xl font-semibold leading-none text-teal-600 tracking-tight ${className}`}
	>
		{children}
	</h3>
);

const CardDescription = ({ className, children }) => (
	<p
		className={`text-sm text-gray-500 ${children && children.length > 200 ? 'line-clamp-3' : ''} ${className}`}
	>
		{children}
	</p>
);

const CardContent = ({ className, children }) => (
	<div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ className, children, ...props }) => (
	<button
		className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 disabled:pointer-events-none disabled:opacity-50 bg-pink-600 text-white hover:bg-pink-700 h-9 px-4 py-2 ${className}`}
		{...props}
	>
		{children}
	</button>
);

export function ServicesHome() {
	const { user } = React.useContext(AuthContext);
	const scrollContainerRef = React.useRef(null);

	const scroll = (direction) => {
		if (scrollContainerRef.current) {
			const { current } = scrollContainerRef;
			const scrollAmount =
				direction === 'left' ? -current.offsetWidth : current.offsetWidth;
			current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		}
	};

	return (
		<section className="py-16 px-4">
			<div className="container mx-auto max-w-6xl relative">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-pink-600 mb-4">
						Nuestros Servicios
					</h2>
					<p className="text-gray-500 text-lg max-w-2xl mx-auto">
						Ofrecemos una amplia gama de servicios profesionales para el cuidado
						y embellecimiento de tus uñas.
					</p>
				</div>

				<div className="relative group">
					{/* Navigation Buttons - Hidden on mobile, visible on desktop group hover */}
					<button
						onClick={() => scroll('left')}
						className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-white/80 hover:bg-white text-pink-600 p-2 rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 hidden md:block opacity-0 group-hover:opacity-100"
						aria-label="Previous slide"
					>
						<ChevronLeft className="h-6 w-6" />
					</button>
					<button
						onClick={() => scroll('right')}
						className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-white/80 hover:bg-white text-pink-600 p-2 rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 hidden md:block opacity-0 group-hover:opacity-100"
						aria-label="Next slide"
					>
						<ChevronRight className="h-6 w-6" />
					</button>

					{/* Slider Container */}
					<div
						ref={scrollContainerRef}
						className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
					>
						{services.map((service, index) => {
							return (
								<div
									key={service.id || index}
									className="min-w-[85%] md:min-w-[calc(50%-12px)] snap-center flex"
								>
									<Card className="overflow-hidden hover:shadow-lg transition-shadow group/card flex flex-col md:flex-row h-full w-full">
										<div className="md:w-1/3 relative shrink-0">
											<div className="h-48 md:h-full w-full">
												<img
													src={service.image || '/placeholder.svg'}
													alt={service.name}
													className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
												/>
											</div>
										</div>

										<div className="md:w-2/3 flex flex-col">
											<CardHeader>
												<div className="flex items-center space-x-2 mb-2">
													<StarIcon className="h-5 w-5 text-pink-500" />
													<CardTitle className="text-xl">
														{service.name}
													</CardTitle>
												</div>
												<CardDescription className="text-base text-pretty">
													{service.description}
												</CardDescription>
											</CardHeader>
											<CardContent className="mt-auto">
												<div className="flex items-center justify-between">
													<span className="text-lg font-semibold text-pink-600">
														{service.price}€
													</span>
													{!user && (
														<NavLink to={`/login`}>
															<Button>Solicitar cita</Button>
														</NavLink>
													)}
													{user && user.role === 'guest' && (
														<NavLink to={`/new-date/${service.id}`}>
															<Button>Solicitar cita</Button>
														</NavLink>
													)}
													{user && user.role === 'admin' && (
														<NavLink to={`/new-date-admin/${service.id}`}>
															<Button>Solicitar cita</Button>
														</NavLink>
													)}
												</div>
											</CardContent>
										</div>
									</Card>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
