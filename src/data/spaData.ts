import type { Testimonial, FAQItem } from '../types';

export const SPA_INFO = {
  name: 'Meraki Spa',
  tagline: 'Bienestar, belleza y rituales en nuestro estudio y a domicilio',
  founder: 'Ana Maria Díaz',
  experience: 'Más de 10 años de experiencia profesional',
  mission: 'Que te sientas feliz y empoderada',
  serviceModel: 'Atención presencial en estudio (Pueblo Libre) y servicio a domicilio u oficina en Lima',
  city: 'Lima, Perú',
  studioAddress: 'Calle Agustín Gamarra 515, Pueblo Libre, Lima',
  studioDistrict: 'Pueblo Libre, Lima',
  coverage: 'Estudio en Calle Agustín Gamarra 515 (Pueblo Libre) y servicio a domicilio en distritos de Lima',
  whatsappDisplay: '+51 993 067 291',
  whatsappNumber: '51993067291',
  whatsappLink: 'https://wa.link/86seuh',
  email: 'contacto@meraki.spa.pe',
  instagram: '@meraki.spa.pe',
  instagramUrl: 'https://www.instagram.com/meraki.spa.pe/',
  hours: {
    weekdays: 'Lunes a Sábado: 09:00 - 20:00 (Previa cita)',
    weekends: 'Domingos: Previa coordinación de agenda',
  },
  pillars: [
    'Marca liderada por Ana Maria Díaz con más de 10 años de experiencia',
    'Atención presencial en nuestro estudio en Pueblo Libre o a domicilio con equipamiento profesional completo',
    'Cumplimiento estricto de todos los protocolos de bioseguridad',
    'Atención cálida, respetuosa y 100% personalizada'
  ]
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    author: 'Claudia Mendoza',
    role: 'Clienta a Domicilio',
    rating: 5,
    comment: 'Tener una manicura en acrílico con baby boomer tan prolija en mi propia sala me ahorró horas de tráfico. Ana María es súper detallista y llegó con todo impecable.',
    service: 'Poligel Baby Boomer & Manos',
    location: 'Miraflores'
  },
  {
    id: 't-2',
    author: 'Valeria Rivas',
    role: 'Atención en Oficina',
    rating: 5,
    comment: 'Agendé un masaje descontracturante y facial intermedio después de una semana pesada de trabajo. El vaporizador, la alta frecuencia y la comodidad de no tener que salir de casa fue una maravilla.',
    service: 'Masaje Descontracturante & Facial Intermedio',
    location: 'San Isidro'
  },
  {
    id: 't-3',
    author: 'Silvana Ramos',
    role: 'Clienta Frecuente',
    rating: 5,
    comment: 'El lifting de pestañas y la pedicura jellyparafina me duraron intactos semanas. Es genial que te envíen la rutina de skincare personalizada con el facial profundo.',
    service: 'Facial Profundo & Jellyparafina Pies',
    location: 'Surco'
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'reservas',
    question: '¿Cómo agendo mi cita con Meraki?',
    answer: 'Es muy fácil: eliges tu servicio en nuestro catálogo, nos escribes al WhatsApp 993 067 291 con tu fecha tentativa y modalidad (en nuestro estudio de Pueblo Libre o a domicilio/oficina), realizas el adelanto del 40% de la reserva y nos compartes tu voucher junto con tus datos para agendarte.'
  },
  {
    id: 'faq-2',
    category: 'movilidad',
    question: '¿El precio incluye el costo de movilidad?',
    answer: 'Para la atención presencial en nuestro estudio ubicado en Calle Agustín Gamarra 515, Pueblo Libre, no aplica ningún costo de movilidad. En caso prefieras el servicio a domicilio u oficina, el costo de movilidad se calcula de forma transparente según tu distrito en Lima.'
  },
  {
    id: 'faq-3',
    category: 'servicios',
    question: '¿Dónde está ubicado el estudio y qué necesito si elijo atención a domicilio?',
    answer: 'Nuestro estudio se encuentra en Calle Agustín Gamarra 515, Pueblo Libre, Lima (atención con previa cita). Si prefieres atención a domicilio o trabajo, nosotras llevamos todos los materiales esterilizados y equipamiento portátil necesario; solo requerimos un espacio cómodo con buena iluminación y toma de corriente.'
  },
  {
    id: 'faq-4',
    category: 'reservas',
    question: '¿Cuál es la política de cancelación o cambios de cita?',
    answer: 'Los cambios o cancelaciones deben realizarse con al menos 24 horas de anticipación. De lo contrario, el previo depósito del 40% no será reembolsable, ya que reservamos el bloque horario y transporte exclusivamente para ti.'
  },
  {
    id: 'faq-5',
    category: 'bioseguridad',
    question: '¿Qué protocolos de bioseguridad aplican?',
    answer: 'En Meraki cumplimos rigurosos protocolos de bioseguridad tanto en estudio como a domicilio: esterilización de instrumental con grado hospitalario, uso de material descartable por cliente, desinfección antes de cada procedimiento y uso de indumentaria protectora.'
  },
  {
    id: 'faq-6',
    category: 'servicios',
    question: '¿Cómo funciona el mantenimiento en uñas y retoque de pestañas?',
    answer: 'En uñas acrílicas o poligel, el mantenimiento tiene el mismo costo que la puesta inicial porque se remueve el 90% del producto para estructurar un sistema nuevo y sano. En extensiones de pestañas, el retoque a S/ 100 aplica dentro de los primeros 15 días tras la colocación según el estado en que lleguen.'
  }
];
