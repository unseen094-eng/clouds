/**
 * CloudsOS — Clock App
 */
(() => {
  function render() {
    return `
      <div class="clock-body">
        <div class="clock-tabs">
          <button class="clock-tab active" data-tab="analog">Analog</button>
          <button class="clock-tab" data-tab="digital">Digital</button>
          <button class="clock-tab" data-tab="world">World</button>
        </div>
        <div id="clock-tab-analog">
          <div class="analog-clock" id="analog-clock">
            <div class="clock-hand hand-hour"   id="hand-hour"></div>
            <div class="clock-hand hand-minute" id="hand-minute"></div>
            <div class="clock-hand hand-second" id="hand-second"></div>
            <div class="clock-center"></div>
          </div>
        </div>
        <div id="clock-tab-digital" style="display:none;text-align:center">
          <div class="clock-digital" id="clock-digital">00:00:00</div>
          <div class="clock-date-str" id="clock-date-str"></div>
        </div>
        <div id="clock-tab-world" style="display:none;width:100%;max-width:340px">
          <div id="world-clocks" style="display:flex;flex-direction:column;gap:10px;width:100%"></div>
        </div>
      </div>
    `;
  }

  const WORLD_ZONES = [
    { label: 'New York',  tz: 'America/New_York' },
    { label: 'London',    tz: 'Europe/London' },
    { label: 'Dubai',     tz: 'Asia/Dubai' },
    { label: 'Mumbai',    tz: 'Asia/Kolkata' },
    { label: 'Tokyo',     tz: 'Asia/Tokyo' },
    { label: 'Sydney',    tz: 'Australia/Sydney' },
  ];

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;
    let activeTab = 'analog';
    let raf;

    function switchTab(tab) {
      activeTab = tab;
      win.querySelectorAll('.clock-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
      win.querySelector('#clock-tab-analog').style.display  = tab === 'analog'  ? '' : 'none';
      win.querySelector('#clock-tab-digital').style.display = tab === 'digital' ? '' : 'none';
      win.querySelector('#clock-tab-world').style.display   = tab === 'world'   ? '' : 'none';
      if (tab === 'world') renderWorldClocks();
    }

    function renderWorldClocks() {
      const container = win.querySelector('#world-clocks');
      container.innerHTML = '';
      WORLD_ZONES.forEach(zone => {
        const now = new Date().toLocaleTimeString('en-US', { timeZone: zone.tz, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
        const row = OSUtils.make('div', { style: { display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'rgba(255,255,255,0.04)', borderRadius:'8px', fontSize:'13px' } });
        row.innerHTML = `<span style="color:var(--text-secondary)">${zone.label}</span><span style="color:var(--text-primary);font-weight:600">${now}</span>`;
        container.appendChild(row);
      });
    }

    function tick() {
      const d = new Date();
      const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds(), ms = d.getMilliseconds();

      if (activeTab === 'analog') {
        const secDeg = (s + ms/1000) * 6;
        const minDeg = (m + s/60) * 6;
        const hrDeg  = ((h % 12) + m/60) * 30;
        const handH = win.querySelector('#hand-hour');
        const handM = win.querySelector('#hand-minute');
        const handS = win.querySelector('#hand-second');
        if (handH) handH.style.transform = `translateX(-50%) rotate(${hrDeg}deg)`;
        if (handM) handM.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
        if (handS) handS.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
      }

      if (activeTab === 'digital') {
        const digital = win.querySelector('#clock-digital');
        const dateStr = win.querySelector('#clock-date-str');
        if (digital) digital.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        if (dateStr) dateStr.textContent = OSUtils.formatFullDate(d);
      }

      if (activeTab === 'world' && s === 0) renderWorldClocks();

      raf = requestAnimationFrame(tick);
    }

    win.querySelectorAll('.clock-tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    tick();

    // Cleanup on close
    OSEvents.on('window:closed', ({ wid: closedWid }) => {
      if (closedWid === wid) cancelAnimationFrame(raf);
    });
  }

  OSAppRegistry.register({
    id: 'clock',
    name: 'Clock',
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="url(#clg1)" stroke-width="1.5"/><path d="M12 7v5l3 3" stroke="url(#clg1)" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="clg1" x1="3" y1="3" x2="21" y2="21"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs></svg>',
    category: 'utilities',
    color: 'linear-gradient(135deg,rgba(251,191,36,0.25),rgba(245,158,11,0.2))',
    defaultWidth: 380, defaultHeight: 420,
    render, onOpen,
  });
})();
