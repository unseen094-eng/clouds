/**
 * CloudsOS — Login Screen
 */
const OSLogin = (() => {
  let _clockInterval;

  function _tick() {
    const el = OSUtils.el('login-clock');
    if (!el) return;
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    el.textContent = `${hh}:${mm}`;
  }

  function _loadUser() {
    const session = OSStorage.loadSession();
    if (session && session.user) {
      OSUtils.el('login-username').textContent = session.user.name;
      return session.user;
    }
    // Default user
    return { name: 'Cloud User', password: '', avatar: null };
  }

  function show() {
    const screen = OSUtils.el('login-screen');
    screen.classList.remove('hidden');
    _tick();
    _clockInterval = setInterval(_tick, 1000);

    const user = _loadUser();
    OSState.set('user', user);

    const form = OSUtils.el('login-form');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const pwd = OSUtils.el('login-password').value;
      if (user.password === '' || pwd === user.password) {
        _doLogin(user);
      } else {
        const card = OSUtils.qs('.login-card');
        card.classList.remove('shake');
        void card.offsetWidth;
        card.classList.add('shake');
        OSNotifications.show({ title: 'Wrong Password', body: 'Please try again.', type: 'error', duration: 2500 });
      }
    });
  }

  async function _doLogin(user) {
    clearInterval(_clockInterval);
    const screen = OSUtils.el('login-screen');
    screen.classList.add('fade-out');
    await OSUtils.sleep(600);
    screen.classList.add('hidden');
    OSEvents.emit('login:done', user);
  }

  return { show };
})();
