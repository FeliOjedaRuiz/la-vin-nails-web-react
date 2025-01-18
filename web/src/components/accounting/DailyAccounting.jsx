import React, { useEffect, useState } from 'react';
import ReactDatePicker from './ReactDatePicker';
import DailyAccountList from './DailyAccountList';
import dateServices from '../../services/dates';
import useTransformDate from '../../hooks/UseTransformDate';

function DailyAccounting() {
	const [date, setDate] = useState(new Date());
	const [dates, setDates] = useState([]);

	const selectedDate = useTransformDate(date);

	useEffect(() => {
		dateServices
			.listByDate(selectedDate)
			.then((dates) => {
				setDates(dates);
			})
			.catch();
	}, [date]);

	return (
		<div className="p-2">
			<ReactDatePicker date={date} setDate={setDate} />
			<DailyAccountList dates={dates} />
		</div>
	);
}

export default DailyAccounting;
