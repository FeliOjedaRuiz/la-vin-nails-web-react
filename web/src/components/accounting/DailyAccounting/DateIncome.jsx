import React, { useEffect, useState } from 'react';
import datesServices from '../../../services/dates';

function DateIncome({ date, handleReload }) {
	const [newDate, setNewDate] = useState(date);
	const [editing, setEditing] = useState(false);
	const [paymentMethods, setPaymentMethods] = useState([
		'Sin cobrar',
		'Efectivo',
		'Bizum',
	]);
	const [error, setError] = useState(null); // Estado para manejar errores

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
			const response = await datesServices.update(dateId, updatedDate);
			if (response) {
				handleReload(); // Recargar datos si la actualización fue exitosa
				setError(null); // Limpiar errores
			} else {
				throw new Error('Error al actualizar la cita');
			}
		} catch (error) {
			console.error(error);
			setError('No se pudo guardar el cambio.'); // Mostrar mensaje de error
			setNewDate(date); // Revertir al valor original
		}
	};

	return (
		<li className="p-0.5 text-sm rounded-lg bg-white border border-teal-100 shadow-md">
			<div className="w-full flex justify-end items-start">
				<div className="font-normal text-teal-700 w-full mx-1 overflow-hidden flex justify-start items-start">
					<p className="truncate font-normal">
						{date.user.name} {date.user.surname}{' '}
					</p>
				</div>

				<select
					name="PaymentMethod"
					id="paymentMethod"
					onChange={handleDateChange}
					// onBlur={handlefocusout} // Guardar cambios al perder el foco
					className="w-[110px] h-6 font-normal text-teal-700 border border-teal-200 rounded"
					value={newDate.paymentMethod} // Asegurar que el valor sea consistente
				>
					{paymentMethods.map((method) => (
						<option key={method} value={method}>
							{method}
						</option>
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
						className="w-8 h-5 mr-1 rounded text-right pr-1"
					/>
					<span className="">€</span>
				</div>
			</div>

			{/* Mostrar mensaje de error si ocurre */}
			{error && <div className="text-red-500  font-medium text-center">{error}</div>}
		</li>
	);
}

export default DateIncome;
