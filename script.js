// Safe translation helper
function t(key) {
  try {
    const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('site_lang')) || (document && document.documentElement && document.documentElement.lang) || 'en';
    const dict = (typeof translations !== 'undefined' && translations && translations[lang]) ? translations[lang] : (typeof translations !== 'undefined' && translations ? translations.en : null);
    if (dict && dict[key]) return dict[key];
    if (typeof translations !== 'undefined' && translations && translations.en && translations.en[key]) return translations.en[key];
    return key;
  } catch (e) {
    return key;
  }
}

// Sticky header active state
const header = document.getElementById('header');
const backToTopButton = document.getElementById('backToTop');
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');

// Mobile navigation toggle
navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile menu on link click
navMenu.addEventListener('click', (e) => {
  if (e.target.matches('a')) {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Close mobile menu when clicking outside or pressing Escape
function closeNavIfOpen() {
  if (nav.classList.contains('open')) {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
}

document.addEventListener('click', (e) => {
  const clickedInsideNav = e.target.closest && (e.target.closest('.nav') || e.target.closest('#nav-menu'));
  const clickedToggle = e.target === navToggle || (e.target.closest && e.target.closest('.nav-toggle'));
  if (!clickedInsideNav && !clickedToggle) {
    closeNavIfOpen();
  }
}, true);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNavIfOpen();
});

// Sticky + back-to-top visibility
function onScroll() {
  const offset = window.scrollY;
  if (offset > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  if (offset > 400) {
    backToTopButton.classList.add('show');
  } else {
    backToTopButton.classList.remove('show');
  }
}
window.addEventListener('scroll', onScroll);

// Back to top
backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Reveal on scroll animations
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      io.unobserve(entry.target);
    }
  }
}, { threshold: 0.5, rootMargin: '0px' });
revealEls.forEach((el) => io.observe(el));

// Auto-tag reveal classes for key sections that may lack them and observe
function ensureRevealTargets() {
  const selectors = [
    '#services .cards.services > *',
    '#sectors .cards.sectors > *',
    '#clients .cards.clients > *',
    '#why .benefits > *',
    '#why .highlight-card',
    '#insights .cards.services > *',
    '#faq .cards.services > *',
    '#contact .contact-form > *',
    '#contact .contact-info > *',
    '#contact .map-card',
    '#about .split-content > *',
    '.section-split .sector-media'
  ];
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      const hasReveal = el.classList.contains('reveal-up') || el.classList.contains('reveal-left') || el.classList.contains('reveal-right') || el.classList.contains('revealed');
      if (!hasReveal) el.classList.add('reveal-up');
      io.observe(el);
    });
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ensureRevealTargets);
} else {
  ensureRevealTargets();
}

// Apply small stagger inside common grids/cards
function applyRevealStagger() {
  const groups = [
    '.cards.services', '.cards.sectors', '.cards.clients', '.benefits', '.contact-list',
    '#insights .cards.services', '#faq .cards.services', '#contact .contact-form', '#contact .contact-info', '#why .highlight-card', '#about .split-content'
  ];
  groups.forEach((selector) => {
    document.querySelectorAll(`${selector} > *`).forEach((item, idx) => {
      item.style.setProperty('--reveal-delay', `${Math.min(idx * 50, 250)}ms`);
    });
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyRevealStagger);
} else {
  applyRevealStagger();
}

// Fallback: only if IO unsupported, force-show after load
if (!('IntersectionObserver' in window)) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      ensureRevealTargets();
      applyRevealStagger();
      document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach((el) => {
        el.classList.add('revealed');
      });
    }, 1200);
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Simple form validation and status
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

function setFieldError(field, message) {
  const container = field.closest('.form-field');
  const errorEl = container ? container.querySelector('.error') : null;
  if (errorEl) errorEl.textContent = message || '';
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function validateEmail(value) {
  return /.+@.+\..+/.test(value);
}

// Translate-aware single-field validator (used on input/blur and language change)
function validateFieldOnly(field) {
  const id = field.id;
  const val = (field.value || '').trim();
  let ok = true;
  if (!val) {
    if (id === 'name') setFieldError(field, t('errors.nameRequired')), ok = false;
    else if (id === 'company') setFieldError(field, t('errors.companyRequired')), ok = false;
    else if (id === 'email') setFieldError(field, t('errors.emailInvalid')), ok = false;
    else if (id === 'phone') setFieldError(field, t('errors.phoneInvalid')), ok = false;
    else if (id === 'message') setFieldError(field, t('errors.messageShort')), ok = false;
    return ok;
  }
  if (id === 'email' && !validateEmail(val)) { setFieldError(field, t('errors.emailInvalid')); return false; }
  if (id === 'phone' && !/^\+?[0-9 ()-]{7,}$/.test(val)) { setFieldError(field, t('errors.phoneInvalid')); return false; }
  if (id === 'message' && val.length < 10) { setFieldError(field, t('errors.messageShort')); return false; }
  setFieldError(field, '');
  return true;
}

function validateForm() {
  let valid = true;
  const name = form.name;
  const company = form.company;
  const email = form.email;
  const phone = form.phone;
  const message = form.message;

  if (!name.value.trim()) { setFieldError(name, t('errors.nameRequired')); valid = false; } else setFieldError(name);
  if (!company.value.trim()) { setFieldError(company, t('errors.companyRequired')); valid = false; } else setFieldError(company);
  if (!/.+@.+\..+/.test(email.value.trim())) { setFieldError(email, t('errors.emailInvalid')); valid = false; } else setFieldError(email);
  if (!/^\+?[0-9 ()-]{7,}$/.test(phone.value.trim())) { setFieldError(phone, t('errors.phoneInvalid')); valid = false; } else setFieldError(phone);
  if (message.value.trim().length < 10) { setFieldError(message, t('errors.messageShort')); valid = false; } else setFieldError(message);

  return valid;
}

// EmailJS frontend-only configuration
const EMAILJS_PUBLIC_KEY = 'gZxFj3wzENOf6HuX2';
const EMAILJS_SERVICE_ID = 'service_0ve00lk';
const EMAILJS_TEMPLATE_ID = 'template_2fb507q'; // internal notification
const EMAILJS_TEMPLATE_ID_CONFIRM = 'template_jlc8bgc'; // confirmation to sender

// TEMP: Test mode to send static data. Set to false after verifying email success.
const EMAILJS_TEST_MODE = false; // using real form data only
const EMAILJS_TEST_DATA = {
  from_name: 'Test User',
  company: 'Zero Trace',
  email: 'test@example.com',
  phone: '+216 27 91 27 12',
  message: 'Hello from automated test. If you received this, EmailJS config works. — Zero Trace',
};

if (window.emailjs && typeof emailjs.init === 'function') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

async function sendEmailWithEmailJS(payload) {
  if (!window.emailjs || !EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
    throw new Error('MISCONFIG');
  }
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload, EMAILJS_PUBLIC_KEY);
}

async function tryEmailJsSendOnce(testParams) {
  const resp = await sendEmailWithEmailJS(testParams);
  console.log('EmailJS SUCCESS', resp);
  return resp;
}

function autoTestSend() {
  if (!EMAILJS_TEST_MODE) return;
  let attempts = 0;
  const maxAttempts = 5;
  const delayMs = 3000;

  const testParams = {
    to_email: 'nejahyenguistudy92@gmail.com',
    from_name: EMAILJS_TEST_DATA.from_name,
    company: EMAILJS_TEST_DATA.company,
    email: EMAILJS_TEST_DATA.email,
    phone: EMAILJS_TEST_DATA.phone,
    message: EMAILJS_TEST_DATA.message,
    submitted_at: new Date().toLocaleString(),
    subject: `Zero Trace Inquiry — ${EMAILJS_TEST_DATA.company} / ${EMAILJS_TEST_DATA.from_name}`,
  };

  const run = async () => {
    attempts += 1;
    try {
      if (typeof emailjs === 'undefined' || !emailjs.send) throw new Error('MISCONFIG');
      if (statusEl) { statusEl.textContent = t('status.sending'); statusEl.style.color = '#9fb2c7'; }
      await tryEmailJsSendOnce(testParams);
      if (statusEl) { statusEl.textContent = t('status.sent'); statusEl.style.color = '#2ec27e'; }
      console.log('Auto test: success on attempt', attempts);
    } catch (err) {
      console.warn('Auto test attempt', attempts, 'failed:', err && err.status, err && err.text, err && err.message ? err.message : err);
      if (attempts < maxAttempts) {
        setTimeout(run, delayMs);
      } else {
        if (statusEl) { statusEl.textContent = t('status.failed'); statusEl.style.color = '#ef476f'; }
        console.error('Auto test: reached max attempts without success');
      }
    }
  };

  // Start the first attempt after a short delay to ensure SDK is ready
  setTimeout(run, 500);
}

