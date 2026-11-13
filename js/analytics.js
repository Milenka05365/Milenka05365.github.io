const counter = 114107813;
window.ym = window.ym || function () {
  (window.ym.a ||= []).push(arguments);
};
window.ym.l = Date.now();
const tag = document.createElement('script');
tag.async = true;
tag.src = `https://mc.yandex.ru/metrika/tag.js?id=${counter}`;
document.head.append(tag);
window.ym(counter, 'init', {
  ssr: true,
  clickmap: true,
  accurateTrackBounce: true,
  trackLinks: true,
  webvisor: true,
});

function trackGoal(name) {
  window.ym(counter, 'reachGoal', name);
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  if (link.protocol === 'tel:') trackGoal('phone_click');
  const destination = new URL(link.href);
  if (destination.hash === '#test-drive' && destination.pathname === '/contacts.html') {
    trackGoal(destination.searchParams.get('request') === 'trade-in'
      ? 'trade_in_click'
      : 'test_drive_click');
  }
});
document.addEventListener('prime:request-prepared', event => {
  trackGoal(event.detail === 'trade-in' ? 'trade_in_draft' : 'test_drive_draft');
});

const vehicle = document.querySelector('[data-vehicle]')?.dataset.vehicle;
if (vehicle) {
  try {
    const key = 'prime-auto-vehicles-viewed';
    const views = new Set(JSON.parse(sessionStorage.getItem(key) || '[]'));
    const before = views.size;
    views.add(vehicle);
    sessionStorage.setItem(key, JSON.stringify([...views]));
    if (before < 3 && views.size === 3) trackGoal('view_three_cars');
  } catch {
    // The visit milestone requires session storage.
  }
}
