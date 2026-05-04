/**
 * CloudsOS — Live Wallpaper System
 * Modular architecture for high-performance interactive backgrounds.
 */

/* ── Base Wallpaper Interface ── */
class BaseWallpaper {
  constructor(container) {
    this.container = container;
    this.active = false;
  }
  init() { this.active = true; }
  render(time) {}
  destroy() { 
    this.active = false; 
    this.container.innerHTML = '';
  }
}

/* ── 1. Animated Gradient Sky ── */
class GradientWallpaper extends BaseWallpaper {
  init() {
    super.init();
    const el = document.createElement('div');
    el.className = 'wp-gradient';
    this.container.appendChild(el);
  }
}

/* ── 2. CSS Cloud Layers ── */
class CloudLayerWallpaper extends BaseWallpaper {
  constructor(container) {
    super(container);
    this.clouds = [];
  }

  init() {
    super.init();
    const cloudCount = 6;
    for (let i = 0; i < cloudCount; i++) {
      this._createCloud(i);
    }
  }

  _createCloud(index) {
    const cloud = document.createElement('div');
    cloud.className = 'wp-cloud-layer cloud-anim-float';
    
    const size = 200 + Math.random() * 300;
    const top = 10 + Math.random() * 60;
    const duration = 40 + Math.random() * 60;
    const delay = Math.random() * -100;
    const opacity = 0.1 + Math.random() * 0.3;

    cloud.style.cssText = `
      width: ${size}px;
      height: ${size * 0.6}px;
      top: ${top}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      opacity: ${opacity};
      background: radial-gradient(circle, #fff, transparent 70%);
      border-radius: 50%;
    `;

    this.container.appendChild(cloud);
    this.clouds.push(cloud);
  }
}

/* ── 3. Canvas Particle Clouds ── */
class ParticleWallpaper extends BaseWallpaper {
  constructor(container) {
    super(container);
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
  }

  init() {
    super.init();
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'wallpaper-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this._resize();
    this._createParticles();
    
    window.addEventListener('resize', this._resize.bind(this));
    window.addEventListener('mousemove', this._onMouseMove.bind(this));
  }

  _resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _onMouseMove(e) {
    this.targetMouseX = e.clientX;
    this.targetMouseY = e.clientY;
  }

  _createParticles() {
    const count = 50;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: 2 + Math.random() * 80,
        opacity: 0.05 + Math.random() * 0.1
      });
    }
  }

  render() {
    if (!this.active || !this.ctx) return;
    
    // Smooth mouse follow
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      // Drift
      p.x += p.vx;
      p.y += p.vy;

      // Mouse interaction (gently repel)
      const dx = p.x - this.mouseX;
      const dy = p.y - this.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 300) {
        p.x += dx * 0.0001;
        p.y += dy * 0.0001;
      }

      // Wrap
      if (p.x < -p.size) p.x = this.canvas.width + p.size;
      if (p.x > this.canvas.width + p.size) p.x = -p.size;
      if (p.y < -p.size) p.y = this.canvas.height + p.size;
      if (p.y > this.canvas.height + p.size) p.y = -p.size;

      // Draw
      this.ctx.beginPath();
      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  destroy() {
    super.destroy();
    window.removeEventListener('resize', this._resize);
    window.removeEventListener('mousemove', this._onMouseMove);
  }
}

/* ── 4. Interactive Gradient Motion ── */
class InteractiveWallpaper extends BaseWallpaper {
  constructor(container) {
    super(container);
    this.mouseX = 0.5;
    this.mouseY = 0.5;
  }

  init() {
    super.init();
    const el = document.createElement('div');
    el.className = 'wp-gradient';
    el.id = 'interactive-wp';
    this.container.appendChild(el);
    window.addEventListener('mousemove', this._onMouseMove.bind(this));
  }

  _onMouseMove(e) {
    this.mouseX = e.clientX / window.innerWidth;
    this.mouseY = e.clientY / window.innerHeight;
    const el = document.getElementById('interactive-wp');
    if (el) {
      el.style.setProperty('--mouse-x', `${this.mouseX * 100}%`);
      el.style.setProperty('--mouse-y', `${this.mouseY * 100}%`);
      // Apply slight offset to simulate depth
      const moveX = (this.mouseX - 0.5) * 20;
      const moveY = (this.mouseY - 0.5) * 20;
      el.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
    }
  }

  destroy() {
    super.destroy();
    window.removeEventListener('mousemove', this._onMouseMove);
  }
}

/* ── Wallpaper Manager Singleton ── */
const OSWallpaper = (() => {
  let _container = null;
  let _currentInstance = null;
  let _types = {
    'gradient': GradientWallpaper,
    'clouds': CloudLayerWallpaper,
    'particles': ParticleWallpaper,
    'interactive': InteractiveWallpaper
  };
  let _raf = null;
  let _paused = false;

  function init() {
    _container = OSUtils.el('desktop-wallpaper');
    
    // Visibility API to pause when inactive
    document.addEventListener('visibilitychange', () => {
      _paused = document.hidden;
    });

    const savedType = OSState.get('wallpaperType') || 'gradient';
    setWallpaper(savedType);

    _loop();
  }

  function setWallpaper(type) {
    if (_currentInstance) _currentInstance.destroy();
    
    const WallpaperClass = _types[type] || GradientWallpaper;
    _currentInstance = new WallpaperClass(_container);
    _currentInstance.init();
    
    OSState.set('wallpaperType', type);
    OSStorage.saveSession();
    
    OSEvents.emit('wallpaper:changed', type);
  }

  function _loop(time) {
    const isAnimDisabled = document.querySelector('.desktop')?.classList.contains('no-animations');
    if (!_paused && !isAnimDisabled && _currentInstance && _currentInstance.render) {
      _currentInstance.render(time);
    }
    _raf = requestAnimationFrame(_loop);
  }

  function toggleAnimations(enabled) {
    const desktop = OSUtils.el('desktop');
    desktop.classList.toggle('no-animations', !enabled);
    OSState.patch('settings', { animations: enabled });
    OSStorage.saveSession();
  }

  return { init, setWallpaper, toggleAnimations, getTypes: () => Object.keys(_types) };
})();