// Kick off auto test on load when enabled
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoTestSend);
} else {
  autoTestSend();
}

if (form) {
  // Init timestamp for spam protection
  const tsEl = document.getElementById('ts');
  if (tsEl) tsEl.value = String(Date.now());

  // Live translated validation on input/blur
  ['input','blur','change'].forEach((evt) => {
    form.addEventListener(evt, (e) => {
      const target = e.target;
      if (!(target && target.closest && target.closest('.contact-form'))) return;
      if (['name','company','email','phone','message'].includes(target.id)) {
        validateFieldOnly(target);
      }
    }, true);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';

    // Cooldown: block duplicate submissions within 60 minutes
    const lastTs = Number(localStorage.getItem('last_submit_ts') || '0');
    const COOLDOWN_MS = 60 * 60 * 1000;
    if (Date.now() - lastTs < COOLDOWN_MS) {
      const msg = 'We received your previous message. If you need to send another within the hour, please email us directly at contact@zerotrace.tn';
      statusEl.textContent = (typeof t === 'function') ? msg : msg;
      statusEl.style.color = '#ef476f';
      return;
    }

    // Honeypots & time-to-submit
    const hp = document.getElementById('hp');
    const hp2 = document.getElementById('hp2');
    const tsVal = (document.getElementById('ts') && document.getElementById('ts').value) || '';
    const elapsed = tsVal ? (Date.now() - Number(tsVal)) : 0;
    if ((hp && hp.value && hp.value.trim().length > 0) || (hp2 && hp2.value && hp2.value.trim().length > 0) || elapsed < 1500) {
      statusEl.textContent = t('status.failed');
      statusEl.style.color = '#ef476f';
      return;
    }

    // Basic length caps to avoid abuse
    if (form.message && form.message.value && form.message.value.length > 2000) {
      statusEl.textContent = t('errors.messageShort');
      statusEl.style.color = '#ef476f';
      return;
    }

    if (!validateForm()) {
      statusEl.textContent = t('errors.fix');
      statusEl.style.color = '#ef476f';
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.classList.add('loading');

    // Build template params (always use real form values)
    const nowStr = new Date().toLocaleString();
    const templateParams = {
      to_email: 'nejahyenguistudy92@gmail.com',
      from_name: form.name.value.trim(),
      company: form.company.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      message: form.message.value.trim(),
      submitted_at: nowStr,
      subject: `Zero Trace Inquiry — ${form.company.value.trim()} / ${form.name.value.trim()}`,
    };

    try {
      statusEl.textContent = t('status.sending');
      statusEl.style.color = '#9fb2c7';
      const resp = await sendEmailWithEmailJS(templateParams);
      console.log('EmailJS SUCCESS', resp);

      // Save cooldown
      localStorage.setItem('last_submit_ts', String(Date.now()));

      // Fire-and-forget confirmation email
      try {
        const confirmParams = {
          to_email: templateParams.email,
          user_name: templateParams.from_name,
          company: templateParams.company,
          subject: 'We received your request — Zero Trace',
          message_preview: templateParams.message,
          submitted_at: templateParams.submitted_at,
          support_email: 'contact@zerotrace.tn'
        };
        if (EMAILJS_TEMPLATE_ID_CONFIRM) {
          emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_CONFIRM, confirmParams, EMAILJS_PUBLIC_KEY)
            .then(r => console.log('Confirm email SUCCESS', r))
            .catch(e => console.warn('Confirm email FAILED', e));
        }
      } catch (e) {
        console.warn('Confirmation email skipped/failed', e);
      }

      statusEl.textContent = t('status.sent');
      statusEl.style.color = '#2ec27e';
      form.reset();
      if (tsEl) tsEl.value = String(Date.now());
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 4000);
    } catch (err) {
      console.error('EmailJS error', err && err.status, err && err.text, err);
      statusEl.textContent = String(err).includes('MISCONFIG') ? t('status.misconfig') : t('status.failed');
      statusEl.style.color = '#ef476f';
    } finally {
      if (submitBtn) submitBtn.classList.remove('loading');
    }
  });
}

// Add rel noopener to external links
(function secureExternalLinks(){
  try {
    const anchors = document.querySelectorAll('a[href^="http"]');
    anchors.forEach(a => {
      const isExternal = a.hostname && a.hostname !== location.hostname;
      if (isExternal) {
        const rel = (a.getAttribute('rel') || '').split(' ').filter(Boolean);
        if (!rel.includes('noopener')) rel.push('noopener');
        if (!rel.includes('noreferrer')) rel.push('noreferrer');
        a.setAttribute('rel', rel.join(' '));
      }
    });
  } catch (_) {}
})();

