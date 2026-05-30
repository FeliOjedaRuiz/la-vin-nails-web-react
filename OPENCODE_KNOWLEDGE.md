# Contexto y Conocimiento del Proyecto (La Vin Nails)

Este documento centraliza todos los workflows, skills (locales y globales), configuraciones core y MCPs (Model Context Protocol) utilizados en el ecosistema de La Vin Nails. Su propósito es servir como puente de contexto para que OpenCode, u otros agentes IDE, puedan integrarse y operar bajo las mismas reglas y estándares que Antigravity.

---

## 1. Configuración Core y Arquitectura

Basado en los archivos fundacionales del proyecto (`AGENTS.md`, `DESIGN.md`, `ens.md`, `safari_ios_compatibility.md`):

### Stack Estricto
- **MERN Stack**: MongoDB (Mongoose), Express, React.js (CRA actual), Node.js.
- **Lenguaje**: JavaScript Puro. **ESTRICTAMENTE PROHIBIDO el uso de TypeScript** por requerimientos del proyecto.
- **Integraciones Clave**:
  - **Cloudinary**: Para optimizar y servir imágenes del portafolio.
  - **Nodemailer**: Envío de correos y notificaciones.
  - **Notion SDK**: Fuente de verdad externa para la gestión dinámica del catálogo de servicios.

### Estándares Críticos (Safari/iOS Mobile)
La Vin Nails tiene un fuerte enfoque *Mobile-First*. Las siguientes reglas son innegociables:
1. **Viewport Height**: PROHIBIDO usar `h-screen` o `100vh`. **SIEMPRE USAR `h-dvh`** para evitar problemas con las barras dinámicas de navegación en Safari iOS.
2. **Zoom de Inputs**: Todo input (`input`, `textarea`, `select`) debe tener un tamaño mínimo de fuente de `16px` (`text-base` en Tailwind) para evitar el zoom automático en iOS.
3. **Manejo de Fechas**: Safari no soporta bien el parseo de fechas con guiones (`YYYY-MM-DD`). Usar siempre `date-fns` o formateadores seguros antes de inyectarlo a un constructor `Date`.

### Identidad Visual y Diseño (Premium)
- **Paleta de Colores**: 
  - Primario: Pink (Gama de Material Design, ej. `pink-700`, `pink-500` para botones y gradientes).
  - Secundario: Emerald (ej. `emerald-700` para textos secundarios o success).
- **Tipografía**: Google Fonts (Poppins, Inter, Roboto u Outfit).
- **Interacción**: Uso obligatorio de micro-animaciones (ej. `animate-fade-in-down`), transiciones suaves y diseño que denote profesionalismo y estética cuidada (evitar interfaces MVP genéricas).

---

## 2. Model Context Protocol (MCP) Servers

El ecosistema de agentes interactúa de forma extendida con estos servidores MCP. Al usar OpenCode, es ideal contar con herramientas equivalentes:

1. **`engram`**: Fundamental. Provee memoria persistente a través de sesiones. Se usa para guardar contexto, decisiones de arquitectura, bugs encontrados y resúmenes de sesión. (*Protocolo estricto de uso obligatorio para mantener estado*).
2. **`context7`**: Proveedor de documentación actualizada para librerías y frameworks (React, Tailwind, Node, etc.). Sustituye búsquedas web poco fiables para sintaxis de librerías.
3. **`cloudinary`**: Permite la gestión directa de imágenes y assets del portafolio.
4. **`mongodb`**: Integración para ejecutar agregaciones y explorar la base de datos de los turnos, usuarios y servicios.
5. **`github`**: Manejo de ramas, PRs, revisión de código e issues de forma programática.

---

## 3. Workflows Disponibles

Estos son los flujos de trabajo predefinidos. Si se opera desde un entorno compatible, se deben respetar y emular estos comandos.

### `/tarea` (Planificación y Ahorro de Tokens)
Workflow para arquitecturas complejas. Un modelo de alto razonamiento (ej. Opus/Pro) planifica paso a paso, valida la spec existente (en `docs/specs/`) y hace un HARD STOP (no implementa). La implementación se delega a un modelo más rápido (ej. Flash/Sonnet). Tiene guardarraíles para escalación inmediata si ocurren errores de scope imprevisto.

### `/documentar` (Generación de Especificaciones)
Workflow para capturar el conocimiento real que vive en el código. Lee el componente, los hooks, la API y los efectos, y genera un documento estandarizado en `docs/specs/[nombre].spec.md` detallando el comportamiento por rol (Visitante, Usuario, Admin), reglas de negocio, edge cases y checklist de tests.

### `/feature` (Desarrollo en Rama Aislada)
Workflow para iniciar una mejora. Verifica la spec actual, crea una rama en git (`git checkout -b feat/...`), implementa la mejora, actualiza la spec y sube el commit. Regla de oro: NUNCA se hace merge a `main` desde este flujo; todo debe pasar por Preview/PR.

### `/deploy` y `/no-deploy` (Despliegues a Producción)
Regulan los pases a producción en Fly.io. **Regla base**: El agente NUNCA despliega de forma automática. `/no-deploy` bloquea cualquier despliegue sin revisión de variables de entorno y base de datos. `/deploy` requiere pruebas locales verdes (`npm test --watchAll=false`) y la confirmación explícita del usuario de que el backend es compatible con el frontend.

---

## 4. Skills y Especializaciones (Registro Consolidado)

El agente tiene perfiles y convenciones guardados localmente (`.agent/skills/`) y globalmente (`~/.gemini/antigravity/skills/`). 

### Skills del Proyecto (Locales - La Vin Nails)
- **`backend_expert`**: Node.js, Express, MongoDB. Manejo estandarizado de errores (`next()`, `http-errors`).
- **`frontend_expert`**: React Hooks, patrones Contenedor/Presentacional, abstracción en axios puro.
- **`mobile_ux_expert`**: Resoluciones para Safari iOS, optimización táctil.
- **`pwa_expert`**: Configuración offline-first, notificaciones Web Push, manifiestos.
- **`testing_expert`**: Estrategias para pruebas unitarias y de integración.
- **`ux-ui-design`**: Validaciones visuales y de identidad gráfica de salón de belleza premium.
- **`tailwind-css-patterns` / `vercel-composition-patterns` / `vercel-react-best-practices`**: Buenas prácticas modernas para rendimiento y estructura.
- **`seo` / `accessibility`**: Accesibilidad y posicionamiento web.

### Skills de Arquitectura (Globales - Ecosistema Estandarizado)
- **Familia SDD (`sdd-init`, `sdd-explore`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive`)**: Fases del Spec-Driven Development. Metodología oficial para llevar cambios desde la idea hasta el código de manera estructurada.
- **`judgment-day`**: Protocolo de revisión adversarial en paralelo (dos agentes evalúan y buscan debilidades en el código simultáneamente).
- **`skill-registry` / `skill-creator`**: Administración del conocimiento interno y generación de nuevas habilidades.
- **`branch-pr` / `issue-creation`**: Gestión de tareas alineadas a GitHub.

---

*Fin del documento de contexto.*
