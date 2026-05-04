/**
 * CloudsOS — Settings App
 * Refactored to use CloudAPI for centralized system settings and SVG icons.
 */
(() => {
  function render() {
    return `
      <div class="settings-layout">
        <div class="settings-sidebar">
          <div class="settings-nav-item active" data-section="appearance">
            <span class="set-icon">${CloudAPI.ICONS.theme_editor}</span> Appearance
          </div>
          <div class="settings-nav-item" data-section="system">
            <span class="set-icon">${CloudAPI.ICONS.settings}</span> System
          </div>
          <div class="settings-nav-item" data-section="network">
            <span class="set-icon">${CloudAPI.ICONS.weather}</span> Network
          </div>
          <div class="settings-nav-item" data-section="user">
            <span class="set-icon">${CloudAPI.ICONS.about}</span> User Profile
          </div>
          <div class="settings-nav-item" data-section="about">
            <span class="set-icon">${CloudAPI.ICONS.info}</span> About
          </div>
        </div>
        <div class="settings-main app-scroll">
          <div id="settings-loading-overlay">Syncing...</div>
          
          <div id="section-appearance" class="settings-section active">
            <h2>Appearance</h2>
            <div class="settings-group">
              <div class="settings-row">
                <div class="settings-row-info">
                  <div class="settings-row-title">Color Theme</div>
                  <div class="settings-row-desc">Switch between light and dark modes</div>
                </div>
                <div class="set-toggle-group">
                   <button class="app-toolbar-btn" id="set-theme-light">Light</button>
                   <button class="app-toolbar-btn" id="set-theme-dark">Dark</button>
                </div>
              </div>
            </div>
            <div class="settings-group">
              <div class="settings-row">
                <div class="settings-row-info">
                  <div class="settings-row-title">Live Wallpaper</div>
                  <div class="settings-row-desc">Select an animated background style</div>
                </div>
                <select class="settings-select" id="set-wp-type">
                  <option value="gradient">Animated Gradient</option>
                  <option value="clouds">Cloud Layers</option>
                  <option value="particles">Particle Clouds</option>
                  <option value="interactive">Interactive Motion</option>
                </select>
              </div>
              <div class="settings-row">
                <div class="settings-row-info">
                  <div class="settings-row-title">Enable Animations</div>
                  <div class="settings-row-desc">Reduce motion for better performance</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="set-anim-toggle">
                  <span class="toggle-track"></span>
                </label>
              </div>
            </div>
          </div>

          <div id="section-system" class="settings-section">
            <h2>System</h2>
            <div class="settings-group">
              <div class="settings-row">
                <div class="settings-row-info">
                  <div class="settings-row-title">Notification Sounds</div>
                  <div class="settings-row-desc">Play sound when notifications arrive</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="set-sound-toggle">
                  <span class="toggle-track"></span>
                </label>
              </div>
            </div>
          </div>

          <div id="section-network" class="settings-section">
            <h2>Network</h2>
            <div class="settings-group">
              <div class="settings-row">
                <div class="settings-row-info">
                  <div class="settings-row-title">Wi-Fi</div>
                  <div class="settings-row-desc">Connect to wireless networks</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="set-wifi-toggle">
                  <span class="toggle-track"></span>
                </label>
              </div>
            </div>
          </div>

          <div id="section-user" class="settings-section">
             <h2>User Profile</h2>
             <div class="settings-group">
                <div class="settings-row">
                    <div class="user-avatar">${CloudAPI.ICONS.about}</div>
                    <div class="settings-row-info">
                        <div class="settings-row-title" id="set-user-name">Cloud User</div>
                        <div class="settings-row-desc">cloud-user-01@clouds.os</div>
                    </div>
                    <button class="app-toolbar-btn">Edit</button>
                </div>
             </div>
          </div>

          <div id="section-about" class="settings-section">
            <h2>About Clouds OS</h2>
            <div class="settings-group">
               <div class="settings-row">
                  <div class="settings-row-info">
                     <div class="settings-row-title">System Version</div>
                     <div class="settings-row-desc">Clouds OS v2.1.0-stable</div>
                  </div>
               </div>
               <div class="settings-row">
                  <div class="settings-row-info">
                     <div class="settings-row-title">Architecture</div>
                     <div class="settings-row-desc">Cloud-Native Web Architecture</div>
                  </div>
               </div>
               <button class="app-toolbar-btn" style="margin-top:20px; color:#ff5f57" id="set-reset-btn">Factory Reset System</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async function onOpen(wid) {
    const win = OSUtils.el(wid);
    const loading = win.querySelector('#settings-loading-overlay');

    const showLoading = (s) => {
      loading.style.opacity = s ? '1' : '0';
      loading.style.pointerEvents = s ? 'all' : 'none';
    };

    // Load current values
    const settingsRes = await CloudAPI.system.settings.getAll();
    const s = settingsRes.data;

    if (s.theme === 'light') win.querySelector('#set-theme-light').classList.add('active');
    else win.querySelector('#set-theme-dark').classList.add('active');

    win.querySelector('#set-wp-type').value = s.wallpaperType || 'gradient';
    win.querySelector('#set-anim-toggle').checked = s.animations !== false;
    win.querySelector('#set-wifi-toggle').checked = s.wifi === true;

    // Navigation
    win.querySelectorAll('.settings-nav-item').forEach(btn => {
      btn.onclick = () => {
        win.querySelectorAll('.settings-nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        win.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
        win.querySelector(`#section-${btn.dataset.section}`).classList.add('active');
      };
    });

    // Event Handlers
    async function update(k, v) {
      showLoading(true);
      await CloudAPI.system.settings.set(k, v);
      showLoading(false);
    }

    win.querySelector('#set-theme-light').onclick = () => {
      document.documentElement.setAttribute('data-theme', 'light');
      win.querySelector('#set-theme-light').classList.add('active');
      win.querySelector('#set-theme-dark').classList.remove('active');
      update('theme', 'light');
    };
    win.querySelector('#set-theme-dark').onclick = () => {
      document.documentElement.removeAttribute('data-theme');
      win.querySelector('#set-theme-dark').classList.add('active');
      win.querySelector('#set-theme-light').classList.remove('active');
      update('theme', 'dark');
    };
    win.querySelector('#set-wp-type').onchange = (e) => {
      const v = e.target.value;
      OSWallpaper.setWallpaper(v);
      update('wallpaperType', v);
    };
    win.querySelector('#set-anim-toggle').onchange = (e) => {
      const v = e.target.checked;
      OSWallpaper.toggleAnimations(v);
      update('animations', v);
    };
    win.querySelector('#set-wifi-toggle').onchange = (e) => update('wifi', e.target.checked);

    win.querySelector('#set-reset-btn').onclick = () => {
      if(confirm('Are you sure you want to reset Clouds OS? This will clear all data.')) {
        localStorage.clear();
        location.reload();
      }
    };
  }

  OSAppRegistry.register({
    id: 'settings',
    name: 'Settings',
    icon: CloudAPI.ICONS.settings,
    category: 'system',
    color: 'linear-gradient(135deg,rgba(148,163,184,0.25),rgba(71,85,105,0.2))',
    defaultWidth: 800, defaultHeight: 560,
    render, onOpen,
  });
})();
