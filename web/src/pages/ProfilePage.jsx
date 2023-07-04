import React, { useContext } from "react";
import Layout from "../components/layouts/Layout";
import { AuthContext } from '../contexts/AuthStore';

function ProfilePage() {
  const { logout, user } = useContext(AuthContext);


  return (
    <>
      <Layout>
        <div className="flex flex-col">
          <h1 className="text-center mt-4 text-3xl font-bold text-pink-700">¡Hola {user.name}!</h1>
          <div className="flex flex-col m-5 p-4 pb-6 rounded-md bg-white/50">
            <h4 className=" mb-2 text-xl font-bold text-green-700">Tus datos:</h4>
            <p className="mb-2"><strong>Fullname:</strong> {user.name} {user.surname}</p>
            <p className="mb-2"><strong>Phone:</strong> {user.phone}</p>
            <p className="mb-2"><strong>Email:</strong> {user.email} </p>
            <button className='text-white bg-green-600 hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded text-md w-18 self-center mt-4 px-4 py-1 mt-2 text-center'>Editar</button>
          </div>
          <div className="flex flex-col m-5 p-4 pb-6 rounded-md bg-white/50">
            <h4 className=" mb-2 text-xl font-bold text-green-700">Tus próxima cita:</h4>
            <p className="mb-2"><strong>Fecha:</strong> DD/MM/AA &nbsp; &nbsp;<strong>Hora:</strong> 18:00 hs.</p>
            <p className="mb-2"><strong>Servicio:</strong></p>
            <p className="mb-2"><strong>Duración:</strong> H:MM hs. &nbsp; &nbsp;<strong>Precio:</strong> XX€</p>
            <button className='text-white bg-green-600 hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded text-md w-18 self-center mt-4 px-4 py-1 mt-2 text-center'>Ver</button>
          </div>
          <button onClick={() => logout()} className='text-white bg-pink-700 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded text-md w-18 self-center mt-4 px-4 py-1 mt-2 text-center'>Cerrar sesión</button>
        </div>
      </Layout>
    </>
  );
}

export default ProfilePage;
