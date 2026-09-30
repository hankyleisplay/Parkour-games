/**
 * All-in-One Retro Arcade Platform Engine
 * 包含：2048、俄羅斯方塊 (Tetris)、貪吃蛇 (Snake) 以及各自的 AI Demo Mode 自動遊玩引擎
 */

// ==========================================
// 1. 2048 益智方塊 (含 Expectimax/Heuristic AI)
// ==========================================
class Game2048 {
  constructor(audioGetter) {
    this.getAudio = audioGetter;
    this.size = 4;
    this.grid = [];
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('arcade_2048_best') || '0', 10);
    this.prevState = null;
    this.isGameOver = false;
    this.isActiveGame = false;
    this.isDemoMode = false;
    this.aiTimer = null;

    this.boardEl = document.getElementById('board-2048');
    this.scoreEl = document.getElementById('score-2048');
    this.bestEl = document.getElementById('best-2048');
    this.statusEl = document.getElementById('status-2048');
    this.overlayEl = document.getElementById('overlay-2048');
    this.overlayTitleEl = document.getElementById('overlay-2048-title');

    this.bindEvents();
    this.resetGame();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActiveGame) return;

      if (e.code === 'KeyM') {
        e.preventDefault();
        this.toggleDemoMode();
        return;
      }

      if (this.isDemoMode) return;

      let moved = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        moved = this.move('UP');
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        moved = this.move('DOWN');
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        moved = this.move('LEFT');
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        moved = this.move('RIGHT');
      }

      if (moved) {
        const audio = this.getAudio();
        if (audio) audio.playBump();
      }
    });

    // 觸控滑動支援
    let touchStartX = 0;
    let touchStartY = 0;
    if (this.boardEl) {
      this.boardEl.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      this.boardEl.addEventListener('touchend', (e) => {
        if (!this.isActiveGame || this.isDemoMode || e.changedTouches.length === 0) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) {
          if (Math.abs(dx) > Math.abs(dy)) {
            this.move(dx > 0 ? 'RIGHT' : 'LEFT');
          } else {
            this.move(dy > 0 ? 'DOWN' : 'UP');
          }
        }
      }, { passive: true });
    }

    const newBtn = document.getElementById('btn-2048-new');
    if (newBtn) newBtn.addEventListener('click', () => this.resetGame());

    const retryBtn = document.getElementById('btn-2048-retry');
    if (retryBtn) retryBtn.addEventListener('click', () => this.resetGame());

    const undoBtn = document.getElementById('btn-2048-undo');
    if (undoBtn) undoBtn.addEventListener('click', () => this.undoMove());

    const demoBtn = document.getElementById('btn-2048-demo');
    if (demoBtn) demoBtn.addEventListener('click', () => this.toggleDemoMode());
  }

  resetGame() {
    this.grid = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
    this.score = 0;
    this.prevState = null;
    this.isGameOver = false;
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
    this.addRandomTile();
    this.addRandomTile();
    this.render();
  }

  undoMove() {
    if (!this.prevState || this.isDemoMode) return;
    this.grid = this.prevState.grid.map(r => [...r]);
    this.score = this.prevState.score;
    this.isGameOver = false;
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
    this.prevState = null;
    this.render();
  }

  addRandomTile(targetGrid = this.grid) {
    const empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (targetGrid[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return false;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    targetGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  // 純函數模擬單步移動，供真實操作與 AI 評估共用
  simulateMove(grid, dir) {
    const newGrid = grid.map(r => [...r]);
    let gainedScore = 0;
    let moved = false;

    const slideLine = (line) => {
      const filtered = line.filter(v => v !== 0);
      const merged = [];
      for (let i = 0; i < filtered.length; i++) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          const val = filtered[i] * 2;
          merged.push(val);
          gainedScore += val;
          i++;
        } else {
          merged.push(filtered[i]);
        }
      }
      while (merged.length < 4) merged.push(0);
      return merged;
    };

    if (dir === 'LEFT' || dir === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        const row = dir === 'LEFT' ? [...newGrid[r]] : [...newGrid[r]].reverse();
        const res = slideLine(row);
        const finalRow = dir === 'LEFT' ? res : res.reverse();
        for (let c = 0; c < 4; c++) {
          if (newGrid[r][c] !== finalRow[c]) moved = true;
          newGrid[r][c] = finalRow[c];
        }
      }
    } else {
      for (let c = 0; c < 4; c++) {
        const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
        if (dir === 'DOWN') col.reverse();
        const res = slideLine(col);
        const finalCol = dir === 'UP' ? res : res.reverse();
        for (let r = 0; r < 4; r++) {
          if (newGrid[r][c] !== finalCol[r]) moved = true;
          newGrid[r][c] = finalCol[r];
        }
      }
    }

    return { grid: newGrid, gainedScore, moved };
  }

  move(dir) {
    if (this.isGameOver) return false;
    const res = this.simulateMove(this.grid, dir);
    if (!res.moved) return false;

    this.prevState = {
      grid: this.grid.map(r => [...r]),
      score: this.score
    };

    this.grid = res.grid;
    this.score += res.gainedScore;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('arcade_2048_best', this.bestScore.toString());
      if (window.arcadePlatform) window.arcadePlatform.refreshHighScores();
    }

    if (res.gainedScore >= 64) {
      const audio = this.getAudio();
      if (audio) audio.playCoin();
    }

    this.addRandomTile();
    this.checkGameOver();
    this.render();
    return true;
  }

  checkGameOver() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] === 0) return false;
        if (c < 3 && this.grid[r][c] === this.grid[r][c + 1]) return false;
        if (r < 3 && this.grid[r][c] === this.grid[r + 1][c]) return false;
      }
    }
    this.isGameOver = true;
    if (this.overlayTitleEl) this.overlayTitleEl.textContent = 'GAME OVER!';
    if (this.overlayEl) this.overlayEl.classList.remove('hidden');

    if (this.isDemoMode) {
      setTimeout(() => {
        if (this.isDemoMode && this.isGameOver && this.isActiveGame) {
          this.resetGame();
        }
      }, 1500);
    }
    return true;
  }

  // AI 盤面啟發式評分 (Snake Weight Matrix + Empty Cells + Smoothness)
  evaluateBoard(grid) {
    const weights = [
      [65536, 32768, 16384, 8192],
      [512,   1024,  2048,  4096],
      [256,   128,   64,    32],
      [2,     4,     8,     16]
    ];

    let weightScore = 0;
    let emptyCount = 0;
    let smoothness = 0;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = grid[r][c];
        if (val === 0) {
          emptyCount++;
        } else {
          weightScore += val * weights[r][c];
          if (c < 3 && grid[r][c + 1] > 0) {
            smoothness -= Math.abs(Math.log2(val) - Math.log2(grid[r][c + 1]));
          }
          if (r < 3 && grid[r + 1][c] > 0) {
            smoothness -= Math.abs(Math.log2(val) - Math.log2(grid[r + 1][c]));
          }
        }
      }
    }

    return weightScore + emptyCount * 4096 + smoothness * 256;
  }

  computeBestAIMove() {
    const dirs = ['UP', 'LEFT', 'RIGHT', 'DOWN'];
    let bestDir = null;
    let bestScore = -Infinity;

    for (const d1 of dirs) {
      const step1 = this.simulateMove(this.grid, d1);
      if (!step1.moved) continue;

      // 2層前瞻搜尋 (Expectimax 簡化近似)
      let worstSpawnScore = 0;
      const empties = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (step1.grid[r][c] === 0) empties.push([r, c]);
        }
      }

      const sampleEmpties = empties.slice(0, 6);
      if (sampleEmpties.length === 0) {
        worstSpawnScore = this.evaluateBoard(step1.grid);
      } else {
        let sumSecond = 0;
        for (const [er, ec] of sampleEmpties) {
          const testGrid = step1.grid.map(row => [...row]);
          testGrid[er][ec] = 2;
          let maxStep2 = this.evaluateBoard(testGrid);
          for (const d2 of dirs) {
            const step2 = this.simulateMove(testGrid, d2);
            if (step2.moved) {
              const s2 = this.evaluateBoard(step2.grid) + step2.gainedScore * 16;
              if (s2 > maxStep2) maxStep2 = s2;
            }
          }
          sumSecond += maxStep2;
        }
        worstSpawnScore = sumSecond / sampleEmpties.length;
      }

      const totalEval = worstSpawnScore + step1.gainedScore * 24;
      if (totalEval > bestScore) {
        bestScore = totalEval;
        bestDir = d1;
      }
    }

    return bestDir;
  }

  toggleDemoMode(forceState) {
    this.isDemoMode = typeof forceState === 'boolean' ? forceState : !this.isDemoMode;
    if (this.aiTimer) {
      clearInterval(this.aiTimer);
      this.aiTimer = null;
    }

    if (this.isDemoMode) {
      if (this.isGameOver) this.resetGame();
      this.aiTimer = setInterval(() => {
        if (!this.isActiveGame || !this.isDemoMode || this.isGameOver) return;
        const bestDir = this.computeBestAIMove();
        if (bestDir) {
          this.move(bestDir);
          if (this.statusEl) {
            this.statusEl.textContent = `🤖 AI 決策方向: ${bestDir}`;
          }
        } else {
          this.checkGameOver();
        }
      }, 150);
    } else if (this.statusEl) {
      this.statusEl.textContent = '使用 WASD 或 方向鍵 合併相同數字方塊！';
    }

    this.syncDemoUI();
    return this.isDemoMode;
  }

  syncDemoUI() {
    const demoBtn = document.getElementById('btn-2048-demo');
    if (demoBtn) {
      demoBtn.classList.toggle('active-demo', this.isDemoMode);
      demoBtn.textContent = this.isDemoMode ? '🤖 AI 代玩: ON' : '🤖 AI Demo Mode';
    }
    const globalDemoBtn = document.getElementById('global-demo-btn');
    if (globalDemoBtn && this.isActiveGame) {
      globalDemoBtn.classList.toggle('active-demo', this.isDemoMode);
      globalDemoBtn.innerHTML = this.isDemoMode
        ? '<span>🤖 AI 自動玩: 開啟中</span>'
        : '<span>🤖 Demo Mode (AI 代玩)</span>';
    }
  }

  pauseForSwitch() {
    // 切換離開時不需額外清理，interval 會檢查 isActiveGame
  }

  render() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.bestEl) this.bestEl.textContent = this.bestScore;
    if (!this.boardEl) return;

    this.boardEl.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = this.grid[r][c];
        const cell = document.createElement('div');
        cell.className = `tile-2048 tile-v-${val > 2048 ? 'super' : val}`;
        cell.textContent = val > 0 ? val : '';
        this.boardEl.appendChild(cell);
      }
    }
  }
}

