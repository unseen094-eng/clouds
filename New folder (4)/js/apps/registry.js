/**
 * CloudsOS — App Registry
 * Central registry of all installed applications.
 */
const OSAppRegistry = (() => {
  const _registry = new Map();

  const EXT_MAP = {
    'txt':  'texteditor',
    'js':   'texteditor',
    'css':  'texteditor',
    'html': 'texteditor',
    'jpg':  'photos',
    'jpeg': 'photos',
    'png':  'photos',
    'mp3':  'music',
    'mp4':  'music', // Music player for videos for now
    'wav':  'music'
  };

  function register(def) {
    _registry.set(def.id, def);
  }

  function get(id) { return _registry.get(id) || null; }

  function all() { return [..._registry.values()]; }

  async function launch(id, opts = {}) {
    let reg = _registry.get(id);
    
    if (!reg) {
      // Check if it's a mock app from the CloudAPI database
      const available = await CloudAPI.apps.listAvailable();
      const mockApp = available.data.find(a => a.id === id);
      if (mockApp) {
        const template = OSAppTemplates.get(id, mockApp);
        reg = {
          ...mockApp,
          render: template.render,
          onOpen: template.onOpen
        };
        _registry.set(id, reg); // Register it temporarily
      } else {
        console.warn('[Registry] Unknown app:', id);
        return;
      }
    }

    // If already open and not multi-instance, focus existing
    if (!reg.multiInstance) {
      const existingWid = OSWindowManager.getByAppId(id);
      if (existingWid) {
        OSWindowManager.bringToFront(existingWid);
        return existingWid;
      }
    }

    OSState.get('runningApps').add(id);

    const content = reg.render ? reg.render(opts) : '<div style="padding:20px;color:var(--text-secondary)">App content here</div>';
    const wid = OSWindowManager.create({
      appId:    id,
      title:    opts.title || reg.name,
      icon:     reg.icon,
      width:    opts.width  || reg.defaultWidth  || 720,
      height:   opts.height || reg.defaultHeight || 480,
      x:        opts.x,
      y:        opts.y,
      content,
      resizable: reg.resizable !== false,
    });

    if (reg.onOpen) reg.onOpen(wid, opts);
    OSEvents.emit('app:launched', { id, wid });
    return wid;
  }

  function launchByExtension(filename, file) {
    const ext = filename.split('.').pop().toLowerCase();
    const appId = EXT_MAP[ext] || 'texteditor';
    return launch(appId, { title: filename, content: file.content, file });
  }

  function unregister(id) { _registry.delete(id); }

  return { register, get, all, launch, launchByExtension, unregister };
})();
