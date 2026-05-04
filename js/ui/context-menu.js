/**
 * CloudsOS — Context Menu System
 * Refactored for CloudAPI clipboard and async actions.
 */
const OSContextMenu = (() => {
  let _activeMenu = null;

  const SVG = (path) => `<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="${path}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const ICONS = {
    folder:    SVG('M3 7a2 2 0 012-2h4.586a1 1 0 01.707.293l2.414 2.414A1 1 0 0013.414 8H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z'),
    file:      SVG('M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6'),
    refresh:   SVG('M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15'),
    wallpaper: SVG('M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM21 15l-5-5L5 21'),
    settings:  SVG('M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'),
    open:      SVG('M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3'),
    rename:    SVG('M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 113 3L12 15l-4 1 1-4 9.5-9.5z'),
    delete:    SVG('M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2'),
    copy:      SVG('M9 15h2a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2zM5 19h10a2 2 0 002-2v-2M5 19a2 2 0 01-2-2v-2'),
    cut:       SVG('M6 7a3 3 0 100-6 3 3 0 000 6zm0 10a3 3 0 100-6 3 3 0 000 6zM20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12'),
    paste:     SVG('M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M12 11v6M9 14l3 3 3-3M8 4a2 2 0 012-2h4a2 2 0 012 2v2H8V4z'),
    info:      SVG('M12 16v-4m0-4h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z')
  };

  function show(e, items) {
    e.preventDefault();
    e.stopPropagation();
    
    hide();

    const menu = _createMenu(items);
    document.getElementById('context-menu-layer').appendChild(menu);
    _activeMenu = menu;

    _positionMenu(menu, e.clientX, e.clientY);

    window.addEventListener('click', _onGlobalClick);
    window.addEventListener('keydown', _onGlobalKeyDown);
  }

  function hide() {
    if (_activeMenu) {
      _activeMenu.remove();
      _activeMenu = null;
    }
    window.removeEventListener('click', _onGlobalClick);
    window.removeEventListener('keydown', _onGlobalKeyDown);
  }

  function _createMenu(items, isSubmenu = false) {
    const menu = document.createElement('div');
    menu.className = isSubmenu ? 'context-menu ctx-submenu' : 'context-menu';

    items.forEach(item => {
      if (item === 'separator') {
        const sep = document.createElement('div');
        sep.className = 'ctx-separator';
        menu.appendChild(sep);
        return;
      }

      const el = document.createElement('div');
      el.className = `ctx-item ${item.disabled ? 'disabled' : ''}`;
      
      const icon = item.icon ? `<span class="ctx-item-icon">${item.icon}</span>` : '';
      const arrow = item.submenu ? '<span class="ctx-item-arrow">▶</span>' : '';
      
      el.innerHTML = `${icon}<span class="ctx-item-label">${item.label}</span>${arrow}`;

      if (item.action && !item.disabled) {
        el.addEventListener('click', async (e) => {
          e.stopPropagation();
          await item.action();
          hide();
        });
      }

      if (item.submenu) {
        const sub = _createMenu(item.submenu, true);
        el.appendChild(sub);
        el.addEventListener('mouseenter', () => {
          const rect = sub.getBoundingClientRect();
          if (rect.right > window.innerWidth) sub.classList.add('edge-left');
        });
      }

      menu.appendChild(el);
    });

    return menu;
  }

  function _positionMenu(menu, x, y) {
    const rect = menu.getBoundingClientRect();
    let finalX = x;
    let finalY = y;
    if (x + rect.width > window.innerWidth) finalX = x - rect.width;
    if (y + rect.height > window.innerHeight) finalY = y - rect.height;
    menu.style.left = `${finalX}px`;
    menu.style.top = `${finalY}px`;
  }

  function _onGlobalClick() { hide(); }
  function _onGlobalKeyDown(e) { if (e.key === 'Escape') hide(); }

  /* ── System Context Menus ── */

  async function showDesktop(e) {
    const hasClipboard = CloudAPI.system.clipboard.hasData;
    const items = [
      { label: 'New', icon: '➕', submenu: [
        { label: 'Folder', icon: ICONS.folder, action: () => OSEvents.emit('vfs:create', { type: 'dir', name: 'New Folder' }) },
        { label: 'Text Document', icon: ICONS.file, action: () => OSEvents.emit('vfs:create', { type: 'file', name: 'New Text.txt' }) }
      ]},
      'separator',
      { label: 'Refresh', icon: ICONS.refresh, action: () => location.reload() },
      { label: 'Paste', icon: ICONS.paste, disabled: !hasClipboard, action: () => _handlePaste('desktop') },
      'separator',
      { label: 'Change Wallpaper', icon: ICONS.wallpaper, action: () => OSAppRegistry.launch('settings') },
      { label: 'Personalize', icon: ICONS.settings, action: () => OSAppRegistry.launch('settings') }
    ];
    show(e, items);
  }

  async function showFile(e, file) {
    const items = [
      { label: 'Open', icon: ICONS.open, action: () => OSAppRegistry.launchByExtension(file.name, file) },
      { label: 'Open With...', icon: '📦', submenu: [
        { label: 'Text Editor', action: () => OSAppRegistry.launch('texteditor', { content: file.content, title: file.name }) },
        { label: 'Terminal', action: () => OSAppRegistry.launch('terminal') }
      ]},
      'separator',
      { label: 'Copy', icon: ICONS.copy, action: () => CloudAPI.system.clipboard.copy(file) },
      { label: 'Cut', icon: ICONS.cut, action: () => CloudAPI.system.clipboard.cut(file) },
      { label: 'Delete', icon: ICONS.delete, action: () => OSEvents.emit('vfs:delete', file) },
      { label: 'Rename', icon: ICONS.rename, action: () => OSEvents.emit('vfs:rename', file) },
      'separator',
      { label: 'Properties', icon: ICONS.info, action: () => alert(`Properties: ${file.name}\nType: ${file.type}`) }
    ];
    show(e, items);
  }

  async function showFolder(e, folder) {
    const hasClipboard = CloudAPI.system.clipboard.hasData;
    const items = [
      { label: 'Open', icon: ICONS.open, action: () => OSEvents.emit('vfs:navigate', folder) },
      'separator',
      { label: 'Copy', icon: ICONS.copy, action: () => CloudAPI.system.clipboard.copy(folder) },
      { label: 'Paste', icon: ICONS.paste, disabled: !hasClipboard, action: () => _handlePaste(folder) },
      { label: 'Delete', icon: ICONS.delete, action: () => OSEvents.emit('vfs:delete', folder) },
      { label: 'Rename', icon: ICONS.rename, action: () => OSEvents.emit('vfs:rename', folder) },
      'separator',
      { label: 'Properties', icon: ICONS.info, action: () => alert(`Folder: ${folder.name}`) }
    ];
    show(e, items);
  }

  async function _handlePaste(target) {
    const res = await CloudAPI.system.clipboard.paste();
    if (res.success && res.data) {
      OSEvents.emit('vfs:paste', { target, source: res.data });
    }
  }

  function init() {
    const desktop = OSUtils.el('desktop');
    if (desktop) {
      desktop.addEventListener('contextmenu', (e) => {
        if (e.target.id === 'desktop-wallpaper' || e.target.id === 'desktop') {
          showDesktop(e);
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.key === 'F10') {
         showDesktop({ preventDefault: () => {}, stopPropagation: () => {}, clientX: 100, clientY: 100 });
      }
    });
  }

  return { init, show, showFile, showFolder, hide, ICONS };
})();
