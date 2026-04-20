import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import datesService from '../../../services/dates';
import { AuthContext } from '../../../contexts/AuthStore';

function TurnItemAdmin({ turn }) {
	const [bg, setBg] = useState('');
	const [textColor, setTextColor] = useState('');
	const { onDateSelect } = useContext(AuthContext);
	const id = turn.id;
	
	const hasPreloadedDate = turn.hasOwnProperty('dateData');
	const [loaded, setLoaded] = useState(hasPreloadedDate);
	const [date, setDate] = useState(hasPreloadedDate ? turn.dateData : undefined);

	const handleDateSelect = () => {
		onDateSelect(date);
	};

	useEffect(() => {
		if (hasPreloadedDate) {
			setDate(turn.dateData);
			setLoaded(true);
			if (turn.dateData && !turn.dateData.user) {
				console.error(`Error cita ID ${turn.dateData.id}, turno ${turn.id}`);
			}
			return;
		}

		console.warn("Fetching date individually for turn - should be optimized", turn.id);
		const query = {};
		query.turn = id;

		datesService
			.list(query)
			.then((dateArr) => {
				const fetchedDate = dateArr && dateArr.length > 0 ? dateArr[0] : null;
				setDate(fetchedDate);
				setLoaded(true);
				if (fetchedDate && !fetchedDate.user) {
					console.error(`Error cita ID ${fetchedDate.id}, turno ${turn.id}`);
				}
			})
			.catch((error) => console.error(error));
	}, [turn, hasPreloadedDate, id]);

	useEffect(() => {
		const isHandsAndFeet = date?.service?.name === "Semi Manos y Pies";

		switch (turn.state) {
			case 'Reservado':
				setBg('bg-orange-600');
				setTextColor('text-black');
				break;
			case 'Disponible':
				setBg('bg-white border-2 border-emerald-500');
				setTextColor('text-black');
				break;
			case 'Solicitado':
				setBg(isHandsAndFeet ? 'bg-teal-200' : 'bg-yellow-500');
				setTextColor('text-black');
				break;
			case 'Confirmado':
				setBg(isHandsAndFeet ? 'bg-emerald-700' : 'bg-emerald-500');
				setTextColor('text-white');
				break;
			case 'Cancelado':
				setBg('bg-red-600');
				setTextColor('text-white');
				break;
			default:
				break;
		}
	}, [turn, date]);

	return (
		<>
			{loaded && (
				<NavLink to={`/turns/${id}`}>
					<div
						onClick={handleDateSelect}
						className={`mb-0.5 ${bg} rounded shadow-sm py-[2px] px-0.5 flex flex-col `}
					>
						<p className={`pl-1 font-medium text-[10px] md:text-xs leading-[14px] truncate ${textColor}`}>
							{turn.hour} - {date && date.user.name}
						</p>
					</div>
				</NavLink>
			)}
			{!loaded && (
				<div
					onClick={handleDateSelect}
					className={`mb-0.5 ${bg} rounded shadow-sm py-[2px] px-0.5 flex flex-col `}
				>
					<p className={`pl-1 font-medium text-[10px] md:text-xs leading-[14px] truncate ${textColor}`}>
						{turn.hour}
					</p>
				</div>
			)}
		</>
	);
}

export default TurnItemAdmin;
