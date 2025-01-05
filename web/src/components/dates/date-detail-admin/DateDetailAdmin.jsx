import React, { useEffect, useState } from 'react';
import WhatsappIcon from '../../icons/WhatsappIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import datesService from '../../../services/dates';
import turnsService from '../../../services/turns';
import Modal from './../../modal/Modal';
import ButtonGreen from '../../butons/ButtonGreen';

function DateDetailAdmin({ date }) {
	const [state, setState] = useState('');
	const [serverError, setServerError] = useState(undefined);
	const [modalState, setModalState] = useState(false);

	useEffect(() => {
		if (date.turn.state === 'Solicitado') {
			setState('Sin confirmación');
		} else {
			setState(date.turn.state);
		}
	}, []);

	const handleDeleteDate = () => {
		setModalState(!modalState);
		datesService
			.deleteDate(date.id)
			.then(updateTurnState)
			.catch((error) => console.error(error));
	};

	const updateTurnState = () => {
		const id = date.turn.id;
		const turn = date.turn;
		turn.state = 'Cancelado';

		turnsService
			.update(id, turn)
			.then(onDateDelete)
			.catch((error) => console.error(error));
	};

	return (
		<div className="bg-white/50 p-4 mb-6 border-2 border-emerald-500 rounded-lg shadow-lg md:flex md:justify-around md:p-6">
			<div>
				<p className="text-lg font-medium text-pink-700">
					Fecha:{' '}
					<span className=" font-normal text-black ">{date.turn.date}</span>
				</p>
				<p className="text-lg font-medium text-pink-700">
					Hora:{' '}
					<span className=" font-normal text-black ">{date.turn.hour} hs.</span>
				</p>
				<p className="text-lg font-medium text-pink-700">
					Servicio:{' '}
					<span className=" font-normal text-black ">{date.service.name}</span>{' '}
				</p>
				<p className="text-lg font-medium text-pink-700">
					Tipo: <span className=" font-normal text-black ">{date.type}</span>{' '}
				</p>
				<p className="text-lg font-medium text-pink-700">
					Detalles:{' '}
					<span className=" font-normal text-black ">{date.designDetails}</span>{' '}
				</p>
				<p className="text-lg font-medium text-pink-700">
					Remoción:{' '}
					<span className=" font-normal text-black ">{date.needRemove}</span>{' '}
				</p>
				<p className="text-lg font-medium text-pink-700">
					Precio:{' '}
					<span className=" font-normal text-black ">
						{date.cost}
						{date.cost && <>€.</>} {!date.cost && <>sin confirmar.</>}{' '}
					</span>{' '}
				</p>
				<p className="text-lg font-medium text-pink-700">
					Duración estimada:{' '}
					<span className=" font-normal text-black ">
						{date.duration} {date.duration && <>hs.</>}{' '}
						{!date.duration && <>sin confirmar.</>}{' '}
					</span>{' '}
				</p>
				
			</div>
			<div className="flex flex-col md:m-6">
				<div className="mt-2 mb-2 text-2xl text-center">
					<p className="  text-center font-bold text-pink-800">Estado: </p>
					<p className=" text-center font-medium  leading-snug text-black ">
						{state}
					</p>
				</div>
			</div>
			<Modal modalState={modalState} setModalState={setModalState}>
				<div className="text-center mb-6">
					<p className="font-bold text-2xl">CANCELAR CITA</p>
				</div>

				<div className="text-center text-xl font-medium mb-6">
					<p>¿Estas seguro de que quieres cancelar tu cita?</p>
				</div>

				<div className="flex justify-around">
					<button
						onClick={() => setModalState(!modalState)}
						className="text-white  px-2 py-1 rounded bg-red-700 hover:bg-red-800 hover:ring-2 hover:ring-red-500 focus:ring-2 focus:ring-red-500"
					>
						Cancelar
					</button>
					<button
						onClick={handleDeleteDate}
						className="text-white  px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-800 hover:ring-2 hover:ring-emerald-500 focus:ring-2 focus:ring-emerald-500"
					>
						Aceptar
					</button>
				</div>
			</Modal>
		</div>
	);
}

export default DateDetailAdmin;
