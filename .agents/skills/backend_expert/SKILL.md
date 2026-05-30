---
name: Backend Expert
description: Conocimiento experto y utilidades para el backend Node.js/Express/MongoDB de La Vin Nails.
---

# Habilidad Backend Expert

Esta habilidad proporciona experiencia en la arquitectura específica del backend de La Vin Nails.

## 1. Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: MongoDB (vía Mongoose)
- **Integraciones**:
  - **Cloudinary**: Gestión de imágenes del portafolio.
  - **Nodemailer**: Envío de correos de confirmación.
  - **Notion SDK**: Sincronización de servicios/catálogo.
- **Autenticación**: JWT (JSON Web Tokens).

## 2. Estructura del Proyecto (`/api`)

- **`app.js`**: Punto de entrada principal. Configuración de middleware, rutas y manejo global de errores.
- **`config/`**: Archivos de configuración (DB, CORS, Cloudinary, Mailer, etc.).
- **`controllers/`**: Lógica de los endpoints. Sigue el patrón `module.exports.action = (req, res, next) => ...`.
- **`models/`**: Esquemas de Mongoose.
- **`routes/`**: Definición de rutas (unificadas en `config/routes.config.js`).
- **`bin/`**: Scripts de utilidad (ej. `services.seed.js` para semillas de datos).

## 3. Estándares de Código y Patrones

### Manejo de Errores
- **SIEMPRE** usa `next(error)` para pasar errores al manejador global.
- Usa `http-errors` para crear errores estándar:
  ```javascript
  const createError = require('http-errors');
  if (!service) return next(createError(404, 'Service not found'));
  ```

### Controladores
- Firma estándar: `(req, res, next)`.
- Respuestas JSON: `res.json(data)`.
- Promesas Mongoose: `.then().catch(next)`.

## 4. Lógica de Dominio (La Vin Nails)

### Gestión de Servicios
- Los servicios pueden provenir de MongoDB o sincronizarse con Notion.
- **Entidades**: `Service`, `User`, `Appointment` (Cita).

## 5. Tareas Comunes
- **Nuevo Endpoint**: Crear función en controlador -> Registrar en `routes.config.js`.
- **Validación**: Usar validación de Mongoose en los modelos.
- **Depuración**: Revisar logs de `morgan` y el manejador de errores en `app.js`.
