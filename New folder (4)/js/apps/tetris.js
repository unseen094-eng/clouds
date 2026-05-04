/**
 * CloudsOS — Tetris Game
 * Unique implementation of the classic block-stacking game.
 */
(() => {
  function render() {
    return `
      <div class="app-template game-tetris">
        <div class="game-header">
          <div class="game-score">Lines: <span id="tetris-lines">0</span></div>
          <button class="app-toolbar-btn" id="tetris-start">New Game</button>
        </div>
        <div class="tetris-container">
           <canvas id="tetris-canvas" width="240" height="400"></canvas>
           <div id="tetris-overlay" class="game-overlay">
              <div class="overlay-content">
                <h1>TETRIS</h1>
                <p>Arrows to Move & Rotate</p>
                <button class="app-toolbar-btn primary" id="tetris-play-btn">Play</button>
              </div>
           </div>
        </div>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    const canvas = win.querySelector('#tetris-canvas');
    const ctx = canvas.getContext('2d');
    const linesEl = win.querySelector('#tetris-lines');
    const overlay = win.querySelector('#tetris-overlay');
    const playBtn = win.querySelector('#tetris-play-btn');
    const startBtn = win.querySelector('#tetris-start');

    ctx.scale(20, 20);

    function arenaSweep() {
      let rowCount = 1;
      outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
          if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
      }
      linesEl.textContent = player.score;
    }

    function collide(arena, player) {
      const [m, o] = [player.matrix, player.pos];
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
          if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
        }
      }
      return false;
    }

    function createMatrix(w, h) {
      const matrix = [];
      while (h--) matrix.push(new Array(w).fill(0));
      return matrix;
    }

    function createPiece(type) {
      if (type === 'T') return [[0,0,0],[1,1,1],[0,1,0]];
      else if (type === 'O') return [[2,2],[2,2]];
      else if (type === 'L') return [[0,3,0],[0,3,0],[0,3,3]];
      else if (type === 'J') return [[0,4,0],[0,4,0],[4,4,0]];
      else if (type === 'I') return [[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]];
      else if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
      else if (type === 'Z') return [[7,7,0],[0,7,7],[0,0,0]];
    }

    function draw() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawMatrix(arena, {x: 0, y: 0});
      drawMatrix(player.matrix, player.pos);
    }

    function drawMatrix(matrix, offset) {
      const colors = [null, '#7c6ff7', '#facc15', '#f472b6', '#3b82f6', '#2dd4bf', '#fb923c', '#ef4444'];
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            ctx.fillStyle = colors[value];
            ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
          }
        });
      });
    }

    function merge(arena, player) {
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
        });
      });
    }

    function rotate(matrix, dir) {
      for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
      }
      if (dir > 0) matrix.forEach(row => row.reverse());
      else matrix.reverse();
    }

    function playerDrop() {
      player.pos.y++;
      if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
      }
      dropCounter = 0;
    }

    function playerMove(dir) {
      player.pos.x += dir;
      if (collide(arena, player)) player.pos.x -= dir;
    }

    function playerReset() {
      const pieces = 'ILJOTSZ';
      player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
      player.pos.y = 0;
      player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
      if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        linesEl.textContent = 0;
        gameOver();
      }
    }

    function gameOver() {
        gameActive = false;
        overlay.style.display = 'flex';
        overlay.querySelector('h1').textContent = 'GAME OVER';
    }

    function playerRotate(dir) {
      const pos = player.pos.x;
      let offset = 1;
      rotate(player.matrix, dir);
      while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
          rotate(player.matrix, -dir);
          player.pos.x = pos;
          return;
        }
      }
    }

    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let gameActive = false;

    function update(time = 0) {
      if (!gameActive) return;
      const deltaTime = time - lastTime;
      lastTime = time;
      dropCounter += deltaTime;
      if (dropCounter > dropInterval) playerDrop();
      draw();
      reqId = requestAnimationFrame(update);
    }

    const arena = createMatrix(12, 20);
    const player = { pos: {x: 0, y: 0}, matrix: null, score: 0 };

    let reqId = null;

    const start = () => {
        overlay.style.display = 'none';
        gameActive = true;
        playerReset();
        update();
    };

    playBtn.onclick = start;
    startBtn.onclick = start;

    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') playerMove(-1);
      else if (e.key === 'ArrowRight') playerMove(1);
      else if (e.key === 'ArrowDown') playerDrop();
      else if (e.key === 'ArrowUp') playerRotate(1);
      else if (e.key === 'q') playerRotate(-1);
      else if (e.key === 'w') playerRotate(1);
    };

    document.addEventListener('keydown', handleKey);

    OSEvents.on('window:closed', ({ wid: closedWid }) => {
      if (closedWid === wid) {
        gameActive = false;
        cancelAnimationFrame(reqId);
        document.removeEventListener('keydown', handleKey);
      }
    });
  }

  OSAppRegistry.register({
    id: 'tetris',
    name: 'Tetris',
    icon: CloudAPI.ICONS.tetris,
    category: 'entertainment',
    color: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    defaultWidth: 320, defaultHeight: 520,
    render, onOpen,
  });
})();