// ==========================================
// 2. 俄羅斯方塊 (Tetris + Dellacherie AI)
// ==========================================
const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
  O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0050f0' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' }
};

class TetrisGame {
  constructor(audioGetter) {
    this.getAudio = audioGetter;
    this.cols = 10;
    this.rows = 20;
    this.blockSize = 26;

    this.canvas = document.getElementById('tetris-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.nextCanvas = document.getElementById('tetris-next-canvas');
    this.nextCtx = this.nextCanvas ? this.nextCanvas.getContext('2d') : null;

    this.scoreEl = document.getElementById('tetris-score');
    this.linesEl = document.getElementById('tetris-lines');
    this.levelEl = document.getElementById('tetris-level');
    this.bestEl = document.getElementById('tetris-best');
    this.statusEl = document.getElementById('tetris-status');
    this.overlayEl = document.getElementById('overlay-tetris');

    this.bestScore = parseInt(localStorage.getItem('arcade_tetris_best') || '0', 10);
    this.isActiveGame = false;
    this.isDemoMode = false;
    this.isPaused = false;
    this.isGameOver = false;

    this.board = [];
    this.currentPiece = null;
    this.nextPiece = null;
    this.aiTarget = null;
    this.dropTimer = 0;
    this.aiStepTimer = 0;

    this.bindEvents();
    this.resetGame();

    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActiveGame) return;

      if (e.code === 'KeyM') {
        e.preventDefault();
        this.toggleDemoMode();
        return;
      }

      if (e.code === 'KeyP') {
        e.preventDefault();
        this.isPaused = !this.isPaused;
        return;
      }

      if (this.isDemoMode || this.isPaused || this.isGameOver) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        this.movePiece(-1, 0);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        this.movePiece(1, 0);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        if (this.movePiece(0, 1)) this.score += 1;
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        this.rotatePiece();
      } else if (e.code === 'Space') {
        e.preventDefault();
        this.hardDrop();
      }
    });

    const newBtn = document.getElementById('btn-tetris-new');
    if (newBtn) newBtn.addEventListener('click', () => this.resetGame());

    const retryBtn = document.getElementById('btn-tetris-retry');
    if (retryBtn) retryBtn.addEventListener('click', () => this.resetGame());

    const demoBtn = document.getElementById('btn-tetris-demo');
    if (demoBtn) demoBtn.addEventListener('click', () => this.toggleDemoMode());
  }

  resetGame() {
    this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.isGameOver = false;
    this.isPaused = false;
    if (this.overlayEl) this.overlayEl.classList.add('hidden');

    this.nextPiece = this.randomPiece();
    this.spawnPiece();
    this.updateUI();
  }

  randomPiece() {
    const keys = Object.keys(TETROMINOES);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const def = TETROMINOES[key];
    return {
      type: key,
      shape: def.shape.map(r => [...r]),
      color: def.color,
      x: Math.floor((this.cols - def.shape[0].length) / 2),
      y: 0,
      rotations: 0
    };
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.randomPiece();
    this.drawNextPiece();

    if (this.collides(this.board, this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
      this.isGameOver = true;
      const audio = this.getAudio();
      if (audio) audio.playDeath();
      if (this.overlayEl) this.overlayEl.classList.remove('hidden');

      if (this.isDemoMode) {
        setTimeout(() => {
          if (this.isDemoMode && this.isGameOver && this.isActiveGame) {
            this.resetGame();
          }
        }, 1500);
      }
      return;
    }

    if (this.isDemoMode) {
      this.aiTarget = this.computeBestPlacement(this.currentPiece);
    }
  }

  rotateMatrix(matrix) {
    const R = matrix.length;
    const C = matrix[0].length;
    const res = Array.from({ length: C }, () => Array(R).fill(0));
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        res[c][R - 1 - r] = matrix[r][c];
      }
    }
    return res;
  }

  collides(board, shape, offsetX, offsetY) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const nx = offsetX + c;
        const ny = offsetY + r;
        if (nx < 0 || nx >= this.cols || ny >= this.rows) return true;
        if (ny >= 0 && board[ny][nx]) return true;
      }
    }
    return false;
  }

  movePiece(dx, dy) {
    if (!this.currentPiece || this.isGameOver) return false;
    const nx = this.currentPiece.x + dx;
    const ny = this.currentPiece.y + dy;
    if (!this.collides(this.board, this.currentPiece.shape, nx, ny)) {
      this.currentPiece.x = nx;
      this.currentPiece.y = ny;
      return true;
    }
    return false;
  }

  rotatePiece() {
    if (!this.currentPiece || this.isGameOver) return false;
    const rotated = this.rotateMatrix(this.currentPiece.shape);
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (!this.collides(this.board, rotated, this.currentPiece.x + k, this.currentPiece.y)) {
        this.currentPiece.shape = rotated;
        this.currentPiece.x += k;
        this.currentPiece.rotations = (this.currentPiece.rotations + 1) % 4;
        return true;
      }
    }
    return false;
  }

  hardDrop() {
    if (!this.currentPiece || this.isGameOver) return;
    while (this.movePiece(0, 1)) {
      this.score += 2;
    }
    this.lockPiece();
  }

  lockPiece() {
    const p = this.currentPiece;
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (p.shape[r][c]) {
          const by = p.y + r;
          const bx = p.x + c;
          if (by >= 0 && by < this.rows && bx >= 0 && bx < this.cols) {
            this.board[by][bx] = p.color;
          }
        }
      }
    }

    // 檢查消除行
    let cleared = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.board[r].every(cell => cell !== null)) {
        this.board.splice(r, 1);
        this.board.unshift(Array(this.cols).fill(null));
        cleared++;
        r++;
      }
    }

    const audio = this.getAudio();
    if (cleared > 0) {
      const lineScores = [0, 100, 300, 500, 800];
      this.score += (lineScores[cleared] || 800) * this.level;
      this.lines += cleared;
      this.level = Math.floor(this.lines / 10) + 1;
      if (audio) audio.playCoin();
    } else {
      if (audio) audio.playBump();
    }

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('arcade_tetris_best', this.bestScore.toString());
      if (window.arcadePlatform) window.arcadePlatform.refreshHighScores();
    }

    this.updateUI();
    this.spawnPiece();
  }

  // ==========================================
  // Tetris AI (Pierre Dellacherie 演算法)
  // ==========================================
  computeBestPlacement(piece) {
    let bestScore = -Infinity;
    let bestPlan = { rotations: 0, x: piece.x };

    let testShape = piece.shape.map(r => [...r]);
    for (let rot = 0; rot < 4; rot++) {
      const shapeW = testShape[0].length;
      for (let x = 0; x <= this.cols - shapeW; x++) {
        if (this.collides(this.board, testShape, x, 0)) continue;

        let y = 0;
        while (!this.collides(this.board, testShape, x, y + 1)) {
          y++;
        }

        // 模擬放置到臨時盤面
        const tempBoard = this.board.map(row => [...row]);
        for (let r = 0; r < testShape.length; r++) {
          for (let c = 0; c < testShape[r].length; c++) {
            if (testShape[r][c] && y + r >= 0 && y + r < this.rows) {
              tempBoard[y + r][x + c] = piece.color;
            }
          }
        }

        const evalScore = this.evaluateTetrisBoard(tempBoard);
        if (evalScore > bestScore) {
          bestScore = evalScore;
          bestPlan = { rotations: rot, x };
        }
      }
      testShape = this.rotateMatrix(testShape);
    }

    return bestPlan;
  }

  evaluateTetrisBoard(board) {
    let completeLines = 0;
    for (let r = 0; r < this.rows; r++) {
      if (board[r].every(cell => cell !== null)) completeLines++;
    }

    const colHeights = Array(this.cols).fill(0);
    let holes = 0;

    for (let c = 0; c < this.cols; c++) {
      let blockFound = false;
      for (let r = 0; r < this.rows; r++) {
        if (board[r][c] !== null) {
          if (!blockFound) {
            colHeights[c] = this.rows - r;
            blockFound = true;
          }
        } else if (blockFound) {
          holes++;
        }
      }
    }

    const aggregateHeight = colHeights.reduce((a, b) => a + b, 0);
    let bumpiness = 0;
    for (let c = 0; c < this.cols - 1; c++) {
      bumpiness += Math.abs(colHeights[c] - colHeights[c + 1]);
    }

    return (
      -0.510066 * aggregateHeight +
      0.760666 * completeLines -
      0.35663 * holes -
      0.184483 * bumpiness
    );
  }

  toggleDemoMode(forceState) {
    this.isDemoMode = typeof forceState === 'boolean' ? forceState : !this.isDemoMode;
    if (this.isDemoMode) {
      this.isPaused = false;
      if (this.isGameOver) this.resetGame();
      if (this.currentPiece) {
        this.aiTarget = this.computeBestPlacement(this.currentPiece);
      }
      if (this.statusEl) {
        this.statusEl.textContent = '🤖 AI 正在計算最佳落點與消行策略...';
      }
    } else if (this.statusEl) {
      this.statusEl.textContent = '方向鍵移動/旋轉，空白鍵快速落下！';
    }
    this.syncDemoUI();
    return this.isDemoMode;
  }

  syncDemoUI() {
    const demoBtn = document.getElementById('btn-tetris-demo');
    if (demoBtn) {
      demoBtn.classList.toggle('active-demo', this.isDemoMode);
      demoBtn.textContent = this.isDemoMode ? '🤖 AI 代玩: ON' : '🤖 AI Demo Mode';
    }
    const globalDemoBtn = document.getElementById('global-demo-btn');
    if (globalDemoBtn && this.isActiveGame) {
      globalDemoBtn.classList.toggle('active-demo', this.isDemoMode);
      globalDemoBtn.innerHTML = this.isDemoMode
        ? '<span>🤖 AI 自動玩: 開啟中</span>'
        : '<span>🤖 Demo Mode (AI 代玩)</span>';
    }
  }

  pauseForSwitch() {}

  updateUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.linesEl) this.linesEl.textContent = this.lines;
    if (this.levelEl) this.levelEl.textContent = this.level;
    if (this.bestEl) this.bestEl.textContent = this.bestScore;
  }

  drawNextPiece() {
    if (!this.nextCtx || !this.nextPiece) return;
    const ctx = this.nextCtx;
    ctx.fillStyle = '#0c0e1a';
    ctx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

    const shape = this.nextPiece.shape;
    const bs = 20;
    const offsetX = Math.floor((this.nextCanvas.width - shape[0].length * bs) / 2);
    const offsetY = Math.floor((this.nextCanvas.height - shape.length * bs) / 2);

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          this.drawBlock(ctx, offsetX + c * bs, offsetY + r * bs, bs, this.nextPiece.color);
        }
      }
    }
  }

  drawBlock(ctx, x, y, size, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x + 2, y + 2, size - 4, 4);
    ctx.fillRect(x + 2, y + 2, 4, size - 4);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    ctx.restore();
  }

  loop(timestamp) {
    requestAnimationFrame(this.loop.bind(this));
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (!this.isActiveGame) return;

    if (!this.isPaused && !this.isGameOver) {
      if (this.isDemoMode && this.currentPiece && this.aiTarget) {
        this.aiStepTimer += dt;
        if (this.aiStepTimer >= 0.045) {
          this.aiStepTimer = 0;
          if (this.currentPiece.rotations !== this.aiTarget.rotations) {
            this.rotatePiece();
          } else if (this.currentPiece.x < this.aiTarget.x) {
            if (!this.movePiece(1, 0)) this.aiTarget.x = this.currentPiece.x;
          } else if (this.currentPiece.x > this.aiTarget.x) {
            if (!this.movePiece(-1, 0)) this.aiTarget.x = this.currentPiece.x;
          } else {
            // 對齊目標欄位後快速下落
            if (!this.movePiece(0, 1)) {
              this.lockPiece();
            } else {
              this.score += 1;
            }
          }
        }
      } else {
        const dropInterval = Math.max(0.12, 0.8 - (this.level - 1) * 0.07);
        this.dropTimer += dt;
        if (this.dropTimer >= dropInterval) {
          this.dropTimer = 0;
          if (!this.movePiece(0, 1)) {
            this.lockPiece();
          }
        }
      }
    }

    this.render();
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const bs = this.blockSize;

    ctx.fillStyle = '#0b0e17';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 繪製背景網格
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        ctx.strokeRect(c * bs, r * bs, bs, bs);
        if (this.board[r][c]) {
          this.drawBlock(ctx, c * bs, r * bs, bs, this.board[r][c]);
        }
      }
    }

    // 繪製 Ghost Piece 與當前下墜方塊
    if (this.currentPiece && !this.isGameOver) {
      const p = this.currentPiece;
      let ghostY = p.y;
      while (!this.collides(this.board, p.shape, p.x, ghostY + 1)) {
        ghostY++;
      }

      for (let r = 0; r < p.shape.length; r++) {
        for (let c = 0; c < p.shape[r].length; c++) {
          if (p.shape[r][c]) {
            this.drawBlock(ctx, (p.x + c) * bs, (ghostY + r) * bs, bs, p.color, 0.22);
            this.drawBlock(ctx, (p.x + c) * bs, (p.y + r) * bs, bs, p.color, 1);
          }
        }
      }
    }

    if (this.isDemoMode) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(8, 8, 175, 24);
      ctx.strokeStyle = '#00ff88';
      ctx.strokeRect(8, 8, 175, 24);
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.fillText('🤖 AI DEMO ACTIVE', 16, 24);
      ctx.restore();
    }
  }
}

