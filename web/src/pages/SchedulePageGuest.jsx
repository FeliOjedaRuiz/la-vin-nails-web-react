import React, { useState } from "react";
import Layout from "../components/layouts/Layout";
import { HonestWeekPicker } from "../components/week-picker/week-picker-js/HonestWeekPicker";
import TurnListByWeek from "../components/turns/turn-list-by-week/TurnListByWeek";
import { Link } from "react-router-dom";
import TurnsColorsExplication from "../components/turns/turns-color-explication/TurnsColorsExplication";

function SchedulePageGuest() {
  const [initDate, setInitDate] = useState();

  const onInitDate = (date) => {
    setInitDate(date);
  };

  const onTurnSelection = () => {
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

          <TurnsColorsExplication />

          <div className="flex mb-20">
            <TurnListByWeek
              initDate={initDate}
              onTurnSelection={onTurnSelection}
            />
          </div>

          <Link className="fixed bottom-20 flex justify-center bg-pink-500 rounded-xl border-4 border-yellow-400 shadow-md" to="/services">
            <p className=" my-1 mx-1 w-full max-w-sm text-center text-base font-bold text-white px-3 py-2 ">
              ¡Pide tu cita aquí!
            </p>
          </Link>
        </div>
      </Layout>
    </>
  );
}

export default SchedulePageGuest;
