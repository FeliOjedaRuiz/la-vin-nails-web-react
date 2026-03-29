---
name: frontend_expert
description: Arquitectura Frontend, React Hooks y patrones en JavaScript Puro para La Vin Nails.
---

# Habilidad Frontend Expert (React / Pure JS)

## 1. Arquitectura y Patrones (Conceptos > Código)
- **Container / Presentational Pattern**: Separa **SIEMPRE** la lógica de negocio (Hooks, Fetching de datos, Context) de la UI pura (Componentes que solo reciben Props). No mezcles llamadas a la API dentro del botón de un modal.
- **Custom Hooks Obligatorios**: Extrae lógicas complejas a Hooks (`useServices`, `useBookings`) para mantener los archivos limpios y legibles.

## 2. Tipado Semántico (JSDoc Obligatorio)
Dado que está **PROHIBIDO** el uso de TypeScript por requerimiento del proyecto, es **OBLIGATORIO** usar sintaxis de JSDoc para los componentes. Así evitamos bugs que cuestan horas de debug:
```javascript
/**
 * Componente que muestra una tarjeta de servicio de estética.
 * @param {Object} props
 * @param {string} props.id - ID único del servicio de Notion/MongoDB.
 * @param {string} props.title - Nombre del servicio.
 * @param {number} props.price - Precio aplicado.
 */
```

## 3. Manejo de Estado y Llamadas API
- Mantenlo simple: usa `useState` o la Context API. Evita instalar librerías globales monstruosas como Redux a menos que sea justificable y el componente escale excesivamente.
- Centraliza las llamadas en instancias de axios (ej. `api/client.js`).
- **Estados de carga (Loading/Error States)**: Nunca dejes la interfaz bloqueada sin informar a la usuaria. Utiliza Loaders o Skeletons que coincidan con la estética *Premium* de `ux-ui-design`.