// ==========================================
// 3. 經典貪吃蛇 (Snake + BFS 尋路存活 AI)
// ==========================================
class SnakeGame {
  constructor(audioGetter) {
    this.getAudio = audioGetter;
    this.gridSize = 20;
    this.tileSize = 22;

    this.canvas = document.getElementById('snake-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.scoreEl = document.getElementById('snake-score');
    this.lengthEl = document.getElementById('snake-length');
    this.bestEl = document.getElementById('snake-best');
    this.statusEl = document.getElementById('snake-status');
    this.overlayEl = document.getElementById('overlay-snake');

    this.bestScore = parseInt(localStorage.getItem('arcade_snake_best') || '0', 10);
    this.isActiveGame = false;
    this.isDemoMode = false;
    this.isGameOver = false;
    this.isPaused = false;

    this.snake = [];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.food = { x: 12, y: 10, bonus: false };
    this.stepTimer = 0;

    this.bindEvents();
    this.resetGame();

    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActiveGame) return;

      if (e.code === 'KeyM') {
        e.preventDefault();
        this.toggleDemoMode();
        return;
      }

      if (e.code === 'KeyP') {
        e.preventDefault();
        this.isPaused = !this.isPaused;
        return;
      }

      if (this.isDemoMode || this.isGameOver) return;

      if ((e.code === 'ArrowUp' || e.code === 'KeyW') && this.dir.y === 0) {
        e.preventDefault();
        this.nextDir = { x: 0, y: -1 };
      } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && this.dir.y === 0) {
        e.preventDefault();
        this.nextDir = { x: 0, y: 1 };
      } else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && this.dir.x === 0) {
        e.preventDefault();
        this.nextDir = { x: -1, y: 0 };
      } else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && this.dir.x === 0) {
        e.preventDefault();
        this.nextDir = { x: 1, y: 0 };
      }
    });

    const newBtn = document.getElementById('btn-snake-new');
    if (newBtn) newBtn.addEventListener('click', () => this.resetGame());

    const retryBtn = document.getElementById('btn-snake-retry');
    if (retryBtn) retryBtn.addEventListener('click', () => this.resetGame());

    const demoBtn = document.getElementById('btn-snake-demo');
    if (demoBtn) demoBtn.addEventListener('click', () => this.toggleDemoMode());
  }

  resetGame() {
    this.snake = [
      { x: 6, y: 10 },
      { x: 5, y: 10 },
      { x: 4, y: 10 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.score = 0;
    this.isGameOver = false;
    this.isPaused = false;
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
    this.spawnFood();
    this.updateUI();
  }

  spawnFood() {
    const occupied = new Set(this.snake.map(s => `${s.x},${s.y}`));
    const empty = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
      }
    }
    if (empty.length === 0) return;
    const pick = empty[Math.floor(Math.random() * empty.length)];
    this.food = { x: pick.x, y: pick.y, bonus: Math.random() < 0.2 };
  }

  // ==========================================
  // 貪吃蛇 BFS 智慧尋路與防死胡同 AI
  // ==========================================
  computeAIStep() {
    const head = this.snake[0];
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    // 禁止直接 180 度回頭
    const validDirs = dirs.filter(d => !(d.x === -this.dir.x && d.y === -this.dir.y));

    const bodySet = new Set();
    // 尾巴最後一格在下個 tick 會移開，因此不視為阻擋
    for (let i = 0; i < this.snake.length - 1; i++) {
      bodySet.add(`${this.snake[i].x},${this.snake[i].y}`);
    }

    // BFS 尋找從起點到目標的最短路徑
    const bfsPath = (start, target, blockedSet) => {
      const queue = [[start]];
      const visited = new Set([`${start.x},${start.y}`]);

      while (queue.length > 0) {
        const path = queue.shift();
        const curr = path[path.length - 1];
        if (curr.x === target.x && curr.y === target.y) {
          return path;
        }
        for (const d of dirs) {
          const nx = curr.x + d.x;
          const ny = curr.y + d.y;
          const key = `${nx},${ny}`;
          if (
            nx >= 0 && nx < this.gridSize &&
            ny >= 0 && ny < this.gridSize &&
            !visited.has(key) &&
            (!blockedSet.has(key) || (nx === target.x && ny === target.y))
          ) {
            visited.add(key);
            queue.push([...path, { x: nx, y: ny }]);
          }
        }
      }
      return null;
    };

    // 計算從某點出發的可達空間大小 (Flood Fill)
    const countReachableSpace = (start, blockedSet) => {
      const queue = [start];
      const visited = new Set([`${start.x},${start.y}`]);
      let count = 0;
      while (queue.length > 0 && count < 180) {
        const curr = queue.shift();
        count++;
        for (const d of dirs) {
          const nx = curr.x + d.x;
          const ny = curr.y + d.y;
          const key = `${nx},${ny}`;
          if (
            nx >= 0 && nx < this.gridSize &&
            ny >= 0 && ny < this.gridSize &&
            !visited.has(key) &&
            !blockedSet.has(key)
          ) {
            visited.add(key);
            queue.push({ x: nx, y: ny });
          }
        }
      }
      return count;
    };

    const pathToFood = bfsPath(head, this.food, bodySet);
    if (pathToFood && pathToFood.length >= 2) {
      const nextStep = pathToFood[1];
      const nextBlocked = new Set(bodySet);
      nextBlocked.add(`${head.x},${head.y}`);
      const spaceAfter = countReachableSpace(nextStep, nextBlocked);
      // 確保走這一步之後有足夠存活空間，不會把自己關進死胡同
      if (spaceAfter >= Math.min(this.snake.length + 4, 80)) {
        return { x: nextStep.x - head.x, y: nextStep.y - head.y };
      }
    }

    // 若直接吃蘋果有死胡同風險，挑選可達空間最大且距離蘋果較近的安全方向
    let bestDir = null;
    let bestMetric = -Infinity;

    for (const d of validDirs) {
      const nx = head.x + d.x;
      const ny = head.y + d.y;
      const key = `${nx},${ny}`;
      if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize || bodySet.has(key)) {
        continue;
      }
      const nextBlocked = new Set(bodySet);
      nextBlocked.add(`${head.x},${head.y}`);
      const space = countReachableSpace({ x: nx, y: ny }, nextBlocked);
      const distToFood = Math.abs(nx - this.food.x) + Math.abs(ny - this.food.y);
      const metric = space * 100 - distToFood;
      if (metric > bestMetric) {
        bestMetric = metric;
        bestDir = d;
      }
    }

    return bestDir || this.dir;
  }

  step() {
    if (this.isGameOver || this.isPaused) return;

    if (this.isDemoMode) {
      this.nextDir = this.computeAIStep();
    }

    this.dir = { ...this.nextDir };
    const head = {
      x: this.snake[0].x + this.dir.x,
      y: this.snake[0].y + this.dir.y
    };

    // 撞牆或撞自身判定
    const hitWall = head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize;
    const hitSelf = this.snake.slice(0, -1).some(s => s.x === head.x && s.y === head.y);

    if (hitWall || hitSelf) {
      this.isGameOver = true;
      const audio = this.getAudio();
      if (audio) audio.playDeath();
      if (this.overlayEl) this.overlayEl.classList.remove('hidden');

      if (this.isDemoMode) {
        setTimeout(() => {
          if (this.isDemoMode && this.isGameOver && this.isActiveGame) {
            this.resetGame();
          }
        }, 1500);
      }
      return;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += this.food.bonus ? 300 : 100;
      const audio = this.getAudio();
      if (audio) audio.playCoin();

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('arcade_snake_best', this.bestScore.toString());
        if (window.arcadePlatform) window.arcadePlatform.refreshHighScores();
      }
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.updateUI();
  }

  toggleDemoMode(forceState) {
    this.isDemoMode = typeof forceState === 'boolean' ? forceState : !this.isDemoMode;
    if (this.isDemoMode) {
      this.isPaused = false;
      if (this.isGameOver) this.resetGame();
      if (this.statusEl) {
        this.statusEl.textContent = '🤖 AI 正在使用 BFS 尋路演算法自動覓食...';
      }
    } else if (this.statusEl) {
      this.statusEl.textContent = '使用 WASD 或 方向鍵 控制貪吃蛇吃蘋果！';
    }
    this.syncDemoUI();
    return this.isDemoMode;
  }

  syncDemoUI() {
    const demoBtn = document.getElementById('btn-snake-demo');
    if (demoBtn) {
      demoBtn.classList.toggle('active-demo', this.isDemoMode);
      demoBtn.textContent = this.isDemoMode ? '🤖 AI 代玩: ON' : '🤖 AI Demo Mode';
    }
    const globalDemoBtn = document.getElementById('global-demo-btn');
    if (globalDemoBtn && this.isActiveGame) {
      globalDemoBtn.classList.toggle('active-demo', this.isDemoMode);
      globalDemoBtn.innerHTML = this.isDemoMode
        ? '<span>🤖 AI 自動玩: 開啟中</span>'
        : '<span>🤖 Demo Mode (AI 代玩)</span>';
    }
  }

  pauseForSwitch() {}

  updateUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.lengthEl) this.lengthEl.textContent = this.snake.length;
    if (this.bestEl) this.bestEl.textContent = this.bestScore;
  }

  loop(timestamp) {
    requestAnimationFrame(this.loop.bind(this));
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (!this.isActiveGame) return;

    const interval = this.isDemoMode ? 0.055 : Math.max(0.065, 0.13 - Math.floor(this.snake.length / 6) * 0.008);
    this.stepTimer += dt;
    if (this.stepTimer >= interval) {
      this.stepTimer = 0;
      this.step();
    }

    this.render();
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const ts = this.tileSize;

    // 棋盤格背景
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#0d1520' : '#111c2b';
        ctx.fillRect(x * ts, y * ts, ts, ts);
      }
    }

    // 繪製蘋果 / 黃金星果實
    const fx = this.food.x * ts;
    const fy = this.food.y * ts;
    ctx.fillStyle = this.food.bonus ? '#fcd116' : '#e52521';
    ctx.beginPath();
    ctx.arc(fx + ts / 2, fy + ts / 2 + 1, ts * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00e550';
    ctx.fillRect(fx + ts / 2 - 1, fy + 2, 4, 5);

    // 繪製貪吃蛇身軀與蛇頭
    this.snake.forEach((seg, idx) => {
      const sx = seg.x * ts;
      const sy = seg.y * ts;
      if (idx === 0) {
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(sx + 1, sy + 1, ts - 2, ts - 2);
        ctx.fillStyle = '#000';
        ctx.fillRect(sx + 5, sy + 5, 4, 4);
        ctx.fillRect(sx + ts - 9, sy + 5, 4, 4);
      } else {
        const green = Math.max(110, 235 - idx * 3);
        ctx.fillStyle = `rgb(0, ${green}, 80)`;
        ctx.fillRect(sx + 2, sy + 2, ts - 4, ts - 4);
      }
    });

    if (this.isDemoMode) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(10, 10, 210, 24);
      ctx.strokeStyle = '#00ff88';
      ctx.strokeRect(10, 10, 210, 24);
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.fillText('🤖 AI BFS PATHFINDING', 18, 26);
      ctx.restore();
    }
  }
}

