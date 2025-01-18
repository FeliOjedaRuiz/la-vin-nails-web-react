import React from 'react';
import DateIncome from './DateIncome';

function DailyAccountList({ dates }) {
	return (
		<div>
			<div className="p-1 mx-2 rounded-lg flex items-center justify-end text-teal-700 font-semibold">
				<div className=" w-full mx-1 overflow-hidden flex justify-start items-start ">
					<p className="truncate">Clienta</p>
				</div>

				<div
					name="Method"
					id=""
					className="mr-9 text-base text-teal-800 flex items-center justify-center  "
				>
					<p>Metodo</p>
				</div>

				<div
					name="Method"
					id=""
					className="mr-3 text-base text-teal-800 flex items-center justify-center  "
				>
					<p>Monto </p>
				</div>
			</div>
			<ul className="grid grid-cols-1 gap-1 ">
			{dates.map((date) => (
				<DateIncome date={date} />
			))}
				
			</ul>
		</div>
	);
}

export default DailyAccountList;
