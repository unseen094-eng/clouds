/**
 * CloudsOS — Browser App
 */
(() => {
  const BOOKMARKS = [
    { label: 'Google',    url: 'https://www.google.com', icon: '🔍' },
    { label: 'Wikipedia', url: 'https://en.wikipedia.org', icon: '📖' },
    { label: 'GitHub',    url: 'https://github.com', icon: '💻' },
    { label: 'YouTube',   url: 'https://www.youtube.com', icon: '▶️' },
  ];

  function render() {
    const bookmarkBtns = BOOKMARKS.map(b =>
      `<button class="app-toolbar-btn bookmark-btn" data-url="${b.url}">${b.icon} ${b.label}</button>`
    ).join('');

    return `
      <div class="browser-bar">
        <button class="browser-nav-btn" id="br-back">←</button>
        <button class="browser-nav-btn" id="br-fwd">→</button>
        <button class="browser-nav-btn" id="br-refresh">↻</button>
        <div class="browser-url-wrap">
          <input type="text" id="browser-url" placeholder="Enter URL or search…" />
          <button class="browser-go-btn" id="br-go">Go</button>
        </div>
      </div>
      <div class="app-toolbar" style="gap:6px;flex-wrap:wrap;">
        ${bookmarkBtns}
      </div>
      <div class="browser-iframe-wrap" id="br-frame-wrap">
        <div class="browser-blocked" id="br-home">
          <div style="font-size:48px">🌐</div>
          <h2>Clouds Browser</h2>
          <p style="color:var(--text-secondary);font-size:13px;max-width:280px;text-align:center;line-height:1.6">
            Enter a URL above or pick a bookmark.<br/>
            Note: many sites block iframe embedding.
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:8px">
            ${BOOKMARKS.map(b => `<button class="app-toolbar-btn bookmark-btn" data-url="${b.url}" style="border:1px solid var(--glass-border)">${b.icon} ${b.label}</button>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;

    const urlInput = win.querySelector('#browser-url');
    const frameWrap = win.querySelector('#br-frame-wrap');
    let iframe = null;

    function navigate(rawUrl) {
      let url = rawUrl.trim();
      if (!url) return;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.') && !url.includes(' ')) url = 'https://' + url;
        else url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
      }
      urlInput.value = url;
      frameWrap.innerHTML = '';
      iframe = OSUtils.make('iframe', {
        src: url,
        sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups',
        style: { width:'100%', height:'100%', border:'none', background:'#fff' },
      });
      iframe.addEventListener('error', () => showBlocked(url));
      frameWrap.appendChild(iframe);
    }

    function showBlocked(url) {
      frameWrap.innerHTML = `
        <div class="browser-blocked">
          <div style="font-size:48px">🚫</div>
          <h2>Cannot Load Page</h2>
          <p style="color:var(--text-secondary);font-size:13px;max-width:280px;text-align:center;line-height:1.6">
            <strong>${url}</strong><br/>blocked iframe embedding.<br/>
            <a href="${url}" target="_blank" style="color:var(--accent-light);margin-top:8px;display:inline-block">Open in new tab →</a>
          </p>
        </div>
      `;
    }

    win.querySelector('#br-go').addEventListener('click', () => navigate(urlInput.value));
    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(urlInput.value); });
    win.querySelector('#br-back').addEventListener('click', () => { try { iframe?.contentWindow?.history.back(); } catch(e){} });
    win.querySelector('#br-fwd').addEventListener('click', () => { try { iframe?.contentWindow?.history.forward(); } catch(e){} });
    win.querySelector('#br-refresh').addEventListener('click', () => { if (iframe) iframe.src = iframe.src; });

    win.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.url));
    });
  }

  OSAppRegistry.register({
    id: 'browser',
    name: 'Browser',
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="url(#brg1)" stroke-width="1.5"/><path d="M12 3c0 0-4 3-4 9s4 9 4 9M12 3c0 0 4 3 4 9s-4 9-4 9M3 12h18" stroke="url(#brg1)" stroke-width="1.5"/><defs><linearGradient id="brg1" x1="3" y1="3" x2="21" y2="21"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#6ee7f7"/></linearGradient></defs></svg>',
    category: 'internet',
    color: 'linear-gradient(135deg,rgba(56,189,248,0.25),rgba(110,231,247,0.2))',
    defaultWidth: 860, defaultHeight: 560,
    render, onOpen,
  });
})();