// ==========================================
// 4. 霓虹打磚塊 (Arkanoid / Breakout + 軌跡預測 AI)
// ==========================================
class BreakoutGame {
  constructor(audioGetter) {
    this.getAudio = audioGetter;
    this.canvas = document.getElementById('breakout-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.scoreEl = document.getElementById('breakout-score');
    this.livesEl = document.getElementById('breakout-lives');
    this.levelEl = document.getElementById('breakout-level');
    this.bestEl = document.getElementById('breakout-best');
    this.statusEl = document.getElementById('breakout-status');
    this.overlayEl = document.getElementById('overlay-breakout');

    this.bestScore = parseInt(localStorage.getItem('arcade_breakout_best') || '0', 10);
    this.isActiveGame = false;
    this.isDemoMode = false;
    this.isGameOver = false;

    this.input = { left: false, right: false };
    this.bindEvents();
    this.resetGame();

    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActiveGame) return;
      if (e.code === 'KeyM') {
        e.preventDefault();
        this.toggleDemoMode();
        return;
      }
      if (this.isDemoMode) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = true;
    });

    window.addEventListener('keyup', (e) => {
      if (!this.isActiveGame || this.isDemoMode) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = false;
    });

    if (this.canvas) {
      this.canvas.addEventListener('mousemove', (e) => {
        if (!this.isActiveGame || this.isDemoMode || this.isGameOver) return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const mx = (e.clientX - rect.left) * scaleX;
        this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.w, mx - this.paddle.w / 2));
      });
    }

    const newBtn = document.getElementById('btn-breakout-new');
    if (newBtn) newBtn.addEventListener('click', () => this.resetGame());

    const retryBtn = document.getElementById('btn-breakout-retry');
    if (retryBtn) retryBtn.addEventListener('click', () => this.resetGame());

    const demoBtn = document.getElementById('btn-breakout-demo');
    if (demoBtn) demoBtn.addEventListener('click', () => this.toggleDemoMode());
  }

  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.isGameOver = false;
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
    this.initLevel();
    this.updateUI();
  }

  initLevel() {
    const w = this.canvas ? this.canvas.width : 480;
    const h = this.canvas ? this.canvas.height : 440;
    this.paddle = { x: w / 2 - 48, y: h - 28, w: 96, h: 14, speed: 430 };
    this.balls = [
      { x: w / 2, y: h - 46, vx: 210 * (Math.random() > 0.5 ? 1 : -1), vy: -260, r: 7 }
    ];
    this.capsules = [];
    this.bricks = [];

    const rows = 5 + Math.min(2, this.level - 1);
    const cols = 8;
    const pad = 6;
    const bw = (w - 36 - pad * (cols - 1)) / cols;
    const bh = 20;
    const colors = ['#ff0055', '#ff8800', '#fcd116', '#00ff88', '#00cfef', '#a855f7', '#ec4899'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.bricks.push({
          x: 18 + c * (bw + pad),
          y: 48 + r * (bh + pad),
          w: bw,
          h: bh,
          hp: r === 0 && this.level > 1 ? 2 : 1,
          color: colors[r % colors.length]
        });
      }
    }
  }

  toggleDemoMode(forceState) {
    this.isDemoMode = typeof forceState === 'boolean' ? forceState : !this.isDemoMode;
    if (this.isDemoMode && this.isGameOver) this.resetGame();
    if (this.statusEl) {
      this.statusEl.textContent = this.isDemoMode
        ? '🤖 AI 正在計算球體反射軌跡與接取道具膠囊...'
        : '滑鼠或 A/D/方向鍵 移動反射板擊碎所有霓虹磚塊！';
    }
    this.syncDemoUI();
    return this.isDemoMode;
  }

  syncDemoUI() {
    const demoBtn = document.getElementById('btn-breakout-demo');
    if (demoBtn) {
      demoBtn.classList.toggle('active-demo', this.isDemoMode);
      demoBtn.textContent = this.isDemoMode ? '🤖 AI 代玩: ON' : '🤖 AI Demo Mode';
    }
    const globalDemoBtn = document.getElementById('global-demo-btn');
    if (globalDemoBtn && this.isActiveGame) {
      globalDemoBtn.classList.toggle('active-demo', this.isDemoMode);
      globalDemoBtn.innerHTML = this.isDemoMode
        ? '<span>🤖 AI 自動玩: 開啟中</span>'
        : '<span>🤖 Demo Mode (AI 代玩)</span>';
    }
  }

  pauseForSwitch() {}

  updateUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.livesEl) this.livesEl.textContent = `♥ × ${this.lives}`;
    if (this.levelEl) this.levelEl.textContent = this.level;
    if (this.bestEl) this.bestEl.textContent = this.bestScore;
  }

  loop(timestamp) {
    requestAnimationFrame(this.loop.bind(this));
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (!this.isActiveGame || !this.canvas) return;
    if (!this.isGameOver) this.update(dt);
    this.render();
  }

  update(dt) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const p = this.paddle;

    // AI 軌跡追蹤
    if (this.isDemoMode) {
      let targetX = W / 2;
      const activeBalls = this.balls;
      if (activeBalls.length > 0) {
        // 優先追蹤最靠近底部的下墜球
        const dangerBall = [...activeBalls].sort((a, b) => (b.y + (b.vy > 0 ? 120 : 0)) - (a.y + (a.vy > 0 ? 120 : 0)))[0];
        // 加入微幅偏移以創造斜角擊破角落磚塊
        const angleBias = Math.sin(performance.now() * 0.003) * (p.w * 0.24);
        targetX = dangerBall.x + angleBias;
      }
      const center = p.x + p.w / 2;
      if (Math.abs(targetX - center) > 6) {
        p.x += Math.sign(targetX - center) * p.speed * 1.15 * dt;
      }
    } else {
      if (this.input.left) p.x -= p.speed * dt;
      if (this.input.right) p.x += p.speed * dt;
    }
    p.x = Math.max(0, Math.min(W - p.w, p.x));

    const audio = this.getAudio();

    // 更新球體
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx); }
      if (b.x + b.r > W) { b.x = W - b.r; b.vx = -Math.abs(b.vx); }
      if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy); }

      // 與球拍碰撞
      if (
        b.vy > 0 &&
        b.y + b.r >= p.y &&
        b.y - b.r <= p.y + p.h &&
        b.x >= p.x - 4 &&
        b.x <= p.x + p.w + 4
      ) {
        const hitOffset = ((b.x - (p.x + p.w / 2)) / (p.w / 2));
        const speed = Math.min(460, Math.hypot(b.vx, b.vy) * 1.015);
        const angle = hitOffset * (Math.PI * 0.36);
        b.vx = speed * Math.sin(angle);
        b.vy = -Math.abs(speed * Math.cos(angle));
        b.y = p.y - b.r;
        if (audio) audio.playBump();
      }

      // 與磚塊碰撞
      for (let j = this.bricks.length - 1; j >= 0; j--) {
        const br = this.bricks[j];
        if (
          b.x + b.r > br.x &&
          b.x - b.r < br.x + br.w &&
          b.y + b.r > br.y &&
          b.y - b.r < br.y + br.h
        ) {
          b.vy = -b.vy;
          br.hp--;
          if (br.hp <= 0) {
            if (Math.random() < 0.22) {
              this.capsules.push({
                x: br.x + br.w / 2 - 12,
                y: br.y,
                w: 24,
                h: 12,
                type: Math.random() < 0.5 ? 'MULTI' : 'WIDE'
              });
            }
            this.bricks.splice(j, 1);
            this.score += 50 * this.level;
            if (audio) audio.playCoin();
          } else {
            this.score += 20;
            if (audio) audio.playBump();
          }
          break;
        }
      }

      if (b.y - b.r > H) {
        this.balls.splice(i, 1);
      }
    }

    // 膠囊掉落與拾取
    for (let i = this.capsules.length - 1; i >= 0; i--) {
      const cap = this.capsules[i];
      cap.y += 140 * dt;
      if (
        cap.y + cap.h >= p.y &&
        cap.y <= p.y + p.h &&
        cap.x + cap.w >= p.x &&
        cap.x <= p.x + p.w
      ) {
        if (cap.type === 'WIDE') {
          p.w = Math.min(150, p.w + 26);
        } else if (cap.type === 'MULTI' && this.balls.length > 0 && this.balls.length < 5) {
          const ref = this.balls[0];
          this.balls.push({ x: ref.x, y: ref.y, vx: -ref.vx, vy: -Math.abs(ref.vy), r: 7 });
        }
        this.score += 150;
        if (audio) audio.playPowerup();
        this.capsules.splice(i, 1);
      } else if (cap.y > H) {
        this.capsules.splice(i, 1);
      }
    }

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('arcade_breakout_best', this.bestScore.toString());
      if (window.arcadePlatform) window.arcadePlatform.refreshHighScores();
    }

    // 過關檢查
    if (this.bricks.length === 0) {
      this.level++;
      this.score += 500;
      if (audio) audio.playStageClear();
      this.initLevel();
    }

    // 失球檢查
    if (this.balls.length === 0) {
      this.lives--;
      if (this.lives <= 0) {
        this.isGameOver = true;
        if (audio) audio.playDeath();
        if (this.overlayEl) this.overlayEl.classList.remove('hidden');
        if (this.isDemoMode) {
          setTimeout(() => {
            if (this.isDemoMode && this.isGameOver && this.isActiveGame) this.resetGame();
          }, 1500);
        }
      } else {
        this.balls.push({ x: p.x + p.w / 2, y: p.y - 16, vx: 210, vy: -260, r: 7 });
      }
    }

    this.updateUI();
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#090c18';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 繪製磚塊
    this.bricks.forEach(br => {
      ctx.fillStyle = br.hp > 1 ? '#ffffff' : br.color;
      ctx.fillRect(br.x, br.y, br.w, br.h);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(br.x + 2, br.y + 2, br.w - 4, 4);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(br.x, br.y, br.w, br.h);
    });

    // 繪製膠囊
    this.capsules.forEach(cap => {
      ctx.fillStyle = cap.type === 'MULTI' ? '#00ff88' : '#fcd116';
      ctx.fillRect(cap.x, cap.y, cap.w, cap.h);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(cap.type === 'MULTI' ? 'x2' : 'W+', cap.x + 4, cap.y + 9);
    });

    // 繪製反射板
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.paddle.x + 4, this.paddle.y + 2, this.paddle.w - 8, 4);

    // 繪製球體
    this.balls.forEach(b => {
      ctx.fillStyle = '#fcd116';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (this.isDemoMode) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(10, 10, 210, 24);
      ctx.strokeStyle = '#00ff88';
      ctx.strokeRect(10, 10, 210, 24);
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.fillText('🤖 AI TRAJECTORY LOCK', 18, 26);
      ctx.restore();
    }
  }
}

