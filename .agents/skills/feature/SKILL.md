---
name: feature
description: >
  Disparador para crear funcionalidades NUEVAS en rama aislada. Asume proceso
  mediano o grande desde el inicio: rama → SDD → handoff → apply → verify →
  push → PR. Trigger: "/feature", "nueva feature", "nueva funcionalidad",
  "crear feature", "añadir [algo nuevo]", "implementar [funcionalidad nueva]".
  Funciona en OpenCode (con sub-agentes) y Antigravity (single-agent).
  NO usar para fixes o modificaciones a cosas existentes — eso es /tarea.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "2.0"
---

## Cuándo usar este skill

`/feature` es para **crear funcionalidades NUEVAS** — cosas que NO existen
en el proyecto. Si es una corrección, modificación, o ajuste a algo que YA
existe, usá `/tarea` en su lugar.

Activá este skill cuando el usuario:
- Dice `/feature` seguido de una descripción
- Pide "añadir", "crear", "implementar" una funcionalidad nueva
- Quiere "agregar" algo que no existe (página, componente, endpoint, sistema)

**Diferencia con `/tarea`**: `/feature` **asume desde el inicio que el
proceso es mediano o grande** (no trivial casi nunca) y dispara rama aislada
+ SDD + PR por default. `/tarea` clasifica el tamaño y adapta la profundidad.

---

## Workflow agnóstico

```
/feature "descripción"
    │
    ├─► 0. Inicializar SDD (si no existe en el proyecto)
    ├─► 1. Crear rama aislada (feat/nombre-kebab)
    ├─► 2. Explorar (qué hay, qué se integra, qué patrones usar)
    ├─► 3. SDD: propose → spec → design → tasks
    ├─► 4. Generar HANDOFF.md en docs/handoffs/ (si el plan lo amerita)
    ├─► 5. Implementar (apply) respetando tasks y dependencias
    ├─► 6. Verificar (verify)
    ├─► 7. Commit conventional + push a la rama
    └─► 8. PR (branch-pr) — default, no opcional
```

---

## Paso 0 — Inicializar SDD (una sola vez por proyecto)

Verificar si SDD está inicializado (directorio `openspec/` o `changes/`
existente). Si no:

1. Cargar el skill `sdd-init`
2. Ejecutar la inicialización: detectar stack, convenciones, testing, bootstrap

Si ya está inicializado, saltar al Paso 1.

---

## Paso 1 — Crear rama aislada

### Nombre de la rama

Generar nombre semántico kebab-case a partir de la descripción:

```
feat/descripcion-breve-en-kebab-case
```

Ejemplos:
- `/feature notificaciones email` → `feat/notificaciones-email`
- `/feature página de testimonios` → `feat/pagina-testimonios`
- `/feature refactor autenticación` → `feat/refactor-autenticacion`

**Mostrar el nombre al usuario y pedir confirmación** antes de crear.

### Verificar estado del repo

```bash
git status
```

Si hay cambios sin commitear:
- Si están relacionados con la feature → commit previo o stash
- Si no → advertir al usuario y preguntar

### Crear la rama

```bash
git checkout -b feat/nombre
```

---

## Paso 2 — Explorar

**Objetivo**: Entender el codebase antes de proponer nada.

- Leer archivos relevantes al cambio.
- Identificar patrones existentes, dependencias, puntos de integración.
- Detectar convenciones del proyecto (estructura de carpetas, naming, testing).
- Documentar hallazgos en el artefacto de explore.

**Output**: artefacto `exploration.md` o equivalente (según el skill SDD del
proyecto).

---

## Paso 3 — SDD completo

Ejecutar las fases SDD en orden:

### 3a. Propose
- Problema, solución propuesta, scope, NO scope, alternativas consideradas.

### 3b. Spec
- Requisitos funcionales (REQ-01, REQ-02...), escenarios, criterios de
  aceptación, edge cases.

### 3c. Design
- Decisiones de arquitectura, patrones, estructura de archivos, modelos de
  datos, rutas API.

### 3d. Tasks
- Lista ordenada de tareas con: archivo destino, dependencias, prioridad.

> **El modelo que planifica NO escribe código de implementación.** Solo
> documentación, specs y diseño. Si el plan lo amerita, generar HANDOFF.md
> en `docs/handoffs/YYYY-MM-DD-nombre-feature.md` para el implementador.

---

## Paso 4 — HANDOFF.md (si aplica)

Generar el HANDOFF.md con la plantilla en
`.agents/skills/tarea/assets/handoff-template.md`. Incluir:

- Resumen ejecutivo
- Decisiones de arquitectura
- Especificaciones y criterios de aceptación
- Plan de implementación (tareas ordenadas)
- Contexto técnico (reglas del proyecto, dependencias, gotchas)
- Archivos relevantes

**En OpenCode**: el orchestrator decide si lanza el sub-agente de apply con
el HANDOFF.md en su prompt. **No requiere cambio de modelo manual**.

**En Antigravity**: indicarle al usuario "cambiar a modelo ligero" en el
dropdown antes de implementar.

