---
name: testing_expert
description: Estrategias de testing para JavaScript Puro en el stack MERN de La Vin Nails.
---

# Habilidad Testing Expert (Jest / React Testing Library)

## 1. Filosofía de Testing

Los tests NO son un lujo, son los CIMIENTOS de un edificio. Sin ellos, cada nueva feature es un terremoto potencial.

- **Testea comportamiento, NO implementación**: No compruebes que un `useState` cambió internamente. Comprueba que al hacer clic en "Reservar", aparece el mensaje de confirmación.
- **Pirámide de Testing**: Muchos tests unitarios (rápidos), algunos de integración (API + BD), muy pocos E2E (lentos y frágiles).

## 2. Herramientas del Proyecto

### Frontend (`web/`)
- **Jest**: Runner de tests (viene con CRA, no requiere configuración extra).
- **React Testing Library (RTL)**: Renderizado de componentes y queries por rol/texto.
- **`@testing-library/user-event`**: Simulación realista de interacciones (click, type).

### Backend (`api/`)
- **Jest**: Runner de tests (`testEnvironment: "node"` ya configurado).
- **`mongodb-memory-server`**: Base de datos MongoDB in-memory para tests de integración. NUNCA testees contra la BD real.

## 3. Patrones Obligatorios

### Test Helper del Frontend (`web/src/__tests__/test-utils.js`)
Siempre renderiza componentes dentro de los providers necesarios:
```javascript
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-tailwind/react';
import AuthStore from '../contexts/AuthStore';

/**
 * Renderiza un componente con todos los providers necesarios.
 * @param {React.ReactElement} ui - Componente a renderizar.
 * @param {Object} options - Opciones de render, incluyendo `route` para MemoryRouter.
 */
export function renderWithProviders(ui, { route = '/', ...options } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <AuthStore>{ui}</AuthStore>
      </ThemeProvider>
    </MemoryRouter>,
    options
  );
}
```

### Test Helper del Backend (`api/__tests__/db-handler.js`)
Conecta/desconecta la BD en memoria entre suites:
```javascript
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports.connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
};

module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
```

### Limpieza entre Tests
- **SIEMPRE** limpia `localStorage` en `afterEach` del frontend.
- **SIEMPRE** limpia las colecciones de MongoDB en `afterEach` del backend.
- No dejes estado sucio. Cada test debe poder correr de forma aislada.

## 4. Convenciones de Archivos

- Frontend: `web/src/__tests__/<modulo>.test.js` (prefijo de carpeta `__tests__`).
- Backend: `api/__tests__/<modulo>.test.js`.
- Nombre del test: Describir el COMPORTAMIENTO, no la función.
  - ✅ `"redirige al login si el usuario no está autenticado"`
  - ❌ `"PrivateRoute test 1"`

## 5. Reglas iOS/Safari en Tests

Dado que Safari es nuestro mayor punto de fallo:
- **SIEMPRE** testea el hook `UseTransformDate` con formatos de fecha problemáticos (`"2024-03-15"` como string).
- Valida que NO se usa `new Date("string")` directo en ningún componente que se testee. Usa `parseISO` de `date-fns`.
