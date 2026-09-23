/**
 * Super Mario Parkour - 超級馬力歐跑酷
 * 橫向捲軸經典平台物理引擎、8-Bit 晶片音樂、怪獸踩踏與動態關卡生成系統
 */

// ==========================================
// 1. 8-Bit 晶片音效合成器 (Web Audio API)
// ==========================================
class RetroAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  // 跳躍音效 (方波音調快速上升)
  playJump() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.16);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // 吃金幣雙音叮咚 (B5 -> E6)
  playCoin() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  // 頂擊磚塊咚聲
  playBump() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 頂碎磚塊破裂聲
  playBreak() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 踩怪 (Stomp) 爆裂彈跳聲
  playStomp() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // 吃蘑菇變大上升琶音
  playPowerup() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const freqs = [330, 392, 659, 523, 587, 784];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.05);
      gain.gain.setValueAtTime(0.3, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.12);
    });
  }

  // 死亡 Game Over 旋律
  playDeath() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [500, 400, 300, 250, 180];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + i * 0.09);
      gain.gain.setValueAtTime(0.35, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.09 + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.15);
    });
  }

  // 經典馬力歐 Overworld 輕快背景音樂合成
  startBgm() {
    if (!this.ctx || this.bgmTimer) return;
    const tempo = 140;
    const sixteenth = (60 / tempo) / 4;

    // 經典歡樂 8-Bit 旋律片段
    const melody = [
      659.25, 659.25, 0, 659.25, 0, 523.25, 659.25, 0,
      783.99, 0, 0, 0, 392.00, 0, 0, 0,
      523.25, 0, 0, 392.00, 0, 0, 329.63, 0,
      0, 440.00, 0, 493.88, 0, 466.16, 440.00, 0
    ];

    this.bgmTimer = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const freq = melody[this.bgmStep % melody.length];
      this.bgmStep++;

      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + sixteenth * 1.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + sixteenth * 1.6);
      }
    }, sixteenth * 1000);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// ==========================================
// 2. 常數與圖塊規格
// ==========================================
const TILE_SIZE = 32;
const GRAVITY = 1750;
const ACCEL = 1400;
const MAX_RUN_SPEED = 320;
const FRICTION = 1100;
const JUMP_FORCE = -640;

