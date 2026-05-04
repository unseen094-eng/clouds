/**
 * CloudsOS — CloudAPI (Fake Backend)
 * Central source of truth for the OS state, apps, and files.
 */
const CloudAPI = (() => {
  const _simulateLatency = () => new Promise(r => setTimeout(r, 100 + Math.random() * 200));
  const _response = (success, data = null, error = null) => ({ success, data, error });

  // SVG Helper
  const SVG = (path, color = 'url(#cg1)') => `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="${path}" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <defs><linearGradient id="cg1" x1="2" y1="2" x2="22" y2="22"><stop stop-color="var(--accent-light)"/><stop offset="1" stop-color="var(--accent)"/></linearGradient></defs>
    </svg>
  `;

  const ICONS = {
    files: SVG('M3 7a2 2 0 012-2h4.586a1 1 0 01.707.293l2.414 2.414A1 1 0 0013.414 8H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z'),
    notes: SVG('M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM7 7h10M7 12h10M7 17h6'),
    tasks: SVG('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'),
    calendar: SVG('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'),
    spreadsheet: SVG('M3 3h18v18H3V3zm0 6h18M3 15h18M9 3v18m6-18v18'),
    presenter: SVG('M3 3h18v14H3V3zm4 18l2-4m8 4l-2-4'),
    pdf: SVG('M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zM9 7h6M9 12h6M9 17h3'),
    chat: SVG('M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'),
    mail: SVG('M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6'),
    video: SVG('M23 7l-7 5 7 5V7zM1 5h14v14H1V5z'),
    terminal: SVG('M4 17l6-6-6-6M12 19h8'),
    code: SVG('M16 18l6-6-6-6M8 6l-6 6 6 6'),
    json: SVG('M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-16h2a2 2 0 012 2v2m-4 12h2a2 2 0 002-2v-2M9 12h.01M15 12h.01'),
    api: SVG('M13 2L3 14h9l-1 8 10-12h-9l1-8z'),
    git: SVG('M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22'),
    music: SVG('M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z'),
    video_player: SVG('M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6zM10 9l5 3-5 3V9z'),
    snake: SVG('M7 11V7a5 5 0 0110 0v4a5 5 0 01-10 0zM17 11v4a5 5 0 01-10 0v-4M12 2v2'),
    tetris: SVG('M4 4h16v16H4V4zm4 4h3v3H8V8zm5 0h3v3h-3V8zm-5 5h3v3H8v-3z'),
    chess: SVG('M4 4h16v16H4V4zm0 4h16M4 12h16M4 16h16M8 4v16M12 4v16M16 4v16'),
    doom: SVG('M3 3l18 18M3 21L21 3M12 2v20'),
    photos: SVG('M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM21 15l-5-5L5 21'),
    canvas: SVG('M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-1.5 2-2 1.5 1.5-2 2zM2 22L12 12M11 8a3 3 0 11-6 0 3 3 0 016 0z'),
    photo_editor: SVG('M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'),
    vector: SVG('M12 2L2 7l10 5 10-5-10-5zM12 22V12'),
    weather: SVG('M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z'),
    passman: SVG('M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'),
    compress: SVG('M4 14l6-6 4 4 6-6M4 20h16'),
    speedtest: SVG('M13 2L3 14h9l-1 8 10-12h-9l1-8z'),
    ai: SVG('M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'),
    theme_editor: SVG('M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'),
    settings: SVG('M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'),
    browser: SVG('M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z'),
    calculator: SVG('M4 4h16v16H4V4zm4 4h2v2H8V8zm6 0h2v2h-2V8zm-6 6h2v2H8v-2zm6 0h2v2h-2v-2z'),
    clock: SVG('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'),
    about: SVG('M12 16v-4m0-4h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z'),
    sysmonitor: SVG('M22 12h-4l-3 9L9 3l-3 9H2')
  };

  const APP_DATABASE = [
    { id: 'filemanager', name: 'Files', icon: ICONS.files, category: 'System', version: '2.1.0', desc: 'Central file management for CloudsOS.', installed: true },
    { id: 'notes', name: 'Notes', icon: ICONS.notes, category: 'Productivity', version: '1.2.0', desc: 'Capture thoughts and organize your life.', installed: true },
    { id: 'tasks', name: 'Tasks', icon: ICONS.tasks, category: 'Productivity', version: '1.0.0', desc: 'Simple todo list manager.' },
    { id: 'calendar', name: 'Calendar', icon: ICONS.calendar, category: 'Productivity', version: '1.0.4', desc: 'Manage your schedule and events.' },
    { id: 'spreadsheet', name: 'Cloud Sheets', icon: ICONS.spreadsheet, category: 'Productivity', version: '0.8.0', desc: 'Collaborative spreadsheet tool.' },
    { id: 'presenter', name: 'Cloud Slides', icon: ICONS.presenter, category: 'Productivity', version: '0.9.0', desc: 'Create stunning presentations.' },
    { id: 'pdfreader', name: 'PDF Viewer', icon: ICONS.pdf, category: 'Productivity', version: '1.1.0', desc: 'Read and annotate PDF documents.' },
    { id: 'chat', name: 'Messenger', icon: ICONS.chat, category: 'Communication', version: '1.0.0', desc: 'Instant messaging for Clouds OS.' },
    { id: 'mail', name: 'Cloud Mail', icon: ICONS.mail, category: 'Communication', version: '1.2.1', desc: 'Polished email client interface.' },
    { id: 'video', name: 'Cloud Meet', icon: ICONS.video, category: 'Communication', version: '1.0.0', desc: 'Video conferencing tool.' },
    { id: 'terminal', name: 'Terminal', icon: ICONS.terminal, category: 'Development', version: '2.0.0', desc: 'Powerful command-line interface.', installed: true },
    { id: 'code', name: 'Cloud Code', icon: ICONS.code, category: 'Development', version: '0.9.5', desc: 'Advanced IDE with syntax highlighting.' },
    { id: 'jsonviewer', name: 'JSON Viewer', icon: ICONS.json, category: 'Development', version: '1.0.0', desc: 'Format and inspect JSON data.' },
    { id: 'apitest', name: 'API Tester', icon: ICONS.api, category: 'Development', version: '1.1.0', desc: 'Test REST APIs easily.' },
    { id: 'github', name: 'Git Manager', icon: ICONS.git, category: 'Development', version: '0.5.0', desc: 'Manage your repositories.' },
    { id: 'music', name: 'Music', icon: ICONS.music, category: 'Entertainment', version: '2.0.0', desc: 'Listen to your favorite tracks.', installed: true },
    { id: 'video_player', name: 'Video Player', icon: ICONS.video_player, category: 'Entertainment', version: '1.1.0', desc: 'Watch videos with cloud-streaming.' },
    { id: 'snake', name: 'Snake Game', icon: ICONS.snake, category: 'Entertainment', version: '1.0.0', desc: 'Classic snake arcade game.' },
    { id: 'tetris', name: 'Tetris', icon: ICONS.tetris, category: 'Entertainment', version: '1.2.0', desc: 'Block stacking puzzle game.' },
    { id: 'chess', name: 'Chess', icon: ICONS.chess, category: 'Entertainment', version: '1.0.0', desc: 'Grandmaster chess simulation.' },
    { id: 'doom', name: 'Cloud Doom', icon: ICONS.doom, category: 'Entertainment', version: '1.6.6', desc: 'The classic FPS in your cloud browser.' },
    { id: 'photos', name: 'Gallery', icon: ICONS.photos, category: 'Creative', version: '1.4.0', desc: 'View and manage your photos.', installed: true },
    { id: 'canvas', name: 'Cloud Paint', icon: ICONS.canvas, category: 'Creative', version: '1.0.0', desc: 'Digital painting and drawing app.' },
    { id: 'photo_editor', name: 'Photo Editor', icon: ICONS.photo_editor, category: 'Creative', version: '1.1.0', desc: 'Apply filters and edit images.' },
    { id: 'vector', name: 'Vector Draw', icon: ICONS.vector, category: 'Creative', version: '0.9.0', desc: 'Scalable vector graphics editor.' },
    { id: 'calculator', name: 'Calculator', icon: ICONS.calculator, category: 'Utilities', version: '1.2.0', desc: 'Powerful mathematical tool.', installed: true },
    { id: 'clock', name: 'Clock', icon: ICONS.clock, category: 'Utilities', version: '1.1.0', desc: 'World clock and stopwatch.', installed: true },
    { id: 'weather', name: 'Weather', icon: ICONS.weather, category: 'Utilities', version: '1.0.0', desc: 'Real-time weather forecasts.' },
    { id: 'passman', name: 'PassManager', icon: ICONS.passman, category: 'Utilities', version: '1.2.0', desc: 'Securely store your passwords.' },
    { id: 'compress', name: 'Zip Archiver', icon: ICONS.compress, category: 'Utilities', version: '1.0.0', desc: 'Compress and extract files.' },
    { id: 'speedtest', name: 'Speed Test', icon: ICONS.speedtest, category: 'Utilities', version: '1.0.0', desc: 'Test your network speed.' },
    { id: 'ai', name: 'Assistant', icon: ICONS.ai, category: 'AI', version: '1.0.0', desc: 'AI-powered cloud assistant.', installed: true },
    { id: 'aisummarizer', name: 'Summarizer', icon: ICONS.ai, category: 'AI', version: '1.0.0', desc: 'Summarize long documents instantly.' },
    { id: 'aicode', name: 'AI Code Gen', icon: ICONS.ai, category: 'AI', version: '1.1.0', desc: 'Generate code with AI.' },
    { id: 'settings', name: 'Settings', icon: ICONS.settings, category: 'System', version: '2.0.0', desc: 'Configure your OS preferences.', installed: true },
    { id: 'sysmonitor', name: 'System Monitor', icon: ICONS.sysmonitor, category: 'System', version: '1.0.0', desc: 'Monitor hardware and processes.', installed: true },
    { id: 'theme_editor', name: 'Theme Lab', icon: ICONS.theme_editor, category: 'System', version: '1.0.0', desc: 'Create custom glassmorphism themes.' },
    { id: 'about', name: 'About', icon: ICONS.about, category: 'System', version: '1.0.0', desc: 'System information.', installed: true },
    { id: 'browser', name: 'Browser', icon: ICONS.browser, category: 'System', version: '1.0.0', desc: 'Web browser.', installed: true }
  ];

  const files = {
    async list(path) {
      await _simulateLatency();
      const files = JSON.parse(localStorage.getItem('clouds_vfs') || '[]');
      const filtered = files.filter(f => {
        const parent = f.path.substring(0, f.path.lastIndexOf('/')) || '/';
        return parent === path;
      });
      return _response(true, filtered);
    },
    async read(path) {
      await _simulateLatency();
      const files = JSON.parse(localStorage.getItem('clouds_vfs') || '[]');
      const file = files.find(f => f.path === path);
      return file ? _response(true, file) : _response(false, null, 'File not found');
    },
    async write(path, content, type = 'file') {
      await _simulateLatency();
      const files = JSON.parse(localStorage.getItem('clouds_vfs') || '[]');
      const idx = files.findIndex(f => f.path === path);
      const name = path.substring(path.lastIndexOf('/') + 1);
      const fileObj = { path, name, content, type, lastModified: Date.now() };
      
      if (idx >= 0) files[idx] = fileObj;
      else files.push(fileObj);
      
      localStorage.setItem('clouds_vfs', JSON.stringify(files));
      return _response(true, fileObj);
    },
    async delete(path) {
      await _simulateLatency();
      let files = JSON.parse(localStorage.getItem('clouds_vfs') || '[]');
      files = files.filter(f => f.path !== path && !f.path.startsWith(path + '/'));
      localStorage.setItem('clouds_vfs', JSON.stringify(files));
      return _response(true);
    }
  };

  const apps = {
    async listAvailable() {
      await _simulateLatency();
      return _response(true, APP_DATABASE);
    },
    async listInstalled() {
      await _simulateLatency();
      const installedIds = JSON.parse(localStorage.getItem('clouds_installed_apps') || '[]');
      const installed = APP_DATABASE.filter(a => a.installed || installedIds.includes(a.id));
      return _response(true, installed);
    },
    async install(appId) {
      await _simulateLatency();
      const installed = JSON.parse(localStorage.getItem('clouds_installed_apps') || '[]');
      if (!installed.includes(appId)) {
        installed.push(appId);
        localStorage.setItem('clouds_installed_apps', JSON.stringify(installed));
        OSEvents.emit('app:installed', appId);
      }
      return _response(true);
    },
    async uninstall(appId) {
      await _simulateLatency();
      let installed = JSON.parse(localStorage.getItem('clouds_installed_apps') || '[]');
      installed = installed.filter(id => id !== appId);
      localStorage.setItem('clouds_installed_apps', JSON.stringify(installed));
      OSEvents.emit('app:uninstalled', appId);
      return _response(true);
    }
  };

  const system = {
    clipboard: {
      _data: null,
      _type: null,
      async copy(item) {
        await _simulateLatency();
        this._data = JSON.parse(JSON.stringify(item));
        this._type = 'copy';
        return _response(true);
      },
      async cut(item) {
        await _simulateLatency();
        this._data = JSON.parse(JSON.stringify(item));
        this._type = 'cut';
        return _response(true);
      },
      async paste() {
        await _simulateLatency();
        const res = _response(true, { type: this._type, data: this._data });
        if (this._type === 'cut') {
          this._data = null;
          this._type = null;
        }
        return res;
      },
      get hasData() { return !!this._data; }
    },
    settings: {
      async get(key, defaultVal = null) {
        await _simulateLatency();
        const settings = JSON.parse(localStorage.getItem('clouds_settings') || '{}');
        return _response(true, settings[key] !== undefined ? settings[key] : defaultVal);
      },
      async set(key, value) {
        await _simulateLatency();
        const settings = JSON.parse(localStorage.getItem('clouds_settings') || '{}');
        settings[key] = value;
        localStorage.setItem('clouds_settings', JSON.stringify(settings));
        return _response(true);
      },
      async getAll() {
        await _simulateLatency();
        return _response(true, JSON.parse(localStorage.getItem('clouds_settings') || '{}'));
      }
    }
  };

  const ai = {
    async chat(prompt) {
      await _simulateLatency();
      try {
        const response = await fetch('http://localhost:5000', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt })
        });
        const data = await response.json();
        return _response(true, { message: data.response });
      } catch (e) {
        return _response(true, { message: "[Simulation Mode] I am your Clouds OS assistant. Since the local bridge is offline, I'm running in safe mode. How can I help?" });
      }
    }
  };

  const init = async () => {
    if (!localStorage.getItem('clouds_vfs')) {
      const initialFiles = [
        { path: '/Documents', name: 'Documents', type: 'dir' },
        { path: '/Pictures', name: 'Pictures', type: 'dir' },
        { path: '/Downloads', name: 'Downloads', type: 'dir' },
        { path: '/Desktop', name: 'Desktop', type: 'dir' },
        { path: '/Documents/Welcome.txt', name: 'Welcome.txt', type: 'file', content: 'Welcome to Clouds OS!' }
      ];
      localStorage.setItem('clouds_vfs', JSON.stringify(initialFiles));
    }
    if (!localStorage.getItem('clouds_settings')) {
      localStorage.setItem('clouds_settings', JSON.stringify({
        theme: 'dark',
        wallpaper: 'default',
        wallpaperType: 'gradient',
        animations: true
      }));
    }
  };

  return { init, files, apps, system, ai, ICONS };
})();
