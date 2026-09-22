import './index.css';

// WhatsApp configuration
const WHATSAPP_NUMBER = '51993067291';

const PRICE_PER_SPOT = 180;

const DEPOSIT_PER_SPOT = 50;

interface BookingData {
  id: string;
  name: string;
  phone: string;
  email: string;
  experience: string;
  spots: number;
  paymentMethod: string;
  notes: string;
}

function getInputElement(id: string): HTMLInputElement | null {
  const el = document.getElementById(id);

  return el instanceof HTMLInputElement ? el : null;
}

function getSelectElement(id: string): HTMLSelectElement | null {
  const el = document.getElementById(id);

  return el instanceof HTMLSelectElement ? el : null;
}

function getTextAreaElement(id: string): HTMLTextAreaElement | null {
  const el = document.getElementById(id);

  return el instanceof HTMLTextAreaElement ? el : null;
}

function getAnchorElement(id: string): HTMLAnchorElement | null {
  const el = document.getElementById(id);

  return el instanceof HTMLAnchorElement ? el : null;
}

function generateBookingId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  return `MRK-WS-${randomNum}`;
}

function updateCalculations(spots: number) {
  const total = spots * PRICE_PER_SPOT;
  const deposit = spots * DEPOSIT_PER_SPOT;
  const remaining = total - deposit;

  const totalEl = document.getElementById('calc-total');
  const depositEl = document.getElementById('calc-deposit');
  const remainingEl = document.getElementById('calc-remaining');
  const spotsLabelEl = document.getElementById('calc-spots-label');

  if (totalEl) {
    totalEl.textContent = `S/ ${total}`;
  }

  if (depositEl) {
    depositEl.textContent = `S/ ${deposit}`;
  }

  if (remainingEl) {
    remainingEl.textContent = `S/ ${remaining}`;
  }

  if (spotsLabelEl) {
    spotsLabelEl.textContent = `${spots} ${spots === 1 ? 'cupo' : 'cupos'}`;
  }
}

