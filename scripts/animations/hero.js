/* ================================================
   HERO ANIMATIONS — Cinematic Opening Sequence
   Poster enters from right, content rises from
   bottom. Synchronized after loader completes.
   ================================================ */
const HeroAnim = (() => {
  let timeline;
  let particlesActive = false;
  let heroVisible = true;
  let observer;
  let resizeHandler;
  let posterCleanups = [];
  let posterFloatTl;

  function init() {
    if (typeof gsap === 'undefined') return;
    initParticles();

    const hero = document.getElementById('hero');
    if (hero) {
      observer = new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
      }, { threshold: 0 });
      observer.observe(hero);
    }
  }

  function animateIn() {
    if (typeof gsap === 'undefined') return;
    const reducedMotion = Helpers.isReducedMotion();

    const eyebrow = document.querySelector('.hero__eyebrow');
    const nameLines = document.querySelectorAll('.hero__name-line');
    const role = document.querySelector('.hero__role');
    const desc = document.querySelector('.hero__desc');
    const actions = document.querySelector('.hero__actions');
    const poster = document.querySelector('.poster');
    const scrollCue = document.querySelector('.hero__scroll-cue');

    if (reducedMotion) {
      gsap.set([eyebrow, nameLines[0], nameLines[1], role, desc, actions], {
        opacity: 1, y: 0, filter: 'blur(0px)',
      });
      gsap.set(poster, {
        opacity: 1, x: '0%', scale: 1, rotateY: 0, filter: 'blur(0px)',
      });
      gsap.set(scrollCue, { opacity: 1 });
      Typing.start();
      initPosterFloat();
      initPosterInteract();
      return;
    }

    const DUR = 1.3;
    const STAGGER = 0.12;
    const EASE = 'power3.out';

    const tl = gsap.timeline({
      defaults: { ease: EASE },
      onComplete: () => {
        initPosterFloat();
        initPosterInteract();
      }
    });

    /* --- Set initial states --- */
    /* Text: enters from the BOTTOM */
    gsap.set([eyebrow, nameLines[0], nameLines[1], role, desc, actions], {
      opacity: 0,
      y: 60,
      filter: 'blur(10px)',
    });

    /* Poster: enters from the RIGHT with slight scale */
    gsap.set(poster, {
      opacity: 0,
      x: 140,
      scale: 0.95,
      filter: 'blur(12px)',
    });

    gsap.set(scrollCue, { opacity: 0 });

    /* --- Poster: slides in from right with scale --- */
    tl.to(poster, {
      x: 0,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      duration: DUR * 1.1,
    }, 0);

    /* --- Text cascade: rises from bottom, staggered --- */
    tl.to(eyebrow, {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: DUR,
    }, 0.15);

    tl.to(nameLines[0], {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: DUR,
    }, 0.15 + STAGGER);

    tl.to(nameLines[1], {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: DUR,
    }, 0.15 + STAGGER * 2);

    tl.to(role, {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: DUR,
    }, 0.15 + STAGGER * 3);

    tl.to(desc, {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: DUR,
    }, 0.15 + STAGGER * 4);

    tl.to(actions, {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: DUR,
    }, 0.15 + STAGGER * 5);

    /* --- Scroll Cue --- */
    tl.to(scrollCue, {
      opacity: 1,
      duration: 1.2,
      ease: 'power2.inOut',
    }, 1.2);

    /* --- Typing: starts after everything has settled --- */
    tl.call(() => Typing.start(), null, 0.15 + STAGGER * 5 + 0.4);

    timeline = tl;
    return tl;
  }

  /* --- Float --- */
  function initPosterFloat() {
    const poster = document.querySelector('.poster');
    if (!poster) return;

    if (posterFloatTl) posterFloatTl.kill();

    posterFloatTl = gsap.timeline({ repeat: -1, yoyo: true });
    posterFloatTl
      .to(poster, {
        y: -8,
        rotation: 0.25,
        duration: 5,
        ease: 'sine.inOut',
      })
      .to(poster, {
        y: 5,
        rotation: -0.2,
        duration: 4.5,
        ease: 'sine.inOut',
      });
  }

  /* --- Poster 3D Interact --- */
  function initPosterInteract() {
    if (!Helpers.isHoverCapable()) return;

    const poster = document.querySelector('.poster');
    const paper = poster?.querySelector('.poster__paper');
    const sheen = poster?.querySelector('.poster__sheen');
    const highlight = poster?.querySelector('.poster__highlight');
    if (!poster || !paper) return;

    let ticking = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const CONFIG = {
      maxTiltX: 5,
      maxTiltY: 8,
      maxTranslateX: 8,
      maxTranslateY: 5,
      perspective: 1000,
      lerp: 0.06,
      highlightSize: 35,
    };

    function onMove(e) {
      const rect = poster.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;

      targetX = (nx - 0.5) * 2;
      targetY = (ny - 0.5) * 2;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updatePoster);
      }

      if (sheen) {
        const sheenX = (nx - 0.5) * 60;
        const sheenY = (ny - 0.5) * 40;
        gsap.to(sheen, {
          x: sheenX,
          y: sheenY,
          opacity: 0.8,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }

      if (highlight) {
        const hlX = nx * 100;
        const hlY = ny * 100;
        highlight.style.background = `radial-gradient(
          ellipse ${CONFIG.highlightSize}% ${CONFIG.highlightSize}% at ${hlX}% ${hlY}%,
          rgba(184, 122, 62, 0.1) 0%,
          transparent 70%
        )`;
      }
    }

    function updatePoster() {
      currentX += (targetX - currentX) * CONFIG.lerp;
      currentY += (targetY - currentY) * CONFIG.lerp;

      const tiltX = currentY * -CONFIG.maxTiltX;
      const tiltY = currentX * CONFIG.maxTiltY;
      const transX = currentX * CONFIG.maxTranslateX;
      const transY = currentY * CONFIG.maxTranslateY;

      const shadowX = -currentX * 20;
      const shadowY = -currentY * 15;
      const shadowBlur = 60 + Math.abs(currentX) * 20 + Math.abs(currentY) * 15;

      paper.style.transform = `
        perspective(${CONFIG.perspective}px)
        rotateX(${tiltX}deg)
        rotateY(${tiltY}deg)
        translateX(${transX}px)
        translateY(${transY}px)
      `;

      paper.style.boxShadow = `
        ${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.65),
        ${shadowX * 0.4}px ${shadowY * 0.4}px ${shadowBlur * 0.5}px rgba(0, 0, 0, 0.45),
        ${shadowX * 0.15}px ${shadowY * 0.15}px ${shadowBlur * 0.25}px rgba(0, 0, 0, 0.3)
      `;

      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        requestAnimationFrame(updatePoster);
      } else {
        ticking = false;
      }
    }

    function onLeave() {
      gsap.to(paper, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)',
        overwrite: 'auto',
        onComplete: () => {
          paper.style.transform = '';
          paper.style.boxShadow = '';
        },
      });

      gsap.to(paper, {
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 10px 25px rgba(0,0,0,0.4), 0 4px 10px rgba(0,0,0,0.3)',
        duration: 0.8,
        ease: 'power2.out',
        overwrite: false,
      });

      if (sheen) {
        gsap.to(sheen, { x: 0, y: 0, opacity: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      }

      if (highlight) {
        highlight.style.background = '';
      }

      currentX = 0;
      currentY = 0;
      targetX = 0;
      targetY = 0;
      ticking = false;
    }

    poster.addEventListener('mousemove', onMove, { passive: true });
    poster.addEventListener('mouseleave', onLeave);
    posterCleanups.push(() => {
      poster.removeEventListener('mousemove', onMove);
      poster.removeEventListener('mouseleave', onLeave);
    });
  }

  /* --- Particles --- */
  function initParticles() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const COUNT = Helpers.isMobile() ? 12 : 45;

    function resize() {
      Helpers.setupCanvas(canvas, ctx);
    }

    function create() {
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.2,
        speedX: (Math.random() - 0.5) * 0.12,
        speedY: (Math.random() - 0.5) * 0.12,
        opacity: Math.random() * 0.2 + 0.03,
        pulse: Math.random() * Math.PI * 2,
      };
    }

    resize();
    resizeHandler = resize;
    window.addEventListener('resize', resizeHandler);

    for (let i = 0; i < COUNT; i++) particles.push(create());
    particlesActive = true;

    function draw() {
      if (!particlesActive) return;
      if (!heroVisible) {
        requestAnimationFrame(draw);
        return;
      }
      requestAnimationFrame(draw);

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.008;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const alpha = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(138, 90, 60, ${alpha})`;
        ctx.fill();
      });
    }

    draw();
  }

  function destroy() {
    particlesActive = false;
    if (observer) { observer.disconnect(); observer = null; }
    if (resizeHandler) { window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
    if (timeline) { timeline.kill(); timeline = null; }
    if (posterFloatTl) { posterFloatTl.kill(); posterFloatTl = null; }
    if (typeof gsap !== 'undefined') {
      const sheen = document.querySelector('.poster__sheen');
      const paper = document.querySelector('.poster__paper');
      if (sheen) gsap.killTweensOf(sheen);
      if (paper) gsap.killTweensOf(paper);
    }
    posterCleanups.forEach(fn => fn());
    posterCleanups.length = 0;
  }

  return { init, animateIn, destroy };
})();