// ==========================================
// 5. 像素飛鳥 (Flappy Pixel Bird + 高度控制 AI)
// ==========================================
class FlappyGame {
  constructor(audioGetter) {
    this.getAudio = audioGetter;
    this.canvas = document.getElementById('flappy-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.scoreEl = document.getElementById('flappy-score');
    this.bestEl = document.getElementById('flappy-best');
    this.statusEl = document.getElementById('flappy-status');
    this.overlayEl = document.getElementById('overlay-flappy');

    this.bestScore = parseInt(localStorage.getItem('arcade_flappy_best') || '0', 10);
    this.isActiveGame = false;
    this.isDemoMode = false;
    this.isGameOver = false;

    this.bindEvents();
    this.resetGame();

    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActiveGame) return;
      if (e.code === 'KeyM') {
        e.preventDefault();
        this.toggleDemoMode();
        return;
      }
      if (this.isDemoMode) return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (this.isGameOver) this.resetGame();
        else this.flap();
      }
    });

    if (this.canvas) {
      this.canvas.addEventListener('mousedown', () => {
        if (!this.isActiveGame || this.isDemoMode) return;
        if (this.isGameOver) this.resetGame();
        else this.flap();
      });
    }

    const newBtn = document.getElementById('btn-flappy-new');
    if (newBtn) newBtn.addEventListener('click', () => this.resetGame());

    const retryBtn = document.getElementById('btn-flappy-retry');
    if (retryBtn) retryBtn.addEventListener('click', () => this.resetGame());

    const demoBtn = document.getElementById('btn-flappy-demo');
    if (demoBtn) demoBtn.addEventListener('click', () => this.toggleDemoMode());
  }

  resetGame() {
    this.bird = { x: 105, y: 190, vy: 0, r: 13 };
    this.pipes = [];
    this.pipeTimer = 0;
    this.score = 0;
    this.isGameOver = false;
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
    this.spawnPipe();
    this.updateUI();
  }

  spawnPipe() {
    const gapH = 112;
    const minY = 55;
    const maxY = 400 - gapH - 55;
    const gapY = minY + Math.random() * (maxY - minY);
    this.pipes.push({
      x: 480,
      w: 52,
      gapY,
      gapH,
      passed: false
    });
  }

  flap() {
    this.bird.vy = -310;
    const audio = this.getAudio();
    if (audio) audio.playJump();
  }

  toggleDemoMode(forceState) {
    this.isDemoMode = typeof forceState === 'boolean' ? forceState : !this.isDemoMode;
    if (this.isDemoMode && this.isGameOver) this.resetGame();
    if (this.statusEl) {
      this.statusEl.textContent = this.isDemoMode
        ? '🤖 AI 正在計算最佳穿管仰角與高度閾值...'
        : '按 空白鍵 / W / 滑鼠點擊 拍動翅膀穿過水管縫隙！';
    }
    this.syncDemoUI();
    return this.isDemoMode;
  }

  syncDemoUI() {
    const demoBtn = document.getElementById('btn-flappy-demo');
    if (demoBtn) {
      demoBtn.classList.toggle('active-demo', this.isDemoMode);
      demoBtn.textContent = this.isDemoMode ? '🤖 AI 代玩: ON' : '🤖 AI Demo Mode';
    }
    const globalDemoBtn = document.getElementById('global-demo-btn');
    if (globalDemoBtn && this.isActiveGame) {
      globalDemoBtn.classList.toggle('active-demo', this.isDemoMode);
      globalDemoBtn.innerHTML = this.isDemoMode
        ? '<span>🤖 AI 自動玩: 開啟中</span>'
        : '<span>🤖 Demo Mode (AI 代玩)</span>';
    }
  }

  pauseForSwitch() {}

  updateUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.bestEl) this.bestEl.textContent = this.bestScore;
  }

  loop(timestamp) {
    requestAnimationFrame(this.loop.bind(this));
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (!this.isActiveGame || !this.canvas) return;
    if (!this.isGameOver) this.update(dt);
    this.render();
  }

  update(dt) {
    const b = this.bird;
    const groundY = this.canvas.height - 36;

    // AI 穿管高度控制
    if (this.isDemoMode) {
      const nextPipe = this.pipes.find(p => p.x + p.w > b.x - b.r);
      const targetY = nextPipe ? (nextPipe.gapY + nextPipe.gapH * 0.64) : 210;
      if (b.y >= targetY && b.vy > -35) {
        this.flap();
      }
    }

    b.vy += 880 * dt;
    b.y += b.vy * dt;

    this.pipeTimer += dt;
    if (this.pipeTimer >= 1.45) {
      this.pipeTimer = 0;
      this.spawnPipe();
    }

    const audio = this.getAudio();

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const p = this.pipes[i];
      p.x -= 165 * dt;

      if (!p.passed && p.x + p.w < b.x) {
        p.passed = true;
        this.score++;
        if (audio) audio.playCoin();
        if (this.score > this.bestScore) {
          this.bestScore = this.score;
          localStorage.setItem('arcade_flappy_best', this.bestScore.toString());
          if (window.arcadePlatform) window.arcadePlatform.refreshHighScores();
        }
        this.updateUI();
      }

      // 碰撞檢測
      if (b.x + b.r > p.x && b.x - b.r < p.x + p.w) {
        if (b.y - b.r < p.gapY || b.y + b.r > p.gapY + p.gapH) {
          this.triggerGameOver();
          return;
        }
      }

      if (p.x + p.w < -20) {
        this.pipes.splice(i, 1);
      }
    }

    if (b.y + b.r >= groundY || b.y - b.r < 0) {
      this.triggerGameOver();
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    const audio = this.getAudio();
    if (audio) audio.playDeath();
    if (this.overlayEl) this.overlayEl.classList.remove('hidden');
    if (this.isDemoMode) {
      setTimeout(() => {
        if (this.isDemoMode && this.isGameOver && this.isActiveGame) this.resetGame();
      }, 1400);
    }
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const groundY = H - 36;

    // 天空與雲朵
    ctx.fillStyle = '#4ec0ca';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(60, 70, 60, 18);
    ctx.fillRect(240, 50, 72, 20);
    ctx.fillRect(380, 85, 55, 16);

    // 水管
    this.pipes.forEach(p => {
      ctx.fillStyle = '#00a800';
      ctx.fillRect(p.x, 0, p.w, p.gapY);
      ctx.fillRect(p.x, p.gapY + p.gapH, p.w, groundY - (p.gapY + p.gapH));
      ctx.fillStyle = '#5cff5c';
      ctx.fillRect(p.x + 6, 0, 8, p.gapY);
      ctx.fillRect(p.x + 6, p.gapY + p.gapH, 8, groundY - (p.gapY + p.gapH));
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, 0, p.w, p.gapY);
      ctx.strokeRect(p.x, p.gapY + p.gapH, p.w, groundY - (p.gapY + p.gapH));
    });

    // 地面
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, groundY, W, 10);
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, groundY + 10, W, 26);

    // 像素小鳥
    const b = this.bird;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = '#fcd116';
    ctx.beginPath();
    ctx.arc(0, 0, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 眼睛與鳥喙
    ctx.fillStyle = '#fff';
    ctx.fillRect(2, -7, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(5, -5, 3, 3);
    ctx.fillStyle = '#e52521';
    ctx.fillRect(8, -1, 8, 5);
    ctx.restore();

    if (this.isDemoMode) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(10, 10, 200, 24);
      ctx.strokeStyle = '#00ff88';
      ctx.strokeRect(10, 10, 200, 24);
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.fillText('🤖 AI AUTO-PILOT ON', 18, 26);
      ctx.restore();
    }
  }
}

