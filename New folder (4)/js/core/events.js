/**
 * CloudsOS — Event Bus
 * Lightweight custom event system for inter-module communication.
 */
const OSEvents = (() => {
  const _handlers = {};

  return {
    on(event, handler) {
      if (!_handlers[event]) _handlers[event] = [];
      _handlers[event].push(handler);
      return () => this.off(event, handler);
    },

    off(event, handler) {
      if (!_handlers[event]) return;
      _handlers[event] = _handlers[event].filter(h => h !== handler);
    },

    once(event, handler) {
      const wrapper = (...args) => {
        handler(...args);
        this.off(event, wrapper);
      };
      this.on(event, wrapper);
    },

    emit(event, data) {
      (_handlers[event] || []).forEach(h => {
        try { h(data); } catch (e) { console.error(`[OSEvents] ${event}:`, e); }
      });
      // also fire wildcard
      (_handlers['*'] || []).forEach(h => {
        try { h({ event, data }); } catch(e) {}
      });
    },

    // Convenience: native DOM custom events on document
    dispatch(event, detail) {
      document.dispatchEvent(new CustomEvent(`os:${event}`, { detail }));
    },
  };
})();