// ==========================================
// 3. 玩家角色 (Mario)
// ==========================================
class Mario {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = 24;
    this.height = 32; // Small 狀態為 32，Super 狀態為 54
    this.isGrounded = false;
    this.facing = 1; // 1: 右, -1: 左
    this.isSuper = false; // 是否吃到超級蘑菇
    this.isStar = false; // 是否無敵星狀態
    this.starTimer = 0;
    this.invulnerableTimer = 0; // 受傷無敵閃爍時間
    this.isDucking = false;
    this.walkAnimTime = 0;
  }

  makeSuper() {
    if (!this.isSuper) {
      this.isSuper = true;
      this.y -= 22;
      this.height = 54;
    }
  }

  makeSmall() {
    this.isSuper = false;
    this.height = 32;
    this.invulnerableTimer = 2.0; // 2秒無敵閃爍
  }

  setStar(duration = 10) {
    this.isStar = true;
    this.starTimer = duration;
  }

  update(dt, input) {
    // 1. 無敵與星星計時
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }
    if (this.isStar) {
      this.starTimer -= dt;
      if (this.starTimer <= 0) {
        this.isStar = false;
      }
    }

    // 2. 水平輸入與加速度
    const maxSpeed = this.isStar ? MAX_RUN_SPEED * 1.35 : MAX_RUN_SPEED;
    if (input.left) {
      this.vx -= ACCEL * dt;
      this.facing = -1;
    } else if (input.right) {
      this.vx += ACCEL * dt;
      this.facing = 1;
    } else {
      // 地面摩擦減速
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - FRICTION * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + FRICTION * dt);
      }
    }
    this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));

    // 3. 跳躍
    if (input.jump && this.isGrounded) {
      this.vy = JUMP_FORCE;
      this.isGrounded = false;
      game.audio.playJump();
    }
    // 釋放跳躍鍵提前截斷跳躍弧線 (實現長按跳得更高、短按輕跳)
    if (!input.jump && this.vy < -240) {
      this.vy = -240;
    }

    // 4. 下蹲
    this.isDucking = input.down && this.isGrounded && this.isSuper;

    // 5. 重力模擬
    this.vy += GRAVITY * dt;

    // 6. 移動步進
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 奔跑動畫計時
    if (this.isGrounded && Math.abs(this.vx) > 10) {
      this.walkAnimTime += dt * Math.abs(this.vx) * 0.05;
    }
  }

  draw(ctx, cameraX) {
    // 受傷閃爍
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      return;
    }

    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);

    ctx.save();
    ctx.translate(drawX + this.width / 2, drawY + this.height);
    ctx.scale(this.facing, 1);

    // 無敵星彩虹閃爍色彩
    let hatColor = '#e52521';
    let overallsColor = '#0050d0';
    if (this.isStar) {
      const hues = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff', '#ff00ff'];
      hatColor = hues[Math.floor(Date.now() / 90) % hues.length];
      overallsColor = '#ffffff';
    }

    const h = this.height;
    const w = this.width;

    // 繪製經典像素馬力歐風格角色
    // 1. 鞋子
    ctx.fillStyle = '#6b3600';
    const walkOffset = this.isGrounded ? Math.sin(this.walkAnimTime) * 4 : -3;
    ctx.fillRect(-w / 2, -6, 10, 6);
    ctx.fillRect(w / 2 - 10, -6 + walkOffset, 10, 6);

    // 2. 藍色吊帶褲 (Overalls)
    ctx.fillStyle = overallsColor;
    const bodyH = this.isSuper ? 24 : 14;
    ctx.fillRect(-w / 2 + 2, -bodyH - 6, w - 4, bodyH);

    // 3. 紅色襯衫 (Shirt)
    ctx.fillStyle = hatColor;
    ctx.fillRect(-w / 2 + 1, -bodyH - 2, 5, 8);
    ctx.fillRect(w / 2 - 6, -bodyH - 2, 5, 8);

    // 4. 頭部與膚色
    ctx.fillStyle = '#ffbe8f';
    const headSize = this.isSuper ? 18 : 14;
    const headY = -h + (this.isSuper ? 14 : 10);
    ctx.fillRect(-headSize / 2 + 2, headY, headSize, headSize);

    // 5. 黑色八字鬍與眼睛
    ctx.fillStyle = '#000000';
    ctx.fillRect(2, headY + headSize * 0.4, 6, 4); // 鬍子
    ctx.fillRect(3, headY + headSize * 0.15, 3, 4); // 眼睛

    // 6. 紅色經典標誌帽子 (Cap)
    ctx.fillStyle = hatColor;
    ctx.fillRect(-headSize / 2, -h, headSize + 4, 8);
    ctx.fillRect(2, -h + 4, 8, 4); // 帽簷

    ctx.restore();
  }
}

