import React, { useState } from "react";
import Layout from "../components/layouts/Layout";
import { HonestWeekPicker } from "../components/week-picker/week-picker-js/HonestWeekPicker";
import TurnListByWeek from "../components/turns/turn-list-by-week/TurnListByWeek";
import { Link } from "react-router-dom";

function SchedulePageGuest() {
  const [initDate, setInitDate] = useState();
  const [selectedTurn, setSelectedTurn] = useState({});

  const onInitDate = (date) => {
    setInitDate(date);
  };

  const onTurnSelection = (turn) => {
    setSelectedTurn(turn);
  };

  return (
    <>
      <Layout>
        <div className="p-4 flex flex-col items-center justify-evenly h-full">
          <div className="mb-4">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl text-center text-teal-800">
              Turnos disponibles
            </h1>
          </div>

          <div className="px-2 w-full flex justify-center mb-2">
            <HonestWeekPicker onInitDate={onInitDate} />
          </div>

          <div className="flex justify-evenly w-full max-w-md my-4">
            <div className="flex items-center ">
              <div className="bg-pink-400 w-5 h-5 rounded mr-2"></div>
              <p>Turno Disponible</p>
            </div>
            <div className="flex items-center ">
              <div className="bg-gray-400 w-5 h-5 rounded mr-2"></div>
              <p>Turno Ocupado</p>
            </div>
          </div>

          <div className="flex">
            <TurnListByWeek
              initDate={initDate}
              onTurnSelection={onTurnSelection}
            />
          </div>

          <Link className="flex justify-center" to="/services">
            <p className="text-center my-3 mx-2 w-full max-w-sm text-teal-700 rounded-lg px-3 py-2 text-base font-bold">
              Para solicitar cita haz click aquí.
            </p>
          </Link>
        </div>
      </Layout>
    </>
  );
}

export default SchedulePageGuest;
