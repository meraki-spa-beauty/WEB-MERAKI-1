import './index.css';
import './workshop-mobile.css';
import {
  trackMetaLead,
  trackMetaCompleteRegistration,
  trackMetaContact,
} from './utils/metaPixel';
import {
  trackTikTokSubmitForm,
  trackTikTokCompleteRegistration,
  trackTikTokContact,
} from './utils/tiktokPixel';

// WhatsApp configuration
const WHATSAPP_NUMBER = '51993067291';

const YAPE_NUMBER = '993067291';

const PRICE_PER_SPOT = 180;

const DEPOSIT_PER_SPOT = 50;

const GOOGLE_SHEETS_WEBHOOK_URL = import.meta.env.VITE_WORKSHOP_SHEETS_URL || '';

interface BookingData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  spots: number;
}

function getInputElement(id: string): HTMLInputElement | null {
  const el = document.getElementById(id);

  return el instanceof HTMLInputElement ? el : null;
}

function getAnchorElement(id: string): HTMLAnchorElement | null {
  const el = document.getElementById(id);

  return el instanceof HTMLAnchorElement ? el : null;
}

function generateBookingId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  return `MRK-WS-${randomNum}`;
}

function copyToClipboard(text: string, buttonEl: HTMLElement) {
  const textSpan = buttonEl.querySelector('#copy-btn-text');

  const originalText = textSpan?.textContent || 'Copiar Yape';

  const onSuccess = () => {
    if (textSpan) {
      textSpan.textContent = '¡Copiado!';
    }

    buttonEl.classList.add('bg-emerald-100', 'text-emerald-800');

    setTimeout(() => {
      if (textSpan) {
        textSpan.textContent = originalText;
      }

      buttonEl.classList.remove('bg-emerald-100', 'text-emerald-800');
    }, 2200);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
      fallbackCopy(text, onSuccess);
    });
  } else {
    fallbackCopy(text, onSuccess);
  }
}

function fallbackCopy(text: string, callback: () => void) {
  const textarea = document.createElement('textarea');

  textarea.value = text;

  textarea.style.position = 'fixed';

  textarea.style.opacity = '0';

  document.body.appendChild(textarea);

  textarea.select();

  try {
    document.execCommand('copy');

    callback();
  } catch (e) {
    console.error('Error al copiar:', e);
  }

  document.body.removeChild(textarea);
}

// Envío en simultáneo a Google Sheets y almacenamiento local de respaldo
async function syncLeadToGoogleSheets(data: BookingData) {
  const leadRecord = {
    fecha: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }),
    codigo: data.id,
    nombre: data.name,
    whatsapp: data.phone,
    email: data.email || 'No proporcionado',
    adelanto: `S/ ${DEPOSIT_PER_SPOT}`,
    total: `S/ ${PRICE_PER_SPOT}`,
    estado: 'Pre-reserva (Pendiente WhatsApp)',
  };

  // 1. Respaldo inmediato en localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('meraki_workshop_leads') || '[]');

    existing.push(leadRecord);

    localStorage.setItem('meraki_workshop_leads', JSON.stringify(existing));
  } catch (err) {
    console.warn('No se pudo guardar localmente:', err);
  }

  // 2. Envío a Google Sheets (si la URL está configurada)
  if (GOOGLE_SHEETS_WEBHOOK_URL) {
    try {
      await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadRecord),
      });

      console.log('Lead sincronizado con Google Sheets con éxito');
    } catch (err) {
      console.error('Error al sincronizar con Google Sheets:', err);
    }
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
📍 *Lugar:* Jirón Santo Domingo 115, Jesús María, Lima

📋 *DATOS DE LA RESERVA:*
• *Código:* ${data.id}
• *Nombre:* ${data.name}
• *WhatsApp:* ${data.phone}
${data.email ? `• *Email:* ${data.email}\n` : ''}
💰 *DESGLOSE DE INVERSIÓN:*
• Total: S/ ${total}
• *Adelanto a pagar hoy:* *S/ ${deposit}* (Yape 993 067 291)
• Saldo restante el día del taller: S/ ${remaining}

