import React from 'react';

function CloseIcon({ className }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="#ffffff"
			viewBox="0 0 24 24"
			stroke-width="2.5"
			stroke="currentColor"
			className={className}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M6 18 18 6M6 6l12 12"
			/>
		</svg>
	);
}

export default CloseIcon;
