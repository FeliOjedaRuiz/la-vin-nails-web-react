---
description: Workflow para planificar tareas complejas y recomendar cambio a un modelo más económico (Sonnet/Flash) antes de implementar.
---

# Workflow: Planificación y Ahorro de Tokens (/tarea)

Este workflow se utiliza al plantear una nueva tarea arquitectónica o compleja a modelos de alto razonamiento (como Opus o Gemini Pro) para garantizar que hagan el "trabajo pesado" de pensar, pero dejen la escritura de código a modelos más rápidos y económicos.

1. **Verificar Spec Existente (ANTES de planificar)**:
   - Identifica qué página(s) o feature(s) toca esta tarea.
   - Comprueba si existe `docs/specs/[nombre].spec.md` para esa página.
   - Si existe: **léela antes de analizar nada más**. La spec es el contrato de comportamiento actual — cualquier plan que la contradiga es un riesgo.
   - Si no existe: anótalo. Al final de la tarea se sugerirá al usuario ejecutar `/documentar`.

2. **Analizar y Planificar**:
   - Lee el requerimiento del usuario.
   - Analiza la base de código necesaria.
   - Diseña la solución paso a paso.
   - Si la tarea cambia comportamiento documentado en la spec, marca explícitamente qué cambia y por qué.
   - (Opcional) Explora alternativas si es necesario.

3. **Verificación de Modelo Actual**:
   - Evalúa qué modelo eres actualmente (¿Eres Claude 3.5 Sonnet o Gemini 1.5 Flash? ¿O eres Claude 3 Opus o Gemini 1.5 Pro?).

4. **Punto de Detención — PLANIFICACIÓN (HARD STOP)**:
   - Si eres un modelo "pesado" (Opus, Gemini Pro, etc.):
     - **DETENTE AQUÍ.** NO ESCRIBAS CÓDIGO DE IMPLEMENTACIÓN.
     - Muestra el plan completo.
     - Si la tarea modifica comportamiento documentado en spec, indica qué partes de la spec habrá que actualizar.
     - Finaliza tu respuesta EXACTAMENTE con este bloque:
       ```
       ⚡ **MODEL SWITCH**: Planificación completada. Para ahorrar tokens en la implementación, cambia a **Sonnet o Gemini Flash** y diles: "Implementa el plan de arriba".
       ```
   - Si YA eres un modelo "ligero" (Sonnet o Flash) o si el usuario indicó explícitamente "implementa tú":
     - Ignora el punto de detención de planificación.
     - Procede directamente a implementar el plan escribiendo el código necesario.
     - Aplica el **Punto de Detención de Escalación** durante toda la implementación (ver paso 5).

5. **Punto de Detención — ESCALACIÓN DURANTE IMPLEMENTACIÓN (HARD STOP)**:

   Si eres un modelo "ligero" (Sonnet o Flash) y durante la implementación encuentras cualquiera de las siguientes situaciones, **DETENTE INMEDIATAMENTE**. No intentes resolverlo por tu cuenta.

   **Criterios de escalación obligatoria:**

   - **Causa raíz desconocida**: No puedes explicar con precisión POR QUÉ ocurre el error — solo sabes que algo falla.
   - **Impacto arquitectónico**: Resolver el error requiere crear nuevos archivos, cambiar el flujo de datos, modificar la cadena de middleware, o alterar contratos entre módulos.
   - **Desbordamiento de scope**: El error afecta a más de 2 archivos que NO estaban contemplados en el plan original.
   - **Contradicción con el plan**: La solución que ves necesaria contradice o invalida decisiones del plan original de Opus/Pro.
   - **Reincidencia**: Has fallado 2 veces intentando resolver el mismo error sin avance real.

   En cualquiera de estos casos, detente y responde EXACTAMENTE con este bloque:

   ```
   🚨 **ESCALACIÓN REQUERIDA**: He encontrado un error que supera mi scope de ejecución segura.

   **Situación**: [Describe el error con precisión — qué falla, en qué archivo, en qué contexto]
   **Por qué escalo**: [Indica cuál de los criterios se cumple]
   **Lo que NO haré**: Improvisar una solución que no comprendo o que puede desviar la arquitectura.

   👉 Vuelve a un modelo potente (Opus / Gemini Pro) y muéstrale este contexto para que tome la decisión correcta.
   ```

6. **Actualizar o Sugerir Spec (AL TERMINAR LA IMPLEMENTACIÓN)**:
   - Si existe spec para la(s) página(s) modificadas y el comportamiento cambió: **actualiza `docs/specs/[nombre].spec.md`** con los cambios. Añade una entrada al "Historial de Cambios Relevantes".
   - Si no existe spec para las páginas tocadas: informa al usuario al final:
     > 📄 **Spec pendiente**: Esta tarea modificó `[NombrePágina]` pero no tiene spec funcional documentada. Ejecuta `/documentar` para registrar su comportamiento actual.

