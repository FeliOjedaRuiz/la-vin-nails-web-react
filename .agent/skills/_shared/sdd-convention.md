---
description: Reglas de comportamiento estrictas para el orquestador de SDD en el proyecto La Vin Nails.
---

# SDD Orchestrator Conventions

Esta convención aplica a TODAS las ejecuciones de fases de SDD (`sdd-explore`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive`).

## Regla de Parada Estricta (Interactive Mode)

El problema: A veces, modelos de alto razonamiento como Gemini Pro se adelantan y ejecutan todas las fases del tirón sin dar oportunidad de validación al usuario.

**Instrucción de Alta Prioridad (HARD STOP):**
Al final de CADA FASE de SDD, debes detenerte **completamente**.
1. Genera tu reporte y el resumen de lo que produjiste en la fase.
2. Añade la pregunta: "¿Continuamos a la siguiente fase?"
3. **CEASE GENERATION IMMEDIATELY.** NO asumas la respuesta del usuario. NO escribas código de la siguiente fase por adelantado.
4. Tu última línea debe ser EXACTAMENTE la pregunta de si continuamos.

Cualquier modelo que ignore esta regla de parada está cometiendo una falta crítica.
