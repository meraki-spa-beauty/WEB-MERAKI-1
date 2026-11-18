# MERAKI — Web Platform

Primera versión del sitio web de Meraki, construida como una experiencia de wellness premium, editorial y sensorial.

## Stack

- React + TypeScript
- Vite
- React Router
- CSS con design tokens
- Firebase Hosting
- GitHub

## Rutas v1

- `/` — Home
- `/privacy` — Política de privacidad (placeholder legal)
- `*` — 404

## Dirección de marca

Paleta basada en el manual de marca:

- Sage `#AEC2AE`
- Deep Sage `#5E765E`
- Terracotta `#D5A688`
- Cream `#FFF2DE`
- Ink `#111111`

Tipografía prevista:

- Black Mango — display/editorial
- Montserrat — interfaz y cuerpo

Los archivos oficiales de logo y fuentes deben agregarse en `public/assets/brand/` antes de producción.

## Desarrollo local

```bash
npm install
npm run dev
npm run build
```

## Firebase

La configuración de `firebase.json` está preparada para SPA hosting y cache de assets versionados. No contiene secretos.
