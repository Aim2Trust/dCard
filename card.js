/**
 * ═══════════════════════════════════════════════
 *  A2T — DIGITAL BUSINESS CARD  ·  card.js
 *  Lucero Avendaño Gil · Gerente General
 * ═══════════════════════════════════════════════
 *
 *  CONFIG — edit these values to match real data
 */
const CONTACT = {
  firstName:    'Lucero',
  lastName:     'Avendaño Gil',
  displayName:  'Lucero Avendaño Gil',
  org:          'A2T Aim to Trust',
  title:        'Gerente General',
  phone:        '+5215546092257',       // ← replace with real number
  whatsapp:     '+5215543886787',       // ← replace with real WA number
  email:        'a2t.aim2trust@gmail.com', // ← replace with real email
  website:      'https://aimtotrust.mx',
  address:      'Arbolada del Pedregal 1 Edificio F Depto. 402, Atizapán de Zaragoza, 52947, México',
  facebook:     'https://facebook.com/aim2trust',
  instagram:    'https://instagram.com/aim2trust',
  cardUrl:      window.location.href,
};

/* ══════════════════════════════════════
   UTILITY — Toast notification
══════════════════════════════════════ */
let toastTimer = null;

function showToast(message, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ══════════════════════════════════════
   FAB — Floating Action Button
══════════════════════════════════════ */
function initFAB() {
  const container = document.getElementById('fab-container');
  const toggle    = document.getElementById('fab-toggle');
  const actions   = document.getElementById('fab-actions');

  if (!container || !toggle || !actions) return;

  function openFAB() {
    container.classList.add('is-open');
    toggle.classList.add('is-open');
    actions.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    actions.setAttribute('aria-hidden', 'false');
  }

  function closeFAB() {
    container.classList.remove('is-open');
    toggle.classList.remove('is-open');
    actions.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    actions.setAttribute('aria-hidden', 'true');
  }

  function toggleFAB() {
    if (container.classList.contains('is-open')) {
      closeFAB();
    } else {
      openFAB();
    }
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFAB();
  });

  // Close on scrim click (the ::before pseudo-element area)
  container.addEventListener('click', (e) => {
    if (e.target === container) closeFAB();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && container.classList.contains('is-open')) {
      closeFAB();
      toggle.focus();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) closeFAB();
  });

  return { open: openFAB, close: closeFAB };
}

/* ══════════════════════════════════════
   vCARD — Generate .vcf file
══════════════════════════════════════ */
function generateVCard() {
  // vCard 3.0 format — widely supported
  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${CONTACT.displayName}`,
    `N:${CONTACT.lastName};${CONTACT.firstName};;;`,
    `ORG:${CONTACT.org}`,
    `TITLE:${CONTACT.title}`,
    `TEL;TYPE=CELL,VOICE:${CONTACT.phone}`,
    `TEL;TYPE=WORK,VOICE:${CONTACT.phone}`,
    `EMAIL;TYPE=WORK:${CONTACT.email}`,
    `URL:${CONTACT.website}`,
    `ADR;TYPE=WORK:;;${CONTACT.address}`,
    `X-SOCIALPROFILE;type=facebook:${CONTACT.facebook}`,
    `X-SOCIALPROFILE;type=instagram:${CONTACT.instagram}`,
    `NOTE:Gerente General · Integración en Construcción\\, Comercialización y Seguridad`,
    `REV:${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`,
    'END:VCARD',
  ].join('\r\n');

  return vcf;
}

function downloadVCard() {
  try {
    const vcf  = generateVCard();
    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href     = url;
    link.download = `${CONTACT.firstName}_${CONTACT.lastName}_A2T.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast('✓ vCard descargada correctamente');
  } catch (err) {
    console.error('vCard error:', err);
    showToast('No se pudo generar la vCard');
  }
}