---

## Paso 5 — Implementar (apply)

Implementar las tareas en orden, respetando dependencias. Aplicar el
**Escalation Guardrail** durante todo el paso (ver más abajo).

- Cada tarea con su commit (conventional commits).
- No commitear secretos, archivos generados, ni dependencias lockfile a menos
  que sea estrictamente necesario.

---

## Paso 6 — Verificar (verify)

Ejecutar `sdd-verify` para validar que la implementación coincide con las
specs:

- ¿Todas las tasks están completas?
- ¿Los criterios de aceptación se cumplen?
- ¿Los tests pasan?

Si hay discrepancias:
- Pequeñas → corregir en el acto.
- Grandes → evaluar si escalar (ver Escalation Guardrail).

---

## Paso 7 — Commit + Push

### 7a. Verificar tests

Antes de commitear y pushear:

```bash
npm run test:run    # En web/
npm test            # En api/
```

### 7b. Commit

```bash
git add .
git commit -m "feat({scope}): {descripción}"
```

**Nunca** "Co-Authored-By" ni atribución a IA.

### 7c. Push

```bash
git push -u origin feat/{nombre}
```

### 7d. Informar al usuario

```
---

## 🚀 Rama subida — Preview disponible

🌿 **Rama**: `feat/{nombre}`
🔗 **Preview**: el pipeline del proyecto generará la URL de preview
   (Fly.io genera URL de máquina por rama; Vercel/Render por push).
   Verificá en el dashboard correspondiente o en la sección de
   checks de GitHub.
📋 **PR pendiente**: lo creo a continuación

### Para validar:
1. Abrí el preview correspondiente al target de deploy del proyecto
2. Probá la funcionalidad
3. Si todo OK → PR listo
4. Si hay ajustes → decime qué corregir y sigo en esta rama
```

---

## Paso 8 — Crear PR (default, no opcional)

Cuando la rama esté pusheada y verificada:

1. Usar el skill `branch-pr` para crear el Pull Request.
2. El PR incluirá: resumen de cambios, specs de SDD, preview link.
3. **NUNCA hacer merge desde la terminal** — solo crear el PR en GitHub.
4. El merge lo hace el usuario manualmente desde la UI de GitHub.

### Después del merge

Cuando la feature se mergea a `main`:

1. Volver a `main`: `git checkout main`
2. Actualizar: `git pull origin main`
3. Ejecutar `sdd-archive` para sincronizar las delta specs con las specs
   principales.
4. (Opcional) Eliminar la rama local: `git branch -d feat/{nombre}`

---

## 🚨 Escalation Guardrail (ACTIVO durante implementación)

Si durante la implementación aparece **cualquiera** de estos, **DETENERSE**:

| # | Criterio |
|---|----------|
| 1 | **Causa raíz desconocida** — no sabés POR QUÉ falla |
| 2 | **Impacto arquitectónico** — requiere nuevos archivos, cambiar contratos, modificar middleware, alterar modelos de datos |
| 3 | **Scope overflow** — el error o ajuste afecta a más de 2 archivos NO planeados |
| 4 | **Contradicción con el plan** — la solución invalida el HANDOFF o las specs originales |
| 5 | **Reincidencia** — 2 intentos fallidos en el mismo error sin avance real |

Si se cumple alguno, escalar a un modelo potente o pedirle al usuario que
revise. **No improvisar**.

---

## Compatibilidad Antigravity

En Antigravity este mismo skill funciona, con las siguientes adaptaciones:

- **Single-agent**: el mismo agente hace explorar, planificar, implementar y
  pushear secuencialmente.
- **Sin sub-agentes SDD**: en lugar de invocar `sdd-explore`/`sdd-propose`/
  etc., el agente genera los artefactos (`changes/{nombre}/explore.md`,
  `proposal.md`, `spec.md`, `design.md`, `tasks.md`) directamente.
- **Handoff de modelo manual**: cuando el HANDOFF.md esté listo, indicarle al
  usuario "cambiar a modelo ligero" en el dropdown.
- **Sin auto-detección de target de deploy**: preguntar al usuario o detectar
  de la config del repo (`fly.toml` → Fly.io, `vercel.json` → Vercel, etc.).
- **PR manual**: `gh pr create` desde la terminal funciona igual; o el
  agente genera el link de comparación y el usuario lo crea desde la UI.
- **Todo lo demás es idéntico**: fases, artefactos, escalation guardrail,
  conventional commits, memoria en Engram.

---

## Reglas de Oro

1. **NUNCA mergear a `main` desde la terminal** — solo PR.
2. **NUNCA desplegar a producción** sin permiso explícito.
3. **NUNCA escribir código de implementación en los pasos 2-3** — solo
   planificación.
4. **SIEMPRE verificar tests antes de push**.
5. **SIEMPRE respetar AGENTS.md** (JS puro, h-dvh, date-fns, 16px inputs).
6. **La rama es aislada** — no afecta a producción hasta que el PR se mergea.
