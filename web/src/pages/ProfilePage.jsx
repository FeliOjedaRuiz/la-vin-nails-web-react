import React, { useContext, useEffect, useState } from "react";
import Layout from "../components/layouts/Layout";
import { AuthContext } from "../contexts/AuthStore";
import WhatsappIcon from "../components/icons/WhatsappIcon";
import DateDetail from "../components/dates/date-detail/DateDetail";
import datesService from "../services/dates";
import ButtonGreen from "./../components/butons/ButtonGreen";
import UserDetailGuest from "../components/users/user-detail-guest/UserDetailGuest";
import { Link } from "react-router-dom";

function ProfilePage() {
  const { logout, user } = useContext(AuthContext);
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
    <Layout>
      <div className="flex flex-col items-center">
        {/* <div>
          <h1 className="text-center mt-4 md:mt-10 text-3xl md:text-4xl lg:text-5xl font-bold text-pink-700">
            ¡Hola {user.name}!
          </h1>
          <div className="flex flex-col max-w-md p-6 m-5 shadow-lg rounded-md bg-white/50">
            <h4 className=" mb-2 text-2xl md:text-3xl text-center font-bold text-green-700">
              Tu datos
            </h4>
            <p className="mb-2 text-md md:text-lg">
              <strong>Nombre:</strong> {user.name}{" "}
            </p>
            <p className="mb-2 text-md md:text-lg">
              <strong>Apellido:</strong> {user.surname}
            </p>
            <p className="mb-2 text-md md:text-lg">
              <strong>Teléfono:</strong> {user.phone}
            </p>
            <p className="mb-2 text-md md:text-lg">
              <strong>Email:</strong> {user.email}{" "}
            </p>
            <ButtonGreen>Editar</ButtonGreen>
          </div>
        </div> */}

        <UserDetailGuest userId={user.id} />

        <div className="flex flex-col items-center w-full max-w-xs my-4 py-2 border-2 rounded-lg border-pink-600">
          <p className="mt-2 text-teal-800 font-semibold">
            ¿Quieres cambiar tu contraseña?
          </p>
          <Link to="/restore">
            <button className="text-white bg-gradient-to-l m-3 mb-5 from-pink-700 via-pink-500 to-pink-700 shadow hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded text-md self-center  px-4 py-1 text-center">
              Restaurar contraseña
            </button>
          </Link>
        </div>

        <div className="flex flex-col max-w-xs justify-between items-center mt-3 p-4 border-2 rounded-lg border-emerald-600">
          <p className="text-center leading-tight text-pink-600">
            Próximamente podrás editar tus datos o eliminar tu cuenta. Si tienes
            alguna duda comunicate con el administrador:
          </p>
          <a
            className="flex flex-col items-center justify-center mt-3"
            href={`https://wa.me/$+34699861930?text=Hola tengo una duda sobre mi cuenta en La Vin Nails Web.`}
          >
            <ButtonGreen>
              <WhatsappIcon />
              Consultar
            </ButtonGreen>
          </a>
        </div>

        <button
          onClick={() => logout()}
          className="text-white bg-gradient-to-l my-8 from-pink-700 via-pink-500 to-pink-700 shadow hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded text-md self-center  px-4 py-1 text-center"
        >
          Cerrar sesión
        </button>

        <div className="p-4">
          <h3 className="text-3xl mb-5 font-bold text-center color text-pink-700">
            Próximas citas:
          </h3>
          <div>
            {!dates[0] && (
              <div className="text-center text-2xl font-medium text-emerald-600 bg-white/50 p-4 m-2 rounded-lg">
                No tienes citas pendientes
              </div>
            )}
            {dates.map((date) => (
              <DateDetail date={date} onDateDelete={onDateDelete} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProfilePage;
