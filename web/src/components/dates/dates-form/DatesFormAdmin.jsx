import React, { useContext, useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import datesService from "../../../services/dates";
import turnsService from "../../../services/turns";
import UsersService from "../../../services/users";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthStore";
import WeekNavigator from "../../week-navigator/WeekNavigator";
import WeekCarousel from "../../carousel/WeekCarousel";
import TurnListByWeek from "../../turns/turn-list-by-week/TurnListByWeek";
import { clearGuestTurnsCache } from "../../turns/turn-list-by-week/TurnListByWeek";
import { clearAdminTurnsCache } from "../../turns/turns-list-by-week-admin/TurnsListByWeekAdmin";
import Modal from "../../modal/Modal";
import UserItemSelect from "../../users/user-select-item/UserItemSelect";
import { addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";

// ─── CalendarPanel ────────────────────────────────────────────────────────────
// CRÍTICO: debe estar FUERA de DatesFormAdmin para que React lo vea siempre
// como el mismo tipo entre renders. Si estuviese dentro, cada render crearía
// un tipo nuevo → unmount+remount de los 3 paneles del carrusel → freeze.
const CalendarPanelAdmin = React.memo(function CalendarPanelAdmin({ date, selectedTurn, onTurnSelection }) {
  return (
    <TurnListByWeek
      initDate={date}
      onTurnSelection={onTurnSelection}
      selectedTurn={selectedTurn}
    />
  );
});

function DatesFormAdmin({ service, serviceTypes }) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({ mode: "onBlur" });
  const [serverError, setServerError] = useState(undefined);
  const navigate = useNavigate();
  const { currentWeek, onWeekSelect } = useContext(AuthContext);

  const weekToInitDate = (week) => {
    if (!week?.firstDay) return undefined;
    const d = new Date(week.firstDay);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [initDate, setInitDate] = useState(() => {
    const now = new Date();
    const d = startOfWeek(now, { weekStartsOn: 0 });
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [selectedTurn, setSelectedTurn] = useState({});
  // selectedDate se deriva directamente — evita un useEffect extra por selección
  const selectedDate = selectedTurn.date;

  const [modalState, setModalState] = useState(false);
  const [formData, setFormData] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState("hidden");
  const [selectedUser, setSelectedUser] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Carga de semana inicial ──────────────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    const newWeek = {
      firstDay: startOfWeek(now, { weekStartsOn: 0 }),
      lastDay: endOfWeek(now, { weekStartsOn: 0 }),
    };
    onWeekSelect(newWeek);
    setInitDate(weekToInitDate(newWeek));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar, para resetear a la semana actual siempre

  // ── Carga de usuarios: UNA SOLA VEZ al montar, no al seleccionar turno ──
  useEffect(() => {
    UsersService.list()
      .then((users) => setUsers(users))
      .catch((error) => console.error(error));
  }, []); // Sin dependencia en selectedTurn → no se re-ejecuta al seleccionar

  // ── Valor por defecto del tipo de servicio ────────────────────────────────
  // react-hook-form no detecta el value del <select> si nunca se disparó onChange.
  useEffect(() => {
    if (serviceTypes?.length > 0) {
      setValue("type", serviceTypes[0]);
    }
  }, [serviceTypes, setValue]);

  // ── Event listener con cleanup para cerrar dropdown ──────────────────────
  // FIX: registrar en useEffect para evitar fuga de memoria (se añadía un nuevo
  // listener en CADA render sin limpiar el anterior).
  useEffect(() => {
    const handleDocumentClick = (e) => {
      const input = document.getElementById("admin-user-input");
      if (e.target !== input) {
        setOpen("hidden");
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  // ── Navegación de semana ──────────────────────────────────────────────────
  const handleWeekChange = useCallback((direction) => {
    if (!currentWeek?.firstDay) return;
    const base = new Date(currentWeek.firstDay);
    const newBase = direction === "next" ? addWeeks(base, 1) : subWeeks(base, 1);
    const newWeek = {
      firstDay: startOfWeek(newBase, { weekStartsOn: 0 }),
      lastDay: endOfWeek(newBase, { weekStartsOn: 0 }),
    };
    // Actualización síncrona para evitar flash en el carrusel
    setInitDate(weekToInitDate(newWeek));
    onWeekSelect(newWeek);
  }, [currentWeek, onWeekSelect]);

  // Callbacks estables para WeekNavigator
  const handleWeekPrev = useCallback(() => handleWeekChange("prev"), [handleWeekChange]);
  const handleWeekNext = useCallback(() => handleWeekChange("next"), [handleWeekChange]);

  // ── Selección de turno — memoizado para no invalidar React.memo ──────────
  const onTurnSelection = useCallback((turn) => {
    setSelectedTurn(turn);
  }, []);

  // ── Formateo de fecha ─────────────────────────────────────────────────────
  const months = [
    "Enero", "Feb.", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Ago.", "Sept.", "Oct.", "Nov.", "Dic.",
  ];
  const days = {
    0: "Domingo", 1: "Lunes", 2: "Martes", 3: "Miércoles",
    4: "Jueves", 5: "Viernes", 6: "Sábado",
  };

  const showDate = (dateString) => {
    if (!dateString || typeof dateString !== "string") return "";
    const [year, month, day] = dateString.split("-").map(Number);
    const dt = new Date(year, month - 1, day);
    if (isNaN(dt.getTime())) return "Fecha no válida";
    return `${days[dt.getDay()]} ${dt.getDate()} ${months[dt.getMonth()]}`;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onTurnSubmit = async () => {
    const updatedTurn = { ...selectedTurn, state: "Solicitado" };
    try {
      await turnsService.update(selectedTurn.id, updatedTurn);
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach((inputName) =>
          setError(inputName, { message: errors[inputName] })
        );
      } else {
        setServerError(error.message);
      }
    }
  };

  const onDateSubmit = async (date) => {
    date.user = selectedUser.id;
    date.service = service.id;
    date.turn = selectedTurn.id;
    if (date.user) {
      setIsSubmitting(true);
      try {
        setServerError(undefined);
        await datesService.create(date);
        await onTurnSubmit();
        // Cerrar modal y navegar SOLO tras éxito completo
        setModalState(false);
        clearGuestTurnsCache();
        clearAdminTurnsCache();
        navigate("/admin-schedule");
      } catch (error) {
        const errors = error.response?.data?.errors;
        if (errors) {
          console.error(error.message, errors);
          Object.keys(errors).forEach((inputName) =>
            setError(inputName, { message: errors[inputName] })
          );
        } else {
          console.error(error);
          setServerError(error.message);
        }
        // En caso de error, cerrar modal para que el usuario vea el error
        setModalState(false);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setModalState(false);
      setServerError("Usuario no seleccionado");
    }
  };

  const onInvalid = () => {
    // Si la validación de react-hook-form falla, 
    setModalState(false);
  };

  const onFormValid = (data) => {
    // Si la validación nativa pasa, chequeamos el campo manual de usuario
    if (!selectedUser?.id) {
      setError("user", { type: "manual", message: "Debes buscar y seleccionar un paciente de la lista." });
      
      const userInput = document.getElementById("admin-user-input");
      if (userInput) {
        userInput.scrollIntoView({ behavior: "smooth", block: "center" });
        // un timeout rápido asegura que termine el scroll antes de forzar el outline/focus
        setTimeout(() => userInput.focus(), 300);
      }
      return;
    }
    
    // Submit real de react-hook-form pasó todas las validaciones!
    // Guardamos los datos validados y solo mostramos el modal
    setFormData(data);
    setModalState(true);
  };

  const confirmAndSubmit = () => {
    if (formData) {
       onDateSubmit(formData);
    }
  };

  // ── Búsqueda de usuarios ──────────────────────────────────────────────────
  const handleChange = (e) => {
    setOpen("");
    setSearch(e.target.value);
  };

  const usersToShow = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLocaleLowerCase())
  );

  const openSelect = () => {
    setOpen((prev) => (prev === "hidden" ? "" : "hidden"));
  };

  const onUserSelect = (user) => {
    setOpen("hidden");
    setSelectedUser(user);
    setSearch(`${user.name} ${user.surname}`);
    clearErrors("user");
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      <form className="flex flex-col w-full" onSubmit={handleSubmit(onFormValid, onInvalid)}>
        {serverError && (
          <div className="self-center py-1 px-3 mb-3 rounded-lg bg-red-500 border border-red-800 text-white">
            {serverError}
          </div>
        )}
        <div className="flex flex-col p-2 justify-center items-center ">
          <div className="flex flex-col p-2 rounded-xl w-full max-w-2xl border-4 border-emerald-700  bg-emerald-500 ">
            <p className="text-center text-xl font-medium text-white ">
              Solicitud de cita para:
            </p>
            <p className="font-semibold text-white text-center text-md self-center">
              {service.name}
            </p>
          </div>
          <div className={`mb-2 mt-3 p-3 h-24 border-2 z-10 rounded-lg w-full max-w-2xl transition-colors duration-300 ${errors.user ? "border-red-500 bg-red-50 shadow-sm" : "border-emerald-500"}`}>
            <label
              htmlFor="admin-user-input"
              className="ml-1 text-emerald-800 font-bold text-md md:text-lg lg:text-xl"
            >
              1- Busca y selecciona un usuario:
            </label>
            <div>
              <input
                className="rounded-lg bg-white pl-1 h-9 w-full mt-2 text-emerald-700 font-medium border-2 border-pink-300 focus:ring-4 focus:ring-pink-500 focus:border-pink-500 focus:outline-none transition-all"
                type="text"
                value={search}
                onChange={handleChange}
                placeholder="Buscar usuario por nombre"
                onClick={openSelect}
                id="admin-user-input"
              />
              <div
                className={`rounded-b-lg -mt-2 pt-3 ${open} bg-white pl-1 shadow-lg w-full text-emerald-700 font-medium border-2 border-pink-300`}
              >
                <ul className="max-h-[390px] overflow-scroll" id="ul">
                  {usersToShow.map((filteredUser) => (
                    <UserItemSelect
                      key={filteredUser.id || filteredUser._id}
                      user={filteredUser}
                      onUserSelect={onUserSelect}
                    />
                  ))}
                </ul>
              </div>
              {errors.user && (
                <div className=" ml-2 mt-2 text-red-600 font-medium">
                  {errors.user?.message}
                </div>
              )}
            </div>
          </div>
          <div className={`mb-2 mt-3 p-3 border-2 rounded-lg w-full max-w-2xl transition-colors duration-300 ${errors.type ? "border-red-500 bg-red-50 shadow-sm" : "border-emerald-500"}`}>
            <label
              htmlFor="type"
              className="ml-1 text-emerald-800 font-bold text-md md:text-lg lg:text-xl"
            >
              2- Selecciona una opción de servicio:
            </label>
            <div>
              <select
                {...register("type", {
                  required: "Debes seleccionar un tipo de decoración.",
                })}
                className="rounded-lg bg-white pl-1 h-9 w-full mt-2 text-emerald-700 font-medium border-2 border-pink-300 focus:ring-4 focus:ring-pink-500 focus:border-pink-500 focus:outline-none transition-all"
              >
                {serviceTypes.map((type) => (
                  <option key={type} className="w-80 font-medium" value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && (
                <div className=" ml-2 mt-2 text-red-600 font-medium">
                  {errors.type?.message}
                </div>
              )}
            </div>
          </div>
          <div className={`mb-2 mt-3 p-3 border-2 rounded-lg w-full max-w-2xl transition-colors duration-300 ${errors.designDetails ? "border-red-500 bg-red-50 shadow-sm" : "border-emerald-500"}`}>
            <label
              htmlFor="designDetails"
              className="ml-1 text-emerald-800 font-bold text-md md:text-lg lg:text-xl"
            >
              3- Describe los detalles:
            </label>
            <textarea
              placeholder="Describe los detalles del diseño..."
              className="bg-white mt-2 border-2 text-emerald-700 border-pink-300 text-sm rounded-lg focus:ring-4 focus:ring-pink-500 focus:border-pink-500 focus:outline-none block w-full p-2.5 transition-all"
              {...register("designDetails", {
                required: "Son necesarios los detalles",
                minLength: {
                  value: 3,
                  message: "Se necesitan al menos 3 caracteres",
                },
                maxLength: {
                  value: 300,
                  message: "Máximo 300 caracteres",
                },
              })}
            />
            {errors.designDetails && (
              <div className=" ml-2 mt-2 text-red-600 font-medium">
                {errors.designDetails?.message}
              </div>
            )}
          </div>
          <div className={`mb-2 mt-3 p-3 border-2 rounded-lg w-full max-w-2xl transition-colors duration-300 ${errors.needRemove ? "border-red-500 bg-red-50 shadow-sm" : "border-emerald-500"}`}>
            <label
              htmlFor="needRemove"
              className="ml-1 text-emerald-800 font-bold text-md md:text-lg lg:text-xl tracking-tight"
            >
              4- ¿Traes uñas limpias o hay que retirar?
            </label>
            <div className="ml-1 mt-2 flex items-center justify-around font-medium text-emerald-700">
              <div className="flex items-center">
                <span>Uñas limpias</span>
                <input
                  className="mr-4 ml-2 h-5 w-5 hover:ring-pink-600 hover:bg-pink-600 focus:ring-4 focus:ring-pink-500 focus:outline-none cursor-pointer transition-all"
                  {...register("needRemove", {
                    required: "Debes seleccionar una opción.",
                  })}
                  type="radio"
                  value="No"
                />
              </div>
              <div className="flex items-center">
                <span>Con remoción</span>
                <input
                  className="mr-4 ml-2 h-5 w-5 hover:ring-pink-600 hover:bg-pink-600 focus:ring-4 focus:ring-pink-500 focus:outline-none cursor-pointer transition-all"
                  type="radio"
                  value="Sí"
                  {...register("needRemove", {
                    required: "Debes seleccionar una opción.",
                  })}
                />
              </div>
            </div>
            {errors.needRemove && (
              <div className=" ml-2 mt-2 text-red-600 font-medium">
                {errors.needRemove?.message}
              </div>
            )}
          </div>
        <div className="mb-2 mt-3 pt-3 p-2 border-2 border-emerald-500 rounded-lg overflow-hidden w-full max-w-2xl">
          <p className="ml-2 mb-2 text-emerald-800 font-bold text-md md:text-lg lg:text-xl">
            5- Selecciona un turno
          </p>
          <div className="px-2 flex justify-center mb-3">
            <WeekNavigator
              currentWeek={currentWeek}
              onPrev={handleWeekPrev}
              onNext={handleWeekNext}
            />
          </div>
          {initDate && (
            <WeekCarousel
              initDate={initDate}
              onWeekChange={handleWeekChange}
              renderItem={(date) => (
                <CalendarPanelAdmin
                  date={date}
                  selectedTurn={selectedTurn}
                  onTurnSelection={onTurnSelection}
                />
              )}
            />
          )}
        </div>
        </div>

        <div className="flex flex-col p-2 justify-center items-center mt-2 ">
          {selectedTurn.hour && (
            <div className=" bg-lime-50 border-2 border-lime-500 rounded-lg text-center  font-medium py-3 px-5 shadow">
              <p className="text-lg leading-tight text-emerald-700">
                {" "}
                Turno selecionado:{" "}
              </p>
              <p className="text-lg font-bold leading-tight text-emerald-700">
                {showDate(selectedDate)} a las {selectedTurn.hour}{" "}
              </p>
            </div>
          )}

          {!selectedTurn.hour && (
            <div className=" bg-yellow-500 rounded-md text-center text-lg font-medium py-1.5 px-3  shadow-md">
              <p>Debes seleccionar un turno</p>
            </div>
          )}

          <Modal modalState={modalState} setModalState={setModalState}>
            <div className="mb-8">
              <p className="text-center leading-tight font-bold text-4xl uppercase mb-1 text-pink-700">
                ¡Atención!
              </p>
              <p className="text-center leading-tight font-bold text-lg text-emerald-600">
                Para poder solicitar tu cita es imprescindible completar los 4
                pasos anteriores.
              </p>
            </div>
            <div className="text-center  leading-tight  mb-6">
              <p className="font-medium">
                Solicitar cita de{" "}
                <span className="text-pink-700 font-bold">{service.name}</span>{" "}
                para el{" "}
              </p>
              <p className="font-bold text-pink-700">
                {showDate(selectedDate)} a las {selectedTurn.hour} hs.
              </p>
            </div>

            <div className="text-center text-xl mb-6 font-medium leading-tight text-emerald-700">
              <p>Tu solicitud será confirmada a la mayor brevedad posible.</p>
            </div>

            <div className="flex justify-around font-medium text-lg">
              <button
                type="button"
                onClick={() => setModalState(false)}
                className="bg-red-600 text-white  px-2 py-1 rounded "
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmAndSubmit}
                disabled={isSubmitting}
                className={`text-white px-4 py-1.5 rounded font-bold transition-all ${
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                }`}
              >
                {isSubmitting ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </Modal>
        </div>
      </form>
      {selectedTurn.hour && (
        <div className="p-2">
          <button
            type="submit"
            onClick={handleSubmit(onFormValid, onInvalid)}
            className="text-white w-full bg-gradient-to-l from-emerald-700 via-emerald-500 to-emerald-700 shadow hover:bg-pink-700 focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-lg text-xl self-center px-4 py-1.5 mt-2 text-center"
          >
            Solicitar cita
          </button>
        </div>
      )}
      {!selectedTurn.hour && (
        <div className="p-2">
          <button className="text-gray-500 w-full bg-gray-300 shadow  font-medium rounded-lg text-xl self-center px-4 py-1.5 mt-2 text-center">
            Solicitar cita
          </button>
        </div>
      )}
    </div>
  );
}

export default DatesFormAdmin;
