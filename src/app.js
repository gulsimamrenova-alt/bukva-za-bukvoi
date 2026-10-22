const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
function setMenu(open, restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('open', open);
  if (open) navigation.querySelector('a')?.focus({ preventScroll: true });
  if (restoreFocus) menuButton.focus({ preventScroll: true });
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) setMenu(false, true);
});
document.addEventListener('pointerdown', event => {
  if (navigation.classList.contains('open') && !navigation.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});
window.addEventListener('resize', () => { if (window.innerWidth > 800) setMenu(false); }, { passive: true });
function onMediaChange(query, callback) {
  if (typeof query.addEventListener === 'function') query.addEventListener('change', callback);
  else if (typeof query.addListener === 'function') query.addListener(callback);
}
const examples = {
  elements: ['01', 'и и и и и', 'л л л л л', 'Пробуем повторять элементы и замечать их форму.'],
  letters: ['02', 'а о а о а', 'м н м н м', 'Обращаем внимание на форму и размер букв.'],
  words: ['03', 'мама и я', 'мой мир', 'Пробуем оставлять понятные расстояния между словами.']
};
document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
  const [number, main, second, caption] = examples[button.dataset.example];
  document.querySelectorAll('[data-example]').forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  document.querySelector('#example-number').textContent = number;
  document.querySelector('#sample-guide').textContent = main;
  document.querySelector('#sample-main').textContent = main;
  document.querySelector('#sample-second').textContent = second;
  document.querySelector('#example-caption').textContent = caption;
}));
const dialog = document.querySelector('#demo-dialog');
function closeDemoDialog() { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); }
document.querySelector('#policy-open').addEventListener('click', () => { if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', ''); });
dialog.querySelectorAll('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', closeDemoDialog));
dialog.addEventListener('click', event => { if (event.target === dialog) {const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDemoDialog();} });

document.querySelector('#demo-form button[type=submit]').disabled = false;

// Reveal only after JS and IntersectionObserver are available. No-JS stays visible.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let revealObserver;
function showSection(section) {
  section.classList.remove('reveal-pending');
  section.classList.add('is-revealed');
  revealObserver?.unobserve(section);
}
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) showSection(entry.target); });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll('main > section, .intro-strip, .site-footer').forEach(section => {
    const bounds = section.getBoundingClientRect();
    section.classList.add('motion-reveal');
    if (bounds.top < window.innerHeight && bounds.bottom > 0) showSection(section);
    else { section.classList.add('reveal-pending'); revealObserver.observe(section); }
  });
}
document.addEventListener('focusin', event => {
  const section = event.target.closest('.reveal-pending');
  if (section) showSection(section);
});
onMediaChange(reducedMotion, event => {
  if (event.matches) {
    document.querySelectorAll('.reveal-pending').forEach(showSection);
    revealObserver?.disconnect();
  }
});

// Move decorative backgrounds only; text and interactive controls stay stationary.
const hero = document.querySelector('.hero');
const parallaxAllowed = window.matchMedia('(min-width: 801px) and (prefers-reduced-motion: no-preference)');
let parallaxFrame = 0;
function updateParallax() {
  parallaxFrame = 0;
  if (!parallaxAllowed.matches) {
    hero.style.removeProperty('--hero-drift');
    hero.style.removeProperty('--art-drift');
    return;
  }
  const bounds = hero.getBoundingClientRect();
  if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
  const drift = Math.max(-24, Math.min(36, -bounds.top * .12));
  hero.style.setProperty('--hero-drift', `${drift.toFixed(2)}px`);
  hero.style.setProperty('--art-drift', `${(drift * .5).toFixed(2)}px`);
}
function queueParallax() {
  if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateParallax);
}
window.addEventListener('scroll', queueParallax, { passive: true });
window.addEventListener('resize', queueParallax, { passive: true });
onMediaChange(parallaxAllowed, queueParallax);
queueParallax();

