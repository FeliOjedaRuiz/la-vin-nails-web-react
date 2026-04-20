import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { addWeeks, subWeeks } from "date-fns";

const getDateString = (date) => {
  if (!date) return undefined;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getPrev = (dateStr) => getDateString(subWeeks(new Date(dateStr.replace(/-/g, "/")), 1));
const getNext = (dateStr) => getDateString(addWeeks(new Date(dateStr.replace(/-/g, "/")), 1));

/**
 * WeekCarousel — Strip de 3 paneles con clipping por overflow.
 *
 * Truco clave para la medición: PRIMER render es un div vacío de
 * ancho 100% que mide el espacio disponible real. SEGUNDO render
 * monta el strip con anchos fijos en px basados en esa medición.
 *
 * El contenedor del strip es un div con width fijo (no %), position
 * relative, y overflow hidden. Esto IMPIDE que el strip (3x) empuje
 * al padre.
 */
const WeekCarousel = ({ initDate, onWeekChange, renderItem }) => {
  const measureRef = useRef(null);
  const controls = useAnimation();
  // Ref: guard síncrono para impedir re-entrada en goTo (setState es async,
  // no serviría como lock).
  const isTransitioning = useRef(false);
  // State: controla el prop `drag`. Cambios aquí SÍ causan re-render,
  // deshabilitando el touch durante transiciones y evitando corrupción
  // del estado interno de Framer Motion.
  const [isDraggable, setIsDraggable] = useState(true);
  const lastExternalDate = useRef(initDate);

  const [width, setWidth] = useState(0);

  const [dates, setDates] = useState(() => ({
    prev: getPrev(initDate),
    center: initDate,
    next: getNext(initDate),
  }));

  // Medir el wrapper (siempre en el DOM con width:100%).
  // En móvil, el scroll vertical oculta/muestra la barra de dirección,
  // lo que dispara resize. Antes hacíamos setWidth(0) → desmontaba
  // el strip → scroll saltaba al top. Ahora medimos directamente
  // y solo actualizamos si el ancho REALMENTE cambió.
  useEffect(() => {
    const handleResize = () => {
      if (measureRef.current) {
        const w = measureRef.current.offsetWidth;
        if (w > 0) setWidth((prev) => (prev === w ? prev : w));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Setear posición inicial del strip cuando tenemos width
  useEffect(() => {
    if (width) controls.set({ x: -width });
  }, [width]);

  // Sincronizar si el padre cambia initDate desde fuera
  useEffect(() => {
    if (initDate === lastExternalDate.current) return;
    if (initDate === dates.center) return;

    lastExternalDate.current = initDate;
    setDates({ prev: getPrev(initDate), center: initDate, next: getNext(initDate) });
    if (width) controls.set({ x: -width });
  }, [initDate, width]);

  const goTo = useCallback(
    async (direction) => {
      if (isTransitioning.current || !width) return;
      isTransitioning.current = true;
      setIsDraggable(false); // Re-render → drag={false} → touch bloqueado

      const targetX = direction === "next" ? -2 * width : 0;

      try {
        // Stop any in-flight animation to prevent dangling promises
        controls.stop();

        await controls.start({
          x: targetX,
          transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
        });
      } catch {
        // Animation was interrupted — safe to ignore
      }

      setDates((d) => {
        const newDates =
          direction === "next"
            ? { prev: d.center, center: d.next, next: getNext(d.next) }
            : { prev: getPrev(d.prev), center: d.prev, next: d.center };

        lastExternalDate.current = newDates.center;
        return newDates;
      });

      controls.set({ x: -width });
      onWeekChange(direction);
      isTransitioning.current = false;
      setIsDraggable(true); // Re-render → drag={"x"} → touch restaurado
    },
    [width, controls, onWeekChange]
  );

  const handleDragEnd = useCallback(
    (e, { offset, velocity }) => {
      if (isTransitioning.current) return;

      const DIST_THRESHOLD = width * 0.2;
      const VEL_THRESHOLD = 300;
      // Mínimo movimiento horizontal para considerar un swipe.
      // Sin esto, un scroll vertical rápido con leve componente
      // horizontal dispara un cambio de semana accidental en móvil.
      const MIN_SWIPE_PX = 15;

      if (Math.abs(offset.x) < MIN_SWIPE_PX) {
        controls.start({
          x: -width,
          transition: { type: "spring", stiffness: 350, damping: 35 },
        });
        return;
      }

      if (offset.x < -DIST_THRESHOLD || velocity.x < -VEL_THRESHOLD) {
        goTo("next");
      } else if (offset.x > DIST_THRESHOLD || velocity.x > VEL_THRESHOLD) {
        goTo("prev");
      } else {
        controls.start({
          x: -width,
          transition: { type: "spring", stiffness: 350, damping: 35 },
        });
      }
    },
    [width, goTo, controls]
  );

  // Wrapper SIEMPRE en el DOM con width:100% para medir.
  // El strip se monta dentro solo cuando ya tenemos medida.
  // Esto evita el ciclo setWidth(0) → div vacío → remedir
  // que en móvil causaba desmontaje + scroll al top.
  return (
    <div ref={measureRef} style={{ width: "100%" }}>
      {!width ? (
        <div style={{ minHeight: "200px" }} />
      ) : (
        <div
          style={{
            width: `${width}px`,
            overflow: "hidden",
          }}
        >
          <motion.div
            drag={isDraggable ? "x" : false}
            dragConstraints={{ left: -2 * width, right: 0 }}
            dragElastic={0.05}
            dragMomentum={false}
            animate={controls}
            onDragEnd={handleDragEnd}
            style={{
              display: "flex",
              width: `${3 * width}px`,
              touchAction: "pan-y",
              willChange: "transform",
            }}
          >
            {[dates.prev, dates.center, dates.next].map((date) => (
              <div 
                key={date} 
                style={{ width: `${width}px`, minWidth: 0, flexShrink: 0, overflow: "hidden" }}
              >
                {renderItem(date)}
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WeekCarousel;
