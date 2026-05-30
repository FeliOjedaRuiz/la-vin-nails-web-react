# Guía de Documentación Completa — La Vin Nails

Este documento es la especificación que cualquier agente (OpenCode, Antigravity, o un desarrollador) debe seguir para documentar sistemáticamente el proyecto La Vin Nails.

> **Contexto**: Este proyecto fue construido durante años sin asistentes de IA y sin tests. La documentación es el primer paso para poder mejorar, testear y refactorizar con confianza.

---

## 1. Formato de Specs (Fuente de Verdad)

El formato oficial vive en el workflow `/documentar` y se guarda en `docs/specs/[nombre-kebab-case].spec.md`. La estructura completa es:

```markdown
# [Nombre Legible de la Página o Feature]

## Metadata
- **Ruta en la app**: `/ruta`
- **Componente principal**: `NombreComponente.jsx`
- **Archivos relacionados**: componentes, hooks, servicios
- **Última actualización**: YYYY-MM-DD
- **Roles que interactúan**: visitante | usuario | admin

---

## Descripción General
2-4 líneas sin tecnicismos.

---

## Comportamiento por Rol

### 👤 Visitante (sin sesión)
### 🔑 Usuario autenticado
### 🛡️ Administrador

(Eliminar secciones de roles que no apliquen, indicando por qué)

---

## Reglas de Negocio
Lista numerada. Cada regla: **qué**, **por qué**, **bajo qué condición**.

---

## Componentes Utilizados
| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|

---

## Llamadas a API
| Endpoint | Método | Cuándo se llama | Qué retorna |
|----------|--------|-----------------|-------------|

---

## Estado y Efectos Secundarios
- **`[estado]`**: Para qué se usa, cuándo cambia
- **Efecto de X**: Se ejecuta cuando Y, para hacer Z

---

## Casos Edge y Gotchas
- **Safari iOS**: ...
- **Si no hay datos**: ...
- **Timezone**: ...

---

## Tests Derivados (Checklist)
### Visitante
- [ ] Dado X, cuando Y, entonces Z
### Usuario autenticado
- [ ] ...
### Reglas de negocio
- [ ] ...

---

## Historial de Cambios Relevantes
| Fecha | Cambio | Razón |
|-------|--------|-------|
```

---

## 2. Estado Actual de Documentación

### ✅ Ya documentado (3 de 16 páginas)

| Spec existente | Componente | Ruta |
|----------------|-----------|------|
| `schedule-page-guest.spec.md` | `SchedulePageGuest.jsx` | `/schedule` |
| `schedule-page-admin.spec.md` | `SchedulePageAdmin.jsx` | `/admin-schedule` |
| `turn-detail-page.spec.md` | `TurnDetailPage.jsx` | `/turns/:id` |

### ❌ Sin documentar — Frontend (13 páginas)

| Prioridad | Componente | Ruta estimada | Complejidad |
|-----------|-----------|---------------|-------------|
| 🔴 Alta | `ServicesPage.jsx` | `/services` | Alta (12KB, integración Notion) |
| 🔴 Alta | `NewDatePage.jsx` | `/new-date` | Alta (flujo de reserva) |
| 🔴 Alta | `NewDateAdminPage.jsx` | `/admin/new-date` | Alta (reserva admin) |
| 🔴 Alta | `LoginPage.jsx` | `/login` | Media (auth JWT) |
| 🟡 Media | `ProfilePage.jsx` | `/profile` | Media (6KB) |
| 🟡 Media | `ClientProfilePage.jsx` | `/clients/:id` | Media (5.7KB) |
| 🟡 Media | `RegisterPage.jsx` | `/register` | Baja |
| 🟡 Media | `HomePage.jsx` | `/` | Baja-Media |
| 🟡 Media | `AccountingPage.jsx` | `/accounting` | Baja |
| 🟢 Baja | `RestorePasswordPage.jsx` | `/restore-password` | Baja |
| 🟢 Baja | `SendRestoreEmailPage.jsx` | `/send-restore-email` | Baja |
| 🟢 Baja | `ErrorPage.jsx` | `/error` o `*` | Baja |
| 🟢 Baja | `AdminPage.jsx` | `/admin` | Baja (dashboard/layout) |

### ❌ Sin documentar — Backend

