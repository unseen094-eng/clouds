/**
 * CloudsOS — App Launcher
 */
const OSLauncher = (() => {
  let _open = false;
  let _activeCategory = 'all';

  function toggle() {
    _open ? hide() : show();
  }

  function show() {
    _open = true;
    const overlay = OSUtils.el('launcher-overlay');
    overlay.classList.remove('hidden', 'closing');
    OSUtils.el('taskbar-launcher-btn').classList.add('active');
    _render('all');
    setTimeout(() => OSUtils.el('launcher-search').focus(), 100);
  }

  async function hide() {
    _open = false;
    const overlay = OSUtils.el('launcher-overlay');
    overlay.classList.add('closing');
    OSUtils.el('taskbar-launcher-btn').classList.remove('active');
    await OSUtils.sleep(200);
    overlay.classList.add('hidden');
    overlay.classList.remove('closing');
    OSUtils.el('launcher-search').value = '';
  }

  async function _render(category, query = '') {
    _activeCategory = category;
    const grid = OSUtils.el('launcher-apps');
    grid.innerHTML = '';

    const availableRes = await CloudAPI.apps.listAvailable();
    const allApps = availableRes.data;

    const res = await CloudAPI.apps.listInstalled();
    const installedIds = res.data.map(a => a.id);

    // Only show installed apps OR system apps that are always available
    const systemApps = ['filemanager', 'settings', 'appstore', 'about'];
    let apps = allApps.filter(a => installedIds.includes(a.id) || systemApps.includes(a.id));

    if (category !== 'all') apps = apps.filter(a => a.category === category);
    if (query) {
      const q = query.toLowerCase();
      apps = apps.filter(a => a.name.toLowerCase().includes(q) || (a.category||'').toLowerCase().includes(q));
    }

    apps.forEach(reg => {
      const item = OSUtils.make('div', { className: 'launcher-app-icon', title: reg.name });
      item.innerHTML = `
        <div class="launcher-app-img" style="background:${reg.color||'rgba(124,111,247,0.2)'}">${reg.icon}</div>
        <span class="launcher-app-label">${reg.name}</span>
      `;
      item.addEventListener('click', async () => {
        hide();
        await OSAppRegistry.launch(reg.id);
      });
      grid.appendChild(item);
    });

    if (apps.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-tertiary);padding:32px;font-size:14px;">No apps found</div>`;
    }

    _renderCategories(apps, query);
  }

  function _renderCategories(apps, query) {
    const bar = OSUtils.el('launcher-categories');
    bar.innerHTML = '';
    const cats = ['all', ...new Set(apps.map(a => a.category).filter(Boolean))];
    cats.forEach(cat => {
      const btn = OSUtils.make('button', {
        className: `launcher-cat-btn${_activeCategory === cat ? ' active' : ''}`,
      });
      btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      btn.addEventListener('click', () => _render(cat, query));
      bar.appendChild(btn);
    });
  }

  function init() {
    const overlay = OSUtils.el('launcher-overlay');
    const search  = OSUtils.el('launcher-search');

    overlay.addEventListener('click', e => {
      if (!e.target.closest('.launcher-panel')) hide();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && _open) hide();
      if ((e.metaKey || e.ctrlKey) && e.key === ' ') { e.preventDefault(); toggle(); }
    });

    search.addEventListener('input', () => _render(_activeCategory, search.value.trim()));
    
    // Refresh launcher when apps are installed/uninstalled
    OSEvents.on('app:installed', () => { if(_open) _render(_activeCategory, search.value); });
    OSEvents.on('app:uninstalled', () => { if(_open) _render(_activeCategory, search.value); });
  }

  return { toggle, show, hide, init };
})();
