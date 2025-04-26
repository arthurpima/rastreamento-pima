(function () {
  try {
    const cookieName = 'event_id';

    // Função para ler um cookie
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Função para criar um cookie com expiração
    function setCookie(name, value, days) {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    // Gera ou recupera o event_id do cookie
    let eventId = getCookie(cookieName);

    if (!eventId) {
      eventId = 'ev_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      setCookie(cookieName, eventId, 30); // Cookie válido por 30 dias
      console.log('[PIMA Tracking] Novo event_id gerado (cookie):', eventId);
    } else {
      console.log('[PIMA Tracking] event_id existente (cookie):', eventId);
    }

    // Atualiza o carrinho da Shopify com o event_id (em note_attributes)
    if (eventId) {
      fetch('/cart.js')
        .then(res => res.json())
        .then(cart => {
          const currentAttributes = cart.attributes || {};
          if (currentAttributes.event_id === eventId) return; // Já atualizado

          return fetch('/cart/update.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              attributes: {
                ...currentAttributes,
                event_id: eventId
              }
            })
          });
        })
        .then(() => {
          console.log('[PIMA Tracking] event_id enviado para note_attributes.');
        })
        .catch(err => {
          console.warn('[PIMA Tracking] Erro ao enviar event_id ao cart:', err);
        });
    }

  } catch (e) {
    console.warn('[PIMA Tracking] Erro ao configurar event_id com cookie:', e);
  }
})();