// ==========================================
// 6. 太空侵略者 (Space Invaders + 自動閃避狙擊 AI)
// ==========================================
class SpaceInvadersGame {
  constructor(audioGetter) {
    this.getAudio = audioGetter;
    this.canvas = document.getElementById('invaders-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.scoreEl = document.getElementById('invaders-score');
    this.waveEl = document.getElementById('invaders-wave');
    this.livesEl = document.getElementById('invaders-lives');
    this.bestEl = document.getElementById('invaders-best');
    this.statusEl = document.getElementById('invaders-status');
    this.overlayEl = document.getElementById('overlay-invaders');

    this.bestScore = parseInt(localStorage.getItem('arcade_invaders_best') || '0', 10);
    this.isActiveGame = false;
    this.isDemoMode = false;
    this.isGameOver = false;

    this.input = { left: false, right: false, shoot: false };
    this.bindEvents();
    this.resetGame();

    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActiveGame) return;
      if (e.code === 'KeyM') {
        e.preventDefault();
        this.toggleDemoMode();
        return;
      }
      if (this.isDemoMode) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = true;
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.input.shoot = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.isActiveGame || this.isDemoMode) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = false;
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') this.input.shoot = false;
    });

    const newBtn = document.getElementById('btn-invaders-new');
    if (newBtn) newBtn.addEventListener('click', () => this.resetGame());

    const retryBtn = document.getElementById('btn-invaders-retry');
    if (retryBtn) retryBtn.addEventListener('click', () => this.resetGame());

    const demoBtn = document.getElementById('btn-invaders-demo');
    if (demoBtn) demoBtn.addEventListener('click', () => this.toggleDemoMode());
  }

  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.isGameOver = false;
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
    this.ship = { x: 220, y: 396, w: 36, h: 20, speed: 280, cooldown: 0 };
    this.bullets = [];
    this.enemyBullets = [];
    this.initWave();
    this.updateUI();
  }

  initWave() {
    this.aliens = [];
    this.alienDir = 1;
    this.alienSpeed = 42 + this.wave * 10;
    const rows = 4;
    const cols = 8;
    const colors = ['#ff0055', '#fcd116', '#00ff88', '#00e5ff'];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.aliens.push({
          x: 46 + c * 46,
          y: 48 + r * 34,
          w: 28,
          h: 20,
          color: colors[r % colors.length],
          points: (rows - r) * 30
        });
      }
    }
  }

  toggleDemoMode(forceState) {
    this.isDemoMode = typeof forceState === 'boolean' ? forceState : !this.isDemoMode;
    if (this.isDemoMode && this.isGameOver) this.resetGame();
    if (this.statusEl) {
      this.statusEl.textContent = this.isDemoMode
        ? '🤖 AI 正在自動閃避敵方雷射並鎖定外星艦隊...'
        : 'A/D 或 方向鍵 移動戰機，空白鍵發射電漿雷射！';
    }
    this.syncDemoUI();
    return this.isDemoMode;
  }

  syncDemoUI() {
    const demoBtn = document.getElementById('btn-invaders-demo');
    if (demoBtn) {
      demoBtn.classList.toggle('active-demo', this.isDemoMode);
      demoBtn.textContent = this.isDemoMode ? '🤖 AI 代玩: ON' : '🤖 AI Demo Mode';
    }
    const globalDemoBtn = document.getElementById('global-demo-btn');
    if (globalDemoBtn && this.isActiveGame) {
      globalDemoBtn.classList.toggle('active-demo', this.isDemoMode);
      globalDemoBtn.innerHTML = this.isDemoMode
        ? '<span>🤖 AI 自動玩: 開啟中</span>'
        : '<span>🤖 Demo Mode (AI 代玩)</span>';
    }
  }

  pauseForSwitch() {}

  updateUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.waveEl) this.waveEl.textContent = this.wave;
    if (this.livesEl) this.livesEl.textContent = `♥ × ${this.lives}`;
    if (this.bestEl) this.bestEl.textContent = this.bestScore;
  }

  loop(timestamp) {
    requestAnimationFrame(this.loop.bind(this));
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (!this.isActiveGame || !this.canvas) return;
    if (!this.isGameOver) this.update(dt);
    this.render();
  }

  update(dt) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const s = this.ship;
    const audio = this.getAudio();

    if (s.cooldown > 0) s.cooldown -= dt;

    // AI 閃避與瞄準
    if (this.isDemoMode) {
      const shipCenter = s.x + s.w / 2;
      const incoming = this.enemyBullets.find(
        eb => eb.y > 180 && eb.y < s.y + 10 && Math.abs(eb.x - shipCenter) < 34
      );
      if (incoming) {
        const dodgeDir = incoming.x > shipCenter ? -1 : 1;
        s.x += dodgeDir * s.speed * dt;
      } else if (this.aliens.length > 0) {
        const target = [...this.aliens].sort((a, b) => b.y - a.y)[0];
        const targetCenter = target.x + target.w / 2;
        if (Math.abs(targetCenter - shipCenter) > 6) {
          s.x += Math.sign(targetCenter - shipCenter) * s.speed * dt;
        }
      }
      if (s.cooldown <= 0) {
        this.bullets.push({ x: s.x + s.w / 2, y: s.y - 4 });
        s.cooldown = 0.24;
        if (audio) audio.playFireball();
      }
    } else {
      if (this.input.left) s.x -= s.speed * dt;
      if (this.input.right) s.x += s.speed * dt;
      if (this.input.shoot && s.cooldown <= 0) {
        this.bullets.push({ x: s.x + s.w / 2, y: s.y - 4 });
        s.cooldown = 0.26;
        if (audio) audio.playFireball();
      }
    }
    s.x = Math.max(10, Math.min(W - s.w - 10, s.x));

    // 更新玩家雷射
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.y -= 420 * dt;
      if (b.y < 0) {
        this.bullets.splice(i, 1);
        continue;
      }
      for (let j = this.aliens.length - 1; j >= 0; j--) {
        const a = this.aliens[j];
        if (b.x >= a.x && b.x <= a.x + a.w && b.y >= a.y && b.y <= a.y + a.h) {
          this.score += a.points;
          this.aliens.splice(j, 1);
          this.bullets.splice(i, 1);
          if (audio) audio.playStomp();
          break;
        }
      }
    }

    // 更新外星艦隊移動
    let hitEdge = false;
    this.aliens.forEach(a => {
      a.x += this.alienDir * this.alienSpeed * dt;
      if (a.x < 14 || a.x + a.w > W - 14) hitEdge = true;
    });
    if (hitEdge) {
      this.alienDir = -this.alienDir;
      this.aliens.forEach(a => {
        a.y += 14;
      });
    }

    // 隨機發射敵方雷射
    if (this.aliens.length > 0 && Math.random() < 0.03) {
      const shooter = this.aliens[Math.floor(Math.random() * this.aliens.length)];
      this.enemyBullets.push({ x: shooter.x + shooter.w / 2, y: shooter.y + shooter.h });
    }

    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      eb.y += 230 * dt;
      if (eb.y > H) {
        this.enemyBullets.splice(i, 1);
        continue;
      }
      if (eb.x >= s.x && eb.x <= s.x + s.w && eb.y >= s.y && eb.y <= s.y + s.h) {
        this.enemyBullets.splice(i, 1);
        this.lives--;
        if (audio) audio.playBump();
        if (this.lives <= 0) {
          this.isGameOver = true;
          if (this.overlayEl) this.overlayEl.classList.remove('hidden');
          if (this.isDemoMode) {
            setTimeout(() => {
              if (this.isDemoMode && this.isGameOver && this.isActiveGame) this.resetGame();
            }, 1500);
          }
          return;
        }
      }
    }

    // 檢查外星人是否壓境到底部
    if (this.aliens.some(a => a.y + a.h >= s.y)) {
      this.isGameOver = true;
      if (this.overlayEl) this.overlayEl.classList.remove('hidden');
      if (this.isDemoMode) {
        setTimeout(() => {
          if (this.isDemoMode && this.isGameOver && this.isActiveGame) this.resetGame();
        }, 1500);
      }
      return;
    }

    if (this.aliens.length === 0) {
      this.wave++;
      this.score += 500;
      if (audio) audio.playStageClear();
      this.initWave();
    }

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('arcade_invaders_best', this.bestScore.toString());
      if (window.arcadePlatform) window.arcadePlatform.refreshHighScores();
    }

    this.updateUI();
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#060712';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 繪製外星艦隊
    this.aliens.forEach(a => {
      ctx.fillStyle = a.color;
      ctx.fillRect(a.x + 4, a.y, a.w - 8, a.h - 4);
      ctx.fillRect(a.x, a.y + 4, a.w, a.h - 8);
      ctx.fillStyle = '#000';
      ctx.fillRect(a.x + 6, a.y + 6, 4, 4);
      ctx.fillRect(a.x + a.w - 10, a.y + 6, 4, 4);
    });

    // 繪製戰機
    const s = this.ship;
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(s.x, s.y + 8, s.w, 12);
    ctx.fillRect(s.x + 12, s.y, 12, 10);

    // 雷射
    ctx.fillStyle = '#fcd116';
    this.bullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 12));
    ctx.fillStyle = '#ff0055';
    this.enemyBullets.forEach(eb => ctx.fillRect(eb.x - 2, eb.y, 4, 12));

    if (this.isDemoMode) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(10, 10, 210, 24);
      ctx.strokeStyle = '#00ff88';
      ctx.strokeRect(10, 10, 210, 24);
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.fillText('🤖 AI SNIPER ACTIVE', 18, 26);
      ctx.restore();
    }
  }
}

