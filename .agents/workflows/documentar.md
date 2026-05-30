---
description: Genera la especificación funcional de una página o feature y la guarda en docs/specs/. Úsalo para documentar funcionalidad existente o nueva.
---

# Workflow: Documentación Funcional (/documentar)

Este workflow captura el conocimiento real que vive en el código — lógica de negocio, reglas implícitas, comportamientos por rol — y lo convierte en una especificación funcional escrita que no puede perderse aunque cambie el código o el equipo.

> **Nota de contexto**: Este proyecto fue construido durante años sin asistentes de IA y sin tests que respalden el comportamiento. Cada spec que generas aquí preserva conocimiento que hasta ahora solo existía en el código y en la memoria de quien lo construyó. Trátalo con el respeto que merece.

---

## Pasos del Workflow

### 1. Identificar el Target

Si el usuario no especificó qué documentar, pregunta:
> "¿Qué página o feature querés documentar? (ej: `SchedulePageGuest`, el flujo de reserva de turno, el panel admin de citas)"

Determina:
- El archivo de página principal (ej: `web/src/pages/SchedulePageGuest.jsx`)
- La ruta en la app (ej: `/agenda`)
- Los roles que interactúan con esa vista (visitante, usuario, admin)

### 2. Leer el Código en Profundidad

Lee los siguientes archivos antes de escribir una sola línea de spec:

1. **El componente de página principal** — entiende el flujo completo
2. **Todos los componentes que importa** — no asumas, léelos
3. **Los hooks custom que usa** — ahí vive la lógica real
4. **Las llamadas a API que hace** — endpoints, métodos, parámetros
5. **El controlador de backend correspondiente** (si es relevante) — para entender validaciones y reglas del servidor

> ⚠️ **Regla crítica**: No documentes lo que crees que hace el código. Documenta lo que el código REALMENTE hace. La diferencia entre ambas cosas es exactamente lo que este workflow existe para capturar.

### 3. Verificar si ya existe una spec

Comprueba si existe `docs/specs/[nombre-del-componente].spec.md`:
- Si existe: léela primero, y decide si actualizas o extiendes
- Si no existe: créala desde cero con el formato del paso 4

### 4. Generar la Spec Funcional

Crea el archivo `docs/specs/[nombre-kebab-case].spec.md` con exactamente esta estructura:

```markdown
# [Nombre Legible de la Página o Feature]

## Metadata
- **Ruta en la app**: `/ruta`
- **Componente principal**: `NombreComponente.jsx`
- **Archivos relacionados**: lista de componentes, hooks, servicios que participan
- **Última actualización**: YYYY-MM-DD
- **Roles que interactúan**: visitante | usuario | admin

---

## Descripción General
Qué hace esta página/feature en 2-4 líneas. Sin tecnicismos — descríbelo como se lo explicarías a alguien que usa el negocio.

---

## Comportamiento por Rol

### 👤 Visitante (sin sesión iniciada)
- Qué puede ver
- Qué puede hacer
- Qué NO puede hacer (restricciones explícitas)
- Redirecciones o bloqueos que se aplican

### 🔑 Usuario autenticado
- Diferencias con el visitante
- Acciones disponibles
- Restricciones específicas del rol

### 🛡️ Administrador
- Capacidades exclusivas
- Diferencias con usuario estándar
- Acciones de gestión disponibles

> Si algún rol no aplica a esta página, elimina esa sección e indica por qué (ej: "Esta página solo es accesible para usuarios autenticados").

---

## Reglas de Negocio

Lista numerada de reglas explícitas. Cada regla debe responder: **qué**, **por qué**, y si es relevante, **desde cuándo** o **bajo qué condición**.

1. **[Nombre de la regla]**: Descripción de la regla. Si tiene una condición temporal o contextual, explícala.
2. ...

> Si una regla fue añadida para corregir un comportamiento incorrecto previo, anótalo. Esa historia importa.

---

## Componentes Utilizados

| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|
| `Componente.jsx` | Qué hace en el contexto de esta página |

---

## Llamadas a API

| Endpoint | Método | Cuándo se llama | Qué retorna |
|----------|--------|-----------------|-------------|
| `/api/ruta` | GET | Al montar el componente | Lista de X |

---

## Estado y Efectos Secundarios

Describe el estado local importante y los efectos (`useEffect`) relevantes. No copies el código — explica el PROPÓSITO de cada efecto.

- **`[nombreEstado]`**: Para qué se usa, cuándo cambia
- **Efecto de X**: Se ejecuta cuando Y, para hacer Z

---

## Casos Edge y Gotchas

Lo que no es obvio pero importa. Cada punto debería comenzar con la condición y su consecuencia.

- **Si no hay datos**: Qué muestra la UI
- **Safari iOS**: Restricciones conocidas (viewport, zoom, etc.)
- **Timezone**: Si hay lógica de fechas, cómo se maneja la zona horaria
- **[Otro caso]**: ...

---

## Tests Derivados (Checklist)

Lista de casos de prueba que se deberían implementar, agrupados por rol. Márcalos con `[ ]` para que puedan irse completando.

### Visitante
- [ ] **[Descripción del test]**: Dado X, cuando Y, entonces Z

### Usuario autenticado
- [ ] ...

### Administrador
- [ ] ...

### Reglas de negocio
- [ ] **[Regla N]**: Verificar que [condición] produce [resultado esperado]

---

## Historial de Cambios Relevantes
> Solo anota cambios que hayan modificado comportamiento observable, no refactors internos.

| Fecha | Cambio | Razón |
|-------|--------|-------|
| YYYY-MM-DD | Descripción del cambio | Por qué se hizo |
```

### 5. Actualizar el índice de specs

Verifica si existe `docs/specs/README.md`. Si existe, añade la nueva spec al índice. Si no existe, créalo.

El índice debe listar todas las specs existentes con: nombre, ruta en la app, y fecha de última actualización.

### 6. Registrar en memoria (Engram)

Guarda en engram que esta página fue documentada:

```
título: "Spec funcional generada: [NombrePágina]"
tipo: discovery
contenido:
  What: Spec funcional de [NombrePágina] creada/actualizada
  Why: Preservar el comportamiento documentado de una página construida sin tests
  Where: docs/specs/[nombre].spec.md
  Learned: [Cualquier hallazgo relevante encontrado al leer el código]
```

### 7. Comunicar el resultado

Al terminar, informa al usuario:
- Qué archivo spec se creó/actualizó
- Cuántas reglas de negocio se documentaron
- Cuántos tests derivados se identificaron
- Si encontraste algún comportamiento en el código que no es obvio y merecería ser refactorizado o revisado (sin hacer el cambio — solo señalarlo)

---

## Cuándo usar este workflow

- Cuando acabas de implementar o restaurar una funcionalidad
- Cuando vas a tocar código de una página por primera vez y quieres entender qué hace antes de cambiar nada
- Al inicio de cada semana, para documentar una sección nueva de la app
- Antes de escribir tests — la spec es el contrato que los tests validan
