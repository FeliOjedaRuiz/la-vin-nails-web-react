# Specs Funcionales — La Vin Nails

Este directorio contiene las especificaciones funcionales de las páginas y features de la aplicación.

Cada spec describe **qué hace** una página, **para quién**, bajo **qué reglas de negocio**, y qué **casos edge** hay que tener en cuenta. Son la fuente de verdad para escribir tests y para que nada se pierda cuando se toca código existente.

> Este proyecto fue construido durante años sin asistentes de IA y sin tests formales. Las specs aquí documentadas preservan el conocimiento que hasta ahora solo vivía en el código y en la memoria de quien lo construyó.

---

## Cómo usar estas specs

- **Antes de tocar una página**: lee su spec primero para entender el comportamiento esperado
- **Al terminar una feature**: actualiza la spec si el comportamiento cambió
- **Para escribir tests**: los "Tests Derivados" de cada spec son el punto de partida
- **Para generar una nueva spec**: usa el workflow `/documentar`

---

## Índice de Specs

| Página / Feature | Ruta | Roles | Última actualización |
|-----------------|------|-------|----------------------|
| [Agenda de Turnos — Vista Pública](./schedule-page-guest.spec.md) | `/schedule` | visitante, usuario | 2026-05-01 |
| [Agenda de Turnos — Vista Administrador](./schedule-page-admin.spec.md) | `/admin-schedule` | admin | 2026-05-04 |
| [Detalle y Actualización de Turno](./turn-detail-page.spec.md) | `/turns/:id` | admin | 2026-05-04 |

---

## Convención de Nombres

Los archivos siguen el patrón `[nombre-en-kebab-case].spec.md`, alineado con el nombre del componente principal:

| Componente | Archivo spec |
|------------|-------------|
| `SchedulePageGuest.jsx` | `schedule-page-guest.spec.md` |
| `SchedulePageAdmin.jsx` | `schedule-page-admin.spec.md` |
| `NewDatePage.jsx` | `new-date-page.spec.md` |
| `NewDateAdminPage.jsx` | `new-date-admin-page.spec.md` |
