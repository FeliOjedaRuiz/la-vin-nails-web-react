import React, { useEffect, useState, useRef } from 'react';
import turnsService from '../../../services/turns';
import TurnItemAdmin from '../turn-item-admin/TurnItemAdmin';

// ─── Sub-componentes FUERA del render principal ───────────────────────────────
// Si se definen DENTRO, React los ve como tipos nuevos en cada re-render
// → unmount + remount de DayColumn → TurnItemAdmin pierde estado → re-fetch.
const SkeletonDay = () => (
	<div className="flex flex-col gap-1.5 px-0.5 mt-1 mb-2">
		<div className="h-6 bg-pink-300/40 rounded animate-pulse w-full"></div>
		<div className="h-6 bg-pink-300/30 rounded animate-[pulse_1.5s_ease-in-out_infinite] w-full"></div>
		<div className="h-6 bg-pink-300/20 rounded animate-[pulse_2s_ease-in-out_infinite] w-full"></div>
		<div className="h-6 bg-pink-300/10 rounded animate-[pulse_2.5s_ease-in-out_infinite] w-full"></div>
	</div>
);

const EmptyDay = () => (
	<div className="flex flex-col justify-center items-center h-[160px] bg-gray-100 rounded mb-[2px] shadow-inner w-full">
		<p className="text-center text-[10px] md:text-xs text-gray-500 font-medium px-0.5">Sin turnos</p>
	</div>
);

const colClass = 'px-0.5 m-0.5 rounded flex flex-col border border-pink-300 bg-white/50 shadow-sm min-h-[8rem]';

const DayColumn = ({ dateStr, dayTurns, loading, getFormattedDate }) => {
	const { dateMonth, dayName } = getFormattedDate(dateStr);
	return (
		<div className={colClass}>
			<div className="text-center mt-1 mb-1 border-b border-pink-200 pb-0.5">
				<h5 className="font-bold text-[13px] md:text-[14px] leading-tight text-gray-800">
					{dateMonth}
				</h5>
				<h6 className="font-medium text-[10px] md:text-[11px] leading-tight text-pink-400 mt-0.5">
					{dayName}
				</h6>
			</div>
			{loading && <SkeletonDay />}
			{!loading && dayTurns.length === 0 && <EmptyDay />}
			{!loading && dayTurns.map((turn) => (
				<TurnItemAdmin key={turn.id} turn={turn} />
			))}
		</div>
	);
};

// Caché a nivel de módulo: sobrevive navegación entre páginas.
// Patrón "stale-while-revalidate": muestra datos previos instantáneamente
// mientras refresca en segundo plano.
const turnsCache = {};

// Permite invalidar el caché desde fuera (ej: tras eliminar/modificar un turno).
// Sin esto, al volver al calendario se muestran datos de caché obsoletos
// y el useEffect no refetcha porque ve que ya hay datos cacheados.
export const clearAdminTurnsCache = () => {
	Object.keys(turnsCache).forEach(key => delete turnsCache[key]);
};

