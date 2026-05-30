# Accounting Page (Contabilidad)

## Metadata
- **Ruta en la app**: `/accounting`
- **Componente principal**: `AccountingPage.jsx`
- **Archivos relacionados**: `AccountingTabs.jsx`, `DailyAccounting.jsx`, `WeeklyAccounting.jsx`, `MonthlyAccounting.jsx`, `DailyIncomes.jsx`, `DailyExpenses.jsx`, `DailyResults.jsx`, `ReactDatePicker.jsx`, `MonthPicker.jsx`
- **Última actualización**: 2026-05-28
- **Roles que interactúan**: admin

---

## Descripción General
Panel de contabilidad que muestra ingresos y egresos del negocio con vistas diario, semanal y mensual. Permite al admin ver el balance del día (citas + gastos), el resumen mensual por método de pago y categoría de gasto, y calcular el beneficio neto.

---

## Comportamiento por Rol

### 🛡️ Administrador
- Puede ver las 3 vistas: Diario, Semanal, Mensual
- **Diario**: Selecciona una fecha, ve las citas de ese día (ingresos), los gastos del día, y el resultado neto
- **Mensual**: Selecciona un mes, ve ingresos agrupados por método de pago (Sin cobrar, Efectivo, Bizum), egresos por categoría (Gastos fijos, Insumos, Otros), y beneficio mensual
- **Semanal**: Placeholder sin implementar — muestra solo un mensaje decorativo

### 👤 Visitante / 🔑 Usuario
- No tienen acceso a esta página (protegida por guard de admin)

---

## Reglas de Negocio

1. **RB-01 — Solo admin**: La página es accesible exclusivamente para administradores.
2. **RB-02 — Vista diaria por fecha**: Muestra todas las citas y gastos de una fecha específica seleccionada con date picker.
3. **RB-03 — Vista mensual por mes**: Agrupa citas por método de pago y gastos por categoría para un mes completo.
4. **RB-04 — Cálculo de beneficio**: Beneficio = Total ingresos - Total egresos (solo en vista mensual).
5. **RB-05 — Métodos de pago**: Las citas se clasifican en 3 métodos: "Sin cobrar", "Efectivo", "Bizum".
6. **RB-06 — Categorías de gasto**: Los gastos se clasifican en 3 categorías: "Gastos fijos", "Insumos", "Otros".
7. **RB-07 — Recarga manual**: La vista diaria permite recargar datos con un toggle boolean `reload`.
8. **RB-08 — Vista semanal no implementada**: El tab "Semanal" existe pero no tiene funcionalidad — es un placeholder.

---

## Componentes Utilizados
| Componente | Responsabilidad en esta vista |
|------------|-------------------------------|
| `Layout` | Wrapper con navegación y guard de admin |
| `AccountingTabs` | Tabs para cambiar entre vistas Diario/Semanal/Mensual |
| `DailyAccounting` | Vista diaria: date picker, ingresos, gastos, resultados |
| `DailyIncomes` | Lista de citas del día seleccionado con opción de recarga |
| `DailyExpenses` | Lista de gastos del día seleccionado |
| `DailyResults` | Cálculo y muestra del resultado neto del día |
| `WeeklyAccounting` | Placeholder sin implementar |
| `MonthlyAccounting` | Vista mensual: month picker, totales por método de pago y categoría |
| `ReactDatePicker` | Selector de fecha para vista diaria |
| `MonthPicker` | Selector de mes para vista mensual |

---

## Llamadas a API
| Endpoint | Método | Cuándo se llama | Qué retorna |
|----------|--------|-----------------|-------------|
| `/dates/by-date/:date` | GET | Al montar DailyAccounting o cambiar fecha | Lista de citas de esa fecha |
| `/expenses/by-date/:date` | GET | Al montar DailyAccounting o cambiar fecha | Lista de gastos de esa fecha |
| `/dates/by-month/:month` | GET | Al montar MonthlyAccounting o cambiar mes | Lista de citas de ese mes |
| `/expenses/by-month/:month` | GET | Al montar MonthlyAccounting o cambiar mes | Lista de gastos de ese mes |

