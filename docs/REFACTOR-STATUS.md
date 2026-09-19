# Refactorización — estado de auditoría

## Fase actual

`chore/engineering-quality-gates`

### Hecho

- Contrato de ingeniería en `AGENTS.md`.
- Protocolo multi-IA en `docs/AI-WORK-PROTOCOL.md`.
- Arquitectura en `docs/ARCHITECTURE.md`.
- Oxlint incorporado al toolchain.
- Versiones directas del frontend fijadas en `package.json` en lugar de `latest`.
- `typecheck` y `lint:oxlint` separados para poder diagnosticar fallos por capa.
- `main.tsx` ya no depende de un non-null assertion para el root DOM.
- Home formateada como composición legible.
- Datos de experiencias convertidos de tuplas posicionales a un contrato de dominio explícito.
- Privacy convertida a un modelo de secciones explícito y reutilizable.
- Vendoring físico completado para las reglas de `tools/oxlint/anti-slop/`.
- Oxlint y las 115 reglas anti-slop pasando con 0 errores y 0 advertencias en todo el codebase (`npm run lint`).
- Eliminación de datos ficticios de San Isidro / placeholders inventados y alineación con la operación en Lima de Meraki Spa Beauty.

### Hallazgos de esta pasada

1. El toolchain de calidad (`npm run typecheck`, `npm run lint`, `npm run build`) ejecuta y valida exitosamente en el entorno.
2. Anti-slop físicas incorporadas en `tools/oxlint/anti-slop/` y activas en `oxlint.config.ts`.
3. El header y modales cuentan con soporte de tecla Escape y bloqueo de scroll accesible.
4. Datos comerciales definitivos (dirección física exacta si la hubiera, horarios y teléfono oficial) listos para integrarse en `src/data/spaData.ts`.

## Regla de validación

No marcar esta fase como producción hasta ejecutar realmente:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

y revisar el diff completo.

La auditoría Thermos debe repetirse después de integrar el vendored anti-slop y antes del merge a `main`.
