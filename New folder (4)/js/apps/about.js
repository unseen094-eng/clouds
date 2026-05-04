/**
 * CloudsOS — About App
 */
(() => {
  function render() {
    return `
      <div class="about-body">
        <div class="about-logo">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" stroke="url(#ag1)" stroke-width="2"/>
            <path d="M20 45 Q25 20 40 25 Q45 10 60 20 Q75 15 70 35 Q80 35 78 48 Q76 58 62 55 L22 55 Q10 55 12 45 Z" fill="url(#acGrad)" opacity="0.9"/>
            <defs>
              <linearGradient id="ag1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#6ee7f7"/>
                <stop offset="100%" stop-color="#a78bfa"/>
              </linearGradient>
              <linearGradient id="acGrad" x1="12" y1="15" x2="78" y2="58" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#e0f2fe"/>
                <stop offset="100%" stop-color="#c4b5fd"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="about-name">Clouds OS</div>
        <div class="about-version">Version 1.0.0 (Vanilla JS)</div>
        <div class="about-desc">
          A premium, browser-based operating system built with pure HTML, CSS, and JavaScript. 
          Featuring a high-performance window manager, extensible app system, and a beautiful 
          glassmorphism design language.
        </div>
        <div class="about-specs">
          <div class="about-spec-row">
            <span class="about-spec-key">System Architecture</span>
            <span class="about-spec-val">Event-Driven / Modular</span>
          </div>
          <div class="about-spec-row">
            <span class="about-spec-key">UI Engine</span>
            <span class="about-spec-val">Vanilla DOM / CSS Variables</span>
          </div>
          <div class="about-spec-row">
            <span class="about-spec-key">Persistence</span>
            <span class="about-spec-val">LocalStorage / VFS</span>
          </div>
          <div class="about-spec-row">
            <span class="about-spec-key">Developer</span>
            <span class="about-spec-val">Antigravity AI</span>
          </div>
        </div>
        <div style="margin-top:10px;">
            <button class="dialog-btn dialog-btn-primary" id="about-notify">Send Test Notification</button>
        </div>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;
    
    win.querySelector('#about-notify').addEventListener('click', () => {
        OSNotifications.show({
            title: 'System Test',
            body: 'Notification system is working perfectly!',
            type: 'success'
        });
    });
  }

  OSAppRegistry.register({
    id: 'about',
    name: 'About',
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="url(#abg1)" stroke-width="1.5"/><path d="M12 16v-4M12 8h.01" stroke="url(#abg1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="abg1" x1="2" y1="2" x2="22" y2="22"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs></svg>',
    category: 'system',
    color: 'linear-gradient(135deg,rgba(56,189,248,0.25),rgba(167,139,250,0.2))',
    defaultWidth: 460, defaultHeight: 580,
    resizable: false,
    render, onOpen,
  });
})();
