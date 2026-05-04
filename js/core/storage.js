/**
 * CloudsOS — Storage Layer
 * Wraps localStorage with JSON serialisation + namespacing.
 */
const OSStorage = (() => {
  const NS = 'clouds_os_';

  return {
    save(key, value) {
      try { localStorage.setItem(NS + key, JSON.stringify(value)); }
      catch (e) { console.warn('[OSStorage] save failed:', e); }
    },

    load(key, fallback = null) {
      try {
        const raw = localStorage.getItem(NS + key);
        return raw !== null ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },

    remove(key) { localStorage.removeItem(NS + key); },

    clear() {
      Object.keys(localStorage)
        .filter(k => k.startsWith(NS))
        .forEach(k => localStorage.removeItem(k));
    },

    // Save entire OS state snapshot
    saveSession() {
      const snap = {
        user: OSState.get('user'),
        wallpaper: OSState.get('wallpaper'),
        pinnedApps: OSState.get('pinnedApps'),
        desktopIcons: OSState.get('desktopIcons'),
        settings: OSState.get('settings'),
        volume: OSState.get('volume'),
        wifi: OSState.get('wifi'),
        bluetooth: OSState.get('bluetooth'),
      };
      this.save('session', snap);
    },

    loadSession() {
      return this.load('session', null);
    },
  };
})();
