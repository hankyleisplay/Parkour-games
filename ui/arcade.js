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
// 4. All-in-One 小遊戲平台總控中心 (ArcadePlatformManager)
// ==========================================
class ArcadePlatformManager {
  constructor() {
    this.currentTab = 'mario'; // 'hub', 'mario', '2048', 'tetris', 'snake'

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

    this.bindNavEvents();
    this.refreshHighScores();
  }

  getGameInstance(tab = this.currentTab) {
    if (tab === 'mario') return window.marioGame;
    if (tab === '2048') return this.game2048;
    if (tab === 'tetris') return this.tetrisGame;
    if (tab === 'snake') return this.snakeGame;
    return null;
  }

  switchGame(targetTab, startWithDemo = null) {
    this.currentTab = targetTab;

    // 停用非當前遊戲的鍵盤與循環
    const allGames = {
      mario: window.marioGame,
      '2048': this.game2048,
      tetris: this.tetrisGame,
      snake: this.snakeGame
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

    // 切換視圖容器
    const views = {
      hub: document.getElementById('view-hub'),
      mario: document.getElementById('game-container'),
      '2048': document.getElementById('view-2048'),
      tetris: document.getElementById('view-tetris'),
      snake: document.getElementById('view-snake')
    };

    Object.entries(views).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle('hidden', key !== targetTab);
    });

    // 更新導覽列高亮按鈕
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === targetTab);
    });

    // 若指定以 Demo Mode 啟動
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
    const marioBest = localStorage.getItem('mario_parkour_highscore') || '0';
    const best2048 = localStorage.getItem('arcade_2048_best') || '0';
    const tetrisBest = localStorage.getItem('arcade_tetris_best') || '0';
    const snakeBest = localStorage.getItem('arcade_snake_best') || '0';

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('hub-best-mario', marioBest);
    setEl('hub-best-2048', best2048);
    setEl('hub-best-tetris', tetrisBest);
    setEl('hub-best-snake', snakeBest);
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
