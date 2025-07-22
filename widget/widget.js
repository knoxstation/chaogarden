(() => {
  const script = document.currentScript;
  const dataUrl  = script.getAttribute('data-webring');
  const myUrlRaw = script.getAttribute('data-site-url') || location.href;
  const myUrl    = myUrlRaw.replace(/\/$/, ""); // strip trailing slash
  const mount    = script.previousElementSibling;

  async function init() {
    if (!mount) return;
    try {
      const res = await fetch(dataUrl, { cache: "no-cache" });
      if (!res.ok) throw new Error(`Failed to load webring.json (${res.status})`);
      const ring = await res.json();

      // only active members
      const activeRing = ring.filter(m => m.active !== false);

      const idx = activeRing.findIndex(m => m.url.replace(/\/$/, "") === myUrl);
      if (idx === -1) {
        mount.textContent = "Not in the webring (yet?)";
        return;
      }

      const me   = activeRing[idx];
      const prev = activeRing[(idx - 1 + activeRing.length) % activeRing.length];
      const next = activeRing[(idx + 1) % activeRing.length];

      mount.innerHTML = `
        <div class="chao-webring">
          <a class="cw-btn cw-prev" href="${prev.url}" aria-label="Previous site">&larr;</a>
          <a class="cw-home" href="https://chaogarden.netlify.app" title="Chao Webring home">
            <img src="${me.chao}" width="30" height="29" alt="${me.name}'s chao">
          </a>
          <a class="cw-btn cw-next" href="${next.url}" aria-label="Next site">&rarr;</a>
        </div>
      `;

      injectCSS();
    } catch (err) {
      console.error(err);
      mount.textContent = "Webring load error.";
    }
  }

  function injectCSS() {
    if (document.getElementById('chao-webring-style')) return;
    const link = document.createElement('link');
    link.id = 'chao-webring-style';
    link.rel = 'stylesheet';
    link.href = 'https://chaogarden.netlify.app/widget/widget.css';
    document.head.appendChild(link);
  }

  init();
})();
