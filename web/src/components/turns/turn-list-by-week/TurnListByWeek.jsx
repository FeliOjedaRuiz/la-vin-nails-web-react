import React, { useEffect, useState, useRef, useMemo } from "react";
import turnsService from "../../../services/turns";
import TurnItemGuest from "../turn-item-guest/TurnItemGuest";
import NotAvailableTurn from "../not-avalaible-turn/NotAvailableTurn";
import AgendaNotAvailable from "../agenda-not-available/AgendaNotAvailable";
import { getMonthVisibility } from "../../../utils/monthVisibility";

// ─── Static data (hoisted to module scope — never changes) ────────────────────
const months = [
  "Enero", "Feb.", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Ago.", "Sept.", "Oct.", "Nov.", "Dic.",
];

const days = {
  0: "Domingo", 1: "Lunes", 2: "Martes", 3: "Miércoles",
  4: "Jueves",  5: "Viernes", 6: "Sábado",
};

// ─── Pure functions (hoisted to module scope — stable references) ─────────────
const transformDate = (date) => {
  const dt = new Date(date);
  const year  = dt.getFullYear();
  let   month = dt.getMonth() + 1;
  let   day   = dt.getDate();

  if (month < 10) month = "0" + month;
  if (day   < 10) day   = "0" + day;

  return `${year}-${month}-${day}`;
};

const safeParseDate = (dateString) => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split("-").map(Number);
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
// → unmount + remount de DayColumn → TurnItemGuest pierde estado → re-fetch.
const colClass =
  "px-0.5 m-0.5 rounded flex flex-col border border-emerald-500 bg-white/50 shadow-sm min-h-[8rem]";


const SkeletonDay = () => (
  <div className="flex flex-col gap-1.5 px-0.5 mt-1 mb-2">
    <div className="h-6 bg-emerald-300/40 rounded animate-pulse w-full"></div>
    <div className="h-6 bg-emerald-300/30 rounded animate-[pulse_1.5s_ease-in-out_infinite] w-full"></div>
    <div className="h-6 bg-emerald-300/20 rounded animate-[pulse_2s_ease-in-out_infinite] w-full"></div>
    <div className="h-6 bg-emerald-300/10 rounded animate-[pulse_2.5s_ease-in-out_infinite] w-full"></div>
  </div>
);

const DayColumn = React.memo(({ dateStr, dayTurns, loading, getFormattedDate, onTurnSelection, selectedTurn, isLocked, openingDate }) => {
  const selectedId = selectedTurn?.id || selectedTurn?._id;
  const { dateMonth, dayName } = getFormattedDate(dateStr);

  return (
    <div className={colClass}>
      <div className="text-center mt-1 mb-1 border-b border-emerald-200 pb-0.5">
        <h5 className="font-bold text-[13px] md:text-[14px] leading-tight text-gray-800">
          {dateMonth}
        </h5>
        <h6 className="font-medium text-[10px] md:text-[11px] leading-tight text-pink-400 mt-0.5">
          {dayName}
        </h6>
      </div>
      {loading && <SkeletonDay />}
      {!loading && isLocked && <AgendaNotAvailable openingDate={openingDate} />}
      {!loading && !isLocked && !dayTurns[0] && <NotAvailableTurn />}
      {!loading && !isLocked && dayTurns.map((turn) => {
        const turnId = turn.id || turn._id;
        const isSelected = selectedId && String(selectedId) === String(turnId);

        return (
          <TurnItemGuest 
            key={turnId} 
            turn={turn} 
            onTurnSelection={onTurnSelection} 
            isSelected={isSelected} 
          />
        );
      })}
    </div>
  );
}, (prev, next) => {
  // Incluir isLocked en la comparación
  if (
    prev.dateStr !== next.dateStr ||
    prev.loading !== next.loading ||
    prev.dayTurns.length !== next.dayTurns.length ||
    prev.isLocked !== next.isLocked
  ) {
    return false;
  }

  const prevId = prev.selectedTurn?.id || prev.selectedTurn?._id;
  const nextId = next.selectedTurn?.id || next.selectedTurn?._id;

  if (prevId !== nextId) {
    const isOldInThisDay = prev.dayTurns.some(t => String(t.id || t._id) === String(prevId));
    const isNewInThisDay = next.dayTurns.some(t => String(t.id || t._id) === String(nextId));
    
    if (isOldInThisDay || isNewInThisDay) {
      return false;
    }
  }

  return true;
});

