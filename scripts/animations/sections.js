/* ================================================
   SECTION ANIMATIONS — GSAP ScrollTrigger reveals,
   section-specific choreography, animated counters,
   parallax depth. All GPU-accelerated, 60fps.
   ================================================ */
const SectionAnim = (() => {
  const triggers = [];
  let destroyed = false;

  /* -----------------------------------------------
     CONSTANTS — Easing & timing
     ----------------------------------------------- */
  const EASE = 'expo.out';
  const EASE_SMOOTH = 'power3.out';
  const DUR = 1.2;
  const DUR_SLOW = 1.4;
  const DUR_FAST = 0.9;
  const STAGGER_FAST = 0.1;
  const STAGGER_MED = 0.14;
  const STAGGER_SLOW = 0.18;
  const TRIGGER_START = 'top 82%';

  const PARALLAX_HEAD_OFFSET = -20;
  const PARALLAX_STAT_OFFSET = -12;
  const HERO_TEXT_SPEED = 100;
  const HERO_POSTER_SPEED = 60;
  const HERO_TEXT_FADE = 0.85;
  const HERO_POSTER_FADE = 0.75;

  const isMobile = Helpers.isMobile();
  const BLUR_MOBILE = 0;
  const BLUR_DESKTOP_HEAD = 2;
  const BLUR_DESKTOP_PROJECT = 3;
  const BLUR_DESKTOP_ABOUT = 2;
  const BLUR_DESKTOP_CONTACT = 1.5;

  function init() {
    if (destroyed) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      fallbackReveal();
      return;
    }

    initSectionHeads();
    initProjectReveal();
    initSkillsReveal();
    initCertificatesReveal();
    initAboutReveal();
    initContactReveal();
    initCounters();
    initParallaxElements();
    initHeroParallax();
  }

  /* -----------------------------------------------
     FALLBACK — If GSAP not loaded, show everything
     ----------------------------------------------- */
  function fallbackReveal() {
    document.querySelectorAll(
      '[data-reveal-slide-left],[data-reveal-slide-right],' +
      '[data-reveal-fade-up],[data-reveal-project],' +
      '[data-reveal-paper],[data-reveal-soft],[data-reveal-head]'
    ).forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
    });
    document.querySelectorAll('.section__rule').forEach(el => {
      el.style.transform = 'scaleX(1)';
    });
    document.querySelectorAll('.section__idx').forEach(el => {
      el.style.opacity = '0.55';
      el.style.transform = 'none';
    });
  }

  /* -----------------------------------------------
     SECTION HEADERS — Choreographed entrance:
     index slides in → title rises with blur → rule draws
     ----------------------------------------------- */
  function initSectionHeads() {
    document.querySelectorAll('.section__head').forEach(head => {
      const idx = head.querySelector('.section__idx');
      const title = head.querySelector('.section__title');
      const rule = head.querySelector('.section__rule');

      /* Children get their own hidden states via GSAP.
         Parent stays hidden by CSS [data-reveal-head] until timeline fires. */
      if (idx) gsap.set(idx, { opacity: 0, x: -20 });
      if (title) gsap.set(title, { opacity: 0, y: 25, filter: isMobile ? 'none' : `blur(${BLUR_DESKTOP_HEAD}px)` });
      if (rule) gsap.set(rule, { scaleX: 0, transformOrigin: 'center' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: head,
          start: TRIGGER_START,
          once: true,
        },
      });

      /* First beat: make parent visible instantly (clears CSS opacity:0).
         Then stagger the children in. */
      tl.set(head, { opacity: 1, y: 0, filter: 'none' }, 0);
      if (idx) tl.to(idx, { opacity: 0.55, x: 0, duration: DUR_FAST, ease: EASE }, 0.02);
      if (title) tl.to(title, { opacity: 1, y: 0, filter: 'blur(0px)', duration: DUR, ease: EASE }, 0.14);
      if (rule) tl.to(rule, { scaleX: 1, duration: 0.9, ease: 'expo.inOut' }, 0.32);

      triggers.push(tl);
    });
  }

  /* -----------------------------------------------
     PROJECTS — Carousel header: perspective entrance
     ----------------------------------------------- */
  function initProjectReveal() {
    const header = document.querySelector('.carousel__header');
    if (!header) return;

    const eyebrow = header.querySelector('.carousel__eyebrow');
    const title = header.querySelector('.carousel__title');
    const counter = header.querySelector('.carousel__counter');
    const progress = header.querySelector('.carousel__progress');

    gsap.set(header, { opacity: 0, y: 30, rotateX: isMobile ? 0 : 5, transformPerspective: 800, filter: isMobile ? 'none' : `blur(${BLUR_DESKTOP_PROJECT}px)` });
    if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: -10 });
    if (title) gsap.set(title, { opacity: 0, y: 20, rotateX: isMobile ? 0 : 5, transformPerspective: 800 });
    if (counter) gsap.set(counter, { opacity: 0, x: 10 });
    if (progress) gsap.set(progress, { opacity: 0, scaleX: 0, transformOrigin: 'left' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: TRIGGER_START,
        once: true,
      },
    });

    tl.to(header, { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', duration: DUR, ease: EASE }, 0);
    if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: DUR_FAST, ease: EASE }, 0.2);
    if (title) tl.to(title, { opacity: 1, y: 0, rotateX: 0, transformPerspective: 800, duration: DUR_SLOW, ease: EASE }, 0.35);
    if (counter) tl.to(counter, { opacity: 1, x: 0, duration: DUR_FAST, ease: EASE }, 0.6);
    if (progress) tl.to(progress, { opacity: 1, scaleX: 1, duration: 0.8, ease: 'expo.inOut' }, 0.7);

    triggers.push(tl);
  }

  /* -----------------------------------------------
     SKILLS — Header reveals, marquee is CSS-driven
     ----------------------------------------------- */
  function initSkillsReveal() {
    const head = document.querySelector('#skills .section__head');
    if (!head) return;

    // The head is handled by initSectionHeads.
    // We just need to reveal the marquee container with a fade.
    const marquee = document.querySelector('#skills .marquee');
    if (marquee) {
      gsap.set(marquee, { opacity: 0, y: 20 });
      const st = ScrollTrigger.create({
        trigger: marquee,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(marquee, { opacity: 1, y: 0, duration: DUR, ease: EASE });
        },
      });
      triggers.push(st);
    }
  }

  /* -----------------------------------------------
     CERTIFICATES — Paper placement with stagger
     Each card enters like being placed on a table:
     fade + translateY + scale + rotation settle
     ----------------------------------------------- */
  function initCertificatesReveal() {
    const cards = document.querySelectorAll('#certificates .cert');
    if (cards.length === 0) return;

    const rotations = [-2, 1.5, -1, 2, -1.5, 0.8, -0.5, 1.2];

    cards.forEach((card, i) => {
      gsap.set(card, {
        opacity: 0,
        y: 50,
        scale: 0.94,
        rotate: rotations[i % rotations.length],
        filter: isMobile ? 'none' : 'blur(3px)',
      });

      const st = ScrollTrigger.create({
        trigger: card,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            filter: 'blur(0px)',
            duration: DUR,
            ease: EASE,
            delay: i * STAGGER_MED,
          });
        },
      });
      triggers.push(st);
    });
  }

  /* -----------------------------------------------
     ABOUT — Journal slides from left with perspective,
     stats stagger from right
     ----------------------------------------------- */
  function initAboutReveal() {
    const journal = document.querySelector('.about__journal');
    const stats = document.querySelectorAll('.about__stats .stat');

    if (journal) {
      gsap.set(journal, {
        opacity: 0,
        x: isMobile ? -30 : -60,
        rotateY: isMobile ? 0 : 4,
        transformPerspective: 800,
        filter: isMobile ? 'none' : `blur(${BLUR_DESKTOP_ABOUT}px)`,
      });

      const st = ScrollTrigger.create({
        trigger: journal,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to(journal, {
            opacity: 1,
            x: 0,
            rotateY: 0,
            transformPerspective: 800,
            filter: 'blur(0px)',
            duration: DUR_SLOW,
            ease: EASE,
          });
        },
      });
      triggers.push(st);
    }

    stats.forEach((stat, i) => {
      gsap.set(stat, {
        opacity: 0,
        x: isMobile ? 25 : 50,
        filter: isMobile ? 'none' : `blur(${BLUR_DESKTOP_ABOUT}px)`,
      });

      const st = ScrollTrigger.create({
        trigger: stat,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(stat, {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            duration: DUR,
            ease: EASE,
            delay: i * STAGGER_SLOW,
          });
        },
      });
      triggers.push(st);
    });
  }

  /* -----------------------------------------------
     CONTACT — Info slides from left, form from right
     ----------------------------------------------- */
  function initContactReveal() {
    const info = document.querySelector('.contact__info');
    const form = document.querySelector('.contact__form');

    if (info) {
      gsap.set(info, {
        opacity: 0,
        x: isMobile ? -20 : -40,
        filter: isMobile ? 'none' : `blur(${BLUR_DESKTOP_CONTACT}px)`,
      });

      const st = ScrollTrigger.create({
        trigger: info,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(info, {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            duration: DUR,
            ease: EASE_SMOOTH,
          });
        },
      });
      triggers.push(st);
    }

    if (form) {
      gsap.set(form, {
        opacity: 0,
        x: isMobile ? 20 : 40,
        filter: isMobile ? 'none' : `blur(${BLUR_DESKTOP_CONTACT}px)`,
      });

      const st = ScrollTrigger.create({
        trigger: form,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(form, {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            duration: DUR,
            ease: EASE_SMOOTH,
            delay: 0.15,
          });
        },
      });
      triggers.push(st);
    }
  }

  /* -----------------------------------------------
     COUNTERS — Animated number count-up
     ----------------------------------------------- */
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => animateCounter(el, target),
      });
      triggers.push(st);
    });
  }

  function animateCounter(el, target) {
    if (typeof gsap === 'undefined') {
      el.textContent = target;
      return;
    }

    gsap.fromTo(
      { val: 0 },
      { val: target },
      {
        val: target,
        duration: 2.2,
        ease: 'power2.out',
        onUpdate: function () {
          el.textContent = Math.round(this.targets()[0].val);
        },
      }
    );
  }

  /* -----------------------------------------------
     PARALLAX — Subtle vertical scroll depth on
     section headers and stat numbers.
     ----------------------------------------------- */
  function initParallaxElements() {
    if (typeof ScrollTrigger === 'undefined') return;
    if (isMobile) return;

    document.querySelectorAll('.section__head').forEach(head => {
      const st = ScrollTrigger.create({
        trigger: head,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
        onUpdate: (self) => {
          const progress = self.progress - 0.5;
          gsap.set(head, { y: progress * PARALLAX_HEAD_OFFSET });
        },
      });
      triggers.push(st);
    });

    document.querySelectorAll('.stat__num').forEach(num => {
      const st = ScrollTrigger.create({
        trigger: num,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
        onUpdate: (self) => {
          const progress = self.progress - 0.5;
          gsap.set(num, { y: progress * PARALLAX_STAT_OFFSET });
        },
      });
      triggers.push(st);
    });
  }

  /* -----------------------------------------------
     HERO PARALLAX — Depth on scroll
     Hero content and poster move at different rates.
     ----------------------------------------------- */
  function initHeroParallax() {
    if (isMobile) return;
    const heroText = document.querySelector('.hero__text');
    const heroPoster = document.querySelector('.hero__visual');
    const heroScroll = document.querySelector('.hero__scroll-cue');
    if (!heroText || !heroPoster) return;

    const st = ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(heroText, { y: p * HERO_TEXT_SPEED, opacity: 1 - p * HERO_TEXT_FADE });
        gsap.set(heroPoster, { y: p * HERO_POSTER_SPEED, opacity: 1 - p * HERO_POSTER_FADE });
        if (heroScroll) {
          gsap.set(heroScroll, { opacity: 1 - p * 3 });
        }
      },
    });
    triggers.push(st);
  }

  /* -----------------------------------------------
     CLEANUP
     ----------------------------------------------- */
  function destroy() {
    destroyed = true;
    triggers.forEach(t => {
      if (t && typeof t.kill === 'function') t.kill();
      if (t && typeof t.destroy === 'function') t.destroy();
    });
    triggers.length = 0;
  }

  return { init, destroy };
})();
