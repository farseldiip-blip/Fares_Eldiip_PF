/* ================================================
   ENVIRONMENT — Cinematic background controller
   Tumbleweed, mouse parallax, scroll parallax
   for landscape layers
   ================================================ */
const Environment = (() => {
  'use strict';

  const CFG = {
    tumbleweed: {
      minDelay: 20000,
      maxDelay: 40000,
      minDuration: 7,
      maxDuration: 11,
      minY: 0.72,
      maxY: 0.9,
      fadeDuration: 1.2,
      bounceHeight: 5,
      bounceInterval: 0.45,
      opacity: 0.55,
    },
    parallax: {
      lerp: 0.025,
      maxShift: 1,
    },
    scrollParallax: {
      mountains: 0.08,
      hills: 0.04,
      fog: 0.02,
    },
  };

  const MOBILE_BREAKPOINT = 768;

  let els = {};
  let parallax = { tx: 0, ty: 0, cx: 0, cy: 0 };
  let scrollY = { mountains: 0, hills: 0, fog: 0 };
  let lastScrollY = 0;
  let rafId = null;
  let active = true;
  let ticking = false;

  function init() {
    els.tumbleweed = document.getElementById('tumbleweed');
    els.env = document.querySelector('.env');
    els.mountains = document.querySelector('.env__mountains');
    els.hills = document.querySelector('.env__hills');
    els.fog1 = document.querySelector('.env__fog--1');
    if (!els.env) return;

    if (Helpers.isReducedMotion()) return;
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;

    scheduleTumbleweed();
    startParallax();
    startScrollParallax();
  }

  /* --- Tumbleweed --- */
  function scheduleTumbleweed() {
    if (!active) return;
    const delay = CFG.tumbleweed.minDelay +
      Math.random() * (CFG.tumbleweed.maxDelay - CFG.tumbleweed.minDelay);

    setTimeout(() => {
      if (!active) return;
      rollTumbleweed();
      scheduleTumbleweed();
    }, delay);
  }

  function rollTumbleweed() {
    const tw = els.tumbleweed;
    if (!tw || typeof gsap === 'undefined') return;

    const C = CFG.tumbleweed;
    const fromLeft = Math.random() > 0.5;
    const vw = window.innerWidth;
    const duration = C.minDuration + Math.random() * (C.maxDuration - C.minDuration);
    const startY = window.innerHeight * (C.minY + Math.random() * (C.maxY - C.minY));

    const startX = fromLeft ? -90 : vw + 90;
    const endX   = fromLeft ? vw + 90 : -90;

    gsap.killTweensOf(tw);
    tw.style.left = startX + 'px';
    tw.style.top  = startY + 'px';
    tw.style.opacity = '0';
    tw.style.transform = 'rotate(0deg) translateY(0)';
    tw.classList.add('env__tumbleweed--rolling');

    const tl = gsap.timeline({
      onComplete() {
        tw.classList.remove('env__tumbleweed--rolling');
        tw.style.opacity = '0';
      },
    });

    tl.to(tw, { opacity: C.opacity, duration: 0.6, ease: 'power2.out' });
    tl.to(tw, { left: endX, duration, ease: 'none' }, '<');
    tl.to(tw, { rotation: fromLeft ? 900 : -900, duration, ease: 'none' }, '<');

    const bounceCount = Math.floor(duration / C.bounceInterval);
    tl.to(tw, {
      y: -C.bounceHeight,
      duration: C.bounceInterval * 0.5,
      ease: 'sine.out',
      yoyo: true,
      repeat: bounceCount,
    }, '<0.2');

    tl.to(tw, {
      opacity: 0,
      duration: C.fadeDuration,
      ease: 'power2.in',
    }, `-=${C.fadeDuration + 0.5}`);
  }

  /* --- Mouse Parallax --- */
  function startParallax() {
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    rafId = requestAnimationFrame(tickParallax);
  }

  function onMouseMove(e) {
    parallax.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
    parallax.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function tickParallax() {
    const P = CFG.parallax;
    parallax.cx += (parallax.tx - parallax.cx) * P.lerp;
    parallax.cy += (parallax.ty - parallax.cy) * P.lerp;

    els.env.style.setProperty('--px', parallax.cx.toFixed(4));
    els.env.style.setProperty('--py', parallax.cy.toFixed(4));

    rafId = requestAnimationFrame(tickParallax);
  }

  /* --- Scroll Parallax (tracks values directly) --- */
  function startScrollParallax() {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function onScroll() {
    if (!active) return;
    lastScrollY = window.scrollY;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  }

  function updateParallax() {
    if (!active) { ticking = false; return; }
    const sy = lastScrollY;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    scrollY.mountains = clamp(sy * CFG.scrollParallax.mountains * -1, -60, 80);
    scrollY.hills     = clamp(sy * CFG.scrollParallax.hills * -1,  -50, 60);
    scrollY.fog       = clamp(sy * CFG.scrollParallax.fog * -1,    -20, 30);

    if (els.mountains) els.mountains.style.transform = `translateY(${scrollY.mountains}px)`;
    if (els.hills)     els.hills.style.transform     = `translateY(${scrollY.hills}px)`;
    if (els.fog1)      els.fog1.style.transform       = `translateY(${scrollY.fog}px)`;

    ticking = false;
  }

  function destroy() {
    active = false;
    if (rafId) cancelAnimationFrame(rafId);
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
  }

  return { init, destroy };
})();
