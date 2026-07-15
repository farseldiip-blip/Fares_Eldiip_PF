/* ================================================
   CARD ANIMATIONS — 3D tilt on hover (certs + stats)
   ================================================ */
const CardAnim = (() => {
  let active = false;
  const cleanups = [];

  function init() {
    if (!Helpers.isHoverCapable()) return;
    if (typeof gsap === 'undefined') return;
    active = true;

    initTilt('.cert', { maxRotX: 4, maxRotY: 6, perspective: 600, leaveEase: 'power2.out', leaveDur: 0.7 });
    initTilt('.stat', { maxRotX: 3, maxRotY: 4, perspective: 600, leaveEase: 'power2.out', leaveDur: 0.6 });
  }

  function initTilt(selector, opts) {
    document.querySelectorAll(selector).forEach(el => {
      const onMove = (e) => {
        if (!active) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(el, {
          rotateY: x * opts.maxRotY,
          rotateX: -y * opts.maxRotX,
          transformPerspective: opts.perspective,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      const onLeave = () => {
        gsap.to(el, {
          rotateY: 0,
          rotateX: 0,
          duration: opts.leaveDur,
          ease: opts.leaveEase,
          overwrite: 'auto',
        });
      };

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
        gsap.killTweensOf(el);
      });
    });
  }

  function destroy() {
    active = false;
    cleanups.forEach(fn => fn());
    cleanups.length = 0;
  }

  return { init, destroy };
})();
