import React, { useEffect, useState, useRef, useMemo } from 'react';
import turnsService from '../../../services/turns';
import TurnItemAdmin from '../turn-item-admin/TurnItemAdmin';

// ─── Static data (hoisted to module scope — never changes) ────────────────────
const months = ['Enero', 'Feb.', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Ago.', 'Sept.', 'Oct.', 'Nov.', 'Dic.'];
const days   = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado' };

// ─── Pure functions (hoisted to module scope — stable references) ─────────────
const transformDate = (date) => {
  const dt = new Date(date);
  const year  = dt.getFullYear();
  let   month = dt.getMonth() + 1;
  let   day   = dt.getDate();

  if (month < 10) month = '0' + month;
  if (day   < 10) day   = '0' + day;

  return `${year}-${month}-${day}`;
};

const safeParseDate = (dateString) => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getNextDate = (base, daysToAdd) => {
  const d = new Date(base);
  d.setDate(d.getDate() + daysToAdd);
  return transformDate(d);
};

const getFormattedDate = (date) => {
  const dt = safeParseDate(date);
  return {
    dateMonth: `${dt.getDate()} - ${months[dt.getMonth()]}`,
    dayName: days[dt.getDay()]
  };
};

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
export const turnsCache = {};

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

	// ── Cache sync via useEffect (replaces render-phase setState) ───────────────
	useEffect(() => {
		const cached = turnsCache[initDate];
		if (cached) {
			setTurns(cached);
			setLoading(false);
		} else {
			setTurns([]);
			setLoading(true);
		}
	}, [initDate]);

	const baseDay = safeParseDate(initDate);

	const firstDay  = getNextDate(baseDay, 1);
	const secondDay = getNextDate(baseDay, 2);
	const thirdDay  = getNextDate(baseDay, 3);
	const fourthDay = getNextDate(baseDay, 4);
	const fifthDay  = getNextDate(baseDay, 5);
	const sixthDay  = getNextDate(baseDay, 6);

	// Ref para distinguir si el efecto se disparó por reload (creación de turno)
	// o por cambio de initDate (navegación del carrusel).
	const prevReloadRef = useRef(reload);

	// Ref que registra el initDate activo al inicio del fetch.
	// Si cambia antes de que la promesa resuelva, descartamos la respuesta.
	const currentInitDateRef = useRef(initDate);

	useEffect(() => {
		if (!initDate) return;

		const isReloadTriggered = prevReloadRef.current !== reload;
		prevReloadRef.current = reload;

		// Actualizar el ref con el initDate activo en este efecto.
		// Cualquier respuesta de un efecto anterior con initDate distinto
		// será descartada en el .then() gracias a este ref.
		currentInitDateRef.current = initDate;

		const cached = turnsCache[initDate];

		// ── SWR revalidation path (cached data exists) ──────────────────────────
		// Si hay caché y NO fue un reload forzado, los datos ya son correctos
		// (vienen del prefetch o de una navegación anterior) → cero flash.
		// Si hay caché y NO fue un reload forzado, usamos los datos cacheados
		// pero SIEMPRE revalidamos en background (Stale-While-Revalidate real).
		// Esto soluciona que al volver atrás con navegación nativa se vean datos viejos.
		if (cached && !isReloadTriggered) {
			const abortController = new AbortController();

			turnsService.list(initDate, sixthDay, abortController.signal)
				.then((freshTurns) => {
					// Descartar si el abort fue solicitado o si el initDate cambió
					// mientras este fetch estaba en vuelo.
					if (abortController.signal.aborted) return;
					if (currentInitDateRef.current !== initDate) return;

					const currentCached = turnsCache[initDate];
					const changed = JSON.stringify(freshTurns) !== JSON.stringify(currentCached);
					if (changed) {
						turnsCache[initDate] = freshTurns;
						setTurns(freshTurns);
					}
				})
				.catch((e) => { /* silent SWR error */ });

			return () => { abortController.abort(); };
		}

		if (!cached) setLoading(true);

		// AbortController para cancelar fetches obsoletos a nivel de transporte HTTP.
		// El flag `cancelled` sigue presente como defensa adicional para el estado,
		// pero AbortController corta el request en la capa de red.
		const abortController = new AbortController();

		turnsService
			.list(initDate, sixthDay, abortController.signal)
			.then((freshTurns) => {
				if (abortController.signal.aborted) return;

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
				if (!abortController.signal.aborted) console.error(error);
			})
			.finally(() => {
				if (!abortController.signal.aborted) setLoading(false);
			});

		return () => { abortController.abort(); };
	// baseDay y getNextDate son estables (funciones puras a nivel módulo, derivadas de initDate).
	// initDate ya cubre el caso de re-fetch; agregar baseDay causaría re-ejecuciones fantasma.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reload, initDate, sixthDay]);

	// Helper: sort turns by hour ascending
	const sortByHour = (arr) =>
		[...arr].sort((x, y) => x.hour.replace(':', '') - y.hour.replace(':', ''));

	// ── Memoized derived day arrays ─────────────────────────────────────────────
	// Wrapped in useMemo so React.memo on DayColumn skips re-renders when
	// turns haven't changed (spec §Memoized Derived Day Arrays).
	const firstDayTurns  = useMemo(() => sortByHour(turns.filter((t) => t.date === firstDay)),  [turns, firstDay]);
	const secondDayTurns = useMemo(() => sortByHour(turns.filter((t) => t.date === secondDay)), [turns, secondDay]);
	const thirdDayTurns  = useMemo(() => sortByHour(turns.filter((t) => t.date === thirdDay)),  [turns, thirdDay]);
	const fourthDayTurns = useMemo(() => sortByHour(turns.filter((t) => t.date === fourthDay)), [turns, fourthDay]);
	const fifthDayTurns  = useMemo(() => sortByHour(turns.filter((t) => t.date === fifthDay)),  [turns, fifthDay]);
	const sixthDayTurns  = useMemo(() => sortByHour(turns.filter((t) => t.date === sixthDay)),  [turns, sixthDay]);

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
