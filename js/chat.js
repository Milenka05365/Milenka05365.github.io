const widget = document.querySelector('.auto-chat');
const panel = document.getElementById('chat-panel');
const toggle = document.getElementById('chat-toggle');
const offer = document.getElementById('chat-offer');
const title = document.getElementById('chat-title');
const answer = document.getElementById('chat-answer');
const next = document.getElementById('chat-next');
const seenKey = 'prime-auto-chat-seen';
const topics = {
  catalog: ['В каталоге можно выбрать марку, тип автомобиля и бюджет, а затем сравнить до трёх моделей.', 'Перейти в каталог', 'catalog.html'],
  'test-drive': ['Чтобы согласовать модель и время визита, позвоните в салон или подготовьте письмо.', 'Записаться на тест-драйв', 'contacts.html#test-drive'],
  'trade-in': ['Для предварительной оценки укажите марку, модель, год выпуска и пробег вашего автомобиля.', 'Запросить оценку', 'contacts.html?request=trade-in#test-drive'],
  financing: ['Введите стоимость, первоначальный взнос, срок и ставку из предложения банка.', 'Открыть калькулятор', 'services.html#credit-calculator'],
};

function rememberOffer() {
  try {
    sessionStorage.setItem(seenKey, '1');
  } catch {
    // The offer can still be closed when browser storage is unavailable.
  }
}

function hideOffer() {
  window.clearTimeout(offerTimer);
  offer.hidden = true;
  rememberOffer();
}

function setPanel(open) {
  hideOffer();
  panel.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  (open ? title : toggle).focus();
}

let alreadySeen = false;
try {
  alreadySeen = sessionStorage.getItem(seenKey) === '1';
} catch {
  // Browser storage is optional.
}
const offerTimer = alreadySeen ? null : window.setTimeout(() => {
  rememberOffer();
  offer.hidden = false;
}, 30000);

toggle.addEventListener('click', () => setPanel(panel.hidden));
document.getElementById('chat-open').addEventListener('click', () => setPanel(true));
document.getElementById('chat-dismiss').addEventListener('click', () => {
  hideOffer();
  toggle.focus();
});
document.getElementById('chat-close').addEventListener('click', () => setPanel(false));
widget.addEventListener('keydown', event => {
  if (event.key === 'Escape' && (!panel.hidden || !offer.hidden)) {
    event.stopPropagation();
    setPanel(false);
  }
});
panel.addEventListener('click', event => {
  const button = event.target.closest('[data-chat-topic]');
  if (!button) return;
  const [text, label, href] = topics[button.dataset.chatTopic];
  answer.textContent = text;
  next.textContent = label;
  next.href = href;
  next.hidden = false;
});
widget.hidden = false;
