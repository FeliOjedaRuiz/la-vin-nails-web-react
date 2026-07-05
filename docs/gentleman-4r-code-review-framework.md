# Gentleman 4R Code Review Framework

> Transcripción estructurada del video de Gentleman sobre code review automation con Skywork y el framework 4R.
> Fuente: Canal Gentleman Programming — Video sobre code review como cuello de botella.
> Propósito: Documento legible por agentes AI para referencia e implementación del framework.

---

## Resumen Ejecutivo

El video presenta **Skywork** como plataforma de cloud workforce para automatizar code reviews, y el **framework 4R** (Risk, Readability, Reliability, Resilience) como metodología de revisión técnica. La combinación permite convertir criterio técnico en workflows automatizados sin perder el human-in-the-loop.

---

## 1. El Problema: Code Review como Cuello de Botella

Escenario típico en equipos que escalan:
- Viernes 5pm, 8 PRs abiertos
- Juniors esperando feedback
- Senior en llamada con cliente, one-on-ones, múltiples interrupciones
- Resultado: **cero reviews bien hechos**, o reviews mediocres apurados
- PRs durmiendo el fin de semana
- Lunes: sale a producción con cosas mal revisadas

La IA permite moverse más rápido, pero el code review se vuelve el bottleneck si no se automatiza con criterio.

---

## 2. Skywork (Skyw) — Plataforma

### ¿Qué es?

Cloud workforce 24/7. Diferencia con LLM tradicional: **no espera el próximo prompt**. Le das un objetivo y se mantiene ejecutando en background, incluso cuando no estás conectado.

### Promesa clave

**Cero configuración.** No levantar VMs, no setup técnico pesado, no mantener infraestructura propia. Entrás a la UI, conectás herramientas, empezás a orquestar tareas.

### Skill-based

En vez de tirar un prompt distinto cada vez, definís **skills como bloques modulares de capacidad**. Cada skill tiene:
- Reglas
- Criterios
- Comportamientos esperados

Stackeás skills para armar workflows complejos sin repetir contexto todo el tiempo.

### Conexiones nativas

- GitHub (OAuth)
- Slack
- WhatsApp
- Telegram
- Notion
- Google Drive

### Model switch visible

No es caja negra. Podés elegir el modelo flagrante para cada tarea. Opciones mencionadas: Claude Opus 4.8, Gemini 3.1 Pro, auto-model (mezcla inteligente según la tarea).

### Skills Patch

Colección de skills pre-hechas listas para usar: desde coding hasta creación de agentes.

---

## 3. Framework 4R — Las Cuatro Puertas de Calidad

Framework presentado en Codemotion Madrid. Son cuatro dimensiones de calidad para que la IA acelere el delivery sin comprometer mantenibilidad ni producción.

### R1 — Risk (Riesgo)

¿Este cambio puede introducir un riesgo de seguridad? ¿Puede romper producción? ¿Toca una zona sensible? ¿Se está mergeando sin guards suficientes?

**Reglas verificables:**
- Scanners y hooks de seguridad
- Detección de zonas sensibles
- Análisis de impacto en producción

### R2 — Readability (Legibilidad)

¿El código se entiende? ¿Tiene estructura razonable? ¿Respeta el complexity budget? ¿O estamos aceptando una bola de barro generada con IA porque "funciona"? (anti-patrón: **slop**).

**Reglas verificables:**
- Linters
- Complexity budget
- Sin números mágicos sin comentario
- Código legible por cualquier colaborador

### R3 — Reliability (Confiabilidad)

¿Estás testeando de verdad? No vanity coverage. Coverage útil. Casos edge explícitos. Errores manejados. Timeouts considerados.

**Reglas verificables:**
- Coverage útil (no vanity)
- Edge cases
- Manejo de errores
- Timeouts

### R4 — Resilience (Resiliencia)

¿Qué pasa cuando esto falla? ¿Hay retries? ¿Degradación elegante? ¿Observabilidad? ¿O una falla local genera una caída en cascada?

**Reglas verificables:**
- Retries
- Degradación elegante
- Observabilidad
- Aislamiento de fallas

---

## 4. Memoria Contextual Adaptativa

Skywork puede mantener contexto de una metodología de review completa:
- Las 4R
- Criterios de calidad específicos del equipo
- Formato de comentario
- Señales en las que cada PR debe buscar

**La skill no arranca desde un prompt genérico.** Arranca con contexto adaptativo:
> "Este equipo revisa con cuatro R: primero Risk, Readability, después Reliability y Resilience. Estos son cuatro guards. Este es el estándar de calidad."

La memoria contextual da **continuidad**: Skywork no improvisa un review nuevo cada vez, aplica un framework ya definido con contexto sobre el equipo.

---

## 5. Demo Walkthrough

### PR de ejemplo
- Repositorio: Engram (servidor de memoria persistente)
- Feature: Agrega soporte FTS5 con BM25 para search en SQLite
- Scope: ~100 líneas, 2 archivos
- Nota: 200–400 líneas es el sweet spot científico para review humano

### Findings generados por la skill 4R

