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

## 4. Memoria Persistente (Engram)

Este proyecto tiene memoria persistente en Engram. Antes de tomar decisiones técnicas, buscar contexto previo o diseñar agentes nuevos, consultar via `mem_search`:

| Topic Key | Contenido | Cuándo buscar |
|-----------|-----------|---------------|
| `opencode/ai-models-comparison` | Comparativa de 6 modelos IA (DeepSeek, MiniMax, Qwen, MiMo, GLM, Kimi) con puntuaciones y casos de uso | Al crear/configurar agentes nuevos |
| `opencode/model-rate-limits` | Límites de peticiones por modelo en suscripción Go | Al distribuir carga entre agentes |
| `opencode/orchestrator-model-choice` | Razón de usar Qwen3.6 Plus como orchestrator (visión) | Al evaluar cambio de modelo del orchestrator |
| `opencode/documentation-model-choice` | Mejor modelo para documentación masiva (MiMo-V2.5-Pro) | Al planificar tareas de documentación |
| `sdd-init/web-la-vin-nails-react` | Capacidades de testing del proyecto, modo TDD | Antes de lanzar sdd-apply o sdd-verify |

**Regla**: Si el orchestrator necesita elegir un modelo para un agente nuevo, SIEMPRE buscar `opencode/ai-models-comparison` y `opencode/model-rate-limits` primero.
