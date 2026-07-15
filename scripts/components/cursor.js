/* ================================================
   CURSOR — Lantern Point + Ring (Polished)
   Dot with trailing ring. rAF + lerp positioning.
   GSAP hover animations. Magnetic pull. 60fps.
   ================================================ */
const Cursor = (() => {
  let cursor, dot, ring;
  let active = false;
  let rafId;
  const cleanups = [];

  /* Position state */
  let dotX = -200, dotY = -200;
  let ringX = -200, ringY = -200;
  let targetX = -200, targetY = -200;
  let firstMove = true;

  /* Lerp factors — tuned for weight and fluidity */
  const DOT_LERP  = 0.18;
  const RING_LERP = 0.06;

  /* Magnetic pull */
  const MAGNETIC_RADIUS = 80;
  const MAGNETIC_STRENGTH = 0.35;

  const SELECTORS_HOVER = 'a, button, .magnetic, .carousel__card, .carousel__arrow, .carousel__dot, .cert, .stat, .nav__logo, .poster';
  const SELECTORS_TEXT  = 'p, h1, h2, h3, h4, h5, h6, span, .hero__name-line, .hero__eyebrow, .hero__desc, .section__title, .hero__role, blockquote, li';
  const SELECTORS_MAGNETIC = '.carousel__card, .poster';

  function lerp(a, b, t) { return a + (b - a) * t; }

  function init() {
    if (!Helpers.isHoverCapable()) return;
    if (typeof gsap === 'undefined') return;

    cursor = document.getElementById('cursor');
    dot = cursor?.querySelector('.cursor__dot');
    ring = cursor?.querySelector('.cursor__ring');
    if (!cursor || !dot || !ring) { fallback(); return; }

    const reducedMotion = Helpers.isReducedMotion();
    let magnetTarget = null;
    let magnetRect = null;

    /* --- Mouse tracking --- */
    function onMouseMove(e) {
      targetX = e.clientX;
      targetY = e.clientY;

      /* First frame: snap instantly — no slide-in from corner */
      if (firstMove) {
        firstMove = false;
        dotX = targetX;
        dotY = targetY;
        ringX = targetX;
        ringY = targetY;
        cursor.style.display = 'block';
      }
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    cleanups.push(() => document.removeEventListener('mousemove', onMouseMove));

    /* --- Animation loop: position only --- */
    function tick() {
      if (!active) return;
      rafId = requestAnimationFrame(tick);

      let tx = targetX;
      let ty = targetY;

      /* Magnetic pull */
      if (!reducedMotion && magnetTarget && magnetRect) {
        const cx = magnetRect.left + magnetRect.width / 2;
        const cy = magnetRect.top + magnetRect.height / 2;
        const dx = targetX - cx;
        const dy = targetY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAGNETIC_RADIUS) {
          const pull = (1 - dist / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH;
          tx = targetX - dx * pull;
          ty = targetY - dy * pull;
        }
      }

      const dL = reducedMotion ? 1 : DOT_LERP;
      const rL = reducedMotion ? 1 : RING_LERP;
      dotX  = lerp(dotX,  tx, dL);
      dotY  = lerp(dotY,  ty, dL);
      ringX = lerp(ringX, tx, rL);
      ringY = lerp(ringY, ty, rL);

      dot.style.transform  = `translate(${dotX}px, ${dotY}px)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    }

    /* --- Hover: buttons, links --- */
    const hoverEls = Array.from(document.querySelectorAll(SELECTORS_HOVER));
    hoverEls.forEach(el => {
      const enter = () => {
        cursor.classList.remove('cursor--text');
        cursor.classList.add('cursor--hover');
        magnetTarget = el;
        magnetRect = el.getBoundingClientRect();
        gsap.to(dot, { scale: 1.6, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
        gsap.to(ring, { scale: 1.45, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
      };
      const leave = () => {
        cursor.classList.remove('cursor--hover');
        magnetTarget = null;
        magnetRect = null;
        gsap.to(dot, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
        gsap.to(ring, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
      };
      const move = () => { magnetRect = el.getBoundingClientRect(); };

      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      el.addEventListener('mousemove', move, { passive: true });
      cleanups.push(() => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
        el.removeEventListener('mousemove', move);
      });
    });

    /* --- Text hover: precise point --- */
    const textEls = Array.from(document.querySelectorAll(SELECTORS_TEXT));
    textEls.forEach(el => {
      const enter = () => {
        if (!cursor.classList.contains('cursor--hover')) {
          cursor.classList.add('cursor--text');
          gsap.to(dot, { scale: 0.6, duration: 0.3, ease: 'power3.out', overwrite: 'auto' });
          gsap.to(ring, { scale: 0.75, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
        }
      };
      const leave = () => {
        cursor.classList.remove('cursor--text');
        if (!cursor.classList.contains('cursor--hover')) {
          gsap.to(dot, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
          gsap.to(ring, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
        }
      };
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      });
    });

    /* --- Magnetic pull on project cards --- */
    const magneticEls = Array.from(document.querySelectorAll(SELECTORS_MAGNETIC));
    magneticEls.forEach(el => {
      const moveHandler = (e) => {
        if (reducedMotion) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = Math.max(rect.width, rect.height) * 0.6;
        if (dist < radius) {
          const strength = 0.4;
          const pullX = dx * strength * (1 - dist / radius);
          const pullY = dy * strength * (1 - dist / radius);
          gsap.to(el, { x: pullX, y: pullY, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
        }
      };
      const leaveHandler = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
      };
      el.addEventListener('mousemove', moveHandler, { passive: true });
      el.addEventListener('mouseleave', leaveHandler);
      cleanups.push(() => {
        el.removeEventListener('mousemove', moveHandler);
        el.removeEventListener('mouseleave', leaveHandler);
      });
    });

    /* --- Activate --- */
    active = true;
    rafId = requestAnimationFrame(tick);

    /* Hide native cursor only after custom cursor has painted */
    requestAnimationFrame(() => {
      if (!active) return;
      document.body.style.cursor = 'none';
      document.querySelectorAll('a, button, input, textarea, select, [role="button"]').forEach(el => {
        el.style.cursor = 'none';
      });
    });
  }

  function fallback() {
    active = false;
    document.body.style.cursor = '';
    if (cursor) cursor.style.display = 'none';
  }

  function hide() {
    if (cursor) cursor.style.display = 'none';
  }

  function show() {
    if (cursor && active) cursor.style.display = 'block';
  }

  function destroy() {
    active = false;
    firstMove = true;
    if (rafId) cancelAnimationFrame(rafId);
    cleanups.forEach(fn => fn());
    cleanups.length = 0;
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(dot);
      gsap.killTweensOf(ring);
    }
    document.body.style.cursor = '';
    document.querySelectorAll('a, button, input, textarea, select, [role="button"]').forEach(el => {
      el.style.cursor = '';
    });
    if (cursor) cursor.style.display = 'none';
  }

  return { init, hide, show, destroy };
})();