// Caché a nivel de módulo: sobrevive la navegación entre páginas (React Router
// desmonta el componente al navegar, pero este objeto persiste en memoria).
// Patrón "stale-while-revalidate": muestra datos previos instantáneamente
// mientras refresca la data en segundo plano.
const turnsCache = {};

// Permite invalidar el caché desde fuera (ej: tras solicitar una cita).
// Sin esto, al volver al calendario el turno seguiría apareciendo como "Disponible"
// porque el useEffect ve caché existente y no refetcha.
export const clearGuestTurnsCache = () => {
  Object.keys(turnsCache).forEach(key => delete turnsCache[key]);
};

function TurnListByWeek({ initDate, reload, onTurnSelection, selectedTurn, maxVisibleDate, category = 'normal' }) {
  const cacheKey = `${initDate}:${category}`;

  // Inicializar desde caché si existe → evita el flash en blanco al volver
  const [turns, setTurns] = useState(() => turnsCache[cacheKey] || []);
  const [loading, setLoading] = useState(!turnsCache[cacheKey]);

  // ── Cache sync via useEffect (replaces render-phase setState) ───────────────
  useEffect(() => {
    const cached = turnsCache[cacheKey];
    if (cached) {
      setTurns(cached);
      setLoading(false);
    } else {
      setTurns([]);
      setLoading(true);
    }
  }, [cacheKey]);

  const baseDay = safeParseDate(initDate);

  const firstDay  = getNextDate(baseDay, 1);
  const secondDay = getNextDate(baseDay, 2);
  const thirdDay  = getNextDate(baseDay, 3);
  const fourthDay = getNextDate(baseDay, 4);
  const fifthDay  = getNextDate(baseDay, 5);
  const sixthDay  = getNextDate(baseDay, 6);

  // Ref para distinguir reload (creación de turno) de navegación (carrusel).
  const prevReloadRef = useRef(reload);

  // Ref que registra el initDate activo al inicio del fetch.
  // Si cambia antes de que la promesa resuelva, descartamos la respuesta.
  const currentInitDateRef = useRef(initDate);

  useEffect(() => {
    if (!initDate) return;

    const isReloadTriggered = prevReloadRef.current !== reload;
    prevReloadRef.current = reload;

    // Actualizar el ref con el initDate activo en este efecto.
    currentInitDateRef.current = initDate;

    const cached = turnsCache[cacheKey];

    // ── SWR revalidation path (cached data exists) ─────────────────────────────
    // Si hay caché y NO fue un reload forzado, los datos ya son correctos
    // pero revalidamos en background (Stale-While-Revalidate real).
    if (cached && !isReloadTriggered) {
      const abortController = new AbortController();

      turnsService.list(initDate, sixthDay, category, abortController.signal)
        .then((freshTurns) => {
          if (abortController.signal.aborted) return;
          if (currentInitDateRef.current !== initDate) return;

          const currentCached = turnsCache[cacheKey];
          const changed = JSON.stringify(freshTurns) !== JSON.stringify(currentCached);
          if (changed) {
            turnsCache[cacheKey] = freshTurns;
            setTurns(freshTurns);
          }
        })
        .catch(() => {});

      return () => { abortController.abort(); };
    }

    if (!cached) setLoading(true);

    // AbortController para cancelar fetches obsoletos a nivel de transporte HTTP.
    const abortController = new AbortController();

    turnsService
      .list(initDate, sixthDay, category, abortController.signal)
      .then((freshTurns) => {
        if (abortController.signal.aborted) return;

        const currentCached = turnsCache[cacheKey];
        const changed = JSON.stringify(freshTurns) !== JSON.stringify(currentCached);
        turnsCache[cacheKey] = freshTurns;
        if (changed) {
          setTurns(freshTurns);
        }

        // Prefetch semanas adyacentes (misma categoría)
        const prefetch = (offsetDays) => {
          const targetInitDate = getNextDate(baseDay, offsetDays);
          const targetCacheKey = `${targetInitDate}:${category}`;
          if (turnsCache[targetCacheKey]) return;

          const targetSixthDay = getNextDate(baseDay, offsetDays + 6);
          turnsService.list(targetInitDate, targetSixthDay, category)
            .then(res => { turnsCache[targetCacheKey] = res; })
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
  // baseDay es derivado de initDate (función pura a nivel módulo).
  // initDate ya cubre el caso de re-fetch; agregar baseDay causaría re-ejecuciones fantasma.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, initDate, sixthDay, category]);

  const sortByHour = (arr) =>
    [...arr].sort((x, y) => x.hour.replace(":", "") - y.hour.replace(":", ""));

  // ── Memoized derived day arrays ─────────────────────────────────────────────
  const firstDayTurns  = useMemo(() => sortByHour(turns.filter((t) => t.date === firstDay)),  [turns, firstDay]);
  const secondDayTurns = useMemo(() => sortByHour(turns.filter((t) => t.date === secondDay)), [turns, secondDay]);
  const thirdDayTurns  = useMemo(() => sortByHour(turns.filter((t) => t.date === thirdDay)),  [turns, thirdDay]);
  const fourthDayTurns = useMemo(() => sortByHour(turns.filter((t) => t.date === fourthDay)), [turns, fourthDay]);
  const fifthDayTurns  = useMemo(() => sortByHour(turns.filter((t) => t.date === fifthDay)),  [turns, fifthDay]);
  const sixthDayTurns  = useMemo(() => sortByHour(turns.filter((t) => t.date === sixthDay)),  [turns, sixthDay]);

  // ── Memoized month visibility ───────────────────────────────────────────────
  const firstDayVis  = useMemo(() => getMonthVisibility(firstDay,  maxVisibleDate), [firstDay,  maxVisibleDate]);
  const secondDayVis = useMemo(() => getMonthVisibility(secondDay, maxVisibleDate), [secondDay, maxVisibleDate]);
  const thirdDayVis  = useMemo(() => getMonthVisibility(thirdDay,  maxVisibleDate), [thirdDay,  maxVisibleDate]);
  const fourthDayVis = useMemo(() => getMonthVisibility(fourthDay, maxVisibleDate), [fourthDay, maxVisibleDate]);
  const fifthDayVis  = useMemo(() => getMonthVisibility(fifthDay,  maxVisibleDate), [fifthDay,  maxVisibleDate]);
  const sixthDayVis  = useMemo(() => getMonthVisibility(sixthDay,  maxVisibleDate), [sixthDay,  maxVisibleDate]);

  return (
    <div className="w-full grid grid-cols-3 md:grid-cols-3 xl:grid-cols-6">
      <DayColumn dateStr={firstDay}  dayTurns={firstDayTurns}  loading={loading} getFormattedDate={getFormattedDate} onTurnSelection={onTurnSelection} selectedTurn={selectedTurn} isLocked={firstDayVis.isLocked}  openingDate={firstDayVis.openingDate} />
      <DayColumn dateStr={secondDay} dayTurns={secondDayTurns} loading={loading} getFormattedDate={getFormattedDate} onTurnSelection={onTurnSelection} selectedTurn={selectedTurn} isLocked={secondDayVis.isLocked} openingDate={secondDayVis.openingDate} />
      <DayColumn dateStr={thirdDay}  dayTurns={thirdDayTurns}  loading={loading} getFormattedDate={getFormattedDate} onTurnSelection={onTurnSelection} selectedTurn={selectedTurn} isLocked={thirdDayVis.isLocked}  openingDate={thirdDayVis.openingDate} />
      <DayColumn dateStr={fourthDay} dayTurns={fourthDayTurns} loading={loading} getFormattedDate={getFormattedDate} onTurnSelection={onTurnSelection} selectedTurn={selectedTurn} isLocked={fourthDayVis.isLocked} openingDate={fourthDayVis.openingDate} />
      <DayColumn dateStr={fifthDay}  dayTurns={fifthDayTurns}  loading={loading} getFormattedDate={getFormattedDate} onTurnSelection={onTurnSelection} selectedTurn={selectedTurn} isLocked={fifthDayVis.isLocked}  openingDate={fifthDayVis.openingDate} />
      <DayColumn dateStr={sixthDay}  dayTurns={sixthDayTurns}  loading={loading} getFormattedDate={getFormattedDate} onTurnSelection={onTurnSelection} selectedTurn={selectedTurn} isLocked={sixthDayVis.isLocked}  openingDate={sixthDayVis.openingDate} />
    </div>
  );
}

export default React.memo(TurnListByWeek);
