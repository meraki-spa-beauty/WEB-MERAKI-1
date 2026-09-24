import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/common/FloatingWhatsAppButton';
import { SPA_INFO } from '../data/spaData';
import {
  ShieldCheck,
  Lock,
  Cookie,
  Scale,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  UserCheck
} from 'lucide-react';

type PrivacySection = {
  id: string;
  category: 'Protección de Datos' | 'Cookies & Rastreo' | 'Términos del Servicio';
  title: string;
  badge: string;
  content: string;
  bulletPoints?: string[];
  callout?: {
    type: 'success' | 'warning' | 'info';
    text: string;
  };
};

const privacySections: PrivacySection[] = [
  {
    id: 'responsable-legal',
    category: 'Protección de Datos',
    title: 'Responsable del Tratamiento y Datos de Contacto',
    badge: 'Identificación Legal',
    content: 'De conformidad con la legislación vigente en la República del Perú y las directrices internacionales de transparencia digital, se informa la identidad del titular y responsable del tratamiento de los datos personales:',
    bulletPoints: [
      'Razón comercial: Meraki Spa Beauty (Liderado por la cosmetóloga y manicurista profesional Ana Maria Díaz).',
      'Domicilio físico del estudio: Calle Agustín Gamarra 515, Pueblo Libre, Lima, Perú.',
      'Canal formal de contacto y privacidad: contacto@meraki.spa.pe',
      'Atención directa y WhatsApp oficial: +51 993 067 291',
      'Ámbito de aplicación: El presente documento rige en el sitio web institucional (web-meraki-14bc4.web.app), en las landing pages y formularios vinculados (incluyendo la página de talleres y workshops en /workshop), así como en toda coordinación realizada a través de nuestros canales de mensajería oficial.'
    ]
  },
  {
    id: 'marco-legal',
    category: 'Protección de Datos',
    title: 'Marco Legal: Ley N° 29733 de Protección de Datos Personales',
    badge: 'Normativa Peruana',
    content: 'El tratamiento de datos personales en Meraki Spa se encuentra estrictamente subordinado a las disposiciones de la Ley N° 29733 (Ley de Protección de Datos Personales de la República del Perú) y su Reglamento aprobado mediante el Decreto Supremo N° 003-2013-JUS.',
    bulletPoints: [
      'Principio de Legalidad: El tratamiento de datos se realiza con estricto apego a las leyes peruanas aplicables.',
      'Principio de Consentimiento: Los datos se recopilan previo consentimiento libre, previo, expreso, informado e inequívoco del titular.',
      'Principio de Finalidad: Los datos recopilados no serán utilizados para propósitos distintos a los informados y consentidos.',
      'Principio de Proporcionalidad: Solo solicitamos los datos estrictamente necesarios y pertinentes para coordinar y prestar nuestros servicios estéticos y formativos.',
      'Principio de Seguridad: Aplicamos medidas técnicas, organizativas y humanas destinadas a evitar la alteración, pérdida o acceso no autorizado a la información.'
    ]
  },
  {
    id: 'datos-recopilados',
    category: 'Protección de Datos',
    title: 'Datos Personales que Recopilamos',
    badge: 'Información Capturada',
    content: 'Recopilamos únicamente los datos indispensables para la cotización, reserva, ejecución segura y seguimiento de nuestras experiencias de spa y talleres:',
    bulletPoints: [
      'Datos de Identificación y Contacto: Nombres y apellidos completos, número de teléfono celular (WhatsApp) y correo electrónico voluntariamente remitido en nuestros formularios o chats.',
      'Datos de Ubicación para Atención a Domicilio: Dirección exacta, referencias urbanas, número interior o departamento en distritos de Lima Metropolitana para el traslado seguro y oportuno de nuestro equipo profesional.',
      'Datos Estéticos y de Bioseguridad: Observaciones sobre alergias previas a cosméticos, solventes, esmaltes semipermanentes, acrílicos o geles, tipo de piel o sensibilidades particulares para adaptar los protocolos de bioseguridad.'
    ],
    callout: {
      type: 'info',
      text: 'No solicitamos ni almacenamos números de tarjetas de crédito o débito ni datos financieros sensibles a través de nuestra página web.'
    }
  },
  {
    id: 'finalidad-tratamiento',
    category: 'Protección de Datos',
    title: 'Finalidad y Uso de la Información',
    badge: 'Uso Legítimo',
    content: 'La información personal capturada se destina de forma exclusiva a las siguientes finalidades:',
    bulletPoints: [
      'Coordinación de citas: Verificar disponibilidad de agenda en nuestro estudio en Pueblo Libre o programar la ruta de atención a domicilio u oficina en Lima.',
      'Inscripción a Talleres y Workshops: Gestionar cupos limitados, preparar kits de materiales individuales y emitir las constancias de participación.',
      'Comprobación de pagos: Registrar y conciliar el voucher de adelanto (40% para servicios de spa o S/ 50 para el workshop).',
      'Atención al cliente y soporte: Responder inquietudes sobre tarifas, preparativos previos al servicio y recomendaciones de cuidado posterior.'
    ]
  },
  {
    id: 'no-comercializacion',
    category: 'Protección de Datos',
    title: 'Garantía Expresa de No Venta ni Cesión de Datos',
    badge: 'Cumplimiento Google Ads',
    content: 'En estricto cumplimiento con las políticas de privacidad exigidas por Google Ads, Meta y la autoridad de protección de datos de Perú, asumimos un compromiso inquebrantable de confidencialidad:',
    bulletPoints: [
      'NO venta de datos: Meraki Spa NO comercializa, no vende, no alquila ni cede bajo ninguna modalidad tus datos personales a empresas de terceros.',
      'NO bases de datos externas: Tu información jamás será incorporada en listas de comercialización masiva o spam de terceros.',
      'Acceso restringido: Solo el personal debidamente autorizado de Meraki Spa accede a tus datos para la ejecución operativa de tu atención.'
    ],
    callout: {
      type: 'success',
      text: 'Garantía total de privacidad: Tus datos personales pertenecen únicamente a ti y solo se emplean para atender tu solicitud.'
    }
  },
  {
    id: 'politica-cookies',
    category: 'Cookies & Rastreo',
    title: 'Política de Cookies y Tecnologías de Seguimiento',
    badge: 'Transparencia Digital',
    content: 'Este sitio web utiliza cookies técnicas, analíticas y de medición publicitaria para proporcionar una navegación segura, optimizada y fluida:',
    bulletPoints: [
      'Cookies Técnicas (Esenciales): Necesarias para permitir la navegación por el sitio, mantener la estabilidad de la sesión y cargar correctamente los elementos multimedia y tipografías.',
      'Cookies de Análisis y Rendimiento (Google Analytics 4 / Google Tag Manager): Recopilan datos anónimos y agregados sobre páginas visitadas, tiempos de permanencia y patrones de navegación. Estas estadísticas nos permiten mejorar continuamente el diseño sin identificar individualmente a ningún usuario.',
      'Cookies de Publicidad y Conversión (Google Ads / Meta Pixel): Permiten cuantificar el interés en nuestros servicios y evaluar la efectividad de campañas publicitarias digitales. No transmiten datos personales directos como nombres o teléfonos a los proveedores de anuncios.',
      'Desactivación y Gestión de Cookies: El usuario puede en todo momento rechazar, bloquear o eliminar las cookies configurando las preferencias de privacidad de su navegador (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge). La desactivación no restringe el acceso al contenido principal del sitio web.'
    ],
    callout: {
      type: 'info',
      text: 'Al navegar en nuestra web sin desactivar las cookies en tu navegador, consientes su uso de acuerdo con la presente política.'
    }
  },
  {
    id: 'derechos-arco',
    category: 'Protección de Datos',
    title: 'Ejercicio de Derechos ARCO (Ley N° 29733)',
    badge: 'Tus Derechos',
    content: 'Como titular de tus datos personales, puedes ejercer en cualquier momento los derechos de Acceso, Rectificación, Cancelación y Oposición garantizados por la ley peruana:',
    bulletPoints: [
      'Derecho de Acceso: Conocer qué datos personales tuyos están registrados y la finalidad para la cual se mantienen.',
      'Derecho de Rectificación: Solicitar la actualización o corrección de información desactualizada, incompleta o errónea.',
      'Derecho de Cancelación: Solicitar la supresión o eliminación de tus datos cuando hayan dejado de ser necesarios para la atención brindada.',
      'Derecho de Oposición: Oponerte al tratamiento de tus datos para finalidades no indispensables.',
      'Canal de tramitación: Envía tu requerimiento por escrito a contacto@meraki.spa.pe con el asunto "Derechos ARCO" o mediante nuestro WhatsApp oficial +51 993 067 291. Tu solicitud será atendida en los plazos previstos por el marco legal peruano.'
    ]
  },
  {
    id: 'terminos-reserva',
    category: 'Términos del Servicio',
    title: 'Políticas de Reserva y Adelanto del 40%',
    badge: 'Condiciones de Agenda',
    content: 'Para garantizar la excelencia y la exclusividad del servicio profesional:',
    bulletPoints: [
      'Confirmación con anticipo: Toda cita de spa (en estudio o a domicilio) se confirma únicamente con el abono del 40% del valor total del servicio.',
      'Workshops y Talleres: La pre-reserva en el taller de manicura se formaliza con el abono inicial de S/ 50, abonándose el saldo el día de la clase.',
      'Validación de pago: Una vez efectuado el abono por billetera digital (Yape, Plin) o transferencia bancaria, el cliente debe remitir la captura del comprobante junto con su nombre completo al WhatsApp oficial para asegurar el horario en agenda.',
      'Sin cobro automático: Meraki Spa no realiza cargos automáticos ni suscripciones recurrentes no autorizadas.'
    ]
  },
  {
    id: 'terminos-cancelaciones',
    category: 'Términos del Servicio',
    title: 'Política de Cancelaciones, Reprogramaciones y Puntualidad',
    badge: 'Puntualidad & Cambios',
    content: 'Establecemos lineamientos claros para coordinar los tiempos de nuestro equipo y de todas las clientas:',
    bulletPoints: [
      'Reprogramación de citas de spa: Se puede solicitar la reprogramación de fecha u hora con un mínimo de 24 horas de anticipación sin penalidad alguna.',
      'Cancelaciones tardías o inasistencias: Ante cancelaciones notificadas con menos de 24 horas o inasistencias injustificadas, el anticipo del 40% no será reembolsable, toda vez que el bloque horario, transporte y personal fueron reservados en exclusiva.',
      'Tolerancia en citas: Se otorga una tolerancia máxima de 15 minutos de espera. Pasado este tiempo, el procedimiento podrá adaptarse en tiempo para no perjudicar a las siguientes clientas programadas.',
      'Transferencia de cupos en talleres: En caso de no poder asistir al workshop de uñas, el cupo podrá ser transferido a otra persona designada notificándolo con un mínimo de 48 horas de anticipación.'
    ],
    callout: {
      type: 'warning',
      text: 'El adelanto cubre el costo de reserva exclusiva de agenda y movilización en Lima.'
    }
  },
  {
    id: 'terminos-bioseguridad',
    category: 'Términos del Servicio',
    title: 'Protocolos de Bioseguridad y Calidad Sanitaria',
    badge: 'Higiene & Cuidado',
    content: 'La seguridad dermatológica y la salud de nuestras clientas es el principio rector de Meraki Spa:',
    bulletPoints: [
      'Esterilización de herramientas: Todo instrumental metálico (alicates, repujadores) pasa por un riguroso proceso de desinfección y esterilización en calor seco de grado clínico.',
      'Materiales descartables: Limas, tacos pulidores, separadores y campos de trabajo son individuales y descartables para cada clienta.',
      'Salud ungueal: Nos reservamos el derecho de abstenernos de realizar extensiones acrílicas o esmaltado en uñas que presenten sospecha de micosis activa (hongos), heridas abiertas o infecciones, orientando responsablemente a la clienta hacia atención médica especializada.'
    ]
  },
  {
    id: 'terminos-redes-sociales',
    category: 'Términos del Servicio',
    title: 'Uso de Material Audiovisual en Redes Sociales',
    badge: 'Difusión de Portafolio',
    content: 'Como parte del arte estético y la exhibición de resultados profesionales:',
    bulletPoints: [
      'Registro fotográfico de manicura y estética: Podrán capturarse fotografías o videos de las uñas, manos o resultados finales para su difusión en nuestras cuentas oficiales (@meraki.spa.pe).',
      'Derecho de objeción: Si prefieres que tus manos o procedimientos no sean fotografiados o publicados, solo debes comunicárselo previamente a Ana Maria Díaz o al personal al inicio de la sesión, y tu voluntad será respetada de manera inmediata.'
    ]
  },
  {
    id: 'terminos-actualizaciones',
    category: 'Términos del Servicio',
    title: 'Vigencia, Jurisdicción y Actualizaciones de la Política',
    badge: 'Disposiciones Finales',
    content: 'Disposiciones normativas que rigen el presente acuerdo:',
    bulletPoints: [
      'Vigencia: Este documento entra en vigor a partir del 22 de septiembre de 2026 y sustituye cualquier versión previa.',
      'Modificaciones: Meraki Spa se reserva la facultad de actualizar estos términos para reflejar reformas legales, directrices de plataformas como Google Ads o mejoras operativas. Las modificaciones se publicarán en esta misma dirección web.',
      'Jurisdicción: Para cualquier discrepancia o controversia derivada de la interpretación de este documento, las partes se someten a la competencia territorial de los jueces y tribunales del Distrito Judicial de Lima, República del Perú.'
    ]
  }
];

