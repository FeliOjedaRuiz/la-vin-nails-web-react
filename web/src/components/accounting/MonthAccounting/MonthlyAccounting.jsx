import React, { useEffect, useState } from 'react';
import MonthPicker from './MonthPicker';
import dateServices from '../../../services/dates';
import useTransformDate from '../../../hooks/UseTransformDate';

function MonthlyAccounting() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1); // Día 1 del mes actual
  });
  const [dates, setDates] = useState([]); // Fechas obtenidas de la API
  const [totals, setTotals] = useState({
    sinCobrar: 0,
    efectivo: 0,
    bizum: 0,
    total: 0,
  }); // Totales de cost por paymentMethod
  const [loaded, setLoaded] = useState(false); 

  const selectedMonthTrans = useTransformDate(selectedMonth);

  // Llamada a la API para obtener las fechas
  useEffect(() => {
    dateServices
      .listByMonth(selectedMonthTrans)
      .then((dates) => {
        setLoaded(true); 
        // Separar las fechas según paymentMethod
        const sinCobrar = dates.filter((date) => date.paymentMethod === 'Sin cobrar');
        const efectivo = dates.filter((date) => date.paymentMethod === 'Efectivo');
        const bizum = dates.filter((date) => date.paymentMethod === 'Bizum');

        // Calcular los totales de cost
        const totalSinCobrar = sinCobrar.reduce((sum, date) => sum + (date.cost || 0), 0);
        const totalEfectivo = efectivo.reduce((sum, date) => sum + (date.cost || 0), 0);
        const totalBizum = bizum.reduce((sum, date) => sum + (date.cost || 0), 0);
        const total = totalSinCobrar + totalEfectivo + totalBizum;

        setDates({ sinCobrar, efectivo, bizum });
        setTotals({
          sinCobrar: totalSinCobrar,
          efectivo: totalEfectivo,
          bizum: totalBizum,
          total,
        });
      })
      .catch((error) => console.error(error));
  }, [selectedMonth]);

  // Manejar el cambio de fecha desde MonthPicker
  const handleMonthChange = (month) => {
    setSelectedMonth(month); // Actualizar la fecha seleccionada
  };

  return (
    <div>
      <MonthPicker onMonthChange={handleMonthChange} />
      <div className="mx-3">
        <h2 className="text-lg font-bold text-teal-600">Ingresos:</h2>
        {loaded && (<ul className=''>
          <li className='flex justify-between font-normal -mb-1'><p>Sin Cobrar:</p>  <p>{dates.sinCobrar.length} servicios</p> <p>{totals.sinCobrar}€</p></li>
          <li className='flex justify-between font-normal -mb-1'><p>Efectivo:</p> <p>{dates.efectivo.length} servicios</p> <p>{totals.efectivo}€</p> </li>
          <li className='flex justify-between font-normal -mb-1'><p>Bizum:</p> <p>{dates.bizum.length} servicios</p> <p>{totals.bizum}€</p> </li>
          <li className='flex justify-between font-semibold'><p>Total:</p> <p>{dates.sinCobrar.length + dates.efectivo.length + dates.bizum.length} servicios</p> <p className='text-teal-600'>{totals.total}€</p> </li>
        </ul>)}        
      </div>
    </div>
  );
}

export default MonthlyAccounting;