// Interactive Map: provider switch
const mapCard = document.querySelector('.map-card');
if (mapCard) {
  const googleFrame = mapCard.querySelector('.map-frame[data-provider="google"]');
  const osmFrame = mapCard.querySelector('.map-frame[data-provider="osm"]');
  const switchButtons = mapCard.querySelectorAll('[data-map-provider]');
  const openBtn = mapCard.querySelector('#openInMaps');

  function setProvider(provider) {
    if (provider === 'google') {
      if (googleFrame) googleFrame.classList.remove('hidden');
      if (osmFrame) osmFrame.classList.add('hidden');
      if (openBtn) openBtn.href = 'https://maps.google.com/?q=Zero%20Trace%20Office';
    } else {
      if (googleFrame) googleFrame.classList.add('hidden');
      if (osmFrame) osmFrame.classList.remove('hidden');
      if (openBtn) openBtn.href = 'https://www.openstreetmap.org/';
    }
    if (switchButtons && switchButtons.length) {
      switchButtons.forEach(btn => {
        if (btn.dataset.mapProvider === provider) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  if (switchButtons && switchButtons.length) {
    switchButtons.forEach(btn => {
      btn.addEventListener('click', () => setProvider(btn.dataset.mapProvider));
    });
  }

  // Initialize to whichever provider exists
  if (googleFrame) setProvider('google');
  else if (osmFrame) setProvider('osm');
}

// i18n translations
const translations = {
  en: {
    'meta.title': 'Zero Trace — Industrial Waste Collection & Recovery',
    'meta.description': 'Zero Trace, part of Misra Group, collects, transports and pre‑treats waste from poultry farms, olive‑oil presses and municipal waste sites.',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.sectors': 'Sectors',
    'nav.cta': 'Contact Us',
    'hero.title': 'Zero Trace — <span class="accent">Leave No Trace</span> After Our Work Is Done.',
    'hero.subtitle': 'Part of Misra Group, we collect and recover industrial waste safely: poultry farms, olive‑oil presses, municipal waste sites and hotels.',
    'hero.ctaPrimary': '✉️ Contact Us',
    'hero.ctaSecondary': 'Explore Services',
    'hero.badgeEco': 'Eco-conscious',
    'hero.badgeCompliance': 'Compliance-first',
    'hero.badgeFast': 'Fast Response',
    'about.title': 'About Zero <span class="accent">Trace</span>',
    'about.desc': 'Zero Trace began inside Misra Group to solve our own sector waste challenges. Today we provide the same compliant collection, transport and pre‑treatment services to external clients across poultry farms, olive‑oil presses, municipal waste sites and hotels.',
    'about.point1': 'Eco-friendly, science-backed methods',
    'about.point2': 'Compliance-focused protocols and reporting',
    'about.point3': 'Industrial-grade equipment and PPE',
    'about.point4': 'Rapid deployment and scheduled maintenance',
    'services.title': 'Core <span class="accent">Services</span>',
    'services.intro': 'Integrated waste collection and recovery for industry.',
    'services.s1.title': 'On‑site Waste Collection',
    'services.s1.desc': 'Scheduled or on‑demand pickup with compliant containers and manifests.',
    'services.s2.title': 'Transport & Logistics',
    'services.s2.desc': 'Licensed transport from site to pre‑treatment with tracking.',
    'services.s3.title': 'Pre‑treatment & Sorting',
    'services.s3.desc': 'Safe sorting, dewatering and stabilization to prepare for recovery.',
    'services.s4.title': 'Recovery & Valorization',
    'services.s4.desc': 'Partner processing to convert waste into energy or by‑products.',
    'services.s5.title': 'Emergency Spill Response',
    'services.s5.desc': 'Rapid containment and compliant removal of accidental releases.',
    'sectors.title': 'Industries We <span class="accent">Serve</span>',
    'sectors.s1.title': 'Poultry Farms',
    'sectors.s1.desc': 'Waste pickup, transport and compliant handling for poultry producers.',
    'sectors.s2.title': 'Olive-oil Presses',
    'sectors.s2.desc': 'Collection of pomace and oily residues with safe pre‑treatment.',
    'sectors.s3.title': 'Hotels',
    'sectors.s3.desc': 'Collection and logistics for hotel operational waste streams.',
    'sectors.s4.title': 'Municipal Waste Sites',
    'sectors.s4.desc': 'Municipal and private sites: collection, logistics and valorization.',
    'clients.title': 'Our <span class="accent">Clients</span>',
    'clients.intro': 'Trusted by operations leaders across agriculture, hospitality, and public works.',
    'why.title': 'Why Choose <span class="accent">Us</span>',
    'why.b1': '<strong>No-trace operations</strong> — clean handover with documented compliance.',
    'why.b2': '<strong>Compliance</strong> — aligned with local and industry regulations.',
    'why.b3': '<strong>Safety</strong> — strict PPE and hazard controls.',
    'why.b4': '<strong>Fast response</strong> — rapid mobilization when you need it.',
    'why.b5': '<strong>Eco-conscious</strong> — reduced water, responsible chemistry.',
    'why.eyebrow': 'Guarantee',
    'why.cardTitle': 'We leave no trace.',
    'why.cardDesc': 'Our name is our promise. From microbial loads to visible residue, we remove it—documented.',
    'why.cta': '✉️ Contact Us',
    'testimonials.eyebrow': 'Testimonials',
    'testimonials.title': 'What Our Clients Say',
    'testimonials.desc': 'Coming soon. Real stories from operations leaders and facility managers.',
    'contact.title': 'Contact <span class="accent">Us</span>',
    'contact.desc': 'Tell us about your facility and requirements. We\'ll respond within one business day.',
    'contact.addr': 'Sfax, Sakiet Ezzit, Tunisia',
    'form.name': 'Name', 'form.namePh': 'Jane Doe',
    'form.company': 'Company', 'form.companyPh': 'Your Company',
    'form.email': 'Email', 'form.emailPh': 'you@company.com',
    'form.phone': 'Phone', 'form.phonePh': '+216 27 91 27 12',
    'form.message': 'Message', 'form.messagePh': 'Tell us about your facility, timelines, and scope.',
    'form.cta': '✉️ Send Email',
    'map.title': 'Our Office',
    'map.desc': 'Interactive map. Drag, zoom, or switch provider.',
    'map.open': 'Open',
    'footer.copy': '© <span id="year"></span> Zero Trace. All rights reserved.',
    'errors.nameRequired': 'Please enter your name.',
    'errors.companyRequired': 'Please enter your company name.',
    'errors.emailInvalid': 'Please enter a valid email address.',
    'errors.phoneInvalid': 'Please enter a valid phone number.',
    'errors.messageShort': 'Please provide at least 10 characters.',
    'errors.fix': 'Please fix the errors above.',
    'status.sending': 'Sending...',
    'status.sent': 'Sent! We will contact you within one business day.',
    'status.failed': 'Failed to send. Please try again or email us directly.',
    'status.misconfig': 'Email service is not configured.',
    // Insights + FAQ
    'insights.eyebrow': 'Insights',
    'insights.title': 'Guides & Best Practices',
    'insights.intro': 'Practical, verifiable methods we use across industrial environments.',
    'insights.a1.title': 'ATP Testing for Sanitization: Thresholds and Reporting',
    'insights.a1.desc': 'Why ATP matters, how we sample, and the pass/fail ranges we target in high‑risk zones.',
    'insights.a1.cta': 'Talk to an expert',
    'insights.a2.title': 'Odor Control in Municipal Waste Sites: A Practical Playbook',
    'insights.a2.desc': 'Source identification, neutralization chemistry, and measurable suppression metrics.',
    'insights.a2.cta': 'Request the full SOP',
    'faq.eyebrow': 'FAQ',
    'faq.title': 'Common Questions',
    'faq.q1': 'Which industries do you serve?',
    'faq.a1': 'We collect and pre‑treat waste from poultry farms, olive‑oil presses and municipal waste sites.',
    'faq.q2': 'Do you provide emergency spill response?',
    'faq.a2': 'Yes. We mobilize rapid containment and compliant removal for spill or incident events.',
    'faq.q3': 'How can we request a quote?',
    'faq.a3': 'Use the contact form or email contact@zerotrace.tn with your site details. We reply within one business day.'
  },
  fr: {
    'meta.title': 'Zero Trace — Collecte et valorisation des déchets',
    'meta.description': 'Zero Trace, membre du groupe Misra, collecte, transporte et prétraite les déchets des élevages avicoles, huileries et sites municipaux. Les hôtels font partie de nos clients.',
    'nav.home': 'Accueil', 'nav.about': 'À propos', 'nav.services': 'Services', 'nav.sectors': 'Secteurs', 'nav.cta': 'Contactez‑nous',
    'hero.title': 'Zero Trace — <span class="accent">Aucune trace</span> après notre intervention.',
    'hero.subtitle': 'Membre du groupe Misra, nous collectons et valorisons les déchets industriels : élevages avicoles, huileries, sites municipaux et hôtels.',
    'hero.ctaPrimary': '✉️ Contactez‑nous', 'hero.ctaSecondary': 'Découvrir les services', 'hero.badgeEco': 'Écoresponsable', 'hero.badgeCompliance': 'Conformité', 'hero.badgeFast': 'Intervention rapide',
    'about.title': 'À propos de <span class="accent">Zero Trace</span>',
    'about.desc': 'Zero Trace est née au sein du groupe Misra pour résoudre nos propres enjeux de déchets. Aujourd’hui, nous offrons les mêmes services conformes de collecte, transport et prétraitement à des clients externes : élevages avicoles, huileries, sites de déchets municipaux et hôtels.',
    'about.point1': 'Méthodes écoresponsables et scientifiques', 'about.point2': 'Protocoles et rapports conformes', 'about.point3': 'Équipements et EPI industriels', 'about.point4': 'Déploiement rapide et maintenance planifiée',
    'services.title': 'Nos <span class="accent">Services</span>', 'services.intro': 'Collecte et valorisation intégrées des déchets.',
    'services.s1.title': 'Collecte sur site', 'services.s1.desc': 'Passages planifiés ou à la demande, contenants conformes et traçabilité.',
    'services.s2.title': 'Transport & logistique', 'services.s2.desc': 'Transport agréé du site au prétraitement avec suivi.',
    'services.s3.title': 'Prétraitement & tri', 'services.s3.desc': 'Tri, déshydratation et stabilisation en sécurité.',
    'services.s4.title': 'Valorisation', 'services.s4.desc': 'Partenaires pour transformer les déchets en énergie ou sous‑produits.',
    'services.s5.title': 'Intervention d\'urgence', 'services.s5.desc': 'Confinement rapide et enlèvement conforme.',
    'sectors.title': 'Secteurs que nous <span class="accent">servons</span>',
    'sectors.s1.title': 'Élevages avicoles', 'sectors.s1.desc': 'Collecte, transport et manipulation conformes pour producteurs avicoles.',
    'sectors.s2.title': 'Huileries', 'sectors.s2.desc': 'Collecte des grignons et résidus huileux avec prétraitement sécurisé.',
    'sectors.s3.title': 'Hôtels', 'sectors.s3.desc': 'Les hôtels sont des clients cibles : collecte et acheminement des flux de déchets.',
    'sectors.s4.title': 'Sites de déchets municipaux', 'sectors.s4.desc': 'Collecte, logistique et valorisation pour sites publics et privés.',
    'clients.title': 'Nos <span class=\"accent\">Clients</span>', 'clients.intro': 'De nombreux acteurs de l\'agriculture, de l\'hôtellerie et des services publics nous font confiance.',
    'why.title': 'Pourquoi nous <span class="accent">choisir</span>', 'why.b1': '<strong>Sans trace</strong> — aspect impeccable et résultats mesurables.', 'why.b2': '<strong>Conformité</strong> — alignée aux régulations.', 'why.b3': '<strong>Sécurité</strong> — EPI et contrôles stricts.', 'why.b4': '<strong>Rapidité</strong> — mobilisation rapide.', 'why.b5': '<strong>Écoresponsable</strong> — eau réduite, chimie responsable.', 'why.eyebrow': 'Garantie', 'why.cardTitle': 'Nous ne laissons aucune trace.', 'why.cardDesc': 'Notre nom est notre promesse.', 'why.cta': '✉️ Contactez‑nous',
    'testimonials.eyebrow': 'Témoignages', 'testimonials.title': 'Ce que disent nos clients', 'testimonials.desc': 'Bientôt disponible.',
    'contact.title': 'Contactez-<span class="accent">nous</span>', 'contact.desc': 'Parlez-nous de votre site. Réponse sous un jour ouvrable.', 'contact.addr': 'Sfax, Sakiet Ezzit, Tunisie',
    'form.name': 'Nom', 'form.namePh': 'Jean Dupont', 'form.company': 'Société', 'form.companyPh': 'Votre société', 'form.email': 'E-mail', 'form.emailPh': 'vous@societe.com', 'form.phone': 'Téléphone', 'form.phonePh': '+216 27 91 27 12', 'form.message': 'Message', 'form.messagePh': 'Décrivez le site, les délais et le périmètre.', 'form.cta': '✉️ Envoyer l\'email',
    'map.title': 'Nos bureaux', 'map.desc': 'Carte interactive. Faites glisser, zoomez, changez.', 'map.open': 'Ouvrir',
    'footer.copy': '© <span id="year"></span> Zero Trace. Tous droits réservés.',
    'errors.nameRequired': 'Veuillez saisir votre nom.',
    'errors.companyRequired': 'Veuillez saisir le nom de votre société.',
    'errors.emailInvalid': 'Veuillez saisir une adresse e-mail valide.',
    'errors.phoneInvalid': 'Veuillez saisir un numéro de téléphone valide.',
    'errors.messageShort': 'Veuillez entrer au moins 10 caractères.',
    'errors.fix': 'Veuillez corriger les erreurs ci-dessus.',
    'status.sending': 'Envoi en cours...',
    'status.sent': 'Envoyé ! Nous vous contacterons sous un jour ouvrable.',
    'status.failed': "Échec de l'envoi. Réessayez ou contactez-nous directement.",
    'status.misconfig': "Service d'e-mail non configuré.",
    // Insights + FAQ
    'insights.eyebrow': 'Analyses',
    'insights.title': 'Guides et bonnes pratiques',
    'insights.intro': 'Méthodes pratiques et vérifiables utilisées dans les environnements industriels.',
    'insights.a1.title': 'Tests ATP pour l\'assainissement : seuils et reporting',
    'insights.a1.desc': 'Pourquoi l\'ATP compte, notre échantillonnage et les seuils de réussite/échec visés.',
    'insights.a1.cta': 'Parler à un expert',
    'insights.a2.title': 'Contrôle des odeurs sur sites de déchets municipaux : guide pratique',
    'insights.a2.desc': 'Identification des sources, chimie de neutralisation et mesures de suppression.',
    'insights.a2.cta': 'Demander la SOP complète',
    'faq.eyebrow': 'FAQ',
    'faq.title': 'Questions fréquentes',
    'faq.q1': 'Quels secteurs servez-vous ?',
    'faq.a1': 'Nous collectons et prétraitons les déchets des élevages, huileries et sites municipaux. Les hôtels sont aussi des clients servis.',
    'faq.q2': 'Intervenez-vous en cas de déversement (urgence) ?',
    'faq.a2': 'Oui, confinement rapide et enlèvement conforme en cas d’incident ou de déversement.',
    'faq.q3': 'Comment demander un devis ?',
    'faq.a3': 'Utilisez le formulaire de contact ou écrivez à contact@zerotrace.tn. Réponse sous un jour ouvrable.'
  },
  es: {
    'meta.title': 'Zero Trace — Recolección y valorización de residuos',
    'meta.description': 'Zero Trace, parte de Misra Group, recolecta, transporta y pre‑trata residuos de granjas avícolas, almazaras y residuos municipales.',
    'nav.home': 'Inicio', 'nav.about': 'Nosotros', 'nav.services': 'Servicios', 'nav.sectors': 'Sectores', 'nav.cta': 'Contáctanos',
    'hero.title': 'Zero Trace — <span class="accent">Sin rastro</span> después de nuestro trabajo.',
    'hero.subtitle': 'Parte de Misra Group: recolectamos y recuperamos residuos industriales (granjas avícolas, almazaras, residuos municipales y hoteles).',
    'hero.ctaPrimary': '✉️ Contáctanos', 'hero.ctaSecondary': 'Ver servicios', 'hero.badgeEco': 'Ecológico', 'hero.badgeCompliance': 'Conformidad', 'hero.badgeFast': 'Respuesta rápida',
    'about.title': 'Sobre <span class=\"accent\">Zero Trace</span>', 'about.desc': 'Zero Trace nació dentro de Misra Group para resolver nuestros propios retos de residuos. Hoy ofrecemos a clientes externos los mismos servicios conformes de recolección, transporte y pre‑tratamiento en granjas avícolas, almazaras, residuos municipales y hoteles.', 'about.point1': 'Métodos ecológicos', 'about.point2': 'Protocolos y reportes', 'about.point3': 'Equipo industrial y EPP', 'about.point4': 'Despliegue rápido',
    'services.title': 'Servicios <span class="accent">clave</span>', 'services.intro': 'Recolección y valorización integradas de residuos.',
    'services.s1.title': 'Recolección en sitio', 'services.s1.desc': 'Rutas programadas o bajo demanda, contenedores conformes y trazabilidad.',
    'services.s2.title': 'Transporte y logística', 'services.s2.desc': 'Transporte autorizado del sitio al pre‑tratamiento con seguimiento.',
    'services.s3.title': 'Pre‑tratamiento y clasificación', 'services.s3.desc': 'Clasificación, deshidratación y estabilización segura.',
    'services.s4.title': 'Valorización', 'services.s4.desc': 'Socios para convertir residuos en energía o subproductos.',
    'services.s5.title': 'Respuesta a derrames', 'services.s5.desc': 'Contención rápida y retiro conforme.',
    'sectors.title': 'Sectores que <span class="accent">atendemos</span>', 'sectors.s1.title': 'Granjas avícolas', 'sectors.s1.desc': 'Recolección, transporte y manejo conforme para productores avícolas.', 'sectors.s2.title': 'Almazaras', 'sectors.s2.desc': 'Recolección de alperujo y residuos aceitosos con pre‑tratamiento.', 'sectors.s3.title': 'Hoteles', 'sectors.s3.desc': 'Recolección y logística de flujos de residuos operativos de hoteles.', 'sectors.s4.title': 'Residuos municipales', 'sectors.s4.desc': 'Recolección, logística y valorización para sitios públicos y privados.',
    'clients.title': 'Nuestros <span class="accent">Clientes</span>', 'clients.intro': 'Confiado por líderes operativos.',
    'why.title': 'Por qué <span class="accent">elegirnos</span>', 'why.b1': '<strong>Sin rastro</strong> — acabado impecable.', 'why.b2': '<strong>Conformidad</strong> — regulaciones.', 'why.b3': '<strong>Seguridad</strong> — EPP estricto.', 'why.b4': '<strong>Rápida</strong> — movilización rápida.', 'why.b5': '<strong>Ecológico</strong> — química responsable.', 'why.eyebrow': 'Garantía', 'why.cardTitle': 'No dejamos rastro.', 'why.cardDesc': 'Nuestro nombre es promesa.', 'why.cta': '✉️ Contáctanos',
    'testimonials.eyebrow': 'Testimonios', 'testimonials.title': 'Lo que dicen los clientes', 'testimonials.desc': 'Próximamente.',
    'contact.title': 'Contacto', 'contact.desc': 'Cuéntenos sobre su instalación. Respuesta en 1 día.', 'contact.addr': 'Sfax, Sakiet Ezzit, Túnez',
    'form.name': 'Nombre', 'form.namePh': 'Juan Pérez', 'form.company': 'Empresa', 'form.companyPh': 'Su empresa', 'form.email': 'Correo', 'form.emailPh': 'usted@empresa.com', 'form.phone': 'Teléfono', 'form.phonePh': '+216 27 91 27 12', 'form.message': 'Mensaje', 'form.messagePh': 'Describa sitio y plazos.', 'form.cta': '✉️ Enviar correo',
    'map.title': 'Nuestra oficina', 'map.desc': 'Mapa interactivo.', 'map.open': 'Abrir',
    'footer.copy': '© <span id="year"></span> Zero Trace. Todos los derechos reservados.',
    'errors.nameRequired': 'Por favor, escriba su nombre.',
    'errors.companyRequired': 'Por favor, escriba el nombre de su empresa.',
    'errors.emailInvalid': 'Ingrese un correo electrónico válido.',
    'errors.phoneInvalid': 'Ingrese un número de teléfono válido.',
    'errors.messageShort': 'Ingrese al menos 10 caracteres.',
    'errors.fix': 'Corrija los errores de arriba.',
    'status.sending': 'Enviando...',
    'status.sent': '¡Enviado! Le contactaremos en un día laborable.',
    'status.failed': 'No se pudo enviar. Intente de nuevo o contáctenos.',
    'status.misconfig': 'Servicio de correo no configurado.',
    // Insights + FAQ
    'insights.eyebrow': 'Contenido',
    'insights.title': 'Guías y buenas prácticas',
    'insights.intro': 'Métodos prácticos y verificables para entornos industriales.',
    'insights.a1.title': 'Pruebas ATP para sanitización: umbrales y reportes',
    'insights.a1.desc': 'Por qué importa el ATP, cómo muestreamos y rangos objetivo en áreas de alto riesgo.',
    'insights.a1.cta': 'Hablar con un experto',
    'insights.a2.title': 'Control de olores en residuos municipales: guía práctica',
    'insights.a2.desc': 'Identificación de fuentes, química de neutralización y métricas medibles.',
    'insights.a2.cta': 'Solicitar la SOP completa',
    'faq.eyebrow': 'FAQ',
    'faq.title': 'Preguntas frecuentes',
    'faq.q1': '¿Qué sectores atendéis?',
    'faq.a1': 'Recolectamos y pre‑tratamos residuos de granjas avícolas, almazaras y sitios municipales. Los hoteles también son clientes.',
    'faq.q2': '¿Ofrecen respuesta a derrames (emergencias)?',
    'faq.a2': 'Sí. Contención rápida y retiro conforme ante derrames o incidentes.',
    'faq.q3': '¿Cómo pedimos un presupuesto?',
    'faq.a3': 'Use el formulario o escriba a contact@zerotrace.tn. Respondemos en 1 día.'
  },
  de: {
    'meta.title': 'Zero Trace — Abfallsammlung und Verwertung',
    'meta.description': 'Zero Trace, Teil der Misra Group, sammelt, transportiert und vorbehandelt Abfälle aus Geflügelfarmen, Olivenölpressen und kommunalen Abfallplätzen.',
    'nav.home': 'Start', 'nav.about': 'Über uns', 'nav.services': 'Leistungen', 'nav.sectors': 'Branchen', 'nav.cta': 'Kontakt aufnehmen',
    'hero.title': 'Zero Trace — <span class="accent">Keine Spuren</span> nach unserer Arbeit.',
    'hero.subtitle': 'Teil der Misra Group: Wir sammeln und verwerten Industrieabfälle (Geflügelfarmen, Olivenölpressen, kommunale Abfallplätze und Hotels).',
    'hero.ctaPrimary': '✉️ Kontakt aufnehmen', 'hero.ctaSecondary': 'Leistungen ansehen', 'hero.badgeEco': 'Umweltbewusst', 'hero.badgeCompliance': 'Konform', 'hero.badgeFast': 'Schnelle Reaktion',
    'about.title': 'Über <span class="accent">Zero Trace</span>', 'about.desc': 'Zero Trace entstand innerhalb der Misra Group, um eigene Abfallherausforderungen zu lösen. Heute bieten wir externen Kunden dieselben konformen Leistungen für Sammlung, Transport und Vorbehandlung – für Geflügelfarmen, Olivenölpressen, kommunale Abfallplätze und Hotels.', 'about.point1': 'Umweltfreundliche Methoden', 'about.point2': 'Konforme Protokolle', 'about.point3': 'Industrieausrüstung & PSA', 'about.point4': 'Schneller Einsatz',
    'services.title': 'Kern-<span class="accent">Leistungen</span>', 'services.intro': 'Integrierte Abfallsammlung und Verwertung.',
    'services.s1.title': 'Sammlung vor Ort', 'services.s1.desc': 'Geplante Routen oder ad hoc, konforme Behälter und Nachverfolgung.',
    'services.s2.title': 'Transport & Logistik', 'services.s2.desc': 'Lizenzierter Transport vom Standort zur Vorbehandlung mit Tracking.',
    'services.s3.title': 'Vorbehandlung & Sortierung', 'services.s3.desc': 'Sicheres Sortieren, Entwässern und Stabilisieren.',
    'services.s4.title': 'Verwertung/Valorisierung', 'services.s4.desc': 'Partnerprozesse zur Umwandlung in Energie oder Nebenprodukte.',
    'services.s5.title': 'Notfall‑Einsätze', 'services.s5.desc': 'Schnelle Eindämmung und konformer Abtransport.',
    'sectors.title': 'Branchen, die wir <span class="accent">bedienen</span>', 'sectors.s1.title': 'Geflügelfarmen', 'sectors.s1.desc': 'Sammlung, Transport und konforme Handhabung für Geflügelbetriebe.', 'sectors.s2.title': 'Olivenölpressen', 'sectors.s2.desc': 'Sammlung von Trester und öligen Rückständen mit sicherer Vorbehandlung.', 'sectors.s3.title': 'Hotels', 'sectors.s3.desc': 'Sammlung und Logistik von Abfallströmen aus Hotelbetrieben.', 'sectors.s4.title': 'Kommunale Abfallplätze', 'sectors.s4.desc': 'Sammlung, Logistik und Verwertung für öffentliche und private Standorte.',
    'clients.title': 'Unsere <span class="accent">Kunden</span>', 'clients.intro': 'Vertraut von Betriebsleitern.',
    'why.title': 'Warum <span class="accent">wir</span>', 'why.b1': '<strong>Spurlos</strong> — makelloses Ergebnis.', 'why.b2': '<strong>Konform</strong> — Vorschriften.', 'why.b3': '<strong>Sicher</strong> — strenge PSA.', 'why.b4': '<strong>Schnell</strong> — rasche Mobilisierung.', 'why.b5': '<strong>Umweltbewusst</strong> — verantwortungsvolle Chemie.', 'why.eyebrow': 'Garantie', 'why.cardTitle': 'Wir hinterlassen keine Spuren.', 'why.cardDesc': 'Unser Name ist Programm.', 'why.cta': '✉️ Kontakt aufnehmen',
    'testimonials.eyebrow': 'Referenzen', 'testimonials.title': 'Das sagen unsere Kunden', 'testimonials.desc': 'Bald verfügbar.',
    'contact.title': 'Kontakt <span class="accent">aufnehmen</span>', 'contact.desc': 'Erzählen Sie uns von Ihrer Anlage. Antwort in 1 Werktag.', 'contact.addr': 'Sfax, Sakiet Ezzit, Tunesien',
    'form.name': 'Name', 'form.namePh': 'Max Mustermann', 'form.company': 'Firma', 'form.companyPh': 'Ihre Firma', 'form.email': 'E-Mail', 'form.emailPh': 'sie@firma.de', 'form.phone': 'Telefon', 'form.phonePh': '+216 27 91 27 12', 'form.message': 'Nachricht', 'form.messagePh': 'Anlage, Zeitplan, Umfang.', 'form.cta': '✉️ E‑Mail senden',
    'map.title': 'Unser Büro', 'map.desc': 'Interaktive Karte.', 'map.open': 'Öffnen',
    'footer.copy': '© <span id="year"></span> Zero Trace. Alle Rechte vorbehalten.',
    'errors.nameRequired': 'Bitte geben Sie Ihren Namen ein.',
    'errors.companyRequired': 'Bitte geben Sie Ihren Firmennamen ein.',
    'errors.emailInvalid': 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    'errors.phoneInvalid': 'Bitte geben Sie eine gültige Telefonnummer ein.',
    'errors.messageShort': 'Bitte mindestens 10 Zeichen eingeben.',
    'errors.fix': 'Bitte beheben Sie die oben genannten Fehler.',
    'status.sending': 'Senden...',
    'status.sent': 'Gesendet! Wir melden uns innerhalb eines Werktags.',
    'status.failed': 'Senden fehlgeschlagen. Bitte erneut versuchen.',
    'status.misconfig': 'E-Mail-Dienst not configured.',
    // Insights + FAQ
    'insights.eyebrow': 'Einblicke',
    'insights.title': 'Leitfäden & Best Practices',
    'insights.intro': 'Praktische, überprüfbare Methoden für Industrieumgebungen.',
    'insights.a1.title': 'ATP-Tests für Hygiene: Schwellen und Reporting',
    'insights.a1.desc': 'Warum ATP wichtig ist, Probenahme und Zielbereiche für Risiko-Zonen.',
    'insights.a1.cta': 'Mit Expertin/Experten sprechen',
    'insights.a2.title': 'Geruchskontrolle auf kommunalen Deponien: Leitfaden',
    'insights.a2.desc': 'Quellidentifikation, Neutralisationschemie und messbare Kennzahlen.',
    'insights.a2.cta': 'Vollständige SOP anfordern',
    'faq.eyebrow': 'FAQ',
    'faq.title': 'Häufige Fragen',
    'faq.q1': 'Welche Branchen bedienen Sie?',
    'faq.a1': 'Wir sammeln und vorbehandeln Abfälle von Geflügelfarmen, Olivenölpressen und kommunalen Standorten. Hotels sind ebenfalls Kunden.',
    'faq.q2': 'Bieten Sie Notfall‑Einsätze bei Leckagen/Unfällen an?',
    'faq.a2': 'Ja, schnelle Eindämmung und konformer Abtransport bei Vorfällen.',
    'faq.q3': 'Wie fordern wir ein Angebot an?',
    'faq.a3': 'Über das Formular oder an contact@zerotrace.tn. Antwort in 1 Werktag.'
  },
  ar: {
    'meta.title': 'زيرو تريس — جمع ونقل ومعالجة أولية للنفايات',
    'meta.description': 'زيرو تريس ضمن مجموعة ميسرا (Misra Group) وتختص بجمع ونقل ومعالجة أولية لنفايات مزارع الدواجن ومعاصر الزيتون والمواقع البلدية.',
    'nav.home': 'الرئيسية', 'nav.about': 'من نحن', 'nav.services': 'الخدمات', 'nav.sectors': 'القطاعات', 'nav.cta': 'اتصل بنا',
    'hero.title': 'زيرو تريس — <span class="accent">بلا أثر</span> بعد انتهاء عملنا.',
    'hero.subtitle': 'جزء من مجموعة ميسرا، نجمع ونستعيد النفايات الصناعية بأمان: مزارع الدواجن، معاصر الزيتون، مواقع النفايات البلدية والفنادق.',
    'hero.ctaPrimary': '✉️ اتصل بنا', 'hero.ctaSecondary': 'استكشف الخدمات', 'hero.badgeEco': 'صديق للبيئة', 'hero.badgeCompliance': 'امتثال', 'hero.badgeFast': 'استجابة سريعة',
    'about.title': 'عن <span class=\"accent\">زيرو تريس</span>', 'about.desc': 'انطلقت زيرو تريس داخل مجموعة ميسرا لحل تحديات النفايات في قطاعاتها. واليوم نقدّم لعملاء خارجيين نفس الخدمات المتوافقة لجمع النفايات ونقلها ومعالجتها أوليًا عبر مزارع الدواجن ومعاصر الزيتون والمواقع البلدية.', 'about.point1': 'أساليب علمية صديقة للبيئة', 'about.point2': 'بروتوكولات وتقارير امتثال', 'about.point3': 'معدات ووسائل حماية صناعية', 'about.point4': 'استجابة سريعة وجدولة منتظمة',
    'services.title': 'خدماتنا <span class=\"accent\">الرئيسية</span>', 'services.intro': 'جمع ونقل وتثمين متكامل للنفايات.',
    'services.s1.title': 'جمع النفايات من الموقع', 'services.s1.desc': 'زيارات مجدولة أو عند الطلب مع حاويات مطابقة وتتبع.',
    'services.s2.title': 'النقل واللوجستيات', 'services.s2.desc': 'نقل مرخّص من الموقع إلى المعالجة الأولية مع تتبع.',
    'services.s3.title': 'معالجة أولية وفرز', 'services.s3.desc': 'فرز ونزع ماء وتثبيت آمن.',
    'services.s4.title': 'تثمين/استرداد', 'services.s4.desc': 'شراكات لتحويل النفايات إلى طاقة أو منتجات ثانوية.',
    'services.s5.title': 'استجابة للحوادث', 'services.s5.desc': 'احتواء سريع وإزالة متوافقة.',
    'sectors.title': 'القطاعات التي <span class=\"accent\">نخدمها</span>', 'sectors.s1.title': 'مزارع الدواجن', 'sectors.s1.desc': 'جمع ونقل compliant ومعالجة أولية لمنتجي الدواجن.', 'sectors.s2.title': 'معاصر الزيتون', 'sectors.s2.desc': 'جمع الجفت/المخلفات الزيتية مع معالجة أولية آمنة.', 'sectors.s3.title': 'الفنادق', 'sectors.s3.desc': 'جمع ولوجستيات تدفقات النفايات التشغيلية للفنادق.', 'sectors.s4.title': 'مواقع النفايات البلدية', 'sectors.s4.desc': 'جمع ولوجستيات وتثمين للمواقع العامة والخاصة.',
    'clients.title': 'عملاؤنا', 'clients.intro': 'موثوق بنا من قبل قادة العمليات.',
    'why.title': 'لماذا <span class="accent">نحن</span>', 'why.b1': '<strong>بلا أثر</strong> — نتيجة نقية.', 'why.b2': '<strong>امتثال</strong> — وفق اللوائح.', 'why.b3': '<strong>سلامة</strong> — معدات وقاية صارمة.', 'why.b4': '<strong>سرعة</strong> — تعبئة سريعة.', 'why.b5': '<strong>صديق للبيئة</strong> — كيمياء مسؤولة.', 'why.eyebrow': 'ضمان', 'why.cardTitle': 'لا نترك أي أثر.', 'why.cardDesc': 'اسمنا هو وعدنا.', 'why.cta': '✉️ اتصل بنا',
    'testimonials.eyebrow': 'آراء العملاء', 'testimonials.title': 'ماذا يقول عملاؤنا', 'testimonials.desc': 'قريباً.',
    'contact.title': 'تواصل <span class="accent">معنا</span>', 'contact.desc': 'أخبرنا عن منشأتك. نرد خلال يوم عمل واحد.', 'contact.addr': 'صفاقس، ساقية الزيت، تونس',
    'form.name': 'الاسم', 'form.namePh': 'فلان الفلاني', 'form.company': 'الشركة', 'form.companyPh': 'اسم شركتك', 'form.email': 'البريد الإلكتروني', 'form.emailPh': 'you@company.tn', 'form.phone': 'الهاتف', 'form.phonePh': '+216 27 91 27 12', 'form.message': 'الرسالة', 'form.messagePh': 'صف منشأتك والمواعيد والنطاق.', 'form.cta': '✉️ إرسال البريد',
    'map.title': 'مكتبنا', 'map.desc': 'خريطة تفاعلية.', 'map.open': 'فتح',
    'footer.copy': '© <span id="year"></span> زيرو تريس. جميع الحقوق محفوظة.',
    'errors.nameRequired': 'يرجى إدخال الاسم.',
    'errors.companyRequired': 'يرجى إدخال اسم الشركة.',
    'errors.emailInvalid': 'يرجى إدخال بريد إلكتروني صالح.',
    'errors.phoneInvalid': 'يرجى إدخال رقم هاتف صالح.',
    'errors.messageShort': 'يرجى إدخال 10 أحرف على الأقل.',
    'errors.fix': 'يرجى تصحيح الأخطاء أعلاه.',
    'status.sending': 'جارٍ الإرسال...',
    'status.sent': 'تم الإرسال! سنتواصل معك خلال يوم عمل واحد.',
    'status.failed': 'فشل الإرسال. يرجى المحاولة مرة أخرى.',
    'status.misconfig': 'خدمة البريد غير مُهيأة.',
    // Insights + FAQ
    'insights.eyebrow': 'مقالات',
    'insights.title': 'إرشادات وأفضل الممارسات',
    'insights.intro': 'أساليب عملية وموثوقة نستخدمها في البيئات الصناعية.',
    'insights.a1.title': 'اختبار ATP للتعقيم: الحدود والتقارير',
    'insights.a1.desc': 'أهمية ATP، كيفية أخذ العينات، ونطاقات القبول في المناطق عالية الخطورة.',
    'insights.a1.cta': 'تحدث إلى خبير',
    'insights.a2.title': 'مكافحة الروائح في مواقع النفايات البلدية: دليل عملي',
    'insights.a2.desc': 'تحديد المصدر، كيمياء التعادل، ومقاييس كبح قابلة للقياس.',
    'insights.a2.cta': 'اطلب إجراءات التشغيل القياسية الكاملة',
    'faq.eyebrow': 'الأسئلة الشائعة',
    'faq.title': 'أسئلة متكررة',
    'faq.q1': 'ما القطاعات التي تخدمونها؟',
    'faq.a1': 'نجمع وننقل ونعالج أوليًا نفايات مزارع الدواجن ومعاصر الزيتون والمواقع البلدية.',
    'faq.q2': 'هل تقدمون استجابة طارئة لحوادث/تسربات؟',
    'faq.a2': 'نعم، احتواء سريع وإزالة متوافقة في حال الحوادث أو التسربات.',
    'faq.q3': 'كيف نطلب عرض سعر؟',
    'faq.a3': 'عبر النموذج أو البريد contact@zerotrace.tn. نرد خلال يوم عمل.'
  }
};

function setLanguage(lang) {
  const dict = translations[lang] || translations.en;
  const html = document.documentElement;
  html.lang = lang;
  html.dir = (lang === 'ar') ? 'rtl' : 'ltr';

  // Text nodes
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });
  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });
  // Title element
  const titleEl = document.querySelector('title[data-i18n]');
  if (titleEl && dict[titleEl.getAttribute('data-i18n')]) {
    titleEl.textContent = dict[titleEl.getAttribute('data-i18n')].replace(/<[^>]+>/g, '');
  }

  localStorage.setItem('lang', lang);
}

