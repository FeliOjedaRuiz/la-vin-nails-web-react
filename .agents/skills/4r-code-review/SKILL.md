---
name: 4r-code-review
description: >
  Skill de code review basada en el framework 4R (Risk, Readability, Reliability,
  Resilience) presentado por Gentleman en Codemotion Madrid. Implementa las
  cuatro dimensiones de calidad para que la IA acelere el delivery sin
  comprometer mantenibilidad ni producción. Usada por GGA (Gentleman Guardian
  Angel) y por el orchestrator cuando se activa un code review manual.
license: Apache-2.0
metadata:
  author: gentleman-programming
  source: Codemotion Madrid talk + Gentleman-Programming channel
  version: "1.0"
---

## Cuándo usar esta skill

Activar cuando se solicita un code review de código nuevo, modificado, o cuando
GGA dispara el pre-commit hook. Aplica a cualquier lenguaje del stack MERN
(JavaScript, JSX, Node/Express, Mongoose schemas, configs).

---

## Las Cuatro Puertas de Calidad (4R)

### R1 — Risk (Riesgo)

**Pregunta central**: ¿Este cambio puede introducir un riesgo de seguridad?
¿Puede romper producción? ¿Toca una zona sensible? ¿Se está mergeando sin
guards suficientes?

**Reglas verificables:**

- **SQL/NoSQL injection**: detectar interpolación directa de variables de usuario
  en queries. Hoy puede no ser漏洞, pero si en el futuro esa variable viene de
  input externo, la puerta queda abierta.
- **Zonas sensibles**: auth, pagos, datos personales (PII), multi-tenant,
  middleware de autenticación, registro/login, recuperación de contraseña.
- **Validación de input**: ausencia de sanitización, validación o guards en
  endpoints que reciben `req.body` o `req.params`.
- **Secretos hardcodeados**: API keys, tokens, connection strings commiteados.
- **Breaking changes en API**: cambios de contrato sin versionado.

**Severidad**: CRITICAL si toca auth/pagos/PII, HIGH si hay SQL injection
potencial, MEDIUM si falta validación.

### R2 — Readability (Legibilidad)

**Pregunta central**: ¿El código se entiende? ¿Tiene estructura razonable?
¿Respeta el complexity budget? ¿O estamos aceptando una bola de barro
generada con IA porque "funciona"?

**Anti-patrón explícito a evitar**: **slop** (código generado por IA que
funciona pero es ilegible).

**Reglas verificables:**

- **Complexity budget**: funciones con complejidad ciclomática > 10 son
  candidatas a refactor. Si una función tiene más de 3 niveles de
  anidamiento, flag.
- **Números mágicos sin comentario**: valores literales (ej: `8.0`, `0.05`,
  `300`) usados en lógica de negocio sin constante nombrada ni comentario que
  explique el porqué.
- **Nombres claros**: variables de una letra (excepto en loops triviales),
  funciones con verbos en nombre, sin abreviaciones crípticas.
- **Funciones largas**: > 50 líneas es una señal de hacer split.
- **Comentarios obsoletos**: comments que ya no aplican al código actual.

**Severidad**: MEDIUM para nombres/números mágicos, HIGH para complejidad
excesiva, SUGGESTION para formato.

### R3 — Reliability (Confiabilidad)

**Pregunta central**: ¿Estás testeando de verdad? No vanity coverage. Coverage
útil. Casos edge explícitos. Errores manejados. Timeouts considerados.

**Reglas verificables:**

- **Tests reales vs. vanity**: tests que solo llaman la función sin assert son
  vanity. Coverage útil = tests que verifican comportamiento, edge cases, y
  errores.
- **Edge cases explícitos**: null, undefined, array vacío, string vacío,
  número negativo, fecha inválida, overflow.
- **Manejo de errores**: try/catch en operaciones que pueden fallar (network,
  DB, filesystem). Sin errores silenciosos (`catch {}` vacío).
- **Timeouts**: cualquier llamada externa (HTTP, DB, file) sin timeout es un
  riesgo. Timeout explícito o documentado.
- **Validación de respuestas**: no asumir que una API externa siempre responde
  bien. Validar shape, status code, y datos antes de usar.

**Severidad**: HIGH para falta de manejo de errores, MEDIUM para edge cases
no cubiertos, SUGGESTION para naming de tests.

### R4 — Resilience (Resiliencia)

**Pregunta central**: ¿Qué pasa cuando esto falla? ¿Hay retries? ¿Degradación
elegante? ¿Observabilidad? ¿O una falla local genera una caída en cascada?

