/**
 * CloudsOS — Utilities
 */
const OSUtils = (() => {
  let _uidCounter = 0;

  return {
    uid(prefix = 'id') { return `${prefix}_${Date.now()}_${++_uidCounter}`; },

    clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },

    el(id) { return document.getElementById(id); },

    qs(sel, root = document) { return root.querySelector(sel); },
    qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; },

    /** Create element with attrs and optional children */
    make(tag, attrs = {}, ...children) {
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'className') el.className = v;
        else if (k === 'style') Object.assign(el.style, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else el.setAttribute(k, v);
      }
      children.flat().forEach(c => {
        if (typeof c === 'string') el.appendChild(document.createTextNode(c));
        else if (c instanceof Node) el.appendChild(c);
      });
      return el;
    },

    /** Format Date */
    formatTime(d = new Date()) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    },
    formatDate(d = new Date()) {
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    },
    formatFullDate(d = new Date()) {
      return d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    },

    /** Sleep */
    sleep(ms) { return new Promise(r => setTimeout(r, ms)); },

    /** Debounce */
    debounce(fn, ms) {
      let t;
      return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
    },

    /** Throttle */
    throttle(fn, ms) {
      let last = 0;
      return (...args) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...args); } };
    },

    /** Keep rect inside viewport (minus taskbar) */
    clampToViewport(x, y, w, h) {
      const taskbarH = 52;
      const vw = window.innerWidth;
      const vh = window.innerHeight - taskbarH;
      return {
        x: OSUtils.clamp(x, 0, vw - w),
        y: OSUtils.clamp(y, 0, vh - 40),
      };
    },

    /** Parse simple SVG icon string */
    svgIcon(paths, viewBox = '0 0 24 24') {
      return `<svg viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
    },
  };
})();
