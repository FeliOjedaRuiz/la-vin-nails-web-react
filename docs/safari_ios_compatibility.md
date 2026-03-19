# Compatibilidad Safari / iOS (iPhone)

Este documento centraliza las mejores prácticas y soluciones a problemas comunes encontrados en dispositivos Apple dentro del ecosistema de La Vin Nails.

## 1. Problemas de Renderizado y Layout

### 1.1. Altura del Viewport (DVH)
Safari en iOS maneja las barras de navegación de forma dinámica, lo que rompe el uso de `100vh`.
- **Solución**: Usar `h-dvh` (Dynamic Viewport Height) en Tailwind o `min-height: 100dvh` en CSS.
- **Evitar**: `h-screen`, `h-full` en contenedores raíz sin altura definida en el padre.

### 1.2. Zoom Automático en Inputs
iOS hace zoom automático si el `font-size` de un input es menor a `16px`.
- **Solución**: Asegurar que todos los inputs, selects y textareas tengan al menos `text-base` (16px).

## 2. Problemas de Interacción y Eventos

### 2.1. Clics Fantasma y Touch Events
A veces los botones no responden al primer toque si hay un delay de 300ms o si el elemento no tiene `cursor-pointer`.
- **Solución**: Asegurar que los botones tengan `type="button"` y que no haya otros elementos capturando el evento touch.
- **Estado de Carga**: Siempre mostrar un spinner o cambio visual inmediato tras el clic para evitar que el usuario pulse varias veces.

## 3. Manejo de Fechas (El gran problema de Safari)

### 3.1. Parsing de Fechas Inválidas
Safari NO soporta el formato `YYYY-MM-DD` en el constructor `new Date()` si no se especifica la hora o si se usan guiones en ciertos contextos.
- **Error típico**: `new Date("2023-10-25")` puede devolver `Invalid Date` o una fecha desplazada por la zona horaria.
- **Solución**: Usar librerías como `date-fns` (ya incluida en el proyecto) o formatear manualmente la cadena antes de pasarla al constructor.
- **Formato Seguro**: ISO 8601 completo o descomponer la cadena (`split('-')`) y usar `new Date(year, month - 1, day)`.

## 4. Persistencia y Caché

### 4.1. Bloqueo de Cookies / LocalStorage
Si la web se abre desde un WebView (ej. desde Instagram o WhatsApp), Safari puede ser más restrictivo con el almacenamiento.
- **Solución**: Verificar siempre si el token existe antes de realizar peticiones que lo requieran y manejar errores de red con reintentos si es necesario.