/* ══════════════════════════════════════
   SHARE — Web Share API with fallback
══════════════════════════════════════ */
async function shareCard() {
  const shareData = {
    title: `${CONTACT.displayName} — ${CONTACT.org}`,
    text:  `${CONTACT.title} · Integración en Construcción, Comercialización y Seguridad`,
    url:   CONTACT.cardUrl,
  };

  try {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      showToast('✓ Tarjeta compartida');
    } else {
      // Fallback: copy URL to clipboard
      await copyToClipboard(CONTACT.cardUrl);
      showToast('✓ Enlace copiado al portapapeles');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      // User cancelled share — silent
      try {
        await copyToClipboard(CONTACT.cardUrl);
        showToast('✓ Enlace copiado al portapapeles');
      } catch {
        showToast('Comparte: ' + CONTACT.cardUrl);
      }
    }
  }
}

async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    // Legacy fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

/* ══════════════════════════════════════
   WHATSAPP — Open chat
══════════════════════════════════════ */
function openWhatsApp() {
  const number  = CONTACT.whatsapp.replace(/\D/g, ''); // digits only
  const message = encodeURIComponent(
    `Hola ${CONTACT.firstName}, vi tu tarjeta digital y me gustaría contactarte.`
  );
  const url = `https://wa.me/${number}?text=${message}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ══════════════════════════════════════
   ADD CONTACT — vCard or contacts API
══════════════════════════════════════ */
async function addContact() {
  // Try Contact Picker API (Android Chrome)
  if ('contacts' in navigator && 'ContactsManager' in window) {
    try {
      // Note: ContactsManager write is limited; fall through to vCard
    } catch { /* fall through */ }
  }

  // Universal approach: download vCard
  downloadVCard();
}

/* ══════════════════════════════════════
   INLINE vCard BUTTON (in card body)
══════════════════════════════════════ */
function initInlineVCard() {
  const btn = document.getElementById('btn-vcard');
  if (!btn) return;
  btn.addEventListener('click', () => {
    downloadVCard();
  });
}

/* ══════════════════════════════════════
   WHATSAPP LINK (in card body)
══════════════════════════════════════ */
function initInlineWhatsApp() {
  const link = document.getElementById('link-wa');
  if (!link) return;
  const number  = CONTACT.whatsapp.replace(/\D/g, '');
  link.href = `https://wa.me/${number}`;
}

/* ══════════════════════════════════════
   ACTION HANDLERS
══════════════════════════════════════ */
function initActions(fab) {
  const btnContact  = document.getElementById('action-contact');
  const btnWA       = document.getElementById('action-whatsapp');
  const btnShare    = document.getElementById('action-share');
  const btnSave     = document.getElementById('action-save');

  function handle(btn, fn) {
    if (!btn) return;
    btn.addEventListener('click', async () => {
      fab.close();
      // Small delay to let FAB close animation start
      await delay(120);
      fn();
    });
  }

  handle(btnContact, addContact);
  handle(btnWA,      openWhatsApp);
  handle(btnShare,   shareCard);
  handle(btnSave,    downloadVCard);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ══════════════════════════════════════
   HAPTIC FEEDBACK (if available)
══════════════════════════════════════ */
function vibrate(pattern = [10]) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

/* ══════════════════════════════════════
   ENTRY ANIMATIONS — stagger contact buttons
══════════════════════════════════════ */
function initAnimations() {
  const buttons = document.querySelectorAll('.contact-btn');
  buttons.forEach((btn, i) => {
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(12px)';
    btn.style.transition = `opacity 0.4s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)`;
    btn.style.transitionDelay = `${0.7 + i * 0.08}s`;

    // Trigger
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        btn.style.opacity = '';
        btn.style.transform = '';
      });
    });
  });
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const fab = initFAB();
  initActions(fab);
  initInlineVCard();
  initInlineWhatsApp();
  initAnimations();

  // Haptic on FAB tap
  const fabToggle = document.getElementById('fab-toggle');
  if (fabToggle) {
    fabToggle.addEventListener('pointerdown', () => vibrate([8]));
  }

  // Log info (dev only — remove in production)
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('%cA2T Digital Card · Dev Mode', 'color:#C89A30;font-weight:700;font-size:14px');
    console.log('Contact data:', CONTACT);
  }
});
