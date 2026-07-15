/* ================================================
   PROJECTS CAROUSEL — Direct State Machine
   All transitions are imperative GSAP tweens.
   No ScrollTrigger pinning, no scrub timelines.
   Infinite loop. Animation-stack-proof.
   ================================================ */
const ProjectsShowcase = (() => {
  const slides = [];
  const cleanups = [];
  let active = false;
  let currentIndex = 0;
  let totalSlides = 0;
  let isAnimating = false;
  let mouseTarget = { x: 0, y: 0 };
  let mouseCurrent = { x: 0, y: 0 };
  let rafId = null;
  let reducedMotion = false;

  // DOM refs
  let viewport, progressFill, currentEl, totalEl;
  let dots, prevBtn, nextBtn, sectionEl;

  function init() {
    if (typeof gsap === 'undefined') return;

    viewport = document.getElementById('carousel-viewport');
    if (!viewport) return;

    progressFill = document.getElementById('carousel-progress-fill');
    currentEl = document.getElementById('carousel-current');
    totalEl = document.getElementById('carousel-total');
    prevBtn = document.getElementById('carousel-prev');
    nextBtn = document.getElementById('carousel-next');
    dots = document.querySelectorAll('.carousel__dot');
    sectionEl = document.querySelector('.projects-carousel');

    const slideEls = viewport.querySelectorAll('.carousel__slide');
    totalSlides = slideEls.length;
    if (totalSlides === 0) return;

    reducedMotion = Helpers.isReducedMotion();
    const isMobile = Helpers.isMobile();

    slideEls.forEach((el, i) => {
      slides.push({
        el,
        card: el.querySelector('.carousel__card'),
        inner: el.querySelector('.carousel__card-inner'),
      });
    });

    if (totalEl) totalEl.textContent = String(totalSlides).padStart(2, '0');

    active = true;
    setupInitialState();
    bindNavigation();
    initMouseTilt();
    initBackgroundOrbs();
    animateLoop();
    updateUI();
  }

  /* -----------------------------------------------
     INITIAL STATE — All slides stacked, first visible
     ----------------------------------------------- */
  function setupInitialState() {
    slides.forEach((s, i) => {
      gsap.killTweensOf(s.el);
      if (s.card) gsap.killTweensOf(s.card);

      if (i === 0) {
        gsap.set(s.el, {
          opacity: 1, x: 0, scale: 1, rotateY: 0,
          z: 0, filter: 'blur(0px)', pointerEvents: 'auto',
        });
        s.el.classList.add('carousel__slide--active');
      } else {
        gsap.set(s.el, {
          opacity: 0, x: 0, scale: 1, rotateY: 0,
          z: 0, filter: 'blur(0px)', pointerEvents: 'none',
        });
        s.el.classList.remove('carousel__slide--active');
      }

      if (s.card) {
        gsap.set(s.card, { rotateX: 0, rotateY: 0, boxShadow: 'none' });
      }
    });
  }

  /* -----------------------------------------------
     NAVIGATION — Arrows, dots, keyboard
     ----------------------------------------------- */
  function bindNavigation() {
    if (prevBtn) {
      const handler = () => navigatePrev();
      prevBtn.addEventListener('click', handler);
      cleanups.push(() => prevBtn.removeEventListener('click', handler));
    }
    if (nextBtn) {
      const handler = () => navigateNext();
      nextBtn.addEventListener('click', handler);
      cleanups.push(() => nextBtn.removeEventListener('click', handler));
    }

    dots.forEach((dot) => {
      const handler = () => goToSlide(parseInt(dot.dataset.dot, 10));
      dot.addEventListener('click', handler);
      cleanups.push(() => dot.removeEventListener('click', handler));
    });

    const keyHandler = (e) => {
      if (!active || isAnimating) return;
      if (!sectionEl) return;
      const rect = sectionEl.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigatePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigateNext();
      }
    };
    document.addEventListener('keydown', keyHandler);
    cleanups.push(() => document.removeEventListener('keydown', keyHandler));
  }

  function navigateNext() {
    if (isAnimating) return;
    const next = (currentIndex + 1) % totalSlides;
    transitionTo(next, 'next');
  }

  function navigatePrev() {
    if (isAnimating) return;
    const prev = (currentIndex - 1 + totalSlides) % totalSlides;
    transitionTo(prev, 'prev');
  }

  function goToSlide(index) {
    if (isAnimating || index === currentIndex) return;
    const dir = index > currentIndex ? 'next' : 'prev';
    transitionTo(index, dir);
  }

  /* -----------------------------------------------
     TRANSITION — Kill old, animate new
     ----------------------------------------------- */
  function transitionTo(newIndex, direction) {
    if (isAnimating) return;
    isAnimating = true;

    const outEl = slides[currentIndex].el;
    const inEl = slides[newIndex].el;

    // Kill any running tweens on both slides immediately
    gsap.killTweensOf(outEl);
    gsap.killTweensOf(inEl);

    // Determine direction for enter/exit
    const exitX = direction === 'next' ? '-15%' : '15%';
    const enterFromX = direction === 'next' ? '15%' : '-15%';
    const exitRotateY = direction === 'next' ? -4 : 4;
    const enterRotateY = direction === 'next' ? 4 : -4;

    // Ensure incoming slide is in its starting position (hidden)
    const mobileBlur = Helpers.isMobile() ? 'blur(0px)' : 'blur(4px)';
    gsap.set(inEl, {
      opacity: 0,
      x: enterFromX,
      scale: 0.88,
      rotateY: enterRotateY,
      filter: mobileBlur,
      pointerEvents: 'none',
    });

    const dur = reducedMotion ? 0.3 : 0.65;
    const ease = 'power3.inOut';

    // Animate outgoing slide
    const mobileBlurOut = Helpers.isMobile() ? 'blur(0px)' : 'blur(4px)';
    gsap.to(outEl, {
      x: exitX,
      scale: 0.88,
      rotateY: exitRotateY,
      opacity: 0,
      filter: mobileBlurOut,
      duration: dur,
      ease,
      overwrite: true,
      onComplete: () => {
        outEl.classList.remove('carousel__slide--active');
        gsap.set(outEl, {
          x: 0, scale: 1, rotateY: 0, filter: 'blur(0px)',
          pointerEvents: 'none',
        });
      },
    });

    // Animate incoming slide
    gsap.to(inEl, {
      x: 0,
      scale: 1,
      rotateY: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: dur,
      ease,
      delay: dur * 0.15,
      overwrite: true,
      onStart: () => {
        inEl.classList.add('carousel__slide--active');
        inEl.style.pointerEvents = 'auto';
      },
      onComplete: () => {
        currentIndex = newIndex;
        isAnimating = false;
        updateUI();
        // Reset mouse tilt target to prevent stale values
        mouseTarget.x = 0;
        mouseTarget.y = 0;
      },
    });
  }

  /* -----------------------------------------------
     UI — Counter, progress, dots
     ----------------------------------------------- */
  function updateUI() {
    const num = currentIndex + 1;
    const formatted = String(num).padStart(2, '0');

    // Counter with micro-animation
    if (currentEl && currentEl.textContent !== formatted) {
      gsap.killTweensOf(currentEl);
      gsap.to(currentEl, {
        y: -6, opacity: 0, duration: 0.12, ease: 'power2.in',
        onComplete: () => {
          currentEl.textContent = formatted;
          gsap.fromTo(currentEl,
            { y: 6, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.15, ease: 'power2.out' }
          );
        },
      });
    }

    // Progress bar — always reflects current index
    if (progressFill) {
      const pct = totalSlides > 1
        ? ((currentIndex) / (totalSlides - 1)) * 100
        : 100;
      gsap.to(progressFill, {
        width: pct + '%',
        duration: 0.5,
        ease: 'power2.out',
        overwrite: true,
      });
    }

    // Dots
    dots.forEach((d, i) => {
      d.classList.toggle('carousel__dot--active', i === currentIndex);
    });
  }

  /* -----------------------------------------------
     MOUSE TILT — Smooth 3D reactive on card
     ----------------------------------------------- */
  function initMouseTilt() {
    if (!Helpers.isHoverCapable()) return;

    const onMove = (e) => {
      if (!active) return;
      mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    cleanups.push(() => window.removeEventListener('mousemove', onMove));

    // Clear inline styles when mouse leaves viewport
    const onLeave = () => {
      mouseTarget.x = 0;
      mouseTarget.y = 0;
      mouseCurrent.x = 0;
      mouseCurrent.y = 0;
      const card = slides[currentIndex]?.card;
      if (card) {
        gsap.to(card, {
          rotateX: 0, rotateY: 0,
          duration: 0.5, ease: 'power2.out',
          onComplete: () => { card.style.boxShadow = ''; },
        });
      }
    };
    if (viewport) {
      viewport.addEventListener('mouseleave', onLeave);
      cleanups.push(() => viewport.removeEventListener('mouseleave', onLeave));
    }
  }

  function applyMouseTilt() {
    if (!active || reducedMotion || isAnimating) return;

    mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.06;
    mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.06;

    const card = slides[currentIndex]?.card;
    if (!card) return;

    const tiltX = mouseCurrent.y * -2;
    const tiltY = mouseCurrent.x * 2.5;

    gsap.set(card, {
      rotateX: tiltX,
      rotateY: tiltY,
      transformPerspective: 1200,
      overwrite: 'auto',
    });

    // Dynamic shadow
    const sx = mouseCurrent.x * -12;
    const sy = mouseCurrent.y * -8;
    card.style.boxShadow =
      `${sx}px ${sy}px 80px rgba(0,0,0,0.5), ` +
      `${sx * 0.3}px ${sy * 0.3}px 30px rgba(0,0,0,0.25), ` +
      `0 0 60px rgba(var(--c-copper-rgb),0.03)`;
  }

  /* -----------------------------------------------
     BACKGROUND ORBS — Ambient atmosphere
     ----------------------------------------------- */
  function initBackgroundOrbs() {
    const orbs = document.querySelectorAll('.carousel__bg-orb');
    setTimeout(() => {
      orbs.forEach(o => o.classList.add('carousel__bg-orb--visible'));
    }, 500);

    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        x: `random(-25, 25)`,
        y: `random(-20, 20)`,
        scale: `random(0.92, 1.08)`,
        duration: `random(14, 20)`,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 2.5,
      });
    });
  }

  /* -----------------------------------------------
     ANIMATION LOOP — 60fps mouse tilt
     ----------------------------------------------- */
  function animateLoop() {
    if (!active) return;
    if (!Helpers.isHoverCapable()) return;
    applyMouseTilt();
    rafId = requestAnimationFrame(animateLoop);
  }

  /* -----------------------------------------------
     CLEANUP
     ----------------------------------------------- */
  function destroy() {
    active = false;
    if (rafId) cancelAnimationFrame(rafId);
    document.querySelectorAll('.carousel__bg-orb').forEach(orb => {
      gsap.killTweensOf(orb);
    });
    slides.forEach(s => {
      gsap.killTweensOf(s.el);
      if (s.card) gsap.killTweensOf(s.card);
      gsap.set(s.el, { clearProps: 'all' });
      if (s.card) gsap.set(s.card, { clearProps: 'all' });
    });
    cleanups.forEach(fn => fn());
    cleanups.length = 0;
    slides.length = 0;
    sectionEl = null;
  }

  return { init, destroy };
})();
