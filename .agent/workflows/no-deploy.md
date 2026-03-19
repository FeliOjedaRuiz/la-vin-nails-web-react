---
description: Flujo preventivo para evitar despliegues accidentales o sin revisión en producción.
---

# Workflow: No Deploy Without Permission

Este proyecto utiliza Fly.io para el despliegue. Para evitar errores en producción, se sigue este flujo:

1.  **Pruebas Locales**: Probar siempre los cambios en el entorno de desarrollo (`npm run dev` en api y web).
2.  **Sincronización de Base de Datos**: Si hay cambios en los esquemas, verificar que no rompan los datos existentes.
3.  **Revisión de Variables de Entorno**: Asegurar que los secretos (Cloudinary, Mongo URI, Notion Token) estén configurados en Fly.io.
4.  **Confirmación Explícita**: El agente NO ejecutará comandos de despliegue (`fly deploy`) sin una orden directa y confirmada del usuario.

// turbo
## Paso de Verificación
Si el usuario pide desplegar, preguntar: "¿Has verificado que los cambios en la API son compatibles con el esquema actual de la base de datos?".
