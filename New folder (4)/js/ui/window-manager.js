/**
 * CloudsOS — Window Manager
 * Handles creation, dragging, resizing, focus, minimize/maximize, snapping.
 */
const OSWindowManager = (() => {
  const layer = () => OSUtils.el('window-layer');
  let snapIndicator = null;

  /* ── Create window ── */
  function create({ id, title, icon = '', appId, width = 720, height = 480, x, y, content = '', minWidth = 320, minHeight = 220, resizable = true }) {
    const wid = id || OSUtils.uid('win');
    const vw = window.innerWidth;
    const vh = window.innerHeight - 52;

    const wx = x !== undefined ? x : Math.max(0, (vw - width) / 2 + (Math.random() * 40 - 20));
    const wy = y !== undefined ? y : Math.max(0, (vh - height) / 2 + (Math.random() * 40 - 20));

    const win = OSUtils.make('div', {
      className: 'os-window opening',
      id: wid,
      style: { width: width + 'px', height: height + 'px', left: wx + 'px', top: wy + 'px', zIndex: _nextZ() }
    });

    win.innerHTML = `
      <div class="window-titlebar">
        <div class="window-controls">
          <button class="wc-btn wc-close" title="Close">✕</button>
          <button class="wc-btn wc-min"   title="Minimize">−</button>
          <button class="wc-btn wc-max"   title="Maximize">+</button>
        </div>
        <div class="window-titlebar-drag">
          <span class="window-icon">${icon}</span>
          <span class="window-title">${title}</span>
        </div>
      </div>
      <div class="window-body">${content}</div>
      ${resizable ? _resizeHandles() : ''}
    `;

    layer().appendChild(win);

    const meta = { wid, title, icon, appId, minimized: false, maximized: false, preMaxRect: null, zIndex: parseInt(win.style.zIndex) };
    OSState.get('windows').set(wid, meta);

    _bindControls(win, meta);
    _bindDrag(win, meta);
    if (resizable) _bindResize(win, meta);
    focus(wid);

    setTimeout(() => win.classList.remove('opening'), 250);
    OSEvents.emit('window:created', { wid, appId, title });
    return wid;
  }

  function _resizeHandles() {
    return ['n','s','e','w','ne','nw','se','sw'].map(d => `<div class="resize-handle rh-${d}" data-dir="${d}"></div>`).join('');
  }

  function _nextZ() {
    let z = (OSState.get('zCounter') || 1000) + 1;
    if (z > 10000) z = 1001; // Wrap around safely if it ever gets this high
    OSState.set('zCounter', z);
    return z;
  }

  /* ── Focus ── */
  function focus(wid) {
    const prev = OSState.get('activeWindowId');
    if (prev && prev !== wid) {
      const pw = OSUtils.el(prev);
      if (pw) pw.classList.remove('focused');
    }
    const win = OSUtils.el(wid);
    if (!win) return;
    const z = _nextZ();
    win.style.zIndex = z;
    win.classList.add('focused');
    OSState.set('activeWindowId', wid);
    const meta = OSState.get('windows').get(wid);
    if (meta) meta.zIndex = z;
    OSEvents.emit('window:focused', { wid });
  }

  /* ── Close ── */
  function close(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;
    win.classList.add('closing');
    setTimeout(() => {
      win.remove();
      const meta = OSState.get('windows').get(wid);
      OSState.get('windows').delete(wid);
      if (OSState.get('activeWindowId') === wid) OSState.set('activeWindowId', null);
      OSEvents.emit('window:closed', { wid, appId: meta?.appId });
    }, 200);
  }

  /* ── Minimize ── */
  function minimize(wid) {
    const win = OSUtils.el(wid);
    const meta = OSState.get('windows').get(wid);
    if (!win || !meta) return;
    meta.minimized = !meta.minimized;
    win.classList.toggle('minimized', meta.minimized);
    if (!meta.minimized) focus(wid);
    OSEvents.emit('window:minimized', { wid, minimized: meta.minimized });
  }

  /* ── Maximize ── */
  function maximize(wid) {
    const win = OSUtils.el(wid);
    const meta = OSState.get('windows').get(wid);
    if (!win || !meta) return;
    if (!meta.maximized) {
      meta.preMaxRect = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height };
      win.classList.add('maximized');
      meta.maximized = true;
    } else {
      win.classList.remove('maximized');
      if (meta.preMaxRect) {
        const r = meta.preMaxRect;
        win.style.left = r.left; win.style.top = r.top;
        win.style.width = r.width; win.style.height = r.height;
      }
      meta.maximized = false;
    }
    OSEvents.emit('window:maximized', { wid, maximized: meta.maximized });
  }

  /* ── Bind title-bar controls ── */
  function _bindControls(win, meta) {
    win.querySelector('.wc-close').addEventListener('click', e => { e.stopPropagation(); close(meta.wid); });
    win.querySelector('.wc-min').addEventListener('click',   e => { e.stopPropagation(); minimize(meta.wid); });
    win.querySelector('.wc-max').addEventListener('click',   e => { e.stopPropagation(); maximize(meta.wid); });
    win.addEventListener('mousedown', () => focus(meta.wid), true);
  }

  /* ── Drag ── */
  function _bindDrag(win, meta) {
    const bar = win.querySelector('.window-titlebar-drag');
    let ox, oy, startX, startY, dragging = false;

    bar.addEventListener('mousedown', e => {
      if (meta.maximized) return;
      e.preventDefault();
      dragging = true;
      ox = win.offsetLeft; oy = win.offsetTop;
      startX = e.clientX; startY = e.clientY;
      document.body.style.cursor = 'move';
      _showSnapIndicator(null);
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      let nx = ox + dx, ny = oy + dy;
      const clamped = OSUtils.clampToViewport(nx, ny, win.offsetWidth, win.offsetHeight);
      win.style.left = clamped.x + 'px';
      win.style.top  = clamped.y + 'px';
      // Snap hints
      if (e.clientX < 8) _showSnapIndicator('left');
      else if (e.clientX > window.innerWidth - 8) _showSnapIndicator('right');
      else _showSnapIndicator(null);
    });

    document.addEventListener('mouseup', e => {
      if (!dragging) return;
      dragging = false;
      document.body.style.cursor = '';
      _showSnapIndicator(null);
      if (e.clientX < 8) _snap(meta.wid, 'left');
      else if (e.clientX > window.innerWidth - 8) _snap(meta.wid, 'right');
    });

    bar.addEventListener('dblclick', () => maximize(meta.wid));
  }

  /* ── Snap ── */
  function _snap(wid, side) {
    const win = OSUtils.el(wid);
    if (!win) return;
    win.classList.remove('snap-left','snap-right','maximized');
    win.classList.add(side === 'left' ? 'snap-left' : 'snap-right');
    const meta = OSState.get('windows').get(wid);
    if (meta) { meta.maximized = false; meta.snapped = side; }
  }

  function _showSnapIndicator(side) {
    if (!snapIndicator) {
      snapIndicator = OSUtils.make('div', { className: 'snap-indicator' });
      document.body.appendChild(snapIndicator);
    }
    if (!side) { snapIndicator.style.display = 'none'; return; }
    const vh = window.innerHeight - 52;
    const vw = window.innerWidth;
    snapIndicator.style.display = 'block';
    snapIndicator.style.top  = '0';
    snapIndicator.style.height = vh + 'px';
    snapIndicator.style.width  = vw / 2 + 'px';
    snapIndicator.style.left   = side === 'left' ? '0' : vw / 2 + 'px';
  }

  /* ── Resize ── */
  function _bindResize(win, meta) {
    win.querySelectorAll('.resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', e => {
        if (meta.maximized) return;
        e.preventDefault(); e.stopPropagation();
        const dir = handle.dataset.dir;
        const startX = e.clientX, startY = e.clientY;
        const startL = win.offsetLeft, startT = win.offsetTop;
        const startW = win.offsetWidth, startH = win.offsetHeight;

        const onMove = ev => {
          const dx = ev.clientX - startX, dy = ev.clientY - startY;
          let nl = startL, nt = startT, nw = startW, nh = startH;

          if (dir.includes('e')) nw = Math.max(meta.minWidth || 320, startW + dx);
          if (dir.includes('s')) nh = Math.max(meta.minHeight || 220, startH + dy);
          if (dir.includes('w')) { nw = Math.max(meta.minWidth || 320, startW - dx); nl = startL + (startW - nw); }
          if (dir.includes('n')) { nh = Math.max(meta.minHeight || 220, startH - dy); nt = startT + (startH - nh); }

          win.style.left = nl + 'px'; win.style.top = nt + 'px';
          win.style.width = nw + 'px'; win.style.height = nh + 'px';
        };
        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  }

  /* ── Public API ── */
  function getByAppId(appId) {
    for (const [wid, meta] of OSState.get('windows')) {
      if (meta.appId === appId) return wid;
    }
    return null;
  }

  function toggleMinimize(wid) { minimize(wid); }

  function bringToFront(wid) {
    const meta = OSState.get('windows').get(wid);
    if (!meta) return;
    if (meta.minimized) minimize(wid);
    else focus(wid);
  }

  return { create, close, minimize, maximize, focus, bringToFront, getByAppId, toggleMinimize };
})();