function TurnsListByWeekAdmin({ initDate, reload }) {
	// Inicializar desde caché si existe → render instantáneo al volver
	const [turns, setTurns] = useState(() => turnsCache[initDate] || []);
	const [loading, setLoading] = useState(!turnsCache[initDate]);

	// Sincronización durante render: si initDate cambió y hay datos en caché,
	// actualizar turns ANTES del flush al DOM → elimina el parpadeo "Sin turnos".
	const [prevInitDate, setPrevInitDate] = useState(initDate);
	if (initDate !== prevInitDate) {
		setPrevInitDate(initDate);
		const cached = turnsCache[initDate];
		if (cached) {
			setTurns(cached);
			setLoading(false);
		} else {
			setTurns([]);
			setLoading(true);
		}
	}

	const transformDate = (date) => {
		let dt = new Date(date);
		let year = dt.getFullYear();
		let month = dt.getMonth() + 1;
		let day = dt.getDate();

		if (month < 10) month = '0' + month;
		if (day < 10) day = '0' + day;

		return `${year}-${month}-${day}`;
	};

	const safeParseDate = (dateString) => {
		if (!dateString) return new Date();
		const parts = dateString.split('-').map(Number);
		return new Date(parts[0], parts[1] - 1, parts[2]);
	};

	const baseDay = safeParseDate(initDate);

	const getNextDate = (base, daysToAdd) => {
		const d = new Date(base);
		d.setDate(d.getDate() + daysToAdd);
		return transformDate(d);
	};

	const firstDay  = getNextDate(baseDay, 1);
	const secondDay = getNextDate(baseDay, 2);
	const thirdDay  = getNextDate(baseDay, 3);
	const fourthDay = getNextDate(baseDay, 4);
	const fifthDay  = getNextDate(baseDay, 5);
	const sixthDay  = getNextDate(baseDay, 6);

	const months = ['Enero', 'Feb.', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Ago.', 'Sept.', 'Oct.', 'Nov.', 'Dic.'];
	const days   = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado' };

	const getFormattedDate = (date) => {
		const dt = safeParseDate(date);
		return {
			dateMonth: `${dt.getDate()} - ${months[dt.getMonth()]}`,
			dayName: days[dt.getDay()]
		};
	};

	// Ref para distinguir si el efecto se disparó por reload (creación de turno)
	// o por cambio de initDate (navegación del carrusel).
	const prevReloadRef = useRef(reload);

	useEffect(() => {
		if (!initDate) return;

		const isReloadTriggered = prevReloadRef.current !== reload;
		prevReloadRef.current = reload;

		const cached = turnsCache[initDate];

		// Si hay caché y NO fue un reload forzado, los datos ya son correctos
		// (vienen del prefetch o de una navegación anterior) → cero flash.
		if (cached && !isReloadTriggered) return;

		if (!cached) setLoading(true);

		// Flag para descartar respuestas de fetches obsoletos cuando
		// el usuario navega rápido y este efecto se re-ejecuta antes
		// de que la Promise anterior resuelva.
		let cancelled = false;

		turnsService
			.list(initDate, sixthDay)
			.then((freshTurns) => {
				if (cancelled) return; // Este fetch ya no es relevante

				const currentCached = turnsCache[initDate];
				const changed = JSON.stringify(freshTurns) !== JSON.stringify(currentCached);
				turnsCache[initDate] = freshTurns;
				if (changed) {
					setTurns(freshTurns);
				}
				
				// Prefetch semanas adyacentes
				const prefetch = (offsetDays) => {
					const targetInitDate = getNextDate(baseDay, offsetDays);
					if (turnsCache[targetInitDate]) return;
					
					const targetSixthDay = getNextDate(baseDay, offsetDays + 6);
					turnsService.list(targetInitDate, targetSixthDay)
						.then(res => { turnsCache[targetInitDate] = res; })
						.catch(() => {});
				};
				
				prefetch(-7);
				prefetch(7);
			})
			.catch((error) => {
				if (!cancelled) console.error(error);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => { cancelled = true; };
	}, [reload, initDate]);

	// Estado DERIVADO calculado inline — no necesita useState ni useEffect propio.
	// Esto elimina el bug de "render fantasma vacío" que causaba el parpadeo.
	const sortByHour = (arr) =>
		[...arr].sort((x, y) => x.hour.replace(':', '') - y.hour.replace(':', ''));

	const firstDayTurns  = sortByHour(turns.filter((t) => t.date === firstDay));
	const secondDayTurns = sortByHour(turns.filter((t) => t.date === secondDay));
	const thirdDayTurns  = sortByHour(turns.filter((t) => t.date === thirdDay));
	const fourthDayTurns = sortByHour(turns.filter((t) => t.date === fourthDay));
	const fifthDayTurns  = sortByHour(turns.filter((t) => t.date === fifthDay));
	const sixthDayTurns  = sortByHour(turns.filter((t) => t.date === sixthDay));

	return (
		<div className="w-full grid grid-cols-3 md:grid-cols-3 xl:grid-cols-6">
			<DayColumn dateStr={firstDay}  dayTurns={firstDayTurns}  loading={loading} getFormattedDate={getFormattedDate} />
			<DayColumn dateStr={secondDay} dayTurns={secondDayTurns} loading={loading} getFormattedDate={getFormattedDate} />
			<DayColumn dateStr={thirdDay}  dayTurns={thirdDayTurns}  loading={loading} getFormattedDate={getFormattedDate} />
			<DayColumn dateStr={fourthDay} dayTurns={fourthDayTurns} loading={loading} getFormattedDate={getFormattedDate} />
			<DayColumn dateStr={fifthDay}  dayTurns={fifthDayTurns}  loading={loading} getFormattedDate={getFormattedDate} />
			<DayColumn dateStr={sixthDay}  dayTurns={sixthDayTurns}  loading={loading} getFormattedDate={getFormattedDate} />
		</div>
	);
}

export default TurnsListByWeekAdmin;
