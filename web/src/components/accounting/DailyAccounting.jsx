import React, { useEffect, useState } from 'react';
import ReactDatePicker from './ReactDatePicker';
import DailyIncomes from './DailyIncomes';
import dateServices from '../../services/dates';
import useTransformDate from '../../hooks/UseTransformDate';
import DailyResults from './DailyResults';
import DailyExpenses from './expenses/DailyExpenses';
import expensesServices from '../../services/expenses';

function DailyAccounting() {
	const [date, setDate] = useState(new Date());
	const [dates, setDates] = useState([]);
	const [expenses, setExpenses] = useState([]);
  const [reload, setReload] = useState(false)

	const selectedDate = useTransformDate(date);

	const handleReload = () => {
		console.log('handleReload')
    setReload(!reload)
  }

	useEffect(() => {
		dateServices
			.listByDate(selectedDate)
			.then((dates) => {
				setDates(dates);
			})
			.catch((error) => console.error(error));

			expensesServices
			.listByDate(selectedDate)
			.then((expenses) => {
				setExpenses(expenses);
			})
			.catch((error) => console.error(error));
	}, [date, reload, selectedDate]);

	// useEffect(() => {
		
	// }, [reload, selectedDate])

	

	return (
		<div className="p-3">
			<ReactDatePicker date={date} setDate={setDate} />
			<DailyIncomes dates={dates} handleReload={handleReload} />
      <DailyExpenses selectedDate={selectedDate} expenses={expenses} handleReload={handleReload} />
      <DailyResults dates={dates} expenses={expenses} />
		</div>
	);
}

export default DailyAccounting;
