import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import Layout from '../components/layouts/Layout';
import { AuthContext } from '../contexts/AuthStore';
import { services as laVinServices } from '../components/services/LaVinServices/LaVinServices';
import SEO from '../components/seo/SEO';

// Icons
const Clock = ({ className }) => (
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
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
);
const ChevronDown = ({ className }) => (
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
		<path d="m6 9 6 6 6-6" />
	</svg>
);
const ChevronUp = ({ className }) => (
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
		<path d="m18 15-6-6-6 6" />
	</svg>
);
const X = ({ className }) => (
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
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	</svg>
);
const Star = ({ className }) => (
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
		<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
	</svg>
);
const Heart = ({ className }) => (
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
		<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
	</svg>
);
const Sparkles = ({ className }) => (
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
		<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
		<path d="M5 3v4" />
		<path d="M9 3v4" />
		<path d="M3 5h4" />
		<path d="M3 9h4" />
	</svg>
);
const Palette = ({ className }) => (
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
		<circle cx="13.5" cy="6.5" r=".5" />
		<circle cx="17.5" cy="10.5" r=".5" />
		<circle cx="8.5" cy="7.5" r=".5" />
		<circle cx="6.5" cy="12.5" r=".5" />
		<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.551-2.5 5.551-5.551C21.488 6.45 17.925 2 12 2Z" />
	</svg>
);

const icons = [Sparkles, Star, Heart, Palette];

// UI Components
const Card = ({ className, children }) => (
	<div
		className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}
	>
		{children}
	</div>
);
const CardContent = ({ className, children }) => (
	<div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const Button = ({ className, children, variant = 'default', ...props }) => {
	const baseStyles =
		'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
	const variants = {
		default: 'bg-pink-600 text-white hover:bg-pink-700',
		outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
	};
	return (
		<button
			className={`${baseStyles} ${variants[variant]} h-10 py-2 px-4 ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};

function ServicesPage() {
	const [expandedService, setExpandedService] = useState(null);
	const { user } = useContext(AuthContext);

	const toggleExpanded = (serviceId) => {
		setExpandedService(expandedService === serviceId ? null : serviceId);
	};

	return (
		<Layout>
			<SEO 
				title="Catálogo de Servicios de Manicura" 
				description="Explora nuestros servicios de uñas en Granada: Uñas de gel, acrílicas, esmaltado semipermanente y tratamientos de reconstrucción." 
			/>
			<div className="min-h-screen pb-12">
				{/* Header Section */}
				<div className="backdrop-blur-sm border-b">
					<div className="container mx-auto px-4 py-8">
						<div className="text-center">
							<h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-3">
								Servicios ofrecidos
							</h1>
							<p className="text-gray-600 text-lg max-w-2xl mx-auto">
								Descubre nuestra amplia gama de servicios profesionales para el
								cuidado y embellecimiento de tus uñas
							</p>
						</div>
					</div>
				</div>

				{/* Services Grid */}
				<div className="container mx-auto px-4 py-8">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{laVinServices.map((service, index) => {
							const IconComponent = icons[index % icons.length];
							const isExpanded = expandedService === service.id;

							// Appointment Button Logic
							const AppointmentButton = () => {
								if (!user) {
									return (
										<NavLink to="/login" className="w-full block">
											<Button className="w-full">Solicitar cita</Button>
										</NavLink>
									);
								}
								if (user.role === 'guest') {
									return (
										<NavLink
											to={`/new-date/${service.id}`}
											className="w-full block"
										>
											<Button className="w-full">Solicitar cita</Button>
										</NavLink>
									);
								}
								if (user.role === 'admin') {
									return (
										<NavLink
											to={`/new-date-admin/${service.id}`}
											className="w-full block"
										>
											<Button className="w-full">Solicitar cita</Button>
										</NavLink>
									);
								}
								return null;
							};

							return (
								<Card
									key={service.id}
									className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg relative flex flex-col"
								>
									{/* Service Image */}
									<div className="relative shrink-0">
										<img
											src={service.image || '/placeholder.svg'}
											alt={service.name}
											className="w-full h-52 object-cover"
										/>
										{/* {index === 0 && (
                      <Badge className="absolute top-3 right-3 bg-pink-500 hover:bg-pink-600">Popular</Badge>
                    )} */}
										<div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
											<IconComponent className="h-5 w-5 text-pink-600" />
										</div>
									</div>

									<CardContent className="p-6 flex flex-col grow">
										{/* Service Header */}
										<div className="mb-2 grow">
											<h3 className="text-xl font-bold text-gray-900 mt-3">
												{service.name}
											</h3>
											<div className="flex items-center justify-between mb-3">
												<span className="text-2xl font-bold text-pink-600">
													€{service.price}
												</span>
												<div className="flex items-center text-gray-500 text-sm">
													<Clock className="h-4 w-4 mr-1" />
													{service.dateDuration} hs
												</div>
											</div>
										</div>

										{/* Action Buttons */}
										<div className="space-y-3 mt-auto">
											<AppointmentButton />
											<Button
												variant="outline"
												className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent"
												onClick={() => toggleExpanded(service.id)}
											>
												{isExpanded ? (
													<>
														Menos detalles{' '}
														<ChevronUp className="ml-2 h-4 w-4" />
													</>
												) : (
													<>
														Ver detalles{' '}
														<ChevronDown className="ml-2 h-4 w-4" />
													</>
												)}
											</Button>
										</div>
									</CardContent>

									{isExpanded && (
										<div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-300 flex flex-col">
											{/* Header del overlay */}
											<div className="p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50 shrink-0">
												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-3">
														<div className="bg-white rounded-full p-2 shadow-sm">
															<IconComponent className="h-5 w-5 text-pink-600" />
														</div>
														<div>
															<h3 className="text-lg font-bold text-gray-900 line-clamp-1">
																{service.name}
															</h3>
															<div className="flex items-center space-x-4 text-sm text-gray-600">
																<span className="font-semibold text-pink-600">
																	€{service.price}
																</span>
																<div className="flex items-center">
																	<Clock className="h-3 w-3 mr-1" />
																	{service.dateDuration} hs
																</div>
															</div>
														</div>
													</div>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setExpandedService(null)}
														className="text-gray-500 hover:text-gray-700 hover:bg-white/50"
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
											</div>

											{/* Contenido del overlay (Scrollable) */}
											<div className="p-4 space-y-4 overflow-y-auto grow">
												<div>
													<h4 className="font-semibold text-gray-900 mb-2 text-sm leading-relaxed">
														Descripción:
													</h4>
													<p className="text-gray-600 text-sm ">
														{service.description}
													</p>
												</div>

												{/* <div>
													<h4 className="font-semibold text-gray-900 mb-3 text-sm">
														Incluye:
													</h4>
													<div className="grid grid-cols-1 gap-1">
														{features.map((feature, index) => (
															<div
																key={index}
																className="flex items-center text-sm text-gray-600"
															>
																<div className="w-2 h-2 bg-pink-400 rounded-full mr-3 flex-shrink-0"></div>
																{feature}
															</div>
														))}
													</div>
												</div> */}
											</div>

											{/* Botones de acción en el overlay (Fixed at bottom) */}
											<div className="p-4 border-t space-y-2 shrink-0 bg-white">
												<AppointmentButton />
												<Button
													variant="outline"
													className="w-full border-gray-200 text-gray-600 hover:bg-gray-100 bg-transparent"
													onClick={() => setExpandedService(null)}
												>
													Cerrar detalles
												</Button>
											</div>
										</div>
									)}
								</Card>
							);
						})}
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default ServicesPage;
