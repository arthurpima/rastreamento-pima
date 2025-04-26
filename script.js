(function () {
  try {
    const cookieName = 'event_id';
    const storageKeyUtm = 'utm_source_last';

    // Função para ler cookie
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Função para criar cookie com expiração
    function setCookie(name, value, days) {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    // Função para obter valor de query string (utm_source ou utm_campaign)
    function getUrlParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }

    // Captura atual utm_source ou utm_campaign
    const utmSourceNow = getUrlParam('utm_source') || getUrlParam('utm_campaign');

    // Recupera a última utm salva
    const lastUtm = localStorage.getItem(storageKeyUtm);

    let eventId = getCookie(cookieName);

    if (!eventId || (utmSourceNow && utmSourceNow !== lastUtm)) {
      // Nova visita com nova utm -> gera novo event_id
      eventId = 'ev_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      setCookie(cookieName, eventId, 30); // válido por 30 dias
      console.log('[PIMA Tracking] Novo event_id gerado via UTM:', eventId);
      
      if (utmSourceNow) {
        localStorage.setItem(storageKeyUtm, utmSourceNow);
      }
    } else {
      console.log('[PIMA Tracking] event_id existente (cookie):', eventId);
    }

    // Atualiza o cart na Shopify com o event_id
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
