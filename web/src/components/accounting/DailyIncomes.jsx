import React from 'react';
import DateIncome from './DateIncome';

function DailyIncomes({ dates, handleReload }) {
	return (
		<div>
			<div className="p-1 mx-2 rounded-lg flex items-center justify-end text-sm text-teal-700 font-semibold">
				<div className="w-full flex justify-start items-start ">
					<p>Clienta</p>
				</div>

				<div
					className="mr-12 flex items-center justify-center"
				>
					<p>Pago</p>
				</div>

				<div
					className="flex items-center justify-center"
				>
					<p>Monto </p>
				</div>
			</div>
			<ul className="grid grid-cols-1 gap-1 ">
			{dates.map((date) => (
				<DateIncome date={date} handleReload={handleReload}  />
			))}
				
			</ul>
		</div>
	);
}

export default DailyIncomes;
