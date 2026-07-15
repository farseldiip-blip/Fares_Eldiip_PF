/* ================================================
   MAGNETIC — GSAP magnetic hover on .magnetic elements
   ================================================ */
const Magnetic = (() => {
  let active = false;
  const cleanups = [];

  function init() {
    if (!Helpers.isHoverCapable()) return;
    if (typeof gsap === 'undefined') return;
    active = true;

    document.querySelectorAll('.magnetic').forEach(el => {
      const onMove = (e) => {
        if (!active) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      const onLeave = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.4)',
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
