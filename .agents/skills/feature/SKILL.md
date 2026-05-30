---
name: feature
description: >
  Inicia una nueva funcionalidad en rama aislada con SDD automático, preview de Vercel,
  y cambio de modelo (pesado planifica → ligero implementa).
  Trigger: "/feature", "nueva feature", "nueva funcionalidad", "crear feature",
  "añadir", "implementar [algo nuevo]", "quiero agregar".
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Cuándo usar este skill

`/feature` es para **nuevas funcionalidades** — cosas que NO existen en el proyecto. Si es una corrección, modificación pequeña o ajuste a algo que YA existe, usa `/tarea` en su lugar.

Actívalo cuando el usuario:
- Dice `/feature` seguido de una descripción
- Pide "añadir", "crear", "implementar" una funcionalidad nueva
- Quiere "agregar" algo que no existe (página, componente, endpoint, sistema)

---

## Workflow completo

```
/feature "descripción"
    │
    ├─► PASO 0: Inicializar SDD (si no existe)
    │
    ├─► PASO 1: Crear rama (feat/nombre)
    │
    ├─► PASO 2: SDD — Explorar (sdd-explore)
    │
    ├─► PASO 3: SDD — Proponer (sdd-propose)
    │
    ├─► PASO 4: SDD — Especificar (sdd-spec)
    │
    ├─► PASO 5: SDD — Diseñar (sdd-design)
    │
    ├─► PASO 6: SDD — Tareas (sdd-tasks)
    │
    ├─► PASO 7: HARD STOP — Handoff (cambio de modelo)
    │         │
    │         └─► [USUARIO CAMBIA A MODELO LIGERO]
    │
    ├─► PASO 8: SDD — Implementar (sdd-apply)
    │         │
    │         └─► [ESCALATION GUARDRAIL activo]
    │
    ├─► PASO 9: SDD — Verificar (sdd-verify)
    │
    ├─► PASO 10: Commit + Push → Preview
    │
    └─► PASO 11: Crear PR (opcional, con branch-pr)
```

---

## PASO 0 — Inicializar SDD (automático)

Verificar si SDD está inicializado en el proyecto. Si no existe el directorio `changes/`:

1. Cargar el skill `sdd-init`
2. Ejecutar la inicialización: detectar stack, convenciones, testing, bootstrap
3. Esto configura `changes/`, specs base, y el backend de persistencia

**Esta verificación se hace UNA sola vez por proyecto.** Si SDD ya está inicializado, saltar al Paso 1.

---

## PASO 1 — Definir y crear rama

### 1a. Nombre de la rama

Si el usuario no especificó un nombre, generar uno semántico a partir de la descripción:

```
feat/descripcion-breve-en-kebab-case
```

Ejemplos:
- `/feature notificaciones email` → `feat/notificaciones-email`
- `/feature página de testimonios` → `feat/pagina-testimonios`
- `/feature refactor autenticación` → `feat/refactor-autenticacion`

**Mostrar el nombre al usuario y pedir confirmación** antes de crear la rama.

### 1b. Verificar estado del repo

```bash
git status
```

Si hay cambios sin commitear:
- Si están relacionados con la feature → hacer commit previo o stash
- Si no están relacionados → advertir al usuario y preguntar

### 1c. Crear rama

```bash
git checkout -b feat/nombre
```

---

## PASOS 2-6 — SDD: Planificación formal

> ⚠️ **Estos pasos los ejecuta el MODELO PESADO.** No escribas código de implementación. Solo documentación, specs, y diseño.

### Paso 2 — sdd-explore

**Objetivo**: Entender el codebase antes de decidir nada.

- Leer archivos relevantes al cambio
- Identificar patrones existentes, dependencias, puntos de integración
- Documentar hallazgos en `changes/{nombre}/exploration.md`

### Paso 3 — sdd-propose

**Objetivo**: Definir QUÉ se va a hacer y POR QUÉ.

- Crear `changes/{nombre}/proposal.md`
- Incluir: problema, solución propuesta, scope, NO scope, alternativas consideradas

### Paso 4 — sdd-spec

**Objetivo**: Especificar requisitos formales con escenarios.

- Crear `changes/{nombre}/spec.md`
- Incluir: requisitos funcionales (REQ-01, REQ-02...), escenarios, criterios de aceptación, edge cases

### Paso 5 — sdd-design

**Objetivo**: Decidir arquitectura técnica.

- Crear `changes/{nombre}/design.md`
- Incluir: decisiones de arquitectura, patrones, estructura de archivos, modelos de datos, rutas API

### Paso 6 — sdd-tasks

**Objetivo**: Desglosar en tareas implementables.

- Crear `changes/{nombre}/tasks.md`
- Lista ordenada de tareas con: archivo destino, dependencias, prioridad

---

## PASO 7 — HARD STOP: Handoff

> ⚠️ **EJECUTAR SOLO SI ERES MODELO PESADO.** Si YA eres un modelo ligero, saltar al Paso 8.

Al completar todos los pasos de planificación:

1. **Generar HANDOFF.md** en `docs/handoffs/YYYY-MM-DD-nombre-feature.md` con:
   - Resumen ejecutivo
   - Decisiones de arquitectura
   - Especificaciones y criterios de aceptación
   - Plan de implementación (tareas ordenadas)
   - Contexto técnico (reglas del proyecto, dependencias, gotchas)
   - Archivos relevantes
   - Referencia a los archivos SDD en `changes/{nombre}/`

2. **DETENERSE** y mostrar este mensaje:

