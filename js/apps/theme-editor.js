/**
 * CloudsOS — Theme Editor (Lab)
 * A unique tool to customize the OS visuals in real-time.
 */
(() => {
  function render() {
    return `
      <div class="theme-lab">
        <div class="lab-sidebar">
          <div class="lab-title">🎨 Theme Lab</div>
          <div class="lab-group">
            <label>Accent Color</label>
            <input type="color" id="lab-accent" value="#7c6ff7" />
          </div>
          <div class="lab-group">
            <label>Glass Blur</label>
            <input type="range" id="lab-blur" min="0" max="40" value="22" />
          </div>
          <div class="lab-group">
            <label>Glass Opacity</label>
            <input type="range" id="lab-opacity" min="10" max="95" value="55" />
          </div>
          <div class="lab-group">
            <label>Corner Radius</label>
            <input type="range" id="lab-radius" min="0" max="32" value="14" />
          </div>
          <button class="app-toolbar-btn primary" id="lab-save" style="margin-top:20px; width:100%">Save Theme</button>
          <button class="app-toolbar-btn" id="lab-reset" style="margin-top:10px; width:100%">Reset to Default</button>
        </div>
        <div class="lab-preview">
            <div class="preview-card">
                <h3>Live Preview</h3>
                <p>Changes are applied to the system instantly.</p>
                <div class="preview-btns">
                    <button class="app-toolbar-btn active">Active Button</button>
                    <button class="app-toolbar-btn">Normal Button</button>
                </div>
            </div>
        </div>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    const accentIn = win.querySelector('#lab-accent');
    const blurIn = win.querySelector('#lab-blur');
    const opacityIn = win.querySelector('#lab-opacity');
    const radiusIn = win.querySelector('#lab-radius');

    // Load current
    accentIn.value = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7c6ff7';

    const update = () => {
      const root = document.documentElement;
      root.style.setProperty('--accent', accentIn.value);
      root.style.setProperty('--blur', `saturate(180%) blur(${blurIn.value}px)`);
      root.style.setProperty('--glass-bg', `rgba(15, 15, 30, ${opacityIn.value / 100})`);
      root.style.setProperty('--radius-md', `${radiusIn.value}px`);
      root.style.setProperty('--accent-glow', `${accentIn.value}33`); // add transparency
    };

    accentIn.oninput = update;
    blurIn.oninput = update;
    opacityIn.oninput = update;
    radiusIn.oninput = update;

    win.querySelector('#lab-save').onclick = async () => {
        const themeData = {
            accent: accentIn.value,
            blur: blurIn.value,
            opacity: opacityIn.value,
            radius: radiusIn.value
        };
        await CloudAPI.system.settings.set('custom_theme', themeData);
        OSNotifications.show({ title: 'Theme Lab', body: 'Theme saved successfully!', type: 'success' });
    };

    win.querySelector('#lab-reset').onclick = () => {
        location.reload();
    };
  }

  OSAppRegistry.register({
    id: 'theme_editor',
    name: 'Theme Lab',
    icon: CloudAPI.ICONS.theme_editor,
    category: 'system',
    color: 'linear-gradient(135deg, #f472b6, #db2777)',
    defaultWidth: 700, defaultHeight: 500,
    render, onOpen,
  });
})();
