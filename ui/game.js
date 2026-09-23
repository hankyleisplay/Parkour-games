/**
 * Super Mario Parkour - 超級馬力歐跑酷 (豪華版)
 * 高解析度像素精靈、多幀動作動畫、火焰花與彈跳火球、食人花、過關旗杆結算系統
 */

// ==========================================
// 1. 8-Bit 復古晶片音樂與音效引擎 (Web Audio API)
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

  playJump() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.16);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

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

  playBreak() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.2);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playStomp() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

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

  playFireball() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playFlagSlide() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.8);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  playStageClear() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [
      { f: 523, t: 0.0 }, { f: 659, t: 0.12 }, { f: 784, t: 0.24 },
      { f: 1046, t: 0.36 }, { f: 880, t: 0.52 }, { f: 1046, t: 0.68 }
    ];
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.28, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + n.t);
      osc.stop(now + n.t + 0.25);
    });
  }

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

  startBgm() {
    if (!this.ctx || this.bgmTimer) return;
    const tempo = 142;
    const sixteenth = (60 / tempo) / 4;
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
// 2. 常數與物理配置
// ==========================================
const TILE_SIZE = 32;
const GRAVITY = 1750;
const ACCEL = 1400;
const NORMAL_MAX_SPEED = 300;
const SPRINT_MAX_SPEED = 460;
const FRICTION = 1100;
const JUMP_FORCE = -650;

// ==========================================
// 3. 高精度像素精靈畫家 (SpriteRenderer)
// ==========================================
class SpriteRenderer {
  // 繪製高精度小馬力歐 (16x16 像素矩陣)
  static drawSmallMario(ctx, x, y, facing, frame, form, isStar) {
    ctx.save();
    ctx.translate(x + 12, y + 28);
    ctx.scale(facing, 1);

    // 顏色定義 (普通、火焰、無敵星)
    let hatColor = '#e52521';
    let overallsColor = '#0050d0';
    let shirtColor = '#e52521';

    if (form === 'FIRE') {
      hatColor = '#ffffff';
      shirtColor = '#ffffff';
      overallsColor = '#e52521';
    } else if (isStar) {
      const rainbow = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00e5ff', '#ff00ff'];
      hatColor = rainbow[Math.floor(Date.now() / 80) % rainbow.length];
      overallsColor = '#ffffff';
      shirtColor = hatColor;
    }

    const skin = '#ffbe8f';
    const brown = '#522900';
    const gold = '#fcd116';

    // 動作姿態處理:
    // frame: 'stand', 'run1', 'run2', 'run3', 'jump', 'skid', 'crouch'
    if (frame === 'crouch') {
      // 下蹲縮小身姿
      ctx.fillStyle = hatColor;
      ctx.fillRect(-10, -18, 20, 6);
      ctx.fillStyle = skin;
      ctx.fillRect(-8, -12, 16, 8);
      ctx.fillStyle = '#000';
      ctx.fillRect(2, -10, 4, 3);
      ctx.fillStyle = overallsColor;
      ctx.fillRect(-10, -4, 20, 4);
      ctx.restore();
      return;
    }

    if (frame === 'jump') {
      // 經典抬拳跳躍姿勢
      // 帽子
      ctx.fillStyle = hatColor;
      ctx.fillRect(-8, -30, 16, 6);
      ctx.fillRect(0, -28, 10, 4); // 帽簷
      // 臉部
      ctx.fillStyle = skin;
      ctx.fillRect(-6, -24, 14, 8);
      ctx.fillStyle = '#000';
      ctx.fillRect(4, -22, 3, 3); // 眼睛
      ctx.fillRect(2, -18, 8, 3); // 鬍子
      // 舉起右手
      ctx.fillStyle = shirtColor;
      ctx.fillRect(4, -32, 6, 8);
      ctx.fillStyle = '#fff';
      ctx.fillRect(5, -35, 5, 5); // 手套拳頭
      // 身體吊帶褲
      ctx.fillStyle = overallsColor;
      ctx.fillRect(-8, -16, 16, 10);
      ctx.fillStyle = gold;
      ctx.fillRect(0, -14, 2, 2); // 鈕扣
      // 分腿跳躍姿勢
      ctx.fillStyle = brown;
      ctx.fillRect(-12, -6, 8, 6); // 後腳屈起
      ctx.fillRect(4, -3, 8, 6);  // 前腳踢出
      ctx.restore();
      return;
    }

    if (frame === 'skid') {
      // 煞車打滑轉向姿勢
      ctx.fillStyle = hatColor;
      ctx.fillRect(-8, -28, 16, 6);
      ctx.fillStyle = skin;
      ctx.fillRect(-6, -22, 14, 8);
      ctx.fillStyle = '#000';
      ctx.fillRect(-4, -20, 3, 3);
      ctx.fillRect(-6, -16, 6, 3);
      ctx.fillStyle = overallsColor;
      ctx.fillRect(-8, -14, 16, 8);
      ctx.fillStyle = brown;
      ctx.fillRect(-8, -6, 16, 6);
      ctx.restore();
      return;
    }

    // 站立與奔跑 3 幀循環
    // 1. 帽子
    ctx.fillStyle = hatColor;
    ctx.fillRect(-8, -28, 16, 6);
    ctx.fillRect(2, -26, 8, 4); // 帽簷

    // 2. 臉部與膚色
    ctx.fillStyle = skin;
    ctx.fillRect(-6, -22, 14, 8);

    // 3. 鬍子、鼻子與眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(4, -20, 3, 3); // 眼睛
    ctx.fillStyle = skin;
    ctx.fillRect(7, -19, 3, 3); // 鼻子
    ctx.fillStyle = '#000';
    ctx.fillRect(3, -16, 8, 3); // 經典八字鬍
    ctx.fillRect(-6, -22, 3, 6); // 鬢角

    // 4. 上衣與手臂
    ctx.fillStyle = shirtColor;
    ctx.fillRect(-7, -14, 14, 6);
    const armSwing = frame === 'run1' ? 4 : (frame === 'run3' ? -4 : 0);
    ctx.fillRect(-7 - armSwing, -13, 4, 6);
    ctx.fillRect(3 + armSwing, -13, 4, 6);
    ctx.fillStyle = '#fff'; // 白手套
    ctx.fillRect(-7 - armSwing, -7, 4, 3);
    ctx.fillRect(3 + armSwing, -7, 4, 3);

    // 5. 藍色吊帶褲
    ctx.fillStyle = overallsColor;
    ctx.fillRect(-6, -14, 12, 8);
    ctx.fillStyle = gold;
    ctx.fillRect(0, -12, 2, 2); // 黃色吊帶扣

    // 6. 雙腳皮鞋奔跑步態
    ctx.fillStyle = brown;
    if (frame === 'run1') {
      ctx.fillRect(-10, -6, 7, 6);
      ctx.fillRect(3, -4, 8, 4);
    } else if (frame === 'run3') {
      ctx.fillRect(-6, -4, 7, 4);
      ctx.fillRect(4, -6, 8, 6);
    } else {
      // stand 或 run2
      ctx.fillRect(-8, -6, 7, 6);
      ctx.fillRect(2, -6, 7, 6);
    }

    ctx.restore();
  }

  // 繪製高精度超級馬力歐 (16x32 高身形)
  static drawSuperMario(ctx, x, y, facing, frame, form, isStar) {
    ctx.save();
    ctx.translate(x + 14, y + 48);
    ctx.scale(facing, 1);

    let hatColor = '#e52521';
    let overallsColor = '#0050d0';
    let shirtColor = '#e52521';

    if (form === 'FIRE') {
      hatColor = '#ffffff';
      shirtColor = '#ffffff';
      overallsColor = '#e52521';
    } else if (isStar) {
      const rainbow = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00e5ff', '#ff00ff'];
      hatColor = rainbow[Math.floor(Date.now() / 80) % rainbow.length];
      overallsColor = '#ffffff';
      shirtColor = hatColor;
    }

    const skin = '#ffbe8f';
    const brown = '#522900';
    const gold = '#fcd116';

    if (frame === 'crouch') {
      ctx.fillStyle = hatColor;
      ctx.fillRect(-12, -26, 24, 8);
      ctx.fillStyle = skin;
      ctx.fillRect(-10, -18, 20, 10);
      ctx.fillStyle = '#000';
      ctx.fillRect(3, -16, 4, 4);
      ctx.fillStyle = overallsColor;
      ctx.fillRect(-12, -8, 24, 8);
      ctx.restore();
      return;
    }

    if (frame === 'jump') {
      // 豪邁上衝姿態
      ctx.fillStyle = hatColor;
      ctx.fillRect(-10, -48, 20, 8);
      ctx.fillRect(2, -45, 10, 5);
      ctx.fillStyle = skin;
      ctx.fillRect(-8, -40, 18, 12);
      ctx.fillStyle = '#000';
      ctx.fillRect(5, -38, 4, 4);
      ctx.fillRect(3, -32, 10, 4);
      // 抬臂揮拳
      ctx.fillStyle = shirtColor;
      ctx.fillRect(6, -56, 7, 14);
      ctx.fillStyle = '#fff';
      ctx.fillRect(7, -60, 8, 7);
      // 身體
      ctx.fillStyle = overallsColor;
      ctx.fillRect(-10, -28, 20, 16);
      ctx.fillStyle = gold;
      ctx.fillRect(0, -24, 3, 3);
      // 分腿
      ctx.fillStyle = brown;
      ctx.fillRect(-14, -10, 10, 8);
      ctx.fillRect(5, -6, 10, 8);
      ctx.restore();
      return;
    }

    // 站立與奔跑
    // 1. 帽子
    ctx.fillStyle = hatColor;
    ctx.fillRect(-10, -48, 20, 8);
    ctx.fillRect(2, -45, 10, 5); // 帽簷
    // M 標誌細節
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, -47, 6, 4);
    ctx.fillStyle = hatColor;
    ctx.fillRect(-1, -47, 2, 2);

    // 2. 臉部
    ctx.fillStyle = skin;
    ctx.fillRect(-8, -40, 18, 12);
    ctx.fillStyle = '#000';
    ctx.fillRect(5, -38, 4, 4); // 眼睛
    ctx.fillRect(3, -32, 10, 4); // 鬍鬚
    ctx.fillRect(-8, -40, 4, 8); // 鬢角

    // 3. 上身與手臂
    ctx.fillStyle = shirtColor;
    ctx.fillRect(-10, -28, 20, 10);
    const armSwing = frame === 'run1' ? 6 : (frame === 'run3' ? -6 : 0);
    ctx.fillRect(-10 - armSwing, -26, 5, 10);
    ctx.fillRect(5 + armSwing, -26, 5, 10);
    ctx.fillStyle = '#fff'; // 白手套
    ctx.fillRect(-10 - armSwing, -16, 5, 5);
    ctx.fillRect(5 + armSwing, -16, 5, 5);

    // 4. 吊帶褲
    ctx.fillStyle = overallsColor;
    ctx.fillRect(-8, -26, 16, 14);
    ctx.fillStyle = gold;
    ctx.fillRect(0, -22, 3, 3); // 吊帶扣

    // 5. 雙腿與皮鞋
    ctx.fillStyle = brown;
    if (frame === 'run1') {
      ctx.fillRect(-13, -10, 9, 10);
      ctx.fillRect(4, -6, 10, 6);
    } else if (frame === 'run3') {
      ctx.fillRect(-8, -6, 9, 6);
      ctx.fillRect(5, -10, 10, 10);
    } else {
      ctx.fillRect(-11, -8, 10, 8);
      ctx.fillRect(2, -8, 10, 8);
    }

    ctx.restore();
  }
}

