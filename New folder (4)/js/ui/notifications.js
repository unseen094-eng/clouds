/**
 * CloudsOS — Notification System
 */
const OSNotifications = (() => {
  const DEFAULT_DURATION = 4000;

  const TYPE_ICONS = {
    info:    '💬',
    success: '✅',
    warning: '⚠️',
    error:   '❌',
    default: '🔔',
  };

  function show({ title = 'Notification', body = '', type = 'info', duration = DEFAULT_DURATION, onClick } = {}) {
    const container = OSUtils.el('notification-container');
    const id = OSUtils.uid('notif');

    const notif = OSUtils.make('div', { className: `notification ${type}`, id });
    notif.innerHTML = `
      <div class="notif-icon ${type}">${TYPE_ICONS[type] || TYPE_ICONS.default}</div>
      <div class="notif-content">
        <div class="notif-title">${title}</div>
        <div class="notif-body">${body}</div>
      </div>
      <button class="notif-close" title="Dismiss">✕</button>
    `;

    // Timer bar
    notif.style.setProperty('--notif-dur', duration + 'ms');
    notif.querySelector('::after'); // trigger
    notif.style.cssText += `--notif-dur:${duration}ms;`;

    // Animate timer
    const after = document.createElement('style');
    after.textContent = `#${id}::after{width:100%;animation:notifTimer ${duration}ms linear forwards;}@keyframes notifTimer{from{width:100%}to{width:0}}`;
    document.head.appendChild(after);

    notif.querySelector('.notif-close').addEventListener('click', e => { e.stopPropagation(); dismiss(id); after.remove(); });
    notif.addEventListener('click', () => { if (onClick) onClick(); dismiss(id); after.remove(); });

    container.appendChild(notif);

    // Store
    const stored = OSState.get('notifications');
    stored.push({ id, title, body, type, time: Date.now() });
    OSState.set('notifications', stored);

    // Auto dismiss
    setTimeout(() => { dismiss(id); after.remove(); }, duration);

    return id;
  }

  function dismiss(id) {
    const el = OSUtils.el(id);
    if (!el) return;
    el.classList.add('removing');
    setTimeout(() => el.remove(), 320);
  }

  return { show, dismiss };
})();