// ==========================================
// 4. 敵人系統 (Goomba 栗寶寶 & Koopa 烏龜)
// ==========================================
class Goomba {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 28;
    this.vx = -70;
    this.vy = 0;
    this.isDead = false;
    this.deadTimer = 0;
  }

  update(dt, tiles) {
    if (this.isDead) {
      this.deadTimer += dt;
      return;
    }
    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 與地面碰撞
    this.handleTileCollision(tiles);
  }

  handleTileCollision(tiles) {
    tiles.forEach(tile => {
      if (tile.type === 'EMPTY') return;
      if (
        this.x < tile.x + tile.w &&
        this.x + this.width > tile.x &&
        this.y < tile.y + tile.h &&
        this.y + this.height > tile.y
      ) {
        // 腳下著地
        if (this.vy > 0 && this.y + this.height - this.vy * 0.05 <= tile.y) {
          this.y = tile.y - this.height;
          this.vy = 0;
        } else {
          // 撞牆反彈變向
          this.vx = -this.vx;
        }
      }
    });
  }

  draw(ctx, cameraX) {
    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);

    if (this.isDead) {
      // 被踩扁的壓扁效果
      ctx.fillStyle = '#9b4200';
      ctx.fillRect(drawX, drawY + 16, this.width, 12);
      ctx.fillStyle = '#000';
      ctx.fillRect(drawX + 6, drawY + 19, 4, 3);
      ctx.fillRect(drawX + 18, drawY + 19, 4, 3);
      return;
    }

    // 栗寶寶蘑菇頭
    ctx.fillStyle = '#a84c00';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(drawX, drawY, this.width, 20, 6) : ctx.fillRect(drawX, drawY, this.width, 20);
    ctx.fill();

    // 黑色憤怒雙眼
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX + 4, drawY + 6, 6, 8);
    ctx.fillRect(drawX + 18, drawY + 6, 6, 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(drawX + 7, drawY + 8, 3, 6);
    ctx.fillRect(drawX + 18, drawY + 8, 3, 6);

    // 腳步
    ctx.fillStyle = '#000000';
    const step = Math.floor(Date.now() / 150) % 2 === 0 ? 2 : -2;
    ctx.fillRect(drawX + 2 + step, drawY + 20, 10, 8);
    ctx.fillRect(drawX + 16 - step, drawY + 20, 10, 8);
  }
}

// 綠烏龜 (Koopa)
class Koopa {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 36;
    this.vx = -60;
    this.vy = 0;
    this.isShell = false;
    this.isKicked = false;
  }

  update(dt, tiles) {
    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    tiles.forEach(tile => {
      if (tile.type === 'EMPTY') return;
      if (
        this.x < tile.x + tile.w &&
        this.x + this.width > tile.x &&
        this.y < tile.y + tile.h &&
        this.y + this.height > tile.y
      ) {
        if (this.vy > 0 && this.y + this.height - this.vy * 0.05 <= tile.y) {
          this.y = tile.y - this.height;
          this.vy = 0;
        } else {
          this.vx = -this.vx;
        }
      }
    });
  }

  draw(ctx, cameraX) {
    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);

    if (this.isShell) {
      // 縮入綠色龜殼
      ctx.fillStyle = '#00a800';
      ctx.beginPath();
      ctx.arc(drawX + 14, drawY + 18, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(drawX + 8, drawY + 12, 12, 10);
      return;
    }

    // 烏龜身體
    ctx.fillStyle = '#00a800';
    ctx.fillRect(drawX + 4, drawY + 8, 20, 20); // 龜殼
    ctx.fillStyle = '#ffd13b';
    ctx.fillRect(drawX + (this.vx > 0 ? 18 : 0), drawY, 10, 12); // 頭
    ctx.fillStyle = '#ff3838';
    ctx.fillRect(drawX + 2, drawY + 28, 10, 8); // 鞋
    ctx.fillRect(drawX + 16, drawY + 28, 10, 8);
  }
}

// ==========================================
// 5. 道具 (Super Mushroom & Coin)
// ==========================================
class Mushroom {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 26;
    this.height = 26;
    this.vx = 80;
    this.vy = -180;
  }

  update(dt, tiles) {
    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    tiles.forEach(tile => {
      if (tile.type === 'EMPTY') return;
      if (
        this.x < tile.x + tile.w &&
        this.x + this.width > tile.x &&
        this.y < tile.y + tile.h &&
        this.y + this.height > tile.y
      ) {
        if (this.vy > 0 && this.y + this.height - this.vy * 0.05 <= tile.y) {
          this.y = tile.y - this.height;
          this.vy = 0;
        } else {
          this.vx = -this.vx;
        }
      }
    });
  }

  draw(ctx, cameraX) {
    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);

    // 紅底白點超級蘑菇
    ctx.fillStyle = '#e52521';
    ctx.beginPath();
    ctx.arc(drawX + 13, drawY + 12, 12, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX + 10, drawY + 3, 6, 6);
    ctx.fillRect(drawX + 3, drawY + 8, 4, 4);
    ctx.fillRect(drawX + 19, drawY + 8, 4, 4);

    // 蘑菇莖
    ctx.fillStyle = '#ffbe8f';
    ctx.fillRect(drawX + 6, drawY + 12, 14, 14);
  }
}

