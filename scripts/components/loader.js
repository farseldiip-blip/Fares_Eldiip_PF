/* ================================================
   LOADER — Revolver Cylinder + Cinematic Transition
   Clean, minimal, premium loading experience.
   ================================================ */
const Loader = (() => {
  let canvas, ctx;
  let label;
  let animationId;
  let startTime;
  const DURATION = 1600;
  let resolvePromise;
  let destroyed = false;

  const CYLINDER = {
    chambers: 6,
    rotation: 0,
    spinSpeed: 0,
    friction: 0.972,
    glowPulse: 0,
  };

  function init() {
    destroyed = false;
    return new Promise((resolve) => {
      resolvePromise = resolve;
      canvas = document.getElementById('loader-canvas');
      if (!canvas) { resolve(); return; }

      ctx = canvas.getContext('2d');
      label = document.querySelector('.loader__label');

      resize();
      window.addEventListener('resize', resize);

      startTime = performance.now();
      animate();
    });
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawCylinder(cx, cy, radius) {
    ctx.save();
    ctx.translate(cx, cy);

    const ringGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    ringGrad.addColorStop(0, '#2a1d14');
    ringGrad.addColorStop(0.25, '#6b5744');
    ringGrad.addColorStop(0.5, '#c97a3c');
    ringGrad.addColorStop(0.75, '#6b5744');
    ringGrad.addColorStop(1, '#2a1d14');

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = ringGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.87, 0, Math.PI * 2);
    ctx.fillStyle = '#0c0907';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.87, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(107, 90, 72, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const rotation = CYLINDER.rotation;
    for (let i = 0; i < CYLINDER.chambers; i++) {
      const angle = (i / CYLINDER.chambers) * Math.PI * 2 + rotation - Math.PI / 2;
      const chamberX = Math.cos(angle) * radius * 0.56;
      const chamberY = Math.sin(angle) * radius * 0.56;
      const chamberR = radius * 0.19;

      ctx.beginPath();
      ctx.arc(chamberX + 1.5, chamberY + 2.5, chamberR + 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fill();

      const cGrad = ctx.createRadialGradient(
        chamberX - chamberR * 0.3, chamberY - chamberR * 0.3, 0,
        chamberX, chamberY, chamberR
      );
      cGrad.addColorStop(0, '#6b5744');
      cGrad.addColorStop(0.4, '#4a3526');
      cGrad.addColorStop(0.8, '#1e1510');
      cGrad.addColorStop(1, '#0c0907');
      ctx.beginPath();
      ctx.arc(chamberX, chamberY, chamberR, 0, Math.PI * 2);
      ctx.fillStyle = cGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(chamberX, chamberY, chamberR * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = '#050302';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(chamberX, chamberY, chamberR * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(107, 90, 72, 0.12)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(chamberX - chamberR * 0.25, chamberY - chamberR * 0.25, chamberR * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(194, 168, 120, 0.12)';
      ctx.fill();
    }

    const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.14);
    hubGrad.addColorStop(0, '#c4a87a');
    hubGrad.addColorStop(0.4, '#8b7355');
    hubGrad.addColorStop(0.8, '#6b5744');
    hubGrad.addColorStop(1, '#4a3526');
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = '#0c0907';
    ctx.fill();

    ctx.strokeStyle = 'rgba(107, 90, 72, 0.25)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < CYLINDER.chambers; i++) {
      const angle = (i / CYLINDER.chambers) * Math.PI * 2 + rotation - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * 0.17, Math.sin(angle) * radius * 0.17);
      ctx.lineTo(Math.cos(angle) * radius * 0.37, Math.sin(angle) * radius * 0.37);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.93, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139, 115, 85, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius, -0.4, 0.6);
    ctx.strokeStyle = 'rgba(194, 168, 120, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  function animate() {
    if (destroyed) return;
    const now = performance.now();
    const elapsed = now - startTime;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const progress = Math.min(elapsed / DURATION, 1);

    const spinFactor = progress < 0.7 ? 1 : Math.max(0, (1 - progress) / 0.3);
    CYLINDER.spinSpeed += spinFactor * 0.16;
    CYLINDER.spinSpeed *= CYLINDER.friction;
    CYLINDER.rotation += CYLINDER.spinSpeed;
    CYLINDER.glowPulse += 0.025;

    ctx.clearRect(0, 0, w, h);

    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.5);
    bgGrad.addColorStop(0, '#161210');
    bgGrad.addColorStop(1, '#0c0907');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const cylinderRadius = Math.min(w, h) * 0.18;

    /* Ambient glow — subtle radial bloom behind the cylinder */
    const glowIntensity = 0.06 + Math.sin(CYLINDER.glowPulse) * 0.025;
    const glow = ctx.createRadialGradient(w / 2, h / 2, cylinderRadius * 0.3, w / 2, h / 2, cylinderRadius * 2.2);
    glow.addColorStop(0, `rgba(184, 122, 62, ${glowIntensity})`);
    glow.addColorStop(0.5, `rgba(138, 90, 60, ${glowIntensity * 0.35})`);
    glow.addColorStop(1, 'rgba(12, 9, 7, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    drawCylinder(w / 2, h / 2, cylinderRadius);

    /* Vignette: cinematic edge darkening */
    const vignetteGrad = ctx.createRadialGradient(w / 2, h / 2, cylinderRadius * 1.5, w / 2, h / 2, Math.max(w, h) * 0.7);
    vignetteGrad.addColorStop(0, 'rgba(12, 9, 7, 0)');
    vignetteGrad.addColorStop(0.7, 'rgba(12, 9, 7, 0.15)');
    vignetteGrad.addColorStop(1, 'rgba(12, 9, 7, 0.5)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, w, h);

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      transitionOut();
    }
  }

  function transitionOut() {
    if (typeof gsap === 'undefined') {
      document.body.classList.remove('loading');
      if (resolvePromise) resolvePromise();
      return;
    }
    const loader = document.getElementById('loader');
    if (!loader) {
      document.body.classList.remove('loading');
      if (resolvePromise) resolvePromise();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        loader.style.display = 'none';
        document.body.classList.remove('loading');
        if (resolvePromise) resolvePromise();
      }
    });

    /* Label: slides up elegantly while fading */
    tl.to(label, {
      y: -12,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.in',
    });

    /* Canvas: scales down + fades + blurs — cinematic dissolve */
    tl.to(canvas, {
      scale: 0.85,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.8,
      ease: 'expo.in',
    }, '-=0.2');

    /* Background: final fade to black with slight scale */
    tl.to(loader, {
      opacity: 0,
      scale: 1.02,
      duration: 0.5,
      ease: 'power2.in',
    }, '-=0.4');
  }

  function destroy() {
    destroyed = true;
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
    canvas = null;
    ctx = null;
    label = null;
    resolvePromise = null;
  }

  return { init, destroy };
})();
