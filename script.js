(function () {
  try {
    const storageKey = 'event_id';
    const existing = localStorage.getItem(storageKey);

    if (!existing || !existing.startsWith('ev_')) {
      const newEventId =
        'ev_' +
        Date.now().toString(36) +
        Math.random().toString(36).substr(2, 5);
      localStorage.setItem(storageKey, newEventId);

      console.log('%c[PIMA Tracking]', 'color: #5e60ce; font-weight: bold;', 'Novo event_id gerado →', newEventId);
    } else {
      console.log('%c[PIMA Tracking]', 'color: #5e60ce; font-weight: bold;', 'event_id já existente →', existing);
    }
  } catch (e) {
    console.warn('%c[PIMA Tracking]', 'color: #f77f00; font-weight: bold;', 'Erro ao tentar gerar event_id:', e);
  }
})();

try {
  const eventId = localStorage.getItem('event_id');
  if (eventId) {
    fetch('/cart.js')
      .then(res => res.json())
      .then(cart => {
        const attrs = cart.attributes || {};
        if (attrs.event_id === eventId) return;

        return fetch('/cart/update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attributes: { ...attrs, event_id: eventId } })
        });
      })
      .then(() => {
        console.log('[PIMA Tracking] event_id enviado ao cart!');
      });
  }
} catch (e) {
  console.warn('[PIMA Tracking] Erro ao enviar event_id ao cart:', e);
}
