# HANDOFF: Ordenar próximas citas por fecha (más próxima → más lejana)

> 📅 **Fecha**: 2026-06-15
> 🧠 **Planificado por**: DeepSeek V4 Pro
> 🔧 **Para implementar con**: MiniMax M2.7 o DeepSeek V4 Flash
> 📄 **SDD Change**: N/A (fix puntual)

---

## 1. Resumen Ejecutivo

Las citas en `ClientProfilePage.jsx` (sección "Próximas citas") se muestran en el orden que devuelve la API (`datesService.myList()`), que aparentemente es por fecha de creación. Hay que ordenarlas por `date.turn.date` (formato `YYYY-MM-DD`) de la más próxima a la más lejana.

---

## 2. Decisiones de Arquitectura

| Decisión | Razón | Alternativas consideradas |
|----------|-------|--------------------------|
| `.sort()` en el frontend con `localeCompare` | No requiere cambio de API. Las fechas ya están en formato `YYYY-MM-DD` (orden lexicográfico = orden cronológico). | Ordenar en backend (overkill para este caso). |

### Estructura de archivos afectados

```
web/
└── src/
    └── pages/
        └── ClientProfilePage.jsx   ← único archivo a modificar
```

---

## 3. Especificaciones

### Requisitos Funcionales

- [ ] Las citas en "Próximas citas" deben aparecer ordenadas de la más próxima a la más lejana según `date.turn.date`.

### Criterios de Aceptación

- [ ] La cita con fecha más cercana a hoy aparece primero en la lista.
- [ ] La cita con fecha más lejana aparece última.
- [ ] El filtro existente (solo mostrar citas con fecha >= hoy) se mantiene intacto.

### Edge Cases

- **Fechas iguales**: Si dos citas tienen la misma fecha, `localeCompare` devuelve 0 y mantienen el orden relativo original (comportamiento estable, aceptable).
- **Formato inválido**: No aplica — el campo `date.turn.date` ya viene como string `YYYY-MM-DD` desde la API y se usa así para el filtro existente.

---

## 4. Plan de Implementación (Tareas)

| # | Tarea | Archivo(s) | Prioridad | Depende de |
|---|-------|-----------|-----------|------------|
| 1 | Agregar `.sort()` después del `.filter()` en el `useEffect` de `ClientProfilePage.jsx` | `web/src/pages/ClientProfilePage.jsx` | Alta | - |

---

## 5. Contexto Técnico

### Reglas Críticas del Proyecto (AGENTS.md)

- Stack MERN exclusivo (MongoDB, Express, React/CRA, Node.js)
- JavaScript PURO — NO TypeScript
- Mobile First: usar `h-dvh`, evitar `h-screen` o `100vh`
- Fechas: No confiar en parsing directo de Date. Para este fix usamos strings `YYYY-MM-DD` con `localeCompare`, que es seguro.

### Código Actual (líneas 44-53)

```jsx
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
}, [reload, actualDate]);
```

### Cambio Requerido

Agregar `.sort((a, b) => a.turn.date.localeCompare(b.turn.date))` **después** del `.filter()` y **antes** del `setDates()`:

```jsx
const datesUserAndDate = dates
    .filter((date) => date.turn.date >= actualDate)
    .sort((a, b) => a.turn.date.localeCompare(b.turn.date));
```

### Por qué `localeCompare`

- `date.turn.date` tiene formato `YYYY-MM-DD` (confirmado por el filtro existente que compara strings con `>=`).
- `localeCompare` ordena strings alfabéticamente. En formato `YYYY-MM-DD`, el orden lexicográfico equivale al orden cronológico.
- No se necesita `new Date()` ni librerías externas.

---

## 6. Archivos Relevantes

| Archivo | Rol | ¿Modificar? |
|---------|-----|-------------|
| `web/src/pages/ClientProfilePage.jsx` | Página de perfil del cliente, sección "Próximas citas" | **Sí** |
| `web/src/services/dates.js` | Servicio que llama a `myList()` | No (solo lectura para entender datos) |

---

## 7. Memoria Persistente (Engram)

N/A — no hay observaciones previas relevantes para este fix.

---

## Notas para el Implementador

1. **Lee esto PRIMERO** antes de tocar cualquier archivo.
2. **Un solo archivo, un solo cambio**: solo `ClientProfilePage.jsx`, solo agregar el `.sort()`.
3. **No toques el filtro existente** — se mantiene exactamente igual.
4. **No necesitás `date-fns`** — `localeCompare` con strings `YYYY-MM-DD` es suficiente y seguro.
5. **Al terminar**, verificá visualmente que las citas aparezcan ordenadas correctamente.
