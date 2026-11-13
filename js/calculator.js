const form = document.getElementById('credit-form');
const { price, deposit, months, rate } = form.elements;
const output = document.getElementById('credit-result');
const vehiclePrice = Number(new URLSearchParams(location.search).get('price'));
const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

if (Number.isInteger(vehiclePrice) && vehiclePrice >= Number(price.min) && vehiclePrice <= Number(price.max)) {
  price.value = vehiclePrice;
}

function clearResult() {
  output.textContent = '';
  deposit.setCustomValidity('');
}

form.addEventListener('input', clearResult);
form.addEventListener('submit', event => {
  event.preventDefault();
  clearResult();
  const principal = price.valueAsNumber - deposit.valueAsNumber;
  if (principal < 0) {
    deposit.setCustomValidity('Взнос не может превышать стоимость автомобиля.');
    deposit.reportValidity();
    return;
  }

  const term = months.valueAsNumber;
  const monthlyRate = rate.valueAsNumber / 1200;
  const payment = monthlyRate ? principal * monthlyRate / -Math.expm1(-term * Math.log1p(monthlyRate)) : principal / term;
  output.textContent = `${currency.format(payment)} в месяц · выплаты по кредиту ${currency.format(payment * term)}`;
});
form.hidden = false;
