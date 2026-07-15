/* ================================================
   SMOOTH SCROLL — Lenis wrapper
   ================================================ */
const SmoothScroll = (() => {
  let lenis;
  let tickerCallback;

  function init() {
    if (typeof Lenis === 'undefined') return;
    const isMobile = Helpers.isMobile();
    lenis = new Lenis({
      duration: isMobile ? 1.0 : 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: isMobile ? 1.1 : 0.9,
      touchMultiplier: 1.5,
    });

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    if (typeof gsap !== 'undefined') {
      tickerCallback = (time) => { lenis.raf(time * 1000); };
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }
  }

  function scrollTo(target, options = {}) {
    if (lenis) lenis.scrollTo(target, options);
  }

  function stop() {
    if (lenis) lenis.stop();
  }

  function start() {
    if (lenis) lenis.start();
  }

  function destroy() {
    if (typeof gsap !== 'undefined' && tickerCallback) {
      gsap.ticker.remove(tickerCallback);
      tickerCallback = null;
    }
    if (lenis) { lenis.destroy(); lenis = null; }
  }

  return { init, scrollTo, stop, start, destroy };
})();
