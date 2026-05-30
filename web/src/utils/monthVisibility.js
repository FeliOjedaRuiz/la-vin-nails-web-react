import { addMonths, endOfMonth } from 'date-fns';

/**
 * Returns the visibility and navigation ceiling dates for guest users.
 *
 * Normal rule: on day 1 of month M, appointments for month M+1 become visible.
 * June exception: on June 1st and July 1st, the offset changes from M+1 to M+2
 * (2 months ahead). August falls through to the normal M+1 rule.
 *
 * @returns {{ maxVisibleDate: Date, maxNavigationDate: Date }}
 */
export const getVisibilityCeiling = () => {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed

  // June (5) → M+2 (2 months ahead). July+ normal M+1.
  const isJuneException = currentMonth === 5;

  const maxVisibleDate = isJuneException
    ? endOfMonth(new Date(now.getFullYear(), currentMonth + 2, 1)) // M+2
    : endOfMonth(addMonths(now, 1));

  const maxNavigationDate = isJuneException
    ? endOfMonth(new Date(now.getFullYear(), currentMonth + 3, 1)) // M+3
    : endOfMonth(addMonths(now, 2));

  return { maxVisibleDate, maxNavigationDate };
};

/**
 * Calcula si un día (string 'YYYY-MM-DD') pertenece a un mes cuya agenda
 * aún no se ha abierto para los guests.
 * Regla: el día 1 del mes M se abren los turnos del mes M+1.
 * → El mes visible máximo es currentMonth + 1.
 *
 * @param {string} dateStr - Fecha en formato 'YYYY-MM-DD'
 * @param {Date} maxVisibleDate - Fecha límite de visibilidad
 * @returns {object} { isLocked: boolean, openingDate: Date | null }
 */
export const getMonthVisibility = (dateStr, maxVisibleDate) => {
  if (!maxVisibleDate || !dateStr) return { isLocked: false, openingDate: null };
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (date > maxVisibleDate) {
    // La agenda del mes X se abre el día 1 del mes X-1
    const openingDate = new Date(year, month - 2, 1);
    return { isLocked: true, openingDate };
  }
  
  return { isLocked: false, openingDate: null };
};