const langSelect = document.getElementById('languageSelect');
if (langSelect) {
  const saved = localStorage.getItem('lang') || 'en';
  langSelect.value = saved;
  setLanguage(saved);
  langSelect.addEventListener('change', () => setLanguage(langSelect.value));
}

function initFlagLangSwitcher() {
  const langBtn = document.getElementById('langBtn');
  const langMenu = document.getElementById('langMenu');
  const langFlag = document.getElementById('langFlag');
  const langCode = document.getElementById('langCode');
  if (!langBtn || !langMenu) return;

  function applyLangDir(lang) {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  }

  function setLangUI(lang, flagUrl) {
    if (langFlag && flagUrl) langFlag.src = flagUrl;
    if (langCode) langCode.textContent = lang.toUpperCase();
    applyLangDir(lang);
    localStorage.setItem('site_lang', lang);
  }

  const savedLang = localStorage.getItem('site_lang');
  if (savedLang) {
    const item = document.querySelector(`#langMenu li[data-lang="${savedLang}"]`);
    if (item) setLangUI(savedLang, item.getAttribute('data-flag'));
    applyTranslationsFor(savedLang);
  }

  function openMenu() {
    const rect = langBtn.getBoundingClientRect();
    langMenu.style.position = 'fixed';
    langMenu.style.left = `${Math.round(rect.left)}px`;
    langMenu.style.top = `${Math.round(rect.bottom + 6)}px`;
    langMenu.style.right = 'auto';
    langMenu.classList.add('show');
    langBtn.setAttribute('aria-expanded', 'true');
    langMenu.setAttribute('aria-hidden', 'false');
  }
  function closeMenu() {
    langMenu.classList.remove('show');
    langBtn.setAttribute('aria-expanded', 'false');
    langMenu.setAttribute('aria-hidden', 'true');
  }

  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (langMenu.classList.contains('show')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  langMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const li = e.target.closest('li[data-lang]');
    if (!li) return;
    const lang = li.getAttribute('data-lang');
    const flag = li.getAttribute('data-flag');
    setLangUI(lang, flag);
    applyTranslationsFor(lang);
    closeMenu();
  });

  document.addEventListener('click', closeMenu);
  window.addEventListener('resize', () => {
    if (langMenu.classList.contains('show')) openMenu();
  });
  window.addEventListener('scroll', () => {
    if (langMenu.classList.contains('show')) openMenu();
  }, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFlagLangSwitcher);
} else {
  initFlagLangSwitcher();
}

