---
name: mobile_ux_expert
description: Experto en optimización para dispositivos móviles, especialmente Safari en iOS.
---

# Mobile UX Expert Skill

Esta habilidad se enfoca en garantizar que La Vin Nails funcione perfectamente en iPhones y otros dispositivos móviles.

## 1. Reglas Críticas para iOS

- **Fechas**: Nunca pases una cadena `YYYY-MM-DD` directamente a `new Date()`. Usa `parseISO` de `date-fns` o descompón la fecha.
- **Inputs**: Mínimo `16px` de fuente.
- **Botones**: Añade feedback visual inmediato (`loading state`) para evitar clics repetidos.
- **Scroll**: Evita `overflow-hidden` en el `body` si no es estrictamente necesario, puede causar saltos en iOS.

## 2. Diagnóstico de Problemas en Producción

Si una clienta reporta que "no se guarda", verifica:
1. **Validación de Fechas**: ¿La fecha seleccionada se está enviando correctamente?
2. **Eventos de Formulario**: ¿El `onSubmit` está siendo cancelado por algún error de validación silencioso que Safari detecta distinto?
3. **Consola del Navegador**: Simular Safari en herramientas de desarrollo para ver errores de `Invalid Date`.