| Prioridad | Archivo | Dominio |
|-----------|---------|---------|
| 🔴 Alta | `turns.controllers.js` | Turnos (lógica core) |
| 🔴 Alta | `dates.controllers.js` | Citas (reservas) |
| 🔴 Alta | `users.controllers.js` | Auth, perfiles |
| 🟡 Media | `photos.controllers.js` | Portafolio + Cloudinary |
| 🟡 Media | `services.controllers.js` | Catálogo Notion |
| 🟡 Media | `expenses.controllers.js` | Contabilidad |
| 🟢 Baja | `push.controllers.js` | Notificaciones push |

### ❌ Sin documentar — Modelos (Schemas)

| Modelo | Dominio |
|--------|---------|
| `user.model.js` | Usuarios, roles, auth |
| `turn.model.js` | Turnos de trabajo |
| `date.model.js` | Citas/reservas |
| `service.model.js` | Servicios del catálogo |
| `photo.model.js` | Fotos del portafolio |
| `expense.model.js` | Gastos/contabilidad |
| `push-subscription.model.js` | Suscripciones push |

### ❌ Sin documentar — Middlewares

| Archivo | Función |
|---------|---------|
| `secure.mid.js` | Auth JWT, verificación de roles |
| `dates.mid.js` | Validaciones de citas |
| `turns.mid.js` | Validaciones de turnos |
| `users.mid.js` | Validaciones de usuarios |
| `photos.mid.js` | Validaciones de fotos |
| `expenses.mid.js` | Validaciones de gastos |

### ❌ Sin documentar — Infraestructura Frontend

| Archivo/Directorio | Función |
|---------------------|---------|
| `AuthStore.js` (context) | Estado global de autenticación |
| `base-api.js` (service) | Configuración Axios base |
| `usePushNotifications.js` (hook) | Lógica de notificaciones push |
| `UseTransformDate.js` (hook) | Transformación de fechas |
| `service-worker.js` | PWA, cache offline |
| `App.js` | Routing, guards, layout |
| 22 carpetas en `components/` | Componentes reutilizables |

---

## 3. Plan de Documentación Paso a Paso

### Orden de ejecución recomendado

Seguir este orden maximiza el valor de cada spec porque cada paso construye contexto para el siguiente.

#### Fase 1: Fundamentos (entender PRIMERO, documentar DESPUÉS)

Estos archivos son dependencias de TODO lo demás. Documéntalos antes de tocar las páginas.

```
Paso 1 → Modelos: user.model.js, date.model.js, turn.model.js, service.model.js
Paso 2 → Auth: secure.mid.js + AuthStore.js + base-api.js
Paso 3 → Modelos secundarios: photo.model.js, expense.model.js, push-subscription.model.js
```

**Formato para modelos** (`docs/specs/models/[nombre].model.spec.md`):

```markdown
# Modelo: [NombreModelo]

## Schema
| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|

## Índices
Lista de índices definidos y su propósito.

## Virtuals / Methods / Statics
Lista de métodos custom del schema y qué hacen.

## Validaciones
Reglas de validación a nivel schema.

## Relaciones
Con qué otros modelos se relaciona (refs).
```

**Formato para middlewares** (`docs/specs/middlewares/[nombre].mid.spec.md`):

```markdown
# Middleware: [Nombre]

## Funciones exportadas
| Función | Parámetros | Qué valida/hace | Respuesta en error |
|---------|------------|-----------------|-------------------|

## Dependencias
Qué modelos o servicios usa internamente.
```

**Formato para infraestructura frontend** (`docs/specs/infra/[nombre].spec.md`):

```markdown
# [Nombre del módulo]

## Responsabilidad
Qué problema resuelve en 2-3 líneas.

## API pública
| Export | Tipo | Descripción |
|--------|------|-------------|

## Dependencias
De qué depende (contextos, servicios, etc.)

## Comportamiento
- Describe flujos, interceptores, side effects relevantes.

## Gotchas
- Quirks conocidos, especialmente para Safari iOS.
```

#### Fase 2: Backend (controllers)

```
Paso 4 → users.controllers.js
Paso 5 → dates.controllers.js
Paso 6 → turns.controllers.js
Paso 7 → services.controllers.js
Paso 8 → photos.controllers.js
Paso 9 → expenses.controllers.js + push.controllers.js
```

**Formato para controllers** (`docs/specs/controllers/[nombre].controller.spec.md`):

