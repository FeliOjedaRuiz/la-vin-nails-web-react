import React, { useEffect, useState } from "react";
import datesService from "../../../services/dates";
import { useParams } from "react-router-dom";
import SaveIconSVG from "../../icons/SaveIconSVG";
import WhatsappIcon from "../../icons/WhatsappIcon";

function DateUpdateForm() {
  const { id } = useParams();
  const [date, setDate] = useState();  

  useEffect(() => {    
    const query = {}  
    query.turn = id

    datesService.list(query)
    .then((dates) => {
      const thisDate = dates.filter((date) => date.turn.id === id);
      setDate(thisDate[0]);
    })
    .catch((error) => console.error(error));
  }, [id])

  const handleDateChange = (ev) => {
    const key = ev.target.id;
    const value = ev.target.value;

    setDate({
      ...date,
      [key]: value,
    });
  };

  const handleDateSubmit = (ev) => {
    ev.preventDefault();
    onDateSubmit(date);
  };

  const [serverError, setServerError] = useState(undefined);

  const onDateSubmit = async (date) => {
    date.user = date.user.id
    date.turn = date.turn.id
    date.service = date.service.id
    console.log(date)
    const dateId = date.id;
    try {
      setServerError();
      date = await datesService.update(dateId, date);
      // navigate("/schedule");
    } catch (error) {
      setServerError(error.message);
    }
  };



  return (
    <div>
      {!date && <div>Este turno aún no fue solicitado</div>}
      {date && (
        <div className="mb-2 mt-6">
          <h2 className="text-2xl mb-2 font-bold text-center color text-pink-700">
            Detalle de la cita
          </h2>
          <div className="mt-2">
            <span className="ml-2 font-medium text-pink-800 text-lg">
              Cliente:
            </span>
            <span>
              {" "}
              {date.user.name} {date.user.surname}
            </span>
          </div>
          <div className="mt-1">
            <span className="ml-2 font-medium text-pink-800 text-lg">
              Servicio:
            </span>
            <span> {date.service.name} </span>
          </div>
          <div className="mt-1">
            <span className="ml-2 font-medium text-pink-800 text-lg">
              Tipo:
            </span>
            <span className=" inline text-clip overflow-hidden">
              {" "}
              {date.type}
            </span>
          </div>
          
          <div className="mt-1">
            <span className="ml-2 font-medium text-pink-800 text-lg">
              Detalles:
            </span>
            <span className=""> {date.designDetails}</span>
          </div>

          <form onSubmit={handleDateSubmit} className="flex flex-col mt-2 ">
            <div className="flex justify-between mb-3">
              <div className="flex w-60 items-center">
                <label
                  for="cost"
                  
                  className="mx-2 font-medium text-pink-800 text-lg"
                >
                  Costo:
                </label>
                <input
                  type="number"
                  id="cost"
                  onChange={handleDateChange}
                  value={date.cost}
                  className=" h-8 w-full p-2 border-2 border-pink-300 text-md rounded-lg focus:ring-teal-500  focus:border-teal-500"
                  placeholder="00"
                />
                <span className="ml-1 font-medium text-pink-800 text-lg">€.</span>
              </div>
              <div className="ml-4 flex items-center">
                <label
                  for="duration"
                  
                  className="mx-2 font-medium text-pink-800 text-lg"
                >
                  Duración:
                </label>
                <input
                  type="text"
                  id="duration"
                  onChange={handleDateChange}
                  value={date.duration}
                  className="h-8 p-2 border-2 w-full border-pink-300 text-md rounded-lg focus:ring-teal-500  focus:border-teal-500"
                  placeholder="0:00"
                />{" "}
                <span className="ml-1 font-medium text-pink-800 text-lg"> hs.</span>
              </div>
            </div>
            <div className="flex mt-4 justify-around">
              <button
                type="submit"
                className=" flex justify-center items-center text-white py-1 px-3 font-medium rounded-md text-lg shadow-lg bg-gradient-to-l from-pink-700 via-pink-500 to-pink-700 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300"
              ><SaveIconSVG />Guardar             
              </button>
              
                       
              <a
                href={`https://wa.me/${date.user.phone}?text=%C2%A1Hola%21 Tu cita de ${date.service.name} para el ${date.turn.date} a las ${date.turn.hour} hs. ha sido confirmada con un precio de ${date.cost}€ y una duración estimada de ${date.duration} hs. ¡Te espero!`}
                className="flex items-center justify-center text-white py-1 px-3 font-medium rounded-md text-lg shadow-lg bg-[#128C7E] hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300"
              > <WhatsappIcon /> Escribir             
              </a>
            </div>
            
           
            
          </form>
        </div>
      )}
    </div>
  );
}

export default DateUpdateForm;
