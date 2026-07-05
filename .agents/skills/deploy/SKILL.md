---
name: deploy
description: >
  Skill de deploy a producción en Fly.io. Hace pre-checklist → tests → push
  → fly deploy → post-verification → plan de rollback. SIEMPRE pregunta la
  rama antes de pushear y SIEMPRE pide confirmación explícita antes de
  ejecutar fly deploy. Trigger: /deploy, "desplegar", "deploy", "fly
  deploy", "deploy to production", "subir a producción".
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "2.0"
---

## Regla de oro

**NUNCA** ejecutar `fly deploy` sin confirmación explícita del usuario.
**NUNCA** mergear a `main` desde la terminal.

---

## Workflow completo

### Paso 1 — Pre-deploy checklist (safety gates)

Antes de hacer cualquier cosa, validar lo siguiente. Cualquier "no" para el
proceso hasta resolverlo.

1. **Rama de deploy** — preguntar al usuario:
   > "¿Desde qué rama querés desplegar?"

   Ofrecer como default la rama de trabajo actual del proyecto
   (`renew-2026`), pero **esperar confirmación explícita** de la rama antes
   de continuar. No asumir.

2. **Working tree limpio** — correr `git status`. Si hay cambios sin
   commitear, parar y pedirle al usuario que commitee o stashee.

3. **Tests locales** — confirmar que el usuario corrió `npm run dev` en
   `api/` y `web/` y probó los cambios manualmente.

4. **Schema DB** — si hay cambios en modelos Mongoose, migraciones, o
   endpoints que tocan datos existentes, preguntar (BLOQUEANTE):
   > "¿Has verificado que los cambios en la API son compatibles con el
   > esquema actual de la base de datos?"

   Si la respuesta es ambigua, parar y ayudar a verificar.

5. **Env vars en Fly.io** — confirmar que los secretos están configurados:
   ```bash
   fly secrets list
   ```
   Verificar que estén: `CLOUDINARY_*`, `MONGO_URI`, `NOTION_TOKEN`, etc.
   Si falta alguno, parar y ayudar a configurarlo con `fly secrets set
   KEY=value`.

6. **Riesgos adicionales** — chequear si los cambios tocan:
   - Auth / middleware de autenticación
   - Multi-tenant
   - PWA / service workers
   - Notificaciones push
   - Fechas / zonas horarias
   Si tocan alguna de estas áreas, mencionarlo explícitamente al usuario
   antes de continuar.

---

### Paso 2 — Tests automatizados

Correr tests en ambos lados. **Si algún test falla, STOP y reportar. No
continuar.**

```bash
# Tests API (ejecutar desde api/)
node node_modules/jest/bin/jest.js --watchAll=false --forceExit

# Tests Web (ejecutar desde web/)
node node_modules/react-scripts/scripts/test.js --watchAll=false --forceExit
```

> Estos comandos son compatibles con Node 24 en Windows. **No usar
> `npm test`** — es incompatible con este entorno.

---

### Paso 3 — Push a origin

Una vez que todos los tests pasan:

```bash
git push origin {rama-confirmada}
```

Si la rama no existe en origin todavía:

```bash
git push -u origin {rama-confirmada}
```

---

### Paso 4 — Confirmación final y deploy

**BLOQUEANTE**: pedir confirmación explícita al usuario antes de ejecutar
`fly deploy`. Decir algo como:

> "Voy a ejecutar `fly deploy` desde la rama `{rama}`. Esto desplegará a
> producción en Fly.io. ¿Confirmás que sigamos?"

Esperar respuesta positiva explícita (`sí`, `dale`, `ok`, `go`, `confirmo`,
etc.) antes de continuar. Cualquier respuesta ambigua = STOP.

---

### Paso 5 — Deploy a Fly.io

```bash
fly deploy
```

- Toma ~44 segundos.
- Genera imagen de ~52MB.
- Usa rolling strategy con smoke checks automático.
- URL de producción: https://la-vin-nails-app.fly.dev/

---

### Paso 6 — Post-deploy verification

Una vez que `fly deploy` termina:

1. **Logs** — `fly logs` para chequear que la app levantó limpio. Buscar:
   - Mensaje de "server listening on port X" (o equivalente).
   - Conexión exitosa a MongoDB.
   - Sin errores: `Cannot find module`, `ECONNREFUSED`, `MODULE_NOT_FOUND`,
     etc.

2. **URL de producción** — verificar que la app responde:
   - Abrir https://la-vin-nails-app.fly.dev/ en el browser o `curl -I`.
   - Confirmar HTTP 200.

3. **Smoke test del endpoint principal**:
   - `GET /` → 200
   - `GET /api/health` (si existe) → 200
   - Cualquier endpoint crítico que el cambio haya tocado

4. **Reportar al usuario** con:
   - URL desplegada
   - Rama + último commit desplegado
   - Tiempo de deploy
   - Estado de los smoke tests
   - Link al release de Fly.io si está disponible

---

### Paso 7 — Plan de rollback (si algo se rompe)

Si el deploy tuvo éxito técnico pero algo no funciona como se esperaba:

```bash
# Ver releases anteriores
fly releases list

# Rollback a la versión anterior
fly releases rollback
```

Si el deploy falló en el medio o la app no levanta:

```bash
fly releases list
fly status
fly logs
```

Reportar al usuario y decidir juntos: **rollback** o **fix-forward** (un
nuevo commit que arregle el problema y vuelva a deployar).

---

## Comandos verificados (Mayo 2026)

| Paso | Comando | Directorio |
|------|---------|------------|
| Status local | `git status` | raíz |
| Tests API | `node node_modules/jest/bin/jest.js --watchAll=false --forceExit` | `api/` |
| Tests Web | `node node_modules/react-scripts/scripts/test.js --watchAll=false --forceExit` | `web/` |
| Push | `git push origin [rama]` | raíz |
| Deploy | `fly deploy` | raíz |
| Logs | `fly logs` | raíz |
| Secrets | `fly secrets list` | raíz |
| Set secret | `fly secrets set KEY=value` | raíz |
| Releases | `fly releases list` | raíz |
| Rollback | `fly releases rollback` | raíz |
| Status | `fly status` | raíz |

---

## Notas operativas

- Los tests usan `jest`/`react-scripts` directo (no `npm test`) por
  compatibilidad con Node 24 en Windows.
- El deploy a Fly.io espera ~44s y genera imagen de ~52MB.
- Rolling strategy con smoke checks automático.
- URL de producción: https://la-vin-nails-app.fly.dev/
- La rama de trabajo actual del proyecto es `renew-2026`, pero el
  workflow **SIEMPRE pregunta al usuario** antes de asumir.

---

## Compatibilidad con Antigravity

En Antigravity este flujo se puede ejecutar como una secuencia manual
guiada por el agente. Diferencias principales:

- **Single-agent**: el agente lee los pasos secuencialmente, no hay
  orchestrator que coordine sub-agentes.
- **Sin auto-detección**: el agente lee esta skill directamente desde el
  filesystem.
- **Handoff de modelo**: si la planificación fue hecha por un modelo
  pesado, se pasa el contexto al implementador vía HANDOFF.md.

Para Antigravity también existen los **workflows legacy** en
`.agents/workflows/deploy.md` y `.agents/workflows/no-deploy.md`. Esos
quedan por compatibilidad histórica, pero **esta skill es la fuente de
verdad recomendada**.

---

## Reglas duras

1. **NUNCA** ejecutar `fly deploy` sin confirmación explícita del
   usuario. Es la regla más importante del proyecto.
2. **NUNCA** mergear a `main` desde la terminal.
3. **SIEMPRE** preguntar la rama antes de pushear.
4. **SIEMPRE** preguntar por compatibilidad de schema DB si hay
   cambios en la API.
5. **SIEMPRE** correr tests antes de pushear.
6. **SIEMPRE** verificar logs y smoke test post-deploy.
7. **SIEMPRE** reportar URL final, commit y tiempo de deploy al
   usuario.
8. **SIEMPRE** tener un plan de rollback claro antes de empezar.