```
---

## ⚡ CAMBIO DE PERFIL SDD — Planificación completada

La arquitectura, specs y tareas están listas.

📄 **HANDOFF.md**: `docs/handoffs/YYYY-MM-DD-nombre-feature.md`
📁 **SDD**: `changes/{nombre}/` (proposal, spec, design, tasks)
🌿 **Rama**: `feat/{nombre}`

### Para implementar:

**Cambia de modelo en el dropdown de OpenCode**:

- De: `DeepSeek V4 Pro` (Planificación)
- A: `MiniMax M2.7` (Implementación rápida) o `DeepSeek V4 Flash` (Features gigantes)

El perfil `implement` usa modelos con límites altos (3,400 a 31,650).

Una vez cambiado, dile:

> "Ejecuta la implementación de HANDOFF.md en la rama feat/{nombre}"

¿Guardo el contexto en Engram?
```

---

## PASO 8 — SDD: Implementar (modelo ligero)

> ⚠️ **Ejecutar con MODELO LIGERO.** Si eres modelo pesado, DETENTE en el Paso 7.

### 8a. Leer HANDOFF.md

Primer paso obligatorio: leer el handoff completo para entender el plan sin repensarlo.

### 8b. Ejecutar sdd-apply

Implementar las tareas en orden, respetando dependencias. Usar el sub-agente `sdd-apply` para cada tarea o grupo de tareas.

### 8c. Escalation Guardrail (ACTIVO durante todo el paso)

Aplicar las mismas reglas de escalación de `/tarea`. Si encuentras cualquiera de estos, **DETENTE**:

| # | Criterio |
|---|----------|
| 1 | **Causa raíz desconocida** — no sabes POR QUÉ falla |
| 2 | **Impacto arquitectónico** — requiere nuevos archivos o cambiar contratos |
| 3 | **Scope overflow** — afecta >2 archivos no planeados |
| 4 | **Contradicción** — la solución invalida el plan original |
| 5 | **Reincidencia** — 2 intentos fallidos en el mismo error |

Si se cumple algún criterio:

```
---

## 🚨 ESCALACIÓN REQUERIDA

**Situación**: [error preciso]
**Por qué escalo**: [criterio]
**Lo que NO haré**: Improvisar

👉 Vuelve a un modelo potente con este contexto.
```

---

## PASO 9 — Verificar

Ejecutar `sdd-verify` para validar que la implementación coincide con las specs:

- ¿Todas las tareas están completas?
- ¿Los criterios de aceptación se cumplen?
- ¿Los tests pasan?

Si hay discrepancias:
- Pequeñas → corregir en el acto
- Grandes → evaluar si escalar

---

## PASO 10 — Commit + Push → Preview

### 10a. Verificar tests

Antes de commitear:

```bash
npm run test:run    # En web/
npm test            # En api/
```

### 10b. Commit

```bash
git add .
git commit -m "feat({scope}): {descripción}"
```

Usar conventional commits: `feat(booking): añadir selector de horarios avanzado`

### 10c. Push

```bash
git push -u origin feat/{nombre}
```

### 10d. Informar al usuario

```
---

## 🚀 Rama subida — Preview disponible

🌿 **Rama**: `feat/{nombre}`
🔗 **Preview**: Vercel generará una URL automáticamente
📋 **PR pendiente**: [decisión del usuario]

### Para validar:
1. Abre el preview de Vercel (aparecerá en el dashboard o en GitHub)
2. Prueba la funcionalidad
3. Si todo OK → dime "crear PR" y usaré `branch-pr`
4. Si hay ajustes → dime qué corregir y sigo en esta rama
```

---

## PASO 11 — Crear PR (opcional)

Cuando el usuario diga "crear PR" o "mergear":

1. Usar el skill `branch-pr` para crear el Pull Request
2. El PR incluirá: resumen de cambios, specs de SDD, preview link
3. **NUNCA hacer merge desde la terminal** — solo crear el PR en GitHub
4. El merge lo hace el usuario manualmente desde la UI de GitHub

### Después del merge

Cuando la feature se mergea a `main`:

1. Volver a `main`: `git checkout main`
2. Actualizar: `git pull origin main`
3. Ejecutar `sdd-archive` para sincronizar las delta specs con las specs principales
4. (Opcional) Eliminar la rama local: `git branch -d feat/{nombre}`

---

## Reglas de Oro

1. **NUNCA mergear a `main` desde la terminal** — solo crear PR
2. **NUNCA desplegar a producción** sin permiso explícito
3. **NUNCA escribir código de implementación en los pasos 2-6** — solo planificación
4. **SIEMPRE verificar tests antes de push**
5. **SIEMPRE respetar AGENTS.md** (JS puro, dvh, safeParseDate, try/catch, español)
6. **La rama es aislada** — no afecta a producción hasta que el PR se mergea

---

## Comparación con el original de Antigravity

| Elemento | `/feature` Antigravity | `/feature` OpenCode |
|----------|----------------------|---------------------|
| Rama | ✅ `feat/nombre` | ✅ `feat/nombre` |
| SDD | ❌ No | ✅ Automático (explore → archive) |
| Planificación | Manual | ✅ Formal con proposal + spec + design |
| Handoff | Menciona usar `/tarea` | ✅ Integrado (Paso 7) |
| Escalation guardrail | ❌ No | ✅ 5 criterios (Paso 8c) |
| Preview Vercel | ✅ Push → preview | ✅ Push → preview |
| PR | Manual | ✅ `branch-pr` skill |
| Documentación | Solo código | ✅ SDD + HANDOFF.md + Engram |
| Verificación | Manual | ✅ `sdd-verify` automático |
