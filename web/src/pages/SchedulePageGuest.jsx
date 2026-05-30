import React, { useContext, useState, useEffect, useCallback } from 'react';
import Layout from '../components/layouts/Layout';
import WeekNavigator from '../components/week-navigator/WeekNavigator';
import TurnListByWeek from '../components/turns/turn-list-by-week/TurnListByWeek';
import WeekCarousel from '../components/carousel/WeekCarousel';
import { Link } from 'react-router-dom';
import TurnsColorsExplication from '../components/turns/turns-color-explication/TurnsColorsExplication';
import { AuthContext } from '../contexts/AuthStore';
import { addWeeks, subWeeks, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { getVisibilityCeiling } from '../utils/monthVisibility';

const weekToInitDate = (week) => {
	if (!week?.firstDay) return undefined;
	const d = new Date(week.firstDay);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

function SchedulePageGuest() {
	const { currentWeek, onWeekSelect } = useContext(AuthContext);
	const [initDate, setInitDate] = useState(() => {
		const now = new Date();
		const firstDay = startOfWeek(now, { weekStartsOn: 0 });
		return weekToInitDate({ firstDay });
	});

	useEffect(() => {
		const now = new Date();
		const newWeek = {
			firstDay: startOfWeek(now, { weekStartsOn: 0 }),
			lastDay: endOfWeek(now, { weekStartsOn: 0 }),
		};
		onWeekSelect(newWeek);
		setInitDate(weekToInitDate(newWeek));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Solo al montar, para resetear a la semana actual siempre

	// Semana actual: los guests no pueden navegar al pasado
	const isCurrentWeek = currentWeek?.firstDay
		? isSameDay(
				startOfWeek(new Date(), { weekStartsOn: 0 }),
				new Date(currentWeek.firstDay)
		  )
		: true;

	// Techo de visibilidad y navegación (con excepción de junio)
	const { maxVisibleDate, maxNavigationDate } = getVisibilityCeiling();

	// ¿La semana mostrada ya toca o supera el techo de navegación?
	const isAtMaxWeek = currentWeek?.lastDay
		? new Date(currentWeek.lastDay) >= maxNavigationDate
		: false;

	const handleWeekChange = (direction) => {
		if (direction === 'prev' && isCurrentWeek) return; // Guard: guests can't go to past weeks
		if (direction === 'next' && isAtMaxWeek) return;   // Guard: guests can't go beyond next month
		if (!currentWeek?.firstDay) return;
		const base = new Date(currentWeek.firstDay);
		const newBase = direction === 'next' ? addWeeks(base, 1) : subWeeks(base, 1);
		const newWeek = {
			firstDay: startOfWeek(newBase, { weekStartsOn: 0 }),
			lastDay: endOfWeek(newBase, { weekStartsOn: 0 }),
		};
		// Actualizar initDate SÍNCRONAMENTE antes del chain de contexto.
		// Sin esto el WeekCarousel ve initDate viejo al re-renderizar → flash.
		setInitDate(weekToInitDate(newWeek));
		onWeekSelect(newWeek);
	};

	const onTurnSelection = useCallback(() => {}, []);

	return (
		<Layout>
			<div className="p-2 flex flex-col items-center gap-1.5 overflow-hidden">
				<div>
					<h1 className="font-bold text-2xl md:text-4xl lg:text-5xl text-center text-teal-800 tracking-tight mt-1">
						Turnos disponibles
					</h1>
				</div>

				<div className="px-2 w-full flex justify-center mt-1">
					<WeekNavigator
						currentWeek={currentWeek}
						onPrev={() => handleWeekChange('prev')}
						onNext={() => handleWeekChange('next')}
						disablePrev={isCurrentWeek}
						disableNext={isAtMaxWeek}
					/>
				</div>

				<TurnsColorsExplication />

				<div className="w-full pb-16">
					{initDate && (
						<WeekCarousel
							initDate={initDate}
							onWeekChange={handleWeekChange}
							disablePrev={isCurrentWeek}
							disableNext={isAtMaxWeek}
							renderItem={(date) => (
								<TurnListByWeek
									initDate={date}
									onTurnSelection={onTurnSelection}
									maxVisibleDate={maxVisibleDate}
								/>
							)}
						/>
					)}
				</div>

				<Link
					className="fixed bottom-[4.5rem] flex justify-center bg-pink-500/95 backdrop-blur-sm shadow-md shadow-pink-500/30 rounded-lg border border-yellow-400 z-50 transition-transform active:scale-95"
					to="/services"
				>
					<p className="m-0 text-center text-sm md:text-base font-bold text-white px-4 py-1.5 drop-shadow-sm">
						¡Pide tu cita aquí!
					</p>
				</Link>
			</div>
		</Layout>
	);
}

export default SchedulePageGuest;
