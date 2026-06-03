import React, { useMemo, useState } from 'react';
import WhatsappIcon from '../../icons/WhatsappIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import datesService from '../../../services/dates';
import turnsService from '../../../services/turns';
import Modal from './../../modal/Modal';

const MAPS_URL = 'https://www.google.es/maps/place/La+Vin+Nails/@37.199055,-3.6219443,17z/data=!3m1!4b1!4m6!3m5!1s0xd71fdcc60fab787:0xffdd8e2502825163!8m2!3d37.1990508!4d-3.6193694!16s%2Fg%2F11tsjffhvt?entry=ttu';

/**
 * Genera URL de Google Calendar con datos prellenados.
 * Formato: YYYYMMDDTHHmmss/YYYYMMDDTHHmmss
 */
function buildGoogleCalendarUrl(date) {
	const { turn, service, type, designDetails, cost, duration } = date;
	
	// Parsear fecha y hora de inicio
	const [year, month, day] = turn.date.split('-');
	const [hours, minutes] = turn.hour.split(':');
	const startDate = `${year}${month}${day}T${hours}${minutes}00`;
	
	// Calcular hora de fin
	const durHours = duration || 1;
	const totalStartMinutes = parseInt(hours) * 60 + parseInt(minutes);
	const totalEndMinutes = totalStartMinutes + Math.round(durHours * 60);
	const endHours = Math.floor(totalEndMinutes / 60) % 24;
	const endMinutes = totalEndMinutes % 60;
	const endDate = `${year}${month}${day}T${String(endHours).padStart(2, '0')}${String(endMinutes).padStart(2, '0')}00`;
	
	const title = encodeURIComponent(`La Vin Nails - ${service.name}`);
	
	const details = encodeURIComponent(
		`Tipo: ${type}\n` +
		(designDetails ? `Detalles: ${designDetails}\n` : '') +
		`Precio: ${cost ? cost + '€' : 'Sin confirmar'}\n` +
		`Duración: ${duration ? duration + ' hs' : 'Sin confirmar'}\n\n` +
		`La Vin Nails | ${MAPS_URL}`
	);
	
	const location = encodeURIComponent('La Vin Nails - Granada');
	
	return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}&sf=true`;
}

function DateDetail({ date, onDateDelete }) {
	const [modalState, setModalState] = useState(false);
	const state = date.turn.state === 'Solicitado' ? 'Sin confirmación' : date.turn.state;

	const stateStyle = useMemo(() => {
		switch (state) {
			case 'Confirmado':
				return 'bg-emerald-100 text-emerald-700 border-emerald-200';
			case 'Sin confirmación':
				return 'bg-amber-50 text-amber-700 border-amber-200';
			case 'Cancelado':
				return 'bg-red-50 text-red-600 border-red-200';
			case 'Completado':
				return 'bg-pink-50 text-pink-700 border-pink-200';
			default:
				return 'bg-gray-50 text-gray-600 border-gray-200';
		}
	}, [state]);

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

	const whatsappUrl = `https://wa.me/$+34699861930?text=%C2%A1Hola%21%20Tengo%20una%20duda%20sobre%20mi%20cita%20del%20${date.turn.date}%20a%20las%20${date.turn.hour}%20hs.`;
	const googleCalendarUrl = useMemo(() => buildGoogleCalendarUrl(date), [date]);

	return (
		<>
			<div className="bg-white rounded-xl border border-pink-100 shadow-sm mb-3 overflow-hidden transition-shadow hover:shadow-md">
				{/* Header: Service name + State badge (stacked to avoid overflow) */}
				<div className="px-4 py-3 bg-gradient-to-r from-pink-50/50 to-white border-b border-pink-50">
				<div className="flex items-start justify-between gap-2 min-w-0">
					<h3 className="font-semibold text-pink-700 text-base leading-tight min-w-0 flex-1">
						{date.service.name}
					</h3>
						<span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${stateStyle}`}>
							{state}
						</span>
					</div>
				</div>

				{/* Body: Compact info */}
				<div className="px-4 py-3 space-y-2">
					{/* Date + Time - same line */}
					<div className="flex items-center gap-4 text-sm text-gray-700">
						<span className="flex items-center gap-1.5">
							<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500 shrink-0">
								<rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
								<line x1="16" x2="16" y1="2" y2="6" />
								<line x1="8" x2="8" y1="2" y2="6" />
								<line x1="3" x2="21" y1="10" y2="10" />
							</svg>
							{date.turn.date}
						</span>
						<span className="flex items-center gap-1.5">
							<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500 shrink-0">
								<circle cx="12" cy="12" r="10" />
								<polyline points="12 6 12 12 16 14" />
							</svg>
							{date.turn.hour} hs
						</span>
					</div>

					{/* Type */}
					{date.type && (
						<div className="flex items-center gap-1.5 text-sm text-gray-600">
							<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 shrink-0">
								<path d="M20.7 14.9c.3-.3.5-.7.5-1.1 0-.4-.2-.8-.5-1.1l-6.4-6.4c-.6-.6-1.6-.6-2.2 0L5.7 12.7c-.3.3-.5.7-.5 1.1 0 .4.2.8.5 1.1l6.4 6.4c.6.6 1.6.6 2.2 0l6.4-6.4z" />
								<path d="m14 10 2 2" />
							</svg>
							{date.type}
						</div>
					)}

					{/* Design Details - can be long, own line */}
					{date.designDetails && (
						<div className="flex items-start gap-1.5 text-sm text-gray-600">
							<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 shrink-0 mt-0.5">
								<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
								<path d="M15 3v4h4" />
								<path d="M8 13h.01" />
								<path d="M12 13h.01" />
								<path d="M16 13h.01" />
							</svg>
							<span className="leading-snug">{date.designDetails}</span>
						</div>
					)}

					{/* Removal - X in circle icon */}
					{date.needRemove && (
						<div className="flex items-center gap-1.5 text-sm text-gray-600">
							<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 shrink-0">
								<circle cx="12" cy="12" r="10" />
								<path d="m15 9-6 6" />
								<path d="m9 9 6 6" />
							</svg>
							{date.needRemove}
						</div>
					)}

					{/* Cost + Duration - always visible, same line */}
					<div className="flex items-center gap-4 pt-1 border-t border-gray-50">
						<span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
							<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
								<circle cx="12" cy="12" r="10" />
								<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
								<path d="M12 18V6" />
							</svg>
							{date.cost ? `${date.cost}€` : 'Sin confirmar'}
						</span>
						<span className="flex items-center gap-1.5 text-sm text-gray-500">
							<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
								<circle cx="12" cy="12" r="10" />
								<polyline points="12 6 12 12 16 14" />
							</svg>
							{date.duration ? `${date.duration} hs` : 'Sin confirmar'}
						</span>
					</div>
				</div>

				{/* Footer: Agendar (left) + icon actions (right) - same line */}
				<div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-pink-50/50 to-white border-t border-pink-50">
					{/* Agendar button */}
					<a
						href={googleCalendarUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 via-teal-500 via-25% to-pink-400 hover:from-emerald-600 hover:via-teal-600 hover:to-pink-500 transition-all shadow-sm shrink-0"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
							<rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
							<line x1="16" x2="16" y1="2" y2="6" />
							<line x1="8" x2="8" y1="2" y2="6" />
							<line x1="3" x2="21" y1="10" y2="10" />
						</svg>
						Agendar
					</a>
					{/* Icon actions */}
					<div className="flex items-center gap-2">
						<a
							href={MAPS_URL}
							className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-pink-700 text-white hover:from-pink-600 hover:to-pink-800 transition-all shadow-sm"
							aria-label="Ver ubicación"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
								<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
								<circle cx="12" cy="10" r="3" />
							</svg>
						</a>
						<a
							href={whatsappUrl}
							className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
							aria-label="Consultar por WhatsApp"
						>
							<WhatsappIcon color="#ffffff" />
						</a>
						<button
							onClick={() => setModalState(!modalState)}
							className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-600 text-white hover:bg-red-700 hover:ring-2 hover:ring-red-400 focus:ring-2 focus:ring-red-400 transition-all shadow-sm"
							aria-label="Cancelar cita"
						>
							<DeleteIcon className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Cancel confirmation modal */}
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
						className="text-white px-4 py-2 rounded bg-red-700 hover:bg-red-800 hover:ring-2 hover:ring-red-500 focus:ring-2 focus:ring-red-500"
					>
						Cancelar
					</button>
					<button
						onClick={handleDeleteDate}
						className="text-white px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-800 hover:ring-2 hover:ring-emerald-500 focus:ring-2 focus:ring-emerald-500"
					>
						Aceptar
					</button>
				</div>
			</Modal>
		</>
	);
}

export default DateDetail;
