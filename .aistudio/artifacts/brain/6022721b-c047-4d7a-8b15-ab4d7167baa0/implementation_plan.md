# Gestor de Catálogo en Admin y Ficha Detallada Tipo Tienda Online

Sistema integral para administrar el catálogo de servicios de Meraki Spa directamente desde el panel administrativo (títulos, descripciones, precios, variantes, estado activo/pausado y hasta 11 imágenes por servicio entre foto principal y galería) y reflejar cada servicio en una página de ficha detallada independiente con experiencia de tienda online.

## Revisión de Decisiones Confirmadas

> [!IMPORTANT] Todas tus preferencias de la fase anterior quedaron integradas como base obligatoria de este diseño. Cualquier ajuste adicional sobre permisos o estructura visual puede indicarse antes de aprobar la ejecución.

- **Despliegue de la ficha en la web**: Página independiente dedicada por cada servicio (`/catalogo/:serviceId`) accesible desde cualquier tarjeta del catálogo, el inicio y enlaces directos compartibles.
- **Capacidad multimedia por servicio**: Imagen principal más galería de hasta **10 fotografías adicionales** (hasta 11 imágenes totales por servicio).
- **Métodos de carga de imágenes**: Subida directa de archivos desde PC o celular (con optimización automática) y entrada mediante enlace URL externo o existente.
- **Alcance de gestión en Admin**: Editar servicios existentes, crear nuevos servicios desde cero y pausar/reactivar servicios sin perder el historial de reservas previas.

---

## 1. Visión General y Concepto Central

- **Qué resuelve**: Desacopla el catálogo de texto fijo en código para convertirlo en un catálogo vivo sincronizado con Firestore. El equipo administrativo actualiza tarifas, fotos, textos o disponibilidad en segundos, y las clientas exploran cada tratamiento en una ficha de producto editorial con galería navegable, variantes interactivas y reserva directa.
- **Público objetivo**:
  - *Clientas de Meraki Spa*: Quieren inspeccionar visualmente resultados, qué incluye el ritual, opciones de duración o zona y el precio final antes de agendar.
  - *Administración / Equipo autorizado*: Necesita ajustar precios, renovar fotografías reales desde el teléfono o escritorio y pausar servicios temporales sin intervención técnica.
- **Valor principal**: Convierte el catálogo informativo en una experiencia e-commerce de bienestar coherente con la marca, eliminando ediciones manuales de código para el mantenimiento diario.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujos Principales

1. **Exploración y Ficha Detallada (Clienta en Web)**:
   - En el catálogo general, cada tarjeta muestra imagen principal, categoría en texto limpio, título, descripción breve, precio tabular y acción directa para abrir la **Ficha Detallada** o **Agendar**.
   - Al entrar en la ficha dedicada de un servicio, se abre una vista de dos columnas equilibradas sobre fondo crema cálido (`#FFF2DE` / `#FFFDF9`):
     - **Columna izquierda (Galería E-Commerce)**: Visor principal amplio (`4:3`) con navegación por flechas, teclado y ampliación visual, acompañado debajo por una tira interactiva de miniaturas (foto principal + hasta 10 fotos de galería).
     - **Columna derecha (Módulo Contiguo de Compra/Reserva)**: Ruta de navegación (*Inicio / Catálogo / Categoría / Servicio*), título editorial en `Cormorant Garamond`, tarifa con tipografía tabular (`tabular-nums`), selector interactivo de variantes/duraciones/zonas cuando aplica, botón principal **"Agendar este servicio"** (que abre el flujo de reserva preseleccionado con ese servicio y variante exacta) y botón secundario de consulta por WhatsApp.
   - En móvil, una barra inferior fija compacta mantiene visible el precio seleccionado y el botón de reserva sin superar el 15 % del alto de pantalla.
   - Debajo del módulo principal se organizan secciones claras para *Qué incluye el ritual*, *Notas y cuidados previos*, *Modalidades Estudio vs. Domicilio* y hasta 3 *Servicios relacionados* de la misma categoría.

