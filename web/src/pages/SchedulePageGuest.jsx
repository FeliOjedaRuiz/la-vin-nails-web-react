import React, { useEffect, useState } from "react";
import Layout from "../components/layouts/Layout";
import datesService from "../services/dates";
import DateDetail from "../components/dates/date-detail/DateDetail";

function SchedulePageGuest() {
  const [dates, setDates] = useState([]);
  const [reload, setReload] = useState(false);

  const onDateDelete = () => {
    setReload(!reload);
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
          <h3 className="text-3xl mb-5 font-bold text-center color text-pink-700">
            Próximas citas:
          </h3>
          {!dates[0] && <div className="text-center text-2xl font-medium text-emerald-600 bg-white/50 p-4 m-2 rounded-lg" >No tienes citas pendientes</div>}
          {dates.map((date) => (
            <DateDetail date={date} onDateDelete={onDateDelete} />
          ))}
        </div>
      </Layout>
    </>
  );
}

export default SchedulePageGuest;