```markdown
# Controller: [Dominio]

## Endpoints

### [MÉTODO] /ruta
- **Middleware**: lista de middlewares que se aplican
- **Body/Query esperado**: campos y tipos
- **Lógica**: qué hace paso a paso (sin copiar código)
- **Respuesta exitosa**: status code + shape del response
- **Errores posibles**: status codes + condiciones

## Reglas de negocio
Lista numerada de reglas que aplican a nivel servidor.

## Tests derivados
- [ ] ...
```

#### Fase 3: Frontend — Páginas (spec funcional completa)

Seguir el formato de la sección 1 de este documento. Orden por prioridad:

```
Paso 10 → ServicesPage.jsx (la más compleja, integración Notion)
Paso 11 → NewDatePage.jsx (flujo de reserva — core del negocio)
Paso 12 → NewDateAdminPage.jsx
Paso 13 → LoginPage.jsx
Paso 14 → ProfilePage.jsx
Paso 15 → ClientProfilePage.jsx
Paso 16 → HomePage.jsx
Paso 17 → RegisterPage.jsx
Paso 18 → AccountingPage.jsx
Paso 19 → AdminPage.jsx
Paso 20 → RestorePasswordPage.jsx + SendRestoreEmailPage.jsx + ErrorPage.jsx
```

#### Fase 4: Componentes reutilizables

Documentar las 22 carpetas de `web/src/components/`. Priorizar los que son compartidos por múltiples páginas.

**Formato para componentes** (`docs/specs/components/[nombre].component.spec.md`):

```markdown
# Componente: [Nombre]

## Props
| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|

## Comportamiento
Qué renderiza y bajo qué condiciones.

## Usado en
Lista de páginas/componentes que lo consumen.

## Gotchas
Particularidades (Safari iOS, responsividad, etc.)
```

#### Fase 5: App.js y Routing

Documentar la estructura de rutas, guards, y layout general en `docs/specs/infra/app-routing.spec.md`.

---

## 4. Reglas para el agente documentador

### HACER
1. **Leer el código REAL** antes de documentar. No asumir basándote en nombres.
2. **Leer los imports** — seguir la cadena: página → componentes → hooks → servicios → controllers.
3. **Documentar comportamiento observable**, no intención supuesta.
4. **Actualizar `docs/specs/README.md`** después de crear cada spec nueva.
5. **Crear las subcarpetas** `docs/specs/models/`, `docs/specs/middlewares/`, `docs/specs/controllers/`, `docs/specs/infra/`, `docs/specs/components/` según se necesiten.
6. **Anotar gotchas de Safari iOS** — este proyecto es Mobile-First, cualquier quirk encontrado DEBE documentarse.
7. **Incluir tests derivados** — cada spec debe terminar con una checklist de tests posibles.

### NO HACER
1. **NO modificar código**. Solo leer y documentar.
2. **NO inventar comportamiento** que no esté en el código.
3. **NO copiar bloques de código** en la spec. Explicar el propósito, no el código.
4. **NO documentar más de 2-3 specs por sesión** para mantener calidad.
5. **NO saltar la lectura de archivos relacionados**. Si una página usa un hook, LEER el hook.
6. **NO crear specs vacías o con plantilla sin rellenar**. Cada spec debe tener contenido real.

---

## 5. Cómo empezar (instrucción para OpenCode)

Copia y pega este prompt al iniciar cada sesión de documentación:

```
Soy tu guía de documentación. Lee el archivo `docs/DOCUMENTATION_GUIDE.md` completo.
Tu tarea es documentar el proyecto La Vin Nails siguiendo el plan paso a paso.
Verifica en `docs/specs/README.md` qué ya está documentado y continúa con el siguiente
paso pendiente. Recuerda: LEE el código real antes de escribir la spec.
No modifiques código, solo documenta.
```

Después de cada spec generada, pide al agente:
1. Que actualice el README.md del índice de specs
2. Que te diga cuál es el siguiente paso
3. Que resuma hallazgos importantes encontrados en el código

---

## 6. Verificación de calidad

Después de que OpenCode genere una spec, hacé estas preguntas de control:

- [ ] ¿La spec tiene TODAS las secciones del formato?
- [ ] ¿Los endpoints listados coinciden con los que realmente usa el código?
- [ ] ¿Los roles documentados son correctos para esta vista?
- [ ] ¿Los tests derivados cubren los edge cases mencionados?
- [ ] ¿Se actualizó el README.md del índice?

---

*Creado: 2026-05-28. Última actualización: 2026-05-28.*
