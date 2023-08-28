import React, { useEffect, useState } from "react";
import turnsService from "../../../services/turns";
import TurnItem from "../turn-item/TurnItem";

function TurnsListByDay() {
  const [turns, setTurns] = useState([]);
  const [selectedDay, setSelectedDay] = useState();

  const handleChange = () => {
    const daySelector = document.getElementById("daySelector");
    setSelectedDay(daySelector.value);
    console.log(`Selected day is ${selectedDay}`);
  };

  useEffect(() => {
    turnsService
      .list()
      .then((turns) => {
        const dayTurns = turns.filter((turn) => turn.date === selectedDay);
        setTurns(dayTurns);
      })
      .catch((error) => console.error(error));
  }, [selectedDay]);

  return (
    <>
      <div className="grid grid-cols-1 justify-center md:grid-cols-2 grid-flow-row">
        <input
          type="date"
          name="date"
          id="daySelector"
          onChange={handleChange}
        />
        <p>Selected day is {selectedDay}</p>

        {turns.map((turn) => (
          <TurnItem turn={turn} />
        ))}
      </div>
    </>
  );
}

export default TurnsListByDay;