// Delegated fallback for language button (capture phase)
document.addEventListener('click', (e) => {
  const btn = e.target && (e.target.id === 'langBtn' ? e.target : e.target.closest && e.target.closest('#langBtn'));
  if (!btn) return;
  const menu = document.getElementById('langMenu');
  if (!menu) return;
  e.stopPropagation();
  if (menu.classList.contains('show')) {
    menu.classList.remove('show');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  } else {
    const rect = btn.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.left = `${Math.round(rect.left)}px`;
    menu.style.top = `${Math.round(rect.bottom + 6)}px`;
    menu.style.right = 'auto';
    menu.classList.add('show');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  }
}, true);

// Outside click guard for language menu
document.addEventListener('click', (e) => {
  const btn = document.getElementById('langBtn');
  const menu = document.getElementById('langMenu');
  if (!btn || !menu) return;
  if (menu.contains(e.target) || btn.contains(e.target)) return;
  menu.classList.remove('show');
  btn.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
});

// Update SEO metas on language change
function updateSeoMetaFor(lang) {
  const dict = (translations && translations[lang]) ? translations[lang] : translations.en;
  if (!dict) return;
  const title = dict['meta.title'] || 'Zero Trace';
  const desc = dict['meta.description'] || '';
  // <title>
  const titleEl = document.querySelector('title');
  if (titleEl) titleEl.textContent = (title || '').replace(/<[^>]+>/g, '');
  // description
  let descEl = document.querySelector('meta[name="description"]');
  if (!descEl) {
    descEl = document.createElement('meta');
    descEl.setAttribute('name', 'description');
    document.head.appendChild(descEl);
  }
  descEl.setAttribute('content', desc);
  // OG/Twitter
  const setMeta = (selector, content) => {
    const el = document.querySelector(selector);
    if (el && content) el.setAttribute('content', content.replace(/<[^>]+>/g, ''));
  };
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[property="og:description"]', desc);
  setMeta('meta[name="twitter:description"]', desc);
}

