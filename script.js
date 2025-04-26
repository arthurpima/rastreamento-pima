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
