import React, { useState, useEffect } from 'react';

export default function MonthPicker({ onMonthChange }) {
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1)); // Fecha inicial (primer día del mes actual)

    const months = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
    ];

    const handleNextMonth = () => {
        setSelectedDate((prevDate) => {
            const nextMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1); // Avanzar un mes
            return nextMonth;
        });
    };

    const handlePreviousMonth = () => {
        setSelectedDate((prevDate) => {
            const prevMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1); // Retroceder un mes
            return prevMonth;
        });
    };

    // Llamar a la función de callback cuando la fecha cambie
    useEffect(() => {
        if (onMonthChange) {
            onMonthChange(selectedDate);
        }
    }, [selectedDate, onMonthChange]);

    return (
        <div className="p-3 flex items-center justify-center gap-4">
            <button
                onClick={handlePreviousMonth}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
                &lt;
            </button>
            <span className="text-lg font-bold">
                {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </span>
            <button
                onClick={handleNextMonth}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
                &gt;
            </button>
        </div>
    );
}
