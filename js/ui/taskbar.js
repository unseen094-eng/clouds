/**
 * CloudsOS — Taskbar
 */
const OSTaskbar = (() => {
  let _clockInterval;

  function _tick() {
    const d = new Date();
    const te = OSUtils.el('taskbar-time');
    const de = OSUtils.el('taskbar-date');
    if (te) te.textContent = OSUtils.formatTime(d);
    if (de) de.textContent = OSUtils.formatDate(d);
  }

  function _renderButtons() {
    const center = OSUtils.el('taskbar-center');
    if (!center) return;
    center.innerHTML = '';

    const pinned = OSState.get('pinnedApps') || [];
    const running = OSState.get('runningApps');
    const windows = OSState.get('windows');
    const activeWid = OSState.get('activeWindowId');

    // Merge: pinned first, then any running not in pinned
    const shown = new Map(); // appId → { pinned, wid, meta }

    pinned.forEach(appId => {
      const reg = OSAppRegistry.get(appId);
      if (!reg) return;
      const wid = OSWindowManager.getByAppId(appId);
      shown.set(appId, { reg, pinned: true, wid });
    });

    for (const [wid, meta] of windows) {
      if (!shown.has(meta.appId)) {
        const reg = OSAppRegistry.get(meta.appId);
        if (reg) shown.set(meta.appId, { reg, pinned: false, wid });
      }
    }

    shown.forEach(({ reg, pinned, wid }, appId) => {
      const isRunning = !!wid;
      const meta = wid ? windows.get(wid) : null;
      const isActive = wid && wid === activeWid && meta && !meta.minimized;

      const btn = OSUtils.make('button', {
        className: `taskbar-app-btn${isRunning ? ' running' : ''}${isActive ? ' active' : ''}${!isRunning && pinned ? ' pinned-inactive' : ''}`,
        title: reg.name,
      });
      btn.innerHTML = `
        <span class="tb-icon">${reg.icon}</span>
        <span class="tb-label">${reg.name}</span>
      `;
      btn.addEventListener('click', () => {
        if (!isRunning) {
          OSAppRegistry.launch(appId);
        } else {
          if (isActive) OSWindowManager.minimize(wid);
          else OSWindowManager.bringToFront(wid);
        }
      });
      btn.addEventListener('contextmenu', e => {
        e.preventDefault();
        const items = [];
        if (isRunning) items.push({ label: 'Close', action: () => OSWindowManager.close(wid), icon: '✕' });
        if (pinned) items.push({ label: 'Unpin', action: () => _unpin(appId), icon: '📌' });
        else items.push({ label: 'Pin to taskbar', action: () => _pin(appId), icon: '📌' });
        OSContextMenu.show(e.clientX, e.clientY, items);
      });

      center.appendChild(btn);
    });
  }

  function _pin(appId) {
    const pinned = [...OSState.get('pinnedApps')];
    if (!pinned.includes(appId)) {
      pinned.push(appId);
      OSState.set('pinnedApps', pinned);
      OSStorage.saveSession();
      _renderButtons();
    }
  }

  function _unpin(appId) {
    const pinned = OSState.get('pinnedApps').filter(id => id !== appId);
    OSState.set('pinnedApps', pinned);
    OSStorage.saveSession();
    _renderButtons();
  }

  function _renderSystray() {
    const tray = OSUtils.el('taskbar-systray');
    if (!tray) return;
    tray.innerHTML = '';
    const icons = [
      { emoji: OSState.get('wifi') ? '📶' : '📵', title: 'Network' },
      { emoji: OSState.get('bluetooth') ? '🔵' : '⬤', title: 'Bluetooth' },
      { emoji: '🔔', title: 'Notifications' },
    ];
    icons.forEach(({ emoji, title }) => {
      const ic = OSUtils.make('div', { className: 'systray-icon', title });
      ic.textContent = emoji;
      tray.appendChild(ic);
    });
  }

  function init() {
    _tick();
    _clockInterval = setInterval(_tick, 1000);

    // Launcher button
    OSUtils.el('taskbar-launcher-btn').addEventListener('click', () => OSLauncher.toggle());

    // Quick settings
    OSUtils.el('taskbar-qs-btn').addEventListener('click', e => { e.stopPropagation(); OSQuickSettings.toggle(); });

    // Clock button — just toggle QS for now
    OSUtils.el('taskbar-clock-btn').addEventListener('click', e => { e.stopPropagation(); OSQuickSettings.toggle(); });

    // Re-render on any window change
    OSEvents.on('window:created', _renderButtons);
    OSEvents.on('window:closed',  _renderButtons);
    OSEvents.on('window:focused', _renderButtons);
    OSEvents.on('window:minimized', _renderButtons);
    OSEvents.on('state:pinnedApps', _renderButtons);
    OSEvents.on('state:wifi', _renderSystray);
    OSEvents.on('state:bluetooth', _renderSystray);

    _renderButtons();
    _renderSystray();
  }

  return { init, refresh: _renderButtons };
})();
