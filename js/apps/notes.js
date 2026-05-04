/**
 * CloudsOS — Notes App
 * Refactored to use CloudAPI for data persistence.
 */
(() => {
  function render() {
    return `
      <div class="notes-layout">
        <div class="notes-sidebar">
          <button class="notes-add-btn" id="notes-add">+ New Note</button>
          <div class="notes-list app-scroll" id="notes-list"></div>
        </div>
        <div class="notes-content">
          <div id="notes-loading" style="position:absolute; inset:0; background:rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; z-index:10; backdrop-filter:blur(4px); transition:opacity 0.3s; pointer-events:none; opacity:0;">Loading...</div>
          <input type="text" class="notes-title-input" id="notes-title" placeholder="Title..." />
          <textarea class="notes-area app-scroll" id="notes-body" placeholder="Write something..."></textarea>
          <div class="notes-footer">
            <span id="notes-status">Syncing...</span>
            <button class="app-toolbar-btn" id="notes-delete">Delete</button>
          </div>
        </div>
      </div>
    `;
  }

  async function onOpen(wid) {
    const win = OSUtils.el(wid);
    if (!win) return;

    const loader = win.querySelector('#notes-loading');
    const status = win.querySelector('#notes-status');
    const listEl = win.querySelector('#notes-list');
    const titleIn = win.querySelector('#notes-title');
    const bodyIn = win.querySelector('#notes-body');

    loader.style.opacity = '1';
    
    // Load data from CloudAPI
    const res = await CloudAPI.files.read('/Documents/notes_db.json');
    let notes = [];
    if (res.success && res.data) {
      try { notes = JSON.parse(res.data.content); } catch(e) { notes = []; }
    } else {
      notes = [{ id: 1, title: 'Welcome', body: 'This is your first note in Clouds OS!' }];
      await CloudAPI.files.write('/Documents/notes_db.json', JSON.stringify(notes));
    }
    
    let activeId = notes[0]?.id || null;
    loader.style.opacity = '0';
    status.textContent = 'Ready';

    let saveTimeout;
    function triggerSave() {
      status.textContent = 'Saving...';
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(async () => {
        await CloudAPI.files.write('/Documents/notes_db.json', JSON.stringify(notes));
        status.textContent = 'Saved';
      }, 1000);
    }

    function renderList() {
      listEl.innerHTML = '';
      notes.forEach(note => {
        const item = OSUtils.make('div', { className: `notes-item ${note.id === activeId ? 'active' : ''}` });
        item.innerHTML = `
          <div class="notes-item-title">${note.title || 'Untitled'}</div>
          <div class="notes-item-preview">${note.body.substring(0, 30)}...</div>
        `;
        item.addEventListener('click', () => {
          activeId = note.id;
          loadActive();
          renderList();
        });
        listEl.appendChild(item);
      });
    }

    function loadActive() {
      const note = notes.find(n => n.id === activeId);
      if (note) {
        titleIn.value = note.title;
        bodyIn.value = note.body;
      } else {
        titleIn.value = '';
        bodyIn.value = '';
      }
    }

    titleIn.addEventListener('input', () => {
      const note = notes.find(n => n.id === activeId);
      if (note) { 
        note.title = titleIn.value; 
        renderList();
        triggerSave();
      }
    });

    bodyIn.addEventListener('input', () => {
      const note = notes.find(n => n.id === activeId);
      if (note) { 
        note.body = bodyIn.value; 
        renderList();
        triggerSave();
      }
    });

    win.querySelector('#notes-add').addEventListener('click', () => {
      const newNote = { id: Date.now(), title: 'New Note', body: '' };
      notes.unshift(newNote);
      activeId = newNote.id;
      loadActive();
      renderList();
      triggerSave();
    });

    win.querySelector('#notes-delete').addEventListener('click', () => {
      if (!confirm('Delete this note?')) return;
      notes = notes.filter(n => n.id !== activeId);
      activeId = notes[0]?.id || null;
      loadActive();
      renderList();
      triggerSave();
    });

    renderList();
    loadActive();
  }

  OSAppRegistry.register({
    id: 'notes',
    name: 'Notes',
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="url(#ng1)" stroke-width="1.5"/><path d="M7 7h10M7 12h10M7 17h6" stroke="url(#ng1)" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="ng1" x1="3" y1="3" x2="21" y2="21"><stop stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs></svg>',
    category: 'productivity',
    color: 'linear-gradient(135deg,rgba(251,191,36,0.25),rgba(245,158,11,0.2))',
    defaultWidth: 600, defaultHeight: 450,
    render, onOpen,
  });
})();
