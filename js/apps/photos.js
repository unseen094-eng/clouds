/**
 * CloudsOS — Photos App
 */
(() => {
  // Generate gradient placeholder photos
  const PHOTOS = [
    { id: 1, label: 'Sunset',      bg: 'linear-gradient(135deg,#f97316,#ec4899)', emoji: '🌅' },
    { id: 2, label: 'Mountain',    bg: 'linear-gradient(135deg,#3b82f6,#1e40af)', emoji: '🏔' },
    { id: 3, label: 'Forest',      bg: 'linear-gradient(135deg,#22c55e,#15803d)', emoji: '🌲' },
    { id: 4, label: 'Ocean',       bg: 'linear-gradient(135deg,#06b6d4,#0284c7)', emoji: '🌊' },
    { id: 5, label: 'Galaxy',      bg: 'linear-gradient(135deg,#7c3aed,#4f46e5)', emoji: '🌌' },
    { id: 6, label: 'City',        bg: 'linear-gradient(135deg,#374151,#111827)', emoji: '🏙' },
    { id: 7, label: 'Desert',      bg: 'linear-gradient(135deg,#d97706,#b45309)', emoji: '🏜' },
    { id: 8, label: 'Aurora',      bg: 'linear-gradient(135deg,#6ee7b7,#a78bfa)', emoji: '🌠' },
    { id: 9, label: 'Flowers',     bg: 'linear-gradient(135deg,#f472b6,#db2777)', emoji: '🌸' },
    { id: 10, label: 'Snow',       bg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', emoji: '❄️' },
    { id: 11, label: 'Volcano',    bg: 'linear-gradient(135deg,#ef4444,#b91c1c)', emoji: '🌋' },
    { id: 12, label: 'Waterfall',  bg: 'linear-gradient(135deg,#67e8f9,#22d3ee)', emoji: '💦' },
  ];

  function render() {
    return `
      <div class="app-toolbar">
        <span style="font-size:13px;font-weight:600;color:var(--text-primary)">Photos</span>
        <span class="app-toolbar-spacer"></span>
        <span style="font-size:12px;color:var(--text-tertiary)">${PHOTOS.length} items</span>
      </div>
      <div class="photos-body app-scroll">
        <div class="photos-grid" id="photos-grid"></div>
      </div>
      <!-- Lightbox -->
      <div id="photo-lightbox" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.85);z-index:10;align-items:center;justify-content:center;flex-direction:column;gap:14px;">
        <div id="lb-img" style="width:260px;height:260px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:72px;"></div>
        <div id="lb-label" style="font-size:16px;font-weight:600;color:#fff;"></div>
        <button id="lb-close" style="padding:8px 24px;border-radius:20px;background:rgba(255,255,255,0.12);color:#fff;font-size:13px;cursor:pointer;border:1px solid rgba(255,255,255,0.2);">Close</button>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;

    const grid = win.querySelector('#photos-grid');
    const lightbox = win.querySelector('#photo-lightbox');
    const lbImg   = win.querySelector('#lb-img');
    const lbLabel = win.querySelector('#lb-label');

    PHOTOS.forEach(photo => {
      const item = OSUtils.make('div', { className: 'photo-item', title: photo.label, style: { background: photo.bg } });
      item.textContent = photo.emoji;
      item.addEventListener('click', () => {
        lbImg.style.background = photo.bg;
        lbImg.textContent = photo.emoji;
        lbLabel.textContent = photo.label;
        lightbox.style.display = 'flex';
      });
      grid.appendChild(item);
    });

    win.querySelector('#lb-close').addEventListener('click', () => { lightbox.style.display = 'none'; });
    lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.style.display = 'none'; });
  }

  OSAppRegistry.register({
    id: 'photos',
    name: 'Photos',
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#pg1)" stroke-width="1.5"/><circle cx="8.5" cy="8.5" r="1.5" stroke="url(#pg1)" stroke-width="1.5"/><path d="M21 15l-5-5L5 21" stroke="url(#pg1)" stroke-width="1.5"/><defs><linearGradient id="pg1" x1="3" y1="3" x2="21" y2="21"><stop stop-color="#f472b6"/><stop offset="1" stop-color="#db2777"/></linearGradient></defs></svg>',
    category: 'media',
    color: 'linear-gradient(135deg,rgba(244,114,182,0.25),rgba(219,39,119,0.2))',
    defaultWidth: 680, defaultHeight: 500,
    render, onOpen,
  });
})();
