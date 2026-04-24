# AGENTS.md

## 1. Reglas Core (Fuente de Verdad Técnica)

Este archivo sirve como única fuente de verdad técnica para las herramientas como GGA. Contiene las restricciones y reglas de arquitectura del proyecto La Vin Nails.

## 2. Stack Tecnológico Estricto (MERN)

Solo se deben utilizar soluciones dentro de este stack:
- **Frontend**: React.js (CRA actual).
- **Estilos**: Tailwind CSS. Diseño _Mobile-First_ y premium obligatorio. **(OBLIGATORIO: Leer `DESIGN.md` antes de crear/modificar UI para mantener los tokens y la identidad visual).**
- **Backend**: Node.js con Express.
- **Base de Datos**: MongoDB (Mongoose).
- **Integraciones**: Cloudinary, Nodemailer, Notion SDK.
- **Lenguaje**: **JavaScript puro**. (PROHIBIDO el uso de TypeScript por requerimiento del proyecto).

## 3. Estándares de Código Críticos (Safari/iOS Mobile)

- **Viewport**: ESTRICTAMENTE PROHIBIDO usar `h-screen` o `100vh`. USAR `h-dvh` SIEMPRE para evitar problemas nativos de barras en móviles (Safari iOS).
- **Fechas**: No confíes en el parsing directo de Date a string sin formateadores seguros (`date-fns`).
- **Inputs UI**: `font-size` mínimo de `16px` para evitar zoom automático en iOS.
