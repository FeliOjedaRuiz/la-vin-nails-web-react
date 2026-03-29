# Proposal: Testing Infrastructure

## Intent

El proyecto La Vin Nails tiene **CERO cobertura de tests funcionales**. Cualquier cambio futuro (PWA, nuevas features, refactors) se ejecuta sin red de seguridad. Los puntos de fallo más críticos —autenticación JWT, guards de rutas, gestión de citas, y transformación de fechas (Safari iOS)— no tienen validación automática alguna.

## Scope

### In Scope
- Configuración de scripts `test` en ambos `package.json` (front y back).
- Instalación de `mongodb-memory-server` en `api/` para tests de integración sin tocar la BD real.
- Creación de helpers reutilizables: `renderWithProviders` (front) y `db-handler.js` (back).
- Tests unitarios del backend: modelos Mongoose, controladores de auth/citas/turnos, middleware JWT.
- Tests unitarios del frontend: guards (`PrivateRoute`, `UnlogedRoute`), `AuthStore`, interceptor Axios, hook `UseTransformDate`.
- Eliminación del `App.test.js` roto de CRA.

### Out of Scope
- Tests de componentes de página completos (HomePage, ServicesPage, etc.).
- Tests E2E con Cypress/Playwright.
- Integración CI/CD (GitHub Actions) — se hará en un cambio posterior.

## Approach

Cobertura Estratégica por Capas (Opción 2 de la exploración):
1. **Setup**: Infraestructura, helpers, scripts.
2. **Backend Tests**: Modelos → Controladores → Middleware (de dentro hacia fuera).
3. **Frontend Tests**: Guards → Context → Services → Hooks.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `api/package.json` | Modified | Añadir script `test`, instalar `mongodb-memory-server` |
| `api/__tests__/db-handler.js` | New | Helper de BD en memoria |
| `api/__tests__/models/` | New | Tests de validación de modelos Mongoose |
| `api/__tests__/controllers/` | New | Tests de endpoints críticos (auth, dates, turns) |
| `web/package.json` | Modified | Verificar script `test` existente |
| `web/src/__tests__/test-utils.js` | New | Helper `renderWithProviders` con Router+Theme+Auth |
| `web/src/__tests__/guards/` | New | Tests de PrivateRoute y UnlogedRoute |
| `web/src/__tests__/contexts/` | New | Tests de AuthStore (login, logout, localStorage) |
| `web/src/__tests__/services/` | New | Tests del interceptor Axios (base-api.js) |
| `web/src/__tests__/hooks/` | New | Tests de UseTransformDate (validación Safari) |
| `web/src/App.test.js` | Removed | Borrar test roto de CRA |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `mongodb-memory-server` falla en Windows | Medium | Verificar descarga del binario; fallback a `globalConfig` si falla |
| Tests de AuthStore requieren Router mock | Low | Helper `renderWithProviders` ya lo contempla con `MemoryRouter` |
| Estado compartido entre tests via localStorage | Medium | `afterEach(() => localStorage.clear())` obligatorio |

## Rollback Plan

Todo el testing es **aditivo** (solo crea archivos nuevos y añade devDependencies). Para revertir:
1. Eliminar carpetas `api/__tests__/` y `web/src/__tests__/`.
2. `npm uninstall mongodb-memory-server` en `api/`.
3. Restaurar `App.test.js` original si se desea (innecesario).

## Dependencies

- `mongodb-memory-server` (devDependency en `api/`).
- No se requieren dependencias nuevas en `web/` (Jest y RTL ya están instalados vía CRA).

## Success Criteria

- [ ] `npm test` en `web/` ejecuta sin errores y pasa todos los tests.
- [ ] `npm test` en `api/` ejecuta sin errores, conecta a BD en memoria, y pasa todos los tests.
- [ ] Guards de autenticación tienen cobertura (usuario autenticado, no autenticado, rol incorrecto).
- [ ] Los controladores de citas y auth tienen tests de integración contra MongoDB in-memory.
- [ ] El hook `UseTransformDate` se valida contra formatos de fecha problemáticos de Safari.
