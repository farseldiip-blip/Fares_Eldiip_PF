/* ================================================
   APP — Main Orchestrator
   Initializes all modules in correct order.
   ================================================ */
const App = (() => {
  const EMAIL = 'farseldiip@gmail.com';
  const EMAILJS_SERVICE_ID = 'service_me8ccnl';
  const EMAILJS_TEMPLATE_ID = 'template_jebwy9c';
  const EMAILJS_PUBLIC_KEY = '_xWqNpAeK6537RCUD';
  const FORM_DELAY_MS = 800;
  const SUCCESS_DISPLAY_MS = 3000;
  const COPY_TOOLTIP_MS = 2000;
  let rippleHandler;
  let keydownHandler;

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function init() {
    document.body.classList.add('loading');

    try {
      if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      }

      SmoothScroll.init();
      SmoothScroll.stop();

      Navbar.init();
      Typing.init();
      Cursor.init();
      Magnetic.init();

      HeroAnim.init();
      Environment.init();

      await Loader.init();

      document.getElementById('navbar')?.classList.add('nav--entered');
      SmoothScroll.start();

      if (!Helpers.isMobile()) {
        document.querySelectorAll('.ambient-orb').forEach(orb => {
          orb.classList.add('ambient-orb--visible');
        });
      }

      HeroAnim.animateIn();

      SectionAnim.init();
      CardAnim.init();
      ProjectsShowcase.init();
      EmbersBg.init();

      initRipple();
      initContactForm();
      initCopyEmail();
      initAccessibility();
    } catch (err) {
      console.error('App init failed:', err);
      document.body.classList.remove('loading');
    }
  }

  function initRipple() {
    rippleHandler = (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      if (btn.disabled || btn.classList.contains('btn--loading')) return;

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'btn__ripple';
      ripple.style.width = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    };
    document.addEventListener('click', rippleHandler);
  }

  function showToast(el, duration) {
    el.classList.add('contact__form-success--show');
    return delay(duration).then(() => el.classList.remove('contact__form-success--show'));
  }

  function showErrorToast(message) {
    const errorEl = document.getElementById('form-error');
    const errorText = document.getElementById('form-error-text');
    if (!errorEl) return;
    if (errorText && message) errorText.textContent = message;
    errorEl.classList.add('contact__form-error--show');
    return delay(SUCCESS_DISPLAY_MS).then(() => errorEl.classList.remove('contact__form-error--show'));
  }

  function resetButton(btn, label, original) {
    btn.classList.remove('btn--loading');
    btn.removeAttribute('aria-disabled');
    label.textContent = original;
  }

  async function initContactForm() {
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = form.querySelector('#fname').value.trim();
      const email = form.querySelector('#femail').value.trim();
      const message = form.querySelector('#fmessage').value.trim();
      if (!name || !email || !message) return;

      const btn = form.querySelector('.btn[type="submit"]');
      const label = btn.querySelector('.btn__label');
      const original = label.textContent;

      btn.classList.add('btn--loading');
      btn.setAttribute('aria-disabled', 'true');
      label.textContent = 'Sending...';

      const timeField = document.getElementById('ftime');
      if (timeField) timeField.value = new Date().toLocaleString();

      try {
        await emailjs.sendForm(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          form,
          { publicKey: EMAILJS_PUBLIC_KEY }
        );

        await delay(FORM_DELAY_MS);
        resetButton(btn, label, original);
        if (success) showToast(success, SUCCESS_DISPLAY_MS);
        form.reset();
      } catch (err) {
        console.error('EmailJS error:', err);
        await delay(FORM_DELAY_MS);
        resetButton(btn, label, original);
        showErrorToast(err?.text || err?.message || 'Failed to send message. Please try again.');
      }
    });
  }

  function initCopyEmail() {
    const btn = document.getElementById('copy-email');
    const tip = document.getElementById('copy-tip');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = EMAIL;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      if (tip) {
        tip.classList.add('contact__copy-tip--show');
        setTimeout(() => tip.classList.remove('contact__copy-tip--show'), COPY_TOOLTIP_MS);
      }
    });
  }

  function initAccessibility() {
    keydownHandler = (e) => {
      if (e.key === 'Escape') {
        Navbar.closeMenu();
      }
    };
    document.addEventListener('keydown', keydownHandler);
  }

  function destroy() {
    if (rippleHandler) document.removeEventListener('click', rippleHandler);
    if (keydownHandler) document.removeEventListener('keydown', keydownHandler);
    Navbar.destroy();
    Typing.destroy();
    Cursor.destroy();
    Magnetic.destroy();
    HeroAnim.destroy();
    Environment.destroy();
    Loader.destroy();
    SectionAnim.destroy();
    CardAnim.destroy();
    ProjectsShowcase.destroy();
    EmbersBg.destroy();
  }

  return { init, destroy };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init().catch(err => console.error('Unhandled app error:', err));
});
