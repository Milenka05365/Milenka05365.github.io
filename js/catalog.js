const catalog = document.getElementById('catalog-filters');
const grid = document.querySelector('.catalog .catalog__grid');
const { q: search, brand, max: budget, sort } = catalog.elements;
const count = document.getElementById('catalog-count');
const empty = document.getElementById('catalog-empty');
const types = Array.from(catalog.querySelectorAll('[data-filter]'));
const cars = Array.from(grid.querySelectorAll('.car'), card => ({
  card,
  name: card.querySelector('h3').textContent.trim(),
  brand: card.dataset.brand,
  price: Number(card.dataset.price),
  compare: card.querySelector('[data-compare]'),
}));
let category = 'all';

function normalizeQuery(value) {
  return value.toLocaleLowerCase('ru').replaceAll('ё', 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

for (const name of [...new Set(cars.map(car => car.brand))].sort()) {
  brand.add(new Option(name, name));
}

function readFilters() {
  const params = new URLSearchParams(location.search);
  const type = params.get('type');
  const max = params.get('max') || '';
  category = types.some(button => button.dataset.filter === type) ? type : 'all';
  search.value = params.get('q') || '';
  brand.value = params.get('brand') || '';
  sort.value = params.get('sort') || '';
  budget.value = /^\d{1,12}$/.test(max) ? max : '';
}

function updateResults(save = true) {
  const words = normalizeQuery(search.value).split(' ');
  const max = budget.value.replace(/\D/g, '').slice(0, 12);
  const ordered = [...cars];
  if (sort.value === 'price-asc') ordered.sort((a, b) => a.price - b.price);
  if (sort.value === 'price-desc') ordered.sort((a, b) => b.price - a.price);

  let shown = 0;
  for (const { card, name, brand: maker, price } of ordered) {
    const terms = normalizeQuery(`${name} ${maker} ${card.dataset.search}`);
    const compactTerms = terms.replaceAll(' ', '');
    card.hidden = (category !== 'all' && category !== card.dataset.category)
      || (brand.value && brand.value !== maker)
      || (max !== '' && price > Number(max))
      || !words.every(word => terms.includes(word) || compactTerms.includes(word));
    if (!card.hidden) shown += 1;
  }
  if (ordered.some(({ card }, index) => grid.children[index] !== card)) {
    grid.append(...ordered.map(car => car.card));
  }
  for (const button of types) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  }
  count.textContent = `Найдено: ${shown} из ${cars.length}`;
  empty.hidden = shown > 0;

  if (save) {
    const url = new URL(location.href);
    const filters = { q: search.value.trim(), brand: brand.value, type: category === 'all' ? '' : category, max, sort: sort.value };
    for (const [name, value] of Object.entries(filters)) {
      if (value) url.searchParams.set(name, value);
      else url.searchParams.delete(name);
    }
    history.replaceState(null, '', url);
  }
}

for (const button of types) {
  button.addEventListener('click', () => {
    category = button.dataset.filter;
    updateResults();
  });
}
search.addEventListener('input', () => updateResults());
budget.addEventListener('input', () => {
  const digits = budget.value.replace(/\D/g, '').slice(0, 12);
  if (/[^\d\s]/.test(budget.value)) budget.value = digits;
  updateResults();
});
budget.addEventListener('blur', () => {
  const digits = budget.value.replace(/\D/g, '').slice(0, 12);
  if (digits) budget.value = Number(digits).toLocaleString('ru-RU');
});
brand.addEventListener('change', () => updateResults());
sort.addEventListener('change', () => updateResults());
catalog.addEventListener('submit', event => event.preventDefault());
catalog.addEventListener('reset', event => {
  event.preventDefault();
  category = 'all';
  for (const input of [search, brand, budget, sort]) input.value = '';
  updateResults();
  search.focus();
});
window.addEventListener('popstate', () => {
  readFilters();
  updateResults(false);
});
readFilters();
updateResults(false);
catalog.hidden = false;

const compareBar = document.getElementById('compare-bar');
const compareSelection = document.getElementById('compare-selection');
const compareOpen = document.getElementById('compare-open');
const compareClear = document.getElementById('compare-clear');
const compareStatus = document.getElementById('compare-status');
const compareDialog = document.getElementById('compare-dialog');
const compareTable = compareDialog.querySelector('.compare-dialog__table');
const selected = new Set();
const compareLimit = 3;

function showSelection() {
  for (const car of cars) car.compare.checked = selected.has(car);
  compareBar.hidden = selected.size === 0;
  compareOpen.disabled = selected.size < 2;
  compareSelection.textContent = selected.size
    ? `${selected.size} из ${compareLimit} · ${Array.from(selected, car => car.name).join(', ')}`
    : '';
  compareStatus.textContent = selected.size === 1
    ? 'Выберите ещё один автомобиль для сравнения.'
    : `Выбрано автомобилей: ${selected.size}.`;
}

for (const car of cars) {
  car.compare.closest('label').hidden = false;
  car.compare.addEventListener('change', () => {
    if (!car.compare.checked) selected.delete(car);
    else if (selected.size < compareLimit) selected.add(car);
    else {
      car.compare.checked = false;
      const limitMessage = 'Можно сравнить до трёх автомобилей. Снимите одну отметку.';
      compareSelection.textContent = limitMessage;
      compareStatus.textContent = limitMessage;
      return;
    }
    showSelection();
  });
}
compareClear.addEventListener('click', () => {
  selected.clear();
  showSelection();
  search.focus();
});
compareOpen.addEventListener('click', () => {
  const entries = Array.from(selected, car => {
    const facts = new Map([['Цена', car.card.querySelector('.car__price').textContent]]);
    for (const row of car.card.querySelectorAll('.car__facts div')) {
      facts.set(row.querySelector('dt').textContent, row.querySelector('dd').textContent);
    }
    return { car, facts };
  });
  const table = document.createElement('table');
  const heading = table.createTHead().insertRow();
  for (const name of ['Характеристика', ...entries.map(entry => entry.car.name)]) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = name;
    heading.append(cell);
  }
  const body = table.createTBody();
  const labels = new Set(entries.flatMap(entry => Array.from(entry.facts.keys())));
  for (const label of labels) {
    const row = body.insertRow();
    const cell = document.createElement('th');
    cell.scope = 'row';
    cell.textContent = label;
    row.append(cell);
    for (const { facts } of entries) row.insertCell().textContent = facts.get(label) || '—';
  }
  compareTable.replaceChildren(table);
  compareDialog.showModal();
});
showSelection();
