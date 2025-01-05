import { useEffect, useState } from 'react';
import Layout from '../components/layouts/Layout';
import NailPhotoGalery from '../components/nails-photos/nail-photo-galery/NailPhotoGalery';
import PhotoUpload from '../components/nails-photos/photo-upload/PhotoUpload';
import { useParams } from 'react-router-dom';
import datesService from '../services/dates';
import {
	Accordion,
	AccordionHeader,
	AccordionBody,
} from '@material-tailwind/react';
import UserProfile from '../components/users/user-profile/UserProfile';
import UserLoyalty from '../components/users/user-loyalty/UserLoyalty';
import DateDetailAdmin from './../components/dates/date-detail-admin/DateDetailAdmin';

function ProfilePage() {
	const [reload, setReload] = useState(false);
	const [visible, setVisible] = useState(false);
	const [dates, setDates] = useState([]);
	const { id } = useParams();
	const [open, setOpen] = useState(0);

	const userId = id;

	const handleOpen = (value) => setOpen(open === value ? 0 : value);

	useEffect(() => {
		setReload(!reload);
	}, []);

	const onPhotoCreation = () => {
		setReload(!reload);
	};

	const changeVisibility = () => {
		setVisible(!visible);
		console.log('visible', visible);
	};

	const transformDate = (date) => {
		let dt = new Date(date);
		let year = dt.getFullYear();
		let month = dt.getMonth() + 1;
		let day = dt.getDate();

		if (month < 10) {
			month = '0' + month;
		}

		if (day < 10) {
			day = '0' + day;
		}

		return `${year}-${month}-${day}`;
	};

	const actualDate = transformDate(new Date());

	useEffect(() => {
			datesService
				.listByUser(userId)
				.then((dates) => {
					const datesUserAndDate = dates.filter(
						(date) => date.turn.date >= actualDate
					);
					setDates(datesUserAndDate);
				})
				.catch((error) => console.error(error));
		}, [reload]);

	function Icon({ id, open }) {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={2}
				stroke="currentColor"
				className={`${
					id === open ? 'rotate-180' : ''
				} h-5 w-5 transition-transform`}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M19.5 8.25l-7.5 7.5-7.5-7.5"
				/>
			</svg>
		);
	}

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center p-4 max-w-xl mx-auto">
				<UserProfile userId={id} />
				<Accordion open={open === 2} icon={<Icon id={2} open={open} />}>
					<AccordionHeader
						className="text-pink-600 hover:text-pink-800 border-b-pink-50"
						onClick={() => handleOpen(2)}
					>
						Tarjeta de fidelidad
					</AccordionHeader>
					<AccordionBody>
						<UserLoyalty UserLoyalty userId={id} />
					</AccordionBody>
				</Accordion>
				<Accordion open={open === 1} icon={<Icon id={1} open={open} />}>
					<AccordionHeader
						className="text-pink-600 hover:text-pink-800 border-b-pink-50"
						onClick={() => handleOpen(1)}
					>
						Galeria
					</AccordionHeader>
					<AccordionBody>
						<PhotoUpload
							userId={id}
							onPhotoCreation={onPhotoCreation}
							changeVisibility={changeVisibility}
							visible={visible}
						/>
						<NailPhotoGalery
							userId={id}
							reload={reload}
							changeVisibility={changeVisibility}
						/>
					</AccordionBody>
				</Accordion>
				<Accordion open={open === 3} icon={<Icon id={3} open={open} />}>
					<AccordionHeader
						className="text-pink-600 hover:text-pink-800 border-b-pink-50"
						onClick={() => handleOpen(3)}
					>
						Próximas citas
					</AccordionHeader>
					<AccordionBody>
						<div className="p-4">
							<div>
								{!dates[0] && (
									<div className="text-center text-xl font-medium text-emerald-600 p-2 rounded-lg">
										No tienes citas pendientes
									</div>
								)}
								{dates.map((date) => (
									<DateDetailAdmin date={date}  />
								))}
							</div>
						</div>
					</AccordionBody>
				</Accordion>
				<Accordion open={open === 4} icon={<Icon id={4} open={open} />}>
					<AccordionHeader
						className="text-pink-600 hover:text-pink-800 border-b-pink-50"
						onClick={() => handleOpen(4)}
					>
						Configuración de cuenta
					</AccordionHeader>
					<AccordionBody>
						{/* <div className="flex flex-col items-center justify-center w-full">
							<div className="flex flex-col items-center justify-center w-full max-w-xl my-4 py-2 border-2 rounded-lg border-pink-600">
								<p className="mt-2 text-teal-700 font-semibold">
									¿Quieres cambiar tu contraseña?
								</p>
								<Link to="/restore">
									<button className="text-white bg-gradient-to-l m-3 mb-5 from-pink-700 via-pink-500 to-pink-700 shadow hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded text-md self-center  px-4 py-1 text-center">
										Restaurar contraseña
									</button>
								</Link>
							</div>

							<div className="flex flex-col max-w-xl justify-between items-center mt-3 p-4 border-2 rounded-lg border-emerald-600">
								<p className="text-center leading-tight text-pink-700 font-semibold">
									Próximamente podrás editar tus datos o eliminar tu cuenta. Si
									tienes alguna duda comunicate con el administrador:
								</p>
								<a
									className="flex flex-col items-center justify-center mt-3"
									href={`https://wa.me/$+34699861930?text=Hola tengo una duda sobre mi cuenta en La Vin Nails Web.`}
								>
									<ButtonGreen>
										<WhatsappIcon color={"#ffffff"} />
										Consultar
									</ButtonGreen>
								</a>
							</div>
						</div> */}
					</AccordionBody>
				</Accordion>
			</div>
		</Layout>
	);
}

export default ProfilePage;
