# Documentación de la API

La API de La Vin Nails es un servidor RESTful construido con Node.js y Express que gestiona la persistencia de datos en MongoDB.

## Endpoints Principales

### Usuarios y Autenticación
- `POST /register`: Registrar un nuevo usuario administrador.
- `POST /login`: Autenticación y generación de JWT.
- `GET /profile`: Obtener datos del usuario autenticado (requiere middleware `secure.auth`).

### Servicios (Nails & Estética)
- `GET /services`: Listar todos los servicios disponibles (pueden ser cacheados o sincronizados con Notion).
- `POST /services`: Crear un nuevo servicio (solo admin).
- `PATCH /services/:id`: Actualizar detalles del servicio.
- `DELETE /services/:id`: Eliminar un servicio.

### Citas (Appointments)
- `GET /appointments`: Ver todas las citas (admin).
- `POST /appointments`: Crear una solicitud de cita para un cliente.
- `PATCH /appointments/:id`: Cambiar estado de la cita (Confirmada/Pendiente).

## Variables de Entorno Requeridas (`.env`)
- `PORT`: Puerto de escucha.
- `MONGODB_URI`: URI de conexión a MongoDB.
- `JWT_SECRET`: Secreto para firmar tokens.
- `CLOUDINARY_NAME`, `KEY`, `SECRET`: Credenciales de Cloudinary.
- `NOTION_TOKEN`, `SERVICES_DB_ID`: Credenciales para el SDK de Notion.
- `SMTP_USER`, `SMTP_PASS`: Credenciales de Nodemailer.
