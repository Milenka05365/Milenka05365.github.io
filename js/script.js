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

const catalog = document.querySelector('.catalog__controls');
if (catalog) {
  const grid = document.querySelector('.catalog .catalog__grid');
  const search = document.getElementById('catalog-search');
  const sort = document.getElementById('catalog-sort');
  const count = document.getElementById('catalog-count');
  const empty = document.getElementById('catalog-empty');
  const reset = document.getElementById('catalog-reset');
  const filters = Array.from(catalog.querySelectorAll('[data-filter]'));
  const cars = Array.from(grid.querySelectorAll('.car'), card => ({
    card,
    name: card.querySelector('h3').textContent.toLowerCase(),
    aliases: card.dataset.search || '',
    price: Number(card.dataset.price),
  }));
  let category = 'all';

  function updateResults() {
    const words = search.value.toLowerCase().trim().split(/\s+/);
    let shown = 0;
    for (const { card, name, aliases } of cars) {
      const matchesCategory = category === 'all' || card.dataset.category === category;
      const matchesSearch = words.every(word => name.includes(word) || aliases.includes(word));
      card.hidden = !(matchesCategory && matchesSearch);
      if (!card.hidden) shown += 1;
    }
    for (const filter of filters) {
      filter.setAttribute('aria-pressed', String(filter.dataset.filter === category));
    }
    count.textContent = shown ? `Найдено автомобилей: ${shown}` : 'Автомобили не найдены';
    empty.hidden = shown > 0;
  }

  function sortResults() {
    const ordered = [...cars];
    if (sort.value === 'price-asc') ordered.sort((a, b) => a.price - b.price);
    if (sort.value === 'price-desc') ordered.sort((a, b) => b.price - a.price);
    grid.append(...ordered.map(car => car.card));
  }

  for (const filter of filters) {
    filter.addEventListener('click', () => {
      category = filter.dataset.filter;
      updateResults();
    });
  }
  search.addEventListener('input', updateResults);
  sort.addEventListener('change', sortResults);
  reset.addEventListener('click', () => {
    category = 'all';
    search.value = '';
    sort.value = 'default';
    sortResults();
    updateResults();
    search.focus();
  });
  sortResults();
  updateResults();
  catalog.hidden = false;
}

const testDriveModel = document.getElementById('test-drive-model');
if (testDriveModel) {
  const model = new URLSearchParams(window.location.search).get('model')?.trim();
  if (model && /^[a-z0-9][a-z0-9 -]{0,59}$/i.test(model)) {
    const email = document.getElementById('test-drive-email');
    const recipient = email.getAttribute('href').split('?')[0];
    const subject = encodeURIComponent(`Тест-драйв — ${model}`);
    const body = encodeURIComponent(`Здравствуйте! Хочу записаться на тест-драйв ${model}. Подскажите, пожалуйста, когда можно приехать?`);

    testDriveModel.textContent = model;
    testDriveModel.hidden = false;
    email.href = `${recipient}?subject=${subject}&body=${body}`;
  }
}
