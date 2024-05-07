import React, { useEffect, useState } from "react";
import userServices from "../../../services/users";
import WhatsappIcon from "./../../icons/WhatsappIcon";
import EmailIcon from "../../icons/EmailIcon";
import StarIcon from "../../icons/StarIcon";

function UserDetail({ userId }) {
  const [user, setUser] = useState({});
  const [loyalty, setLoyalty] = useState(0);

  useEffect(() => {
    userServices
      .detail(userId)
      .then((user) => {
        setUser(user);
        if (user.loyalty) {
          setLoyalty(user.loyalty);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const handleClick = (id) => {
    setLoyalty(id);
    user.loyalty = id;
    userServices
      .update(userId, user)
      .then((user) => {
        setUser(user);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="flex flex-col h-full justify-center items-center p-4 max-w-md">
      <div className="m-2 font-medium bg-gradient-to-b from-emerald-900 to-emerald-700 rounded-3xl p-5 flex flex-col justify-center shadow-xl">
        <div className="font-semibold text-white overflow-hidden flex flex-col mb-6">
          <p className="text-center mb-1 text-2xl">
            {user.name} {user.surname}
          </p>
          <a 
          href={`https://wa.me/+34${user.phone}?text=¡Hola!`}
          className="flex items-center mt-2">
            <WhatsappIcon />
            <span className="text-xl">{user.phone}</span>
          </a>
          <div className="flex items-center mt-2">
          <EmailIcon /><p className="text-md">{user.email}</p>
          </div>
        </div>
        <div className=" grid grid-cols-3 gap-3 font-bold">
          <div
            onClick={() => handleClick("1")}
            className={`${
              1 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            }  aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                1 > loyalty
                  ? " bg-gray-200 text-gray-400"
                  : " bg-white text-amber-700"
              } rounded-full w-full h-full flex items-center justify-center shadow-lg p-2 text-4xl`}
            >
              { 1 > loyalty ? "1" : <StarIcon className={`w-full`}  /> }
            </div>
          </div>
          <div
            onClick={() => handleClick("2")}
            className={`${
              2 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            } aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                2 > loyalty
                  ? " bg-gray-200 text-gray-400"
                  : " bg-white text-amber-700"
              } rounded-full w-full h-full flex items-center justify-center shadow-lg p-2 text-4xl`}
            >
              { 2 > loyalty ? "2" : <StarIcon className={`w-full`}  /> }
            </div>
          </div>
          <div
            onClick={() => handleClick("3")}
            className={`${
              3 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            } aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                3 > loyalty
                  ? " bg-gray-200 text-gray-600"
                  : " bg-white text-emerald-700"
              } rounded-full w-full h-full flex justify-center shadow-lg p-2`}
            >
            { 3 > loyalty ? <div className="flex flex-col items-center justify-center">
                <p className="-mb-3 text-3xl">10%</p>
                <p className="text-xl">Desc.</p>
              </div> : <div className="flex flex-col items-center justify-center relative w-full">
                <p className="-mb-3 text-3xl">10%</p>
                <p className="text-xl">Desc.</p>
                <StarIcon className={`w-full text-amber-700 absolute`}  />
              </div>
               }
              
            </div>
          </div>
          <div
            onClick={() => handleClick("4")}
            className={`${
              4 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            } aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                4 > loyalty
                  ? " bg-gray-200 text-gray-400"
                  : " bg-white text-amber-700"
              } rounded-full w-full h-full flex items-center justify-center shadow-lg p-2 text-4xl`}
            >
              { 4 > loyalty ? "4" : <StarIcon className={`w-full`}  /> }
            </div>
          </div>
          <div
            onClick={() => handleClick("5")}
            className={`${
              5 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            } aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                5 > loyalty
                  ? " bg-gray-200 text-gray-400"
                  : " bg-white text-amber-700"
              } rounded-full w-full h-full flex items-center justify-center shadow-lg p-2 text-4xl`}
            >
              { 5 > loyalty ? "5" : <StarIcon className={`w-full`}  /> }
            </div>
          </div>
          <div
            onClick={() => handleClick("6")}
            className={`${
              6 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            } aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                6 > loyalty
                  ? " bg-gray-200 text-gray-600"
                  : " bg-white text-emerald-700"
              } rounded-full w-full h-full flex justify-center  shadow-lg`}
            >
              { 6 > loyalty ? <div className="flex flex-col items-center justify-center">
                <p className="-mb-3 text-3xl">15%</p>
                <p className="text-xl">Desc.</p>
              </div> : <div className="flex flex-col items-center justify-center relative w-full">
                <p className="-mb-3 text-3xl">15%</p>
                <p className="text-xl">Desc.</p>
                <StarIcon className={`w-full text-amber-700 absolute`}  />
              </div>
               }
            </div>
          </div>
          <div
            onClick={() => handleClick("7")}
            className={`${
              7 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            } aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                7 > loyalty
                  ? " bg-gray-200 text-gray-400"
                  : " bg-white text-amber-700"
              } rounded-full w-full h-full flex items-center justify-center shadow-lg p-2 text-4xl`}
            >
              { 7 > loyalty ? "7" : <StarIcon className={`w-full`}  /> }
            </div>
          </div>
          <div
            onClick={() => handleClick("8")}
            className={`${
              8 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            } aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                8 > loyalty
                  ? " bg-gray-200 text-gray-400"
                  : " bg-white text-amber-700"
              } rounded-full w-full h-full flex items-center justify-center shadow-lg p-2 text-4xl`}
            >
              { 8 > loyalty ? "8" : <StarIcon className={`w-full`}  /> }
            </div>
          </div>
          <div
            onClick={() => handleClick("9")}
            className={`${
              9 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            } aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                9 > loyalty
                  ? " bg-gray-200 text-gray-600"
                  : " bg-white text-emerald-700"
              } rounded-full w-full h-full flex justify-center  shadow-lg`}
            >
              { 9 > loyalty ? <div className="flex flex-col items-center justify-center">
                <p className="-mb-3 text-3xl">15%</p>
                <p className="text-xl">Desc.</p>
              </div> : <div className="flex flex-col items-center justify-center relative w-full">
                <p className="-mb-3 text-3xl">15%</p>
                <p className="text-xl">Desc.</p>
                <StarIcon className={`w-full text-amber-700 absolute`}  />
              </div>
               }
            </div>
          </div>
          <div
            onClick={() => handleClick("10")}
            className={`${
              10 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            } aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                10 > loyalty
                  ? " bg-gray-200 text-gray-400"
                  : " bg-white text-amber-700"
              } rounded-full w-full h-full flex items-center justify-center shadow-lg p-2 text-4xl`}
            >
              { 10 > loyalty ? "10" : <StarIcon className={`w-full`}  /> }
            </div>
          </div>
          <div
            onClick={() => handleClick("11")}
            className={`${
              11 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            } aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                11 > loyalty
                  ? " bg-gray-200 text-gray-400"
                  : " bg-white text-amber-700"
              } rounded-full w-full h-full flex items-center justify-center shadow-lg p-2 text-4xl`}
            >
              { 11 > loyalty ? "11" : <StarIcon className={`w-full`}  /> }
            </div>
          </div>
          <div
            onClick={() => handleClick("12")}
            className={`${
              12 > loyalty
                ? "bg-gray-400"
                : "bg-gradient-to-bl from-amber-50 via-amber-700 via-40% to-brown-800 to-90%"
            } aspect-square rounded-full p-1.5 shadow-lg`}
          >
            <div
              className={`${
                12 > loyalty
                  ? " bg-gray-200 text-gray-600"
                  : " bg-white text-emerald-700"
              } rounded-full w-full h-full flex justify-center shadow-lg p-2`}
            >
            { 12 > loyalty ? <div className="flex flex-col items-center justify-center">
            <p className="-mb-2 -mt-2 text-3xl">1</p>
                <p className="-mb-2 text-sm">¡servicio</p>
                <p className="text-sm">gratuito!</p>
              </div> : <div className="flex flex-col items-center justify-center relative w-full">
              <p className="-mb-2 -mt-2 text-3xl">1</p>
                <p className="-mb-2 text-sm">¡servicio</p>
                <p className="text-sm">gratuito!</p>
                <StarIcon className={`w-full text-amber-700 absolute`}  />
              </div>
               }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetail;
