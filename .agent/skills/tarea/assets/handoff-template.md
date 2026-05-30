# HANDOFF: {Nombre de la Feature}

> 📅 **Fecha**: {YYYY-MM-DD}
> 🧠 **Planificado por**: {modelo usado}
> 🔧 **Para implementar con**: {modelo recomendado}
> 📄 **SDD Change**: {nombre-del-change si aplica}

---

## 1. Resumen Ejecutivo

{Una frase describiendo qué se va a construir y por qué}

---

## 2. Decisiones de Arquitectura

| Decisión | Razón | Alternativas consideradas |
|----------|-------|--------------------------|
| {patrón/tecnología} | {por qué} | {qué más se evaluó} |

### Estructura de archivos afectados

```
{árbol de archivos nuevos/modificados}
```

---

## 3. Especificaciones

### Requisitos Funcionales

- [ ] {REQ-01}: {descripción}
- [ ] {REQ-02}: {descripción}

### Criterios de Aceptación

- [ ] {Criterio 1}
- [ ] {Criterio 2}

### Edge Cases

- {Caso límite 1}
- {Caso límite 2}

---

## 4. Plan de Implementación (Tareas)

| # | Tarea | Archivo(s) | Prioridad | Depende de |
|---|-------|-----------|-----------|------------|
| 1 | {descripción} | `ruta/archivo.js` | Alta | - |
| 2 | {descripción} | `ruta/archivo.js` | Media | #1 |

---

## 5. Contexto Técnico

### Reglas Críticas del Proyecto (AGENTS.md)

- Stack MERN exclusivo (MongoDB, Express, React/CRA, Node.js)
- JavaScript PURO — NO TypeScript
- Mobile First: usar `h-dvh` SIEMPRE, evitar `h-screen` o `100vh`
- Fechas: No confiar en el parsing directo de Date a string sin formateadores seguros (`date-fns`)
- Inputs UI: `font-size` mínimo de `16px` para evitar zoom automático en iOS (Safari mobile)
- Documentación y respuestas en Español (Rioplatense si es chat, neutro/inglés si son archivos según AGENTS.md)

### Dependencias Relevantes

| Paquete | Versión | Uso |
|---------|---------|-----|
| react | 19.x | UI |
| react-router-dom | 7.x | Routing |
| framer-motion | 12.x | Animaciones |
| tailwindcss | 4.x | Estilos |
| {otro} | {versión} | {uso} |

### Gotchas / Lecciones Aprendidas

- {gotcha 1}
- {gotcha 2}

---

## 6. Archivos Relevantes

| Archivo | Rol | ¿Modificar? |
|---------|-----|-------------|
| `web/src/pages/{Page}.jsx` | {qué hace} | Sí |
| `web/src/components/{Component}.jsx` | {qué hace} | Sí |
| `api/controllers/{ctrl}.js` | {qué hace} | No (solo lectura) |

---

## 7. Memoria Persistente (Engram)

Las siguientes observaciones en Engram contienen contexto relevante:

| ID | Título | Relevancia |
|----|--------|------------|
| {id} | {título} | {por qué es relevante} |

> Para recuperar una observación completa: `engram_mem_get_observation(id={id})`

---

## Notas para el Implementador

1. **Lee esto PRIMERO** antes de tocar cualquier archivo
2. **No rediseñes** — las decisiones de arquitectura ya están tomadas
3. **Sigue el orden de tareas** — respeta las dependencias
4. **Si algo no está claro**, consulta Engram o los archivos listados en la sección 6
5. **Al terminar**, actualiza este documento marcando tareas como [x]
