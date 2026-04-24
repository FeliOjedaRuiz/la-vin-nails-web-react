import React, { useContext, useState, useEffect, useCallback } from 'react';
import Layout from '../components/layouts/Layout';
import WeekNavigator from '../components/week-navigator/WeekNavigator';
import TurnListByWeek from '../components/turns/turn-list-by-week/TurnListByWeek';
import WeekCarousel from '../components/carousel/WeekCarousel';
import { Link } from 'react-router-dom';
import TurnsColorsExplication from '../components/turns/turns-color-explication/TurnsColorsExplication';
import { AuthContext } from '../contexts/AuthStore';
import { addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

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
		if (currentWeek?.firstDay) return weekToInitDate(currentWeek);
		const now = new Date();
		const firstDay = startOfWeek(now, { weekStartsOn: 0 });
		return weekToInitDate({ firstDay });
	});

	useEffect(() => {
		if (!currentWeek || !currentWeek.firstDay) {
			const now = new Date();
			const newWeek = {
				firstDay: startOfWeek(now, { weekStartsOn: 0 }),
				lastDay: endOfWeek(now, { weekStartsOn: 0 }),
			};
			onWeekSelect(newWeek);
			setInitDate(weekToInitDate(newWeek));
		} else {
			setInitDate(weekToInitDate(currentWeek));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentWeek]);

	const updateWeek = (baseDate) => {
		const newWeek = {
			firstDay: startOfWeek(baseDate, { weekStartsOn: 0 }),
			lastDay: endOfWeek(baseDate, { weekStartsOn: 0 }),
		};
		onWeekSelect(newWeek);
	};

	const handleWeekChange = (direction) => {
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

	const onInitDate = useCallback((date) => {
		setInitDate(date);
	}, []);

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
					/>
				</div>

				<TurnsColorsExplication />

				<div className="w-full pb-16">
					{initDate && (
						<WeekCarousel
							initDate={initDate}
							onWeekChange={handleWeekChange}
							renderItem={(date) => (
								<TurnListByWeek
									initDate={date}
									onTurnSelection={onTurnSelection}
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
