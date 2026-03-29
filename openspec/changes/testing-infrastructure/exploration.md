## Exploration: Infraestructura de Testing (La Vin Nails)

### Current State

**La cobertura de testing es prácticamente CERO en ambos lados del stack.**

#### Frontend (`web/`)
- Jest y React Testing Library están instalados (vienen con CRA).
- Existe un ÚNICO archivo de test: `App.test.js`, que es el boilerplate de CRA buscando "learn react" — **nunca fue actualizado** y actualmente **FALLARÍA** porque `App.js` ya no renderiza ese texto.
- No hay tests para: guards (`PrivateRoute`, `UnlogedRoute`), hooks (`UseTransformDate`), contextos (`AuthStore`), servicios API (`base-api.js`, `dates.js`, `users.js`...), ni para ningún componente de página.

#### Backend (`api/`)
- Jest está instalado como devDependency con `testEnvironment: "node"`.
- Hay un script `"test"` ausente en `package.json` (no existe `npm test`).
- **CERO archivos de test**. Ningún controlador, modelo, ni middleware tiene cobertura.
- No hay configuración de base de datos de pruebas (las pruebas impactarían MongoDB de producción directamente si no se configura).

### Affected Areas

#### Frontend — Prioridad Alta (impacto directo en la clienta)
- `web/src/guards/PrivateRoute.js` — Lógica crítica de autenticación y control de roles.
- `web/src/guards/UnlogedRoute.js` — Guard inverso para rutas de restauración de contraseña.
- `web/src/contexts/AuthStore.js` — Gestión de sesión, localStorage, logout. Si esto falla, nadie puede reservar.
- `web/src/services/base-api.js` — Interceptor de Axios con lógica de token JWT y redirect en 401.
- `web/src/hooks/UseTransformDate.js` — Transformación de fechas (zona de alto riesgo en Safari iOS).

#### Backend — Prioridad Alta (integridad de datos)
- `api/controllers/dates.controllers.js` — CRUD de citas: el core del negocio.
- `api/controllers/users.controllers.js` — Registro, login, JWT.
- `api/controllers/turns.controllers.js` — Gestión de turnos del salón.
- `api/models/*.model.js` — Validaciones de Mongoose (6 modelos).

### Approaches

1. **Smoke Tests Mínimos (Solo lo crítico)** — Crear tests unitarios solo para las piezas que, si se rompen, tumban la app: Guards, AuthStore, interceptor de Axios, y los endpoints de login/citas en el backend.
   - Pros: Rápido de implementar (1 sesión), cubre los puntos de fallo más probables, no requiere dependencias nuevas.
   - Cons: No cubre componentes de UI ni flujos completos de reservas.
   - Effort: Low

2. **Cobertura Estratégica por Capas** — Tests unitarios para lógica pura (guards, hooks, servicios API del front, controladores del back) + tests de integración para los endpoints críticos del API con una BD de pruebas en memoria (`mongodb-memory-server`).
   - Pros: Red de seguridad real. Si algo se rompe al meter PWA o cualquier feature, lo detectamos antes de que llegue a producción. La BD en memoria evita tocar datos reales.
   - Cons: Requiere instalar `mongodb-memory-server` como devDependency en `api/`. Más tiempo de setup inicial (2-3 sesiones).
   - Effort: Medium

3. **Full Coverage (E2E incluido)** — Todo lo anterior + tests end-to-end con Cypress/Playwright simulando el flujo completo de una clienta reservando.
   - Pros: Máxima confianza. Detectaría bugs de Safari/iOS en CI.
   - Cons: Excesivo para el tamaño actual del proyecto. Setup pesado, mantenimiento alto.
   - Effort: High

### Recommendation

**Opción 2: Cobertura Estratégica por Capas.** 

Razones:
- La Opción 1 es demasiado superficial: si solo cubrimos guards y el interceptor, no detectaríamos un bug en el controlador de citas que corrompa datos.
- La Opción 3 es overkill para un proyecto con una sola desarrolladora/usuario admin.
- La Opción 2 nos da una **red de seguridad real** sin sobreingeniería. Con `mongodb-memory-server` podemos probar los endpoints del API sin arriesgar la BD de producción ni necesitar un MongoDB local instalado.

### Plan de Implementación Sugerido

#### Fase 1: Infraestructura (Setup)
- Configurar scripts `test` en ambos `package.json`.
- Instalar `mongodb-memory-server` como devDependency en `api/`.
- Crear helpers: `test-utils.js` (frontend, con providers), `db-handler.js` (backend, con BD en memoria).
- Borrar el `App.test.js` roto de CRA.

#### Fase 2: Backend Tests (Los cimientos)
- Tests de modelos (validaciones de Mongoose).
- Tests de controladores críticos (auth, dates, turns).
- Tests del middleware de autenticación JWT.

#### Fase 3: Frontend Tests (La fachada)
- Tests de guards (`PrivateRoute`, `UnlogedRoute`).
- Tests de `AuthStore` (login, logout, persistencia en localStorage).
- Tests del interceptor de Axios (`base-api.js`).
- Tests del hook `UseTransformDate` (crítico para Safari).

### Risks
- **`mongodb-memory-server` en Windows**: A veces da problemas de descarga del binario en Windows. Hay que verificar compatibilidad.
- **Mocks de localStorage**: `jsdom` (el entorno de Jest en CRA) soporta `localStorage`, pero hay que tener cuidado con la limpieza entre tests para evitar estados compartidos.
- **El test de `AuthStore` requiere wrapper de Router**: porque usa `useNavigate`, necesitamos un `MemoryRouter` en el test.

### Ready for Proposal
Yes — El siguiente paso es redactar la propuesta formal con los archivos exactos que crearemos y las dependencias que instalaremos.
