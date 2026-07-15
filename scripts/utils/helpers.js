/* ================================================
   HELPERS — Shared utilities for all modules
   ================================================ */
const Helpers = (() => {

  function isHoverCapable() {
    return matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  function isReducedMotion() {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setupCanvas(canvas, ctx) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return { isHoverCapable, isReducedMotion, setupCanvas };
})();
