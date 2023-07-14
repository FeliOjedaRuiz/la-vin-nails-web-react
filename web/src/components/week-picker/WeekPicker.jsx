import React from 'react';
// import './WeekPicker.css';
import { WeeklyCalendar } from 'react-week-picker';
import 'react-week-picker/src/lib/calendar.css';

function WeekPicker() {

  const handleJumpToCurrentWeek = (currenDate) => {
    console.log(`current date: ${currenDate}`);
  }

  const handleWeekPick = (startDate, endDate) => {
    console.log(`${startDate} to ${endDate}`);
  }

  return (
    <div>
      <WeeklyCalendar onWeekPick={handleWeekPick} jumpToCurrentWeekRequired={true} onJumpToCurrentWeek={handleJumpToCurrentWeek}/>
    </div>
  );
}

export default WeekPicker;