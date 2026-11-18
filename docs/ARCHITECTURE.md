# MERAKI — Arquitectura de la aplicación

## 1. Objetivo arquitectónico

`WEB-MERAKI-1` es una aplicación web React/TypeScript orientada a la experiencia digital de Meraki Spa Beauty.

La arquitectura prioriza:

- claridad sobre abstracción;
- componentes pequeños y composables;
- tipos explícitos;
- accesibilidad;
- rendimiento razonable;
- seguridad en fronteras de datos;
- identidad visual consistente;
- capacidad de crecer hacia Firebase sin acoplar la UI a la infraestructura.

## 2. Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS / estilos del sistema visual existente

### Infraestructura prevista

- Firebase Hosting
- Firestore para datos persistentes cuando sean necesarios
- Firebase Storage para assets administrables cuando sean necesarios
- Firebase Authentication para áreas autenticadas cuando sean necesarias
- Cloud Functions únicamente para lógica que deba ejecutarse de forma segura en backend

GitHub es la fuente de verdad del código.

## 3. Capas

```text
src/
├── app/              # composición de aplicación y routing
├── components/
│   ├── brand/        # elementos propios de identidad Meraki
│   ├── layout/       # shell, header, footer y estructura global
│   ├── sections/     # secciones compuestas de páginas
│   └── ui/           # primitivas reutilizables de interfaz
├── routes/           # páginas/rutas de navegación
├── styles/           # tokens y estilos globales
└── ...               # infraestructura o dominios nuevos solo cuando exista necesidad real
```

Las carpetas no son una obligación dogmática: una nueva capa debe existir porque tiene una responsabilidad clara.

## 4. Dependencias entre capas

Regla general:

```text
routes/pages
      ↓
sections/layout/ui
      ↓
domain/presentation contracts
      ↓
infrastructure adapters
      ↓
Firebase / APIs externas
```

La UI no debe contener detalles innecesarios de Firebase. Cuando la aplicación requiera datos remotos, preferir una frontera explícita que permita cambiar la infraestructura sin reescribir componentes visuales.

## 5. Routing

React Router es responsable de la navegación.

Las rutas públicas actuales/futuras deben mantener separación entre:

- página;
- layout;
- secciones;
- datos de contenido.

El routing no debe contener lógica de negocio compleja.

## 6. Componentes

### `components/ui`

Primitivas reutilizables y neutrales dentro del lenguaje visual Meraki.

Ejemplos conceptuales:

- Button
- Container
- SectionHeading
- Link
- Input

No convertir esta carpeta en un cajón de sastre.

### `components/brand`

Componentes directamente ligados a la identidad de Meraki.

### `components/layout`

Estructura global de navegación y composición.

### `components/sections`

Secciones con significado dentro de la experiencia de una página. Una sección puede combinar varias primitivas UI.

No crear una sección únicamente para envolver un elemento que no tiene comportamiento o responsabilidad propia.

## 7. Diseño visual

El sistema visual debe derivarse del manual de marca de Meraki.

Tokens actualmente establecidos como referencia:

```text
Cream       #FFF2DE
Deep Sage   #5E765E
Sage        #AEC2AE
Terracotta  #D5A688
```

Tipografía prevista:

- Black Mango para identidad/títulos cuando estén disponibles los archivos oficiales.
- Montserrat para interfaz/cuerpo cuando estén disponibles los archivos oficiales.

No inventar nuevos tokens visuales sin necesidad. Si aparece una necesidad recurrente, documentarla como token.

## 8. Datos y Firebase

Firebase no debe convertirse en una dependencia indiscriminada de cada componente.

### Firestore

Usarlo para datos dinámicos que realmente necesiten persistencia remota.

Posibles dominios futuros:

```text
services
experiences
content
bookings
site-config
```

Los nombres y esquemas definitivos se definirán cuando exista el requisito de negocio real.

### Storage

Reservado para imágenes y archivos administrables.

Los componentes deberían consumir URLs/objetos de contenido, no conocer detalles internos del bucket cuando sea evitable.

### Authentication

Solo introducirla cuando exista una necesidad real de usuarios o administración.

### Functions

Usarlas para operaciones que no deban confiar en el cliente: secretos, integraciones privadas, validaciones privilegiadas o procesos server-side.

## 9. Seguridad

El frontend es un entorno no confiable.

Nunca considerar una variable `VITE_*` como secreta.

Las credenciales privadas y service accounts pertenecen únicamente a entornos seguros de backend/CI.

Las reglas de Firestore/Storage deben aplicar autorización real independientemente de la UI.

## 10. Estado

Preferir el estado local cuando solo afecta a un componente o sección.

Elevar estado únicamente cuando exista una necesidad real de compartirlo.

No introducir un gestor global de estado hasta que haya evidencia de que el estado compartido lo requiere.

## 11. Contenido

El contenido editorial de Meraki no debe mezclarse innecesariamente con lógica de presentación.

Cuando el contenido pase a ser administrable, diseñar una frontera de datos que permita usar Firestore sin convertir cada componente en un cliente directo de la base de datos.

No inventar información comercial, precios, servicios, horarios, ubicación o claims.

## 12. Accesibilidad

La accesibilidad es una propiedad de arquitectura, no un paso posterior.

Requisitos:

- HTML semántico;
- navegación por teclado;
- foco visible;
- nombres accesibles para controles;
- contraste adecuado;
- textos alternativos significativos;
- estados de interacción comprensibles;
- respeto por `prefers-reduced-motion` cuando haya animación.

## 13. Rendimiento

Preferir:

- bundles pequeños;
- dependencias justificadas;
- imágenes optimizadas;
- carga diferida cuando aporte una mejora real;
- componentes simples;
- evitar renders y cálculos innecesarios.

No optimizar prematuramente si la complejidad introducida supera el beneficio medible.

## 14. Calidad de código

El repositorio adopta las reglas de `dmmulroy/anti-slop` y el proceso de auditoría estilo Thermos.

Referencia operativa:

- `AGENTS.md`
- `docs/AI-WORK-PROTOCOL.md`

Todo cambio significativo debe poder explicarse en términos de responsabilidad, datos, comportamiento y riesgo.

## 15. Despliegue

Objetivo:

```text
git push
   ↓
GitHub
   ↓
CI / GitHub Actions
   ↓
typecheck + lint + build + tests
   ↓
Firebase Hosting
```

Los despliegues automáticos deben ocurrir únicamente después de pasar las comprobaciones establecidas.

## 16. Evolución

Antes de añadir una tecnología, preguntarse:

1. ¿Qué problema concreto resuelve?
2. ¿Puede resolverse con el stack actual?
3. ¿Qué complejidad introduce?
4. ¿Cómo se prueba?
5. ¿Cómo se elimina si deja de ser necesaria?

La arquitectura debe evolucionar con las necesidades reales de Meraki, no con las tendencias de herramientas.