// ==========================================
// 4. 敵對角色系統 (Goomba, Koopa, Piranha Plant)
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

    if (this.isDead) {
      ctx.fillStyle = '#9b4200';
      ctx.fillRect(drawX, drawY + 16, this.width, 12);
      ctx.fillStyle = '#000';
      ctx.fillRect(drawX + 6, drawY + 20, 5, 2);
      ctx.fillRect(drawX + 17, drawY + 20, 5, 2);
      return;
    }

    // 栗寶寶傘蓋
    ctx.fillStyle = '#a84c00';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(drawX + 2, drawY, 24, 18, 5) : ctx.fillRect(drawX + 2, drawY, 24, 18);
    ctx.fill();

    // 雙眼與黑色眉毛
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX + 5, drawY + 6, 6, 7);
    ctx.fillRect(drawX + 17, drawY + 6, 6, 7);
    ctx.fillStyle = '#000000';
    ctx.fillRect(drawX + 7, drawY + 7, 3, 5);
    ctx.fillRect(drawX + 18, drawY + 7, 3, 5);
    // 憤怒眉毛
    ctx.fillRect(drawX + 4, drawY + 4, 7, 2);
    ctx.fillRect(drawX + 17, drawY + 4, 7, 2);

    // 身體與雙腳 (邁步交替)
    ctx.fillStyle = '#000000';
    const step = Math.floor(Date.now() / 140) % 2 === 0 ? 3 : -3;
    ctx.fillRect(drawX + 2 + step, drawY + 19, 10, 9);
    ctx.fillRect(drawX + 16 - step, drawY + 19, 10, 9);
  }
}

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
      // 綠色旋轉龜殼
      ctx.fillStyle = '#00a800';
      ctx.beginPath();
      ctx.arc(drawX + 14, drawY + 20, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(drawX + 8, drawY + 14, 12, 10);
      ctx.fillStyle = '#000';
      ctx.strokeRect(drawX + 6, drawY + 12, 16, 14);
      return;
    }

    // 烏龜身體
    ctx.fillStyle = '#00a800';
    ctx.fillRect(drawX + 4, drawY + 8, 20, 20); // 龜殼
    ctx.fillStyle = '#ffd13b';
    ctx.fillRect(drawX + (this.vx > 0 ? 18 : 0), drawY, 10, 12); // 頭部
    ctx.fillStyle = '#000';
    ctx.fillRect(drawX + (this.vx > 0 ? 24 : 2), drawY + 3, 3, 3); // 眼睛
    ctx.fillStyle = '#e52521';
    ctx.fillRect(drawX + 2, drawY + 28, 10, 8); // 鞋子
    ctx.fillRect(drawX + 16, drawY + 28, 10, 8);
  }
}