// ==========================================
// 7. 迷宮小精靈 (Cyber Pac-Man + BFS 鬼魂迴避 AI)
// ==========================================
const PAC_MAP = [
  "11111111111111111111",
  "13222222211222222231",
  "12112111211211121121",
  "12112111211211121121",
  "12222222222222222221",
  "12112121111112121121",
  "12222122211222122221",
  "11112111011011121111",
  "11112100000000121111",
  "10002001100110020001",
  "11112101111110121111",
  "11112100000000121111",
  "12222222211222222221",
  "12112111211211121121",
  "13212222200222221231",
  "11212121111112121211",
  "12222122211222122221",
  "12111111211211111121",
  "12222222222222222221",
  "11111111111111111111"
];

class PacManGame {
  constructor(audioGetter) {
    this.getAudio = audioGetter;
    this.gridSize = 20;
    this.tileSize = 22;

    this.canvas = document.getElementById('pacman-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.scoreEl = document.getElementById('pacman-score');
    this.livesEl = document.getElementById('pacman-lives');
    this.bestEl = document.getElementById('pacman-best');
    this.statusEl = document.getElementById('pacman-status');
    this.overlayEl = document.getElementById('overlay-pacman');

    this.bestScore = parseInt(localStorage.getItem('arcade_pacman_best') || '0', 10);
    this.isActiveGame = false;
    this.isDemoMode = false;
    this.isGameOver = false;

    this.bindEvents();
    this.resetGame();

    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActiveGame) return;
      if (e.code === 'KeyM') {
        e.preventDefault();
        this.toggleDemoMode();
        return;
      }
      if (this.isDemoMode || this.isGameOver) return;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); this.pac.nextDir = { x: 0, y: -1 }; }
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); this.pac.nextDir = { x: 0, y: 1 }; }
      else if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); this.pac.nextDir = { x: -1, y: 0 }; }
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); this.pac.nextDir = { x: 1, y: 0 }; }
    });

    const newBtn = document.getElementById('btn-pacman-new');
    if (newBtn) newBtn.addEventListener('click', () => this.resetGame());

    const retryBtn = document.getElementById('btn-pacman-retry');
    if (retryBtn) retryBtn.addEventListener('click', () => this.resetGame());

    const demoBtn = document.getElementById('btn-pacman-demo');
    if (demoBtn) demoBtn.addEventListener('click', () => this.toggleDemoMode());
  }

  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
    this.initMaze();
    this.resetPositions();
    this.updateUI();
  }

  initMaze() {
    this.map = PAC_MAP.map(row => row.split('').map(Number));
    this.dotsLeft = 0;
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 20; c++) {
        if (this.map[r][c] === 2 || this.map[r][c] === 3) this.dotsLeft++;
      }
    }
  }

  resetPositions() {
    this.pac = { x: 9, y: 14, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 } };
    this.frightenedTimer = 0;
    this.stepTimer = 0;
    this.ghosts = [
      { x: 9, y: 8, color: '#ff0055', dir: { x: 1, y: 0 } },
      { x: 10, y: 8, color: '#ffb8ff', dir: { x: -1, y: 0 } },
      { x: 9, y: 9, color: '#00ffff', dir: { x: 0, y: -1 } },
      { x: 10, y: 9, color: '#ffb852', dir: { x: 0, y: -1 } }
    ];
  }

  isWall(x, y) {
    if (x < 0 || x >= 20 || y < 0 || y >= 20) return true;
    return this.map[y][x] === 1;
  }

  // BFS 計算小精靈最佳下一步 (兼顧吃豆子與避開鬼魂)
  computePacAIDir() {
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    const queue = [[{ x: this.pac.x, y: this.pac.y }]];
    const visited = new Set([`${this.pac.x},${this.pac.y}`]);
    let nearestDotDir = null;

    while (queue.length > 0) {
      const path = queue.shift();
      const curr = path[path.length - 1];
      if (path.length > 1 && (this.map[curr.y][curr.x] === 2 || this.map[curr.y][curr.x] === 3)) {
        nearestDotDir = { x: path[1].x - this.pac.x, y: path[1].y - this.pac.y };
        break;
      }
      for (const d of dirs) {
        const nx = curr.x + d.x;
        const ny = curr.y + d.y;
        const key = `${nx},${ny}`;
        if (!this.isWall(nx, ny) && !visited.has(key)) {
          visited.add(key);
          queue.push([...path, { x: nx, y: ny }]);
        }
      }
    }

    let bestDir = nearestDotDir || this.pac.dir;
    let bestScore = -Infinity;

    for (const d of dirs) {
      const nx = this.pac.x + d.x;
      const ny = this.pac.y + d.y;
      if (this.isWall(nx, ny)) continue;

      let minGhostDist = 99;
      this.ghosts.forEach(g => {
        const dist = Math.abs(g.x - nx) + Math.abs(g.y - ny);
        if (dist < minGhostDist) minGhostDist = dist;
      });

      let score = 0;
      if (this.frightenedTimer > 1.2) {
        score += (20 - minGhostDist) * 15;
      } else if (minGhostDist <= 3) {
        score -= (5 - minGhostDist) * 600;
      }

      if (this.map[ny][nx] === 3) score += 250;
      if (this.map[ny][nx] === 2) score += 80;
      if (nearestDotDir && d.x === nearestDotDir.x && d.y === nearestDotDir.y) score += 120;

      if (score > bestScore) {
        bestScore = score;
        bestDir = d;
      }
    }

    return bestDir;
  }

  step() {
    if (this.isGameOver) return;
    const audio = this.getAudio();

    if (this.isDemoMode) {
      this.pac.nextDir = this.computePacAIDir();
    }

    if (!this.isWall(this.pac.x + this.pac.nextDir.x, this.pac.y + this.pac.nextDir.y)) {
      this.pac.dir = { ...this.pac.nextDir };
    }
    if (!this.isWall(this.pac.x + this.pac.dir.x, this.pac.y + this.pac.dir.y)) {
      this.pac.x += this.pac.dir.x;
      this.pac.y += this.pac.dir.y;
    }

    // 吃豆子與大力丸
    const cell = this.map[this.pac.y][this.pac.x];
    if (cell === 2) {
      this.map[this.pac.y][this.pac.x] = 0;
      this.score += 20;
      this.dotsLeft--;
    } else if (cell === 3) {
      this.map[this.pac.y][this.pac.x] = 0;
      this.score += 100;
      this.dotsLeft--;
      this.frightenedTimer = 7.0;
      if (audio) audio.playPowerup();
    }

    if (this.dotsLeft <= 0) {
      this.score += 1000;
      if (audio) audio.playStageClear();
      this.initMaze();
      this.resetPositions();
      return;
    }

    // 鬼魂移動與碰撞
    const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    for (const g of this.ghosts) {
      if (g.x === this.pac.x && g.y === this.pac.y) {
        if (this.handleGhostTouch(g)) return;
      }

      const valid = dirs.filter(d => !this.isWall(g.x + d.x, g.y + d.y) && !(d.x === -g.dir.x && d.y === -g.dir.y));
      const pool = valid.length > 0 ? valid : dirs.filter(d => !this.isWall(g.x + d.x, g.y + d.y));
      if (pool.length > 0) {
        g.dir = pool[Math.floor(Math.random() * pool.length)];
        g.x += g.dir.x;
        g.y += g.dir.y;
      }

      if (g.x === this.pac.x && g.y === this.pac.y) {
        if (this.handleGhostTouch(g)) return;
      }
    }

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('arcade_pacman_best', this.bestScore.toString());
      if (window.arcadePlatform) window.arcadePlatform.refreshHighScores();
    }

    this.updateUI();
  }

  handleGhostTouch(g) {
    const audio = this.getAudio();
    if (this.frightenedTimer > 0) {
      g.x = 9;
      g.y = 9;
      this.score += 400;
      if (audio) audio.playCoin();
      return false;
    }
    this.lives--;
    if (audio) audio.playDeath();
    if (this.lives <= 0) {
      this.isGameOver = true;
      if (this.overlayEl) this.overlayEl.classList.remove('hidden');
      if (this.isDemoMode) {
        setTimeout(() => {
          if (this.isDemoMode && this.isGameOver && this.isActiveGame) this.resetGame();
        }, 1500);
      }
    } else {
      this.resetPositions();
    }
    this.updateUI();
    return true;
  }

  toggleDemoMode(forceState) {
    this.isDemoMode = typeof forceState === 'boolean' ? forceState : !this.isDemoMode;
    if (this.isDemoMode && this.isGameOver) this.resetGame();
    if (this.statusEl) {
      this.statusEl.textContent = this.isDemoMode
        ? '🤖 AI 正在使用 BFS 尋豆與鬼魂距離威脅迴避演算法...'
        : '使用 WASD 或 方向鍵 吃光迷宮豆子，吃大力丸反噬鬼魂！';
    }
    this.syncDemoUI();
    return this.isDemoMode;
  }

  syncDemoUI() {
    const demoBtn = document.getElementById('btn-pacman-demo');
    if (demoBtn) {
      demoBtn.classList.toggle('active-demo', this.isDemoMode);
      demoBtn.textContent = this.isDemoMode ? '🤖 AI 代玩: ON' : '🤖 AI Demo Mode';
    }
    const globalDemoBtn = document.getElementById('global-demo-btn');
    if (globalDemoBtn && this.isActiveGame) {
      globalDemoBtn.classList.toggle('active-demo', this.isDemoMode);
      globalDemoBtn.innerHTML = this.isDemoMode
        ? '<span>🤖 AI 自動玩: 開啟中</span>'
        : '<span>🤖 Demo Mode (AI 代玩)</span>';
    }
  }

  pauseForSwitch() {}

  updateUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.livesEl) this.livesEl.textContent = `♥ × ${this.lives}`;
    if (this.bestEl) this.bestEl.textContent = this.bestScore;
  }

  loop(timestamp) {
    requestAnimationFrame(this.loop.bind(this));
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (!this.isActiveGame || !this.canvas) return;

    if (this.frightenedTimer > 0) {
      this.frightenedTimer = Math.max(0, this.frightenedTimer - dt);
    }

    this.stepTimer += dt;
    if (this.stepTimer >= (this.isDemoMode ? 0.12 : 0.16)) {
      this.stepTimer = 0;
      this.step();
    }

    this.render();
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const ts = this.tileSize;

    ctx.fillStyle = '#050714';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 20; c++) {
        const cell = this.map[r][c];
        const x = c * ts;
        const y = r * ts;
        if (cell === 1) {
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
          ctx.strokeStyle = '#3b82f6';
          ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);
        } else if (cell === 2) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + ts / 2 - 2, y + ts / 2 - 2, 4, 4);
        } else if (cell === 3) {
          ctx.fillStyle = Math.floor(Date.now() / 180) % 2 === 0 ? '#fcd116' : '#ff3838';
          ctx.beginPath();
          ctx.arc(x + ts / 2, y + ts / 2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 繪製小精靈
    const px = this.pac.x * ts + ts / 2;
    const py = this.pac.y * ts + ts / 2;
    ctx.fillStyle = '#fcd116';
    ctx.beginPath();
    const mouth = (Math.floor(Date.now() / 100) % 2 === 0) ? 0.25 : 0.05;
    ctx.arc(px, py, ts * 0.42, mouth * Math.PI, (2 - mouth) * Math.PI);
    ctx.lineTo(px, py);
    ctx.fill();

    // 繪製鬼魂
    this.ghosts.forEach(g => {
      const gx = g.x * ts;
      const gy = g.y * ts;
      ctx.fillStyle = this.frightenedTimer > 0 ? '#2563eb' : g.color;
      ctx.beginPath();
      ctx.arc(gx + ts / 2, gy + ts / 2 - 2, ts * 0.4, Math.PI, 0);
      ctx.lineTo(gx + ts - 2, gy + ts - 2);
      ctx.lineTo(gx + 2, gy + ts - 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(gx + 5, gy + 6, 4, 4);
      ctx.fillRect(gx + 12, gy + 6, 4, 4);
    });

    if (this.isDemoMode) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(10, 10, 210, 24);
      ctx.strokeStyle = '#00ff88';
      ctx.strokeRect(10, 10, 210, 24);
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.fillText('🤖 AI MAZE SOLVER ON', 18, 26);
      ctx.restore();
    }
  }
}

