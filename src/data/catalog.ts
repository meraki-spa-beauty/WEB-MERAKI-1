import type { CatalogService, ServiceCategory } from '../types';

export const CATEGORIES_DATA: { id: ServiceCategory | 'todos'; label: string; count: number; description: string }[] = [
  {
    id: 'todos',
    label: 'Todo el Catálogo',
    count: 36,
    description: 'Catálogo oficial de servicios de spa y belleza en estudio (Pueblo Libre) y a domicilio u oficina'
  },
  {
    id: 'manos',
    label: 'Manos & Uñas',
    count: 12,
    description: 'Manicura básica, gel, acrílicos con tips y esculpidas'
  },
  {
    id: 'pies',
    label: 'Cuidado de Pies',
    count: 3,
    description: 'Pedicura básica, esmaltado gel y jellyparafina spa'
  },
  {
    id: 'pestanas',
    label: 'Pestañas',
    count: 6,
    description: 'Lifting de pestañas y extensiones pelo a pelo, rímel, volumen e híbrido'
  },
  {
    id: 'depilacion',
    label: 'Depilación',
    count: 18,
    description: 'Depilación facial en cera e hilo, y corporal en zonas cera'
  },
  {
    id: 'masajes',
    label: 'Masajes & Packs',
    count: 5,
    description: 'Masajes relajantes, descontracturantes y packs reductores/drenaje'
  },
  {
    id: 'faciales',
    label: 'Faciales',
    count: 3,
    description: 'Tratamientos faciales básico, intermedio y profundo con máscara LED'
  }
];

