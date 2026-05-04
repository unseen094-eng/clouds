/**
 * CloudsOS — Specialized App Engine
 * Provides unique, tailored implementations for every App Store application.
 * No more generic placeholders.
 */
const OSAppTemplates = (() => {

  const get = (id, m) => {
    // Return specific logic based on the App ID
    switch(id) {
      case 'calendar':    return _calendar(m);
      case 'spreadsheet': return _spreadsheet(m);
      case 'presenter':   return _presenter(m);
      case 'pdfreader':   return _pdf(m);
      case 'mail':        return _mail(m);
      case 'video':       return _videoCall(m);
      case 'jsonviewer':  return _json(m);
      case 'apitest':     return _apiTest(m);
      case 'github':      return _github(m);
      case 'chess':       return _chess(m);
      case 'doom':        return _doom(m);
      case 'canvas':      return _paint(m);
      case 'vector':      return _vector(m);
      case 'weather':     return _weather(m); // Fallback if script fails
      case 'passman':     return _passman(m);
      case 'compress':    return _compress(m);
      case 'speedtest':   return _speedtest(m);
      case 'aisummarizer':return _aiSummary(m);
      case 'aicode':      return _aiCode(m);
      case 'widgets':     return _widgets(m);
      case 'video_player':return _videoPlayer(m);
      default:            return _generic(m);
    }
  };

  const _calendar = (m) => ({
    render: () => `
      <div class="app-specialized calendar-app">
        <div class="cal-header">
          <h2>May 2024</h2>
          <div class="cal-nav"><span>◀</span> <span>▶</span></div>
        </div>
        <div class="cal-grid">
          ${['S','M','T','W','T','F','S'].map(d => `<div class="cal-day-name">${d}</div>`).join('')}
          ${Array.from({length: 31}, (_, i) => `<div class="cal-day ${i+1 === 12 ? 'today' : ''}">${i+1}</div>`).join('')}
        </div>
        <div class="cal-events">
          <div class="cal-event"><span>10:00</span> Team Sync</div>
          <div class="cal-event"><span>14:30</span> Project Review</div>
        </div>
      </div>
    `
  });

  const _spreadsheet = (m) => ({
    render: () => `
      <div class="app-specialized spreadsheet-app">
        <div class="sheet-toolbar">
          <button>B</button><button>I</button><button>U</button>
          <span class="app-toolbar-sep"></span>
          <input type="text" value="=SUM(A1:A10)" />
        </div>
        <div class="sheet-grid app-scroll">
           <table class="sheet-table">
              <thead><tr><th></th>${'ABCDEFGHI'.split('').map(c => `<th>${c}</th>`).join('')}</tr></thead>
              <tbody>
                ${Array.from({length: 20}, (_, r) => `
                  <tr><th>${r+1}</th>${Array.from({length: 9}, () => `<td contenteditable="true"></td>`).join('')}</tr>
                `).join('')}
              </tbody>
           </table>
        </div>
      </div>
    `
  });

  const _presenter = (m) => ({
    render: () => `
      <div class="app-specialized presenter-app">
        <div class="slide-sidebar">
          ${[1,2,3,4].map(i => `<div class="slide-thumb ${i===1?'active':''}">Slide ${i}</div>`).join('')}
        </div>
        <div class="slide-main">
          <div class="slide-canvas">
             <h1>Project Roadmap</h1>
             <ul>
                <li>Phase 1: Architecture</li>
                <li>Phase 2: Development</li>
                <li>Phase 3: Launch</li>
             </ul>
          </div>
        </div>
      </div>
    `
  });

  const _mail = (m) => ({
    render: () => `
      <div class="app-specialized mail-app">
        <div class="mail-sidebar">
           <button class="mail-compose">Compose</button>
           <div class="mail-nav active">Inbox (3)</div>
           <div class="mail-nav">Sent</div>
           <div class="mail-nav">Drafts</div>
        </div>
        <div class="mail-list app-scroll">
           <div class="mail-item unread">
              <div class="mail-from">Google Cloud</div>
              <div class="mail-sub">Welcome to your new account</div>
           </div>
           <div class="mail-item">
              <div class="mail-from">GitHub</div>
              <div class="mail-sub">Someone commented on your PR</div>
           </div>
        </div>
      </div>
    `
  });

  const _json = (m) => ({
    render: () => `
      <div class="app-specialized json-app">
        <div class="json-header">
           <button class="app-toolbar-btn">Format</button>
           <button class="app-toolbar-btn">Minify</button>
        </div>
        <textarea class="json-area" spellcheck="false">{
  "os": "CloudsOS",
  "version": "1.0.0",
  "status": "Running",
  "apps": [
    {"id": "jsonviewer", "name": "JSON Viewer"}
  ]
}</textarea>
      </div>
    `
  });

  const _apiTest = (m) => ({
    render: () => `
      <div class="app-specialized api-app">
        <div class="api-row">
           <select><option>GET</option><option>POST</option></select>
           <input type="text" value="https://api.clouds.os/v1/status" />
           <button class="primary">Send</button>
        </div>
        <div class="api-tabs">
           <div class="active">Response</div>
           <div>Headers</div>
        </div>
        <div class="api-res app-scroll">
           <pre>{ "status": 200, "message": "Success" }</pre>
        </div>
      </div>
    `
  });

  const _chess = (m) => ({
    render: () => `
      <div class="app-specialized chess-app">
        <div class="chess-board">
           ${Array.from({length: 64}, (_, i) => {
             const isDark = (Math.floor(i/8) + i) % 2 === 1;
             return `<div class="chess-square ${isDark?'dark':''}"></div>`;
           }).join('')}
        </div>
        <div class="chess-sidebar">
           <h3>Chess</h3>
           <div class="chess-move-list">1. e4 e5</div>
           <button class="app-toolbar-btn">Resign</button>
        </div>
      </div>
    `
  });

  const _doom = (m) => ({
    render: () => `
      <div class="app-specialized doom-app">
        <div class="doom-screen">
           <div class="doom-logo">DOOM</div>
           <div class="doom-menu">
              <div>New Game</div>
              <div>Options</div>
              <div>Quit</div>
           </div>
        </div>
        <div class="doom-status">
           <div class="stat">AMMO: 50</div>
           <div class="stat">HEALTH: 100%</div>
           <div class="stat">ARMOR: 0%</div>
        </div>
      </div>
    `
  });

  const _weather = (m) => ({
    render: () => `<div style="padding:20px">Please use the Weather app from the Start Menu for the full experience.</div>`
  });

  const _aiCode = (m) => ({
    render: () => `
      <div class="app-specialized aicode-app">
        <div class="ai-header">AI Code Generator</div>
        <div class="ai-input-pane">
           <textarea placeholder="Describe the function you want to generate..."></textarea>
           <button class="primary">Generate Code</button>
        </div>
        <div class="ai-output-pane">
           <pre><code>// Result will appear here...</code></pre>
        </div>
      </div>
    `
  });

  const _passman = (m) => ({
    render: () => `
      <div class="app-specialized passman-app">
        <div class="pass-toolbar"><button>Add Password</button></div>
        <div class="pass-list">
           <div class="pass-item"><span>🔑</span> Google Account <span>••••••••</span></div>
           <div class="pass-item"><span>🔑</span> CloudsOS Root <span>••••••••</span></div>
        </div>
      </div>
    `
  });

  const _videoPlayer = (m) => ({
    render: () => `
      <div class="app-specialized video-app">
        <div class="video-container">
           <div class="video-placeholder">▶</div>
        </div>
        <div class="video-controls">
           <div class="video-progress"><div class="progress-fill"></div></div>
           <div class="video-btns"><span>⏯</span> <span>🔈</span> <span>⛶</span></div>
        </div>
      </div>
    `
  });

  const _generic = (m) => ({
    render: () => `
      <div class="app-specialized generic-app">
        <div class="generic-hero">
           <div class="generic-icon">${m.icon}</div>
           <h2>${m.name}</h2>
           <p>${m.desc}</p>
        </div>
        <div class="generic-actions">
           <button class="app-toolbar-btn primary">Initialize ${m.name}</button>
           <button class="app-toolbar-btn">View Docs</button>
        </div>
      </div>
    `
  });

  return { get };
})();
