import React, { useContext, useEffect, useState } from 'react';
import Layout from '../components/layouts/Layout';
import datesService from '../services/dates';
import { AuthContext } from '../contexts/AuthStore';
import DateDetail from '../components/dates/date-detail/DateDetail';

function SchedulePageGuest() {
  const [dates, setDates] = useState([]);
  const { user } = useContext(AuthContext);

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
    datesService.list()
      .then((dates) => {
        const datesUser = dates.filter((date) => date.user.id === user.id)
        const datesUserAndDate = datesUser.filter((date) => date.turn.date >= actualDate)
        setDates(datesUserAndDate);
      })
      .catch((error) => console.error(error))
  }, [user])

  return (
    <>
      <Layout>
        <div className='p-4'>
          <h3 className='text-3xl mb-5 font-bold text-center color text-pink-700'>Mis citas:</h3>
          {dates.map((date) => (
            <DateDetail date={date} />
            ))}
        </div>        
      </Layout>
    </>
  )
}

export default SchedulePageGuest