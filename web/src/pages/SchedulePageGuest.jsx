import React, { useEffect, useState } from "react";
import Layout from "../components/layouts/Layout";
import datesService from "../services/dates";
import DateDetail from "../components/dates/date-detail/DateDetail";
import { HonestWeekPicker } from "../components/week-picker/week-picker-js/HonestWeekPicker";
import TurnListByWeek from "../components/turns/turn-list-by-week/TurnListByWeek";
import { NavLink } from "react-router-dom";

function SchedulePageGuest() {
  const [dates, setDates] = useState([]);
  const [reload, setReload] = useState(false);
  const [initDate, setInitDate] = useState();
  const [selectedTurn, setSelectedTurn] = useState({});
  const [selectedDate, setSelectedDate] = useState({});

  const onInitDate = (date) => {
    setInitDate(date);
  };

  const onTurnSelection = (turn) => {
    setSelectedTurn(turn);
  };

  const transformDate = (date) => {
    let dt = new Date(date);
    let year = dt.getFullYear();
    let month = dt.getMonth() + 1;
    let day = dt.getDate();

    if (month < 10) {
      month = "0" + month;
    }

    if (day < 10) {
      day = "0" + day;
    }

    return `${year}-${month}-${day}`;
  };

  const actualDate = transformDate(new Date());

  useEffect(() => {
    datesService
      .myList()
      .then((dates) => {
        const datesUserAndDate = dates.filter(
          (date) => date.turn.date >= actualDate
        );
        setDates(datesUserAndDate);
      })
      .catch((error) => console.error(error));
  }, [reload]);

  return (
    <>
      <Layout>
        <div className="p-4">
          <div className="mb-4">
            <h1 className="font-bold text-xl text-center text-emerald-700">
              Agenda de turnos disponibles
            </h1>
          </div>
          <div className="px-2 flex justify-center mb-3">
            <HonestWeekPicker onInitDate={onInitDate} />
          </div>
          <div className="">
            <TurnListByWeek
              initDate={initDate}
              onTurnSelection={onTurnSelection}
            />
          </div>

          <NavLink to="/services">
            <div className="text-center mt-4 bg-emerald-600 rounded-lg px-3 py-2 leading-tight text-white text-lg">
              Para seleccionar un turno disponible debes acceder a la sección de
              servicios.
              <p className="font-bold">Click Aquí</p>
            </div>            
          </NavLink>
        </div>
      </Layout>
    </>
  );
}

export default SchedulePageGuest;