export const CATALOG_SERVICES: CatalogService[] = [
  // ==========================================
  // MANOS (Páginas 3 y 4)
  // ==========================================
  {
    id: 'manos-basica',
    name: 'Básica',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Manos Básico',
    pricePEN: 60,
    description: 'Cuidado esencial y prolijo para las manos con acabado natural.',
    includes: ['Corte y limado higiénico de uñas', 'Limpieza y cuidado suave de cutículas', 'Exfoliación hidratante y esmaltado tradicional'],
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'manos-esmalte-gel',
    name: 'Esmalte Gel',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Manos Básico',
    pricePEN: 80,
    popular: true,
    description: 'Esmaltado semipermanente de máxima duración con secado inmediato bajo lámpara LED.',
    includes: ['Manicura completa preparatoria', 'Esmaltado en gel con brillo prolongado', 'Hidratación final con aceite de cutículas'],
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'manos-jelly-parafina',
    name: 'Jelly Parafina Spa',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Manos Básico',
    pricePEN: 95,
    description: 'Tratamiento restaurador intensivo para manos secas o deshidratadas.',
    includes: ['Baño sensorial de textura jelly', 'Envoltura tibia de parafina nutritiva', 'Masaje nutritivo y acabado sedoso'],
    image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'manos-rubber-gel',
    name: 'Rubber Gel',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Acrílicos + Tip',
    pricePEN: 120,
    description: 'Base autonivelante de alta flexibilidad y resistencia que protege y refuerza la uña natural.',
    includes: ['Preparación profunda de uña natural', 'Nivelación con base rubber fortalecedora', 'Esmaltado y sellado de alta resistencia'],
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'manos-tip-poligel',
    name: 'Tip + Poligel',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Acrílicos + Tip',
    pricePEN: 150,
    description: 'Extensión con tip combinada con la ligereza y resistencia del poligel.',
    includes: ['Colocación precisa de tips', 'Estructura moldeada en poligel ligero', 'Limado estético y esmaltado'],
    note: 'Los mantenimientos tienen el mismo coste que la puesta inicial (remisión del 90% y sistema nuevo).',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'manos-tip-acrilico-clear',
    name: 'Tip + Acrílico Clear',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Acrílicos + Tip',
    pricePEN: 150,
    description: 'Extensión de uñas con tip y estructura clásica en acrílico transparente.',
    includes: ['Colocación de tips con ajuste anatómico', 'Aplicación de acrílico cristal de alta firmeza', 'Pulido y acabado brillante'],
    note: 'Los mantenimientos tienen el mismo coste que la puesta inicial (remisión del 90% y sistema nuevo).',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'manos-poligel-baby-boomer',
    name: 'Poligel Baby Boomer',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Acrílicos + Tip',
    pricePEN: 180,
    popular: true,
    description: 'Degradado sofisticado y elegante en tonos nude y blanco lechoso con poligel.',
    includes: ['Estructura con tips o molde', 'Difuminado baby boomer de acabado perfecto', 'Sellado de brillo cristalino'],
    note: 'Los mantenimientos tienen el mismo coste que la puesta inicial (remisión del 90% y sistema nuevo).',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'manos-esculpidas-poligel-clear',
    name: 'Poligel Clear (Esculpida)',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Esculpidas',
    pricePEN: 150,
    description: 'Uñas esculpidas directamente con molde en poligel transparente sin tips.',
    includes: ['Colocación de moldes anatómicos', 'Esculpido manual en poligel traslúcido', 'Limado de precisión y esmaltado'],
    note: 'Los mantenimientos tienen el mismo coste que la puesta inicial (remisión del 90% y sistema nuevo).',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'manos-esculpidas-poligel-colores',
    name: 'Poligel de Colores (Esculpida)',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Esculpidas',
    pricePEN: 180,
    description: 'Uñas esculpidas en poligel con color incorporado para un tono uniforme y duradero.',
    includes: ['Esculpido con molde en poligel tonalizado', 'Curado en lámpara y arquitectura de uña', 'Sellado final de larga duración'],
    note: 'Los mantenimientos tienen el mismo coste que la puesta inicial (remisión del 90% y sistema nuevo).',
    image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'manos-esculpidas-acrilico-clear',
    name: 'Acrílico Clear (Esculpida)',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Esculpidas',
    pricePEN: 170,
    description: 'Esculpido tradicional de máxima durabilidad y resistencia en acrílico cristalino.',
    includes: ['Diseño sobre molde personalizado', 'Aplicación de acrílico premium resistente', 'Estructurado, limado y brillo espejo'],
    note: 'Los mantenimientos tienen el mismo coste que la puesta inicial (remisión del 90% y sistema nuevo).',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'manos-esculpidas-acrilico-colores',
    name: 'Acrílico Colores (Esculpida)',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Esculpidas',
    pricePEN: 180,
    description: 'Uñas esculpidas en acrílico a elección: Baby Boomer, Francesa o Nude.',
    includes: ['Técnica a elección: Baby Boomer, Francesa o tono Nude', 'Esculpido completo con moldes profesionales', 'Acabado y sellado final'],
    note: 'Los mantenimientos tienen el mismo coste que la puesta inicial (remisión del 90% y sistema nuevo).',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'manos-retirado-sistemas',
    name: 'Retirado de Sistemas',
    category: 'manos',
    categoryLabel: 'Manos',
    subcategory: 'Esculpidas & Retiro',
    pricePEN: 50,
    description: 'Retiro seguro y cuidadoso de sistemas acrílicos o poligel protegiendo la lámina ungueal.',
    includes: ['Remoción química y mecánica cuidadosa', 'Pulido suave de la uña natural', 'Tratamiento nutritivo de fortalecimiento'],
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80'
  },

  // ==========================================
  // PIES (Página 4)
  // ==========================================
  {
    id: 'pies-basico',
    name: 'Pies Básico',
    category: 'pies',
    categoryLabel: 'Pies',
    subcategory: 'Cuidado de Pies',
    pricePEN: 70,
    description: 'Pedicura higiénica integral para mantener tus pies impecables y descansados.',
    includes: ['Baño podal relajante', 'Limpieza y corte estético de uñas', 'Exfoliación de asperezas y esmaltado tradicional'],
    image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pies-gel',
    name: 'Pies Gel',
    category: 'pies',
    categoryLabel: 'Pies',
    subcategory: 'Cuidado de Pies',
    pricePEN: 90,
    popular: true,
    description: 'Pedicura completa combinada con esmaltado en gel de secado inmediato y resistencia absoluta.',
    includes: ['Pedicura completa e higiene de talones', 'Esmalte en gel de máxima duración', 'Secado en lámpara que permite calzarte de inmediato'],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pies-jellyparafina',
    name: 'Pies Jellyparafina Spa',
    category: 'pies',
    categoryLabel: 'Pies',
    subcategory: 'Cuidado de Pies',
    pricePEN: 105,
    description: 'Ritual spa de máxima hidratación para aliviar pies cansados y talones resecos.',
    includes: ['Inmersión en gelatina botánica tibia (Jelly Spa)', 'Exfoliación profunda desincrustante', 'Tratamiento de parafina térmica hidratante y masaje'],
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80'
  },

  // ==========================================
  // PESTAÑAS (Página 5)
  // ==========================================
  {
    id: 'pestanas-lifting',
    name: 'Lifting de Pestañas',
    category: 'pestanas',
    categoryLabel: 'Pestañas',
    subcategory: 'Pestañas Básicas',
    pricePEN: 100,
    popular: true,
    description: 'Elevación y curvatura duradera de tus pestañas naturales desde la raíz.',
    includes: ['Elevación y moldeado curvo de pestañas propias', 'Nutrición profunda con keratina', 'Efecto de ojos abiertos y descansados por 4 a 6 semanas'],
    image: 'https://images.unsplash.com/photo-1583001800475-7f55f6063b4f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pestanas-clasicas',
    name: 'Extensión Clásicas',
    category: 'pestanas',
    categoryLabel: 'Pestañas',
    subcategory: 'Extensión de Pestaña',
    pricePEN: 120,
    description: 'Aplicación meticulosa pelo a pelo para un resultado natural, ligero y elegante.',
    includes: ['Técnica 1:1 sobre cada pestaña natural', 'Aislamiento cuidadoso con adhesivo hipoalergénico', 'Efecto natural ideal para el día a día'],
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pestanas-efecto-rimel',
    name: 'Extensión Efecto Rímel',
    category: 'pestanas',
    categoryLabel: 'Pestañas',
    subcategory: 'Extensión de Pestaña',
    pricePEN: 120,
    description: 'Simula el efecto de pestañas recién maquilladas con máscara de pestañas de alta definición.',
    includes: ['Fibras con mayor grosor y pigmentación', 'Curvatura estilizada que define la mirada', 'Olvídate del rímel y desmaquillante diario'],
    image: 'https://images.unsplash.com/photo-1583001800475-7f55f6063b4f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pestanas-efecto-volumen',
    name: 'Extensión Efecto Volumen',
    category: 'pestanas',
    categoryLabel: 'Pestañas',
    subcategory: 'Extensión de Pestaña',
    pricePEN: 150,
    popular: true,
    description: 'Abanicos ultralivianos de volumen ruso para una mirada densa, tupida e impactante.',
    includes: ['Abanicos hechos a mano según tu tolerancia natural', 'Gran densidad sin añadir peso nocivo', 'Efecto glamuroso y aterciopelado'],
    image: 'https://images.unsplash.com/photo-1512290900672-1f41d739e1e2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pestanas-efecto-hibrido',
    name: 'Extensión Efecto Híbrido',
    category: 'pestanas',
    categoryLabel: 'Pestañas',
    subcategory: 'Extensión de Pestaña',
    pricePEN: 180,
    description: 'Combinación balanceada de técnica clásica pelo a pelo con abanicos de volumen.',
    includes: ['Textura multidimensional con efecto de pestañas tupidas', 'Diseño personalizado al tipo de ojo', 'Excelente retención y estilo moderno'],
    image: 'https://images.unsplash.com/photo-1583001800475-7f55f6063b4f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pestanas-retoque',
    name: 'Retoque de Pestañas',
    category: 'pestanas',
    categoryLabel: 'Pestañas',
    subcategory: 'Extensión de Pestaña',
    pricePEN: 100,
    description: 'Mantenimiento y relleno de extensiones para conservar la plenitud de la mirada.',
    includes: ['Retiro de extensiones crecidas', 'Relleno de nuevos espacios', 'Peinado y sellado protector'],
    note: 'El costo del retoque es solo para los primeros 15 días luego de la puesta del sistema. Y dependerá de la condición en la que lleguen las pestañas.'
  },

  // ==========================================
  // DEPILACIÓN (Páginas 6 y 7)
  // ==========================================
  {
    id: 'depilacion-cejas',
    name: 'Depilación de Cejas',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Faciales',
    priceOptions: [
      { label: 'Cera', pricePEN: 30 },
      { label: 'Hilo', pricePEN: 25 }
    ],
    description: 'Perfilado y limpieza de cejas según la armonía facial.',
    includes: ['Diseño y perfilado estético', 'Técnica en cera tibia hipoalergénica o hilo hindú', 'Gel calmante descongestivo'],
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'depilacion-bozo',
    name: 'Depilación de Bozo',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Faciales',
    priceOptions: [
      { label: 'Cera', pricePEN: 20 },
      { label: 'Hilo', pricePEN: 15 }
    ],
    description: 'Eliminación rápida y suave del vello del labio superior.',
    includes: ['Elección entre cera suave o hilo de algodón', 'Protección previa de la piel y tónico calmante']
  },
  {
    id: 'depilacion-patillas',
    name: 'Depilación de Patillas',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Faciales',
    priceOptions: [
      { label: 'Cera', pricePEN: 30 },
      { label: 'Hilo', pricePEN: 27 }
    ],
    description: 'Definición del contorno lateral del rostro.',
    includes: ['Limpieza precisa del lateral facial', 'Técnica en cera o hilo según sensibilidad']
  },
  {
    id: 'depilacion-menton',
    name: 'Depilación de Mentón',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Faciales',
    priceOptions: [
      { label: 'Cera', pricePEN: 25 },
      { label: 'Hilo', pricePEN: 22 }
    ],
    description: 'Depilación del vello en la zona del mentón con efecto suave.',
    includes: ['Extracción de raíz con cera o hilo', 'Loción descongestiva posdepilatoria']
  },
  {
    id: 'depilacion-frente',
    name: 'Depilación de Frente',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Faciales',
    priceOptions: [
      { label: 'Cera', pricePEN: 30 },
      { label: 'Hilo', pricePEN: 27 }
    ],
    description: 'Despeje estético de la línea capilar y zona frontal.',
    includes: ['Limpieza prolija de la zona frontal', 'Acabado suave y limpio']
  },
  {
    id: 'depilacion-rostro-completo',
    name: 'Rostro Completo',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Faciales',
    popular: true,
    priceOptions: [
      { label: 'Cera', pricePEN: 70 },
      { label: 'Hilo', pricePEN: 65 }
    ],
    description: 'Depilación integral de cejas, bozo, patillas, mentón y frente en una sola sesión.',
    includes: ['Cejas, bozo, patillas, mentón y frente', 'Técnica a elección (Cera S/ 70 o Hilo S/ 65)', 'Mascarilla o gel refrescante para cerrar poros'],
    image: 'https://images.unsplash.com/photo-1512290900672-1f41d739e1e2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'depilacion-axilas',
    name: 'Axilas (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Corporales Cera',
    pricePEN: 35,
    description: 'Depilación higiénica con cera tibia que debilita progresivamente el vello.',
    includes: ['Cera descartable higiénica', 'Aplicación de talco preparatorio y loción calmante']
  },
  {
    id: 'depilacion-medio-brazo',
    name: 'Medio Brazo (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Corporales Cera',
    pricePEN: 45,
    description: 'Depilación desde codo hasta muñeca con cera tibia.',
    includes: ['Depilación en ambos antebrazos', 'Hidratación calmante inmediata']
  },
  {
    id: 'depilacion-brazo-completo',
    name: 'Brazo Completo (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Corporales Cera',
    pricePEN: 60,
    description: 'Depilación integral de ambos brazos desde el hombro.',
    includes: ['Brazos completos de hombro a muñeca', 'Retiro uniforme de raíz y suavizado']
  },
  {
    id: 'depilacion-media-pierna',
    name: 'Media Pierna (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Corporales Cera',
    pricePEN: 50,
    description: 'Depilación desde rodillas hasta tobillos con cera elástica.',
    includes: ['Ambas pantorrillas y empeines', 'Aceite descongestivo de manzanilla']
  },
  {
    id: 'depilacion-pierna-completa',
    name: 'Pierna Completa (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Corporales Cera',
    pricePEN: 80,
    popular: true,
    description: 'Depilación completa de ambas piernas de muslos a pies.',
    includes: ['Muslos, rodillas, pantorrillas y pies', 'Cera de alta calidad y máxima suavidad'],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'depilacion-bikini',
    name: 'Bikini (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Cera Íntima & Tronco',
    pricePEN: 40,
    description: 'Depilación de los bordes externos de la línea del bikini.',
    includes: ['Depilación precisa de laterales', 'Cera especial para pieles sensibles']
  },
  {
    id: 'depilacion-mini-bikini',
    name: 'Mini Bikini (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Cera Íntima & Tronco',
    pricePEN: 45,
    description: 'Depilación más profunda en laterales y parte superior del bikini.',
    includes: ['Mayor cobertura que el bikini tradicional', 'Protocolo suave y delicado']
  },
  {
    id: 'depilacion-brasilera',
    name: 'Brasilera (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Cera Íntima & Tronco',
    pricePEN: 70,
    popular: true,
    description: 'Depilación íntima completa con la máxima higiene y delicadeza.',
    includes: ['Depilación total de la zona íntima', 'Cera elástica hipoalergénica de baja temperatura'],
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'depilacion-espalda-baja',
    name: 'Espalda Baja (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Cera Íntima & Tronco',
    pricePEN: 40,
    description: 'Depilación de la zona lumbar con cera tibia.',
    includes: ['Zona sacrolumbar', 'Loción calmante posdepilación']
  },
  {
    id: 'depilacion-espalda-completa',
    name: 'Espalda Completa (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Cera Íntima & Tronco',
    pricePEN: 80,
    description: 'Depilación desde hombros y cervicales hasta la zona lumbar.',
    includes: ['Toda la superficie de la espalda', 'Piel suave y libre de vello']
  },
  {
    id: 'depilacion-gluteos',
    name: 'Glúteos (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Cera Íntima & Tronco',
    pricePEN: 50,
    description: 'Depilación de glúteos con cera de alta tolerancia dérmica.',
    includes: ['Zona glútea completa', 'Tratamiento calmante de cierre']
  },
  {
    id: 'depilacion-abdomen',
    name: 'Abdomen (Cera)',
    category: 'depilacion',
    categoryLabel: 'Depilación',
    subcategory: 'Zonas Cera Íntima & Tronco',
    pricePEN: 45,
    description: 'Depilación de la zona abdominal completa.',
    includes: ['Línea alba y zona abdominal', 'Piel tersa y libre de irritación']
  },

  // ==========================================
  // MASAJES (Página 8)
  // ==========================================
  {
    id: 'masajes-relajantes',
    name: 'Masajes Relajantes',
    category: 'masajes',
    categoryLabel: 'Masajes',
    subcategory: 'Masajes Individuales',
    popular: true,
    priceOptions: [
      { label: '1 Hora', pricePEN: 100 },
      { label: '1/2 Hora (30 min)', pricePEN: 60 }
    ],
    description: 'Maniobras rítmicas y suaves para inducir el descanso y aliviar el estrés corporal.',
    includes: ['Maniobras relajantes continuas con aceites esenciales', 'Música ambiental y aromaterapia en tu propio espacio', 'Enfocado en soltar tensiones y renovar la energía'],
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'masajes-descontracturantes',
    name: 'Masajes Descontracturantes',
    category: 'masajes',
    categoryLabel: 'Masajes',
    subcategory: 'Masajes Individuales',
    popular: true,
    priceOptions: [
      { label: '1 Hora', pricePEN: 120 },
      { label: '1/2 Hora (30 min)', pricePEN: 80 }
    ],
    description: 'Presión focalizada para desarmar nudos y aliviar contracturas en espalda, cuello y hombros.',
    includes: ['Evaluación previa de puntos de tensión', 'Maniobras profundas para liberar contracturas crónicas', 'Bálsamo analgésico desinflamatorio'],
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'masajes-pack-mesoterapia',
    name: 'Pack Mesoterapia',
    category: 'masajes',
    categoryLabel: 'Masajes',
    subcategory: 'Packs Corporales',
    priceOptions: [
      { label: '4 Sesiones', pricePEN: 580, sessions: 4 },
      { label: '6 Sesiones', pricePEN: 730, sessions: 6 },
      { label: '8 Sesiones', pricePEN: 880, sessions: 8 }
    ],
    description: 'Tratamiento corporal avanzado orientado a la reducción de grasa localizada y mejora de la firmeza.',
    includes: ['Protocolo por sesiones programadas', 'Principios activos reductores focalizados', 'Seguimiento de evolución corporal en cada visita'],
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'masajes-drenaje-linfatico',
    name: 'Drenaje Linfático',
    category: 'masajes',
    categoryLabel: 'Masajes',
    subcategory: 'Packs Corporales',
    popular: true,
    priceOptions: [
      { label: '4 Sesiones', pricePEN: 380, sessions: 4 },
      { label: '6 Sesiones', pricePEN: 400, sessions: 6 },
      { label: '8 Sesiones', pricePEN: 480, sessions: 8 }
    ],
    description: 'Movimientos rítmicos muy suaves para movilizar líquidos retenidos y desinflamar el cuerpo.',
    includes: ['Activación de ganglios linfáticos principales', 'Ideal para retención de líquidos, piernas pesadas o postoperatorio', 'Sensación inmediata de ligereza y desinflamación'],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'masajes-reductores',
    name: 'Masajes Reductores',
    category: 'masajes',
    categoryLabel: 'Masajes',
    subcategory: 'Packs Corporales',
    priceOptions: [
      { label: '4 Sesiones', pricePEN: 320, sessions: 4 },
      { label: '6 Sesiones', pricePEN: 380, sessions: 6 },
      { label: '8 Sesiones', pricePEN: 430, sessions: 8 }
    ],
    description: 'Maniobras intensas y enérgicas para remodelar la silueta y combatir la celulitis.',
    includes: ['Fricciones y amasamientos intensos moldeadores', 'Cremas térmicas reductoras activas', 'Packs de 4, 6 u 8 sesiones para resultados sostenibles'],
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80'
  },

  // ==========================================
  // FACIALES (Página 9)
  // ==========================================
  {
    id: 'facial-basico',
    name: 'Facial Básico',
    category: 'faciales',
    categoryLabel: 'Faciales',
    subcategory: 'Cuidado Facial',
    pricePEN: 120,
    description: 'Higiene y nutrición cutánea esencial para devolver la frescura y luminosidad a tu rostro.',
    includes: [
      'Exfoliación suave eliminadora de células muertas',
      'Tónico equilibrante de pH',
      'Mascarillas nutritivas según tipo de piel',
      'Crema hidratante reparadora',
      'Protector solar con acabado ligero'
    ],
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'facial-intermedio',
    name: 'Facial Intermedio',
    category: 'faciales',
    categoryLabel: 'Faciales',
    subcategory: 'Cuidado Facial',
    pricePEN: 140,
    popular: true,
    description: 'Limpieza profunda con vaporizador y aparatología de alta frecuencia para poros limpios y piel renovada.',
    includes: [
      'Exfoliación dérmica preparatoria',
      'Uso de vaporizador para apertura de poros',
      'Remoción minuciosa de puntos negros y comedones',
      'Alta frecuencia con acción bactericida y calmante',
      'Serum concentrado acorde a cada tipo de piel',
      'Mascarillas específicas y cremas hidratantes de sellado'
    ],
    image: 'https://images.unsplash.com/photo-1512290900672-1f41d739e1e2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'facial-profundo',
    name: 'Facial Profundo',
    category: 'faciales',
    categoryLabel: 'Faciales',
    subcategory: 'Cuidado Facial',
    pricePEN: 160,
    popular: true,
    description: 'La experiencia facial más completa con máscara LED, oro, miel, colágeno y rutina de skincare personalizada.',
    includes: [
      'Exfoliación profunda y vaporizador dérmico',
      'Remoción completa de impurezas y alta frecuencia',
      'Parches descongestivos para bolsas de ojos',
      'Terapia de fotorejuvenecimiento con Máscara LED',
      'Mascarilla premium de oro, miel y colágeno hidrolizado',
      'Infusión de Vitamina E y cremas hidratantes avanzadas',
      'Bono exclusivo: PDF complementario sobre tu tipo de piel con rutina completa de skincare de día y noche adaptada a tu necesidad'
    ],
    note: 'El tratamiento profundo incluye un PDF complementario sobre tu tipo de piel y una rutina de skin care completa de día y noche en base a tu necesidad.',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80'
  }
];