// 水管食人花 (Piranha Plant)
class PiranhaPlant {
  constructor(pipeX, pipeY, pipeW) {
    this.pipeX = pipeX;
    this.pipeY = pipeY;
    this.x = pipeX + pipeW / 2 - 14;
    this.y = pipeY;
    this.width = 28;
    this.height = 36;
    this.state = 'RISING'; // 'RISING', 'BITING', 'RETRACTING', 'HIDDEN'
    this.timer = 0;
    this.offsetY = 0; // 向上鑽出高度 (0 ~ 36)
    this.isDead = false;
  }

  update(dt, marioX) {
    if (this.isDead) return;

    // 當馬力歐距離水管過近時，食人花蟄伏不出
    const distToMario = Math.abs(marioX - (this.pipeX + 16));
    if (this.state === 'HIDDEN' && distToMario < 40) {
      return;
    }

    this.timer += dt;

    if (this.state === 'RISING') {
      this.offsetY = Math.min(36, this.offsetY + dt * 45);
      if (this.offsetY >= 36) {
        this.state = 'BITING';
        this.timer = 0;
      }
    } else if (this.state === 'BITING') {
      if (this.timer > 1.4) {
        this.state = 'RETRACTING';
      }
    } else if (this.state === 'RETRACTING') {
      this.offsetY = Math.max(0, this.offsetY - dt * 45);
      if (this.offsetY <= 0) {
        this.state = 'HIDDEN';
        this.timer = 0;
      }
    } else if (this.state === 'HIDDEN') {
      if (this.timer > 1.6 && distToMario >= 40) {
        this.state = 'RISING';
      }
    }

    this.y = this.pipeY - this.offsetY;
  }

  draw(ctx, cameraX) {
    if (this.isDead || this.offsetY <= 2) return;
    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);

    ctx.save();
    // 裁剪在水管上方顯示
    // 綠色花莖
    ctx.fillStyle = '#00a800';
    ctx.fillRect(drawX + 10, drawY + 16, 8, this.offsetY);

    // 紅白斑點花頭
    ctx.fillStyle = '#e52521';
    ctx.beginPath();
    ctx.arc(drawX + 14, drawY + 10, 13, 0, Math.PI * 2);
    ctx.fill();

    // 白色圓斑點
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX + 6, drawY + 4, 4, 4);
    ctx.fillRect(drawX + 18, drawY + 4, 4, 4);
    ctx.fillRect(drawX + 12, drawY + 14, 4, 4);

    // 銳利白色尖牙大嘴 (咬合動畫)
    const mouthOpen = Math.floor(Date.now() / 160) % 2 === 0;
    ctx.fillStyle = '#000000';
    ctx.fillRect(drawX + 4, drawY + 8, 20, mouthOpen ? 8 : 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX + 6, drawY + (mouthOpen ? 8 : 7), 4, 3);
    ctx.fillRect(drawX + 14, drawY + (mouthOpen ? 8 : 7), 4, 3);

    ctx.restore();
  }
}

// ==========================================
// 5. 道具與火球 (Mushroom, Fire Flower, Fireball)
// ==========================================
class Mushroom {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 26;
    this.height = 26;
    this.vx = 80;
    this.vy = -160;
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

