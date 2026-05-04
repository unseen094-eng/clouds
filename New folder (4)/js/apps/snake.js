/**
 * CloudsOS — Snake Game
 * A fully functional, unique implementation of the classic Snake arcade game.
 */
(() => {
  function render() {
    return `
      <div class="app-template game-snake">
        <div class="game-header">
          <div class="game-score">Score: <span id="snake-score">0</span> | High: <span id="snake-high">0</span></div>
          <div class="game-actions">
            <button class="app-toolbar-btn" id="snake-start">Start Game</button>
          </div>
        </div>
        <div class="snake-container">
          <canvas id="snake-canvas" width="400" height="400"></canvas>
          <div id="snake-overlay" class="game-overlay">
            <div class="overlay-content">
              <h1>SNAKE</h1>
              <p>Use Arrow Keys to move</p>
              <button class="app-toolbar-btn primary" id="snake-overlay-btn">Play Now</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function onOpen(wid) {
    const win = OSUtils.el(wid);
    const canvas = win.querySelector('#snake-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = win.querySelector('#snake-score');
    const highEl = win.querySelector('#snake-high');
    const overlay = win.querySelector('#snake-overlay');
    const startBtn = win.querySelector('#snake-start');
    const overlayBtn = win.querySelector('#snake-overlay-btn');

    const grid = 20;
    let count = 0;
    let score = 0;
    let high = localStorage.getItem('snake_high') || 0;
    highEl.textContent = high;

    let snake = {
      x: 160, y: 160, dx: grid, dy: 0,
      cells: [], maxCells: 4
    };
    let apple = { x: 320, y: 320 };

    function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }

    function reset() {
      snake.x = 160; snake.y = 160; snake.cells = []; snake.maxCells = 4;
      snake.dx = grid; snake.dy = 0;
      apple.x = getRandomInt(0, 20) * grid;
      apple.y = getRandomInt(0, 20) * grid;
      score = 0; scoreEl.textContent = '0';
    }

    let gameActive = false;
    let reqId = null;

    function loop() {
      if (!gameActive) return;
      reqId = requestAnimationFrame(loop);
      if (++count < 6) return; // Speed control
      count = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snake.x += snake.dx;
      snake.y += snake.dy;

      // Wrap snake position
      if (snake.x < 0) snake.x = canvas.width - grid;
      else if (snake.x >= canvas.width) snake.x = 0;
      if (snake.y < 0) snake.y = canvas.height - grid;
      else if (snake.y >= canvas.height) snake.y = 0;

      snake.cells.unshift({ x: snake.x, y: snake.y });
      if (snake.cells.length > snake.maxCells) snake.cells.pop();

      // Apple
      ctx.fillStyle = '#ff5f57';
      ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

      // Snake
      ctx.fillStyle = 'var(--accent)';
      snake.cells.forEach((cell, index) => {
        ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);
        if (cell.x === apple.x && cell.y === apple.y) {
          snake.maxCells++;
          score += 10;
          scoreEl.textContent = score;
          apple.x = getRandomInt(0, 20) * grid;
          apple.y = getRandomInt(0, 20) * grid;
        }
        // Collision check
        for (let i = index + 1; i < snake.cells.length; i++) {
          if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
            gameOver();
          }
        }
      });
    }

    function gameOver() {
      gameActive = false;
      overlay.style.display = 'flex';
      overlay.querySelector('h1').textContent = 'GAME OVER';
      overlay.querySelector('p').textContent = `Score: ${score}`;
      if (score > high) {
        high = score;
        highEl.textContent = high;
        localStorage.setItem('snake_high', high);
      }
    }

    const startGame = () => {
      overlay.style.display = 'none';
      gameActive = true;
      reset();
      cancelAnimationFrame(reqId);
      loop();
    };

    startBtn.onclick = startGame;
    overlayBtn.onclick = startGame;

    const handleKey = (e) => {
      if (e.key === 'ArrowLeft' && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
      else if (e.key === 'ArrowUp' && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
      else if (e.key === 'ArrowRight' && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
      else if (e.key === 'ArrowDown' && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }
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
    id: 'snake',
    name: 'Snake Game',
    icon: CloudAPI.ICONS.snake,
    category: 'entertainment',
    color: 'linear-gradient(135deg,#22c55e, #10b981)',
    defaultWidth: 440, defaultHeight: 520,
    render, onOpen,
  });
})();
