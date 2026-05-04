/**
 * CloudsOS — Code Editor
 * Unique IDE-like interface with folder tree and syntax-colored code preview.
 */
(() => {
  function render() {
    return `
      <div class="code-ide">
        <div class="ide-sidebar">
          <div class="ide-title">PROJECT</div>
          <div class="ide-tree">
            <div class="tree-item folder"><span>📁</span> src</div>
            <div class="tree-item file active"><span>📄</span> main.js</div>
            <div class="tree-item file"><span>📄</span> api.js</div>
            <div class="tree-item folder"><span>📁</span> assets</div>
          </div>
        </div>
        <div class="ide-main">
          <div class="ide-tabs">
            <div class="ide-tab active">main.js ✕</div>
            <div class="ide-tab">api.js ✕</div>
          </div>
          <div class="ide-editor">
            <div class="line-numbers" id="ide-lines"></div>
            <textarea id="ide-area" spellcheck="false">/**
 * CloudsOS App Logic
 */
async function init() {
  console.log("Initializing...");
  const res = await CloudAPI.files.list("/");
  if (res.success) {
    console.log("Ready!");
  }
}

init();</textarea>
          </div>
          <div class="ide-status">
            <span>JavaScript</span>
            <span>UTF-8</span>
            <span>Line 1, Col 1</span>
          </div>
        </div>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    const area = win.querySelector('#ide-area');
    const lines = win.querySelector('#ide-lines');

    function updateLines() {
      const count = area.value.split('\n').length;
      lines.innerHTML = Array.from({length: count}, (_, i) => `<div>${i+1}</div>`).join('');
    }

    area.oninput = updateLines;
    area.onscroll = () => { lines.scrollTop = area.scrollTop; };
    
    updateLines();
  }

  OSAppRegistry.register({
    id: 'code',
    name: 'Code Editor',
    icon: CloudAPI.ICONS.code,
    category: 'development',
    color: 'linear-gradient(135deg, #1e293b, #0f172a)',
    defaultWidth: 900, defaultHeight: 600,
    render, onOpen,
  });
})();
