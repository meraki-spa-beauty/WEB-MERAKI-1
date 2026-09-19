import type { Treatment } from '../types';

export const TREATMENTS: Treatment[] = [
  // --- MASAJES ---
  {
    id: 'ritual-renovacion-meraki',
    slug: 'ritual-renovacion-meraki',
    title: 'Ritual Renovación Meraki',
    subtitle: 'Nuestra experiencia insignia de autor',
    category: 'masajes',
    categoryLabel: 'Masaje de Autor',
    durationMin: 90,
    durationLabel: '90 min',
    pricePEN: 280,
    shortDescription: 'Masaje holístico personalizado que fusiona maniobras descontracturantes, piedras volcánicas calientes y aceites botánicos templados.',
    fullDescription: 'El Ritual Renovación es el corazón de Meraki. Diseñado para disolver tensiones profundas y calmar el sistema nervioso, combina técnicas de masaje sueco y tejido profundo con la calidez terapéutica de piedras volcánicas andinas en puntos energéticos clave. Incluye aromaterapia orgánica de lavanda y eucalipto silvestre.',
    benefits: [
      'Alivio inmediato de contracturas musculares crónicas en espalda y cuello',
      'Estimulación profunda de la microcirculación y drenaje linfático',
      'Inducción a un estado meditativo de reposo mental y reducción del cortisol',
      'Nutrición cutánea con aceites prensados en frío de jojoba y almendras dulces'
    ],
    includes: [
      'Ritual de bienvenida con infusión tibia de hierbaluisa y baño podal aromático',
      'Masaje corporal completo de 90 minutos con piedras volcánicas templadas',
      'Alineación y aromaterapia con bruma botánica de lavanda',
      'Acceso a sala de reposo con tisana relajante y frutos secos selectos'
    ],
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    isPopular: true,
    tone: 'sage'
  },
  {
    id: 'masaje-velas-aromaticas',
    slug: 'masaje-velas-aromaticas',
    title: 'Masaje con Velas Templadas',
    subtitle: 'Calor reconfortante y mantecas botánicas',
    category: 'masajes',
    categoryLabel: 'Masaje Sensorial',
    durationMin: 60,
    durationLabel: '60 min',
    pricePEN: 220,
    shortDescription: 'Un bálsamo tibio de cera de soja, manteca de karité y aceites esenciales vertido suavemente sobre el cuerpo.',
    fullDescription: 'Una caricia cálida que reconforta el cuerpo y el alma. La vela especial para masaje se funde a una temperatura perfecta de 38°C, liberando una textura sedosa no grasa enriquecida con esencias de bergamota y madera de cedro que hidrata en profundidad mientras las manos expertas liberan el estrés.',
    benefits: [
      'Hidratación profunda y duradera para pieles secas o castigadas',
      'Efecto sedante sobre el sistema nervioso gracias al calor continuo',
      'Mejora la elasticidad de los tejidos y previene la tirantez muscular'
    ],
    includes: [
      'Ritual de bienvenida y selección personalizada del aroma de la vela',
      'Masaje rítmico relajante de 60 minutos con aceite tibio vertido',
      'Compresas calientes aromatizadas en pies y columna',
      'Té de manzanilla silvestre al finalizar'
    ],
    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1200&q=80',
    tone: 'cream'
  },
  {
    id: 'masaje-descontracturante-profundo',
    slug: 'masaje-descontracturante-profundo',
    title: 'Tejido Profundo & Liberación Miofascial',
    subtitle: 'Terapia intensa para sobrecargas musculares',
    category: 'masajes',
    categoryLabel: 'Terapéutico',
    durationMin: 75,
    durationLabel: '75 min',
    pricePEN: 250,
    shortDescription: 'Presión firme y maniobras específicas para desarmar nudos y restaurar la movilidad articular.',
    fullDescription: 'Ideal para personas con tensión acumulada por posturas de oficina, estrés cotidiano o práctica deportiva. Nuestros terapeutas aplican presión progresiva en las capas musculares más profundas, liberando adherencias en el tejido conectivo (fascia) con la ayuda de un bálsamo reconfortante de árnica y romero.',
    benefits: [
      'Elimina contracturas severas y puntos gatillo dolorosos',
      'Restaura el rango completo de movimiento en hombros, escápulas y zona lumbar',
      'Acelera la eliminación de ácido láctico y toxinas acumuladas'
    ],
    includes: [
      'Evaluación previa de puntos de tensión con el terapeuta',
      'Masaje profundo y descontracturante de 75 minutos',
      'Aplicación de gel desinflamatorio de árnica orgánica',
      'Pautas de estiramiento postural para el día a día'
    ],
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80',
    tone: 'terracotta'
  },
  {
    id: 'masaje-prenatal-mamas',
    slug: 'masaje-prenatal-mamas',
    title: 'Masaje Gestante: Dulce Espera',
    subtitle: 'Cuidado especializado para futuras mamás',
    category: 'masajes',
    categoryLabel: 'Maternidad',
    durationMin: 60,
    durationLabel: '60 min',
    pricePEN: 210,
    shortDescription: 'Postura lateral cómoda y maniobras delicadas para aliviar espalda lumbar y piernas cansadas.',
    fullDescription: 'Apto a partir del segundo trimestre (semana 13 en adelante). Adaptado con almohadas anatómicas especiales que garantizan total seguridad y confort para la madre y el bebé. Enfocado en aliviar el peso de la espalda baja, mejorar la retención de líquidos en tobillos y proporcionar una profunda sensación de serenidad.',
    benefits: [
      'Alivio del dolor de ciática y tensión en zona sacrolumbar',
      'Descongestión circulatoria y descanso para piernas hinchadas',
      'Promueve un sueño reparador y bienestar emocional'
    ],
    includes: [
      'Acomodo postural ergonómico con cojines de soporte',
      'Masaje suave y drenante de 60 minutos con aceite neutro de almendras',
      'Drenaje suave en pies y piernas con toallas refrescantes',
      'Infusión floral segura para gestación'
    ],
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
    tone: 'cream'
  },

  // --- FACIALES ---
  {
    id: 'facial-glow-botanico',
    slug: 'facial-glow-botanico',
    title: 'Facial Glow Botánico & Vitamina C',
    subtitle: 'Luminosidad instantánea y antioxidantes andinos',
    category: 'faciales',
    categoryLabel: 'Luminosidad & Piel',
    durationMin: 60,
    durationLabel: '60 min',
    pricePEN: 230,
    shortDescription: 'Tratamiento revitalizante que despierta la piel apagada, unifica el tono y aporta un brillo jugoso natural.',
    fullDescription: 'Una inyección de vitalidad para el rostro. Combina limpieza botánica suave, exfoliación enzimática de frutas no abrasiva y una ampolla concentrada de Vitamina C estabilizada junto a extractos de camu camu andino. Finaliza con un masaje de drenaje con rodillo de jade y gua sha que esculpe las facciones.',
    benefits: [
      'Brillo natural inmediato sin efecto graso',
      'Protección antioxidante contra radicales libres y contaminación urbana',
      'Atenuación de líneas finas y textura de piel visiblemente afinada'
    ],
    includes: [
      'Doble limpieza japonesa con aceite de salvado de arroz y espuma suave',
      'Exfoliación enzimática suave con vapor de ozono ligero',
      'Masaje facial con Gua Sha de cuarzo rosa y suero iluminador',
      'Mascarilla hidroplástica de algas y crema de acabado con FPS'
    ],
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    isPopular: true,
    tone: 'terracotta'
  },
  {
    id: 'limpieza-profunda-oxigenacion',
    slug: 'limpieza-profunda-oxigenacion',
    title: 'Limpieza Profunda & Oxigenación Celular',
    subtitle: 'Pureza, descongestión y poros libres',
    category: 'faciales',
    categoryLabel: 'Higiene Facial',
    durationMin: 75,
    durationLabel: '75 min',
    pricePEN: 210,
    shortDescription: 'Extracción minuciosa, espátula ultrasónica y mascarilla purificante de arcilla blanca y caléndula.',
    fullDescription: 'El cuidado esencial para mantener el cutis libre de impurezas y puntos negros sin irritación. Mediante tecnología ultrasónica y cosmética botánica desincrustante, retiramos células muertas y exceso de sebo, oxigenando cada poro y calmando la dermis con activos descongestivos.',
    benefits: [
      'Poros limpios y visiblemente reducidos en tamaño',
      'Equilibrio en la producción sebácea de la zona T',
      'Sensación duradera de frescura y textura aterciopelada'
    ],
    includes: [
      'Diagnóstico cutáneo personalizado por cosmetóloga certificada',
      'Desincrustación ultrasónica y extracción manual delicada',
      'Alta frecuencia bactericida y calmante',
      'Mascarilla descongestiva de arcilla blanca medicinal y manzanilla'
    ],
    image: 'https://images.unsplash.com/photo-1512290900672-1f41d739e1e2?auto=format&fit=crop&w=1200&q=80',
    tone: 'sage'
  },
  {
    id: 'lifting-ancestral-kobido',
    slug: 'lifting-ancestral-kobido',
    title: 'Lifting Ancestral Japonés (Kobido)',
    subtitle: 'Efecto rejuvenecedor manual y colágeno activo',
    category: 'faciales',
    categoryLabel: 'Anti-Edad Holístico',
    durationMin: 75,
    durationLabel: '75 min',
    pricePEN: 270,
    shortDescription: 'El "masaje de las emperatrices": maniobras percutivas rápidas que tonifican la musculatura facial.',
    fullDescription: 'Conocido como el lifting facial sin cirugía del antiguo Japón. Este ritual de alta precisión combina percusiones rítmicas, fricciones tensoras y digitopuntura sobre meridianos energéticos de rostro, cuello y escote, reactivando la síntesis natural de colágeno y elastina.',
    benefits: [
      'Efecto tensor visible inmediato en pómulos, mandíbula y cejas',
      'Aumento drástico de la oxigenación celular y el rubor natural',
      'Liberación de la tensión en la mandíbula (bruxismo) y frente'
    ],
    includes: [
      'Limpieza botánica preparatoria',
      'Maniobras Kobido intensivas de 50 minutos con elixir de rosa mosqueta',
      'Máscara de péptidos reafirmantes y ácido hialurónico multimolecular',
      'Masaje craneofacial de reintegración'
    ],
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=80',
    tone: 'cream'
  },

  // --- CORPORALES & CIRCUITO ---
  {
    id: 'envoltura-barro-termal',
    slug: 'envoltura-barro-termal',
    title: 'Envoltura de Barro Termal & Algas',
    subtitle: 'Desintoxicación mineral y remineralización',
    category: 'corporales',
    categoryLabel: 'Cuidado Corporal',
    durationMin: 75,
    durationLabel: '75 min',
    pricePEN: 260,
    shortDescription: 'Exfoliación con sales marinas seguida de una cataplasma tibia de lodos volcánicos y envoltura en manta térmica.',
    fullDescription: 'Un ritual profundamente purificante que extrae toxinas celulares y nutre la piel con oligoelementos esenciales. Se inicia con una suave pulida corporal con sales de maras y aceites cítricos, seguida de la aplicación de lodo rico en magnesio y azufre orgánico que actúa mientras recibes un reconfortante masaje capilar.',
    benefits: [
      'Drenaje de líquidos retenidos y efecto descongestivo general',
      'Piel infinitamente suave, compacta y remineralizada',
      'Alivio de dolores articulares y fatiga física acumulada'
    ],
    includes: [
      'Exfoliación corporal con cristales de sal andina',
      'Envoltura térmica oclusiva en cama especializada',
      'Masaje craneal y cervical durante el tiempo de reposo',
      'Ducha de lluvia tibia con gel aromático y loción hidratante final'
    ],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    tone: 'terracotta'
  },
  {
    id: 'circuito-termal-sensorial',
    slug: 'circuito-termal-sensorial',
    title: 'Circuito de Aguas & Termal Sensorial',
    subtitle: 'Contraste térmico, hidromasaje y descanso',
    category: 'corporales',
    categoryLabel: 'Circuito de Aguas',
    durationMin: 60,
    durationLabel: '60 min',
    pricePEN: 160,
    shortDescription: 'Piscina de hidromasaje a 36°C, sauna de vapor con esencias de eucalipto y ducha bitérmica nebulizada.',
    fullDescription: 'Inspirado en los baños termales europeos de Heavenly Spa, nuestro circuito ofrece una secuencia guiada para activar el sistema inmunológico y calmar el ritmo cardíaco. Ideal para realizar previo a cualquier masaje o como experiencia individual de desconexión urbana.',
    benefits: [
      'Desintoxicación por sudoración en baño de vapor',
      'Descompresión vertebral gracias a los chorros subacuáticos lumbares',
      'Sensación integral de ligereza y relajación muscular'
    ],
    includes: [
      'Bata de baño de felpa suave, pantuflas y toalla grande',
      'Secuencia guiada: Jacuzzi hidromasaje, Baño turco herbal y Ducha escocesa',
      'Barra de infusiones digestivas y aguas aromatizadas con frutas cítricas'
    ],
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
    isPopular: true,
    tone: 'sage'
  },

  // --- EXPERIENCIAS EN PAREJA / DÚO ---
  {
    id: 'pausa-para-dos-parejas',
    slug: 'pausa-para-dos-parejas',
    title: 'Pausa para Dos (Ritual en Pareja)',
    subtitle: 'La experiencia romántica más solicitada de Meraki',
    category: 'parejas',
    categoryLabel: 'Experiencia Dúo',
    durationMin: 120,
    durationLabel: '120 min',
    pricePEN: 540,
    shortDescription: 'Cabina doble privada, circuito termal exclusivo de 40 min, masaje simultáneo de 60 min y brindis con espumante.',
    fullDescription: 'Un oasis de complicidad y calma para compartir con esa persona especial. Su cabina suite privada estará ambientada con luz de velas, música tenue y pétalos frescos. Disfrutarán de una sesión compartida de relajación con terapeutas simultáneos, concluyendo con tiempo a solas para brindar y saborear trufas artesanales.',
    benefits: [
      'Reconexión emocional y relajación compartida en total privacidad',
      'Liberación conjunta de tensiones acumuladas en ambiente exclusivo',
      'Recuerdo memorable para aniversarios, cumpleaños o escapadas de fin de semana'
    ],
    includes: [
      'Cabina VIP doble con tina de hidromasaje privada',
      'Masaje relajante sincronizado a 4 manos (dos terapeutas) de 60 minutos',
      'Ritual de pies con sales aromáticas para ambos',
      'Botella de espumante o infusión fría gourmet + tabla de fresas con chocolate amargo'
    ],
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
    isPopular: true,
    tone: 'sage'
  },
  {
    id: 'meraki-sanctuary-completo',
    slug: 'meraki-sanctuary-completo',
    title: 'Meraki Sanctuary: Jornada de Bienestar',
    subtitle: 'Medio día de renovación total de pies a cabeza',
    category: 'parejas',
    categoryLabel: 'Día de Spa',
    durationMin: 180,
    durationLabel: '3 horas',
    pricePEN: 490,
    shortDescription: 'Exfoliación corporal completa, masaje de autor con piedras calientes, facial hidratante y almuerzo ligero saludable.',
    fullDescription: 'La inmersión absoluta en el universo Meraki. Dedica tres horas a ti misma o a regalar a un ser querido. Comenzamos preparando el cuerpo con exfoliación botánica y ducha revitalizante, continuamos con el masaje insignia y un tratamiento facial restaurador para culminar descansando en nuestro jardín interior de meditación.',
    benefits: [
      'Renovación dérmica y muscular profunda y duradera',
      'Efecto detox total en cuerpo, mente y piel',
      'Desconexión total de las demandas cotidianas'
    ],
    includes: [
      'Exfoliación corporal completa con sales andinas (40 min)',
      'Masaje Renovación Meraki con aceites tibios (70 min)',
      'Facial exprés iluminador con mascarilla nutritiva (40 min)',
      'Snack saludable gourmet: bowl de frutas frescas, jugo prensado en frío y frutos secos'
    ],
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    tone: 'cream'
  },

  // --- SALÓN & BELLEZA ---
  {
    id: 'manicure-pedicure-botanica',
    slug: 'manicure-pedicure-botanica',
    title: 'Manicure & Pedicure Spa Botánica',
    subtitle: 'Cuidado amoroso para manos y pies',
    category: 'salon',
    categoryLabel: 'Belleza Consciente',
    durationMin: 75,
    durationLabel: '75 min',
    pricePEN: 140,
    shortDescription: 'Exfoliación suave, baño de parafina vegetal tibia, masaje reflexógeno y esmaltado profesional libre de químicos tóxicos.',
    fullDescription: 'Mucho más que un servicio estético: un ritual de alivio para las extremidades que más trabajan. Tratamos cutículas con aceites nutritivos de argán, exfoliamos talones y palmas, y sumergimos manos y pies en un baño hidratante templado antes de aplicar esmaltes 10-Free de larga duración.',
    benefits: [
      'Regeneración de zonas con asperezas y sequedad en talones',
      'Manos y pies suaves y visiblemente rejuvenecidos',
      'Esmaltado prolijo con fórmulas respetuosas con la salud ungueal'
    ],
    includes: [
      'Limado, repujado y pulido de uñas',
      'Exfoliación aromática de café o lavanda',
      'Mascarilla hidratante con toallas calientes',
      'Esmaltado clásico o semipermanente a elección'
    ],
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80',
    tone: 'terracotta'
  },
  {
    id: 'lifting-pestanas-cejas',
    slug: 'lifting-pestanas-cejas',
    title: 'Lifting de Pestañas & Laminado de Cejas',
    subtitle: 'Mirada expresiva y natural sin maquillaje',
    category: 'salon',
    categoryLabel: 'Realce Facial',
    durationMin: 75,
    durationLabel: '75 min',
    pricePEN: 160,
    shortDescription: 'Curvatura duradera con keratina botánica y diseño armónico de cejas según la estructura de tu rostro.',
    fullDescription: 'Un tratamiento sutil pero transformador. Elevamos tus pestañas naturales desde la raíz con una fórmula rica en aminoácidos y aplicamos tinte mineral negro para dar efecto de máscara de pestañas 24/7. El laminado ordena y fija las cejas aportando densidad y elegancia.',
    benefits: [
      'Apertura visual del ojo con aspecto descansado y fresco',
      'Cero mantenimiento diario durante 6 a 8 semanas',
      'Fortalecimiento capilar con keratina y botox nutritivo'
    ],
    includes: [
      'Diseño personalizado de cejas con visagismo',
      'Lifting y tinte vegetal de pestañas',
      'Laminado y nutrición con sérum de ricino y biotina'
    ],
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    tone: 'sage'
  }
];

export const CATEGORIES_CONFIG = [
  { id: 'todos', label: 'Todos los Rituales', count: 11 },
  { id: 'masajes', label: 'Masajes & Rituales', count: 4 },
  { id: 'faciales', label: 'Faciales de Alta Cosmética', count: 3 },
  { id: 'corporales', label: 'Corporales & Circuito', count: 2 },
  { id: 'parejas', label: 'Experiencias Dúo', count: 2 },
  { id: 'salon', label: 'Salón & Belleza', count: 2 }
] as const;
