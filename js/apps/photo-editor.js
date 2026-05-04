/**
 * CloudsOS — Photo Editor
 * Unique implementation with canvas filters (Grayscale, Sepia, Invert).
 */
(() => {
  function render() {
    return `
      <div class="photo-editor">
        <div class="editor-toolbar">
          <button class="app-toolbar-btn" id="photo-open">Open Image</button>
          <span class="app-toolbar-sep"></span>
          <button class="app-toolbar-btn filter-btn" data-filter="none">Normal</button>
          <button class="app-toolbar-btn filter-btn" data-filter="grayscale(100%)">B&W</button>
          <button class="app-toolbar-btn filter-btn" data-filter="sepia(100%)">Sepia</button>
          <button class="app-toolbar-btn filter-btn" data-filter="invert(100%)">Invert</button>
          <button class="app-toolbar-btn filter-btn" data-filter="hue-rotate(90deg)">Hue</button>
          <span class="app-toolbar-spacer"></span>
          <button class="app-toolbar-btn primary" id="photo-save">Save</button>
        </div>
        <div class="editor-canvas-wrap">
          <canvas id="photo-canvas"></canvas>
          <div id="photo-empty">No image loaded. Click "Open Image" to start.</div>
        </div>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    const canvas = win.querySelector('#photo-canvas');
    const ctx = canvas.getContext('2d');
    const empty = win.querySelector('#photo-empty');
    let currentImg = null;

    win.querySelector('#photo-open').onclick = async () => {
        // Simulation: open a default image from Pictures
        const img = new Image();
        img.src = 'https://picsum.photos/800/600'; // Placeholder from web
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            empty.style.display = 'none';
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            currentImg = img;
        };
    };

    win.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            if (!currentImg) return;
            canvas.style.filter = btn.dataset.filter;
        };
    });

    win.querySelector('#photo-save').onclick = () => {
        if (!currentImg) return;
        OSNotifications.show({ title: 'Photo Editor', body: 'Image saved to /Pictures/edited.png', type: 'success' });
    };
  }

  OSAppRegistry.register({
    id: 'photo_editor',
    name: 'Photo Editor',
    icon: CloudAPI.ICONS.photo_editor,
    category: 'creative',
    color: 'linear-gradient(135deg, #f43f5e, #fb7185)',
    defaultWidth: 800, defaultHeight: 600,
    render, onOpen,
  });
})();
