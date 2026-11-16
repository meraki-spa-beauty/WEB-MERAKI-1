import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/layout/FloatingWhatsAppButton';
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
  UserCheck,
  BookOpen,
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
    content: 'De conformidad con la legislación vigente en la República del Perú (Ley N° 29733 y Código de Protección y Defensa del Consumidor - Ley N° 29571), se informa la identidad del titular:',
    bulletPoints: [
      `Denominación y Titular: ${SPA_INFO.legalBusinessName}.`,
      `Registro Tributario: ${SPA_INFO.rucDisplay}.`,
      `Domicilio físico del estudio: ${SPA_INFO.studioAddress}.`,
      `Canal formal de privacidad y atención: ${SPA_INFO.email}`,
      `Atención directa y WhatsApp oficial: ${SPA_INFO.whatsappDisplay}`,
      `Ámbito de aplicación: El presente documento rige en el sitio web oficial (${SPA_INFO.siteUrl}), sus rutas informativas y de reserva, así como en la coordinación de talleres y mensajería oficial.`,
    ],
  },
  {
    id: 'marco-legal',
    category: 'Protección de Datos',
    title: 'Marco Legal: Ley N° 29733 de Protección de Datos Personales',
    badge: 'Normativa Peruana',
    content: 'El tratamiento de datos personales en Meraki Spa se encuentra estrictamente subordinado a las disposiciones de la Ley N° 29733 (Ley de Protección de Datos Personales de la República del Perú) y su Reglamento aprobado mediante el Decreto Supremo N° 003-2013-JUS.',
    bulletPoints: [
      'Principio de Legalidad: El tratamiento de datos se realiza con estricto apego a las leyes peruanas aplicables.',
      'Principio de Consentimiento: Los datos se recopilan previo consentimiento libre, previo, expreso, informado e inequívoco mediante casilla de verificación en nuestros formularios.',
      'Principio de Finalidad: Los datos recopilados no serán utilizados para propósitos distintos a los informados y consentidos.',
      'Principio de Proporcionalidad: Solo solicitamos los datos estrictamente necesarios para coordinar y prestar nuestros servicios estéticos y formativos.',
      'Principio de Seguridad: Aplicamos reglas estrictas de acceso autenticado para proteger la información de citas y clientas.',
    ],
  },
  {
    id: 'datos-recopilados',
    category: 'Protección de Datos',
    title: 'Datos Personales que Recopilamos',
    badge: 'Información Capturada',
    content: 'Recopilamos únicamente los datos indispensables para la cotización, reserva, ejecución segura y seguimiento de nuestras experiencias de spa y talleres:',
    bulletPoints: [
      'Datos de Identificación y Contacto: Nombres completos, número de teléfono celular (WhatsApp) y correo electrónico voluntariamente remitido en nuestros formularios.',
      'Datos de Ubicación para Atención a Domicilio: Distrito, dirección exacta y referencias urbanas en Lima Metropolitana para la logística y ruta de nuestro equipo profesional.',
      'Datos Estéticos y de Bioseguridad: Observaciones sobre alergias previas a cosméticos, solventes, acrílicos o sensibilidad cutánea para adaptar los protocolos de bioseguridad.',
    ],
    callout: {
      type: 'info',
      text: 'Meraki Spa jamás solicita ni almacena claves secretas de billeteras digitales (Yape), códigos OTP de seguridad ni datos crudos de tarjetas bancarias.',
    },
  },
  {
    id: 'finalidad-tratamiento',
    category: 'Protección de Datos',
    title: 'Finalidad y Uso de la Información',
    badge: 'Uso Legítimo',
    content: 'La información personal capturada se destina de forma exclusiva a las siguientes finalidades:',
    bulletPoints: [
      'Coordinación de citas y rutas: Verificar disponibilidad en estudio (Pueblo Libre) o planificar traslados a domicilio u oficina en Lima entre las 06:00 y 20:00.',
      'Confirmación documental: Emitir la constancia de reserva digital con código único y enviar el resumen automático por correo electrónico.',
      'Inscripción a Club VIP y Talleres: Gestionar tarjetas digitales de sellos de fidelidad y cupos de workshops.',
      'Comprobación de pagos: Conciliar el adelanto del 40% por Yape o pasarela de pago autorizada.',
    ],
  },
  {
    id: 'no-comercializacion',
    category: 'Protección de Datos',
    title: 'Garantía Expresa de No Venta ni Cesión de Datos',
    badge: 'Cumplimiento Publicitario',
    content: 'Asumimos un compromiso inquebrantable de confidencialidad respecto a tu información:',
    bulletPoints: [
      'NO venta de datos: Meraki Spa NO comercializa, no vende, no alquila ni cede bajo ninguna modalidad tus datos personales a terceros.',
      'NO bases de datos externas: Tu información jamás será incorporada en listas de spam comercial.',
      'Acceso restringido: Únicamente la dirección general y el personal operativo expresamente autorizado acceden a los datos para ejecutar tu atención.',
    ],
    callout: {
      type: 'success',
      text: 'Garantía total de privacidad: Tus datos personales solo se emplean para gestionar tu atención y beneficios en Meraki Spa.',
    },
  },
  {
    id: 'politica-cookies',
    category: 'Cookies & Rastreo',
    title: 'Política de Cookies y Tecnologías de Seguimiento',
    badge: 'Transparencia Digital',
    content: 'Este sitio web utiliza cookies técnicas, analíticas y de medición publicitaria para proporcionar una navegación segura y fluida:',
    bulletPoints: [
      'Cookies Técnicas (Esenciales): Necesarias para el funcionamiento de la sesión de fidelidad VIP y la estabilidad de la plataforma.',
      'Cookies de Análisis y Rendimiento (Google Analytics 4 / Tag Manager): Recopilan métricas agregadas sobre páginas visitadas y tiempos de carga sin identificar personalmente al visitante.',
      'Cookies de Conversión (Google Ads / Meta / TikTok): Permiten medir la efectividad de nuestras campañas informativas.',
      'Gestión de Cookies: Puedes bloquear o eliminar las cookies desde la configuración de tu navegador en cualquier momento.',
    ],
  },
  {
    id: 'derechos-arco',
    category: 'Protección de Datos',
    title: 'Ejercicio de Derechos ARCO (Ley N° 29733)',
    badge: 'Tus Derechos',
    content: 'Como titular de tus datos personales, puedes ejercer en cualquier momento los derechos de Acceso, Rectificación, Cancelación y Oposición:',
    bulletPoints: [
      'Acceso y Rectificación: Conocer qué datos personales tuyos se conservan y solicitar su corrección.',
      'Cancelación y Oposición: Solicitar la supresión de tus registros cuando hayan dejado de ser necesarios.',
      `Canal de tramitación: Envía tu solicitud escrita a ${SPA_INFO.email} con el asunto "Derechos ARCO" o mediante WhatsApp al ${SPA_INFO.whatsappDisplay}. Atenderemos tu requerimiento dentro de los plazos legales peruanos.`,
    ],
  },
  {
    id: 'terminos-reserva',
    category: 'Términos del Servicio',
    title: 'Políticas de Reserva, Adelanto del 40% y Medios de Pago',
    badge: 'Pagos & Condiciones',
    content: 'Condiciones aplicables para formalizar toda experiencia de belleza y bienestar en Meraki Spa:',
    bulletPoints: [
      'Confirmación con anticipo del 40%: Toda cita registrada en el sitio web requiere abonar el 40% de adelanto mediante Yape oficial a Ana Díaz (+51 993 067 291) o mediante la pasarela digital habilitada (como Culqi o Mercado Pago cuando esté activa).',
      'Validación por WhatsApp en modo manual: Mientras esté vigente la verificación manual por Yape, la clienta debe remitir su ficha y captura al WhatsApp oficial para validar el abono y confirmar la reserva en firme.',
      'Pagos por pasarela digital: En caso de utilizar checkout autorizado con tarjeta o Yape por Internet, la autorización bancaria se procesará directamente en los servidores encriptados (PCI-DSS) del procesador de pagos externo; Meraki Spa solo recibe el código de operación y confirmación del abono.',
      'Saldo restante: El 60% restante se cancela al concluir el servicio presencial.',
    ],
  },
  {
    id: 'terminos-cancelaciones',
    category: 'Términos del Servicio',
    title: 'Política de Cancelaciones, Reprogramaciones y Devoluciones',
    badge: 'Puntualidad & Cambios',
    content: 'Lineamientos transparentes para coordinar cambios tanto de la clienta como del estudio:',
    bulletPoints: [
      'Reprogramación de la clienta: Puedes solicitar reprogramar tu fecha u hora con al menos 24 horas de anticipación sin penalidad.',
      'Cancelación tardía o inasistencia: Ante cancelaciones con menos de 24 horas o inasistencia sin aviso previo, el anticipo del 40% no es reembolsable debido a la reserva exclusiva del bloque horario y traslado.',
      'Reprogramación o cancelación atribuible a Meraki Spa: Si por fuerza mayor o contingencia operativa Meraki Spa debiera reprogramar una cita confirmada y el nuevo horario no se ajustara a tu disponibilidad, podrás solicitar la reprogramación preferente o la devolución del 100% del adelanto abonado mediante el mismo medio de pago en un plazo máximo de 48 horas hábiles.',
      'Tolerancia de espera: Se otorga una tolerancia máxima de 15 minutos respecto a la hora pactada.',
    ],
    callout: {
      type: 'warning',
      text: 'El adelanto garantiza la exclusividad de tu bloque horario entre las 06:00 y 20:00.',
    },
  },
  {
    id: 'terminos-bioseguridad',
    category: 'Términos del Servicio',
    title: 'Protocolos de Bioseguridad y Calidad Sanitaria',
    badge: 'Higiene & Cuidado',
    content: 'La seguridad dermatológica y salud de nuestras clientas es prioritaria en cada atención:',
    bulletPoints: [
      'Esterilización de herramientas: Todo instrumental metálico pasa por limpieza ultrasónica, desinfección y esterilización en calor seco.',
      'Materiales descartables: Limas, tacos pulidores y protectores son de un solo uso por clienta.',
      'Evaluación previa: Nos reservamos el derecho de abstenernos de aplicar sistemas acrílicos o semipermanentes ante signos de micosis activa o heridas abiertas, priorizando la salud ungueal.',
    ],
  },
  {
    id: 'terminos-redes-sociales',
    category: 'Términos del Servicio',
    title: 'Uso de Material Audiovisual y Club VIP',
    badge: 'Portafolio & Beneficios',
    content: 'Disposiciones sobre contenido visual y beneficios de fidelidad:',
    bulletPoints: [
      `Registro fotográfico: Podrán capturarse fotografías de los trabajos terminados para exhibición en ${SPA_INFO.instagram}. Si prefieres que no se publiquen imágenes de tu servicio, solo debes indicarlo antes de iniciar.`,
      'Club VIP Meraki: Los sellos digitales son personales, intransferibles y equivalen a una sesión concluida conforme al programa vigente.',
    ],
  },
  {
    id: 'libro-reclamaciones-jurisdiccion',
    category: 'Términos del Servicio',
    title: 'Libro de Reclamaciones Virtual y Jurisdicción',
    badge: 'INDECOPI Perú',
    content: 'Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571) y su Reglamento (D.S. N° 011-2011-PCM):',
    bulletPoints: [
      'Meraki Spa pone a disposición de sus clientas y usuarias el Libro de Reclamaciones Virtual accesible permanentemente en el pie de página de este sitio web.',
      'Toda queja o reclamo registrado genera un código único de seguimiento y será atendido dentro del plazo legal máximo de quince (15) días hábiles.',
      'Vigencia y Jurisdicción: Documento vigente en Lima, Perú, sometido a la competencia de las autoridades administrativas y jurisdiccionales de Lima Metropolitana.',
    ],
  },
];

