import React, { useContext, useState, useEffect, useCallback } from "react";
import Layout from "../components/layouts/Layout";
import WeekNavigator from "../components/week-navigator/WeekNavigator";
import TurnsForm from "../components/turns/turns-form/TurnsForm";
import TurnsListByWeekAdmin from "../components/turns/turns-list-by-week-admin/TurnsListByWeekAdmin";
import WeekCarousel from "../components/carousel/WeekCarousel";
import { AuthContext } from "../contexts/AuthStore";
import { addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";

const weekToInitDate = (week) => {
  if (!week?.firstDay) return undefined;
  const d = new Date(week.firstDay);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function SchedulePageAdmin() {
  const { currentWeek, onWeekSelect } = useContext(AuthContext);
  const [initDate, setInitDate] = useState(() => weekToInitDate(currentWeek));
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (!currentWeek || !currentWeek.firstDay) {
      const now = new Date();
      const newWeek = {
        firstDay: startOfWeek(now, { weekStartsOn: 0 }),
        lastDay: endOfWeek(now, { weekStartsOn: 0 })
      };
      onWeekSelect(newWeek);
      setInitDate(weekToInitDate(newWeek));
    } else {
      setInitDate(weekToInitDate(currentWeek));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  const updateWeek = (baseDate) => {
    const newWeek = {
      firstDay: startOfWeek(baseDate, { weekStartsOn: 0 }),
      lastDay: endOfWeek(baseDate, { weekStartsOn: 0 })
    };
    onWeekSelect(newWeek);
  };

  const handleWeekChange = (direction) => {
    if (!currentWeek?.firstDay) return;
    const base = new Date(currentWeek.firstDay);
    const newBase = direction === "next" ? addWeeks(base, 1) : subWeeks(base, 1);
    const newWeek = {
      firstDay: startOfWeek(newBase, { weekStartsOn: 0 }),
      lastDay: endOfWeek(newBase, { weekStartsOn: 0 }),
    };
    // Actualizar initDate SÍNCRONAMENTE antes del chain de contexto.
    // Sin esto: AuthStore propagaba primero → SchedulePageAdmin re-renderizaba
    // con initDate VIEJO → WeekCarousel detectaba discrepancia → reseteaba → flash.
    setInitDate(weekToInitDate(newWeek));
    onWeekSelect(newWeek);
  };

  const onTurnCreation = () => {
    setReload((prev) => !prev);
  };

  const onInitDate = useCallback((date) => {
    setInitDate(date);
  }, []);

  return (
    <Layout>
      <div className="p-2 flex flex-col items-center gap-1.5 overflow-hidden">
        <h3 className="text-center text-xl md:text-3xl lg:text-4xl font-bold text-emerald-700 tracking-tight mt-1 w-full">
          Turnos de la semana
        </h3>
        
      

        <div className="px-2 flex justify-center w-full mt-1">
          <WeekNavigator 
            currentWeek={currentWeek} 
            onPrev={() => handleWeekChange("prev")} 
            onNext={() => handleWeekChange("next")} 
          />
        </div>

        <div className="flex justify-center w-full px-2">
          <TurnsForm onTurnCreation={onTurnCreation} />
        </div>

        <div className="pb-16 w-full">
          {initDate && (
            <WeekCarousel 
              initDate={initDate} 
              onWeekChange={handleWeekChange}
              renderItem={(date) => (
                <TurnsListByWeekAdmin initDate={date} reload={reload} />
              )}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default SchedulePageAdmin;