2. **Gestión del Catálogo en Panel Administrador**:
   - Nueva pestaña **"Catálogo & Servicios"** dentro del panel administrativo.
   - Vista de inventario tabular filtrable por categoría, búsqueda por nombre y estado (`Activos` / `Pausados`), con botón superior **"+ Nuevo servicio"**.
   - Al seleccionar un servicio (o crear uno nuevo), se despliega un editor ordenado en tres bloques claros:
     1. **Información y Estado**: Título, categoría, subcategoría, descripción editorial, lista dinámica de ítems *"Qué incluye"*, nota de cuidados, marca de servicio destacado y conmutador visible **Activo / Pausado**.
     2. **Tarifas, Variantes y Duración**: Elección entre **Precio único** (con opción "Bajo pedido") o **Lista de variantes** (por duración, sesiones o zona corporal, editables en etiqueta y monto en soles), además de la duración estimada para el motor de agenda.
     3. **Estudio Multimedia (Principal + hasta 10 de Galería)**: Zona de carga que permite seleccionar múltiples archivos desde PC o celular (compresión automática instantánea con vista previa) o pegar enlaces URL; cada miniatura incluye controles para fijarla como **Principal**, reordenar su posición o eliminarla.
   - Botón directo **"Ver ficha en la web"** para comprobar el resultado final publicado.

### Identidad Visual y Tema

- **Dirección estética**: Editorial botánico de lujo artesanal combinado con claridad funcional en el panel interno de gestión (`1_ecommerce_retail` para la tienda y ficha; `3_saas_dashboard` para la consola administrativa).
- **Paleta de color (60-30-10)**:
  - *60 % Lienzo dominante*: Crema cálido (`#FFF2DE` / `#FFFDF9`) en la web pública y blanco/neutro limpio en formularios administrativos.
  - *30 % Superficies estructurales*: Bordes finos de 1 px en salvia tenue, divisores sutiles sin tarjetas anidadas innecesarias ni bordes laterales gruesos.
  - *10 % Acento intencional*: Verde salvia profundo (`#5E765E`) en acciones principales y cobre suave (`#D5A688`) para detalles tipográficos y resaltados discretos.
- **Tipografía y jerarquía**: Preservación de `Cormorant Garamond` para títulos de servicio y `Montserrat` para cuerpo, etiquetas de interfaz y precios alineados con `tabular-nums`. Metadatos limpios sin acumulación de cápsulas decorativas.

---

## 3. Decisiones Clave de Producto y Compromisos Técnicos

1. **Almacenamiento seguro de hasta 11 fotos sin dependencias de Firebase Storage sin configurar**:
   - *Enfoque elegido*: Compresión automática en el navegador (`WebP`/`JPEG`, máx. 1000 px) y almacenamiento de cada foto subida en una colección dedicada de medios (`catalogMedia`), mientras que el documento del servicio guarda solo referencias ligeras (`URL externa` o identificador interno de medio) junto con compatibilidad total para pegar enlaces URL directos.
   - *Por qué*: Los documentos de Firestore tienen un límite estricto de 1 MB. Guardar 11 fotos dentro del documento del servicio saturaría ese límite y volvería lento todo el catálogo; además, la carga directa a Storage fallaría si no se configuran manualmente reglas y CORS en Storage. Con referencias ligeras, la lista del catálogo carga al instante y cada foto de galería se obtiene bajo demanda dentro de los límites de Firestore y sus reglas de seguridad desplegables automáticamente.
   - *Alternativas descartadas*: Guardar imágenes en Base64 dentro del mismo documento del servicio (riesgo alto de exceder 1 MB) o exigir que el administrador suba archivos primero a un servidor externo.

2. **Fusión transparente sobre el catálogo base existente**:
   - *Enfoque elegido*: Los servicios actuales actúan como base instantánea sin tiempos en blanco; cualquier servicio editado, creado o pausado desde Admin se guarda en Firestore y prevalece en tiempo real para todos los visitantes y en el flujo de reservas.
   - *Por qué*: Evita dejar el catálogo vacío en el arranque, permite editar cualquier tratamiento individual sin esperar migraciones manuales y protege reservas históricas aunque un servicio se pause después.
   - *Alternativas descartadas*: Reemplazar todo por una base vacía que obligaría a reescribir los 44 servicios a mano.

