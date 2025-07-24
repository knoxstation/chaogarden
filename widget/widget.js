(() => {
  const script      = document.currentScript;
  const dataUrl     = script.getAttribute('data-webring');

  // 1) grab ?site=… if present
  const urlParams   = new URLSearchParams(location.search);
  const paramSite   = urlParams.get('site');

  // 2) allow a hard‑coded override via data-site-url
  const scriptSite  = script.getAttribute('data-site-url');

  // 3) fallback to referrer (for script‑tag embeds), then location.href
  const referrer    = (document.referrer || '').replace(/\/$/, '');
  const loc         = location.href.replace(/\/$/, '');

  // 4) choose in order: query‑param → attr → referrer → own URL
  const myUrl       = (paramSite || scriptSite || referrer || loc).replace(/\/$/, '');

  const scaleAttr   = script.getAttribute('data-scale')   || '1';
  const joinUrl     = script.getAttribute('data-join-url')|| 'https://knoxstation.neocities.org/chaogarden';
  const aboutUrl    = script.getAttribute('data-about-url')|| 'https://knoxstation.neocities.org/chaogarden';

  const mount       = script.previousElementSibling;

  async function init(){
    if (!mount) return;
    try {
      const res  = await fetch(dataUrl, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load webring.json (${res.status})`);
      const ring = await res.json();

      const activeRing = ring.filter(m => m.active !== false);
      const idx        = activeRing.findIndex(m => m.url.replace(/\/$/, '') === myUrl);

      if (idx === -1) {
        mount.textContent = 'Not in the webring (yet?)';
        return;
      }

      const me   = activeRing[idx];
      const prev = activeRing[(idx - 1 + activeRing.length) % activeRing.length];
      const next = activeRing[(idx + 1) % activeRing.length];

      mount.innerHTML = `
        <div class="chao-webring" style="--cw-scale:${parseFloat(scaleAttr)};">
          <div class="cw-nameplate">
            <span>${escapeHTML(me.name)}</span> is part of the
            <a href="https://knoxstation.neocities.org/chaogarden" target="_blank" rel="noopener noreferrer">
              Chao Garden
            </a>!
          </div>
          <div class="cw-arrows">
            <a class="cw-btn cw-prev" href="${prev.url}" target="_blank" rel="noopener noreferrer" aria-label="Previous site">◀</a>
            <a class="cw-btn cw-next" href="${next.url}" target="_blank" rel="noopener noreferrer" aria-label="Next site">▶</a>
          </div>
          <a class="cw-chao" href="https://knoxstation.neocities.org/chaogarden" title="Chao Webring home" target="_blank" rel="noopener noreferrer">
            <img src="${me.chao}" width="30" height="29" alt="${escapeHTML(me.name)}'s chao">
          </a>
          <div class="cw-links">
            <a href="${joinUrl}" target="_blank" rel="noopener noreferrer">How to join</a>
          </div>
        </div>
      `;

      injectCSS();
    } catch(err) {
      console.error('WEBRING ERROR:', err);
      mount.textContent = 'Webring load error.';
    }
  }

  function injectCSS(){
    if (document.getElementById('chao-webring-style')) return;
    const link = document.createElement('link');
    link.id    = 'chao-webring-style';
    link.rel   = 'stylesheet';
    link.href  = 'https://chaogarden.netlify.app/widget/widget.css';
    document.head.appendChild(link);
  }

  // super basic escape to avoid any weird chars breaking HTML
  function escapeHTML(str){
    return (str||'').replace(/[&<>"']/g, m => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[m]));
  }

  init();
})();
