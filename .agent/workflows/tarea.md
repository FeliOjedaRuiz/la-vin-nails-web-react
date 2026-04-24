---
description: Workflow para planificar tareas complejas y recomendar cambio a un modelo más económico (Sonnet/Flash) antes de implementar.
---

# Workflow: Planificación y Ahorro de Tokens (/tarea)

Este workflow se utiliza al plantear una nueva tarea arquitectónica o compleja a modelos de alto razonamiento (como Opus o Gemini Pro) para garantizar que hagan el "trabajo pesado" de pensar, pero dejen la escritura de código a modelos más rápidos y económicos.

1. **Analizar y Planificar**:
   - Lee el requerimiento del usuario.
   - Analiza la base de código necesaria.
   - Diseña la solución paso a paso.
   - (Opcional) Explora alternativas si es necesario.

2. **Verificación de Modelo Actual**:
   - Evalúa qué modelo eres actualmente (¿Eres Claude 3.5 Sonnet o Gemini 1.5 Flash? ¿O eres Claude 3 Opus o Gemini 1.5 Pro?).

3. **Punto de Detención (HARD STOP)**:
   - Si eres un modelo "pesado" (Opus, Gemini Pro, etc.):
     - **DETENTE AQUÍ.** NO ESCRIBAS CÓDIGO DE IMPLEMENTACIÓN.
     - Muestra el plan completo.
     - Finaliza tu respuesta EXACTAMENTE con este bloque:
       ```
       ⚡ **MODEL SWITCH**: Planificación completada. Para ahorrar tokens en la implementación, cambia a **Sonnet o Gemini Flash** y diles: "Implementa el plan de arriba".
       ```
   - Si YA eres un modelo "ligero" (Sonnet o Flash) o si el usuario indicó explícitamente "implementa tú":
     - Ignora el punto de detención.
     - Procede directamente a implementar el plan escribiendo el código necesario.
