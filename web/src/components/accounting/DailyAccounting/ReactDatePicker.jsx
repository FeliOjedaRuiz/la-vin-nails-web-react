import React, { useState } from 'react';
import {
	Input,
	Popover,
	PopoverHandler,
	PopoverContent,
} from '@material-tailwind/react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { es } from "react-day-picker/locale";
import LeftIcon from './../../icons/LeftIcon';
import RightIcon from './../../icons/RightIcon';

export default function ReactDatePicker({ date, setDate }) {
	const [openPopover, setOpenPopover] = useState(false);	

	return (
		<div className="my-2">
			<Popover placement="bottom">
				<PopoverHandler >
					<Input
						label="Selecciona fecha"
						onChange={() => null}
						value={date ? format(date, 'PPP', { locale: es }) : ''}
						color='teal'
            className='text-teal-600 text-xl'
            size='lg'
					/>
				</PopoverHandler>
				<PopoverContent>
					<DayPicker
						mode="single"
						selected={date}
						onSelect={setDate}
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
              
              weekday: 'text-teal-800'
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
				</PopoverContent>
			</Popover>
		</div>
	);
}
