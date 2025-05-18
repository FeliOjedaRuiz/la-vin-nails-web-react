import React, { useEffect, useState } from 'react';
import MonthPicker from './MonthPicker';
import datesServices from '../../../services/dates';
import expensesServices from '../../../services/expenses';
import useTransformDate from '../../../hooks/UseTransformDate';

function MonthlyAccounting() {
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1); // Día 1 del mes actual
	});
	const [dates, setDates] = useState([]); // Fechas obtenidas de la API
	const [totals, setTotals] = useState({
		sinCobrar: 0,
		efectivo: 0,
		bizum: 0,
		total: 0,
	}); // Totales de cost por paymentMethod
	const [expenses, setExpenses] = useState([]); // Gastos obtenidos de la API
	const [totalExpenses, setTotalExpenses] = useState({
		gastosFijos: 0,
		insumos: 0,
		otros: 0,
		total: 0,
	}); // Totales de gastos por categoría

	const [datesLoaded, setDatesLoaded] = useState(false);
	const [expensesLoaded, setExpensesLoaded] = useState(false);

	const selectedMonthTrans = useTransformDate(selectedMonth);

	// Llamada a la API para obtener las citas
	useEffect(() => {
		datesServices
			.listByMonth(selectedMonthTrans)
			.then((dates) => {
				setDatesLoaded(true);
				// Separar las citas según paymentMethod
				const sinCobrar = dates.filter(
					(date) => date.paymentMethod === 'Sin cobrar'
				);
				const efectivo = dates.filter(
					(date) => date.paymentMethod === 'Efectivo'
				);
				const bizum = dates.filter((date) => date.paymentMethod === 'Bizum');

				// Calcular los totales de cost
				const totalSinCobrar = sinCobrar.reduce(
					(sum, date) => sum + (date.cost || 0),
					0
				);
				const totalEfectivo = efectivo.reduce(
					(sum, date) => sum + (date.cost || 0),
					0
				);
				const totalBizum = bizum.reduce(
					(sum, date) => sum + (date.cost || 0),
					0
				);
				const total = totalSinCobrar + totalEfectivo + totalBizum;

				setDates({ sinCobrar, efectivo, bizum });
				setTotals({
					sinCobrar: totalSinCobrar,
					efectivo: totalEfectivo,
					bizum: totalBizum,
					total,
				});
			})
			.catch((error) => console.error(error));

		expensesServices
			.listByMonth(selectedMonthTrans)
			.then((expenses) => {
				setExpensesLoaded(true);
				const gastosFijos = expenses.filter(
					(expense) => expense.category === 'Gastos fijos'
				);
				const insumos = expenses.filter(
					(expense) => expense.category === 'Insumos'
				);
				const otros = expenses.filter(
					(expense) => expense.category === 'Otros'
				);

				const totalGastosFijos = gastosFijos.reduce(
					(sum, expense) => sum + (expense.amount || 0),
					0
				);
				const totalInsumos = insumos.reduce(
					(sum, expense) => sum + (expense.amount || 0),
					0
				);
				const totalOtros = otros.reduce(
					(sum, expense) => sum + (expense.amount || 0),
					0
				);
				const total = totalGastosFijos + totalInsumos + totalOtros;

				setExpenses({ gastosFijos, insumos, otros });
				setTotalExpenses({
					gastosFijos: totalGastosFijos,
					insumos: totalInsumos,
					otros: totalOtros,
					total,
				});
			})
			.catch((error) => console.error(error));
	}, [selectedMonth]);

	// Manejar el cambio de fecha desde MonthPicker
	const handleMonthChange = (month) => {
		setSelectedMonth(month); // Actualizar la fecha seleccionada
	};

	return (
		<div>
			<MonthPicker onMonthChange={handleMonthChange} />
			<div className="mx-3">
				<h2 className="text-lg font-bold text-teal-600">Ingresos</h2>
				{datesLoaded && (
					<ul className="">
						<li className="flex justify-between font-normal -mb-1">
							<p>Sin Cobrar:</p> <p>{dates.sinCobrar.length} servicios</p>{' '}
							<p>{totals.sinCobrar}€</p>
						</li>
						<li className="flex justify-between font-normal -mb-1">
							<p>Efectivo:</p> <p>{dates.efectivo.length} servicios</p>{' '}
							<p>{totals.efectivo}€</p>{' '}
						</li>
						<li className="flex justify-between font-normal -mb-1">
							<p>Bizum:</p> <p>{dates.bizum.length} servicios</p>{' '}
							<p>{totals.bizum}€</p>{' '}
						</li>
						<li className="flex justify-between font-semibold text-teal-600">
							<p>Total:</p>{' '}
							<p>
								{dates.sinCobrar.length +
									dates.efectivo.length +
									dates.bizum.length}{' '}
								servicios
							</p>{' '}
							<p className="">{totals.total}€</p>{' '}
						</li>
					</ul>
				)}
			</div>
			<div className="mx-3 mt-2">
				<h2 className="text-lg font-bold text-pink-600">Egresos</h2>
				{expensesLoaded && (
					<ul className="">
						<li className="flex justify-between font-normal -mb-1">
							<p>Gastos Fijos:</p>{' '}
							<p>{totalExpenses.gastosFijos.toFixed(2)}€</p>
						</li>
						<li className="flex justify-between font-normal -mb-1">
							<p>Insumos:</p>
							<p>{totalExpenses.insumos.toFixed(2)}€</p>
						</li>
						<li className="flex justify-between font-normal -mb-1">
							<p>Otros:</p>
							<p>{totalExpenses.otros.toFixed(2)}€</p>
						</li>
						<li className="flex justify-between font-semibold text-pink-600">
							<p>Total:</p>{' '}
							<p className="">{totalExpenses.total.toFixed(2)}€</p>{' '}
						</li>
					</ul>
				)}
			</div>
			<div className="mx-3 mt-2">
				{datesLoaded && expensesLoaded && (
					<div>
						<h2 className="text-lg font-bold text-teal-600">Beneficio mensual</h2>
						<div className="flex justify-between font-normal -mb-1">
							<p>Ingresos - Egresos:</p>{' '}
							<p>{totals.total - totalExpenses.total.toFixed(2)}€</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default MonthlyAccounting;