// ==========================================
// 8. All-in-One 8合1 小遊戲平台總控中心 (ArcadePlatformManager)
// ==========================================
class ArcadePlatformManager {
  constructor() {
    this.currentTab = 'mario';

    const audioGetter = () => {
      if (window.marioGame && window.marioGame.audio) {
        window.marioGame.audio.init();
        return window.marioGame.audio;
      }
      return null;
    };

    this.game2048 = new Game2048(audioGetter);
    this.tetrisGame = new TetrisGame(audioGetter);
    this.snakeGame = new SnakeGame(audioGetter);
    this.breakoutGame = new BreakoutGame(audioGetter);
    this.flappyGame = new FlappyGame(audioGetter);
    this.invadersGame = new SpaceInvadersGame(audioGetter);
    this.pacmanGame = new PacManGame(audioGetter);

    this.bindNavEvents();
    this.refreshHighScores();
  }

  getGameInstance(tab = this.currentTab) {
    const map = {
      mario: window.marioGame,
      '2048': this.game2048,
      tetris: this.tetrisGame,
      snake: this.snakeGame,
      breakout: this.breakoutGame,
      flappy: this.flappyGame,
      invaders: this.invadersGame,
      pacman: this.pacmanGame
    };
    return map[tab] || null;
  }

  switchGame(targetTab, startWithDemo = null) {
    this.currentTab = targetTab;

    const allGames = {
      mario: window.marioGame,
      '2048': this.game2048,
      tetris: this.tetrisGame,
      snake: this.snakeGame,
      breakout: this.breakoutGame,
      flappy: this.flappyGame,
      invaders: this.invadersGame,
      pacman: this.pacmanGame
    };

    Object.entries(allGames).forEach(([key, instance]) => {
      if (!instance) return;
      if (key === targetTab) {
        instance.isActiveGame = true;
      } else {
        instance.isActiveGame = false;
        if (instance.pauseForSwitch) instance.pauseForSwitch();
      }
    });

    const views = {
      hub: document.getElementById('view-hub'),
      mario: document.getElementById('game-container'),
      '2048': document.getElementById('view-2048'),
      tetris: document.getElementById('view-tetris'),
      snake: document.getElementById('view-snake'),
      breakout: document.getElementById('view-breakout'),
      flappy: document.getElementById('view-flappy'),
      invaders: document.getElementById('view-invaders'),
      pacman: document.getElementById('view-pacman')
    };

    Object.entries(views).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle('hidden', key !== targetTab);
    });

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === targetTab);
    });

    const activeInstance = this.getGameInstance(targetTab);
    if (activeInstance) {
      if (typeof startWithDemo === 'boolean') {
        activeInstance.toggleDemoMode(startWithDemo);
      } else if (activeInstance.syncDemoUI) {
        activeInstance.syncDemoUI();
      }
    } else {
      const globalDemoBtn = document.getElementById('global-demo-btn');
      if (globalDemoBtn) {
        globalDemoBtn.classList.remove('active-demo');
        globalDemoBtn.innerHTML = '<span>🤖 Demo Mode (AI 代玩)</span>';
      }
    }

    this.refreshHighScores();
  }

  refreshHighScores() {
    const scores = {
      'hub-best-mario': localStorage.getItem('mario_parkour_highscore') || '0',
      'hub-best-2048': localStorage.getItem('arcade_2048_best') || '0',
      'hub-best-tetris': localStorage.getItem('arcade_tetris_best') || '0',
      'hub-best-snake': localStorage.getItem('arcade_snake_best') || '0',
      'hub-best-breakout': localStorage.getItem('arcade_breakout_best') || '0',
      'hub-best-flappy': localStorage.getItem('arcade_flappy_best') || '0',
      'hub-best-invaders': localStorage.getItem('arcade_invaders_best') || '0',
      'hub-best-pacman': localStorage.getItem('arcade_pacman_best') || '0'
    };

    Object.entries(scores).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });
  }

  bindNavEvents() {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) this.switchGame(tab);
      });
    });

    document.querySelectorAll('[data-launch-game]').forEach(btn => {
      btn.addEventListener('click', () => {
        const game = btn.dataset.launchGame;
        const isDemo = btn.dataset.launchDemo === 'true';
        this.switchGame(game, isDemo);
      });
    });

    const globalDemoBtn = document.getElementById('global-demo-btn');
    if (globalDemoBtn) {
      globalDemoBtn.addEventListener('click', () => {
        if (this.currentTab === 'hub') {
          this.switchGame('mario', true);
          return;
        }
        const instance = this.getGameInstance();
        if (instance && instance.toggleDemoMode) {
          instance.toggleDemoMode();
        }
      });
    }

    const globalSoundBtn = document.getElementById('global-sound-btn');
    if (globalSoundBtn) {
      globalSoundBtn.addEventListener('click', () => {
        if (window.marioGame && window.marioGame.audio) {
          window.marioGame.audio.init();
          const unmuted = window.marioGame.audio.toggleMute();
          globalSoundBtn.textContent = unmuted ? '🔊' : '🔇';
          const marioSoundBtn = document.getElementById('sound-btn');
          if (marioSoundBtn) marioSoundBtn.textContent = unmuted ? '🔊' : '🔇';
        }
      });
    }

    const globalFsBtn = document.getElementById('global-fullscreen-btn');
    if (globalFsBtn) {
      globalFsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.arcadePlatform = new ArcadePlatformManager();
});
