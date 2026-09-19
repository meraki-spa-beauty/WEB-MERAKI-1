import type { Testimonial, FAQItem } from '../types';

export const SPA_INFO = {
  name: 'Meraki Spa Beauty',
  tagline: 'Un espacio para volver a ti',
  city: 'Lima, Perú',
  coverage: 'Cobertura en Lima Metropolitana · Atención previa reserva',
  whatsappDisplay: '+51 987 654 321',
  whatsappNumber: '51987654321',
  email: 'hello@meraki.spa.pe',
  instagram: '@meraki.spa.pe',
  instagramUrl: 'https://www.instagram.com/meraki.spa.pe/',
  hours: {
    weekdays: 'Lunes a Sábado: 09:00 - 20:00',
    weekends: 'Domingos: Previa coordinación',
  },
  pillars: [
    'Atención personalizada previa reserva',
    'Insumos botánicos y aromaterapia de alta calidad',
    'Protocolos de bienestar diseñados para regalarte una pausa',
    'Experiencia cuidada al detalle para volver a ti',
  ]
};

export const WELCOME_RITUAL_STEPS = [
  {
    step: '01',
    title: 'Infusión Botánica de Bienvenida',
    description: 'A tu llegada a nuestro santuario en Lima, te recibimos con una tisana tibia de hierbaluisa orgánica, muña andina y rodaja de naranja deshidratada para empezar a desacelerar los sentidos.',
    time: '5 min'
  },
  {
    step: '02',
    title: 'Baño Podal Aromático & Sales de Maras',
    description: 'Tus pies reposan en agua tibia aromatizada con aceite esencial de lavanda y cristales de sal marina rica en minerales, liberando la pesadez acumulada.',
    time: '10 min'
  },
  {
    step: '03',
    title: 'Respiración Consciente & Aromaterapia',
    description: 'Tu terapeuta guía una breve armonización respiratoria de 3 ciclos profundos con bruma de eucalipto silvestre, desconectando tu mente del ruido de la ciudad.',
    time: '3 min'
  },
  {
    step: '04',
    title: 'Tu Tratamiento Personalizado',
    description: 'La sesión se ejecuta en camillas ergonómicas climatizadas con sábanas de algodón egipcio, música binaural y la técnica especializada de tu elección.',
    time: '60 - 120 min'
  },
  {
    step: '05',
    title: 'Tiempo de Reintegración & Descanso',
    description: 'Concluimos en nuestra sala de relajación con luz natural tamizada, té de manzanilla silvestre y frutos secos para volver a ti con serenidad y calma.',
    time: '15 min'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    author: 'Camila Valdivia',
    role: 'Cliente frecuente',
    rating: 5,
    comment: 'Meraki es verdaderamente el oasis que Lima necesitaba. El Ritual Renovación con piedras volcánicas me quitó un dolor de espalda que arrastraba desde hacía meses. La atención de las terapeutas es impecable, suave y respetuosa.',
    treatment: 'Ritual Renovación Meraki',
    date: 'Hace 1 semana'
  },
  {
    id: 't-2',
    author: 'Rodrigo & Natalia Ferrand',
    role: 'Experiencia Aniversario',
    rating: 5,
    comment: 'Reservamos la experiencia "Pausa para Dos" para celebrar nuestro aniversario. La cabina privada con hidromasaje, la música y el masaje simultáneo superaron todas nuestras expectativas. Salimos renovados.',
    treatment: 'Pausa para Dos (Ritual en Pareja)',
    date: 'Hace 2 semanas'
  },
  {
    id: 't-3',
    author: 'Luciana Morales',
    role: 'Diseñadora de Interiores',
    rating: 5,
    comment: 'La estética del lugar, los aromas y el facial glow botánico son de otro nivel. Cuidan cada detalle, desde el té de bienvenida hasta la temperatura de las toallas. Ya tengo agendada mi próxima cita.',
    treatment: 'Facial Glow Botánico & Vitamina C',
    date: 'Hace 3 semanas'
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'reservas',
    question: '¿Con cuánta anticipación debo reservar mi cita?',
    answer: 'Recomendamos agendar con 24 a 48 horas de anticipación, especialmente para fines de semana o rituales en pareja. Puedes reservar en línea mediante nuestro formulario o directamente a través de nuestro WhatsApp oficial.'
  },
  {
    id: 'faq-2',
    category: 'reservas',
    question: '¿Cuál es la política de cancelación o reprogramación?',
    answer: 'Entendemos que pueden surgir imprevistos. Agradecemos avisar con al menos 4 horas de anticipación para reprogramar tu horario sin penalidad. Para cancelaciones con menor tiempo o no asistencia, se podría retener el 50% del depósito de reserva.'
  },
  {
    id: 'faq-3',
    category: 'instalaciones',
    question: '¿Qué debo llevar para mi visita al spa?',
    answer: 'No necesitas traer nada especial. En Meraki te proporcionamos bata de algodón afelpada, pantuflas desechables ecológicas, toallas de spa, gorros y todos los amenities orgánicos necesarios (shampoo, acondicionador y crema hidratante).'
  },
  {
    id: 'faq-4',
    category: 'instalaciones',
    question: '¿Tienen estacionamiento en la sede de San Isidro?',
    answer: 'Sí, contamos con estacionamiento privado vigilado las 24 horas y servicio de Valet Parking de cortesía para todos nuestros clientes de spa.'
  },
  {
    id: 'faq-5',
    category: 'servicios',
    question: '¿Puedo personalizar la presión del masaje y los aceites?',
    answer: 'Absolutamente. Al inicio de cada sesión tu terapeuta te consultará sobre tus preferencias de presión (suave, media o intensa), zonas prioritarias a trabajar y posibles alergias para seleccionar la sinergia de aceites esenciales idónea para ti.'
  },
  {
    id: 'faq-6',
    category: 'giftcards',
    question: '¿Cómo funcionan las Gift Cards de Meraki?',
    answer: 'Ofrecemos Gift Cards virtuales que se envían inmediatamente por WhatsApp o email con un mensaje personalizado, así como nuestra "Meraki Luxury Box" física con empaque de terciopelo, vela aromática y voucher sellado con cera para regalar una experiencia inolvidable. Tienen una validez de 6 meses.'
  }
];
