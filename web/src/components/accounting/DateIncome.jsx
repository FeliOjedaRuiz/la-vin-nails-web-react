import React, { useEffect, useState } from 'react';
import datesServices from '../../services/dates';

function DateIncome({ date, handleReload }) {
	const [newDate, setNewDate] = useState(date);
	const [editing, setEditing] = useState(false);
	const [paymentMethods, setPaymentMethods] = useState([
		'Sin cobrar',
		'Efectivo',
		'Bizum',
	]);

	useEffect(() => {
		let methods = [];
		if (!newDate.paymentMethod) {
			newDate.paymentMethod = 'Sin cobrar';
		}
		methods = paymentMethods.filter(
			(method) => newDate.paymentMethod !== method
		);
		methods.unshift(newDate.paymentMethod);
		setPaymentMethods(methods);
	}, []);

	useEffect(() => {
		if (!editing) {
			setNewDate(date);
		}
	}, [date]);

	const handleDateChange = (ev) => {
		const key = ev.target.id;
		const value = ev.target.value;

		setNewDate({
			...newDate,
			[key]: value,
		});
	};

	const handleOnFocus = () => {
		setEditing(true);
	};

	const handlefocusout = () => {
		if (newDate !== date) {
			dateSubmit(newDate);
		}
	};

	useEffect(() => {
		if (newDate !== date) {
			dateSubmit(newDate);
		}
	}, [newDate]);

	const dateSubmit = async (updatedDate) => {
		updatedDate.user = date.user.id;
		updatedDate.turn = date.turn.id;
		updatedDate.service = date.service.id;
		const dateId = date.id;
		try {
			await datesServices.update(dateId, updatedDate);
			handleReload();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<li className="p-0.5 text-sm  rounded-lg bg-white flex items-center justify-end border border-teal-100 shadow-md">
			<div className="font-normal text-teal-700 w-full mx-1 overflow-hidden flex justify-start items-start ">
				<p className="truncate font-normal ">
					{date.user.name} {date.user.surname}{' '}
				</p>
			</div>

			<select
				name="PaymentMethod"
				id="paymentMethod"
				onChange={handleDateChange}
				className=" w-[110px] h-6  font-normal text-teal-700 border border-teal-200  rounded"
			>
				{paymentMethods.map((method) => (
					<option value={method}>{method}</option>
				))}
			</select>

			<div className="ml-1 mr-0.5 h-6 px-1 border font-normal border-teal-200 text-teal-700 rounded flex items-center">
				<input
					type="number"
					id="cost"
					onFocus={handleOnFocus}
					onInput={handleDateChange}
					onBlur={handlefocusout}
					value={newDate.cost}
					placeholder=""
					className="w-8 h-5 mr-1  rounded text-right pr-1 "
				/>
				<span className="">€</span>
			</div>
		</li>
	);
}

export default DateIncome;
