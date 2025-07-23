(() => {
  const script = document.currentScript;
  const dataUrl   = script.getAttribute('data-webring');
  const myUrlRaw  = script.getAttribute('data-site-url') || location.href;
  const myUrl     = myUrlRaw.replace(/\/$/, "");
  const scaleAttr = script.getAttribute('data-scale') || "1";
  const joinUrl   = script.getAttribute('data-join-url') || "https://knoxstation.neocities.org/chaogarden";
  const aboutUrl  = script.getAttribute('data-about-url') || "https://knoxstation.neocities.org/chaogarden";

  const mount = script.previousElementSibling;

  async function init(){
    if(!mount) return;
    try{
      const res = await fetch(dataUrl, { cache: "no-cache" });
      if(!res.ok) throw new Error(`Failed to load webring.json (${res.status})`);
      const ring = await res.json();

      const activeRing = ring.filter(m => m.active !== false);
      const idx = activeRing.findIndex(m => m.url.replace(/\/$/, "") === myUrl);

      if(idx === -1){
        mount.textContent = "Not in the webring (yet?)";
        return;
      }

      const me   = activeRing[idx];
      const prev = activeRing[(idx - 1 + activeRing.length) % activeRing.length];
      const next = activeRing[(idx + 1) % activeRing.length];

      mount.innerHTML = `
        <div class="chao-webring" style="--cw-scale:${parseFloat(scaleAttr)};">
          <div class="cw-nameplate">
            <span>${escapeHTML(me.name)}</span> is part of the
            <a href="https://knoxstation.neocities.org/chaogarden" target="_blank">Chao Garden</a>!
          </div>

          <div class="cw-arrows">
            <a class="cw-btn cw-prev" href="${prev.url}" aria-label="Previous site">◀</a>
            <a class="cw-btn cw-next" href="${next.url}" aria-label="Next site">▶</a>
          </div>

          <a class="cw-chao" href="https://knoxstation.neocities.org/chaogarden" title="Chao Webring home">
            <img src="${me.chao}" width="30" height="29" alt="${escapeHTML(me.name)}'s chao">
          </a>

          <div class="cw-links">
            <a href="${joinUrl}">How to join</a>

          </div>
        </div>
      `;

      injectCSS();

    }catch(err){
      console.error("WEBRING ERROR:", err);
      mount.textContent = "Webring load error.";
    }
  }

  function injectCSS(){
    if(document.getElementById('chao-webring-style')) return;
    const link = document.createElement('link');
    link.id = 'chao-webring-style';
    link.rel = 'stylesheet';
    link.href = 'https://chaogarden.netlify.app/widget/widget.css';
    document.head.appendChild(link);
  }

  // super basic escape to avoid any weird chars breaking HTML
  function escapeHTML(str){
    return (str||"").replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  init();
})();
