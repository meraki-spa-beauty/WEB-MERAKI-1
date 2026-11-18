import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/layout/FloatingWhatsAppButton';
import { SPA_INFO } from '../data/spaData';
import { submitComplaintToFirestore } from '../services/merakiFirestore';
import { syncLeadToGoogleSheets } from '../utils/googleSheetsSync';
import type { ComplaintEntry } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Printer,
  ShieldCheck,
  AlertCircle,
  Send,
} from 'lucide-react';

export function LibroReclamaciones() {
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<'DNI' | 'CE' | 'Pasaporte' | 'RUC'>('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isMinor, setIsMinor] = useState(false);

  const [serviceContracted, setServiceContracted] = useState('');
  const [amountClaimedPEN, setAmountClaimedPEN] = useState('0');
  const [complaintType, setComplaintType] = useState<'reclamo' | 'queja'>('reclamo');
  const [detail, setDetail] = useState('');
  const [consumerRequest, setConsumerRequest] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedClaim, setSavedClaim] = useState<ComplaintEntry | null>(null);

  const todayFormatted = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !documentNumber.trim() || !phone.trim() || !email.trim() || !detail.trim()) {
      setErrorMsg('Por favor completa todos los campos obligatorios marcados con *.');

      return;
    }

    if (!privacyAccepted) {
      setErrorMsg('Debes confirmar la veracidad de los datos y aceptar el tratamiento conforme a ley.');

      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const claimCode = `RECL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const entry: ComplaintEntry = {
      claimCode,
      fullName: fullName.trim(),
      documentType,
      documentNumber: documentNumber.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || 'Lima, Perú',
      isMinor,
      serviceContracted: serviceContracted.trim() || 'Servicio de Spa / Belleza',
      amountClaimedPEN: Math.max(0, Number(amountClaimedPEN) || 0),
      complaintType,
      detail: detail.trim(),
      consumerRequest: consumerRequest.trim() || 'Evaluación y respuesta formal',
      status: 'pendiente',
      adminResponse: '',
      createdAtIso: new Date().toISOString(),
    };

    try {
      await submitComplaintToFirestore(entry);

      await syncLeadToGoogleSheets({
        formulario: 'Libro de Reclamaciones',
        cliente: entry.fullName,
        whatsapp: entry.phone,
        email: entry.email,
        servicio_detalle: `[${entry.complaintType.toUpperCase()}] ${entry.serviceContracted}`,
        modalidad: `${entry.documentType} ${entry.documentNumber}`,
        direccion: entry.address,
        monto_total: `S/ ${entry.amountClaimedPEN}`,
        codigo_reserva: entry.claimCode,
        estado_pago: 'Hoja de Reclamación Registrada',
        mensaje_notas: `Detalle: ${entry.detail} | Pedido: ${entry.consumerRequest}`,
      });

      setSavedClaim(entry);
    } catch {
      setErrorMsg('Ocurrió un error al registrar tu hoja de reclamación. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen meraki-editorial-canvas text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />

      <main className="flex-1 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          {/* Official Header Box */}
          <div className="theme-card-surface rounded-3xl p-6 sm:p-10 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="meraki-editorial-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[#5E765E] text-[11px] font-semibold uppercase tracking-[0.2em]">
                <BookOpen className="w-3.5 h-3.5 text-[#D5A688]" />
                <span>Libro de Reclamaciones Virtual</span>
              </div>
              <span className="text-xs font-mono text-[#5E765E] font-semibold">
                Fecha: {todayFormatted}
              </span>
            </div>

            <h1 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-5xl font-normal text-[#111111] mb-3">
              Hoja de Reclamación Virtual
            </h1>
            <p className="text-xs text-[#111111]/75 leading-relaxed mb-5">
              Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571) y el Reglamento del Libro de Reclamaciones (D.S. N° 011-2011-PCM), ponemos a tu disposición este canal oficial.
            </p>

            {/* Provider Identification */}
            <div className="p-4 rounded-2xl bg-[#EDF2EC]/80 border border-[#5E765E]/20 text-xs space-y-1">
              <p className="font-semibold text-[#5E765E] uppercase tracking-wider text-[10px]">
                Datos del Proveedor
              </p>
              <p><strong>Razón Comercial / Titular:</strong> {SPA_INFO.legalBusinessName}</p>
              <p><strong>Identificación Tributaria:</strong> {SPA_INFO.rucDisplay}</p>
              <p><strong>Dirección del Establecimiento:</strong> {SPA_INFO.studioAddress}</p>
              <p><strong>Correo Institucional:</strong> {SPA_INFO.email}</p>
            </div>
          </div>

          {savedClaim ? (
            <div className="theme-card-surface rounded-3xl p-8 sm:p-10 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#5E765E]/15 text-[#5E765E] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5E765E] block mb-1">
                  Constancia de Registro Oficial
                </span>
                <h2 className="font-['Cormorant_Garamond',serif] text-3xl text-[#111111]">
                  Código: {savedClaim.claimCode}
                </h2>
                <p className="text-xs text-[#111111]/75 max-w-lg mx-auto mt-2 leading-relaxed">
                  Tu {savedClaim.complaintType} ha sido registrado correctamente y notificado a <strong>{SPA_INFO.email}</strong> y a tu correo <strong>{savedClaim.email}</strong>. Meraki Spa responderá formalmente en un plazo máximo de quince (15) días hábiles.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#5E765E]/20 p-5 text-left text-xs space-y-2 max-w-xl mx-auto">
                <p><strong>Consumidor:</strong> {savedClaim.fullName} ({savedClaim.documentType} {savedClaim.documentNumber})</p>
                <p><strong>Tipo:</strong> {savedClaim.complaintType === 'reclamo' ? 'Reclamo' : 'Queja'}</p>
                <p><strong>Servicio:</strong> {savedClaim.serviceContracted} (Monto: S/ {savedClaim.amountClaimedPEN})</p>
                <p><strong>Detalle:</strong> {savedClaim.detail}</p>
                <p><strong>Pedido:</strong> {savedClaim.consumerRequest}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5E765E] text-[#FFF2DE] text-xs font-semibold uppercase tracking-wider hover:bg-[#4d634d] cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#D5A688]" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#5E765E]/25 bg-white text-xs font-semibold text-[#5E765E] hover:bg-[#FFF2DE]"
                >
                  <span>Volver al Inicio</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="theme-card-surface rounded-3xl p-6 sm:p-10 space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-4 pb-2 border-b border-[#5E765E]/15">
                  1. Identificación del Consumidor
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="claim-fullname" className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Nombres y Apellidos Completos *
                    </label>
                    <input
                      id="claim-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nombre completo o del padre/madre si es menor de edad"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                    />
                  </div>

                  <div>
                    <label htmlFor="claim-doctype" className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Tipo de Documento *
                    </label>
                    <select
                      id="claim-doctype"
                      value={documentType}
                      onChange={(e) => {
                        const val = e.target.value;

                        if (val === 'DNI' || val === 'CE' || val === 'Pasaporte' || val === 'RUC') {
                          setDocumentType(val);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">Carné de Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="claim-docnum" className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Número de Documento *
                    </label>
                    <input
                      id="claim-docnum"
                      type="text"
                      required
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="Ej. 72345678"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                    />
                  </div>

                  <div>
                    <label htmlFor="claim-phone" className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Teléfono / Celular *
                    </label>
                    <input
                      id="claim-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. 993 067 291"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                    />
                  </div>

                  <div>
                    <label htmlFor="claim-email" className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Correo Electrónico (para recibir copia) *
                    </label>
                    <input
                      id="claim-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu-correo@ejemplo.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="claim-address" className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Domicilio / Distrito *
                    </label>
                    <input
                      id="claim-address"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Dirección completa y distrito"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      id="claim-minor"
                      type="checkbox"
                      checked={isMinor}
                      onChange={(e) => setIsMinor(e.target.checked)}
                      className="rounded border-[#5E765E]/40 text-[#5E765E]"
                    />
                    <label htmlFor="claim-minor" className="text-xs text-[#111111]/80">
                      Soy menor de edad (registro realizado con representante legal)
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-4 pb-2 border-b border-[#5E765E]/15">
                  2. Identificación del Bien Contratado
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="claim-service" className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Servicio o Tratamiento Contratado *
                    </label>
                    <input
                      id="claim-service"
                      type="text"
                      required
                      value={serviceContracted}
                      onChange={(e) => setServiceContracted(e.target.value)}
                      placeholder="Ej. Soft Gel, Facial Profundo, Workshop..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                    />
                  </div>

                  <div>
                    <label htmlFor="claim-amount" className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Monto Reclamado (S/ PEN)
                    </label>
                    <input
                      id="claim-amount"
                      type="number"
                      min="0"
                      step="1"
                      value={amountClaimedPEN}
                      onChange={(e) => setAmountClaimedPEN(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-4 pb-2 border-b border-[#5E765E]/15">
                  3. Detalle de la Reclamación y Pedido del Consumidor
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setComplaintType('reclamo')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      complaintType === 'reclamo'
                        ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E]'
                        : 'bg-white text-[#111111] border-[#5E765E]/20'
                    }`}
                  >
                    <span className="font-bold text-xs block uppercase tracking-wider">Reclamo</span>
                    <span className={`text-[11px] block mt-0.5 ${complaintType === 'reclamo' ? 'text-[#FFF2DE]/85' : 'text-[#111111]/65'}`}>
                      Disconformidad relacionada a los servicios prestados.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComplaintType('queja')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      complaintType === 'queja'
                        ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E]'
                        : 'bg-white text-[#111111] border-[#5E765E]/20'
                    }`}
                  >
                    <span className="font-bold text-xs block uppercase tracking-wider">Queja</span>
                    <span className={`text-[11px] block mt-0.5 ${complaintType === 'queja' ? 'text-[#FFF2DE]/85' : 'text-[#111111]/65'}`}>
                      Malestar respecto a la atención al público o coordinación.
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="claim-detail" className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Detalle de los Hechos *
                    </label>
                    <textarea
                      id="claim-detail"
                      rows={4}
                      required
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      placeholder="Describe de manera clara lo ocurrido incluyendo fecha y modalidad de atención..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                    />
                  </div>

                  <div>
                    <label htmlFor="claim-request" className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Pedido Concreto del Consumidor
                    </label>
                    <textarea
                      id="claim-request"
                      rows={2}
                      value={consumerRequest}
                      onChange={(e) => setConsumerRequest(e.target.value)}
                      placeholder="Ej. Reprogramación, corrección del servicio o devolución del adelanto..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#EDF2EC]/80 border border-[#5E765E]/20 text-[11px] text-[#111111]/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#5E765E] shrink-0 mt-0.5" />
                <span>
                  La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI. El proveedor dará respuesta en un plazo no mayor a quince (15) días hábiles.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  id="claim-privacy"
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-[#5E765E]/40 text-[#5E765E]"
                />
                <label htmlFor="claim-privacy" className="text-xs text-[#111111]/80 leading-relaxed">
                  Declaro que los datos consignados son verídicos y acepto su tratamiento conforme a la{' '}
                  <Link to="/privacy" className="underline text-[#5E765E] font-medium">
                    Política de Privacidad
                  </Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="meraki-btn-fluid w-full bg-[#5E765E] hover:bg-[#4d634d] disabled:opacity-60 text-[#FFF2DE] py-4 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#D5A688]" />
                <span>{isSubmitting ? 'Registrando Hoja de Reclamación...' : 'Registrar Hoja de Reclamación'}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
