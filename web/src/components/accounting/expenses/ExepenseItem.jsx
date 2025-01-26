import React, { useEffect, useState } from 'react';
import expensesServices from '../../../services//expenses.js';

function ExepenseItem({ expense, handleReload }) {
	const [newExpense, setNewExpense] = useState(expense);
	const [editing, setEditing] = useState(false);
	const [categorys, setCategorys] = useState([
		'Insumos',
		'Gastos fijos',
		'Otros',
	]);

	useEffect(() => {
		let selectCategorys = [];
		if (!newExpense.category) {
			newExpense.category = 'Otros';
		}
		selectCategorys = categorys.filter(
			(category) => newExpense.category !== category
		);
		selectCategorys.unshift(newExpense.category);
		setCategorys(selectCategorys);
	}, []);

	useEffect(() => {
		if (!editing) {
			setNewExpense(expense);
		}
	}, [expense]);

	const handleExpenseChange = (ev) => {
		const key = ev.target.id;
		const value = ev.target.value;

		setNewExpense({
			...newExpense,
			[key]: value,
		});
	};

	const handleOnFocus = () => {
		setEditing(true);
	};

	const handlefocusout = () => {
		if (newExpense !== expense) {
			expenseSubmit(newExpense);
		}
	};

	useEffect(() => {
		if (newExpense !== expense) {
			expenseSubmit(newExpense);
		}
	}, [newExpense]);

	const expenseSubmit = async (updatedExpense) => {
		const expenseId = expense.id;
		try {
			await expensesServices.update(expenseId, updatedExpense);
			handleReload();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<li className="p-0.5 text-sm  rounded-lg bg-white flex items-center justify-end border border-pink-300 shadow-md">
			<div className=" overflow-hidden w-full h-6 px-1 font-normal  text-pink-700 rounded flex items-center">
				<input
					type="text"
					name="Description"
					id="description"
					onFocus={handleOnFocus}
					onInput={handleExpenseChange}
					onBlur={handlefocusout}
					value={newExpense.description}
					placeholder="Agregar descripciónnnnnnnnnnnnnnn"
					maxLength={20}
					className="h-5 truncate font-normal text-left w-full"
				/>
			</div>

			<select
				name="Category"
				id="category"
				onChange={handleExpenseChange}
				className="ml-1 w-[110px] h-6  font-normal text-pink-700 border border-pink-200  rounded"
			>
				{categorys.map((category) => (
					<option value={category}>{category}</option>
				))}
			</select>

			<div className="ml-1 mr-0.5 h-6 px-1 border font-normal border-pink-200 text-pink-700 rounded flex items-center">
				<input
					type="number"
					max={999}
					id="amount"
					onFocus={handleOnFocus}
					onInput={handleExpenseChange}
					onBlur={handlefocusout}
					value={newExpense.amount}
					placeholder=""
					className="w-8 h-5 mr-1  rounded text-right pr-1 "
				/>
				<span className="">€</span>
			</div>
		</li>
	);
}

export default ExepenseItem;
