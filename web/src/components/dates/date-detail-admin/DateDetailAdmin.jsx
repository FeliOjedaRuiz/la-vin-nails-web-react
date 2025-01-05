import React, { useEffect, useState } from 'react';

function DateDetailAdmin({ date }) {
	const [state, setState] = useState('');

	useEffect(() => {
		if (date.turn.state === 'Solicitado') {
			setState('Sin confirmación');
		} else {
			setState(date.turn.state);
		}
	}, []);


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
		</div>
	);
}

export default DateDetailAdmin;