    ctx.fillStyle = '#e52521';
    ctx.beginPath();
    ctx.arc(drawX + 13, drawY + 12, 12, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX + 10, drawY + 3, 6, 6);
    ctx.fillRect(drawX + 3, drawY + 8, 4, 4);
    ctx.fillRect(drawX + 19, drawY + 8, 4, 4);

    ctx.fillStyle = '#ffbe8f';
    ctx.fillRect(drawX + 6, drawY + 12, 14, 14);
    ctx.fillStyle = '#000';
    ctx.fillRect(drawX + 9, drawY + 15, 2, 4);
    ctx.fillRect(drawX + 15, drawY + 15, 2, 4);
  }
}

// 火焰花 (Fire Flower)
class FireFlower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 26;
    this.height = 26;
  }

  update(dt) {}

  draw(ctx, cameraX) {
    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);

    // 綠色花莖
    ctx.fillStyle = '#00a800';
    ctx.fillRect(drawX + 11, drawY + 14, 4, 12);
    ctx.fillRect(drawX + 5, drawY + 20, 6, 4);
    ctx.fillRect(drawX + 15, drawY + 20, 6, 4);

    // 紅白黃四層經典花盤
    ctx.fillStyle = '#e52521';
    ctx.fillRect(drawX + 3, drawY + 2, 20, 14);
    ctx.fillStyle = '#fcd116';
    ctx.fillRect(drawX + 6, drawY + 4, 14, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX + 9, drawY + 6, 8, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(drawX + 11, drawY + 7, 2, 4);
    ctx.fillRect(drawX + 15, drawY + 7, 2, 4);
  }
}

// 彈跳火球 (Fireball)
class Fireball {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.vx = dir * 420;
    this.vy = 80;
    this.radius = 7;
    this.life = 2.5;
  }

  update(dt, tiles) {
    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;

    tiles.forEach(tile => {
      if (tile.type === 'EMPTY') return;
      if (
        this.x - this.radius < tile.x + tile.w &&
        this.x + this.radius > tile.x &&
        this.y - this.radius < tile.y + tile.h &&
        this.y + this.radius > tile.y
      ) {
        if (this.vy > 0 && this.y <= tile.y + 10) {
          // 在地面彈跳
          this.y = tile.y - this.radius;
          this.vy = -340;
        } else {
          // 撞牆消滅
          this.life = 0;
        }
      }
    });
  }

  draw(ctx, cameraX) {
    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);

    ctx.fillStyle = '#e52521';
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fcd116';
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(drawX - 2, drawY - 2, 4, 4);
  }
}

// ==========================================
// 6. 浮動得分文字與煙霧粒子 (Effects)
// ==========================================
class FloatingText {
  constructor(text, x, y, color = '#ffffff') {
    this.text = text;
    this.x = x;
    this.y = y;
    this.vy = -55;
    this.life = 0.8;
    this.color = color;
  }

  update(dt) {
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx, cameraX) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 3;
    ctx.fillText(this.text, Math.floor(this.x - cameraX), Math.floor(this.y));
    ctx.restore();
  }
}

class DustParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 40;
    this.vy = -Math.random() * 30;
    this.size = 3 + Math.random() * 3;
    this.life = 0.35;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.size = Math.max(0, this.size - dt * 6);
    this.life -= dt;
  }

  draw(ctx, cameraX) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(Math.floor(this.x - cameraX), Math.floor(this.y), this.size, this.size);
  }
}

