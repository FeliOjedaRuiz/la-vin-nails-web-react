import React from 'react';
import expensesServices from '../../../services/expenses';
import ExepenseItem from './ExepenseItem';

function DailyExpenses({ selectedDate, expenses, handleReload }) {
	

	const createExpense = () => {
		const expense = {
			description: 'Agregar descripción',
			amount: 0,
			date: selectedDate,
		};
		expensesServices
			.create(expense)
			.then((expense) => {
				handleReload();})
			.catch((error) => console.error(error));
		;
	};	

	return (
		<div>
			<div className="p-1 mt-2 mx-2 rounded-lg flex items-center justify-end text-sm text-pink-700 font-semibold">
				<div className="w-full flex justify-start items-start ">
					<p>Descripción</p>
				</div>

				<div className="mr-9 flex items-center justify-center  ">
					<p>Categoría</p>
				</div>

				<div className="flex items-center justify-center  ">
					<p>Monto</p>
				</div>
			</div>
			<ul className="grid grid-cols-1 gap-1 ">
				{expenses.map((expense) => (
				<ExepenseItem expense={expense} handleReload={handleReload} key={expense.id}  />
			))}

				{!expenses[0] && <li className="p-1 rounded-lg bg-white flex items-center justify-end border border-pink-100 shadow-md">
					<div className="font-medium h-6 w-full mx-1 flex justify-center items-center text-pink-700 ">
						<p>No tienes egresos registrados</p>
					</div>
				</li>}
			</ul>
			<div className="mt-3 flex justify-center">
				<button
					onClick={createExpense}
					className="px-3 bg-pink-600 rounded text-white flex items-center justify-center shadow"
				>
					<p className="text-xl">+</p>{' '}
					<p className="ml-3  font-medium">Añadir egreso</p>
				</button>
			</div>
		</div>
	);
}

export default DailyExpenses;