// ==========================================
// 6. 磚塊與粒子效果
// ==========================================
class Particle {
  constructor(x, y, vx, vy, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = 6;
    this.life = 0.6;
  }

  update(dt) {
    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx, cameraX) {
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.floor(this.x - cameraX), Math.floor(this.y), this.size, this.size);
  }
}

// ==========================================
// 7. 核心遊戲引擎 (Game)
// ==========================================
class SuperMarioGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.audio = new RetroAudio();

    // 畫布基礎邏輯解析度 (經典像素比例 640x360)
    this.baseW = 640;
    this.baseH = 360;
    this.cameraX = 0;

    // 遊戲狀態數值
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.distance = 0;
    this.highScore = parseInt(localStorage.getItem('mario_parkour_highscore') || '0', 10);
    this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAMEOVER'

    // 輸入監聽
    this.input = { left: false, right: false, jump: false, down: false };

    // 遊戲實體
    this.mario = new Mario(100, 200);
    this.tiles = [];
    this.enemies = [];
    this.mushrooms = [];
    this.particles = [];
    this.nextChunkX = 0;

    // DOM 快取
    this.hud = document.getElementById('hud');
    this.scoreDisplay = document.getElementById('score-display');
    this.coinsDisplay = document.getElementById('coins-display');
    this.distanceDisplay = document.getElementById('distance-display');
    this.livesDisplay = document.getElementById('lives-display');
    this.startScreen = document.getElementById('start-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.startHighScore = document.getElementById('start-high-score');
    this.finalScore = document.getElementById('final-score');
    this.finalDistance = document.getElementById('final-distance');
    this.finalCoins = document.getElementById('final-coins');
    this.finalBestScore = document.getElementById('final-best-score');
    this.newRecordBadge = document.getElementById('new-record-badge');

    this.startHighScore.textContent = this.padScore(this.highScore);

    this.resizeCanvas();
    this.bindEvents();
    this.initWorld();

    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  resizeCanvas() {
    this.canvas.width = this.baseW;
    this.canvas.height = this.baseH;
  }

  padScore(num, size = 6) {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }

  initWorld() {
    this.tiles = [];
    this.enemies = [];
    this.mushrooms = [];
    this.particles = [];
    this.nextChunkX = 0;
    this.cameraX = 0;

    // 先生成前 4 個區塊的地形
    for (let i = 0; i < 4; i++) {
      this.generateChunk();
    }
  }

  // 無盡動態生成地圖模塊
  generateChunk() {
    const startX = this.nextChunkX;
    const chunkWidth = 20 * TILE_SIZE; // 每個區塊 20 格寬
    const groundY = this.baseH - TILE_SIZE * 2;

    // 隨機選擇區塊樣式 (0: 平地, 1: 懸崖深淵, 2: 磚塊跳台, 3: 高低水管)
    const pattern = this.nextChunkX === 0 ? 0 : Math.floor(Math.random() * 4);

    if (pattern === 1) {
      // 懸崖深淵 (留空 4 格)
      for (let x = startX; x < startX + chunkWidth; x += TILE_SIZE) {
        if (x < startX + TILE_SIZE * 6 || x > startX + TILE_SIZE * 11) {
          this.tiles.push({ x, y: groundY, w: TILE_SIZE, h: TILE_SIZE * 2, type: 'GROUND' });
        }
      }
    } else {
      // 實心平地
      for (let x = startX; x < startX + chunkWidth; x += TILE_SIZE) {
        this.tiles.push({ x, y: groundY, w: TILE_SIZE, h: TILE_SIZE * 2, type: 'GROUND' });
      }

      if (pattern === 2) {
        // 空中問號磚與普通磚塊
        const by = groundY - TILE_SIZE * 3.5;
        this.tiles.push({ x: startX + TILE_SIZE * 4, y: by, w: TILE_SIZE, h: TILE_SIZE, type: 'BRICK' });
        this.tiles.push({ x: startX + TILE_SIZE * 5, y: by, w: TILE_SIZE, h: TILE_SIZE, type: 'QUESTION', hasMushroom: true });
        this.tiles.push({ x: startX + TILE_SIZE * 6, y: by, w: TILE_SIZE, h: TILE_SIZE, type: 'BRICK' });
        this.tiles.push({ x: startX + TILE_SIZE * 7, y: by, w: TILE_SIZE, h: TILE_SIZE, type: 'QUESTION', hasCoin: true });
        this.tiles.push({ x: startX + TILE_SIZE * 8, y: by, w: TILE_SIZE, h: TILE_SIZE, type: 'BRICK' });

        // 生成敵人
        this.enemies.push(new Goomba(startX + TILE_SIZE * 6, groundY - 28));
      } else if (pattern === 3) {
        // 經典綠色水管障礙
        const pipeH = (2 + Math.floor(Math.random() * 2)) * TILE_SIZE;
        this.tiles.push({
          x: startX + TILE_SIZE * 8,
          y: groundY - pipeH,
          w: TILE_SIZE * 2,
          h: pipeH,
          type: 'PIPE'
        });

        // 放置綠烏龜敵人
        this.enemies.push(new Koopa(startX + TILE_SIZE * 13, groundY - 36));
      } else {
        // 普通平地生成 1~2 隻栗寶寶
        if (this.nextChunkX > 0) {
          this.enemies.push(new Goomba(startX + TILE_SIZE * 10, groundY - 28));
        }
      }
    }

    this.nextChunkX += chunkWidth;
  }

  bindEvents() {
    window.addEventListener('resize', this.resizeCanvas.bind(this));

    // 鍵盤操作
    window.addEventListener('keydown', (e) => {
      if (this.state === 'START' && (e.code === 'Space' || e.code === 'Enter')) {
        this.startGame();
        return;
      }
      if (this.state === 'GAMEOVER' && (e.code === 'Space' || e.code === 'Enter')) {
        this.restartGame();
        return;
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
        return;
      }

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = true;
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') this.input.jump = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.down = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = false;
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') this.input.jump = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.down = false;
    });

    // 觸控螢幕手勢
    let touchStartX = 0;
    let touchStartY = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      if (this.state === 'START') this.startGame();
      if (this.state === 'GAMEOVER') this.restartGame();
    });

    this.canvas.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      this.input.right = dx > 20;
      this.input.left = dx < -20;
      this.input.jump = dy < -25;
      this.input.down = dy > 25;
    });

    this.canvas.addEventListener('touchend', () => {
      this.input.right = false;
      this.input.left = false;
      this.input.jump = false;
      this.input.down = false;
    });

    // UI 按鈕交互
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('pause-restart-btn').addEventListener('click', () => this.restartGame());

    document.getElementById('sound-btn').addEventListener('click', (e) => {
      this.audio.init();
      const unmuted = this.audio.toggleMute();
      e.target.textContent = unmuted ? '🔊' : '🔇';
    });

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  startGame() {
    this.audio.init();
    this.audio.startBgm();
    this.state = 'PLAYING';
    this.startScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.pauseScreen.classList.remove('hidden');
      this.audio.stopBgm();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.pauseScreen.classList.add('hidden');
      this.audio.startBgm();
    }
  }

  onGameOver() {
    this.state = 'GAMEOVER';
    this.audio.playDeath();
    this.audio.stopBgm();

    const isNewRecord = this.score > this.highScore;
    if (isNewRecord) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem('mario_parkour_highscore', this.highScore.toString());
      this.newRecordBadge.classList.remove('hidden');
    } else {
      this.newRecordBadge.classList.add('hidden');
    }

    this.finalScore.textContent = this.padScore(Math.floor(this.score));
    this.finalDistance.textContent = `${Math.floor(this.distance)} m`;
    this.finalCoins.textContent = this.coins.toString();
    this.finalBestScore.textContent = this.padScore(this.highScore);

    // Tauri Rust 原生命令互通
    try {
      if (window.__TAURI__ && window.__TAURI__.core) {
        window.__TAURI__.core.invoke('save_game_record', {
          record: {
            score: Math.floor(this.score),
            distance: Math.floor(this.distance),
            coins: this.coins,
            timestamp: Date.now()
          }
        }).then(res => console.log('Tauri Rust:', res)).catch(e => console.warn(e));
      }
    } catch (e) {}

    this.hud.classList.add('hidden');
    this.gameOverScreen.classList.remove('hidden');
  }

  restartGame() {
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.distance = 0;
    this.mario = new Mario(100, 200);

    this.initWorld();

    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');

    this.audio.startBgm();
    this.state = 'PLAYING';
  }

  gameLoop(timestamp) {
    requestAnimationFrame(this.gameLoop.bind(this));

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }
    this.render();
  }

  update(dt) {
    const mario = this.mario;

    // 1. 更新馬力歐物理
    mario.update(dt, this.input);

    // 奔跑距離與得分累計
    if (mario.x > this.distance * 10 + 100) {
      this.distance = Math.floor((mario.x - 100) / 10);
      this.score += 2;
    }

    // 2. 馬力歐與地形方塊碰撞檢測
    mario.isGrounded = false;
    for (let i = this.tiles.length - 1; i >= 0; i--) {
      const tile = this.tiles[i];
      if (tile.type === 'EMPTY') continue;

      if (
        mario.x < tile.x + tile.w &&
        mario.x + mario.width > tile.x &&
        mario.y < tile.y + tile.h &&
        mario.y + mario.height > tile.y
      ) {
        const prevY = mario.y - mario.vy * dt;

        // 從上方落地踩在磚塊上
        if (prevY + mario.height <= tile.y + 8 && mario.vy >= 0) {
          mario.y = tile.y - mario.height;
          mario.vy = 0;
          mario.isGrounded = true;
        }
        // 從下方頂擊磚塊
        else if (prevY >= tile.y + tile.h - 8 && mario.vy < 0) {
          mario.y = tile.y + tile.h;
          mario.vy = 40; // 撞頭向下彈

          if (tile.type === 'QUESTION') {
            tile.type = 'EMPTY';
            if (tile.hasMushroom) {
              this.mushrooms.push(new Mushroom(tile.x, tile.y - 28));
              this.audio.playPowerup();
            } else {
              this.coins += 1;
              this.score += 200;
              this.audio.playCoin();
            }
          } else if (tile.type === 'BRICK') {
            if (mario.isSuper) {
              // 超級馬力歐頂碎磚塊
              this.audio.playBreak();
              this.createBrickDebris(tile.x + 16, tile.y + 16);
              this.tiles.splice(i, 1);
              this.score += 50;
              continue;
            } else {
              this.audio.playBump();
            }
          }
        }
        // 側面阻擋
        else {
          if (mario.vx > 0) mario.x = tile.x - mario.width;
          else if (mario.vx < 0) mario.x = tile.x + tile.w;
          mario.vx = 0;
        }
      }
    }

    // 3. 掉入無底深淵判定
    if (mario.y > this.baseH + 50) {
      this.lives--;
      if (this.lives > 0) {
        mario.x = this.cameraX + 60;
        mario.y = 100;
        mario.vy = 0;
        mario.makeSmall();
      } else {
        this.onGameOver();
        return;
      }
    }

    // 4. 蘑菇更新與拾取
    for (let i = this.mushrooms.length - 1; i >= 0; i--) {
      const shroom = this.mushrooms[i];
      shroom.update(dt, this.tiles);

      if (
        mario.x < shroom.x + shroom.width &&
        mario.x + mario.width > shroom.x &&
        mario.y < shroom.y + shroom.height &&
        mario.y + mario.height > shroom.y
      ) {
        mario.makeSuper();
        this.audio.playPowerup();
        this.score += 1000;
        this.mushrooms.splice(i, 1);
      }
    }

    // 5. 敵人碰撞 (踩踏判定)
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.tiles);

      // 清理死後超時怪物
      if (enemy.isDead && enemy.deadTimer > 0.4) {
        this.enemies.splice(i, 1);
        continue;
      }

      if (
        !enemy.isDead &&
        mario.x < enemy.x + enemy.width &&
        mario.x + mario.width > enemy.x &&
        mario.y < enemy.y + enemy.height &&
        mario.y + mario.height > enemy.y
      ) {
        // 從上方踩怪 (Stomp) 或無敵星衝撞
        if (mario.isStar) {
          enemy.isDead = true;
          this.audio.playStomp();
          this.score += 400;
        } else if (mario.vy > 0 && mario.y + mario.height - mario.vy * dt <= enemy.y + 12) {
          if (enemy instanceof Goomba) {
            enemy.isDead = true;
            this.audio.playStomp();
          } else if (enemy instanceof Koopa) {
            if (!enemy.isShell) {
              enemy.isShell = true;
              enemy.vx = 0;
              this.audio.playStomp();
            } else {
              // 踢飛龜殼
              enemy.vx = 260;
              this.audio.playStomp();
            }
          }
          mario.vy = -480; // 踩怪反彈跳躍
          this.score += 200;
        } else {
          // 被怪物正面撞擊傷害
          if (mario.invulnerableTimer <= 0) {
            if (mario.isSuper) {
              mario.makeSmall();
              this.audio.playBump();
            } else {
              this.lives--;
              if (this.lives <= 0) {
                this.onGameOver();
                return;
              } else {
                mario.x -= 30;
                mario.invulnerableTimer = 2.0;
                this.audio.playBump();
              }
            }
          }
        }
      }
    }

    // 6. 粒子更新
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // 7. 相機鏡頭平滑跟隨 (不允許回頭，經典跑酷體驗)
    const targetCamX = mario.x - 140;
    if (targetCamX > this.cameraX) {
      this.cameraX += (targetCamX - this.cameraX) * Math.min(dt * 8, 1);
    }

    // 8. 動態生成新地塊、回收身後地塊
    if (this.nextChunkX < this.cameraX + this.baseW * 2) {
      this.generateChunk();
    }
    // 釋放遠後方地塊
    this.tiles = this.tiles.filter(t => t.x + t.w > this.cameraX - 100);

    // 9. 更新 HUD
    this.scoreDisplay.textContent = this.padScore(Math.floor(this.score));
    this.coinsDisplay.textContent = this.coins < 10 ? '0' + this.coins : this.coins;
    this.distanceDisplay.textContent = `${this.distance}m`;
    this.livesDisplay.textContent = `♥ × ${this.lives}`;
  }

  createBrickDebris(x, y) {
    const colors = ['#b84400', '#d86200', '#8b2e00'];
    for (let i = 0; i < 6; i++) {
      const vx = (Math.random() - 0.5) * 300;
      const vy = -300 - Math.random() * 200;
      this.particles.push(new Particle(x, y, vx, vy, colors[i % colors.length]));
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.baseW, this.baseH);

    // 1. 經典馬力歐藍天背景
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, this.baseW, this.baseH);

    // 2. 背景像素白雲與遠山
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
      const cx = ((i * 180 - this.cameraX * 0.2) % (this.baseW + 200)) - 50;
      ctx.fillRect(cx, 40 + (i % 2) * 30, 48, 16);
      ctx.fillRect(cx + 12, 30 + (i % 2) * 30, 24, 12);
    }
    // 綠色遠山
    ctx.fillStyle = '#00a800';
    for (let i = 0; i < 4; i++) {
      const mx = ((i * 240 - this.cameraX * 0.4) % (this.baseW + 200)) - 60;
      ctx.beginPath();
      ctx.arc(mx + 40, this.baseH - 50, 45, Math.PI, 0);
      ctx.fill();
    }

    // 3. 繪製地形與磚塊
    this.tiles.forEach(tile => {
      const dx = Math.floor(tile.x - this.cameraX);
      const dy = Math.floor(tile.y);

      if (dx + tile.w < 0 || dx > this.baseW) return;

      if (tile.type === 'GROUND') {
        // 地表綠草地皮
        ctx.fillStyle = '#00a800';
        ctx.fillRect(dx, dy, tile.w, 8);
        // 泥土磚
        ctx.fillStyle = '#c84c0c';
        ctx.fillRect(dx, dy + 8, tile.w, tile.h - 8);
        // 像素裝飾點
        ctx.fillStyle = '#000000';
        ctx.fillRect(dx + 4, dy + 14, 4, 4);
        ctx.fillRect(dx + 20, dy + 22, 4, 4);
      } else if (tile.type === 'BRICK') {
        ctx.fillStyle = '#b84400';
        ctx.fillRect(dx, dy, tile.w, tile.h);
        ctx.fillStyle = '#000000';
        ctx.strokeRect(dx + 1, dy + 1, tile.w - 2, tile.h - 2);
        ctx.fillRect(dx + 4, dy + 8, 10, 4);
        ctx.fillRect(dx + 18, dy + 20, 10, 4);
      } else if (tile.type === 'QUESTION') {
        // 金黃問號磚 [ ? ]
        ctx.fillStyle = '#fc9838';
        ctx.fillRect(dx, dy, tile.w, tile.h);
        ctx.fillStyle = '#000000';
        ctx.strokeRect(dx + 1, dy + 1, tile.w - 2, tile.h - 2);
        // 問號字樣
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.fillText('?', dx + 11, dy + 22);
      } else if (tile.type === 'EMPTY') {
        // 頂擊後的空白金屬磚
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(dx, dy, tile.w, tile.h);
        ctx.fillStyle = '#000000';
        ctx.strokeRect(dx + 1, dy + 1, tile.w - 2, tile.h - 2);
        ctx.fillRect(dx + 3, dy + 3, 3, 3);
        ctx.fillRect(dx + tile.w - 6, dy + 3, 3, 3);
        ctx.fillRect(dx + 3, dy + tile.h - 6, 3, 3);
        ctx.fillRect(dx + tile.w - 6, dy + tile.h - 6, 3, 3);
      } else if (tile.type === 'PIPE') {
        // 綠色水管
        ctx.fillStyle = '#00a800';
        ctx.fillRect(dx, dy, tile.w, tile.h);
        // 水管頂沿
        ctx.fillStyle = '#008000';
        ctx.fillRect(dx - 2, dy, tile.w + 4, 16);
        ctx.fillStyle = '#5cff5c';
        ctx.fillRect(dx + 4, dy, 6, tile.h); // 高光反光帶
      }
    });

    // 4. 繪製蘑菇
    this.mushrooms.forEach(m => m.draw(ctx, this.cameraX));

    // 5. 繪製敵人
    this.enemies.forEach(e => e.draw(ctx, this.cameraX));

    // 6. 繪製馬力歐主角
    this.mario.draw(ctx, this.cameraX);

    // 7. 繪製粒子碎片
    this.particles.forEach(p => p.draw(ctx, this.cameraX));
  }
}

// 啟動遊戲
let game = null;
window.addEventListener('DOMContentLoaded', () => {
  game = new SuperMarioGame();
});
