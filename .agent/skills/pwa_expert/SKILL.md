---
name: pwa_expert
description: Configuración de Progressive Web Apps, cachés, manifiestos y service workers enfocado a experiencia móvil nativa.
---

# Habilidad PWA Expert

## 1. Fundamentos PWA 
El objetivo es que las clientas de La Vin Nails puedan instalar la app en sus teléfonos y sientan que es una aplicación nativa, no una simple página web.
- **Manifest (`manifest.json`)**: Configura `display: standalone`, `theme_color` (adaptado al branding del salón) y `background_color`.
- **Assets (Iconos y Portadas)**: Revisa exhaustivamente que existan variaciones de iconos (`512x512`, `192x192`), `apple-touch-icon` explícitos, y splash screens personalizados si es necesario.

## 2. Caching y Service Workers
- Asegura que el catálogo de servicios cargue rápido utilizando estrategias eficientes (ej. `Stale-While-Revalidate` o pre-caching de estáticos).
- OJO con desbordar la memoria del dispositivo almacenando excesivas imágenes HD de la galería (Cloudinary resuelve esto optimizando formatos).
- **Actualizaciones Silenciosas**: Implementa modales no intrusivos de "Actualizar App" cuando exista una nueva versión, para no interrumpir un proceso de reserva a la mitad.

## 3. Limitaciones Críticas (iOS PWA)
- Los comportamientos de Push Notifications son restrictivos en iOS.
- Manejo del teclado virtual: Asegura que el teclado de iOS no rompa o descoloque los modales (usando `h-dvh` coordinado con `mobile_ux_expert`).
- Reabrir la app (resume desde background): Verifica que los estados y sesiones se refrescan correctamente y no queda la UI congelada.
