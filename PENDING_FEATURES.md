# Características Pendientes y Optimizaciones (PWA)

Este documento lista las funcionalidades que se han identificado como necesarias pero que se han postergado para futuras sesiones, con el fin de no sobredimensionar la implementación actual de notificaciones.

## PWA UX / UI

### 1. Banner de "Nueva Versión Disponible"
- **Descripción**: Actualmente la PWA se actualiza silenciosamente (se requiere cerrar y volver a abrir la app 1-2 veces). 
- **Objetivo**: Implementar un aviso en el frontend que detecte cuando hay un nuevo Service Worker esperando (`onUpdate`) y ofrezca un botón de "Reiniciar para actualizar".
- **Trigger**: `registration.onupdatefound` -> `registration.waiting` en `serviceWorkerRegistration.js`.

### 2. Prompt de Instalación Personalizado
- **Descripción**: Facilitar la instalación en iOS mostrando un banner visual de "Añadir a pantalla de inicio" adaptado a Safari.
- **Objetivo**: Ayudar a los administradores a suscribirse a notificaciones de forma sencilla.

## Notificaciones Push (Avanzado)

### 3. Filtro de Notificaciones por Dispositivo
- **Descripción**: Actualmente se envía a todos los endpoints registrados de cada admin.
- **Objetivo**: Si un admin desactiva las notificaciones en un dispositivo específico, debemos asegurar que la base de datos se mantenga sincronizada.

### 4. Payload Enriquecido
- **Descripción**: Mejorar el contenido de la notificación para incluir detalles como:
    - Fecha y hora exacta de la reserva.
    - Botón de acción directa ("Ver Reserva").

### 6. Deep Linking a la Reserva
- **Descripción**: Actualmente la notificación abre la URL general de administración.
- **Objetivo**: Asegurar que al clicar la notificación en el móvil, la App se abra automáticamente en la ficha específica de la clienta que acaba de reservar.

### 5. Icono Silhouette para Android (Badge)
- **Descripción**: Actualmente Android muestra un cuadrado blanco porque el favicon tiene fondo y color. 
- **Objetivo**: Crear una versión del logo de 72x72px que sea solo una silueta blanca sobre transparencia para usar como `badge` en Android.
