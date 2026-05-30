import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../../../contexts/AuthStore";
import { useForm } from "react-hook-form";
import datesService from "../../../services/dates";
import turnsService from "../../../services/turns";
import { useNavigate } from "react-router-dom";
import WeekNavigator from "../../week-navigator/WeekNavigator";
import WeekCarousel from "../../carousel/WeekCarousel";
import TurnListByWeek from "../../turns/turn-list-by-week/TurnListByWeek";
import { clearGuestTurnsCache } from "../../turns/turn-list-by-week/TurnListByWeek";
import { clearAdminTurnsCache } from "../../turns/turns-list-by-week-admin/TurnsListByWeekAdmin";
import Modal from "../../modal/Modal";
import TurnsColorsExplication from "../../turns/turns-color-explication/TurnsColorsExplication";
import { addWeeks, subWeeks, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { getVisibilityCeiling } from "../../../utils/monthVisibility";

// ─── CalendarPanel ────────────────────────────────────────────────────────────
// CRÍTICO: este componente está FUERA de DatesForm para que React lo vea
// siempre como el mismo tipo entre renders. Si estuviese dentro,
// cada render de DatesForm crearía un tipo nuevo → unmount+remount de los
// 3 paneles → 540 TurnItemGuest re-montados → freeze en móvil.
const CalendarPanel = React.memo(function CalendarPanel({ date, selectedTurn, onTurnSelection, maxVisibleDate }) {
  return (
    <TurnListByWeek
      initDate={date}
      onTurnSelection={onTurnSelection}
      selectedTurn={selectedTurn}
      maxVisibleDate={maxVisibleDate}
    />
  );
});

const isInAppBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  return /Instagram|FBAN|FBAV|FB_IAB|Twitter|Line\/|Snapchat/i.test(ua);
};

