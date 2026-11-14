# Rediseño de Fondos Premium: Papelería de Lujo vs Acuarela Botánica Etérea

Plan arquitectónico y visual para elevar las ramas secundarias `opcion-a-degradado-editorial` y `opcion-c-organico` a un estándar de alta gama para **Meraki Spa & Beauty**, aplicando técnicas artísticas profundas en el catálogo, banners y modales de reserva.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones confirmadas por el usuario en Fase 1:**
> 1. **Opción A (Editorial):** *Papelería de alta gama con textura de papel de algodón (300g) y sombras cálidas multicapa.*
> 2. **Opción C (Orgánica):** *Acuarelas botánicas etéreas con transiciones suaves en verde salvia y veladuras difuminadas.*
> 3. **Alcance:** Aplicación en el **Catálogo completo**, **Banners principales** y **Modales de reserva**.

---

## 1. Overview & Core Concept

* **Propósito:** Reemplazar el aspecto plano y unicolor del fondo por dos expresiones artísticas de nivel profesional, respetando la identidad de bienestar orgánico y cosmética de lujo de Meraki.
* **Rama `opcion-a-degradado-editorial`:** Evoca un catálogo editorial impreso de colección (*estilo Kinfolk / Aesop / Cereal*). Presenta textura táctil de fibra de algodón, relieve de bajo contraste, iluminación cenital de estudio fotográfico y sombras cálidas teñidas con el verde salvia y terracota de la marca.
* **Rama `opcion-c-organico`:** Evoca un santuario de spa holístico natural. Presenta veladuras de acuarela botánica difuminadas con pigmentos verde salvia (`#AEC2AE`/`#5E765E`) y terracota suave (`#D5A688`), permitiendo que las tarjetas floten con ligera transparencia vitral (*frosted glass* de 88% de opacidad) sobre los lavados de acuarela.

---

## 2. User Experience & Visual Design

```
┌────────────────────────────────────────────────────────────────────────┐
│                   COMPARATIVA DE LAS 2 TÉCNICAS                         │
├───────────────────────────────────┬────────────────────────────────────┤
│   RAMA A: PAPELERÍA EDITORIAL     │    RAMA C: ACUARELA BOTÁNICA       │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Textura: Algodón 300g prensado  │ • Textura: Manchas de gouache suave│
│ • Luz: Radial cenital cálida      │ • Luz: Difusa orgánica ambiental   │
│ • Tarjetas: Blanco marfil biselado│ • Tarjetas: Frosted glass tenue    │
│ • Sombras: Cálidas multicapa      │ • Sombras: Suaves desvanecidas     │
│ • Acentos: Filetes editoriales    │ • Acentos: Veladuras salvia        │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Detalle de Implementación Visual por Rama

#### A. Rama `opcion-a-degradado-editorial`
1. **Fondo de Papel Algodón:** Micro-fibra generada por SVG noise fractal ultra-fino (`baseFrequency: 0.85`, opacidad 3.5%) sobre base marfil (`#FAF7F0`), combinado con un gradiente radial cenital que simula luz natural suave cayendo sobre una mesa de trabajo.
2. **Tarjetas de Servicio:** Fondo marfil puro (`#FFFFFF` con matiz crema tenue), borde perimetral doble micro-fino (`border-[#5E765E]/12`), relieve táctil y sombra multicapa:
   ```css
   box-shadow: 0 4px 6px -1px rgba(94, 118, 94, 0.05),
               0 16px 32px -4px rgba(94, 118, 94, 0.08),
               0 0 0 1px rgba(255, 255, 255, 0.8) inset;
   ```
3. **Banner y Cabeceras:** Tipografía `Cormorant Garamond` realzada con interlineado editorial y filetes milimétricos en salvia antiguo.

#### B. Rama `opcion-c-organico`
1. **Fondo de Acuarelas Botánicas Etéreas:** Malla de gradientes fluidos y manchas de acuarela generadas con SVG blurs multicapa (`feGaussianBlur stdDeviation: 40-70`), simulando lavados de acuarela en tonos verde salvia tenue (`#E2EBE2`), bruma de eucalipto y calidez terracota velada (`#F5EBE1`).
2. **Siluetas Botánicas Flotantes:** Elementos de acuarela de hojas de olivo y eucalipto con gradientes de opacidad variable colocados asimétricamente entre secciones.
3. **Tarjetas de Servicio en Frosted Glass Orgánico:** `bg-white/88 backdrop-blur-md` con borde satinado `border-white/60`, creando una sensación de ligereza e inmersión sensorial.

---

## 3. Key Product Decisions & Trade-Offs

* **Decisión 1: Mantener 0 KB de imágenes pesadas externas:**  
  *Ambas técnicas se generarán mediante CSS moderno y filtros SVG nativos embebidos en código.*  
  *Motivo:* No ralentiza la carga móvil, no requiere llamadas de red extra y mantiene puntuación perfecta en Lighthouse.
* **Decisión 2: Preservar el conmutador interactivo en desarrollo:**  
  *Se mantendrá el widget flotante de previsualización para comparar ambas opciones en vivo en cualquier momento, pero cada rama tendrá su técnica respectiva activada por defecto de forma nativa.*
* **Decisión 3: Cero regresiones funcionales:**  
  *El modal de citas en 3 etapas con multiservicios y la integración de captura a Google Sheets permanecerán intactos y 100% operativos en ambas ramas.*

---

## 4. Technical Architecture & File Plan

```
┌────────────────────────────────────────────────────────┐
│               SISTEMA DE TEMAS Y FONDOS                │
├────────────────────────────────────────────────────────┤
│  src/index.css                                         │
│   ├── [data-theme="editorial"]: Algodón + Sombras      │
│   └── [data-theme="organico"]: Acuarelas Botánicas     │
│                                                        │
│  src/components/common/WatercolorCanvas.tsx            │
│   └── Lienzo SVG con manchas de acuarela y veladuras   │
│                                                        │
│  src/routes/Catalogo.tsx                               │
│   └── Integración de relieve y transparencias          │
│                                                        │
│  src/components/modals/BookingModal.tsx                │
│   └── Adaptación estética de las 3 fases               │
└────────────────────────────────────────────────────────┘
```

### Tareas de Ejecución

1. **Crear componente `WatercolorCanvas.tsx`:** Generación de acuarelas botánicas etéreas con transiciones suaves en verde salvia y terracota.
2. **Actualizar `src/index.css`:**
   - Reglas de papelería de algodón de 300g con sombras cálidas profundas para `editorial`.
   - Reglas de acuarelas difusas y frosted glass para `organico`.
3. **Refinar `src/routes/Catalogo.tsx`:** Aplicar relieve de tarjetas, banners enriquecidos y espaciado curatorial.
4. **Refinar `src/components/modals/BookingModal.tsx`:** Adaptar el modal para que refleje la profundidad estética de cada estilo.
5. **Compilar y verificar linter:** Ejecutar `tsc --noEmit` y `oxlint` para asegurar 0 errores.
6. **Desplegar a las ramas secundarias en GitHub:**
   - Commit y push a `opcion-a-degradado-editorial` con default editorial.
   - Commit y push a `opcion-c-organico` con default acuarela botánica.
