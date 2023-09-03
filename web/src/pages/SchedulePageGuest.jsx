import React, { useEffect, useState } from "react";
import Layout from "../components/layouts/Layout";
import datesService from "../services/dates";
import { HonestWeekPicker } from "../components/week-picker/week-picker-js/HonestWeekPicker";
import TurnListByWeek from "../components/turns/turn-list-by-week/TurnListByWeek";
import { NavLink } from "react-router-dom";

function SchedulePageGuest() {
  const [initDate, setInitDate] = useState();
  const [selectedTurn, setSelectedTurn] = useState({});
  const [selectedDate, setSelectedDate] = useState({});

  const onInitDate = (date) => {
    setInitDate(date);
  };

  const onTurnSelection = (turn) => {
    setSelectedTurn(turn);
  };




  return (
    <>
      <Layout>
        <div className="p-4">
          <div className="mb-4">
            <h1 className="font-bold text-3xl text-center text-emerald-700">
              Turnos disponibles
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
            <div className="text-center mt-4 mx-2 bg-emerald-600 rounded-lg px-3 py-2 leading-tight text-white text-lg">
              Para solicitar cita debes acceder a la sección de
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
