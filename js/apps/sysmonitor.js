/**
 * CloudsOS — System Monitor App
 */
(() => {
  function render() {
    return `
      <div class="sys-monitor">
        <div class="sys-header">
          <div class="sys-tab active" data-tab="cpu">CPU</div>
          <div class="sys-tab" data-tab="memory">Memory</div>
          <div class="sys-tab" data-tab="network">Network</div>
          <div class="sys-tab" data-tab="processes">Processes</div>
        </div>
        <div class="sys-content app-scroll">
          <div id="sys-view-cpu" class="sys-view active">
            <div class="sys-stats-grid">
              <div class="sys-stat-card">
                <div class="sys-stat-label">Usage</div>
                <div class="sys-stat-value" id="cpu-usage">0%</div>
                <div class="sys-progress-bg"><div class="sys-progress-fill" id="cpu-fill"></div></div>
              </div>
              <div class="sys-stat-card">
                <div class="sys-stat-label">Speed</div>
                <div class="sys-stat-value">3.40 GHz</div>
              </div>
              <div class="sys-stat-card">
                <div class="sys-stat-label">Cores</div>
                <div class="sys-stat-value">8 Cores</div>
              </div>
            </div>
            <canvas id="cpu-chart" style="width:100%; height:150px; margin-top:20px;"></canvas>
          </div>
          <div id="sys-view-memory" class="sys-view">
             <div class="sys-stat-card">
                <div class="sys-stat-label">Memory Usage</div>
                <div class="sys-stat-value" id="mem-usage">2.4 / 16.0 GB</div>
                <div class="sys-progress-bg"><div class="sys-progress-fill" id="mem-fill" style="width:15%"></div></div>
              </div>
          </div>
          <div id="sys-view-processes" class="sys-view">
            <table class="sys-table">
              <thead>
                <tr><th>Process</th><th>CPU</th><th>Memory</th></tr>
              </thead>
              <tbody id="proc-list">
                <tr><td>System Kernel</td><td>0.1%</td><td>42 MB</td></tr>
                <tr><td>Window Manager</td><td>0.5%</td><td>120 MB</td></tr>
                <tr><td>Desktop Shell</td><td>0.2%</td><td>85 MB</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;

    let raf;
    const cpuVal = win.querySelector('#cpu-usage');
    const cpuFill = win.querySelector('#cpu-fill');
    const procList = win.querySelector('#proc-list');
    
    // Tab switching
    win.querySelectorAll('.sys-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        win.querySelectorAll('.sys-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        win.querySelectorAll('.sys-view').forEach(v => v.classList.remove('active'));
        win.querySelector(`#sys-view-${tab.dataset.tab}`).classList.add('active');
      });
    });

    // Mock CPU Data loop
    function update() {
      const usage = Math.floor(Math.random() * 20) + 5;
      cpuVal.textContent = usage + '%';
      cpuFill.style.width = usage + '%';
      
      // Update process list occasionally
      if (Math.random() > 0.95) {
        const running = Array.from(OSState.get('runningApps')).map(id => {
          return `<tr><td>${id}</td><td>${(Math.random()*2).toFixed(1)}%</td><td>${Math.floor(Math.random()*100 + 50)} MB</td></tr>`;
        }).join('');
        procList.innerHTML = `
          <tr><td>System Kernel</td><td>0.1%</td><td>42 MB</td></tr>
          <tr><td>Window Manager</td><td>0.5%</td><td>120 MB</td></tr>
          ${running}
        `;
      }

      raf = setTimeout(update, 1000);
    }

    update();

    OSEvents.on('window:closed', ({ wid: id }) => {
      if (id === wid) clearTimeout(raf);
    });
  }

  OSAppRegistry.register({
    id: 'sysmonitor',
    name: 'System Monitor',
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 13h4l2-6 3 12 2-9 3 3h4" stroke="url(#sg1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="sg1" x1="3" y1="7" x2="21" y2="17"><stop stop-color="#34d399"/><stop offset="1" stop-color="#10b981"/></linearGradient></defs></svg>',
    category: 'system',
    color: 'linear-gradient(135deg,rgba(52,211,153,0.25),rgba(16,185,129,0.2))',
    defaultWidth: 500, defaultHeight: 400,
    render, onOpen,
  });
})();
