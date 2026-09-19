import { useState } from 'react';
import { Gift, Sparkles, Send } from 'lucide-react';
import { SPA_INFO } from '../../data/spaData';

export function GiftCardsSection() {
  const [selectedType, setSelectedType] = useState<'digital' | 'box'>('box');
  const [amount, setAmount] = useState<number>(250);
  const [customRecipient, setCustomRecipient] = useState<string>('');
  const [customSender, setCustomSender] = useState<string>('');

  const amounts = [180, 250, 350, 500];

  const generateGiftCardWhatsApp = () => {
    const text = `🎁 *SOLICITUD DE GIFT CARD — MERAKI SPA* 🎁
━━━━━━━━━━━━━━━━━━━━
✨ *Tipo:* ${selectedType === 'box' ? 'Meraki Luxury Box (Física con Vela Aromática y Caja de Lujo)' : 'Gift Card Digital (Virtual por WhatsApp / Email)'}
💰 *Monto:* S/. ${amount}
👤 *Para:* ${customRecipient || 'Por definir'}
💌 *De:* ${customSender || 'Por definir'}
━━━━━━━━━━━━━━━━━━━━
Deseo coordinar la emisión y dedicatoria personalizada.`;

    return encodeURIComponent(text);
  };

  return (
    <section id="gift-cards" className="py-20 md:py-28 bg-[#FFFFFF] border-b border-[#5E765E]/15 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Presentation */}
          <div className="lg:col-span-6 text-left">
            <span className="text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.24em] text-[#5E765E] block mb-2">
              Tarjetas de Regalo &amp; Experiencias
            </span>
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight mb-6">
              El arte de regalar <span className="italic text-[#5E765E]">una pausa inolvidable.</span>
            </h2>
            <p className="font-['Montserrat',sans-serif] text-sm sm:text-base text-[#111111]/75 font-light leading-relaxed mb-8">
              Sorprende en cumpleaños, aniversarios o momentos especiales con un regalo que renueva cuerpo y mente. Todas nuestras tarjetas tienen vigencia de 6 meses y son canjeables por cualquier tratamiento de nuestra carta.
            </p>

            <div className="space-y-4">
              <div
                onClick={() => setSelectedType('box')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  selectedType === 'box'
                    ? 'bg-[#FFF2DE] border-[#5E765E] shadow-sm'
                    : 'bg-white border-[#5E765E]/15 hover:border-[#5E765E]/40'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-[#D5A688]" />
                </div>
                <div>
                  <h4 className="font-['Cormorant_Garamond',serif] text-xl font-normal text-[#111111]">
                    Meraki Luxury Box (Física)
                  </h4>
                  <p className="text-xs font-['Montserrat',sans-serif] text-[#111111]/70 mt-1">
                    Presentación de lujo en estuche rígido texturizado con cinta de raso, vela aromática botánica de soya y tarjeta con sello de cera. Entrega por courier en Lima o retiro en tienda.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setSelectedType('digital')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  selectedType === 'digital'
                    ? 'bg-[#FFF2DE] border-[#5E765E] shadow-sm'
                    : 'bg-white border-[#5E765E]/15 hover:border-[#5E765E]/40'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#5E765E]/20 text-[#5E765E] flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-['Cormorant_Garamond',serif] text-xl font-normal text-[#111111]">
                    Gift Card Digital (Virtual)
                  </h4>
                  <p className="text-xs font-['Montserrat',sans-serif] text-[#111111]/70 mt-1">
                    Envío instantáneo en formato PDF de alta resolución personalizado con tu mensaje especial, listo para compartir por WhatsApp o imprimir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Customizer Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#FFF2DE] p-8 sm:p-10 rounded-3xl border border-[#5E765E]/20 shadow-xl text-left relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#5E765E]/20">
                <span className="text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-widest text-[#5E765E]">
                  Personaliza tu Obsequio
                </span>
                <span className="text-xs font-['Montserrat',sans-serif] text-[#111111]/60">
                  Válido por 6 meses
                </span>
              </div>

              {/* Amount Buttons */}
              <div className="mb-6">
                <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#111111] mb-3">
                  Selecciona el Monto (Soles)
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {amounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-3 px-2 rounded-xl text-xs font-['Montserrat',sans-serif] font-semibold border transition-all cursor-pointer ${
                        amount === val
                          ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] shadow-sm'
                          : 'bg-white text-[#111111] border-[#5E765E]/20 hover:border-[#5E765E]'
                      }`}
                    >
                      S/. {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient & Sender */}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-[11px] font-['Montserrat',sans-serif] uppercase font-semibold text-[#111111]/80 mb-1.5">
                    ¿Para quién es? (Nombre del agasajado)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Valeria Mendoza"
                    value={customRecipient}
                    onChange={(e) => setCustomRecipient(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-['Montserrat',sans-serif] uppercase font-semibold text-[#111111]/80 mb-1.5">
                    De parte de: (Tu nombre)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Martín Cárdenas"
                    value={customSender}
                    onChange={(e) => setCustomSender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                  />
                </div>
              </div>

              {/* Total & Action */}
              <div className="pt-6 border-t border-[#5E765E]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#111111]/60 block font-['Montserrat',sans-serif]">
                    Total a Regalar:
                  </span>
                  <span className="font-['Montserrat',sans-serif] text-3xl font-bold text-[#5E765E]">
                    S/. {amount}
                  </span>
                </div>

                <a
                  href={`https://wa.me/${SPA_INFO.whatsappNumber}?text=${generateGiftCardWhatsApp()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] px-8 py-3.5 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-[0.16em] shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#D5A688]" />
                  <span>Solicitar Gift Card</span>
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
