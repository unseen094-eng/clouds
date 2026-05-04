/**
 * CloudsOS — Boot Sequence
 */
const OSBoot = (() => {
  const STEPS = [
    { pct: 8,  msg: 'Initializing kernel…' },
    { pct: 20, msg: 'Loading system drivers…' },
    { pct: 35, msg: 'Mounting virtual filesystem…' },
    { pct: 52, msg: 'Starting window compositor…' },
    { pct: 68, msg: 'Loading user profile…' },
    { pct: 80, msg: 'Starting system services…' },
    { pct: 92, msg: 'Applying user settings…' },
    { pct: 100, msg: 'Welcome to Clouds OS' },
  ];

  async function run() {
    const screen = OSUtils.el('boot-screen');
    const fill   = OSUtils.el('boot-loader-fill');
    const txt    = OSUtils.el('boot-loader-text');

    for (const step of STEPS) {
      fill.style.width = step.pct + '%';
      txt.textContent  = step.msg;
      await OSUtils.sleep(step.pct === 100 ? 600 : 300 + Math.random() * 250);
    }

    await OSUtils.sleep(400);
    screen.classList.add('fade-out');
    await OSUtils.sleep(800);
    screen.classList.add('hidden');
    OSEvents.emit('boot:done');
  }

  return { run };
})();
