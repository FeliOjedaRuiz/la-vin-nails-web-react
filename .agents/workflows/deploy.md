---
description: Flujo estandarizado para despliegues a producción en Fly.io.
---

# Workflow: Deploy to Production (Fly.io)

Este workflow garantiza que cada despliegue a producción en La Vin Nails sea seguro, replicable y esté debidamente probado.

1. **Revisión Continua de Seguridad**: 
   - Invoca las reglas de `.agents/workflows/no-deploy.md` para asegurar que está permitido hacer un pase a producción en este momento.
   
2. **Ejecución de Tests Automatizados**:
   - `cd web && npm test -- --watchAll=false`
   - (Aplica también a la API en caso de haber un entorno de tests definido).

3. **Verificación Estricta (Bloqueante)**:
   - Según el protocolo de seguridad, el agente **debe** preguntar: *"¿Has verificado que los cambios en la API son compatibles con el esquema actual de la base de datos?"* antes de continuar, incluso si no hubo cambios en el backend.

// turbo
4. **Construcción y Despliegue**:
   - Una vez obtenidos los pases anteriores (Verde en Tests y OK del usuario), ejecutar:
   - `fly deploy` en el directorio raíz.