// CONDICIONES OFICIALES DEL SERVICIO (Página 10 del Catálogo)
export const POLICIES_DATA = {
  availability: 'Los servicios son previamente agendados según disponibilidad.',
  mobility: 'Para el servicio a domicilio u oficina, los servicios no incluyen el costo de la movilidad (se cotiza según el distrito de Lima). En nuestro estudio presencial en Calle Agustín Gamarra 515, Pueblo Libre, no aplica ningún costo de movilidad.',
  biosecurity: 'En Meraki cumplimos todos los protocolos de bioseguridad tanto en estudio como a domicilio para garantizar una experiencia higiénica y segura.',
  cancellation: 'Cambio o cancelaciones de citas con 24h antes; de lo contrario el previo depósito del 40% no será reembolsable.',
  socialMedia: 'Los clientes aceptan el uso de fotos y videos para nuestras redes sociales.',
  depositPercentage: '40% de adelanto para reservar tu cita'
};

// 5 PASOS PARA RESERVAR (Página 10 del Catálogo)
export const BOOKING_STEPS = [
  {
    number: '1',
    title: 'Elige tu servicio',
    description: 'Mira nuestro catálogo y elige el servicio que deseas para tus manos, pies, pestañas, depilación, masajes o faciales.'
  },
  {
    number: '2',
    title: 'Escríbenos a WhatsApp',
    description: 'Escríbenos a nuestro WhatsApp 993 067 291 indicando el servicio deseado, fecha tentativa y si prefieres atención presencial en nuestro estudio (Pueblo Libre) o a domicilio (casa u oficina).'
  },
  {
    number: '3',
    title: 'Reserva con el 40%',
    description: 'Asegura tu cita abonando el 40% de adelanto de la reserva por transferencia o billetera digital.'
  },
  {
    number: '4',
    title: 'Envíanos tus datos',
    description: 'Una vez realizado el depósito, nos envías el voucher junto a tus datos para agendarte: Nombre, Modalidad/Dirección (o Estudio Pueblo Libre), Hora de atención, Teléfono, Correo y Fecha de nacimiento.'
  },
  {
    number: '5',
    title: '¡Listas para atenderte!',
    description: 'Te recibimos en nuestro acogedor estudio en Pueblo Libre (Calle Agustín Gamarra 515) o nos trasladamos a tu domicilio u oficina con todo lo necesario y protocolos de bioseguridad.'
  }
];
