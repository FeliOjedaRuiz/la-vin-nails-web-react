---
name: tarea
description: >
  Workflow de planificación con ahorro de tokens. El modelo pesado planifica y se DETIENE;
  el modelo ligero implementa pero ESCALA si encuentra errores complejos.
  Trigger: Cuando el usuario dice "/tarea", "planificar", "nueva tarea", "handoff",
  "cambio de modelo", o al iniciar SDD planning.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Cuándo usar este skill

Este skill implementa el workflow `/tarea` — un sistema de **dos fases con dos HARD STOPS** para optimizar tokens y evitar que modelos ligeros "improvisen":

- **Fase 1 — PLANIFICACIÓN**: Modelo pesado (deepseek-v4-pro, claude-opus, gemini-pro, etc.)
- **Fase 2 — IMPLEMENTACIÓN**: Modelo ligero (gemini-flash, claude-sonnet, deepseek-chat, etc.)

El skill se activa automáticamente cuando el usuario:
- Dice `/tarea` seguido de una descripción
- Pide "planificar" o "diseñar" una feature
- Inicia un ciclo SDD (sdd-explore → sdd-propose → sdd-spec → sdd-design → sdd-tasks)
- Dice "handoff" o "cambio de modelo"

---

## Paso 1 — Analizar y Planificar

1. Lee el requerimiento del usuario.
2. Analiza la base de código necesaria (lee archivos relevantes, no adivines).
3. Diseña la solución paso a paso.
4. (Opcional) Explora alternativas si es necesario.
5. Genera un **HANDOFF.md** con TODO el contexto para el implementador (usa la plantilla en `assets/handoff-template.md`).

**Durante esta fase NO escribas código de implementación.** Solo snippets ilustrativos si son estrictamente necesarios para explicar la arquitectura.

---

## Paso 2 — Verificación de Modelo Actual

Evalúa qué modelo eres:

- **Modelo PESADO (Planificación)**: DeepSeek V4 Pro (límite 3,450). Razonamiento analítico puro.
- **Modelo LIGERO (Implementación)**: MiniMax M2.7 (límite 3,400) o DeepSeek V4 Flash (límite 31,650).
- **Modelo ORQUESTADOR**: Qwen 3.6 Plus (límite 3,300). Visión multimodal confirmada.

---

## Paso 3 — HARD STOP de PLANIFICACIÓN

### Si eres un modelo PESADO (DeepSeek V4 Pro):

**DETENTE AQUÍ. NO ESCRIBAS CÓDIGO DE IMPLEMENTACIÓN.**

1. Muestra el plan completo al usuario.
2. Indica que el HANDOFF.md está listo en `docs/handoffs/`.
3. Finaliza tu respuesta EXACTAMENTE con este bloque:

```
---

## ⚡ CAMBIO DE PERFIL SDD — Planificación completada

La arquitectura y el plan están listos. Todo el contexto está en:

📄 **HANDOFF.md**: `docs/handoffs/YYYY-MM-DD-nombre-feature.md`

### Para ahorrar tokens en la implementación:

**Cambia de modelo en el dropdown de OpenCode**:

- De: `DeepSeek V4 Pro` (Planificación)
- A: `MiniMax M2.7` (Implementación rápida) o `DeepSeek V4 Flash` (Features gigantes)

El perfil `implement` usa modelos con límites altos (3,400 a 31,650).

Una vez cambiado, dile:

> "Implementa el plan de HANDOFF.md"

¿Guardo el contexto en Engram para la siguiente sesión?
```

### Si YA eres un modelo LIGERO:

- Ignora el punto de detención de planificación.
- Procede directamente a implementar el plan escribiendo el código necesario.
- Aplica el **Punto de Detención de Escalación** (Paso 4) durante TODA la implementación.

---

## Paso 4 — HARD STOP de ESCALACIÓN durante la implementación

> ⚠️ **SOLO para modelos LIGEROS.** Si eres un modelo pesado, este paso no aplica (ya te detuviste en el Paso 3).

Si durante la implementación encuentras **cualquiera** de las siguientes situaciones, **DETENTE INMEDIATAMENTE**. No intentes resolverlo por tu cuenta. No "improvishes".

### Criterios de escalación obligatoria:

| # | Criterio | Descripción |
|---|----------|-------------|
| 1 | **Causa raíz desconocida** | No puedes explicar con precisión POR QUÉ ocurre el error — solo sabes que algo falla |
| 2 | **Impacto arquitectónico** | Resolver el error requiere crear nuevos archivos, cambiar el flujo de datos, modificar la cadena de middleware, o alterar contratos entre módulos |
| 3 | **Desbordamiento de scope** | El error afecta a más de 2 archivos que NO estaban contemplados en el plan original |
| 4 | **Contradicción con el plan** | La solución que ves necesaria contradice o invalida decisiones del plan original del modelo pesado |
| 5 | **Reincidencia** | Has fallado 2 veces intentando resolver el mismo error sin avance real |

### Si se cumple algún criterio, detente y responde EXACTAMENTE:

```
---

## 🚨 ESCALACIÓN REQUERIDA

He encontrado un error que supera mi scope de ejecución segura.

**Situación**: [Describe el error con precisión — qué falla, en qué archivo, en qué contexto]

**Por qué escalo**: [Indica cuál de los 5 criterios se cumple]

**Lo que NO haré**: Improvisar una solución que no comprendo o que puede desviar la arquitectura.

👉 **Vuelve a un modelo potente** (Deepseek Pro, Gemini Pro, Opus) y muéstrale este contexto para que tome la decisión correcta.
```

---

## Archivos de Handoff

Los handoff files se guardan en `docs/handoffs/` con el formato:

```
docs/handoffs/YYYY-MM-DD-nombre-feature.md
```

Ejemplo: `docs/handoffs/2026-05-06-sistema-notificaciones.md`

---

## Integración con SDD

Si se está usando el workflow SDD, `/tarea` se integra así:

```
sdd-explore → sdd-propose → sdd-spec → sdd-design → sdd-tasks
                                                          ↓
                                                   [/tarea - HARD STOP]
                                                   Generar HANDOFF.md
                                                   Recomendar cambio de modelo
                                                          ↓
                                               (cambio de modelo aquí)
                                                          ↓
                                                     sdd-apply
                                              (con escalation guardrail)
```

---

## Recursos

- **Plantilla de Handoff**: [assets/handoff-template.md](assets/handoff-template.md)

---

## Comparación con `/tarea` original (La Vin Nails)

| Elemento | Original (Antigravity) | Esta versión (OpenCode) |
|----------|----------------------|------------------------|
| Nombre | `/tarea` | `/tarea` (skill) |
| Paso 1 | Analizar y Planificar | Analizar y Planificar + HANDOFF.md |
| Paso 2 | Verificar modelo | Verificar modelo |
| Paso 3 | HARD STOP planificación | HARD STOP planificación + HANDOFF.md generado |
| Paso 4 | HARD STOP escalación | HARD STOP escalación (mismos 5 criterios) |
| Handoff | No (solo plan en chat) | Sí (HANDOFF.md en docs/handoffs/) |
| Engram | N/A | Integración con memoria persistente |