function SectionNumber({ index }: { index: number }) {
  return <>{String(index + 1).padStart(2, '0')}</>;
}

export function Privacy() {
  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 lg:pt-28 lg:pb-24 border-b border-[#5E765E]/15 bg-gradient-to-b from-[#FFF2DE] to-[#F7ECE1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5E765E]/15 text-[#5E765E] text-xs font-semibold tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                Ley N° 29733 (Perú)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D5A688]/20 text-[#8C5835] text-xs font-semibold tracking-wider uppercase">
                <Lock className="w-3.5 h-3.5" />
                Ley N° 29571 INDECOPI
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-[#111111]/70 text-xs font-semibold tracking-wider uppercase border border-[#5E765E]/15">
                <Cookie className="w-3.5 h-3.5" />
                Cookies &amp; Pagos
              </span>
            </div>

            <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight">
              Política de Privacidad, Cookies <br />
              <span className="italic text-[#5E765E]">&amp; Términos del Servicio</span>
            </h1>

            <p className="font-['Montserrat',sans-serif] text-xs sm:text-sm text-[#111111]/75 max-w-3xl leading-relaxed mt-5">
              Transparencia integral en el tratamiento de tus datos personales, pagos digitales, devoluciones y condiciones de atención en estudio o a domicilio en Meraki Spa.
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
                <span><strong>Marco:</strong> Ley 29733 / Ley 29571</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section with Sticky Sidebar */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
              <aside className="lg:col-span-4" aria-label="Índice de Políticas">
                <div className="sticky top-28 space-y-6">
                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#5E765E]/15 shadow-sm">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#5E765E] mb-4 flex items-center justify-between">
                      <span>Índice del Documento</span>
                      <span className="text-[11px] font-mono text-[#D5A688]">{privacySections.length} Secciones</span>
                    </h2>

                    <nav className="flex flex-col gap-1.5 max-h-[52vh] overflow-y-auto pr-1">
                      {privacySections.map((section, index) => (
                        <a
                          href={`#${section.id}`}
                          key={section.id}
                          className="flex items-start gap-2.5 text-xs text-[#111111]/75 hover:text-[#5E765E] py-1.5 px-2 rounded-lg hover:bg-[#FFF2DE]/50 transition-colors"
                        >
                          <span className="font-mono text-[11px] text-[#9A6342] font-semibold shrink-0 mt-0.5">
                            <SectionNumber index={index} />
                          </span>
                          <span className="leading-snug">{section.title}</span>
                        </a>
                      ))}
                    </nav>
                  </div>

                  {/* Libro de Reclamaciones Card */}
                  <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#D5A688]/45 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-[#5E765E]">
                      <BookOpen className="w-4 h-4 text-[#9A6342]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Libro de Reclamaciones
                      </h3>
                    </div>
                    <p className="text-xs text-[#111111]/75 leading-relaxed font-light">
                      ¿Deseas registrar una queja o reclamo formal conforme a INDECOPI? Accede directamente a nuestro canal virtual.
                    </p>
                    <Link
                      to="/libro-reclamaciones"
                      className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl bg-[#5E765E] text-[#FFF2DE] text-xs font-semibold uppercase tracking-wider hover:bg-[#4d634d] transition-colors"
                    >
                      <span>Abrir Libro de Reclamaciones</span>
                    </Link>
                  </div>

                  {/* Quick ARCO Callout */}
                  <div className="bg-[#5E765E] text-[#FFF2DE] p-6 rounded-2xl shadow-sm border border-[#D5A688]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="w-4 h-4 text-[#D5A688]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#D5A688]">
                        ¿Consultas sobre tus datos?
                      </h3>
                    </div>
                    <p className="text-xs leading-relaxed text-[#FFF2DE]/85 mb-4 font-light">
                      Ejerce tus derechos de Acceso, Rectificación o Eliminación escribiendo directamente:
                    </p>
                    <div className="space-y-2 text-xs">
                      <a
                        href={`mailto:${SPA_INFO.email}?subject=Consulta%20de%20Privacidad%20ARCO`}
                        className="flex items-center gap-2 text-[#FFF2DE] hover:text-[#D5A688] transition-colors break-all"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#D5A688] shrink-0" />
                        <span className="underline">{SPA_INFO.email}</span>
                      </a>
                      <a
                        href={SPA_INFO.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#FFF2DE] hover:text-[#D5A688] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#D5A688] shrink-0" />
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
                      <span className="font-mono text-xs text-[#9A6342] font-semibold tracking-widest">
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
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wider transition-all border border-white/20"
                    >
                      <span>Volver al Inicio</span>
                    </Link>
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
