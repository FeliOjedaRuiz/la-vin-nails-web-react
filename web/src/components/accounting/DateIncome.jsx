import React from 'react';

function DateIncome({ date }) {
	return (
		<li className="p-1 rounded-lg bg-white flex items-center justify-end border border-teal-100 shadow-md">
			<div className="font-normal w-full mx-1 overflow-hidden flex justify-start items-start ">
				<p className="truncate font-normal ">
					{date.user.name} {date.user.surname}{' '}
				</p>
			</div>

			<select
				name="Method"
				id=""
				className="mx-1 w-[110px] h-7 text-base font-normal text-teal-700 border border-teal-200  rounded"
			>
				<option value="Sin cobrar" className="text-base">
					Sin cobrar
				</option>
				<option value="Efectivo" className="text-base">
					Efectivo
				</option>
				<option value="Bizum" className="text-base">
					Bizum
				</option>
			</select>

			<div className="mx-1 h-7 px-1 border font-normal border-teal-200 text-teal-700  rounded flex items-center">
				<input
					type="number"
					className="w-8 h-6 mr-1  rounded text-right "
					placeholder=" 0"
					value={date.cost}
				/>
				<span className="">€</span>
			</div>
		</li>
	);
}

export default DateIncome;
