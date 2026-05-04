/**
 * CloudsOS — File Manager App
 * Refactored for robust event handling and CloudAPI integration.
 */
(() => {
  const ICONS = { dir: '📁', txt: '📄', zip: '🗜', jpg: '🖼', jpeg: '🖼', png: '🖼', mp3: '🎵', mp4: '🎬', default: '📄' };

  function getIcon(name, type) {
    if (type === 'dir') return ICONS.dir;
    const ext = name.split('.').pop().toLowerCase();
    return ICONS[ext] || ICONS.default;
  }

  function formatSize(bytes) {
    if (!bytes) return '--';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1048576).toFixed(1) + ' MB';
  }

  function render() {
    return `
      <div class="app-toolbar">
        <button class="app-toolbar-btn" id="fm-back-btn">← Back</button>
        <button class="app-toolbar-btn" id="fm-up-btn">↑ Up</button>
        <span class="app-toolbar-sep"></span>
        <button class="app-toolbar-btn" id="fm-grid-btn">⊞ Grid</button>
        <button class="app-toolbar-btn" id="fm-list-btn">≡ List</button>
        <span class="app-toolbar-spacer"></span>
        <div id="fm-loader" style="font-size:10px; color:var(--text-tertiary); margin-right:10px; opacity:0; transition:opacity 0.2s;">Syncing...</div>
        <input id="fm-search" placeholder="Search…" style="background:rgba(255,255,255,0.06);border:1px solid var(--glass-border);border-radius:20px;padding:5px 12px;color:var(--text-primary);font-size:12px;width:150px;" />
      </div>
      <div class="fm-path-bar" id="fm-path-bar"></div>
      <div class="fm-layout">
        <div class="fm-sidebar" id="fm-sidebar">
          <div class="fm-sidebar-item active" data-path="/">📁 Home</div>
          <div class="fm-sidebar-item" data-path="/Documents">📄 Documents</div>
          <div class="fm-sidebar-item" data-path="/Pictures">🖼 Pictures</div>
          <div class="fm-sidebar-item" data-path="/Desktop">🖥 Desktop</div>
        </div>
        <div class="fm-main app-scroll" id="fm-main"></div>
      </div>
    `;
  }

  async function onOpen(wid) {
    let currentPath = '/';
    let viewMode = 'grid';
    const history = ['/'];
    let histIdx = 0;

    const win = OSUtils.el(wid);
    if (!win) return;

    const unsubscribers = [];

    async function navigate(path) {
      currentPath = path;
      if (histIdx < history.length - 1) history.splice(histIdx + 1);
      history.push(path);
      histIdx = history.length - 1;
      await renderDir();
    }

    function goBack() {
      if (histIdx > 0) { histIdx--; currentPath = history[histIdx]; renderDir(); }
    }

    function goUp() {
      const parts = currentPath.split('/').filter(Boolean);
      parts.pop();
      navigate('/' + parts.join('/'));
    }

    async function renderDir() {
      const loader = win.querySelector('#fm-loader');
      if (loader) loader.style.opacity = '1';

      // Path bar
      const pathBar = win.querySelector('#fm-path-bar');
      const parts = currentPath.split('/').filter(Boolean);
      pathBar.innerHTML = '';
      const homeEl = OSUtils.make('span', { className: 'fm-path-seg' }, '⌂ Home');
      homeEl.onclick = () => navigate('/');
      pathBar.appendChild(homeEl);
      parts.forEach((p, i) => {
        pathBar.appendChild(OSUtils.make('span', { className: 'fm-path-sep' }, ' / '));
        const seg = OSUtils.make('span', { className: 'fm-path-seg' }, p);
        const segPath = '/' + parts.slice(0, i + 1).join('/');
        seg.onclick = () => navigate(segPath);
        pathBar.appendChild(seg);
      });

      // Sidebar highlight
      win.querySelectorAll('.fm-sidebar-item').forEach(el => {
        el.classList.toggle('active', el.dataset.path === currentPath);
      });

      // Main content
      const main = win.querySelector('#fm-main');
      const res = await CloudAPI.files.list(currentPath);
      if (loader) loader.style.opacity = '0';

      if (!res.success) {
        main.innerHTML = `<div style="padding:20px;color:var(--text-tertiary)">Error: ${res.error}</div>`;
        return;
      }

      const files = res.data;
      if (files.length === 0) {
        main.innerHTML = '<div style="padding:30px;text-align:center;color:var(--text-tertiary)">📂 This folder is empty</div>';
      } else {
        main.innerHTML = '';
        const container = OSUtils.make('div', { className: viewMode === 'grid' ? 'fm-grid' : 'fm-list' });
        
        files.forEach(file => {
          const item = OSUtils.make('div', { className: viewMode === 'grid' ? 'fm-item' : 'fm-list-item' });
          item.innerHTML = viewMode === 'grid' 
            ? `<span class="fm-icon">${getIcon(file.name, file.type)}</span><span class="fm-name" title="${file.name}">${file.name}</span>`
            : `<span class="fm-icon">${getIcon(file.name, file.type)}</span><span class="fm-name">${file.name}</span><span class="fm-meta">${file.type === 'dir' ? 'Folder' : formatSize(file.content?.length || 0)}</span>`;
          
          item.ondblclick = async () => {
            if (file.type === 'dir') await navigate(file.path);
            else await OSAppRegistry.launchByExtension(file.name, file);
          };

          item.oncontextmenu = (e) => {
            if (file.type === 'dir') OSContextMenu.showFolder(e, file);
            else OSContextMenu.showFile(e, file);
          };

          container.appendChild(item);
        });
        main.appendChild(container);
      }
    }

    // VFS Operations via CloudAPI
    unsubscribers.push(OSEvents.on('vfs:create', async ({ type, name }) => {
      if (OSState.get('activeWindowId') !== wid) return;
      let path = (currentPath === '/' ? '' : currentPath) + '/' + name;
      await CloudAPI.files.write(path, type === 'dir' ? null : '', type);
      await renderDir();
    }));

    unsubscribers.push(OSEvents.on('vfs:delete', async (item) => {
      if (OSState.get('activeWindowId') !== wid) return;
      await CloudAPI.files.delete(item.path);
      await renderDir();
      OSNotifications.show({ title: 'Deleted', body: `"${item.name}" removed`, type: 'warning' });
    }));

    unsubscribers.push(OSEvents.on('vfs:rename', async (item) => {
      if (OSState.get('activeWindowId') !== wid) return;
      const newName = prompt('Enter new name:', item.name);
      if (newName && newName !== item.name) {
        const newPath = item.path.substring(0, item.path.lastIndexOf('/')) + '/' + newName;
        const fileRes = await CloudAPI.files.read(item.path);
        if (fileRes.success) {
          await CloudAPI.files.write(newPath, fileRes.data.content, fileRes.data.type);
          await CloudAPI.files.delete(item.path);
          await renderDir();
        }
      }
    }));

    unsubscribers.push(OSEvents.on('vfs:paste', async ({ target, source }) => {
        if (OSState.get('activeWindowId') !== wid) return;
        const destPath = target === 'desktop' ? '/Desktop' : currentPath;
        const item = source.data;
        const newPath = (destPath === '/' ? '' : destPath) + '/' + item.name;
        
        await CloudAPI.files.write(newPath, item.content, item.type);
        await renderDir();
        OSNotifications.show({ title: 'Pasted', body: `"${item.name}" added`, type: 'success' });
    }));

    win.querySelector('#fm-back-btn').onclick = goBack;
    win.querySelector('#fm-up-btn').onclick = goUp;
    win.querySelector('#fm-grid-btn').onclick = () => { viewMode = 'grid'; renderDir(); };
    win.querySelector('#fm-list-btn').onclick = () => { viewMode = 'list'; renderDir(); };
    win.querySelectorAll('.fm-sidebar-item').forEach(el => {
      el.onclick = () => navigate(el.dataset.path);
    });

    win.querySelector('#fm-main').oncontextmenu = (e) => {
      if (e.target === win.querySelector('#fm-main') || e.target.classList.contains('fm-grid')) {
        OSContextMenu.show(e, [
            { label: 'New', icon: '➕', submenu: [
                { label: 'Folder', action: () => OSEvents.emit('vfs:create', { type: 'dir', name: 'New Folder' }) },
                { label: 'Text Document', action: () => OSEvents.emit('vfs:create', { type: 'file', name: 'New Text.txt' }) }
            ]},
            'separator',
            { label: 'Paste', action: () => OSEvents.emit('vfs:paste', { target: currentPath, source: { data: CloudAPI.system.clipboard._data, type: CloudAPI.system.clipboard._type } }), disabled: !CloudAPI.system.clipboard.hasData }
        ]);
      }
    };

    await renderDir();

    // Cleanup on close
    const unsubClose = OSEvents.on('window:closed', ({ wid: closedWid }) => {
      if (closedWid === wid) {
        unsubscribers.forEach(unsub => unsub());
        unsubClose();
      }
    });
  }

  OSAppRegistry.register({
    id: 'filemanager',
    name: 'Files',
    icon: CloudAPI.ICONS.files,
    category: 'system',
    color: 'linear-gradient(135deg,rgba(110,231,247,0.25),rgba(167,139,250,0.2))',
    defaultWidth: 780, defaultHeight: 520,
    render, onOpen,
  });
})();