function SectionNumber({ index }: { index: number }) {
  return String(index + 1).padStart(2, '0');
}

export function Privacy() {
  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b border-[#5E765E]/15 bg-gradient-to-b from-[#FFF2DE] to-[#F7ECE1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5E765E]/15 text-[#5E765E] text-xs font-semibold tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                Ley N° 29733 (Perú)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D5A688]/20 text-[#8C5835] text-xs font-semibold tracking-wider uppercase">
                <Lock className="w-3.5 h-3.5" />
                Google Ads Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-[#111111]/70 text-xs font-semibold tracking-wider uppercase border border-[#5E765E]/15">
                <Cookie className="w-3.5 h-3.5" />
                Cookies &amp; Analítica
              </span>
            </div>

            <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight">
              Política de Privacidad, Cookies <br />
              <span className="italic text-[#5E765E]">&amp; Términos del Servicio</span>
            </h1>

            <p className="font-['Montserrat',sans-serif] text-xs sm:text-sm text-[#111111]/75 max-w-3xl leading-relaxed mt-5">
              Transparencia integral en el tratamiento de tus datos personales, política de cookies bajo estándares de Google Ads y condiciones contractuales de reserva para experiencias en estudio, a domicilio y talleres en Meraki Spa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#5E765E]/15 text-xs text-[#111111]/80">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-[#5E765E] shrink-0" />
                <span><strong>Titular:</strong> {SPA_INFO.founder}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#5E765E] shrink-0" />
                <span><strong>Estudio:</strong> Pueblo Libre, Lima</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#5E765E] shrink-0" />
                <span><strong>Contacto:</strong> {SPA_INFO.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-[#5E765E] shrink-0" />
                <span><strong>Marco:</strong> Ley 29733 / D.S. 003-2013-JUS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section with Sticky Sidebar */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
              
              {/* Sidebar Navigation */}
              <aside className="lg:col-span-4" aria-label="Índice de Políticas">
                <div className="sticky top-28 space-y-6">
                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#5E765E]/15 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#5E765E] mb-4 flex items-center justify-between">
                      <span>Índice del Documento</span>
                      <span className="text-[11px] font-mono text-[#D5A688]">12 Secciones</span>
                    </h3>

                    <nav className="flex flex-col gap-1.5 max-h-[55vh] overflow-y-auto pr-1">
                      {privacySections.map((section, index) => (
                        <a
                          href={`#${section.id}`}
                          key={section.id}
                          className="flex items-start gap-2.5 text-xs text-[#111111]/75 hover:text-[#5E765E] py-1.5 px-2 rounded-lg hover:bg-[#FFF2DE]/50 transition-colors"
                        >
                          <span className="font-mono text-[11px] text-[#D5A688] font-semibold shrink-0 mt-0.5">
                            <SectionNumber index={index} />
                          </span>
                          <span className="leading-snug">{section.title}</span>
                        </a>
                      ))}
                    </nav>
                  </div>

                  {/* Quick ARCO Callout */}
                  <div className="bg-[#5E765E] text-[#FFF2DE] p-6 rounded-2xl shadow-sm border border-[#D5A688]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="w-4 h-4 text-[#D5A688]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#D5A688]">
                        ¿Consultas sobre tus datos?
                      </h4>
                    </div>
                    <p className="text-xs leading-relaxed text-[#FFF2DE]/85 mb-4 font-light">
                      Puedes ejercer tus derechos de Acceso, Rectificación o Eliminación escribiéndonos directamente:
                    </p>
                    <div className="space-y-2 text-xs">
                      <a
                        href={`mailto:${SPA_INFO.email}?subject=Consulta%20de%20Privacidad%20ARCO`}
                        className="flex items-center gap-2 text-[#FFF2DE] hover:text-[#D5A688] transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#D5A688]" />
                        <span className="underline">{SPA_INFO.email}</span>
                      </a>
                      <a
                        href={SPA_INFO.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#FFF2DE] hover:text-[#D5A688] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#D5A688]" />
                        <span>WhatsApp: {SPA_INFO.whatsappDisplay}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Body Articles */}
              <div className="lg:col-span-8 space-y-8">
                {privacySections.map((section, index) => (
                  <article
                    id={section.id}
                    key={section.id}
                    className="bg-[#FFFFFF] p-8 sm:p-10 rounded-2xl border border-[#5E765E]/15 shadow-sm scroll-mt-28 transition-all hover:border-[#5E765E]/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs text-[#D5A688] font-semibold tracking-widest">
                        SECCIÓN <SectionNumber index={index} />
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF2DE] text-[#5E765E] font-medium border border-[#5E765E]/15">
                        {section.badge}
                      </span>
                    </div>

                    <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-medium text-[#111111] mb-4">
                      {section.title}
                    </h2>

                    <p className="text-sm sm:text-base text-[#111111]/80 leading-relaxed font-light mb-4">
                      {section.content}
                    </p>

                    {section.bulletPoints && section.bulletPoints.length > 0 && (
                      <ul className="space-y-2.5 my-4">
                        {section.bulletPoints.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-3 text-xs sm:text-sm text-[#111111]/75 leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-[#5E765E] shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.callout && (
                      <div
                        className={`mt-5 p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 border ${
                          section.callout.type === 'success'
                            ? 'bg-[#5E765E]/10 border-[#5E765E]/30 text-[#2B3D2B]'
                            : section.callout.type === 'warning'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-[#FFF2DE] border-[#D5A688]/30 text-[#6B4B32]'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#5E765E]" />
                        <span className="leading-relaxed">{section.callout.text}</span>
                      </div>
                    )}
                  </article>
                ))}

                {/* Final Acceptance Banner */}
                <div className="bg-gradient-to-r from-[#5E765E] to-[#4D634D] text-[#FFF2DE] p-8 rounded-2xl shadow-md border border-[#D5A688]/30 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-[#D5A688]" />
                    <h3 className="font-['Cormorant_Garamond',serif] text-2xl text-white font-normal">
                      Compromiso de Confianza Meraki
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#FFF2DE]/90 leading-relaxed font-light mb-5">
                    Diseñamos cada uno de nuestros rituales, servicios a domicilio y talleres para que vivas una experiencia cálida, segura y transparente desde el primer contacto hasta el acabado final.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a
                      href={SPA_INFO.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D5A688] hover:bg-[#c99574] text-[#111111] text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      <span>Conversar por WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wider transition-all border border-white/20"
                    >
                      <span>Volver al Inicio</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
