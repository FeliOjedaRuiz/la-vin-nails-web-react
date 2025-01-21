import React, { useEffect, useState } from 'react';
import datesServices from '../../services/dates';

function DateIncome({ date, handleReload }) {
	const [newDate, setNewDate] = useState(date);

	useEffect(() => {
		setNewDate(date);
	}, [date]);

	const handleCostChange = (ev) => {
		const key = ev.target.id;
		const value = ev.target.value;

		setNewDate({
			...newDate,
			[key]: value,
		});
	};

	useEffect(() => {
    if (newDate !== date) {
      dateSubmit(newDate);
    }
  }, [newDate]);

	const dateSubmit = async (newDate) => {
		newDate.user = date.user.id;
		newDate.turn = date.turn.id;
		newDate.service = date.service.id;
		const dateId = date.id;
		try {
			// setServerError();
			newDate = await datesServices.update(dateId, newDate);
		} catch (error) {
			// setServerError(error.message);
		}
		handleReload()
	};

	return (
		<li className="p-1 rounded-lg bg-white flex items-center justify-end border border-teal-100 shadow-md">
			<div className="font-normal w-full mx-1 overflow-hidden flex justify-start items-start ">
				<p className="truncate font-normal ">
					{date.user.name} {date.user.surname}{' '}
				</p>
			</div>

			<select
				name="Method"
				id=""
				className="mx-1 w-[110px] h-7 text-base font-normal text-teal-700 border border-teal-200  rounded"
			>
				<option value="Sin cobrar" className="text-base">
					Sin cobrar
				</option>
				<option value="Efectivo" className="text-base">
					Efectivo
				</option>
				<option value="Bizum" className="text-base">
					Bizum
				</option>
			</select>

			<div className="mx-1 h-7 px-1 border font-normal border-teal-200 text-teal-700  rounded flex items-center">
				<input
					type="number"
					id="cost"
					onChange={handleCostChange}
					value={newDate.cost}
					placeholder=" 0"
					className="w-8 h-6 mr-1  rounded text-right "
				/>
				<span className="">€</span>
			</div>
		</li>
	);
}

export default DateIncome;
