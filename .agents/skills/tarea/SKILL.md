---
name: tarea
description: >
  Disparador universal de proceso completo: explorar → clasificar → ejecutar →
  verificar → memorizar. El tamaño se detecta automáticamente (trivial / mediana
  / grande) y la profundidad del proceso se adapta. Trigger: "/tarea",
  "planificar", "nueva tarea", "handoff", "arreglar", "corregir", "ajustar",
  "refactorizar", "implementar [algo]". Funciona en OpenCode (con sub-agentes)
  y Antigravity (single-agent). NO usar para crear funcionalidades NUEVAS — eso
  es /feature.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "2.0"
---

## Cuándo usar este skill

`/tarea` es el disparador universal para CUALQUIER trabajo: fixes chicos,
ajustes de UI, refactors medianos, o features grandes. El skill **adapta
automáticamente la profundidad del proceso al tamaño real detectado durante
la exploración**. Vos no clasificás: el explore lo hace.

Activá este skill cuando el usuario:
- Dice `/tarea` seguido de una descripción
- Pide "arreglar", "corregir", "ajustar", "refactorizar", "implementar"
- Dice "planificar" o "tengo una tarea"
- Pide un handoff entre planificación e implementación

**Diferencia con `/feature`**: `/feature` es para crear funcionalidades
NUEVAS que no existen. `/tarea` es para todo lo demás — incluyendo fixes,
modificaciones a cosas que ya existen, y refactors.

---

## Workflow agnóstico

```
/tarea "descripción"
    │
    ├─► 1. Explorar (qué hay, qué toca, qué tan grande es)
    ├─► 2. Clasificar (trivial / mediana / grande)
    ├─► 3. Aplicar el proceso según la categoría
    └─► 4. Verificar + Commit + Memoria
```

---

## Paso 1 — Explorar

**Objetivo**: Entender el codebase y el alcance real del cambio ANTES de
decidir cuánto proceso aplicar.

- Leer archivos relevantes al cambio.
- Identificar blast radius: cuántos archivos afecta, qué capas (UI, service,
  controller, model, schema, middleware).
- Detectar riesgos: contratos, migraciones, auth, multi-tenant, iOS/Safari,
  formato de fechas.
- Documentar hallazgos brevemente (inline en el HANDOFF, en el plan de la
  tarea, o como artefacto `explore` si el SDD del proyecto lo requiere).

**Para trivial**: la exploración puede ser "leer el archivo".
**Para grande**: la exploración es un `sdd-explore` completo con artefactos.

---

## Paso 2 — Clasificar

| Categoría  | Trigger típico                                                                  | Blast radius             |
|------------|--------------------------------------------------------------------------------|--------------------------|
| **Trivial**| 1 archivo, fix visual, typo, texto desbordado, ajuste de estilos o copy        | 1 archivo                |
| **Mediana**| 2-5 archivos, un componente o servicio, comportamiento nuevo, con tests        | 2-5 archivos             |
| **Grande** | >5 archivos, front+backend, contratos, migraciones, modelado de datos, multi-capa | >5 archivos, multi-capa  |

**Regla de oro**: si hay duda, **subir de categoría**. Mejor proceso de más
que de menos.

---

## Paso 3 — Aplicar el proceso según la categoría

### 3a. Categoría TRIVIAL

```
1. Editar el archivo
2. Verificar visualmente o con el test mínimo
3. Commit conventional (sin "Co-Authored-By" ni atribución a IA)
4. Guardar en memoria si hay un aprendizaje no obvio
5. NO branch (salvo que pida el usuario)
6. NO PR
```

### 3b. Categoría MEDIANA

```
1. Crear rama: feat/{nombre-kebab} | fix/{nombre-kebab}
2. Generar HANDOFF.md breve (sección 1, 2, 4, 6) en docs/handoffs/
3. SDD ligero: proposal + tasks (pueden ser cortos)
4. Implementar con tests
5. Verificar (tests + chequeo visual)
6. Commit conventional + push a la rama
7. Guardar en memoria
8. PR opcional (solo si el usuario lo pide)
```

### 3c. Categoría GRANDE

```
1. Crear rama: feat/{nombre-kebab}
2. SDD completo: explore → propose → spec → design → tasks
3. Generar HANDOFF.md completo en docs/handoffs/YYYY-MM-DD-nombre.md
4. (Opcional) Handoff a otro modelo si la planificación la hizo uno pesado
5. Implementar respetando tasks y dependencias
6. Verificar (sdd-verify)
7. Commit conventional + push a la rama
8. PR (branch-pr) — recomendado por default
9. Guardar en memoria todo el ciclo
```

---

## Paso 4 — Verificar + Commit + Memoria (en cualquier categoría)

- **Verificar**: tests pasan, no se rompió nada cercano, criterios de
  aceptación cumplidos.
- **Commit**: conventional commits, **nunca** "Co-Authored-By" ni atribución a
  IA. Ej: `fix(booking): ajustar overflow del título del turno`.
- **Memoria**: si hubo decisión arquitectónica, bug no obvio, patrón nuevo,
  gotcha, o convención → `mem_save` proactivamente.

---

## 🚨 Escalation Guardrail (ACTIVO en toda implementación)

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

- **Single-agent**: el mismo agente hace explorar, clasificar, implementar y
  commitear secuencialmente.
- **Sin sub-agentes SDD**: en lugar de invocar `sdd-explore`/`sdd-propose`/
  etc., el agente genera los artefactos (`changes/{nombre}/proposal.md`,
  `spec.md`, `design.md`, `tasks.md`) directamente.
- **Handoff de modelo manual**: cuando el HANDOFF.md esté listo, indicarle al
  usuario "cambiar a modelo ligero" en el dropdown. La sección del HANDOFF
  llamada "Para implementar con" sugiere qué perfil usar.
- **Sin auto-detección de target de deploy**: preguntar al usuario o detectar
  de la config del repo (`fly.toml` → Fly.io, `vercel.json` → Vercel, etc.).
- **Todo lo demás es idéntico**: fases, artefactos, escalation guardrail,
  conventional commits, memoria en Engram.

---

## Reglas de Oro (transversales)

1. **NUNCA mergear a `main` desde la terminal** — solo PR.
2. **NUNCA desplegar a producción** sin orden explícita.
3. **SIEMPRE respetar AGENTS.md** (JS puro, h-dvh, date-fns, 16px inputs).
4. **SIEMPRE guardar en Engram** lo que sea decisión, bug no obvio, o pattern.
5. **El tamaño lo detecta el explore, no el usuario.**
