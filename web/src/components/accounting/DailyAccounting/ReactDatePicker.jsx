import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { es } from "react-day-picker/locale";
import LeftIcon from './../../icons/LeftIcon';
import RightIcon from './../../icons/RightIcon';

export default function ReactDatePicker({ date, setDate }) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);

	// Cerrar el popover al hacer click fuera del componente
	useEffect(() => {
		function handleClickOutside(event) {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleDaySelect = (selectedDate) => {
		setDate(selectedDate);
		setIsOpen(false);
	};

	return (
		<div className="my-2 relative" ref={containerRef}>
			{/* Input trigger */}
			<div className="relative">
				<input
					type="text"
					readOnly
					onClick={() => setIsOpen((prev) => !prev)}
					value={date ? format(date, 'PPP', { locale: es }) : ''}
					placeholder="Selecciona fecha"
					className="w-full cursor-pointer border-b-2 border-teal-500 bg-transparent py-2 pr-8 text-base text-teal-600 placeholder-teal-400 outline-none transition-colors focus:border-teal-700"
				/>
				<span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-teal-500">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
					</svg>
				</span>
			</div>

			{/* Popover calendar */}
			{isOpen && (
				<div className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
					<DayPicker
						mode="single"
						selected={date}
						onSelect={handleDaySelect}
						showOutsideDays
						classNames={{
							caption: 'flex justify-center py-2 mb-4 relative items-center',
							caption_label: 'text-sm font-medium text-teal-500',
							nav: 'flex items-center',
							nav_button:
								'h-6 w-6 bg-transparent hover:bg-teal-50/50 p-1 rounded-md transition-colors duration-300',
							nav_button_previous: 'absolute left-1.5',
							nav_button_next: 'absolute right-1.5',
							table: 'w-full border-collapse',
							head_row: 'flex font-medium text-teal-700',
							head_cell: 'm-0.5 w-9 font-normal text-sm',
							row: 'flex w-full mt-2',
							cell: 'text-teal-600 rounded-md h-9 w-9 text-center text-sm p-0 m-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-teal-900/20 [&:has([aria-selected].day-outside)]:text-white [&:has([aria-selected])]:bg-teal-900/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
							day: 'h-9 w-9 p-0 font-normal text-center',
							day_range_end: 'day-range-end',
							selected:
								'rounded-md bg-teal-700 text-white hover:bg-teal-700 hover:text-white focus:bg-teal-900 focus:text-white',
							today: 'rounded-md bg-pink-600 text-white',
							outside:
								'day-outside text-teal-500 opacity-50 aria-selected:bg-teal-500 aria-selected:text-teal-900 aria-selected:bg-opacity-10',
							disabled: 'text-teal-500 opacity-50',
							hidden: 'invisible',
							weekday: 'text-teal-800',
						}}
						locale={es}
						labels={{
							labelDayButton: (date, { today, selected }) => {
								let label = format(date, 'PPPP', { locale: es });
								if (today) label = `Hoy, ${label}`;
								if (selected) label = `${label}, seleccionado`;
								return label;
							},
							labelWeekNumber: (weekNumber) => `Semana ${weekNumber}`,
							labelNext: () => 'Próximo mes',
							labelPrevious: () => 'Mes anterior',
							labelMonthDropdown: () => 'Selecciona el mes',
							labelYearDropdown: () => "Selecciona el año",
						}}
						components={{
							IconLeft: ({ ...props }) => (
								<LeftIcon {...props} className="h-4 w-4 stroke-2" />
							),
							IconRight: ({ ...props }) => (
								<RightIcon {...props} className="h-4 w-4 stroke-2" />
							),
						}}
					/>
				</div>
			)}
		</div>
	);
}