// Apply translations without data attributes using selector map
function applyTranslationsFor(lang) {
  const dict = (translations && translations[lang]) ? translations[lang] : translations.en;
  if (!dict) return;
  const updates = [
    { sel: '#nav-menu li:nth-child(1) a', key: 'nav.home' },
    { sel: '#nav-menu li:nth-child(2) a', key: 'nav.about' },
    { sel: '#nav-menu li:nth-child(3) a', key: 'nav.services' },
    { sel: '#nav-menu li:nth-child(4) a', key: 'nav.sectors' },
    { sel: '#nav-menu li:nth-child(5) a', key: 'nav.cta' },
    { sel: '#home .headline', key: 'hero.title' },
    { sel: '#home .subhead', key: 'hero.subtitle' },
    { sel: '#home .hero-ctas .btn-primary', key: 'hero.ctaPrimary' },
    { sel: '#home .hero-ctas .btn-outline', key: 'hero.ctaSecondary' },
    { sel: '#home .hero-badges span:nth-child(1)', key: 'hero.badgeEco' },
    { sel: '#home .hero-badges span:nth-child(2)', key: 'hero.badgeCompliance' },
    { sel: '#home .hero-badges span:nth-child(3)', key: 'hero.badgeFast' },
    { sel: '#about h2', key: 'about.title' },
    { sel: '#about p', key: 'about.desc' },
    { sel: '#about .checklist li:nth-child(1)', key: 'about.point1' },
    { sel: '#about .checklist li:nth-child(2)', key: 'about.point2' },
    { sel: '#about .checklist li:nth-child(3)', key: 'about.point3' },
    { sel: '#about .checklist li:nth-child(4)', key: 'about.point4' },
    { sel: '#services h2.center', key: 'services.title' },
    { sel: '#services .section-intro', key: 'services.intro' },
    { sel: '#services .cards.services article:nth-child(1) h3', key: 'services.s1.title' },
    { sel: '#services .cards.services article:nth-child(1) p', key: 'services.s1.desc' },
    { sel: '#services .cards.services article:nth-child(2) h3', key: 'services.s2.title' },
    { sel: '#services .cards.services article:nth-child(2) p', key: 'services.s2.desc' },
    { sel: '#services .cards.services article:nth-child(3) h3', key: 'services.s3.title' },
    { sel: '#services .cards.services article:nth-child(3) p', key: 'services.s3.desc' },
    { sel: '#services .cards.services article:nth-child(4) h3', key: 'services.s4.title' },
    { sel: '#services .cards.services article:nth-child(4) p', key: 'services.s4.desc' },
    { sel: '#services .cards.services article:nth-child(5) h3', key: 'services.s5.title' },
    { sel: '#services .cards.services article:nth-child(5) p', key: 'services.s5.desc' },
    { sel: '#sectors h2.center', key: 'sectors.title' },
    { sel: '#sectors .cards.sectors article:nth-child(1) h3', key: 'sectors.s1.title' },
    { sel: '#sectors .cards.sectors article:nth-child(1) p', key: 'sectors.s1.desc' },
    { sel: '#sectors .cards.sectors article:nth-child(2) h3', key: 'sectors.s2.title' },
    { sel: '#sectors .cards.sectors article:nth-child(2) p', key: 'sectors.s2.desc' },
    { sel: '#sectors .cards.sectors article:nth-child(3) h3', key: 'sectors.s3.title' },
    { sel: '#sectors .cards.sectors article:nth-child(3) p', key: 'sectors.s3.desc' },
    { sel: '#sectors .cards.sectors article:nth-child(4) h3', key: 'sectors.s4.title' },
    { sel: '#sectors .cards.sectors article:nth-child(4) p', key: 'sectors.s4.desc' },
    { sel: '#clients h2.center', key: 'clients.title' },
    { sel: '#clients .section-intro', key: 'clients.intro' },
    { sel: '#why h2', key: 'why.title' },
    { sel: '#why .benefits li:nth-child(1)', key: 'why.b1' },
    { sel: '#why .benefits li:nth-child(2)', key: 'why.b2' },
    { sel: '#why .benefits li:nth-child(3)', key: 'why.b3' },
    { sel: '#why .benefits li:nth-child(4)', key: 'why.b4' },
    { sel: '#why .benefits li:nth-child(5)', key: 'why.b5' },
    { sel: '#why .highlight-card .eyebrow', key: 'why.eyebrow' },
    { sel: '#why .highlight-card h3', key: 'why.cardTitle' },
    { sel: '#why .highlight-card p:nth-of-type(2)', key: 'why.cardDesc' },
    { sel: '#why .highlight-card a.btn', key: 'why.cta' },
    { sel: '#testimonials .eyebrow', key: 'testimonials.eyebrow' },
    { sel: '#testimonials h2', key: 'testimonials.title' },
    { sel: '#testimonials .muted', key: 'testimonials.desc' },
    { sel: '#contact .contact-info h2', key: 'contact.title' },
    { sel: '#contact .contact-info p', key: 'contact.desc' },
    { sel: '#contact .contact-form button[type="submit"]', key: 'form.cta' },
    { sel: '#contact label[for="company"]', key: 'form.company' },
    { sel: '#contact label[for="name"]', key: 'form.name' },
    { sel: '#contact label[for="email"]', key: 'form.email' },
    { sel: '#contact label[for="phone"]', key: 'form.phone' },
    { sel: '#contact label[for="message"]', key: 'form.message' },
    { sel: '#contact .map-card h3', key: 'map.title' },
    // Insights section
    { sel: '#insights .eyebrow', key: 'insights.eyebrow' },
    { sel: '#insights h2.center', key: 'insights.title' },
    { sel: '#insights .section-intro', key: 'insights.intro' },
    { sel: '#insight-atp-testing h3', key: 'insights.a1.title' },
    { sel: '#insight-atp-testing p', key: 'insights.a1.desc' },
    { sel: '#insight-atp-testing a.btn', key: 'insights.a1.cta' },
    { sel: '#insight-odor-control h3', key: 'insights.a2.title' },
    { sel: '#insight-odor-control p', key: 'insights.a2.desc' },
    { sel: '#insight-odor-control a.btn', key: 'insights.a2.cta' },
    // FAQ section
    { sel: '#faq .eyebrow', key: 'faq.eyebrow' },
    { sel: '#faq h2.center', key: 'faq.title' },
    { sel: '#faq .cards.services article:nth-child(1) h3', key: 'faq.q1' },
    { sel: '#faq .cards.services article:nth-child(1) p', key: 'faq.a1' },
    { sel: '#faq .cards.services article:nth-child(2) h3', key: 'faq.q2' },
    { sel: '#faq .cards.services article:nth-child(2) p', key: 'faq.a2' },
    { sel: '#faq .cards.services article:nth-child(3) h3', key: 'faq.q3' },
    { sel: '#faq .cards.services article:nth-child(3) p', key: 'faq.a3' },
  ];
  updates.forEach(({ sel, key }) => {
    const el = document.querySelector(sel);
    if (!el || !dict[key]) return;
    el.innerHTML = dict[key];
  });
  // Translate address row explicitly (keeps icon span)
  const addrLi = document.querySelector('#contact .contact-info .contact-list li:nth-child(1)');
  if (addrLi && dict['contact.addr']) {
    addrLi.innerHTML = `<span>📍</span> ${dict['contact.addr']}`;
  }
  // Translate footer copy and reinsert year
  const footerCopy = document.querySelector('.footer .footer-meta span');
  if (footerCopy && dict['footer.copy']) {
    footerCopy.innerHTML = dict['footer.copy'];
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function forcePlaceholder(el, text) {
    if (!el) return;
    el.setAttribute('placeholder', text);
    el.placeholder = text;
    // If browser still shows old placeholder, replace the node to force refresh
    if (el.getAttribute('placeholder') !== text || el.placeholder !== text) {
      const clone = el.cloneNode(true);
      clone.setAttribute('placeholder', text);
      clone.placeholder = text;
      el.parentNode.replaceChild(clone, el);
    }
  }

  // Placeholders
  const ph = [
    { sel: '#name', key: 'form.namePh' },
    { sel: '#company', key: 'form.companyPh' },
    { sel: '#email', key: 'form.emailPh' },
    { sel: '#phone', key: 'form.phonePh' },
    { sel: '#message', key: 'form.messagePh' },
  ];
  ph.forEach(({ sel, key }) => {
    const el = document.querySelector(sel);
    if (!el || !dict[key]) return;
    forcePlaceholder(el, dict[key]);
  });
  // Ensure email field displays placeholder (clear old placeholder-like values)
  const emailEl = document.getElementById('email');
  if (emailEl && dict['form.emailPh']) {
    const placeholders = [
      'you@company.com', 'vous@societe.com', 'usted@empresa.com', 'sie@firma.de', 'you@company.tn'
    ];
    if (!emailEl.value || placeholders.includes(emailEl.value.trim())) {
      emailEl.value = '';
    }
    emailEl.dir = 'ltr';
    // Rebuild the input to force placeholder refresh across browsers
    const emailClone = emailEl.cloneNode(true);
    emailClone.setAttribute('placeholder', dict['form.emailPh']);
    emailClone.placeholder = dict['form.emailPh'];
    emailEl.parentNode.replaceChild(emailClone, emailEl);
  }

  // Update head metas for SEO
  updateSeoMetaFor(lang);
}

// Hook translations into flag switcher UI
(function attachI18nToFlagSwitcher(){
  const originalSetLangUI = typeof setLangUI === 'function' ? setLangUI : null;
  // If setLangUI exists, wrap it; else define it
  if (originalSetLangUI) {
    window.setLangUI = function(lang, flagUrl) {
      originalSetLangUI(lang, flagUrl);
      applyTranslationsFor(lang);
    };
  } else {
    window.setLangUI = function(lang, flagUrl){
      const langFlag = document.getElementById('langFlag');
      const langCode = document.getElementById('langCode');
      if (langFlag && flagUrl) langFlag.src = flagUrl;
      if (langCode) langCode.textContent = lang.toUpperCase();
      const html = document.documentElement;
      html.lang = lang;
      html.dir = (lang === 'ar') ? 'rtl' : 'ltr';
      localStorage.setItem('site_lang', lang);
      applyTranslationsFor(lang);
    };
  }
  // Apply on load from saved
  const saved = localStorage.getItem('site_lang');
  if (saved) applyTranslationsFor(saved);
})();

// On initial load, if no saved language, apply English defaults
if (!localStorage.getItem('site_lang')) {
  applyTranslationsFor('en');
} 

// Re-apply translated errors on language change
(function hookLangChangeForErrors(){
  const origSet = window.setLangUI;
  if (typeof origSet === 'function') {
    window.setLangUI = function(lang, flagUrl){
      const r = origSet(lang, flagUrl);
      // Update any visible field errors to current language
      const fields = ['name','company','email','phone','message']
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      fields.forEach((f) => validateFieldOnly(f));
      return r;
    };
  }
})(); 

// Theme toggle (light/dark with system preference and persistence)
(function initThemeToggle(){
  const html = document.documentElement;
  function applyTheme(theme){
    if (theme === 'light') html.setAttribute('data-theme','light');
    else html.removeAttribute('data-theme');
    localStorage.setItem('site_theme', theme);
  }
  const saved = localStorage.getItem('site_theme');
  if (saved) {
    applyTheme(saved);
  } else {
    try {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      if (prefersLight) applyTheme('light');
    } catch(_){}
  }
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  }
})(); 