**Reglas verificables:**

- **Retries con backoff**: operaciones críticas (pagos, notificaciones, sync)
  deben tener retry con exponential backoff. Sin retry infinito.
- **Degradación elegante**: si un servicio secundario falla (ej: Notion,
  Cloudinary), la app no debe romperse. Fallar suave, loguear, seguir.
- **Observabilidad**: logs estructurados en operaciones importantes, métricas
  de latencia/error rate, tracing si es crítico.
- **Aislamiento de fallas**: un try/catch en una request no debe matar el
  servidor completo. Circuit breakers en servicios externos.
- **Sin fallos en cascada**: cambios que dependen de múltiples servicios deben
  manejar la falla de cada uno independientemente.

**Severidad**: CRITICAL para falta de retry en operaciones críticas, HIGH
para degradación elegante ausente, MEDIUM para observabilidad.

---

## Formato de salida esperado

Cada hallazgo de review debe incluir, en este orden:

```
### [R{n}] {Título corto}

**Severidad**: CRITICAL | HIGH | MEDIUM | LOW | SUGGESTION
**Ubicación**: `path/to/file.jsx:123` o `path/to/file.js:45-67`
**Descripción**: Qué está mal o es mejorable.
**Por qué importa**: Impacto real en el sistema (seguridad, mantenimiento, etc.).
**Recomendación**: Fix concreto con snippet si aplica.
```

Si no hay hallazgos en una R, omitir esa sección.

Al final, un **veredicto general**:

```
## Veredicto

- ✅ Aprobado sin cambios
- ⚠️ Aprobado con cambios menores (sugeridos)
- ❌ Cambios requeridos antes de merge (bloqueantes)
```

**Criterios de bloqueo**: cualquier hallazgo CRITICAL o HIGH en R1 (Risk)
bloquea el merge. HIGH en otras R también bloquea. MEDIUM y SUGGESTION
no bloquean pero se reportan.

---

## Reglas del proyecto (La Vin Nails) — overlays específicos

Estas reglas se aplican **además** de las 4R generales, porque el AGENTS.md
del proyecto lo define así:

- **JavaScript PURO** (nunca TypeScript) en `web/` y `api/`.
- **`h-dvh` SIEMPRE**, nunca `h-screen` ni `100vh` (Safari iOS).
- **`font-size: 16px` mínimo** en inputs (evita zoom iOS).
- **Fechas con `date-fns`**, nunca parsing directo de Date a string.
- **Conventional commits**, sin "Co-Authored-By".
- **No deploy a producción sin orden explícita**.

Cualquier violación de estas reglas es **HIGH severity** y se reporta en la R
que corresponda (R1 si toca zonas sensibles, R2 si afecta UX, etc.).

---

## Uso desde GGA

GGA lee esta skill automáticamente cuando se configura
`RULES_FILE="AGENTS.md"` en `.gga`. El contenido de esta skill se puede
incluir en el AGENTS.md del proyecto, o referenciar desde él.

**Setup recomendado**:

1. Crear `AGENTS.md` en la raíz del proyecto.
2. En el AGENTS.md, referenciar esta skill:
   ```markdown
   ## Code Review Standards
   Ver `.agents/skills/4r-code-review/SKILL.md` para el framework 4R completo.
   ```
3. GGA lee AGENTS.md y aplica las reglas definidas ahí + las 4R.

---

## Uso manual (sin GGA)

Si querés invocar el framework 4R como review manual desde el orchestrator:

```
Por favor revisá los cambios staged usando el framework 4R
(Risk, Readability, Reliability, Resilience). Aplicá las reglas
definidas en `.agents/skills/4r-code-review/SKILL.md` y reportá
los hallazgos en el formato estándar con severidad, ubicación,
descripción, impacto y recomendación.
```

El orchestrator ejecutará `sdd-verify` o delegará a un sub-agente con la
skill cargada.

---

## Compatibilidad con Antigravity

Esta skill funciona en OpenCode y Antigravity. En Antigravity, el agente
lee la skill directamente del filesystem y aplica las reglas manualmente
al revisar código.

---

## Referencias

- **Framework 4R** presentado por Gentleman Programming en Codemotion Madrid.
- **Gentleman Guardian Angel (GGA)**: https://github.com/Gentleman-Programming/gentleman-guardian-angel
- **Gentle AI Ecosystem**: https://github.com/Gentleman-Programming/gentle-ai
- **Transcripción del video**: `docs/gentleman-4r-code-review-framework.md` (en este repo)
