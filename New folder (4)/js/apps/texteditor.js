/**
 * CloudsOS — Text Editor App
 */
(() => {
  function render(opts = {}) {
    const content = opts.content || '';
    const escaped = content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `
      <div class="app-toolbar">
        <button class="app-toolbar-btn" id="ed-new-btn">New</button>
        <button class="app-toolbar-btn" id="ed-save-btn">💾 Save</button>
        <span class="app-toolbar-sep"></span>
        <button class="app-toolbar-btn" id="ed-undo-btn">↩ Undo</button>
        <button class="app-toolbar-btn" id="ed-redo-btn">↪ Redo</button>
        <span class="app-toolbar-spacer"></span>
        <select id="ed-font-size" class="settings-select" style="padding:4px 8px;font-size:11px;">
          <option>12px</option><option selected>13px</option><option>14px</option><option>16px</option><option>18px</option>
        </select>
      </div>
      <div class="editor-body">
        <div class="editor-line-nums" id="ed-line-nums">1</div>
        <textarea id="editor-textarea" spellcheck="false" placeholder="Start typing…">${escaped}</textarea>
      </div>
      <div class="editor-status">
        <span id="ed-lines">1 line</span>
        <span id="ed-chars">0 chars</span>
        <span id="ed-cursor">Ln 1, Col 1</span>
        <span class="app-toolbar-spacer"></span>
        <span id="ed-modified" style="color:var(--accent-light)"></span>
        <span>Plain Text</span>
      </div>
    `;
  }

  function onOpen(wid, opts = {}) {
    const win = OSUtils.el(wid);
    if (!win) return;

    const ta       = win.querySelector('#editor-textarea');
    const lineNums = win.querySelector('#ed-line-nums');
    const linesEl  = win.querySelector('#ed-lines');
    const charsEl  = win.querySelector('#ed-chars');
    const cursorEl = win.querySelector('#ed-cursor');
    const modEl    = win.querySelector('#ed-modified');
    let _saved = ta.value;

    function updateStats() {
      const val  = ta.value;
      const lines = val.split('\n');
      linesEl.textContent = `${lines.length} line${lines.length!==1?'s':''}`;
      charsEl.textContent = `${val.length} chars`;
      modEl.textContent   = val !== _saved ? '● Unsaved' : '';
      // Line numbers
      lineNums.innerHTML = lines.map((_,i) => i+1).join('<br>');
      // Cursor position
      const before = val.slice(0, ta.selectionStart);
      const ln = before.split('\n').length;
      const col = before.split('\n').pop().length + 1;
      cursorEl.textContent = `Ln ${ln}, Col ${col}`;
    }

    ta.addEventListener('input', updateStats);
    ta.addEventListener('keyup', updateStats);
    ta.addEventListener('click', updateStats);

    win.querySelector('#ed-save-btn').addEventListener('click', () => {
      const key = `file_${opts.title || 'untitled'}_${wid}`;
      OSStorage.save(key, ta.value);
      _saved = ta.value;
      modEl.textContent = '';
      OSNotifications.show({ title: 'Saved', body: opts.title || 'Document saved.', type: 'success', duration: 2000 });
    });

    win.querySelector('#ed-new-btn').addEventListener('click', () => {
      if (ta.value !== _saved && !confirm('Discard changes?')) return;
      ta.value = ''; _saved = ''; updateStats();
    });

    win.querySelector('#ed-undo-btn').addEventListener('click', () => document.execCommand('undo'));
    win.querySelector('#ed-redo-btn').addEventListener('click', () => document.execCommand('redo'));

    win.querySelector('#ed-font-size').addEventListener('change', e => {
      ta.style.fontSize = e.target.value;
      lineNums.style.fontSize = e.target.value;
    });

    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = ta.selectionStart, end = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(end);
        ta.selectionStart = ta.selectionEnd = s + 2;
        updateStats();
      }
    });

    updateStats();
    ta.focus();
  }

  OSAppRegistry.register({
    id: 'texteditor',
    name: 'Text Editor',
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" stroke="url(#eg1)" stroke-width="1.5"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="url(#eg1)" stroke-width="1.5"/><defs><linearGradient id="eg1" x1="4" y1="4" x2="22" y2="22"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f87171"/></linearGradient></defs></svg>',
    category: 'productivity',
    color: 'linear-gradient(135deg,rgba(251,191,36,0.25),rgba(248,113,113,0.2))',
    defaultWidth: 700, defaultHeight: 500,
    render, onOpen,
  });
})();