---

## Estado y Efectos Secundarios
- **`date` (DailyAccounting)**: Fecha seleccionada para la vista diaria. Cambia con el date picker.
- **`dates` (DailyAccounting)**: Lista de citas del día. Se actualiza al cambiar fecha o recargar.
- **`expenses` (DailyAccounting)**: Lista de gastos del día. Se actualiza al cambiar fecha o recargar.
- **`reload` (DailyAccounting)**: Boolean toggle para forzar recarga de datos.
- **`selectedMonth` (MonthlyAccounting)**: Primer día del mes seleccionado. Default: mes actual.
- **`dates` (MonthlyAccounting)**: Objeto con citas agrupadas por método de pago.
- **`totals` (MonthlyAccounting)**: Totales de ingresos por método de pago.
- **`expenses` (MonthlyAccounting)**: Objeto con gastos agrupados por categoría.
- **`totalExpenses` (MonthlyAccounting)**: Totales de egresos por categoría.
- **Efecto de carga diaria**: Se ejecuta cuando cambia `date`, `reload`, o `selectedDate`. Llama a ambas APIs (dates + expenses).
- **Efecto de carga mensual**: Se ejecuta cuando cambia `selectedMonth`. Llama a ambas APIs y calcula totales en el cliente.

---

## Casos Edge y Gotchas
- **Semanal sin implementar**: El tab "Semanal" existe en la UI pero solo muestra un mensaje decorativo. No hay lógica de contabilidad semanal.
- **`reload` como boolean toggle**: Si dos recargas rápidas terminan en el mismo valor boolean, el `useEffect` NO se dispara. Frágil ante clicks rápidos.
- **Errores silenciosos**: Los `.catch()` de las APIs solo hacen `console.error`. El usuario no recibe feedback visual si falla la carga.
- **Cálculo en cliente**: Los totales mensuales se calculan en el frontend con `.filter()` + `.reduce()`. Esto escala mal si hay muchas citas/gastos.
- **Beneficio mensual con bug de precedencia**: `totals.total - totalExpenses.total.toFixed(2)` — `.toFixed(2)` tiene mayor precedencia que `-`, así que resta un string formateado. El resultado puede ser incorrecto.
- **Sin loading states en vista diaria**: Mientras cargan las APIs, el usuario ve listas vacías sin spinner.
- **Formato de fecha**: Usa `useTransformDate` hook para convertir fechas a strings. Depende de que el formato sea consistente con el backend.
- **MonthlyAccounting tiene loading states**: A diferencia de DailyAccounting, MonthlyAccounting sí tiene `datesLoaded` y `expensesLoaded` para mostrar datos solo cuando están listos.

---

## Tests Derivados (Checklist)

### Administrador
- [ ] Dado que soy admin, cuando entro a /accounting, veo los tabs Diario/Semanal/Mensual
- [ ] Dado que estoy en vista diaria, cuando cambio la fecha, se recargan citas y gastos
- [ ] Dado que estoy en vista mensual, cuando cambio el mes, se recalculan todos los totales
- [ ] Dado que estoy en vista mensual, veo ingresos agrupados por método de pago

### Reglas de negocio
- [ ] **RB-04**: Verificar que beneficio = ingresos - egresos en vista mensual
- [ ] **RB-05**: Verificar que las citas se clasifican correctamente por método de pago
- [ ] **RB-06**: Verificar que los gastos se clasifican correctamente por categoría

### Casos edge
- [ ] **Gotcha semanal**: Verificar que el tab Semanal no muestra datos reales
- [ ] **Gotcha reload**: Verificar que recargas rápidas no pierden datos
- [ ] **Gotcha beneficio**: Verificar que el cálculo de beneficio mensual es correcto (precedencia de operadores)

---

## Historial de Cambios Relevantes
| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2026-05-28 | Spec inicial creada | Documentación del comportamiento existente |
