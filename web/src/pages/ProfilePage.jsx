import React, { useContext } from "react";
import Layout from "../components/layouts/Layout";
import { AuthContext } from "../contexts/AuthStore";
import WhatsappIcon from "../components/icons/WhatsappIcon";

function ProfilePage() {
  const { logout, user } = useContext(AuthContext);

  return (
    <Layout>
      <div className="flex flex-col">
        <h1 className="text-center mt-4 text-3xl font-bold text-pink-700">
          ¡Hola {user.name}!
        </h1>
        <div className="flex flex-col p-4 pb-6 m-5 rounded-md bg-white/50">
          <h4 className=" mb-2 text-2xl text-center font-bold text-green-700">
            Tus perfil
          </h4>
          <p className="mb-2 text-lg">
            <strong>Nombre:</strong> {user.name}{" "}
          </p>
          <p className="mb-2 text-lg">
            <strong>Apellido:</strong> {user.surname}
          </p>
          <p className="mb-2 text-lg">
            <strong>Phone:</strong> {user.phone}
          </p>
          <p className="mb-2 text-lg">
            <strong>Email:</strong> {user.email}{" "}
          </p>
          <button className="mb-3 text-white bg-gradient-to-l from-emerald-700 via-green-500 to-emerald-700 shadow hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded text-md w-20 self-center mt-4 px-4 py-1 text-center">
            Editar
          </button>
          <p className="text-center leading-tight text-pink-600">
            Próximamente podrás editar tus datos o eliminar tu cuenta. Si tienes
            alguna duda comunicate con el administrador:
          </p>
          <a
            href={`https://wa.me/$+34682126136?text=Hola tengo una duda sobre mi cuenta en La Vin Nails Web.`}
            className="flex self-center items-center mt-2 w-32 justify-center text-white py-1 px-3 font-medium rounded-md text-lg shadow-lg bg-[#128C7E] hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300"
          >
            {" "}
            <WhatsappIcon /> Consultar
          </a>
        </div>

        <button
          onClick={() => logout()}
          className="text-white bg-gradient-to-l from-pink-700 via-pink-500 to-pink-700 shadow hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded text-md self-center mt-4 px-4 py-1 text-center"
        >
          Cerrar sesión
        </button>
      </div>
    </Layout>
  );
}

export default ProfilePage;
