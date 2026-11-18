# MERAKI — Protocolo de trabajo con IA

## Propósito

Este documento define cómo cualquier IA o agente de desarrollo debe trabajar sobre `WEB-MERAKI-1`. El objetivo es que varias IAs puedan colaborar sin duplicar trabajo, romper decisiones previas, introducir código genérico o perder contexto.

## Fuente de verdad

Orden de prioridad:

1. Código y configuración actualmente versionados en GitHub.
2. `docs/ARCHITECTURE.md`.
3. `AGENTS.md`.
4. Este protocolo.
5. Issues, PRs y decisiones documentadas en el repositorio.
6. Conversaciones externas, prompts o memoria de una IA.

Si existe conflicto, gana la fuente de mayor prioridad. Una IA no debe asumir que una instrucción conversacional reemplaza una decisión documentada sin modificar primero la documentación correspondiente.

## Regla de no destrucción

Antes de cambiar código existente:

- leer el archivo completo cuando sea relevante;
- revisar sus imports, callers y dependencias;
- entender la responsabilidad del módulo;
- comprobar si existe una decisión documentada relacionada;
- hacer el cambio mínimo que resuelva el problema;
- evitar refactors no relacionados.

No reemplazar arquitectura existente por preferencias personales de framework, estilo o IA.

## Trabajo por ramas

- `main` representa el estado integrable/producción.
- Cada cambio significativo debe vivir en una rama descriptiva.
- No trabajar directamente sobre `main` para cambios de arquitectura o funcionalidad.
- Un PR debe tener un propósito único y describir riesgos, validaciones y cambios.
- No mezclar limpieza cosmética con cambios funcionales salvo que sea necesario para la misma corrección.

## Protocolo de inicio de cada tarea

Toda IA debe comenzar con:

1. Identificar el objetivo concreto.
2. Revisar `docs/ARCHITECTURE.md`.
3. Revisar `AGENTS.md`.
4. Inspeccionar los archivos afectados.
5. Buscar referencias y usos antes de modificar contratos.
6. Comprobar si otra rama/PR ya está trabajando sobre la misma zona cuando esa información esté disponible.

## Protocolo de implementación

La IA debe:

- reutilizar componentes y tokens existentes antes de crear nuevos;
- preferir tipos de dominio explícitos;
- mantener límites claros entre UI, dominio, infraestructura y datos;
- validar entradas en los límites del sistema;
- mantener accesibilidad y responsive como requisitos funcionales;
- evitar dependencias nuevas sin justificar su necesidad;
- no introducir datos, logos, precios, fotografías o claims de negocio inventados;
- no introducir secretos en el repositorio;
- evitar código generado que solamente rellene espacio o repita patrones visuales sin propósito.

## Protocolo anti-slop

Toda IA debe tratar `dmmulroy/anti-slop` como referencia de calidad para TypeScript/JavaScript.

Se deben evitar especialmente:

- casts encadenados o innecesarios;
- ampliar un valor conocido y volver a estrecharlo con assertions;
- parámetros `object` genéricos;
- parámetros/retornos `unknown` sin contrato de frontera;
- diccionarios inseguros;
- narrowing runtime improvisado cuando corresponde validar/parsear;
- `filter().map()` cuando una sola pasada expresa mejor la intención;
- reducers que copian acumuladores innecesariamente;
- mocking de módulos como sustituto de diseño de dependencias;
- spreads condicionales que esconden formas de datos;
- abstracciones genéricas que no aportan una responsabilidad clara.

## Protocolo Thermos

Para cambios no triviales, realizar una revisión estilo Thermos antes de solicitar integración:

### Correctness / security

- ¿Qué puede fallar?
- ¿Qué ocurre con datos inválidos, vacíos o inesperados?
- ¿Hay fronteras de confianza?
- ¿Hay secretos, permisos o datos de usuario involucrados?
- ¿Se puede producir una regresión silenciosa?

### Calidad / arquitectura

- ¿El cambio reduce o aumenta complejidad?
- ¿Se está creando una abstracción prematura?
- ¿El componente tiene una sola responsabilidad?
- ¿El archivo está creciendo de forma injustificada?
- ¿Existe duplicación real que deba resolverse?
- ¿El código sigue siendo comprensible sin depender del contexto de una IA?

### UI

- ¿La interfaz tiene una razón de existir?
- ¿Respeta el sistema visual Meraki?
- ¿Funciona con teclado?
- ¿Tiene estados de foco y error apropiados?
- ¿Respeta `prefers-reduced-motion` cuando corresponde?
- ¿Funciona en móvil y escritorio?

## Colaboración entre IAs

Varias IAs pueden trabajar simultáneamente. Para evitar conflictos:

- una IA debe declarar claramente qué archivos está modificando cuando la plataforma lo permita;
- evitar editar el mismo archivo desde dos tareas simultáneas;
- si dos cambios necesitan el mismo archivo, una IA debe integrar el contexto existente antes de sobrescribirlo;
- nunca copiar una versión antigua de un archivo completo encima de una versión más nueva para resolver un conflicto;
- ante conflicto semántico, conservar primero la funcionalidad existente y después integrar el nuevo requisito.

## Entrega de una IA

Cada tarea terminada debe dejar suficiente información para la siguiente IA:

- objetivo realizado;
- archivos modificados;
- decisiones relevantes;
- validaciones ejecutadas;
- problemas conocidos;
- trabajo pendiente;
- riesgos o cambios de comportamiento.

Cuando corresponda, registrar esta información en el PR o issue, no solamente en el chat.

## Validación mínima

Antes de declarar una tarea terminada, ejecutar las comprobaciones disponibles para el proyecto:

- typecheck;
- lint;
- build;
- tests, si existen;
- revisión del diff.

Si una comprobación no pudo ejecutarse, decirlo explícitamente. Nunca afirmar que una prueba pasó sin haberla ejecutado.

## Cambios de arquitectura

Un cambio arquitectónico debe actualizar `docs/ARCHITECTURE.md` en el mismo PR cuando modifique:

- estructura de carpetas;
- responsabilidades de módulos;
- flujo de datos;
- integración Firebase;
- routing;
- autenticación;
- persistencia;
- estrategia de despliegue;
- sistema de diseño.

## Seguridad

Nunca subir:

- `.env` con secretos;
- service-account JSON;
- private keys;
- tokens;
- contraseñas;
- credenciales Firebase privadas.

Las variables públicas de frontend deben distinguirse de secretos de backend y documentarse sin incluir valores sensibles.

## Filosofía

> La IA debe aumentar la capacidad del equipo, no reemplazar el criterio del equipo.

El código debe seguir siendo mantenible por una persona que no haya participado en la conversación que lo generó.
