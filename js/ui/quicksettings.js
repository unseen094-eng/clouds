/**
 * CloudsOS — Quick Settings Panel
 */
const OSQuickSettings = (() => {
  let _open = false;

  const TILES = [
    { id: 'wifi',       label: 'Wi-Fi',     onIcon: '📶', offIcon: '📵', stateKey: 'wifi' },
    { id: 'bluetooth',  label: 'Bluetooth', onIcon: '🔵', offIcon: '⚫', stateKey: 'bluetooth' },
    { id: 'dnd',        label: 'Do Not Disturb', onIcon: '🔕', offIcon: '🔔', stateKey: null },
    { id: 'darkmode',   label: 'Dark Mode', onIcon: '🌙', offIcon: '☀️', stateKey: null },
    { id: 'fullscreen', label: 'Fullscreen',onIcon: '⛶',  offIcon: '⛶',  stateKey: null },
    { id: 'screenshot', label: 'Screenshot',onIcon: '📷',  offIcon: '📷',  stateKey: null },
  ];

  const _tileState = { dnd: false, darkmode: true, fullscreen: false, screenshot: false };

  function toggle() { _open ? hide() : show(); }

  function show() {
    _open = true;
    const panel = OSUtils.el('quicksettings-panel');
    panel.classList.remove('hidden', 'closing');
    _render();
  }

  async function hide() {
    _open = false;
    const panel = OSUtils.el('quicksettings-panel');
    panel.classList.add('closing');
    await OSUtils.sleep(160);
    panel.classList.add('hidden');
    panel.classList.remove('closing');
  }

  function _render() {
    _renderTiles();
    _renderSliders();
  }

  function _renderTiles() {
    const grid = OSUtils.el('qs-tiles');
    grid.innerHTML = '';
    TILES.forEach(tile => {
      const isOn = tile.stateKey ? OSState.get(tile.stateKey) : _tileState[tile.id];
      const el = OSUtils.make('div', { className: `qs-tile${isOn ? ' active' : ''}` });
      el.innerHTML = `
        <span>${isOn ? tile.onIcon : tile.offIcon}</span>
        <span class="qs-tile-label">${tile.label}</span>
      `;
      el.addEventListener('click', () => {
        if (tile.stateKey) {
          OSState.set(tile.stateKey, !OSState.get(tile.stateKey));
          OSStorage.saveSession();
        } else {
          _tileState[tile.id] = !_tileState[tile.id];
          if (tile.id === 'fullscreen') {
            if (_tileState.fullscreen) document.documentElement.requestFullscreen?.();
            else document.exitFullscreen?.();
          }
        }
        _renderTiles();
      });
      grid.appendChild(el);
    });
  }

  function _renderSliders() {
    const wrap = OSUtils.el('qs-sliders');
    wrap.innerHTML = '';

    const sliders = [
      { icon: '🔊', label: 'Volume',     stateKey: 'volume',     min: 0, max: 100 },
      { icon: '☀️',  label: 'Brightness', stateKey: 'brightness', min: 20, max: 100 },
    ];

    sliders.forEach(s => {
      const val = OSState.get(s.stateKey);
      const row = OSUtils.make('div', { className: 'qs-slider-row' });
      row.innerHTML = `
        <span class="qs-slider-icon">${s.icon}</span>
        <div class="qs-slider-wrap">
          <input type="range" class="qs-slider" min="${s.min}" max="${s.max}" value="${val}" />
        </div>
        <span class="qs-slider-val">${val}</span>
      `;
      const input  = row.querySelector('.qs-slider');
      const valEl  = row.querySelector('.qs-slider-val');
      input.addEventListener('input', () => {
        valEl.textContent = input.value;
        OSState.set(s.stateKey, +input.value);
        OSStorage.saveSession();
      });
      wrap.appendChild(row);
    });
  }

  function init() {
    OSUtils.el('qs-settings-btn').addEventListener('click', () => { hide(); OSAppRegistry.launch('settings'); });
    OSUtils.el('qs-power-btn').addEventListener('click',   () => { hide(); OSUtils.el('power-dialog').classList.remove('hidden'); });

    // Power dialog buttons
    OSUtils.el('power-cancel').addEventListener('click',   () => OSUtils.el('power-dialog').classList.add('hidden'));
    OSUtils.el('power-shutdown').addEventListener('click', () => _powerAction('shutdown'));
    OSUtils.el('power-restart').addEventListener('click',  () => _powerAction('restart'));

    // Close on outside click
    document.addEventListener('click', e => {
      if (_open && !e.target.closest('#quicksettings-panel') && !e.target.closest('#taskbar-qs-btn') && !e.target.closest('#taskbar-clock-btn')) {
        hide();
      }
    });
  }

  async function _powerAction(type) {
    OSUtils.el('power-dialog').classList.add('hidden');
    if (type === 'shutdown') {
      OSNotifications.show({ title: 'Shutting Down', body: 'Saving session…', type: 'info', duration: 2000 });
      OSStorage.saveSession();
      await OSUtils.sleep(2200);
      document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#060612;color:rgba(255,255,255,0.3);font-family:Inter,sans-serif;font-size:18px;">Clouds OS has shut down. Refresh to restart.</div>`;
    } else {
      OSStorage.saveSession();
      location.reload();
    }
  }

  return { toggle, show, hide, init };
})();
