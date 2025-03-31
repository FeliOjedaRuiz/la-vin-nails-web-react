import React, { useEffect, useState } from 'react';

function DailyResults({ dates, expenses }) {
	const [dailySum, setDailySum] = useState(0);
	const [incomesSum, setIncomesSum] = useState(0);
	const [expensesSum, setExpensesSum] = useState(0);
	

	useEffect(() => {
		let incomesSum = 0;
		let expensesSum = 0;
		let dailySum = 0;

		dates.forEach((date) => {
			if (date.cost) {
				incomesSum = incomesSum + date.cost;
			}
		});
		setIncomesSum(incomesSum);

		expenses.forEach((expense) => {
			if (expense.amount) {
				expensesSum = expensesSum + expense.amount;
			}
		});
		setExpensesSum(expensesSum);

		dailySum = incomesSum - expensesSum;
		setDailySum(dailySum);
	}, [dates, expenses]);

	

	return (
		<div className="mt-4 px-2 py-1 bg-white rounded-md shadow-md border border-teal-500">
			<div className=" flex justify-between font-semibold  text-teal-600">
				<p>Ingresos </p>
				<p>{incomesSum} €</p>
			</div>
			<div className=" flex justify-between font-semibold  text-pink-600">
				<p>Egresos </p>
				<p>-{expensesSum} €</p>
			</div>
			<div className="mt-2 pt-2 border-t border-teal-400 flex justify-between font-semibold  ">
				<p>Balance diario </p>
				<p>{dailySum} €</p>
			</div>
		</div>
	);
}

export default DailyResults;
