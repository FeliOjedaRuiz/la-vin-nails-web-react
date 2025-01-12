import React, { useEffect, useState } from 'react';
import turnsService from '../../../services/turns';
import TurnItemAdmin from '../turn-item-admin/TurnItemAdmin';

function TurnsListByWeekAdmin({ initDate, reload }) {
	const [turns, setTurns] = useState([]);
	const [firstDayTurns, setFirstDayTurns] = useState([]);
	const [secondDayTurns, setSecondDayTurns] = useState([]);
	const [thirdDayTurns, setThirdDayTurns] = useState([]);
	const [fourthDayTurns, setFourthDayTurns] = useState([]);
	const [fifthDayTurns, setFifthDayTurns] = useState([]);
	const [sixthDayTurns, setSixthDayTurns] = useState([]);
	const [loading, setLoading] = useState(true);

	const transformDate = (date) => {
		let dt = new Date(date);
		let year = dt.getFullYear();
		let month = dt.getMonth() + 1;
		let day = dt.getDate();

		if (month < 10) {
			month = '0' + month;
		}

		if (day < 10) {
			day = '0' + day;
		}

		return `${year}-${month}-${day}`;
	};

	const day = new Date(Date.parse(initDate));
	const firstDay = transformDate(day.setDate(day.getDate() + 1));
	const secondDay = transformDate(day.setDate(day.getDate() + 1));
	const thirdDay = transformDate(day.setDate(day.getDate() + 1));
	const fourthDay = transformDate(day.setDate(day.getDate() + 1));
	const fifthDay = transformDate(day.setDate(day.getDate() + 1));
	const sixthDay = transformDate(day.setDate(day.getDate() + 1));

	const months = [
		'Enero',
		'Feb.',
		'Marzo',
		'Abril',
		'Mayo',
		'Junio',
		'Julio',
		'Ago.',
		'Sept.',
		'Oct.',
		'Nov.',
		'Dic.',
	];

	const days = {
		1: 'Lunes',
		2: 'Martes',
		3: 'Miércoles',
		4: 'Jueves',
		5: 'Viernes',
		6: 'Sábado',
		7: 'Domingo',
	};

	const showDate = (date) => {
		let dt = new Date(date);

		return `${days[dt.getDay()]} ${dt.getDate()} ${months[dt.getMonth()]}`;
	};

	useEffect(() => {
		setLoading(true);
		setFifthDayTurns([]);
		setFirstDayTurns([]);
		setSecondDayTurns([]);
		setThirdDayTurns([]);
		setFourthDayTurns([]);
		setSixthDayTurns([]);
		turnsService
			.list(initDate)
			.then((turns) => {
				setTurns(turns);
			})
			.catch((error) => console.error(error));
	}, [reload, initDate]);

	useEffect(() => {
		setFirstDayTurns(
			turns
				.filter((turn) => turn.date === firstDay)
				.sort((x, y) => x.hour.replace(':', '') - y.hour.replace(':', ''))
		);
		setSecondDayTurns(
			turns
				.filter((turn) => turn.date === secondDay)
				.sort((x, y) => x.hour.replace(':', '') - y.hour.replace(':', ''))
		);
		setThirdDayTurns(
			turns
				.filter((turn) => turn.date === thirdDay)
				.sort((x, y) => x.hour.replace(':', '') - y.hour.replace(':', ''))
		);
		setFourthDayTurns(
			turns
				.filter((turn) => turn.date === fourthDay)
				.sort((x, y) => x.hour.replace(':', '') - y.hour.replace(':', ''))
		);
		setFifthDayTurns(
			turns
				.filter((turn) => turn.date === fifthDay)
				.sort((x, y) => x.hour.replace(':', '') - y.hour.replace(':', ''))
		);
		setSixthDayTurns(
			turns
				.filter((turn) => turn.date === sixthDay)
				.sort((x, y) => x.hour.replace(':', '') - y.hour.replace(':', ''))
		);
		setLoading(false);
	}, [turns, initDate]);

	// const firstDayTurns = turns
	//   .filter((turn) => turn.date === firstDay)
	//   .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));
	// const seconDayTurns = turns
	//   .filter((turn) => turn.date === secondDay)
	//   .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));
	// const thirdDayTurns = turns
	//   .filter((turn) => turn.date === thirdDay)
	//   .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));
	// const fourthDayTurns = turns
	//   .filter((turn) => turn.date === fourthDay)
	//   .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));
	// const fifthDayTurns = turns
	//   .filter((turn) => turn.date === fifthDay)
	//   .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));
	// const sixthDayTurns = turns
	//   .filter((turn) => turn.date === sixthDay)
	//   .sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));

	return (
		<div className="w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
			<div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
				<h5 className="text-center font-bold m-1 text-sm lg:text-lg">
					{showDate(firstDay)}
				</h5>
				{loading && (
					<div className={`mb-1.5 h-28 bg-gray-300  rounded shadow py-1 px-1.5  flex flex-col justify-center `}>
						<p className={` font-medium text-center text-sm truncate text-black`}>
							Cargando...
						</p>
					</div>
				)}
				{firstDayTurns.map((turn) => (
					<TurnItemAdmin turn={turn} initDate={initDate} />
				))}
			</div>
			<div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
				<h5 className="text-center font-bold m-1 text-sm lg:text-lg">
					{showDate(secondDay)}
				</h5>
        {loading && (
					<div className={`mb-1.5 h-28 bg-gray-300  rounded shadow py-1 px-1.5  flex flex-col justify-center `}>
						<p className={` font-medium text-center text-sm truncate text-black`}>
							Cargando...
						</p>
					</div>
				)}
				{secondDayTurns.map((turn) => (
					<TurnItemAdmin turn={turn} initDate={initDate} />
				))}
			</div>
			<div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
				<h5 className="text-center font-bold m-1 text-sm lg:text-lg">
					{showDate(thirdDay)}
				</h5>
        {loading && (
					<div className={`mb-1.5 h-28 bg-gray-300  rounded shadow py-1 px-1.5  flex flex-col justify-center `}>
						<p className={` font-medium text-center text-sm truncate text-black`}>
							Cargando...
						</p>
					</div>
				)}
				{thirdDayTurns.map((turn) => (
					<TurnItemAdmin turn={turn} initDate={initDate} />
				))}
			</div>
			<div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
				<h5 className="text-center font-bold m-1 text-sm lg:text-lg">
					{showDate(fourthDay)}
				</h5>
        {loading && (
					<div className={`mb-1.5 h-28 bg-gray-300  rounded shadow py-1 px-1.5  flex flex-col justify-center `}>
						<p className={` font-medium text-center text-sm truncate text-black`}>
							Cargando...
						</p>
					</div>
				)}
				{fourthDayTurns.map((turn) => (
					<TurnItemAdmin turn={turn} initDate={initDate} />
				))}
			</div>
			<div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
				<h5 className="text-center font-bold m-1 text-sm lg:text-lg">
					{showDate(fifthDay)}
				</h5>
        {loading && (
					<div className={`mb-1.5 h-28 bg-gray-300  rounded shadow py-1 px-1.5  flex flex-col justify-center `}>
						<p className={` font-medium text-center text-sm truncate text-black`}>
							Cargando...
						</p>
					</div>
				)}
				{fifthDayTurns.map((turn) => (
					<TurnItemAdmin turn={turn} initDate={initDate} />
				))}
			</div>
			<div className=" px-2 m-1.5 rounded-lg flex-col border-2 bg-white/50 border-pink-300 shadow-md">
				<h5 className="text-center font-bold m-1 text-sm lg:text-lg">
					{showDate(sixthDay)}
				</h5>
        {loading && (
					<div className={`mb-1.5 h-28 bg-gray-300  rounded shadow py-1 px-1.5  flex flex-col justify-center `}>
						<p className={` font-medium text-center text-sm truncate text-black`}>
							Cargando...
						</p>
					</div>
				)}
				{sixthDayTurns.map((turn) => (
					<TurnItemAdmin turn={turn} initDate={initDate} />
				))}
			</div>
		</div>
	);
}

export default TurnsListByWeekAdmin;
