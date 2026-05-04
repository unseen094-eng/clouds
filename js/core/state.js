/**
 * CloudsOS — Global State
 * Single source of truth for the entire OS.
 */
const OSState = (() => {
  const _state = {
    phase: 'boot',          // boot | login | desktop
    user: null,             // { name, password, avatar }
    windows: new Map(),     // windowId → windowMeta
    activeWindowId: null,
    zCounter: 100,
    runningApps: new Set(), // appIds
    pinnedApps: [],
    desktopIcons: [],
    wallpaper: 'default',
    volume: 80,
    brightness: 100,
    wifi: true,
    bluetooth: false,
    notifications: [],
    settings: {
      theme: 'dark',
      accent: 'purple',
      animations: true,
      sounds: false,
    },
  };

  const _listeners = {};

  return {
    get(key) { return _state[key]; },

    set(key, value) {
      const old = _state[key];
      _state[key] = value;
      OSEvents.emit(`state:${key}`, { key, value, old });
    },

    patch(key, patch) {
      if (typeof _state[key] === 'object' && !Array.isArray(_state[key])) {
        _state[key] = { ..._state[key], ...patch };
        OSEvents.emit(`state:${key}`, { key, value: _state[key] });
      }
    },

    getAll() { return { ..._state }; },
  };
})();