function DatesForm({ service, serviceTypes }) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onBlur" });
  const [serverError, setServerError] = useState(undefined);
  const [modalError, setModalError] = useState(undefined);
  const navigate = useNavigate();
  const { user, currentWeek, onWeekSelect } = useContext(AuthContext);
  const [initDate, setInitDate] = useState(() => {
    const now = new Date();
    const d = startOfWeek(now, { weekStartsOn: 0 });
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [selectedTurn, setSelectedTurn] = useState({});
  // selectedDate se deriva directamente — evita un ciclo de render extra por useEffect
  const selectedDate = selectedTurn.date;

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const now = new Date();
    const newWeek = {
      firstDay: startOfWeek(now, { weekStartsOn: 0 }),
      lastDay: endOfWeek(now, { weekStartsOn: 0 }),
    };
    onWeekSelect(newWeek);
    const d = newWeek.firstDay;
    setInitDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar, para resetear a la semana actual siempre

  // ── Valor por defecto del tipo de servicio ────────────────────────────────
  // react-hook-form no detecta el value del <select> si nunca se disparó onChange.
  useEffect(() => {
    if (serviceTypes?.length > 0) {
      setValue("type", serviceTypes[0]);
    }
  }, [serviceTypes, setValue]);

  // Semana actual: los guests no pueden navegar al pasado (se declara ANTES de handleWeekChange)
  const isCurrentWeek = currentWeek?.firstDay
    ? isSameDay(
        startOfWeek(new Date(), { weekStartsOn: 0 }),
        new Date(currentWeek.firstDay)
      )
    : true;

  // Techo de visibilidad y navegación (con excepción de junio)
  const { maxVisibleDate, maxNavigationDate } = getVisibilityCeiling();

  // ¿La semana mostrada ya toca o supera el techo de navegación?
  const isAtMaxWeek = currentWeek?.lastDay
    ? new Date(currentWeek.lastDay) >= maxNavigationDate
    : false;

  const handleWeekChange = useCallback((direction) => {
    if (direction === "prev" && isCurrentWeek) return; // Guard: guests can't go to past weeks
    if (direction === "next" && isAtMaxWeek) return;   // Guard: guests can't go beyond next month
    if (!currentWeek?.firstDay) return;
    const base = new Date(currentWeek.firstDay);
    const newBase = direction === "next" ? addWeeks(base, 1) : subWeeks(base, 1);
    const newWeek = {
      firstDay: startOfWeek(newBase, { weekStartsOn: 0 }),
      lastDay: endOfWeek(newBase, { weekStartsOn: 0 }),
    };

    // Actualización síncrona para que el WeekCarousel reciba la nueva prop instantáneamente
    const d = new Date(newWeek.firstDay);
    setInitDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    
    onWeekSelect(newWeek);
  }, [currentWeek, onWeekSelect, isCurrentWeek, isAtMaxWeek]);

  const onTurnSelection = useCallback((turn) => {
    setSelectedTurn(turn);
  }, []);

  // Callbacks estables para WeekNavigator — evita funciones anónimas nuevas en cada render
  const handleWeekPrev = useCallback(() => handleWeekChange("prev"), [handleWeekChange]);
  const handleWeekNext = useCallback(() => handleWeekChange("next"), [handleWeekChange]);


  // [ELIMINADO] useEffect que llamaba setSelectedDate → causaba un segundo render
  // tras cada selección de turno. selectedDate ahora se deriva arriba.

  const months = [
    "Enero",
    "Feb.",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Ago.",
    "Sept.",
    "Oct.",
    "Nov.",
    "Dic.",
  ];

  const days = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
    0: "Domingo",
  };

  const showDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return "";
    
    // Safari Safe Parsing: split "YYYY-MM-DD"
    const [year, month, day] = dateString.split('-').map(Number);
    const dt = new Date(year, month - 1, day);

    if (isNaN(dt.getTime())) return "Fecha no válida";

    return `${days[dt.getDay()]} ${dt.getDate()} ${months[dt.getMonth()]}`;
  };

  const onDateSubmit = async (data) => {
    if (isSubmitting) return;

    setModalError(undefined);

    if (!user?.id) {
      setModalError("Tu sesión no pudo ser verificada. Prueba abrir la web desde Safari o vuelve a iniciar sesión.");
      return;
    }

    if (!selectedTurn?.id) {
      setServerError("Debe seleccionar un turno antes de confirmar.");
      return;
    }

    const dateApplication = {
      ...data,
      user: user.id,
      service: service.id,
      turn: selectedTurn.id,
    };

    try {
      setIsSubmitting(true);
      setServerError(undefined);

      // ── Step 1: Lock the Turn FIRST (prevents double-booking) ─────────────
      // If this fails → abort entirely, nothing created yet
      const turnUpdate = { ...selectedTurn, state: "Solicitado" };
      await turnsService.update(selectedTurn.id, turnUpdate);

      // ─ Step 2: Create the Date ───────────────────────────────────────────
      // If this fails → rollback Turn back to "Disponible"
      try {
        await datesService.create(dateApplication);
      } catch (dateError) {
        // Rollback: release the turn lock
        await turnsService.update(selectedTurn.id, { ...selectedTurn, state: "Disponible" });
        throw dateError;
      }

      // ── All good: close modal, invalidate caches, navigate ───────────────
      setModalState(false);
      clearGuestTurnsCache();
      clearAdminTurnsCache();
      navigate("/profile");
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error during date submission:", error);
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach((inputName) =>
          setError(inputName, { message: errors[inputName] })
        );
      } else {
        setModalError(error.message || "Error al procesar la solicitud. Compruebe su conexión.");
        setServerError(error.message || "Error al procesar la solicitud. Compruebe su conexión.");
      }
    }
  };

  const onInvalid = () => {
    // Si la validación de react-hook-form falla, 
    setModalState(false);
  };

  const onFormValid = (data) => {
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

  const [modalState, setModalState] = useState(false);
  const [formData, setFormData] = useState(null);

  return (
    <div className="relative flex flex-col items-center w-full">
      {isInAppBrowser() && (
        <div className="bg-amber-100 border-l-4 border-amber-500 p-3 m-2 text-sm w-full max-w-2xl rounded shadow-sm">
          <p className="font-bold text-amber-800">⚠️ Navegador limitado detectado</p>
          <p className="text-amber-700 mt-1">
            Parece que estás abriendo la web desde Instagram u otra app similar. Si experimentas problemas al confirmar la cita o iniciar sesión, te recomendamos pulsar el botón de <span className="font-bold inline-flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal mx-1"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> tres puntos</span> arriba y seleccionar <span className="font-bold">"Abrir en el navegador"</span> (Safari/Chrome).
          </p>
        </div>
      )}
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
          <p className="ml-2 mt-5 font-bold leading-tight text-pink-600 text-xl self-center text-center">
            Completa los siguientes 4 pasos:
          </p>
          <div className={`mb-2 mt-3 p-3 border-2 rounded-lg w-full max-w-2xl transition-colors duration-300 ${errors.type ? "border-red-500 bg-red-50 shadow-sm" : "border-emerald-500"}`}>
            <label
              for="type"
              className="ml-1 text-emerald-800 font-bold text-md md:text-lg lg:text-xl"
            >
              1- Selecciona una opción de servicio:
            </label>
            <div>
              <select
                {...register("type", {
                  required: "Debes seleccionar un tipo de decoración.",
                })}
                className="rounded-lg bg-white pl-1 h-9 w-full mt-2 text-emerald-700 font-medium border-2 border-pink-300 focus:ring-4 focus:ring-pink-500 focus:border-pink-500 focus:outline-none transition-all"
              >
                {serviceTypes.map((type) => (
                  <option className="w-80 font-medium" value={type}>
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
              for="designDetails"
              className="ml-1 text-emerald-800 font-bold text-md md:text-lg lg:text-xl"
            >
              2- Describe los detalles:
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
              for="needRemove"
              className="ml-1 text-emerald-800 font-bold text-md md:text-lg lg:text-xl tracking-tight"
            >
              3- ¿Traes uñas limpias o hay que retirar?
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
              {/* {errors.needRemove && (
              <div className=" ml-2 text-red-600 font-medium">
                {errors.needRemove?.message}
              </div>
            )} */}
            </div>
            {errors.needRemove && (
              <div className=" ml-2 mt-2 text-red-600 font-medium">
                {errors.needRemove?.message}
              </div>
            )}
          </div>
        <div className="mb-2 mt-3 pt-3 p-2 border-2 border-emerald-500 rounded-lg overflow-hidden w-full max-w-2xl">
          <p className="ml-2 mb-2 text-emerald-800 font-bold text-md md:text-lg lg:text-xl">
            4- Selecciona un turno
          </p>
          <div className="px-2 flex justify-center mb-3">
            <WeekNavigator
              currentWeek={currentWeek}
              onPrev={handleWeekPrev}
              onNext={handleWeekNext}
              disablePrev={isCurrentWeek}
              disableNext={isAtMaxWeek}
            />
          </div>
          <TurnsColorsExplication />
          {initDate && (
            <WeekCarousel
              initDate={initDate}
              onWeekChange={handleWeekChange}
              disablePrev={isCurrentWeek}
              disableNext={isAtMaxWeek}
              renderItem={(date) => (
                <CalendarPanel
                  date={date}
                  selectedTurn={selectedTurn}
                  onTurnSelection={onTurnSelection}
                  maxVisibleDate={maxVisibleDate}
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
            {modalError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-6 text-sm text-center font-medium">
                {modalError}
              </div>
            )}
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

export default DatesForm;
