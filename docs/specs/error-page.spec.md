# Error Page (Página de Error)

## Metadata
- **Ruta en la app**: `/error` o catch-all `*`
- **Componente principal**: `ErrorPage.jsx`
- **Archivos relacionados**: `error500.png` (imagen)
- **Última actualización**: 2026-05-28
- **Roles que interactúan**: visitante, usuario, admin

---

## Descripción General
Página genérica de error que se muestra cuando ocurre un error inesperado o cuando el usuario navega a una ruta que no existe. Muestra una imagen decorativa y un mensaje de disculpa.

---

## Comportamiento por Rol

### 👤 Visitante / 🔑 Usuario / 🛡️ Admin
- Todos los roles ven la misma página de error
- No hay acciones disponibles en la página (sin botón de "volver al inicio")
- El mensaje sugiere contactar al administrador si el error persiste

---

## Reglas de Negocio

1. **RB-01 — Página genérica**: No distingue entre tipo de error (404, 500, etc.). Siempre muestra el mismo contenido.
2. **RB-02 — Sin navegación**: No ofrece botones ni links para navegar de vuelta. El usuario debe usar la navegación del Layout o el botón de atrás del navegador.
3. **RB-03 — Accesible para todos**: No requiere autenticación.

---

## Componentes Utilizados
| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|
| `Layout` | Wrapper con navegación (permite salir de la página de error) |
| `error500.png` | Imagen decorativa de error |

---

## Llamadas a API
Ninguna.

---

## Estado y Efectos Secundarios
No tiene estado local ni efectos. Es un componente puramente presentacional.

---

## Casos Edge y Gotchas
- **Sin botón de "volver al inicio"**: El usuario queda atrapado visualmente. Solo puede usar la navegación del Layout o el botón de atrás del navegador.
- **`h-full` en el contenedor**: Usa `h-full` en lugar de `h-dvh`. Si el padre no tiene altura definida, el centrado vertical puede fallar.
- **Typo en el mensaje**: Dice "Ah ocurrido" en lugar de "Ha ocurrido" (error ortográfico).
- **Sin información del error**: No muestra código de error, mensaje técnico, ni stack trace. Es una página genérica sin contexto.
- **Imagen hardcodeada**: La imagen `error500.png` es un asset local. Si se borra, la página muestra un broken image.
- **Sin diferenciación de errores**: 404, 500, 403, etc. — todos muestran la misma página. No hay personalización por tipo de error.

---

## Tests Derivados (Checklist)

### Todos los roles
- [ ] Dado que navego a una ruta inexistente, cuando el router redirige a /error, veo la página de error
- [ ] Dado que estoy en la página de error, puedo usar la navegación del Layout para ir a otra página

### Casos edge
- [ ] **Sin botón volver**: Verificar que no hay botón de "volver al inicio"
- [ ] **Typo**: Verificar que el mensaje dice "Ah ocurrido" (bug ortográfico)
- [ ] **h-full**: Verificar que el centrado vertical funciona correctamente en móvil

---

## Historial de Cambios Relevantes
| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada | Documentación del comportamiento existente |
