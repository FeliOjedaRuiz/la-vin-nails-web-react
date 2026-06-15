import React, { useMemo } from 'react';
import { formatDateToShort } from '../../../utils/dateFormat';

function DateDetailAdmin({ date }) {
	const state = date.turn.state === 'Solicitado' ? 'Sin confirmación' : date.turn.state;

	const stateStyle = useMemo(() => {
		switch (state) {
			case 'Confirmado':
				return 'bg-emerald-100 text-emerald-700 border-emerald-200';
			case 'Sin confirmación':
				return 'bg-amber-50 text-amber-700 border-amber-200';
			case 'Cancelado':
				return 'bg-red-50 text-red-600 border-red-200';
			case 'Completado':
				return 'bg-pink-50 text-pink-700 border-pink-200';
			default:
				return 'bg-gray-50 text-gray-600 border-gray-200';
		}
	}, [state]);

	return (
		<div className="bg-white rounded-xl border border-pink-100 shadow-sm mb-3 overflow-hidden transition-shadow hover:shadow-md">
			{/* Header: Service name + State badge (stacked to avoid overflow) */}
			<div className="px-4 py-3 bg-gradient-to-r from-pink-50/50 to-white border-b border-pink-50">
				<div className="flex items-start justify-between gap-2 min-w-0">
					<h3 className="font-semibold text-pink-700 text-base leading-tight min-w-0 flex-1">
						{date.service.name}
					</h3>
					<span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${stateStyle}`}>
						{state}
					</span>
				</div>
			</div>

			{/* Body: Compact info */}
			<div className="px-4 py-3 space-y-2">
				{/* Date + Time - same line */}
				<div className="flex items-center gap-4 text-sm text-gray-700">
					<span className="flex items-center gap-1.5">
						<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500 shrink-0">
							<rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
							<line x1="16" x2="16" y1="2" y2="6" />
							<line x1="8" x2="8" y1="2" y2="6" />
							<line x1="3" x2="21" y1="10" y2="10" />
						</svg>
						{formatDateToShort(date.turn.date)}
					</span>
					<span className="flex items-center gap-1.5">
						<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500 shrink-0">
							<circle cx="12" cy="12" r="10" />
							<polyline points="12 6 12 12 16 14" />
						</svg>
						{date.turn.hour} hs
					</span>
				</div>

				{/* Type */}
				{date.type && (
					<div className="flex items-center gap-1.5 text-sm text-gray-600">
						<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 shrink-0">
							<path d="M20.7 14.9c.3-.3.5-.7.5-1.1 0-.4-.2-.8-.5-1.1l-6.4-6.4c-.6-.6-1.6-.6-2.2 0L5.7 12.7c-.3.3-.5.7-.5 1.1 0 .4.2.8.5 1.1l6.4 6.4c.6.6 1.6.6 2.2 0l6.4-6.4z" />
							<path d="m14 10 2 2" />
						</svg>
						{date.type}
					</div>
				)}

				{/* Design Details - can be long, own line */}
				{date.designDetails && (
					<div className="flex items-start gap-1.5 text-sm text-gray-600">
						<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 shrink-0 mt-0.5">
							<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
							<path d="M15 3v4h4" />
							<path d="M8 13h.01" />
							<path d="M12 13h.01" />
							<path d="M16 13h.01" />
						</svg>
						<span className="leading-snug">{date.designDetails}</span>
					</div>
				)}

				{/* Removal - X in circle icon */}
				{date.needRemove && (
					<div className="flex items-center gap-1.5 text-sm text-gray-600">
						<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 shrink-0">
							<circle cx="12" cy="12" r="10" />
							<path d="m15 9-6 6" />
							<path d="m9 9 6 6" />
						</svg>
						{date.needRemove}
					</div>
				)}

				{/* Cost + Duration - always visible, same line */}
				<div className="flex items-center gap-4 pt-1 border-t border-gray-50">
					<span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
						<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
							<circle cx="12" cy="12" r="10" />
							<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
							<path d="M12 18V6" />
						</svg>
						{date.cost ? `${date.cost}€` : 'Sin confirmar'}
					</span>
					<span className="flex items-center gap-1.5 text-sm text-gray-500">
						<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
							<circle cx="12" cy="12" r="10" />
							<polyline points="12 6 12 12 16 14" />
						</svg>
						{date.duration ? `${date.duration} hs` : 'Sin confirmar'}
					</span>
				</div>
			</div>
		</div>
	);
}

export default DateDetailAdmin;
