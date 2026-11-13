const form = document.getElementById('request-form');
const params = new URLSearchParams(location.search);
const model = params.get('model')?.trim() || '';
const selectedModel = /^[a-z0-9][a-z0-9 -]{0,59}$/i.test(model) ? model : '';
const tradeIn = params.get('request') === 'trade-in';
const modelLabel = document.getElementById('test-drive-model');
const email = document.getElementById('test-drive-email');
const recipient = email.getAttribute('href').split('?')[0];
const subject = tradeIn ? 'Оценка по trade-in' : 'Тест-драйв';
const requestType = tradeIn ? 'trade-in' : 'test-drive';

function draftLink(body) {
  const title = selectedModel && !tradeIn ? `${subject} — ${selectedModel}` : subject;
  return `${recipient}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

if (tradeIn) {
  document.getElementById('test-drive-title').textContent = 'Оценка автомобиля по trade-in';
  document.getElementById('test-drive-intro').textContent = 'Позвоните или подготовьте письмо с данными вашего автомобиля для оценки.';
  document.getElementById('request-message-label').textContent = 'Марка, модель, год выпуска и пробег';
} else if (selectedModel) {
  modelLabel.textContent = selectedModel;
  modelLabel.hidden = false;
}
const intro = tradeIn
  ? 'Здравствуйте! Хочу уточнить условия оценки автомобиля по trade-in.'
  : `Здравствуйте! Хочу записаться на тест-драйв${selectedModel ? ` ${selectedModel}` : ''}. Подскажите, когда можно приехать?`;
email.href = draftLink(intro);

const { customer, phone, message } = form.elements;
for (const input of [customer, phone]) {
  input.addEventListener('input', () => input.setCustomValidity(''));
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const name = customer.value.trim();
  const number = phone.value.trim();
  const digits = number.replace(/\D/g, '');
  customer.setCustomValidity(name ? '' : 'Укажите имя.');
  phone.setCustomValidity(/^[+\d().\s-]+$/.test(number) && digits.length >= 7 && digits.length <= 15 ? '' : 'Введите телефон с кодом города или страны.');
  if (!form.reportValidity()) return;
  const note = message.value.trim();
  const body = [intro, '', `Имя: ${name}`, `Телефон: ${number}`, note].join('\r\n');
  document.getElementById('request-status').textContent = 'Письмо подготовлено. Для отправки подтвердите его в почтовом приложении.';
  document.dispatchEvent(new CustomEvent('prime:request-prepared', { detail: requestType }));
  location.href = draftLink(body);
});
form.hidden = false;
