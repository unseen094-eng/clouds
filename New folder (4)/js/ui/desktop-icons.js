/**
 * CloudsOS — Desktop Icons
 * Refactored to handle dynamic file creation and correct context menu integration.
 */
const OSDesktopIcons = (() => {
  const COLS = 1, ROW_H = 100, COL_W = 92, START_X = 20, START_Y = 20;
  let _icons = [];
  let _selected = null;

  const defaultIcons = () => [
    { id: 'di_files',    appId: 'filemanager', label: 'Files',      col: 0, row: 0 },
    { id: 'di_terminal', appId: 'terminal',    label: 'Terminal',   col: 0, row: 1 },
    { id: 'di_editor',   appId: 'texteditor',  label: 'Text Editor',col: 0, row: 2 },
    { id: 'di_browser',  appId: 'browser',     label: 'Browser',    col: 0, row: 3 },
    { id: 'di_settings', appId: 'settings',    label: 'Settings',   col: 0, row: 4 },
    { id: 'di_about',    appId: 'about',       label: 'About',      col: 0, row: 5 },
  ];

  function _pos(col, row) {
    return { x: START_X + col * COL_W, y: START_Y + row * ROW_H };
  }

  async function _renderIcon(iconDef) {
    const reg = OSAppRegistry.get(iconDef.appId);
    if (!reg) {
        // Fallback to fetching from database if not registered
        const available = await CloudAPI.apps.listAvailable();
        const dbApp = available.data.find(a => a.id === iconDef.appId);
        if (!dbApp) return;
        iconDef.icon = dbApp.icon;
        iconDef.name = dbApp.name;
    } else {
        iconDef.icon = reg.icon;
        iconDef.name = reg.name;
    }

    const { x, y } = _pos(iconDef.col, iconDef.row);

    const el = OSUtils.make('div', {
      className: 'desktop-icon',
      id: iconDef.id,
      style: { left: x + 'px', top: y + 'px' },
    });

    el.innerHTML = `
      <div class="icon-img">${iconDef.icon}</div>
      <span class="icon-label">${iconDef.label || iconDef.name}</span>
    `;

    el.onclick = (e) => {
      e.stopPropagation();
      _select(iconDef.id);
    };

    el.ondblclick = (e) => {
      e.stopPropagation();
      _launch(iconDef);
    };

    el.oncontextmenu = (e) => {
      e.preventDefault();
      _select(iconDef.id);
      OSContextMenu.show(e, [
        { label: `Open ${iconDef.name}`, action: () => _launch(iconDef), icon: '🚀' },
        { type: 'sep' },
        { label: 'Remove from desktop', action: () => _removeIcon(iconDef.id), icon: '🗑' },
      ]);
    };

    OSUtils.el('desktop-icons').appendChild(el);
  }

  async function _launch(iconDef) {
    const el = OSUtils.el(iconDef.id);
    if (el) {
      el.classList.add('bouncing');
      el.addEventListener('animationend', () => el.classList.remove('bouncing'), { once: true });
    }
    await OSAppRegistry.launch(iconDef.appId);
  }

  function _select(id) {
    if (_selected) {
      const prev = OSUtils.el(_selected);
      if (prev) prev.classList.remove('selected');
    }
    _selected = id;
    const el = OSUtils.el(id);
    if (el) el.classList.add('selected');
  }

  function _removeIcon(id) {
    _icons = _icons.filter(i => i.id !== id);
    OSUtils.el(id)?.remove();
    _save();
  }

  function _save() {
    OSStorage.save('desktopIcons', _icons);
  }

  function _deselectAll() { _select(null); _selected = null; }

  async function refresh() {
    const container = OSUtils.el('desktop-icons');
    if (!container) return;
    container.innerHTML = '';
    const saved = OSStorage.load('desktopIcons', null);
    _icons = saved || defaultIcons();
    for (const icon of _icons) {
        await _renderIcon(icon);
    }
  }

  function init() {
    refresh();

    // Deselect on desktop click
    OSUtils.el('desktop').addEventListener('click', _deselectAll);

    // Desktop context menu is handled in context-menu.js, 
    // but we can add refresh logic here if needed.
    OSEvents.on('app:installed', () => refresh());
    OSEvents.on('app:uninstalled', () => refresh());
  }

  return { init, refresh };
})();
