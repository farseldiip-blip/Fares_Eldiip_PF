/* ================================================
   NAVBAR — Hide on scroll down, show on scroll up
   Active section tracking, mobile menu, smooth scroll
   ================================================ */
const Navbar = (() => {
  let nav, burger, mobileMenu, links;
  let isOpen = false;
  const cleanups = [];

  const SCROLL_SHOW_THRESHOLD = 80;
  const SCROLL_OFFSET = -72;

  let cachedSections = null;
  let rafPending = false;

  function init() {
    nav = document.getElementById('navbar');
    burger = document.querySelector('.nav__burger');
    mobileMenu = document.getElementById('mobile-menu');
    links = document.querySelectorAll('.nav__link');
    if (!nav) return;

    cachedSections = document.querySelectorAll('section[id]');

    if (burger) {
      const onBurgerClick = () => toggleMenu();
      burger.addEventListener('click', onBurgerClick);
      cleanups.push(() => burger.removeEventListener('click', onBurgerClick));
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      if (link.classList.contains('skip-link')) return;
      const onClick = (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          SmoothScroll.scrollTo(href, { offset: SCROLL_OFFSET });
          if (isOpen) closeMenu();
        }
      };
      link.addEventListener('click', onClick);
      cleanups.push(() => link.removeEventListener('click', onClick));
    });

    document.querySelectorAll('.mobile-menu__link').forEach(link => {
      const onClick = () => closeMenu();
      link.addEventListener('click', onClick);
      cleanups.push(() => link.removeEventListener('click', onClick));
    });

    const onScroll = () => onScrollHandler();
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', onScroll));
  }

  function onScrollHandler() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      updateActiveLink();
    });
  }

  function updateActiveLink() {
    const sections = cachedSections || document.querySelectorAll('section[id]');
    let current = '';

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= SCROLL_SHOW_THRESHOLD) {
        current = section.id;
      }
    });

    links.forEach(link => {
      link.classList.toggle('nav__link--active', link.dataset.section === current);
    });
  }

  function toggleMenu() {
    isOpen = !isOpen;
    burger.classList.toggle('nav__burger--open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('mobile-menu--open', isOpen);
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    burger?.classList.remove('nav__burger--open');
    burger?.setAttribute('aria-expanded', 'false');
    mobileMenu?.classList.remove('mobile-menu--open');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function destroy() {
    closeMenu();
    cleanups.forEach(fn => fn());
    cleanups.length = 0;
  }

  return { init, closeMenu, destroy };
})();
