import React from 'react'
import TurnItemAdmin from '../turn-item-admin/TurnItemAdmin'

function TurnsListByWeek() {


  return (
    <div className=" mt-2 grid grid-cols-2">
        <div className=" px-2 m-1.5 rounded-lg flex-col border-2 border-pink-300">
          <h5 className="text-center font-bold m-1">{showDate(initDate)}</h5>
          {firstDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-1.5 rounded-lg flex-col border-2 border-pink-300">
        <h5  className="text-center font-bold m-1">{showDate(secondDay)}</h5>
          {seconDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-1.5 rounded-lg flex-col border-2 border-pink-300">
        <h5  className="text-center font-bold m-1">{showDate(thirdDay)}</h5>
          {thirdDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-1.5 rounded-lg flex-col border-2 border-pink-300">
        <h5  className="text-center font-bold m-1">{showDate(fourthDay)}</h5>
          {fourthDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-1.5 rounded-lg flex-col border-2 border-pink-300">
        <h5 className="text-center font-bold m-1">{showDate(fifthDay)}</h5>
          {fifthDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
          ))}
        </div>
        <div className=" px-2 m-1.5 rounded-lg flex-col border-2 border-pink-300">
        <h5  className="text-center font-bold m-1">{showDate(sixthDay)}</h5>
          {sixthDayTurns.map((turn) => (
            <TurnItemAdmin turn={turn} />
          ))}
        </div>
              
      </div>
  )
}

export default TurnsListByWeek