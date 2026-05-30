---
description: Spec-first convention for all code changes. Forces reading docs/specs/ before any edit.
---

# Spec-First Workflow

## Regla de Oro

**ANTES de tocar cualquier código, SIEMPRE verifica si existe una spec para la página o feature que vas a modificar.**

## Pasos Obligatorios

### 1. Identificar el Dominio

Determina qué página(s) o feature(s) toca el cambio pedido:
- ¿Es una página? → busca `docs/specs/[nombre-pagina].spec.md`
- ¿Es un modelo? → busca `docs/specs/models/[nombre].model.spec.md`
- ¿Es un controller? → busca `docs/specs/controllers/[nombre].controller.spec.md`
- ¿Es infraestructura? → busca `docs/specs/infra/[nombre].spec.md`

### 2. Leer la Spec Existente

Si la spec existe:
- **Léela ANTES de analizar el código.**
- La spec es el **contrato de comportamiento actual**.
- Cualquier plan que la contradiga es un **riesgo documentado**.
- Si el cambio propuesto modifica comportamiento documentado, **marca explícitamente** qué regla se cambia y por qué.

Si la spec NO existe:
- Anótalo. Al final de la tarea, sugerí al usuario ejecutar `/documentar` para registrar el comportamiento actual.

### 3. Implementar con Conciencia

- Si cambiaste una regla documentada: actualizá la spec al terminar.
- Si creaste comportamiento nuevo no documentado: sugerí documentarlo.

### 4. Actualizar la Spec (AL TERMINAR)

Si la spec existe y el comportamiento cambió:
- Actualizá la sección correspondiente (Reglas de Negocio, Estado y Efectos, Gotchas, etc.)
- Agregá una entrada al "Historial de Cambios Relevantes" con fecha, cambio y razón.

Si no existe spec para las páginas tocadas:
- Informá al usuario:
  > 📄 **Spec pendiente**: Esta tarea modificó `[NombrePágina]` pero no tiene spec funcional documentada. Ejecuta `/documentar` para registrar su comportamiento actual.

## Ejemplo de Uso

**Usuario**: "Arreglá el botón de guardar en el perfil"

**Agente**:
1. Identifica que toca `ProfilePage.jsx`
2. Busca `docs/specs/profile-page.spec.md` → existe
3. Lee la spec antes de tocar código
4. Implementa el fix
5. Si cambió comportamiento documentado → actualiza la spec
