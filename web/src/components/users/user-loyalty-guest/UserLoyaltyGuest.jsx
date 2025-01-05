import React, { useEffect, useState } from 'react';
import userServices from '../../../services/users';
import StarIcon from '../../icons/StarIcon';

function UserLoyaltyGuest({ userId }) {
	const [loyalty, setLoyalty] = useState(0);

	console.log();

	useEffect(() => {
		userServices
			.detail(userId)
			.then((user) => {
				if (user.loyalty) {
					setLoyalty(user.loyalty);
				}
			})
			.catch((error) => console.error(error));
	}, []);

	return (
		<div className="w-full flex justify-center items-center">
			<div className=" font-medium bg-gradient-to-b from-emerald-900 to-emerald-700 rounded-2xl p-3 flex flex-col justify-center shadow-xl w-full max-w-md">
				<div className=" grid grid-cols-5 gap-2 font-bold">
					<div
						className={`${
							1 > loyalty
								? 'bg-gray-400'
								: 'bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%'
						}  aspect-square rounded-full p-1 shadow-lg`}
					>
						<div
							className={`${
								1 > loyalty
									? ' bg-gray-200 text-gray-400'
									: ' bg-white text-amber-700'
							} rounded-full w-full h-full flex items-center justify-center shadow-lg p-0.5 text-4xl`}
						>
							{1 > loyalty ? '1' : <StarIcon className={``} />}
						</div>
					</div>
					<div
						className={`${
							2 > loyalty
								? 'bg-gray-400'
								: 'bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%'
						} aspect-square rounded-full p-1 shadow-lg`}
					>
						<div
							className={`${
								2 > loyalty
									? ' bg-gray-200 text-gray-400'
									: ' bg-white text-amber-700'
							} rounded-full w-full h-full flex items-center justify-center shadow-lg p-0.5 text-4xl`}
						>
							{2 > loyalty ? '2' : <StarIcon className={`w-full`} />}
						</div>
					</div>
					<div
						className={`${
							3 > loyalty
								? 'bg-gray-400'
								: 'bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%'
						} aspect-square rounded-full p-1 shadow-lg`}
					>
						<div
							className={`${
								3 > loyalty
									? ' bg-gray-200 text-gray-400'
									: ' bg-white text-amber-700'
							} rounded-full w-full h-full flex items-center justify-center shadow-lg p-0.5 text-4xl`}
						>
							{3 > loyalty ? '3' : <StarIcon className={`w-full`} />}
						</div>
					</div>
					<div
						className={`${
							4 > loyalty
								? 'bg-gray-400'
								: 'bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%'
						} aspect-square rounded-full p-1 shadow-lg`}
					>
						<div
							className={`${
								4 > loyalty
									? ' bg-gray-200 text-gray-400'
									: ' bg-white text-amber-700'
							} rounded-full w-full h-full flex items-center justify-center shadow-lg p-0.5 text-4xl`}
						>
							{4 > loyalty ? '4' : <StarIcon className={`w-full`} />}
						</div>
					</div>
					<div
						className={`${
							5 > loyalty
								? 'bg-gray-400'
								: 'bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%'
						} aspect-square rounded-full p-1 shadow-lg`}
					>
						<div
							className={`${
								5 > loyalty
									? ' bg-gray-200 text-gray-600'
									: ' bg-white text-emerald-700'
							} rounded-full w-full h-full flex justify-center  shadow-lg`}
						>
							{5 > loyalty ? (
								<div className="flex flex-col items-center justify-center">
									<p className="-mb-2 text-xl">25%</p>
									<p className="text-sm">Desc.</p>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center relative w-full">
									<p className="-mb-2 text-xl">25%</p>
									<p className="text-sm">Desc.</p>
									<StarIcon className={`w-full text-amber-700 absolute`} />
								</div>
							)}
						</div>
					</div>
					<div
						className={`${
							6 > loyalty
								? 'bg-gray-400'
								: 'bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%'
						} aspect-square rounded-full p-1 shadow-lg`}
					>
						<div
							className={`${
								6 > loyalty
									? ' bg-gray-200 text-gray-400'
									: ' bg-white text-amber-700'
							} rounded-full w-full h-full flex items-center justify-center shadow-lg p-0.5 text-4xl`}
						>
							{6 > loyalty ? '6' : <StarIcon className={`w-full`} />}
						</div>
					</div>

					<div
						className={`${
							7 > loyalty
								? 'bg-gray-400'
								: 'bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%'
						} aspect-square rounded-full p-1 shadow-lg`}
					>
						<div
							className={`${
								7 > loyalty
									? ' bg-gray-200 text-gray-400'
									: ' bg-white text-amber-700'
							} rounded-full w-full h-full flex items-center justify-center shadow-lg p-0.5 text-4xl`}
						>
							{7 > loyalty ? '7' : <StarIcon className={`w-full`} />}
						</div>
					</div>
					<div
						className={`${
							8 > loyalty
								? 'bg-gray-400'
								: 'bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%'
						} aspect-square rounded-full p-1 shadow-lg`}
					>
						<div
							className={`${
								8 > loyalty
									? ' bg-gray-200 text-gray-400'
									: ' bg-white text-amber-700'
							} rounded-full w-full h-full flex items-center justify-center shadow-lg p-0.5 text-4xl`}
						>
							{8 > loyalty ? '8' : <StarIcon className={`w-full`} />}
						</div>
					</div>
					<div
						className={`${
							9 > loyalty
								? 'bg-gray-400'
								: 'bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-900 to-90%'
						} aspect-square rounded-full p-1 shadow-lg`}
					>
						<div
							className={`${
								9 > loyalty
									? ' bg-gray-200 text-gray-400'
									: ' bg-white text-amber-700'
							} rounded-full w-full h-full flex items-center justify-center shadow-lg p-0.5 text-4xl`}
						>
							{9 > loyalty ? '9' : <StarIcon className={`w-full`} />}
						</div>
					</div>
					<div
						className={`${
							10 > loyalty
								? 'bg-gray-400'
								: 'bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%'
						} aspect-square rounded-full p-1 shadow-lg`}
					>
						<div
							className={`${
								10 > loyalty
									? ' bg-gray-200 text-gray-600'
									: ' bg-white text-emerald-700'
							} rounded-full w-full h-full flex justify-center shadow-lg p-0.5`}
						>
							{10 > loyalty ? (
								<div className="flex flex-col items-center justify-center">
									<p className="-mb-2 text-xl">50%</p>
									<p className="text-sm">Desc.</p>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center relative w-full">
									<p className="-mb-2 text-xl">50%</p>
									<p className="text-sm">Desc.</p>
									<StarIcon className={`w-full text-amber-700 absolute`} />
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default UserLoyaltyGuest;