function buildWhatsAppUrl(data: BookingData): string {
  const total = data.spots * PRICE_PER_SPOT;
  const deposit = data.spots * DEPOSIT_PER_SPOT;
  const remaining = total - deposit;

  const message = `✨ *PRE-RESERVA · MERAKI PRESS ON WORKSHOP (HALLOWEEN EDITION)* ✨

Hola Ana María / Meraki Spa, deseo apartar mi cupo para el taller presencial:

🎃 *Taller:* Meraki Press On Nails · Halloween Edition
📅 *Fecha:* Sábado 3 de Octubre (10:30 a. m. – 2:30 p. m.)
📍 *Lugar:* Jesús María (Jirón Santo Domingo 153)

📋 *DATOS DE LA RESERVA:*
• *Código:* ${data.id}
• *Nombre:* ${data.name}
• *WhatsApp:* ${data.phone}
• *Email:* ${data.email}
• *Cupos:* ${data.spots} ${data.spots === 1 ? 'persona' : 'personas'}
• *Nivel:* ${data.experience}
• *Método para adelanto:* ${data.paymentMethod}
${data.notes ? `• *Consulta / Nota:* ${data.notes}\n` : ''}
💰 *DESGLOSE DE INVERSIÓN:*
• Total: S/ ${total}
• *Adelanto a pagar para confirmar:* *S/ ${deposit}*
• Saldo restante el día del evento: S/ ${remaining}

Por favor, confirmen disponibilidad de cupo para enviar el comprobante de los S/ ${deposit}. ¡Muchas gracias! 🤍`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function showModal(data: BookingData, waUrl: string) {
  const modal = document.getElementById('confirmation-modal');

  if (!modal) {
    return;
  }

  const deposit = data.spots * DEPOSIT_PER_SPOT;
  const total = data.spots * PRICE_PER_SPOT;
  const remaining = total - deposit;

  const idEl = document.getElementById('modal-booking-id');
  const nameEl = document.getElementById('modal-client-name');
  const spotsEl = document.getElementById('modal-spots-count');
  const depositEl = document.getElementById('modal-deposit-amount');
  const totalEl = document.getElementById('modal-total-amount');
  const waBtn = getAnchorElement('modal-whatsapp-btn');

  if (idEl) {
    idEl.textContent = data.id;
  }

  if (nameEl) {
    nameEl.textContent = data.name;
  }

  if (spotsEl) {
    spotsEl.textContent = `${data.spots} ${data.spots === 1 ? 'cupo' : 'cupos'}`;
  }

  if (depositEl) {
    depositEl.textContent = `S/ ${deposit}`;
  }

  if (totalEl) {
    totalEl.textContent = `S/ ${total} (Saldo en clase: S/ ${remaining})`;
  }

  if (waBtn) {
    waBtn.href = waUrl;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('confirmation-modal');

  if (!modal) {
    return;
  }

  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

function copyToClipboard(text: string, buttonEl: HTMLElement, successText = '¡Copiado!') {
  const originalText = buttonEl.innerHTML;

  navigator.clipboard.writeText(text).then(() => {
    buttonEl.innerHTML = `✓ ${successText}`;
    buttonEl.classList.add('bg-stone-800', 'text-white');

    setTimeout(() => {
      buttonEl.innerHTML = originalText;
      buttonEl.classList.remove('bg-stone-800', 'text-white');
    }, 2200);
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    buttonEl.innerHTML = `✓ ${successText}`;

    setTimeout(() => {
      buttonEl.innerHTML = originalText;
    }, 2200);
  });
}

// Initialise event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // 1. Spot count selection & dynamic calculation
  const spotsInput = getSelectElement('booking-spots');

  if (spotsInput) {
    spotsInput.addEventListener('change', (e) => {
      const target = e.target;
      const val = target instanceof HTMLSelectElement ? parseInt(target.value, 10) : 1;
      updateCalculations(val);
    });

    updateCalculations(parseInt(spotsInput.value, 10) || 1);
  }

  // 2. Smooth scrolling to form
  const ctaButtons = document.querySelectorAll('.scroll-to-form');

  ctaButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const formSection = document.getElementById('registro-section');

      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
        const nameInput = getInputElement('booking-name');

        if (nameInput) {
          setTimeout(() => nameInput.focus(), 600);
        }
      }
    });
  });

  // 3. Form submission
  const bookingFormEl = document.getElementById('workshop-booking-form');
  const bookingForm = bookingFormEl instanceof HTMLFormElement ? bookingFormEl : null;

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = getInputElement('booking-name');
      const phoneInput = getInputElement('booking-phone');
      const emailInput = getInputElement('booking-email');
      const expInput = getSelectElement('booking-experience');
      const spotsSelect = getSelectElement('booking-spots');
      const paymentSelect = getSelectElement('booking-payment');
      const notesInput = getTextAreaElement('booking-notes');

      const name = nameInput?.value.trim() || '';
      const phone = phoneInput?.value.trim() || '';
      const email = emailInput?.value.trim() || '';
      const experience = expInput?.value || 'No tengo experiencia, comienzo desde cero';
      const spots = parseInt(spotsSelect?.value || '1', 10);
      const paymentMethod = paymentSelect?.value || 'Yape / Plin';
      const notes = notesInput?.value.trim() || '';

      // Validation
      if (!name || name.length < 3) {
        alert('Por favor, ingresa tu nombre y apellido completo.');
        nameInput?.focus();

        return;
      }

      if (!phone || phone.replace(/\D/g, '').length < 8) {
        alert('Por favor, ingresa un número de teléfono / WhatsApp válido.');
        phoneInput?.focus();

        return;
      }

      if (!email || !email.includes('@')) {
        alert('Por favor, ingresa un correo electrónico válido.');
        emailInput?.focus();

        return;
      }

      const bookingId = generateBookingId();

      const bookingData: BookingData = {
        id: bookingId,
        name,
        phone,
        email,
        experience,
        spots,
        paymentMethod,
        notes,
      };

      const waUrl = buildWhatsAppUrl(bookingData);

      showModal(bookingData, waUrl);
    });
  }

  // 4. Modal close handlers
  const closeBtn = document.getElementById('close-modal-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  // 5. Copy buttons
  const copyYapeBtn = document.getElementById('copy-yape-btn');

  if (copyYapeBtn) {
    copyYapeBtn.addEventListener('click', () => {
      copyToClipboard('993067291', copyYapeBtn, '¡Número copiado!');
    });
  }

  const copyAddressBtn = document.getElementById('copy-address-btn');

  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      copyToClipboard('Jirón Santo Domingo 153, Jesús María, Lima', copyAddressBtn, '¡Dirección copiada!');
    });
  }

  // 6. Accordion for Workshop FAQs
  const accordionButtons = document.querySelectorAll('.faq-accordion-btn');

  accordionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.nextElementSibling;
      const panel = next instanceof HTMLElement ? next : null;
      const iconEl = btn.querySelector('.faq-icon');
      const icon = iconEl instanceof HTMLElement ? iconEl : null;

      if (!panel) {
        return;
      }

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');

      if (isExpanded) {
        panel.style.maxHeight = '0px';
        panel.classList.add('opacity-0');

        if (icon) {
          icon.style.transform = 'rotate(0deg)';
        }
      } else {
        panel.style.maxHeight = `${panel.scrollHeight + 30}px`;
        panel.classList.remove('opacity-0');

        if (icon) {
          icon.style.transform = 'rotate(180deg)';
        }
      }
    });
  });
});
