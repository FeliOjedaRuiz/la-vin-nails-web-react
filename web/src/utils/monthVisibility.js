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