| R | Finding | Severidad |
|---|---------|-----------|
| Risk | Parámetro `title_boost` (float64) interpolado directamente en raw SQL. Hoy no es SQL injection porque no viene de input de usuario, pero si en el futuro `title_boost` viene de input externo, la puerta queda abierta. Incluye recommendation: usar parameterized queries. | Alta |
| Readability 1 | Valor `8.0` pasado como `title_boost` en la llamada de search — número mágico sin comentario que explique por qué el campo title recibe ese peso. Cualquier colaborador que ajuste el ranking en el futuro tendrá que inferir el esquema de columnas. | Media |
| Readability 2 | (Otro hallazgo de legibilidad) | — |
| Readability 3 | (Otro hallazgo de legibilidad) | — |
| Reliability | La función `search` itera todas las filas devueltas por la query sin aplicar una capa adicional de `OFFSET`/`LIMIT`. El build BM25 search SQL aplica LIMIT, pero la post-iteración no. | Alta |
| Resilience | La query BM25 **no tiene ningún mecanismo de timeout**. Si hay una query muy costosa, no hay control. Incluye recommendation: implementar timeout. | Alta |

### Salida estructurada

Cada finding incluye:
- Severidad
- Descripción del problema
- Por qué importa
- Recomendación de fix

### Integración con Slack

Mensaje estructurado con:
- Nombre del PR
- Link al PR
- Veredicto general
- Hallazgos por severidad (urgentes, menores)
- Cada hallazgo sectorizado

### Comentarios inline en GitHub

Los findings se publican automáticamente como comentarios inline en el PR de GitHub.

### Programación automática

Se puede programar una tarea para:
- Revisar automáticamente nuevos PRs usando la skill 4R
- Enviar resumen diario de actualizaciones a Slack

### Integración con Notion

Usando MCP Tool, Skywork puede:
- Encontrar la última revisión de PR
- Cargar la skill de Notion
- Guardar la revisión completa con todo formateado en una base de Notion

### Schedule de tareas recurrentes

Configurable para ejecutarse, por ejemplo, semanalmente después de cada sesión de peer review. Se configura una vez y el workflow ejecuta solo.

---

## 6. Skill Stacking

El review no queda aislado. Se pueden stackear más skills al mismo workflow:

```
PR Review (skill 4R) → Release Notes → Deck de Overview → Slides
```

Ejemplos de stacking:
- Cuando el PR mergea, auto-generar entry de release notes con descripción técnica, breaking changes, referencias al issue
- Publicar en Google Doc, repositorio de documentos, o Notion
- Al terminar el sprint, leer todos los PRs mergeados desde Notion, agrupar por feature, generar deck de overview para la review

---

## 7. ¿Por Qué Este Setup Funciona? (4 Razones)

### 1. Skill stacking sin silos
La review alimenta las release notes. Las release notes alimentan el deck. Todo concatenado. No hay silos de información.

### 2. Conexiones nativas con herramientas
GitHub OAuth, Slack, Drive, Notion, WhatsApp, Telegram. Interacciones disponibles desde todos lados. La plataforma orquesta sola entre servicios.

### 3. Cero config para todo el equipo
El lead define las skills y el equipo usa ese mismo criterio. Consistencia por defecto. Los miembros no se arman cada uno su propio setup.

### 4. Model switch visible
No es caja negra. Ves qué modelo está trabajando en cada tarea. Podés elegir manualmente o dejar que Skywork elija la mezcla inteligente según la tarea.

---

## 8. Conceptos Clave para Implementar como Skill

Si se quiere implementar el framework 4R como skill en OpenCode / Gentle AI:

```
Reglas por R:
  Risk:
    - Detectar interpolación directa en SQL
    - Identificar zonas sensibles (auth, pagos, datos personales)
    - Verificar guards y validaciones

  Readability:
    - Complexity budget (máximo de complejidad ciclomática por función)
    - Números mágigo → constantes nombradas
    - Estructura y nombres de variables/funciones claros

  Reliability:
    - Coverage útil (no vanity)
    - Edge cases cubiertos
    - Manejo de errores + timeouts

  Resilience:
    - Retries implementados
    - Degradación elegante
    - Observabilidad (logs, métricas)
    - Sin fallos en cascada
```

### Formato de salida recomendado

Cada finding debería incluir:
1. **R afectada** (Risk, Readability, Reliability, Resilience)
2. **Severidad** (Critical, High, Medium, Low, Suggestion)
3. **Ubicación** (archivo, línea)
4. **Descripción** del problema
5. **Por qué importa** (impacto)
6. **Recomendación** de fix

---

## 9. Referencias

- **Framework 4R presentado por Gentleman en Codemotion Madrid**
- **Gentleman Guardian Angel (GGA)**: CLI individual para code review (herramienta separada, para uso individual antes de subir PRs)
- **Skywork (Skyw)**: https://skywork.com (probar gratis, link en descripción del video)
- **Gentle AI**: Ecosistema de herramientas del canal Gentleman Programming

---

*Documento generado a partir de transcripción de video. Los conceptos, marcas y productos mencionados pertenecen a sus respectivos dueños.*
