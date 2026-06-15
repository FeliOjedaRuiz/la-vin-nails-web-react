/**
 * Formatea una fecha `YYYY-MM-DD` a `DD/MM/AA` para mostrar al usuario.
 *
 * @param {string} isoDate - Fecha en formato ISO `YYYY-MM-DD`.
 * @returns {string} Fecha en formato `DD/MM/AA` o string vacío si el input es falsy.
 *
 * @example
 * formatDateToShort('2026-07-22') // => '22/07/26'
 */
export function formatDateToShort(isoDate) {
	if (!isoDate) return '';
	const [year, month, day] = isoDate.split('-');
	return `${day}/${month}/${year.slice(-2)}`;
}
