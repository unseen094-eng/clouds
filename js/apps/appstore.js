/**
 * CloudsOS — App Store
 * Central hub for discovering and installing Clouds OS applications.
 */
(() => {
  function render() {
    return `
      <div class="store-layout">
        <div class="store-sidebar">
          <div class="store-search-wrap">
            <input type="text" id="store-search" placeholder="Search apps..." />
          </div>
          <div class="store-nav">
            <div class="store-nav-item active" data-cat="all">All Apps</div>
            <div class="store-nav-item" data-cat="Productivity">Productivity</div>
            <div class="store-nav-item" data-cat="Creative">Creative</div>
            <div class="store-nav-item" data-cat="Development">Development</div>
            <div class="store-nav-item" data-cat="Entertainment">Entertainment</div>
            <div class="store-nav-item" data-cat="Utilities">Utilities</div>
            <div class="store-nav-item" data-cat="AI">AI</div>
            <div class="store-nav-item" data-cat="System">System</div>
          </div>
        </div>
        <div class="store-main app-scroll">
          <div class="store-hero">
            <h1>Discover Clouds OS</h1>
            <p>Elevate your experience with 50+ cloud-native applications.</p>
          </div>
          <div class="store-grid" id="store-grid"></div>
        </div>
      </div>
      <div id="store-modal" class="store-modal hidden">
        <div class="store-modal-content">
          <button id="store-modal-close" class="store-modal-close">×</button>
          <div id="store-modal-body"></div>
        </div>
      </div>
    `;
  }

  async function onOpen(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;

    const grid = win.querySelector('#store-grid');
    const search = win.querySelector('#store-search');
    const modal = win.querySelector('#store-modal');
    const modalBody = win.querySelector('#store-modal-body');

    let currentCat = 'all';
    let APP_DATABASE = (await CloudAPI.apps.listAvailable()).data;
    let installedApps = (await CloudAPI.apps.listInstalled()).data;

    function renderApps(filter = '') {
      grid.innerHTML = '';
      const filtered = APP_DATABASE.filter(app => {
        const matchesCat = currentCat === 'all' || app.category === currentCat;
        const matchesSearch = app.name.toLowerCase().includes(filter.toLowerCase()) || 
                              app.desc.toLowerCase().includes(filter.toLowerCase());
        return matchesCat && matchesSearch;
      });

      filtered.forEach(app => {
        const isInstalled = installedApps.includes(app.id);
        const card = OSUtils.make('div', { className: 'store-card' });
        card.innerHTML = `
          <div class="store-card-icon">${app.icon}</div>
          <div class="store-card-info">
            <div class="store-card-name">${app.name}</div>
            <div class="store-card-cat">${app.category}</div>
          </div>
          <button class="store-card-btn ${isInstalled ? 'installed' : ''}" data-id="${app.id}">
            ${isInstalled ? 'Installed' : 'Install'}
          </button>
        `;
        
        card.addEventListener('click', (e) => {
          if (e.target.tagName === 'BUTTON') return;
          showDetails(app);
        });

        card.querySelector('button').addEventListener('click', async (e) => {
          const btn = e.target;
          if (isInstalled) return; // For now, no uninstall from list to keep it simple
          
          btn.textContent = 'Installing...';
          btn.disabled = true;
          await CloudAPI.apps.install(app.id);
          installedApps.push(app.id);
          btn.textContent = 'Installed';
          btn.classList.add('installed');
          OSNotifications.show({ title: 'Success', body: `${app.name} installed!`, type: 'success' });
        });

        grid.appendChild(card);
      });
    }

    function showDetails(app) {
      const isInstalled = installedApps.includes(app.id);
      modalBody.innerHTML = `
        <div class="store-detail">
          <div class="store-detail-header">
            <div class="store-detail-icon">${app.icon}</div>
            <div class="store-detail-info">
              <h2>${app.name}</h2>
              <p>${app.category} • Version ${app.version}</p>
            </div>
          </div>
          <div class="store-detail-desc">${app.desc}</div>
          <div class="store-detail-actions">
            ${isInstalled 
              ? `<button class="store-btn-danger" id="store-uninstall">Uninstall</button>
                 <button class="store-btn-primary" id="store-launch">Launch</button>`
              : `<button class="store-btn-primary" id="store-install-big">Install Now</button>`
            }
          </div>
        </div>
      `;
      modal.classList.remove('hidden');

      if (isInstalled) {
        win.querySelector('#store-launch').onclick = async () => {
          await OSAppRegistry.launch(app.id);
          modal.classList.add('hidden');
        };
        win.querySelector('#store-uninstall').onclick = async () => {
          if (!confirm(`Uninstall ${app.name}?`)) return;
          await CloudAPI.apps.uninstall(app.id);
          installedApps = installedApps.filter(id => id !== app.id);
          modal.classList.add('hidden');
          renderApps(search.value);
          OSNotifications.show({ title: 'System', body: `${app.name} uninstalled.`, type: 'info' });
        };
      } else {
        win.querySelector('#store-install-big').onclick = async () => {
          const btn = win.querySelector('#store-install-big');
          btn.textContent = 'Installing...';
          await CloudAPI.apps.install(app.id);
          installedApps.push(app.id);
          modal.classList.add('hidden');
          renderApps(search.value);
          OSNotifications.show({ title: 'Success', body: `${app.name} installed!`, type: 'success' });
        };
      }
    }

    win.querySelector('#store-modal-close').onclick = () => modal.classList.add('hidden');

    search.addEventListener('input', () => renderApps(search.value));

    win.querySelectorAll('.store-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        win.querySelectorAll('.store-nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentCat = item.dataset.cat;
        renderApps(search.value);
      });
    });

    renderApps();
  }

  OSAppRegistry.register({
    id: 'appstore',
    name: 'App Store',
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#sg1)" stroke-width="1.5"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="sg1" x1="4" y1="4" x2="20" y2="20"><stop stop-color="#7c6ff7"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs></svg>',
    category: 'system',
    color: 'linear-gradient(135deg,rgba(124,111,247,0.3),rgba(56,189,248,0.2))',
    defaultWidth: 900, defaultHeight: 600,
    render, onOpen,
  });
})();
