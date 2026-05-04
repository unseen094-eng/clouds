/**
 * CloudsOS — Main Entry Point
 * Orchestrates the boot process and initializes all subsystems.
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('%c Clouds OS %c 1.0.0 ', 'background:#7c6ff7; color:#fff; font-weight:bold; padding:2px 4px; border-radius:4px 0 0 4px', 'background:#22c55e; color:#fff; font-weight:bold; padding:2px 4px; border-radius:0 4px 4px 0');

  // 0. Initialize CloudAPI (Fake Backend)
  await CloudAPI.init();

  // 1. Initial State Load
  const session = OSStorage.loadSession();
  if (session) {
    if (session.wallpaper) OSState.set('wallpaper', session.wallpaper);
    if (session.wallpaperType) OSState.set('wallpaperType', session.wallpaperType);
    if (session.pinnedApps) OSState.set('pinnedApps', session.pinnedApps);
    if (session.wifi !== undefined) OSState.set('wifi', session.wifi);
    if (session.bluetooth !== undefined) OSState.set('bluetooth', session.bluetooth);
    if (session.volume !== undefined) OSState.set('volume', session.volume);
    if (session.settings) {
      OSState.set('settings', session.settings);
      if (session.settings.theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
      if (session.settings.animations === false) document.body.style.setProperty('--blur', 'none');
    }
  } else {
    // Defaults for new session
    OSState.set('pinnedApps', ['filemanager', 'terminal', 'browser', 'settings']);
  }

  // 2. Run Boot Sequence
  await OSBoot.run();

  // 3. Login Screen
  OSLogin.show();

  // 4. Wait for Login Success
  OSEvents.on('login:done', async (user) => {
    OSState.set('phase', 'desktop');
    OSState.set('user', user);

    const desktop = OSUtils.el('desktop');
    desktop.classList.remove('hidden');

    // 5. Initialize Desktop Subsystems
    OSWallpaper.init();
    OSTaskbar.init();
    OSContextMenu.init();
    OSLauncher.init();
    OSQuickSettings.init();

    // Welcome Notification
    setTimeout(() => {
      OSNotifications.show({
        title: `Welcome, ${user.name}!`,
        body: 'Enjoy your seamless Clouds OS experience.',
        type: 'success',
        duration: 5000
      });
    }, 1500);

    // Save session on any state change that matters
    OSEvents.on('*', ({ event }) => {
        if (event.startsWith('state:') && !event.includes('windows') && !event.includes('zCounter')) {
            OSStorage.saveSession();
        }
    });
  });
});