// Visual-only feedback. No network request, cookies or persistent storage.
const feedbackForm = document.querySelector('#demo-form');
const formFields = document.querySelector('#form-fields');
const formSuccess = document.querySelector('#form-success');
const submitButton = document.querySelector('#form-submit');
for (const field of feedbackForm.querySelectorAll('#parent-name, #message')) {
  field.addEventListener('input', () => field.setCustomValidity(field.value && !field.value.trim() ? 'Введите текст, а не только пробелы.' : ''));
}
feedbackForm.addEventListener('submit', event => {
  event.preventDefault();
  if (feedbackForm.getAttribute('aria-busy') === 'true' || !feedbackForm.reportValidity()) return;
  feedbackForm.setAttribute('aria-busy', 'true');
  submitButton.disabled = true;
  submitButton.querySelector('.submit-label').textContent = 'Готовим подтверждение…';
  window.setTimeout(() => {
    formFields.hidden = true;
    formSuccess.hidden = false;
    feedbackForm.classList.add('is-success');
    feedbackForm.setAttribute('aria-busy', 'false');
    formSuccess.focus({ preventScroll: true });
    queueBackToTop();
  }, reducedMotion.matches ? 0 : 350);
});
document.querySelector('#form-reset').addEventListener('click', () => {
  feedbackForm.reset();
  feedbackForm.querySelectorAll('input, textarea').forEach(field => field.setCustomValidity(''));
  formSuccess.hidden = true;
  formFields.hidden = false;
  feedbackForm.classList.remove('is-success');
  submitButton.disabled = false;
  submitButton.querySelector('.submit-label').textContent = 'Отправить';
  document.querySelector('#parent-name').focus({ preventScroll: true });
});

// Show on scroll, hide while a form control is focused on small screens.
const backToTop = document.querySelector('#back-to-top');
let backToTopFrame = 0;
function updateBackToTop() {
  backToTopFrame = 0;
  const formFocused = window.innerWidth <= 800 && feedbackForm.contains(document.activeElement);
  backToTop.hidden = window.scrollY < 550 || formFocused || dialog.hasAttribute('open');
}
function queueBackToTop() {
  if (!backToTopFrame) backToTopFrame = window.requestAnimationFrame(updateBackToTop);
}
window.addEventListener('scroll', queueBackToTop, { passive: true });
window.addEventListener('resize', queueBackToTop, { passive: true });
document.addEventListener('focusin', queueBackToTop);
document.addEventListener('focusout', queueBackToTop);
dialog.addEventListener('close', queueBackToTop);
document.querySelector('#policy-open').addEventListener('click', queueBackToTop);
backToTop.addEventListener('click', () => {
  document.querySelector('#page-title').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
});
queueBackToTop();

// Count only verifiable numbers in this demonstration, once when visible.
const counters = [...document.querySelectorAll('[data-counter]')];
const counterFrames = new Map();
function finishCounter(counter) {
  const frame = counterFrames.get(counter);
  if (frame) window.cancelAnimationFrame(frame);
  counterFrames.delete(counter);
  counter.textContent = counter.dataset.counter;
  counter.dataset.counted = 'true';
}
function animateCounter(counter) {
  if (counter.dataset.counted) return;
  counter.dataset.counted = 'true';
  const target = Number(counter.dataset.counter);
  const start = performance.now();
  counter.textContent = '0';
  function tick(now) {
    const progress = Math.min(1, (now - start) / 1100);
    counter.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
    if (progress < 1 && !reducedMotion.matches) counterFrames.set(counter, requestAnimationFrame(tick));
    else finishCounter(counter);
  }
  counterFrames.set(counter, requestAnimationFrame(tick));
}
let counterObserver;
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  }), { threshold: .5 });
  counters.forEach(counter => counterObserver.observe(counter));
}
onMediaChange(reducedMotion, event => {
  if (event.matches) {
    counterObserver?.disconnect();
    counters.forEach(finishCounter);
  }
});
const downloadLink = document.querySelector('.download-link');
if (window.location.protocol === 'file:') downloadLink.hidden = true;
else if (/^https?:$/.test(window.location.protocol)) downloadLink.href = new URL('/download/index.html', window.location.origin).href;