📲 *Adjunto mi voucher de los S/ ${deposit} a continuación para asegurar mi cupo y kit.* ¡Muchas gracias! 🤍`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

let workshopLeadTracked = false;

function trackWorkshopConversion(): void {
  if (workshopLeadTracked) {
    return;
  }

  workshopLeadTracked = true;

  trackMetaLead({
    content_name: 'Workshop Press On Nails Halloween',
    content_category: 'Workshop Presencial',
    value: PRICE_PER_SPOT,
    currency: 'PEN',
  });

  trackMetaCompleteRegistration({
    content_name: 'Workshop Press On Nails Halloween',
    value: PRICE_PER_SPOT,
    currency: 'PEN',
  });

  trackTikTokSubmitForm({
    content_name: 'Workshop Press On Nails Halloween',
    content_category: 'Workshop Presencial',
    value: PRICE_PER_SPOT,
    currency: 'PEN',
  });

  trackTikTokCompleteRegistration({
    content_name: 'Workshop Press On Nails Halloween',
    value: PRICE_PER_SPOT,
    currency: 'PEN',
  });
}

function showModal(data: BookingData, waUrl: string) {
  const modal = document.getElementById('confirmation-modal');

  if (!modal) {
    return;
  }

  const idEl = document.getElementById('modal-booking-id');

  const nameEl = document.getElementById('modal-client-name');

  const waBtn = getAnchorElement('modal-whatsapp-btn');

  if (idEl) {
    idEl.textContent = data.id;
  }

  if (nameEl) {
    nameEl.textContent = data.name;
  }

  if (waBtn) {
    waBtn.href = waUrl;
    waBtn.onclick = () => {
      trackWorkshopConversion();
    };
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

// Initialise event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // 1. Smooth scrolling to form
  const ctaButtons = document.querySelectorAll('.scroll-to-form');

  ctaButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const formSection = document.getElementById('reserva-section');

      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });

        const nameInput = getInputElement('booking-name');

        if (nameInput) {
          setTimeout(() => nameInput.focus(), 500);
        }
      }
    });
  });

  // 2. Form submission
  const bookingFormEl = document.getElementById('workshop-booking-form');

  const bookingForm = bookingFormEl instanceof HTMLFormElement ? bookingFormEl : null;

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = getInputElement('booking-name');

      const phoneInput = getInputElement('booking-phone');

      const emailInput = getInputElement('booking-email');

      const name = nameInput?.value.trim() || '';

      const phone = phoneInput?.value.trim() || '';

      const email = emailInput?.value.trim() || '';

      // Validations
      if (!name || name.length < 3) {
        alert('Por favor, ingresa tu nombre completo.');

        nameInput?.focus();

        return;
      }

      if (!phone || phone.replace(/\D/g, '').length < 8) {
        alert('Por favor, ingresa un número de teléfono / WhatsApp válido.');

        phoneInput?.focus();

        return;
      }

      const bookingId = generateBookingId();

      const bookingData: BookingData = {
        id: bookingId,
        name,
        phone,
        email,
        spots: 1,
      };

      // Sincronizar en simultáneo con Google Sheets & almacenamiento local
      syncLeadToGoogleSheets(bookingData);

      const waUrl = buildWhatsAppUrl(bookingData);

      // Registrar conversión en Meta Pixel (Lead + CompleteRegistration)
      trackWorkshopConversion();

      showModal(bookingData, waUrl);
    });
  }

  // 3. Copiar número de Yape
  const copyYapeBtn = document.getElementById('copy-yape-btn');

  if (copyYapeBtn) {
    copyYapeBtn.addEventListener('click', () => {
      copyToClipboard(YAPE_NUMBER, copyYapeBtn);
    });
  }

  // 4. Modal close handlers
  const closeBtn = document.getElementById('close-modal-btn');

  const modalBackdrop = document.getElementById('modal-backdrop');

  const backHomeBtn = document.getElementById('modal-back-home-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', () => {
      closeModal();

      window.location.href = '/';
    });
  }

  // 5. Accordion for Workshop FAQs
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
          icon.textContent = '+';

          icon.style.transform = 'rotate(0deg)';
        }
      } else {
        panel.style.maxHeight = `${panel.scrollHeight + 30}px`;

        panel.classList.remove('opacity-0');

        if (icon) {
          icon.textContent = '−';

          icon.style.transform = 'rotate(180deg)';
        }
      }
    });
  });

  // 6. Fallback poster for technique interlude if thumbnail is unavailable
  const techniquePoster = document.querySelector<HTMLImageElement>('.mobile-workshop-interlude img');

  techniquePoster?.addEventListener('error', () => {
    techniquePoster.src = '/assets/workshop/para-quien-manos.png';
  }, { once: true });

  const mobileStickyCta = document.getElementById('mobile-sticky-cta');
  const mobileHero = document.querySelector('.mobile-workshop-hero');
  const reservationSection = document.getElementById('reserva-section');

  if (mobileStickyCta instanceof HTMLElement && mobileHero instanceof HTMLElement && reservationSection instanceof HTMLElement) {
    let ticking = false;

    const updateStickyCta = () => {
      const heroEnd = mobileHero.getBoundingClientRect().bottom;
      const formTop = reservationSection.getBoundingClientRect().top;
      const formBottom = reservationSection.getBoundingClientRect().bottom;
      const formVisible = formTop < window.innerHeight * 0.65 && formBottom > 0;
      const modalOpen = document.getElementById('confirmation-modal')?.classList.contains('flex') ?? false;
      const shouldShow = window.matchMedia('(max-width: 767px)').matches && heroEnd < 65 && !formVisible && window.innerHeight >= 420 && !modalOpen;

      mobileStickyCta.classList.toggle('is-visible', shouldShow);
      ticking = false;
    };

    const scheduleStickyCta = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateStickyCta);
    };

    window.addEventListener('scroll', scheduleStickyCta, { passive: true });
    window.addEventListener('resize', scheduleStickyCta);
    scheduleStickyCta();
  }

  // 7. Responsive Alternating Left/Right Scroll Reveal
  const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]');

  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');

            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  }

  // 8. HTML5 Video Autoplay & Loop Manager (Desktop Reel & Mobile Hold Video)
  const workshopVideos = document.querySelectorAll<HTMLVideoElement>('video');

  workshopVideos.forEach((video) => {
    video.muted = true;

    video.defaultMuted = true;

    video.setAttribute('playsinline', '');

    video.setAttribute('webkit-playsinline', '');

    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may wait for user interaction on some mobile devices
      });
    }
  });

  // Touch gesture kickstart fallback for strict mobile browser autoplay policies
  window.addEventListener(
    'touchstart',
    () => {
      workshopVideos.forEach((video) => {
        if (video.paused) {
          video.play().catch(() => {});
        }
      });
    },
    { once: true, passive: true }
  );

  // Ensure video is actively playing when scrolled into view
  if ('IntersectionObserver' in window && workshopVideos.length > 0) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLVideoElement) {
            entry.target.play().catch(() => {});
          }
        });
      },
      { threshold: 0.15 }
    );

    workshopVideos.forEach((video) => {
      videoObserver.observe(video);
    });
  }

  // 9. Mobile Scroll Indicator: Fixed to bottom until it docks into its natural date rail baseline
  const cueAnchor = document.getElementById('mobile-scroll-cue-anchor');

  const scrollCue = document.getElementById('mobile-scroll-cue');

  if (cueAnchor && scrollCue) {
    let cueTicking = false;

    const updateCuePosition = () => {
      cueTicking = false;

      // In desktop view (>= 768px), the editorial hero is hidden
      if (window.innerWidth >= 768) {
        scrollCue.classList.remove('is-floating');

        scrollCue.style.left = '';

        scrollCue.style.width = '';

        return;
      }

      const anchorRect = cueAnchor.getBoundingClientRect();

      const bottomThreshold = window.innerHeight - 16;

      // If the anchor baseline is still below the bottom edge of the screen, keep it fixed to the bottom
      if (anchorRect.bottom > bottomThreshold) {
        scrollCue.classList.add('is-floating');

        scrollCue.style.left = `${anchorRect.left}px`;

        scrollCue.style.width = `${anchorRect.width}px`;
      } else {
        // Once the user scrolls enough that the anchor line reaches the bottom, dock in the date rail
        scrollCue.classList.remove('is-floating');

        scrollCue.style.left = '';

        scrollCue.style.width = '';
      }
    };

    const scheduleCueUpdate = () => {
      if (!cueTicking) {
        cueTicking = true;

        window.requestAnimationFrame(updateCuePosition);
      }
    };

    window.addEventListener('scroll', scheduleCueUpdate, { passive: true });

    window.addEventListener('resize', scheduleCueUpdate);

    scheduleCueUpdate();
  }

  // 7. General WhatsApp links tracking
  const generalWaLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="wa.link"]');

  generalWaLinks.forEach((link) => {
    if (link.id !== 'modal-whatsapp-btn') {
      link.addEventListener('click', () => {
        trackMetaContact({
          content_name: 'WhatsApp General Workshop',
        });
        trackTikTokContact({
          content_name: 'WhatsApp General Workshop',
        });
      });
    }
  });
});


