import React, { useContext, useEffect, useState, useCallback } from 'react';
import turnsService from '../../../services/turns';
import datesService from '../../../services/dates';
import { Link, useParams } from 'react-router-dom';
import SaveIconSVG from '../../icons/SaveIconSVG';
import WhatsappIcon from '../../icons/WhatsappIcon';
import { useNavigate } from 'react-router-dom';
import Modal from '../../modal/Modal';
import DeleteIcon from '../../icons/DeleteIcon';
import ButtonGreen from '../../butons/ButtonGreen';
import UserProfile from './../../users/user-profile/UserProfile';
import { AuthContext } from '../../../contexts/AuthStore';
import { clearAdminTurnsCache } from '../turns-list-by-week-admin/TurnsListByWeekAdmin';
import { clearGuestTurnsCache } from '../turn-list-by-week/TurnListByWeek';

function TurnDetailAndUpdate() {
	const { id } = useParams();
	const [turn, setTurn] = useState({});
	const { currentDate } = useContext(AuthContext);
	const [date, setDate] = useState();
	const [turnDateWhatsapp, setTurnDateWhatsapp] = useState();
	const navigate = useNavigate();
	const [turnStates, setTurnStates] = useState([
		'Disponible',
		'Solicitado',
		'Confirmado',
		'Cancelado',
		'Reservado',
	]);
	const [modalState, setModalState] = useState(false);
	const [modalDateState, setModalDateState] = useState(false);
	const [reload, setReload] = useState(false);

	const [serverError, setServerError] = useState(undefined);

	const months = [
		'Enero',
		'Febrero',
		'Marzo',
		'Abril',
		'Mayo',
		'Junio',
		'Julio',
		'Agosto',
		'Septiembre',
		'Octubre',
		'Noviembre',
		'Diciembre',
	];

	const days = {
		1: 'Lunes',
		2: 'Martes',
		3: 'Miércoles',
		4: 'Jueves',
		5: 'Viernes',
		6: 'Sábado',
		7: 'Domingo',
	};

	const showDate = useCallback((date) => {
		let turnDate = new Date(date);
		return `${days[turnDate.getDay()]} ${turnDate.getDate()} de ${
			months[turnDate.getMonth()]
		}`;
	}, []);

	useEffect(() => {
		// Solo aceptar currentDate si pertenece a este turno (evita flicker
		// de datos stale al navegar directo desde notificación push).
		// currentDate.turn es el ObjectId del turno, id viene de useParams().
		// NO llamamos deleteDate() — así currentDate sobrevive al back navigation.
		if (currentDate && currentDate.turn === id) {
			setDate(currentDate);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentDate, id]);

	useEffect(() => {
		turnsService
			.detail(id)
			.then((turn) => {
				setTurn(turn);
				const newStates = turnStates.filter((state) => turn.state !== state);
				newStates.unshift(turn.state);
				setTurnStates(newStates);
				
				// dateData del backend SIEMPRE gana — es la fuente de verdad.
				// Corrige el caso de notificación directa donde currentDate
				// puede estar stale de una navegación anterior.
				if (turn.dateData) {
					setDate(turn.dateData);
				}
			})
			.catch((error) => console.error(error));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reload, id]);

	useEffect(() => {
		if (turn.date) {
			setTurnDateWhatsapp(showDate(turn.date));
		}
	}, [turn, date, showDate]);

	// useEffect(() => {
	//   const query = {};
	//   query.turn = id;

	//   datesService
	//     .list(query)
	//     .then((dates) => {
	//       setDate(dates[0]);
	//     })
	//     .catch((error) => console.error(error));
	// }, [reload]);

	const handleTurnChange = (ev) => {
		const key = ev.target.id;
		const value = ev.target.value;

		setTurn({
			...turn,
			[key]: value,
		});
	};

	const handleDateChange = (ev) => {
		const key = ev.target.id;
		const value = ev.target.value;

		setDate({
			...date,
			[key]: value,
		});
	};

	const handleSubmit = async (ev) => {
		ev.preventDefault();
		await onTurnSubmit(turn);
		if (date) {
			await onDateSubmit(date);
		}
		clearAdminTurnsCache();
		clearGuestTurnsCache();
		navigate('/admin-schedule');
	};

	const onTurnSubmit = async (turn) => {
		try {
			setServerError();
			turn = await turnsService.update(id, turn);
		} catch (error) {
			setServerError(error.message);
		}
	};

	const onDateSubmit = async (date) => {
		date.user = date.user.id;
		date.turn = date.turn.id;
		date.service = date.service.id;
		const dateId = date.id;
		try {
			setServerError();
			date = await datesService.update(dateId, date);
		} catch (error) {
			setServerError(error.message);
		}
	};

	const handleDeleteTurn = () => {
		turnsService
			.deleteTurn(id)
			.then(navigateToSchedule)
			.catch((error) => console.error(error));
	};

	const navigateToSchedule = () => {
		clearAdminTurnsCache();
		clearGuestTurnsCache();
		navigate('/admin-schedule');
	};

	const handleDeleteDate = () => {
		setModalDateState(!modalDateState);
		datesService
			.deleteDate(date.id)
			.then(updateTurnState)
			.catch((error) => console.error(error));
	};

	const onDateDelete = () => {
		// Limpiar el estado local de la cita para que la UI
		// deje de mostrar los detalles de la cita eliminada.
		setDate(undefined);
		// Invalidar cachés para que el calendario muestre datos frescos
		// sin importar cómo navegue el admin de vuelta (navbar, atrás, etc.)
		clearAdminTurnsCache();
		clearGuestTurnsCache();
		setReload(!reload);
	};

	const updateTurnState = () => {
		// CRITICAL FIX: date.turn es un STRING ID (no un objeto)
		// porque el backend serializa con d.turn.toString().
		// Antes hacía `const turn = date.turn; turn.state = 'Cancelado'`
		// lo cual intentaba setear .state en un string primitivo → fallo silencioso.
		turnsService
			.update(id, { state: 'Cancelado' })
			.then(onDateDelete)
			.catch((error) => console.error(error));
	};

	return (
		<div className="bg-white/50 rounded-lg px-2 pt-3 md:p-6 shadow ">
			<h2 className="text-3xl md:text-4xl md:mb-4 mb-2 font-bold text-center color text-pink-700">
				Detalle del turno
			</h2>
			<form onSubmit={handleSubmit}>
				{serverError && (
					<div className="text-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white">
						{serverError}
					</div>
				)}

				<div className="flex flex-wrap px-2 ">
					<div className="mr-5 mb-2">
						<label
							for="date"
							className="ml-2 font-medium text-pink-800 text-sm"
						>
							Fecha
						</label>
						<div>
							<input
								type="date"
								id="date"
								onChange={handleTurnChange}
								value={turn.date}
								className="rounded-lg h-10 w-36 px-2 border-2 border-pink-300"
							/>
						</div>
					</div>

					<div className="mr-5 mb-2">
						<div>
							<label
								for="hour"
								className="ml-2 font-medium text-pink-800 text-sm"
							>
								Hora
							</label>
							<div>
								<input
									type="time"
									id="hour"
									onChange={handleTurnChange}
									value={turn.hour}
									className="rounded-lg h-10 max-w-min px-2 border-2 border-pink-300"
								/>
							</div>
						</div>
					</div>

					<div className="flex flex-wrap">
						<div className="mr-5">
							<label
								for="state"
								className="ml-2 font-medium text-pink-800 text-sm"
							>
								Estado
							</label>
							<div>
								<select
									className="rounded-lg px-2 h-10 w-36 border-2 border-pink-300 align-top "
									id="state"
									onChange={handleTurnChange}
								>
									{turnStates.map((state) => (
										<option value={state}>{state}</option>
									))}
								</select>
							</div>
						</div>
						{!date && (
							<div className="flex items-end justify-start pt-2">
								{/* setModalState(!modalState) */}
								<div
									onClick={() => setModalState(!modalState)}
									className="flex justify-center items-center h-10 w-10 text-white font-medium rounded-lg text-lg shadow-lg bg-red-700 hover:bg-red-800 hover:ring-2 hover:ring-red-500 focus:ring-2 focus:ring-red-500"
								>
									{' '}
									<DeleteIcon />
								</div>
							</div>
						)}
					</div>
				</div>

				<Modal modalState={modalState} setModalState={setModalState}>
					<div className="text-center mb-6">
						<p className="font-bold text-2xl">Eliminar Turno</p>
					</div>

					<div className="text-center text-xl font-medium mb-6">
						<p>¿Quieres eliminar el turno?</p>
					</div>

					<div className="flex justify-around">
						<div
							onClick={() => setModalState(!modalState)}
							className="bg-red-600 text-white  px-2 py-1 rounded "
						>
							Cancelar
						</div>
						<div
							onClick={handleDeleteTurn}
							className="bg-green-600 text-white  px-2 py-1 rounded "
						>
							Aceptar
						</div>
					</div>
				</Modal>

				{!date && (
					<div className=" text-center mt-4 p-0.5 text-pink-600 text-xl font-bold">
						¡Este turno aún no fue solicitado!
					</div>
				)}

				{date && (
					<div className="my-6">
						<h2 className="text-2xl mb-2 font-bold text-center color text-pink-700">
							Detalle de la cita
						</h2>

						<Link to={`/users/${date.user.id}`}>
							<UserProfile user={date.user} />
						</Link>

						<div className="mt-1">
							<span className="ml-2 font-medium text-pink-800 text-base">
								Servicio:
							</span>
							<span> {date.service.name} </span>
						</div>

						<div className="mt-1">
							<span className="ml-2 font-medium text-pink-800 text-base">
								Tipo:
							</span>
							<span className=" inline text-clip overflow-hidden">
								{' '}
								{date.type}
							</span>
						</div>

						<div className="mt-1">
							<span className="ml-2 font-medium text-pink-800 text-base">
								Remoción:
							</span>
							<span className=" inline text-clip overflow-hidden">
								{' '}
								{date.needRemove}
							</span>
						</div>

						<div className="mt-1">
							<span className="ml-2 font-medium text-pink-800 text-base">
								Detalles:
							</span>
							<span className=""> {date.designDetails}</span>
						</div>

						<div
							className="flex mb-2 mt-1
               items-center"
						>
							<label
								for="cost"
								className="mx-2 font-medium text-pink-800 text-base"
							>
								Costo:
							</label>
							<input
								type="number"
								id="cost"
								onChange={handleDateChange}
								value={date.cost}
								className=" h-7 w-14 p-2 border-2 border-pink-300 text-md rounded-lg focus:ring-teal-500  focus:border-teal-500"
								placeholder="00"
							/>
							<span className="ml-1 font-medium text-pink-800 text-base">
								€.
							</span>
						</div>

						<div className=" flex items-center">
							<label
								for="duration"
								className="mx-2 font-medium text-pink-800 text-base"
							>
								Duración:
							</label>
							<input
								type="text"
								id="duration"
								onChange={handleDateChange}
								value={date.duration}
								className="h-7 p-2 border-2 w-14 border-pink-300 text-md rounded-lg focus:ring-teal-500  focus:border-teal-500"
								placeholder="0:00"
							/>{' '}
							<span className="ml-1 font-medium text-pink-800 text-lg">
								{' '}
								hs.
							</span>
						</div>
					</div>
				)}

				<div className="flex mt-8 justify-evenly">
					<button
						type="submit"
						className=" flex justify-center m-1 items-center text-white py-1 px-3 font-medium rounded-md text-lg shadow-lg bg-gradient-to-l from-pink-700 via-pink-500 to-pink-700 hover:bg-pink-700 hover:ring-2 hover:ring-pink-400 focus:ring-2 focus:ring-pink-400"
					>
						<SaveIconSVG />
						Guardar
					</button>

					{date && (
						<a
							href={`https://wa.me/34${date.user.phone}?text=¡Hola! 👋😃Tu cita de ${date.service.name} 💅 ha sido confirmada✅ para el *${turnDateWhatsapp} a las ${turn.hour} hs.* El costo es de *${date.cost}€* y una duración estimada de *${date.duration} hs. ⏰*
              %0A%0A¡Te espero! 💋`}
							className="flex items-center justify-center"
						>
							{' '}
							<ButtonGreen styles={'py-1.5 flex items-center gap-2'}>
								<WhatsappIcon color={'#ffffff'} /> Escribir
							</ButtonGreen>
						</a>
					)}

					{date && (
						<div
							onClick={() => setModalDateState(!modalDateState)}
							className="flex justify-center items-center text-white m-1 h-10 w-10 font-medium rounded-lg text-lg shadow-lg bg-red-700 hover:bg-red-800 hover:ring-2 hover:ring-red-500 focus:ring-2 focus:ring-red-500"
						>
							{' '}
							<DeleteIcon />
						</div>
					)}
				</div>
			</form>
			<Modal modalState={modalDateState} setModalDateState={setModalDateState}>
				<div className="text-center mb-6">
					<p className="font-bold text-2xl">Cancelar Cita</p>
				</div>

				<div className="text-center text-xl font-medium mb-6">
					<p>¿Quieres cancelar la cita?</p>
				</div>

				<div className="flex justify-around">
					<button
						onClick={() => setModalDateState(!modalDateState)}
						className="bg-red-600 text-white  px-2 py-1 rounded "
					>
						Cancelar
					</button>
					<button
						onClick={handleDeleteDate}
						className="bg-green-600 text-white  px-2 py-1 rounded "
					>
						Aceptar
					</button>
				</div>
			</Modal>
		</div>
	);
}

export default TurnDetailAndUpdate;
