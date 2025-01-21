import React, { useEffect, useState } from 'react';
import ReactDatePicker from './ReactDatePicker';
import DailyAccountList from './DailyAccountList';
import dateServices from '../../services/dates';
import useTransformDate from '../../hooks/UseTransformDate';
import DailyResults from './DailyResults';

function DailyAccounting() {
	const [date, setDate] = useState(new Date());
	const [dates, setDates] = useState([]);
  const [reload, setReload] = useState(false)

	const selectedDate = useTransformDate(date);

  const handleReload = () => {
    setReload(!reload)
  }

	useEffect(() => {
		dateServices
			.listByDate(selectedDate)
			.then((dates) => {
				setDates(dates);
			})
			.catch();
	}, [date, reload]);

	return (
		<div className="p-2">
			<ReactDatePicker date={date} setDate={setDate} />
			<DailyAccountList dates={dates} handleReload={handleReload} />
      <DailyResults dates={dates} />
		</div>
	);
}

export default DailyAccounting;
