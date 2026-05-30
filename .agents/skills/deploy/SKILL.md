---
description: Ejecuta el workflow completo de deploy: tests → push → Fly.io. Invoke with /deploy.
---

# Skill: Deploy

Este skill ejecuta el workflow de despliegue a producción de La Vin Nails en Fly.io.

## Activación

Invocado con `/deploy` o cuando el usuario pide desplegar a producción.

## Workflow: Deploy to Production

1. **Revisión de seguridad** — invoca `.agents/workflows/no-deploy.md`
2. **Tests API**: `cd api && node node_modules/jest/bin/jest.js --watchAll=false --forceExit`
3. **Tests Web**: `cd web && node node_modules/react-scripts/scripts/test.js --watchAll=false --forceExit`
4. **Push a origin**: `git push origin [branch]`
5. **Fly.io deploy**: `fly deploy`
6. **Confirmar URL** del deployment

## Comandos verificados (Mayo 2026)

| Paso | Comando | Directorio |
|------|---------|------------|
| Tests API | `node node_modules/jest/bin/jest.js --watchAll=false --forceExit` | api/ |
| Tests Web | `node node_modules/react-scripts/scripts/test.js --watchAll=false --forceExit` | web/ |
| Push | `git push origin [branch]` | raíz |
| Deploy | `fly deploy` | raíz |

## Notas

- Los tests de API usan jest directo (no npm test por compatibilidad con Node 24 en Windows)
- El deploy a Fly.io espera ~44s y genera imagen de ~52MB
- Rolling strategy con smoke checks automático
- URL típica: https://la-vin-nails-app.fly.dev/