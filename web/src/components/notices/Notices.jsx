import React, { useEffect, useState } from "react";
import LoadingIcon from "../icons/LoadingIcon";

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(false);
  const [acepted, setAcepted] = useState(false);

  const noticesApiUrl =
    process.env.NOTICES_API_URL || "http://192.168.1.128:3002";

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch(
          noticesApiUrl + "/api/v1/notices?slug=comunicado"
        ); // Cambia la URL por la de tu servidor
        if (!response.ok) {
          throw new Error("Error fetching the notices");
        }
        const data = await response.json();
        setNotices(data[0]);
        if (acepted === false) {
          setActive(data[0].active);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  useEffect(() => {
    if (acepted) {
      setActive(false);
    }
  }, [acepted]);

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-b from-pink-100/80 to-lime-100/80 fixed z-20 h-full w-full flex flex-col items-center justify-center backdrop-blur-[3px]">
        <LoadingIcon className={"w-12 h-12 mb-3 animate-spin"} />
        <p className="text-2xl font-semibold text-pink-600">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      {active && (
        <div className="p-8 bg-gradient-to-b from-pink-100/80 to-lime-100/80 fixed z-20 h-full w-full flex items-center justify-center backdrop-blur-[3px]">
          <div className=" bg-gradient-to-b from-pink-500 to-pink-800 p-6 rounded-xl text-white flex flex-col items-center shadow-md max-w-md">
            <h2 className="text-center text-3xl font-bold mb-2 drop-shadow-lg">
              {notices.title}{" "}
            </h2>
            <p className="text-center text-xl font-bold mb-2 text-yellow-500">
              {notices.subtitle}
            </p>
            <p className="text-sm ">{notices.description}</p>
            <button
              onClick={() => setAcepted(!acepted)}
              className="bg-white text-pink-500 font-semibold rounded py-2 px-3 mt-6 shadow-md hover:bg-pink-50/90 transition focus:ring-4 focus:ring-yellow-500 active:bg-pink-500 active:text-white"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Notices;
