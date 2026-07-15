/* ================================================
   EMBERS BG — Ambient campfire/desert-night
   Interactive canvas with embers + dust motes.
   Self-contained, no dependencies beyond vanilla JS.
   ================================================ */
const EmbersBg = (() => {
  let canvas, ctx;
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let rafId = null;
  let paused = false;
  let reduceMotion = false;
  let W, H;
  const cleanups = [];

  /* --- Config --- */
  const CFG = {
    maxParticles: 60,
    emberCount: 35,
    dustCount: 25,
    interactionRadius: 120,
    interactionForce: 0.4,
    // Ember colors (warm brass/orange/amber)
    emberColors: [
      [201, 161, 92],   // #C9A15C
      [184, 122, 62],   // #B87A3E
      [212, 168, 75],   // #D4A84B
      [168, 100, 40],   // #A86428
      [230, 180, 90],   // #E6B45A
    ],
    // Dust colors (dim, cool-warm)
    dustColors: [
      [109, 94, 74],    // #6D5E4A
      [130, 110, 85],   // #826E55
      [90, 78, 62],     // #5A4E3E
    ],
  };

  function init() {
    if (window.innerWidth < 768) return;

    canvas = document.getElementById('embers-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    reduceMotion = Helpers.isReducedMotion();

    resize();
    spawnInitial();
    bindEvents();
    tick();
  }

  /* -----------------------------------------------
     RESIZE — Keep canvas viewport-filling (DPR-aware)
     ----------------------------------------------- */
  function resize() {
    Helpers.setupCanvas(canvas, ctx);
    W = window.innerWidth;
    H = window.innerHeight;
  }

  /* -----------------------------------------------
     SPAWN — Create initial particles
     ----------------------------------------------- */
  function spawnInitial() {
    particles = [];
    for (let i = 0; i < CFG.emberCount; i++) {
      particles.push(createEmber(true));
    }
    for (let i = 0; i < CFG.dustCount; i++) {
      particles.push(createDust(true));
    }
  }

  function createEmber(scattered) {
    const color = CFG.emberColors[Math.floor(Math.random() * CFG.emberColors.length)];
    return {
      type: 'ember',
      x: Math.random() * W,
      y: scattered ? Math.random() * H : H + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.15 + Math.random() * 0.4),
      size: 1.2 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.4,
      maxAlpha: 0.3 + Math.random() * 0.4,
      color: color,
      life: 0,
      maxLife: 300 + Math.random() * 400,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      wobbleAmp: 0.3 + Math.random() * 0.6,
      glowSize: 4 + Math.random() * 6,
    };
  }

  function createDust(scattered) {
    const color = CFG.dustColors[Math.floor(Math.random() * CFG.dustColors.length)];
    return {
      type: 'dust',
      x: Math.random() * W,
      y: scattered ? Math.random() * H : H + Math.random() * 20,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(0.05 + Math.random() * 0.15),
      size: 0.8 + Math.random() * 1.5,
      alpha: 0.08 + Math.random() * 0.12,
      maxAlpha: 0.08 + Math.random() * 0.12,
      color: color,
      life: 0,
      maxLife: 500 + Math.random() * 500,
      wobbleSpeed: 0.005 + Math.random() * 0.01,
      wobbleAmp: 0.15 + Math.random() * 0.3,
      glowSize: 0,
    };
  }

  /* -----------------------------------------------
     EVENTS
     ----------------------------------------------- */
  function bindEvents() {
    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    cleanups.push(() => window.removeEventListener('resize', onResize));

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    window.addEventListener('mousemove', onMouseMove);
    cleanups.push(() => window.removeEventListener('mousemove', onMouseMove));

    const onMouseLeave = () => { mouse.active = false; };
    window.addEventListener('mouseleave', onMouseLeave);
    cleanups.push(() => window.removeEventListener('mouseleave', onMouseLeave));

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    cleanups.push(() => window.removeEventListener('touchmove', onTouchMove));

    const onTouchEnd = () => { mouse.active = false; };
    window.addEventListener('touchend', onTouchEnd);
    cleanups.push(() => window.removeEventListener('touchend', onTouchEnd));

    const onVisibilityChange = () => {
      if (document.hidden) {
        paused = true;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      } else {
        paused = false;
        if (!rafId) tick();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    cleanups.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));
  }

  /* -----------------------------------------------
     TICK — Main animation loop
     ----------------------------------------------- */
  function tick() {
    if (paused) return;

    ctx.clearRect(0, 0, W, H);

    // Update & draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      updateParticle(p);
      drawParticle(p);

      // Recycle dead particles
      if (p.life >= p.maxLife || p.y < -20 || p.alpha <= 0) {
        if (p.type === 'ember') {
          particles[i] = createEmber(false);
        } else {
          particles[i] = createDust(false);
        }
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  /* -----------------------------------------------
     UPDATE — Physics + mouse interaction
     ----------------------------------------------- */
  function updateParticle(p) {
    const speedMult = reduceMotion ? 0.15 : 1;

    p.life++;

    // Wobble (sinusoidal drift)
    p.x += (p.vx + Math.sin(p.life * p.wobbleSpeed) * p.wobbleAmp) * speedMult;
    p.y += p.vy * speedMult;

    // Mouse interaction — push particles away
    if (mouse.active && p.type === 'ember') {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CFG.interactionRadius && dist > 0) {
        const force = (1 - dist / CFG.interactionRadius) * CFG.interactionForce;
        p.x += (dx / dist) * force * 3;
        p.y += (dy / dist) * force * 2;
      }
    }

    // Fade in at start, fade out at end
    const lifeRatio = p.life / p.maxLife;
    if (lifeRatio < 0.1) {
      p.alpha = p.maxAlpha * (lifeRatio / 0.1);
    } else if (lifeRatio > 0.7) {
      p.alpha = p.maxAlpha * (1 - (lifeRatio - 0.7) / 0.3);
    } else {
      p.alpha = p.maxAlpha;
    }
  }

  /* -----------------------------------------------
     DRAW — Render single particle
     ----------------------------------------------- */
  function drawParticle(p) {
    if (p.alpha <= 0) return;

    const [r, g, b] = p.color;

    // Glow layer for embers
    if (p.type === 'ember' && p.glowSize > 0) {
      const glowAlpha = p.alpha * 0.25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.glowSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${glowAlpha})`;
      ctx.fill();
    }

    // Core particle
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
    ctx.fill();
  }

  /* -----------------------------------------------
     CLEANUP
     ----------------------------------------------- */
  function destroy() {
    paused = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    cleanups.forEach(fn => fn());
    cleanups.length = 0;
    particles = [];
  }

  return { init, destroy };
})();