3. **Compatibilidad de permisos administrativos existentes**:
   - *Enfoque elegido*: Permitir la gestión del catálogo al propietario central y al personal autorizado con permiso de agenda/gestión operativa (sin romper documentos actuales del equipo en base de datos), con reglas estrictas de validación por tipo y tamaño en Firestore.
   - *Por qué*: Mantiene el acceso fluido para el personal ya registrado mientras impide escrituras no autorizadas o alteración de campos desde fuera del panel.

---

## 4. Arquitectura Técnica y Estrategia de Datos *(Referencia Técnica)*

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         Capa de Datos en Firestore                        │
│  ┌────────────────────────────────┐   ┌────────────────────────────────┐  │
│  │   catalogServices/{serviceId}  │   │     catalogMedia/{mediaId}     │  │
│  │  • título, categoría, textos   │   │  • imagen comprimida (<=400KB) │  │
│  │  • precio / variantes / estado │──▶│  • tipo MIME y dimensiones     │  │
│  │  • foto principal + galería[]  │   │  • referencia al servicio      │  │
│  └────────────────────────────────┘   └────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────┬─────────────────┘
                           │                              │
                           ▼                              ▼
┌───────────────────────────────────────────┐   ┌───────────────────────────┐
│        Contexto Reactivo de Catálogo      │   │  Motor de Optimización    │
│  • Fusiona base oficial + overrides nube  │   │  • Redimensiona fotos PC/ │
│  • Filtra pausados en storefront público  │   │    móvil en Canvas (<1000px)│
│  • Expone estado único a toda la app      │   │  • Valida enlaces URL     │
└──────┬───────────────────────┬────────────┘   └─────────────┬─────────────┘
       │                       │                              │
       ▼                       ▼                              ▼
┌─────────────────┐   ┌──────────────────────┐   ┌──────────────────────────┐
│  Web Pública    │   │   Ficha Dedicada     │   │  Panel Admin: Catálogo   │
│ • Inicio        │   │  (/catalogo/:id)     │   │ • Tabla filtrable +      │
│ • Catálogo      │──▶│ • Galería 1+10 fotos │   │   pausar/activar rápido  │
│ • Reserva Modal │   │ • Variantes & precio │   │ • Editor textos/precios  │
│ • Contacto      │   │ • CTA Agendar directo│   │ • Gestor 1+10 imágenes   │
└─────────────────┘   └──────────────────────┘   └──────────────────────────┘
```

### Modelo de Datos y Estados

- **Servicio de Catálogo (`CatalogService`)**: Extiende el contrato actual con `gallery` (lista acotada de hasta 10 URLs o referencias `media://`), `active` (booleano para pausar u ocultar en web), `durationMin` (minutos estimados opcionales para agenda), `displayOrder` y marca de actualización.
- **Medio de Catálogo (`CatalogMediaItem`)**: Documento independiente para cada imagen subida desde dispositivo, evitando sobrecargar las consultas del listado principal y cumpliendo los topes volumétricos declarados en `firebase-blueprint.json` y `firestore.rules`.
- **Resolución de Medios**: Un componente unificado de imagen resuelve de forma transparente tanto rutas locales (`/assets/...`), URLs externas (`https://...`) como referencias internas (`media://{id}`), con estado de carga esqueleto y respaldo visual si alguna URL externa deja de estar disponible.

### Mapeo de Interacciones y Validación

- **Reglas de Seguridad y Blueprint**: Se actualizará el esquema oficial de entidades junto con las funciones validadoras en `firestore.rules` (verificación de longitudes máximas, tipos estrictos, límite de máximo 10 elementos en `gallery` y control de acceso exclusivo de lectura pública sobre servicios activos / escritura restringida a administradores verificados), validando con ESLint de seguridad y desplegando reglas mediante `DeployRules`.
- **Integridad de Enlaces y Reservas**: Al pulsar **Agendar** desde la ficha detallada de un servicio, el modal de reserva recibe exactamente el `serviceId` y el índice de variante seleccionado con los precios actualizados en vivo desde el contexto unificado del catálogo.