// ==========================================
// 7. 主遊戲引擎 (SuperMarioGame)
// ==========================================
class SuperMarioGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.audio = new RetroAudio();

    this.baseW = 640;
    this.baseH = 360;
    this.cameraX = 0;

    // 遊戲數值
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.world = 1;
    this.stage = 1;
    this.distance = 0;
    this.highScore = parseInt(localStorage.getItem('mario_parkour_highscore') || '0', 10);
    this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAMEOVER', 'CLEARING'

    // 操作狀態
    this.input = { left: false, right: false, jump: false, down: false, sprint: false };

    // 實體清單
    this.mario = {
      x: 100,
      y: 200,
      vx: 0,
      vy: 0,
      width: 24,
      height: 32,
      isGrounded: false,
      facing: 1,
      form: 'SMALL', // 'SMALL', 'SUPER', 'FIRE'
      isStar: false,
      starTimer: 0,
      invulnerableTimer: 0,
      isDucking: false,
      walkAnimTime: 0,
      currentFrame: 'stand'
    };

    this.tiles = [];
    this.enemies = [];
    this.piranhas = [];
    this.items = [];
    this.fireballs = [];
    this.floatTexts = [];
    this.particles = [];
    this.nextChunkX = 0;
    this.nextGoalX = 500 * 10; // 每 500m 設立終點旗杆 (5000px)

    // DOM 元素快取
    this.hud = document.getElementById('hud');
    this.scoreDisplay = document.getElementById('score-display');
    this.coinsDisplay = document.getElementById('coins-display');
    this.worldDisplay = document.getElementById('world-display');
    this.distanceDisplay = document.getElementById('distance-display');
    this.livesDisplay = document.getElementById('lives-display');
    this.powerBadge = document.getElementById('power-badge');
    this.actionHint = document.getElementById('action-hint');

    this.startScreen = document.getElementById('start-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.startHighScore = document.getElementById('start-high-score');
    this.finalScore = document.getElementById('final-score');
    this.finalDistance = document.getElementById('final-distance');
    this.finalCoins = document.getElementById('final-coins');
    this.finalWorld = document.getElementById('final-world');
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
    this.piranhas = [];
    this.items = [];
    this.fireballs = [];
    this.floatTexts = [];
    this.particles = [];
    this.nextChunkX = 0;
    this.cameraX = 0;

    for (let i = 0; i < 4; i++) {
      this.generateChunk();
    }
  }

  generateChunk() {
    const startX = this.nextChunkX;
    const chunkWidth = 20 * TILE_SIZE;
    const groundY = this.baseH - TILE_SIZE * 2;

    // 檢查是否達到終點旗杆檢查站
    if (startX >= this.nextGoalX && startX < this.nextGoalX + chunkWidth) {
      // 鋪設平地與旗杆、城堡
      for (let x = startX; x < startX + chunkWidth; x += TILE_SIZE) {
        this.tiles.push({ x, y: groundY, w: TILE_SIZE, h: TILE_SIZE * 2, type: 'GROUND' });
      }

      const poleX = startX + TILE_SIZE * 6;
      this.tiles.push({
        x: poleX,
        y: groundY - 220,
        w: 12,
        h: 220,
        type: 'FLAGPOLE',
        flagY: groundY - 210,
        isTriggered: false
      });

      // 城堡
      this.tiles.push({
        x: poleX + 160,
        y: groundY - 100,
        w: 100,
        h: 100,
        type: 'CASTLE'
      });

      this.nextGoalX += 500 * 10;
      this.nextChunkX += chunkWidth;
      return;
    }

    const pattern = this.nextChunkX === 0 ? 0 : Math.floor(Math.random() * 5);

    if (pattern === 1) {
      // 懸崖深淵
      for (let x = startX; x < startX + chunkWidth; x += TILE_SIZE) {
        if (x < startX + TILE_SIZE * 5 || x > startX + TILE_SIZE * 11) {
          this.tiles.push({ x, y: groundY, w: TILE_SIZE, h: TILE_SIZE * 2, type: 'GROUND' });
        }
      }
    } else {
      // 平地
      for (let x = startX; x < startX + chunkWidth; x += TILE_SIZE) {
        this.tiles.push({ x, y: groundY, w: TILE_SIZE, h: TILE_SIZE * 2, type: 'GROUND' });
      }

      if (pattern === 2) {
        // 空中問號磚與普通磚塊
        const by = groundY - TILE_SIZE * 3.5;
        this.tiles.push({ x: startX + TILE_SIZE * 4, y: by, w: TILE_SIZE, h: TILE_SIZE, type: 'BRICK' });
        this.tiles.push({
          x: startX + TILE_SIZE * 5,
          y: by,
          w: TILE_SIZE,
          h: TILE_SIZE,
          type: 'QUESTION',
          itemType: Math.random() > 0.4 ? 'POWERUP' : 'COIN'
        });
        this.tiles.push({ x: startX + TILE_SIZE * 6, y: by, w: TILE_SIZE, h: TILE_SIZE, type: 'BRICK' });
        this.tiles.push({
          x: startX + TILE_SIZE * 7,
          y: by,
          w: TILE_SIZE,
          h: TILE_SIZE,
          type: 'QUESTION',
          itemType: 'COIN'
        });
        this.tiles.push({ x: startX + TILE_SIZE * 8, y: by, w: TILE_SIZE, h: TILE_SIZE, type: 'BRICK' });

        this.enemies.push(new Goomba(startX + TILE_SIZE * 6, groundY - 28));
      } else if (pattern === 3) {
        // 水管障礙 (部分帶食人花)
        const pipeH = 3 * TILE_SIZE;
        const pipeX = startX + TILE_SIZE * 8;
        const pipeY = groundY - pipeH;

        this.tiles.push({
          x: pipeX,
          y: pipeY,
          w: TILE_SIZE * 2,
          h: pipeH,
          type: 'PIPE'
        });

        // 生成食人花
        this.piranhas.push(new PiranhaPlant(pipeX, pipeY, TILE_SIZE * 2));
        this.enemies.push(new Koopa(startX + TILE_SIZE * 13, groundY - 36));
      } else if (pattern === 4) {
        // 階梯金字塔跳台
        for (let s = 1; s <= 3; s++) {
          this.tiles.push({
            x: startX + TILE_SIZE * (3 + s),
            y: groundY - s * TILE_SIZE,
            w: TILE_SIZE,
            h: s * TILE_SIZE,
            type: 'BRICK'
          });
        }
        this.enemies.push(new Goomba(startX + TILE_SIZE * 11, groundY - 28));
      } else {
        if (this.nextChunkX > 0) {
          this.enemies.push(new Goomba(startX + TILE_SIZE * 9, groundY - 28));
        }
      }
    }

    this.nextChunkX += chunkWidth;
  }

  bindEvents() {
    window.addEventListener('resize', this.resizeCanvas.bind(this));

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
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.input.sprint = true;

      // 發射火球 (F 或 J)
      if ((e.code === 'KeyF' || e.code === 'KeyJ') && this.state === 'PLAYING') {
        this.shootFireball();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = false;
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') this.input.jump = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.down = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.input.sprint = false;
    });

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

  shootFireball() {
    if (this.mario.form !== 'FIRE' || this.fireballs.length >= 2) return;
    const fb = new Fireball(
      this.mario.x + (this.mario.facing === 1 ? this.mario.width + 2 : -8),
      this.mario.y + this.mario.height * 0.4,
      this.mario.facing
    );
    this.fireballs.push(fb);
    this.audio.playFireball();
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
    this.finalWorld.textContent = `${this.world} - ${this.stage}`;
    this.finalBestScore.textContent = this.padScore(this.highScore);

    // Tauri Rust IPC
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
    this.world = 1;
    this.stage = 1;
    this.distance = 0;
    this.mario.x = 100;
    this.mario.y = 200;
    this.mario.vx = 0;
    this.mario.vy = 0;
    this.mario.form = 'SMALL';
    this.mario.height = 32;
    this.nextGoalX = 500 * 10;

    this.initWorld();
    this.updateHUD();

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
    } else if (this.state === 'CLEARING') {
      this.updateClearing(dt);
    }

    this.render();
  }

  update(dt) {
    const m = this.mario;

    // 1. 無敵與星星計時
    if (m.invulnerableTimer > 0) m.invulnerableTimer -= dt;
    if (m.isStar) {
      m.starTimer -= dt;
      if (m.starTimer <= 0) m.isStar = false;
    }

    // 2. 移動速度與 Shift 衝刺
    const maxSpeed = this.input.sprint ? SPRINT_MAX_SPEED : NORMAL_MAX_SPEED;
    if (this.input.left) {
      m.vx -= ACCEL * dt;
      m.facing = -1;
    } else if (this.input.right) {
      m.vx += ACCEL * dt;
      m.facing = 1;
    } else {
      if (m.vx > 0) m.vx = Math.max(0, m.vx - FRICTION * dt);
      else if (m.vx < 0) m.vx = Math.min(0, m.vx + FRICTION * dt);
    }
    m.vx = Math.max(-maxSpeed, Math.min(maxSpeed, m.vx));

    // 煞車煙塵與奔跑塵土
    if (m.isGrounded && Math.abs(m.vx) > 200) {
      if (Math.random() < 0.25) {
        this.particles.push(new DustParticle(m.x + 8, m.y + m.height - 2));
      }
    }

    // 3. 跳躍
    if (this.input.jump && m.isGrounded) {
      m.vy = JUMP_FORCE;
      m.isGrounded = false;
      this.audio.playJump();
    }
    if (!this.input.jump && m.vy < -250) {
      m.vy = -250;
    }

    // 4. 重力模擬與步進
    m.vy += GRAVITY * dt;
    m.x += m.vx * dt;
    m.y += m.vy * dt;

    // 5. 動作動畫幀計算
    if (m.isGrounded) {
      if ((this.input.left && m.vx > 50) || (this.input.right && m.vx < -50)) {
        m.currentFrame = 'skid';
      } else if (Math.abs(m.vx) > 15) {
        m.walkAnimTime += dt * Math.abs(m.vx) * 0.04;
        const step = Math.floor(m.walkAnimTime) % 3;
        m.currentFrame = step === 0 ? 'run1' : (step === 1 ? 'run2' : 'run3');
      } else {
        m.currentFrame = this.input.down && m.form !== 'SMALL' ? 'crouch' : 'stand';
      }
    } else {
      m.currentFrame = 'jump';
    }

    // 奔跑距離累計
    if (m.x > this.distance * 10 + 100) {
      this.distance = Math.floor((m.x - 100) / 10);
      this.score += 2;
    }

    // 6. 與地塊方塊碰撞
    m.isGrounded = false;
    for (let i = this.tiles.length - 1; i >= 0; i--) {
      const tile = this.tiles[i];

      // 檢查過關旗杆
      if (tile.type === 'FLAGPOLE' && !tile.isTriggered) {
        if (m.x + m.width >= tile.x && m.x <= tile.x + tile.w) {
          // 觸發過關！
          this.triggerStageClear(tile);
          return;
        }
      }

      if (tile.type === 'EMPTY' || tile.type === 'CASTLE') continue;

      if (
        m.x < tile.x + tile.w &&
        m.x + m.width > tile.x &&
        m.y < tile.y + tile.h &&
        m.y + m.height > tile.y
      ) {
        const prevY = m.y - m.vy * dt;

        // 踩在磚塊上
        if (prevY + m.height <= tile.y + 8 && m.vy >= 0) {
          m.y = tile.y - m.height;
          m.vy = 0;
          m.isGrounded = true;
        }
        // 從下方頂擊磚塊
        else if (prevY >= tile.y + tile.h - 8 && m.vy < 0) {
          m.y = tile.y + tile.h;
          m.vy = 40;

          if (tile.type === 'QUESTION') {
            tile.type = 'EMPTY';
            if (tile.itemType === 'POWERUP') {
              if (m.form === 'SMALL') {
                this.items.push(new Mushroom(tile.x, tile.y - 28));
              } else {
                this.items.push(new FireFlower(tile.x, tile.y - 28));
              }
              this.audio.playPowerup();
            } else {
              this.coins += 1;
              this.score += 200;
              this.floatTexts.push(new FloatingText('+200', tile.x, tile.y - 10));
              this.audio.playCoin();
            }
          } else if (tile.type === 'BRICK') {
            if (m.form !== 'SMALL') {
              this.audio.playBreak();
              this.tiles.splice(i, 1);
              this.score += 50;
              continue;
            } else {
              this.audio.playBump();
            }
          }
        } else {
          // 側面阻擋
          if (m.vx > 0) m.x = tile.x - m.width;
          else if (m.vx < 0) m.x = tile.x + tile.w;
          m.vx = 0;
        }
      }
    }

    // 7. 掉入深淵判定
    if (m.y > this.baseH + 50) {
      this.lives--;
      if (this.lives > 0) {
        m.x = this.cameraX + 60;
        m.y = 80;
        m.vy = 0;
        m.form = 'SMALL';
        m.height = 32;
        m.invulnerableTimer = 2.0;
      } else {
        this.onGameOver();
        return;
      }
    }

    // 8. 道具更新與拾取
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.update(dt, this.tiles);

      if (
        m.x < item.x + item.width &&
        m.x + m.width > item.x &&
        m.y < item.y + item.height &&
        m.y + m.height > item.y
      ) {
        if (item instanceof Mushroom) {
          m.form = 'SUPER';
          m.height = 48;
          m.y -= 16;
          this.floatTexts.push(new FloatingText('+1000', m.x, m.y - 12, '#ffbe0b'));
        } else if (item instanceof FireFlower) {
          m.form = 'FIRE';
          m.height = 48;
          this.floatTexts.push(new FloatingText('FIRE POWER!', m.x, m.y - 12, '#ff3838'));
        }
        this.audio.playPowerup();
        this.score += 1000;
        this.items.splice(i, 1);
      }
    }

    // 9. 食人花更新與傷害
    for (let i = this.piranhas.length - 1; i >= 0; i--) {
      const p = this.piranhas[i];
      p.update(dt, m.x);

      if (!p.isDead && p.offsetY > 10) {
        if (
          m.x < p.x + p.width &&
          m.x + m.width > p.x &&
          m.y < p.y + p.height &&
          m.y + m.height > p.y
        ) {
          this.hurtMario();
        }
      }
    }

    // 10. 火球更新與怪物命中
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      fb.update(dt, this.tiles);

      if (fb.life <= 0) {
        this.fireballs.splice(i, 1);
        continue;
      }

      // 檢查是否命中敵人
      let hit = false;
      this.enemies.forEach(e => {
        if (!e.isDead && Math.hypot(fb.x - (e.x + e.width / 2), fb.y - (e.y + e.height / 2)) < 22) {
          e.isDead = true;
          hit = true;
          this.score += 200;
          this.floatTexts.push(new FloatingText('+200', e.x, e.y - 10));
          this.audio.playStomp();
        }
      });
      this.piranhas.forEach(p => {
        if (!p.isDead && p.offsetY > 10 && Math.hypot(fb.x - (p.x + p.width / 2), fb.y - (p.y + p.height / 2)) < 22) {
          p.isDead = true;
          hit = true;
          this.score += 400;
          this.floatTexts.push(new FloatingText('+400', p.x, p.y - 10));
          this.audio.playStomp();
        }
      });

      if (hit) {
        this.fireballs.splice(i, 1);
      }
    }

    // 11. 敵人更新與踩怪判定
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, this.tiles);

      if (e.isDead && e.deadTimer > 0.4) {
        this.enemies.splice(i, 1);
        continue;
      }

      if (
        !e.isDead &&
        m.x < e.x + e.width &&
        m.x + m.width > e.x &&
        m.y < e.y + e.height &&
        m.y + m.height > e.y
      ) {
        // 踩怪 (Stomp)
        if (m.vy > 0 && m.y + m.height - m.vy * dt <= e.y + 12) {
          if (e instanceof Goomba) {
            e.isDead = true;
            this.audio.playStomp();
          } else if (e instanceof Koopa) {
            if (!e.isShell) {
              e.isShell = true;
              e.vx = 0;
              this.audio.playStomp();
            } else {
              e.vx = 280;
              this.audio.playStomp();
            }
          }
          m.vy = -490;
          this.score += 200;
          this.floatTexts.push(new FloatingText('+200', e.x, e.y - 10));
        } else {
          this.hurtMario();
        }
      }
    }

    // 12. 粒子與文字更新
    this.floatTexts.forEach(t => t.update(dt));
    this.floatTexts = this.floatTexts.filter(t => t.life > 0);
    this.particles.forEach(p => p.update(dt));
    this.particles = this.particles.filter(p => p.life > 0);

    // 13. 相機平滑跟隨
    const targetCamX = m.x - 140;
    if (targetCamX > this.cameraX) {
      this.cameraX += (targetCamX - this.cameraX) * Math.min(dt * 8, 1);
    }

    // 14. 動態地塊生成
    if (this.nextChunkX < this.cameraX + this.baseW * 2) {
      this.generateChunk();
    }
    this.tiles = this.tiles.filter(t => t.x + t.w > this.cameraX - 100);

    this.updateHUD();
  }

  hurtMario() {
    const m = this.mario;
    if (m.invulnerableTimer > 0) return;

    if (m.form !== 'SMALL') {
      m.form = 'SMALL';
      m.height = 32;
      m.invulnerableTimer = 2.0;
      this.audio.playBump();
    } else {
      this.lives--;
      if (this.lives <= 0) {
        this.onGameOver();
      } else {
        m.x -= 30;
        m.invulnerableTimer = 2.0;
        this.audio.playBump();
      }
    }
  }

  triggerStageClear(flagTile) {
    flagTile.isTriggered = true;
    this.state = 'CLEARING';
    this.audio.stopBgm();
    this.audio.playFlagSlide();

    this.mario.vx = 0;
    this.mario.vy = 0;
    this.mario.x = flagTile.x - 10;

    this.actionHint.textContent = `★ STAGE CLEAR! WORLD ${this.world}-${this.stage} ★`;
    this.actionHint.classList.remove('hidden');

    // 旗杆滑降動畫
    const slideDuration = 900;
    const startY = this.mario.y;
    const targetY = flagTile.y + flagTile.h - this.mario.height;
    const startTime = performance.now();

    const slideAnim = () => {
      const now = performance.now();
      const p = Math.min(1, (now - startTime) / slideDuration);
      this.mario.y = startY + (targetY - startY) * p;
      flagTile.flagY = flagTile.y + 10 + (flagTile.h - 30) * p;

      if (p < 1) {
        requestAnimationFrame(slideAnim);
      } else {
        // 到達地面，播放過關號角
        this.audio.playStageClear();
        this.score += 5000;
        this.floatTexts.push(new FloatingText('+5000 BONUS!', this.mario.x, this.mario.y - 20, '#fcd116'));

        setTimeout(() => {
          this.stage++;
          if (this.stage > 4) {
            this.world++;
            this.stage = 1;
          }
          this.actionHint.classList.add('hidden');
          this.audio.startBgm();
          this.state = 'PLAYING';
          this.mario.vx = 180;
        }, 2200);
      }
    };
    slideAnim();
  }

  updateClearing(dt) {
    this.floatTexts.forEach(t => t.update(dt));
    this.floatTexts = this.floatTexts.filter(t => t.life > 0);
  }

  updateHUD() {
    this.scoreDisplay.textContent = this.padScore(Math.floor(this.score));
    this.coinsDisplay.textContent = this.coins < 10 ? '0' + this.coins : this.coins;
    this.worldDisplay.textContent = `${this.world} - ${this.stage}`;
    this.distanceDisplay.textContent = `${this.distance}m`;
    this.livesDisplay.textContent = `♥ × ${this.lives}`;

    // 更新形態標籤
    this.powerBadge.textContent = this.mario.form;
    this.powerBadge.className = `hud-badge ${this.mario.form.toLowerCase()}`;
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.baseW, this.baseH);

    // 1. 經典藍天
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, this.baseW, this.baseH);

    // 2. 背景白雲與遠山
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
      const cx = ((i * 180 - this.cameraX * 0.2) % (this.baseW + 200)) - 50;
      ctx.fillRect(cx, 35 + (i % 2) * 30, 52, 16);
      ctx.fillRect(cx + 14, 25 + (i % 2) * 30, 24, 12);
    }
    ctx.fillStyle = '#00a800';
    for (let i = 0; i < 4; i++) {
      const mx = ((i * 240 - this.cameraX * 0.4) % (this.baseW + 200)) - 60;
      ctx.beginPath();
      ctx.arc(mx + 45, this.baseH - 45, 45, Math.PI, 0);
      ctx.fill();
    }

    // 3. 繪製地形與方塊
    this.tiles.forEach(tile => {
      const dx = Math.floor(tile.x - this.cameraX);
      const dy = Math.floor(tile.y);

      if (dx + tile.w < -50 || dx > this.baseW + 50) return;

      if (tile.type === 'GROUND') {
        ctx.fillStyle = '#00a800';
        ctx.fillRect(dx, dy, tile.w, 8);
        ctx.fillStyle = '#c84c0c';
        ctx.fillRect(dx, dy + 8, tile.w, tile.h - 8);
        ctx.fillStyle = '#000000';
        ctx.fillRect(dx + 4, dy + 14, 4, 4);
        ctx.fillRect(dx + 20, dy + 22, 4, 4);
      } else if (tile.type === 'BRICK') {
        ctx.fillStyle = '#b84400';
        ctx.fillRect(dx, dy, tile.w, tile.h);
        ctx.fillStyle = '#000';
        ctx.strokeRect(dx + 1, dy + 1, tile.w - 2, tile.h - 2);
        ctx.fillRect(dx + 4, dy + 8, 10, 4);
        ctx.fillRect(dx + 18, dy + 20, 10, 4);
      } else if (tile.type === 'QUESTION') {
        ctx.fillStyle = '#fc9838';
        ctx.fillRect(dx, dy, tile.w, tile.h);
        ctx.fillStyle = '#000';
        ctx.strokeRect(dx + 1, dy + 1, tile.w - 2, tile.h - 2);
        // 4角鉚釘
        ctx.fillStyle = '#6b3600';
        ctx.fillRect(dx + 3, dy + 3, 2, 2);
        ctx.fillRect(dx + tile.w - 5, dy + 3, 2, 2);
        ctx.fillRect(dx + 3, dy + tile.h - 5, 2, 2);
        ctx.fillRect(dx + tile.w - 5, dy + tile.h - 5, 2, 2);
        // 問號
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px monospace';
        ctx.fillText('?', dx + 11, dy + 22);
      } else if (tile.type === 'PIPE') {
        ctx.fillStyle = '#00a800';
        ctx.fillRect(dx, dy, tile.w, tile.h);
        ctx.fillStyle = '#008000';
        ctx.fillRect(dx - 3, dy, tile.w + 6, 16);
        ctx.fillStyle = '#5cff5c';
        ctx.fillRect(dx + 4, dy, 6, tile.h);
      } else if (tile.type === 'FLAGPOLE') {
        // 旗杆
        ctx.fillStyle = '#00a800';
        ctx.fillRect(dx + 4, dy, 4, tile.h);
        // 頂端金球
        ctx.fillStyle = '#fcd116';
        ctx.beginPath();
        ctx.arc(dx + 6, dy - 2, 7, 0, Math.PI * 2);
        ctx.fill();
        // 旗幟
        const fY = Math.floor(tile.flagY);
        ctx.fillStyle = '#e52521';
        ctx.beginPath();
        ctx.moveTo(dx + 4, fY);
        ctx.lineTo(dx - 22, fY + 12);
        ctx.lineTo(dx + 4, fY + 24);
        ctx.fill();
      } else if (tile.type === 'CASTLE') {
        // 磚石城堡
        ctx.fillStyle = '#b84400';
        ctx.fillRect(dx, dy + 20, tile.w, tile.h - 20);
        // 城垛
        ctx.fillRect(dx, dy, 24, 20);
        ctx.fillRect(dx + 38, dy, 24, 20);
        ctx.fillRect(dx + 76, dy, 24, 20);
        // 拱門
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(dx + 50, dy + 65, 18, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(dx + 32, dy + 65, 36, 35);
      }
    });

    // 4. 食人花
    this.piranhas.forEach(p => p.draw(ctx, this.cameraX));

    // 5. 道具
    this.items.forEach(it => it.draw(ctx, this.cameraX));

    // 6. 敵人
    this.enemies.forEach(e => e.draw(ctx, this.cameraX));

    // 7. 火球
    this.fireballs.forEach(fb => fb.draw(ctx, this.cameraX));

    // 8. 馬力歐主角
    const m = this.mario;
    if (m.invulnerableTimer <= 0 || Math.floor(Date.now() / 80) % 2 === 0) {
      const drawX = Math.floor(m.x - this.cameraX);
      const drawY = Math.floor(m.y);
      if (m.form === 'SMALL') {
        SpriteRenderer.drawSmallMario(ctx, drawX, drawY, m.facing, m.currentFrame, m.form, m.isStar);
      } else {
        SpriteRenderer.drawSuperMario(ctx, drawX, drawY, m.facing, m.currentFrame, m.form, m.isStar);
      }
    }

    // 9. 煙霧塵土粒子
    this.particles.forEach(p => p.draw(ctx, this.cameraX));

    // 10. 浮動得分文字
    this.floatTexts.forEach(t => t.draw(ctx, this.cameraX));
  }
}

// 實例化遊戲
window.addEventListener('DOMContentLoaded', () => {
  new SuperMarioGame();
});
