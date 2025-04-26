(function() {
  try {
    const storageKey = 'event_id';
    const existing = localStorage.getItem(storageKey);

    if (!existing || !existing.startsWith('ev_')) {
      const newEventId = 'ev_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      localStorage.setItem(storageKey, newEventId);
      console.log('[PIMA Tracking] Novo event_id gerado:', newEventId);
    } else {
      console.log('[PIMA Tracking] event_id existente:', existing);
    }
  } catch (e) {
    console.warn('[PIMA Tracking] Erro ao tentar gerar event_id:', e);
  }
})();
