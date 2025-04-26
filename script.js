(function () {
  try {
    const cookieName = 'event_id';
    const storageKeyUtm = 'utm_source_last';
    const debugMode = true; // Defina como true ou false para habilitar/desabilitar logs

    function logDebug(...args) {
      if (debugMode) {
        console.log('[PIMA Tracking DEBUG]', ...args);
      }
    }

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

    // Função para deletar cookie
    function deleteCookie(name) {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    // Função para obter valor de query string (utm_source ou utm_campaign)
    function getUrlParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }

    // Captura atual utm_source ou utm_campaign
    const utmSourceNow = getUrlParam('utm_source') || getUrlParam('utm_campaign');
    const lastUtm = localStorage.getItem(storageKeyUtm);
    let eventId = getCookie(cookieName);

    // Verificação de expiração (caso o cookie não exista mais)
    if (!eventId) {
      localStorage.removeItem(storageKeyUtm);
      logDebug('Cookie expirado: limpando utm_source_last');
    }

    // Se não tiver event_id ou nova utm diferente da última -> gera novo
    if (!eventId || (utmSourceNow && utmSourceNow !== lastUtm)) {
      eventId = 'ev_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      setCookie(cookieName, eventId, 30); // Cookie válido por 30 dias
      logDebug('Novo event_id gerado:', eventId);

      if (utmSourceNow) {
        localStorage.setItem(storageKeyUtm, utmSourceNow);
        logDebug('utm_source atualizado no localStorage:', utmSourceNow);
      }
    } else {
      logDebug('Mantendo event_id existente:', eventId);
    }

    // Atualiza o cart na Shopify com o event_id
    if (eventId) {
      fetch('/cart.js')
        .then(res => res.json())
        .then(cart => {
          const currentAttributes = cart.attributes || {};
          if (currentAttributes.event_id === eventId) {
            logDebug('event_id já está no cart.');
            return;
          }

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
          logDebug('event_id enviado para note_attributes com sucesso!');
        })
        .catch(err => {
          console.warn('[PIMA Tracking] Erro ao enviar event_id ao cart:', err);
        });
    }

  } catch (e) {
    console.warn('[PIMA Tracking] Erro ao configurar event_id com cookie:', e);
  }
})();
