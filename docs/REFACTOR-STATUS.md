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

### Hallazgos de esta primera pasada

1. El repositorio no tenía un lockfile visible en la rama auditada; debe generarse con el gestor elegido antes de producción.
2. Anti-slop está adoptado como política, pero el vendoring físico de `tools/oxlint/anti-slop/` todavía debe completarse antes de activar todas sus reglas como bloqueantes.
3. El header necesita una segunda pasada de accesibilidad para manejo de foco/teclado del diálogo móvil.
4. `src/styles/globals.css` concentra prácticamente todo el sistema visual; conviene modularizar solo cuando exista una frontera real, evitando dividirlo artificialmente.
5. El contenido legal, dirección, horarios y otros placeholders comerciales siguen pendientes de datos definitivos.

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
