const header = document.getElementById('header');
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const scrollTop = document.getElementById('scrollTopBtn');

if (header && burger && nav) {
  const mobile = window.matchMedia('(max-width: 900px)');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Меню');
    nav.classList.toggle('active', open);
  }

  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') === 'false'));
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      burger.focus();
    }
  });
  mobile.addEventListener('change', () => setMenu(false));
  header.classList.add('header--interactive');
}

if (scrollTop) {
  function updateScrollButton() {
    scrollTop.classList.toggle('active', window.scrollY > 500);
  }

  window.addEventListener('scroll', updateScrollButton, { passive: true });
  updateScrollButton();
  scrollTop.addEventListener('click', () => {
    document.querySelector('.header .logo').focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  });
}
