/* ================================================
   TYPING — Natural typing + deleting animation
   ================================================ */
const Typing = (() => {
  const texts = [
    'Front-End Developer',
    'Creative Web Developer',
    'UI Engineer',
    'Interactive Experience Designer',
    'JavaScript Developer',
  ];

  let target;
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timeout;
  let started = false;

  const TYPE_SPEED = 85;
  const DELETE_SPEED = 45;
  const PAUSE_AFTER_TYPE = 2200;
  const PAUSE_AFTER_DELETE = 350;

  function init() {
    target = document.getElementById('typing-target');
  }

  function start() {
    if (started || !target) return;
    started = true;
    type();
  }

  function type() {
    const currentText = texts[textIndex];

    if (!isDeleting) {
      charIndex++;
      target.textContent = currentText.substring(0, charIndex);

      if (charIndex === currentText.length) {
        isDeleting = true;
        timeout = setTimeout(type, PAUSE_AFTER_TYPE);
        return;
      }
      const variance = Math.random() * 40 - 20;
      timeout = setTimeout(type, TYPE_SPEED + variance);
    } else {
      charIndex--;
      target.textContent = currentText.substring(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        timeout = setTimeout(type, PAUSE_AFTER_DELETE);
        return;
      }
      const variance = Math.random() * 20 - 10;
      timeout = setTimeout(type, DELETE_SPEED + variance);
    }
  }

  function destroy() {
    clearTimeout(timeout);
    started = false;
    charIndex = 0;
    textIndex = 0;
    isDeleting = false;
  }

  return { init, start, destroy };
})();
