/**
 * Cyber Runner 3D - 霓虹極速跑酷
 * 核心遊戲引擎與 Three.js 3D 渲染系統
 */

// ==========================================
// 1. 音效與音樂合成系統 (Web Audio API)
// ==========================================
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.masterGain = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx ? this.ctx.currentTime : 0);
    }
    return !this.isMuted;
  }

  playJump() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.18);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playSlide() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playCoin() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc1.stop(now + 0.1);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.22);
  }

  playPowerup() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.3, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.15);
    });
  }

  playHit() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playShieldBreak() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  startBgm() {
    if (!this.ctx || this.bgmTimer) return;
    const tempo = 126;
    const sixteenth = (60 / tempo) / 4;
    const bassline = [110, 110, 130.81, 110, 146.83, 110, 164.81, 130.81];

    this.bgmTimer = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const step = this.bgmStep % 16;
      this.bgmStep++;

      // 低音合成電音 Bass
      if (step % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteIndex = Math.floor(step / 2) % bassline.length;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassline[noteIndex] / 2, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + sixteenth * 1.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + sixteenth * 1.8);
      }

      // 電子鼓點 Kick (每拍)
      if (step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(150, now);
        kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
        kickGain.gain.setValueAtTime(0.35, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        kickOsc.connect(kickGain);
        kickGain.connect(this.masterGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.12);
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
// 2. 常數與設定
// ==========================================
const LANES = [-3.2, 0, 3.2];
const LANE_WIDTH = 3.2;
const GRAVITY = 46;
const JUMP_FORCE = 15.5;
const SLIDE_DURATION = 0.65;
const BASE_SPEED = 24;
const MAX_SPEED = 56;
const SPEED_ACCEL = 0.55; // 每跑 100 公尺增加的速度
const SEGMENT_LENGTH = 70;
const VISIBLE_SEGMENTS = 6;

// 道具類型
const POWERUP_TYPES = {
  SHIELD: { name: 'SHIELD', color: 0x00f3ff, duration: 12, label: '護盾' },
  MAGNET: { name: 'MAGNET', color: 0xff00ff, duration: 10, label: '磁吸' },
  NITRO: { name: 'NITRO', color: 0xffaa00, duration: 7, label: '極速' },
  MULTIPLIER: { name: 'MULTIPLIER', color: 0x00ff88, duration: 12, label: '2x 積分' },
};

// ==========================================
// 3. 遊戲主角 (Player)
// ==========================================
class Player {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();

    // 當前狀態
    this.currentLane = 1; // 0: 左, 1: 中, 2: 右
    this.targetX = LANES[this.currentLane];
    this.y = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.runAnimTime = 0;
    this.hasShield = false;
    this.shieldMesh = null;

    // 碰撞盒參數 (世界坐標寬高深)
    this.box = new THREE.Box3();

    this.createModel();
    scene.add(this.mesh);
  }

  createModel() {
    // 賽博龐克風格流線型角色
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111c30,
      roughness: 0.3,
      metalness: 0.8
    });
    const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const neonOrangeMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });

    // 軀幹
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.1, 0.5);
    this.torso = new THREE.Mesh(torsoGeo, bodyMat);
    this.torso.position.y = 1.35;
    this.mesh.add(this.torso);

    // 胸口霓虹核心
    const coreGeo = new THREE.BoxGeometry(0.3, 0.4, 0.52);
    const core = new THREE.Mesh(coreGeo, neonCyanMat);
    this.torso.add(core);

    // 頭部
    const headGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    this.head = new THREE.Mesh(headGeo, bodyMat);
    this.head.position.y = 0.85;
    this.torso.add(this.head);

    // 霓虹面罩 Visor
    const visorGeo = new THREE.BoxGeometry(0.48, 0.2, 0.58);
    const visor = new THREE.Mesh(visorGeo, neonOrangeMat);
    visor.position.set(0, 0.05, 0.02);
    this.head.add(visor);

    // 手臂 (左右)
    const armGeo = new THREE.BoxGeometry(0.24, 0.85, 0.24);
    this.leftArm = new THREE.Mesh(armGeo, bodyMat);
    this.leftArm.position.set(-0.55, 0.1, 0);
    this.torso.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, bodyMat);
    this.rightArm.position.set(0.55, 0.1, 0);
    this.torso.add(this.rightArm);

    // 腿部 (左右)
    const legGeo = new THREE.BoxGeometry(0.3, 0.9, 0.3);
    this.leftLeg = new THREE.Mesh(legGeo, bodyMat);
    this.leftLeg.position.set(-0.25, -0.9, 0);
    this.torso.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, bodyMat);
    this.rightLeg.position.set(0.25, -0.9, 0);
    this.torso.add(this.rightLeg);

    // 護盾光罩 (預設隱藏)
    const shieldGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.2;
    this.shieldMesh.visible = false;
    this.mesh.add(this.shieldMesh);

    // 投射陰影
    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
  }

  setShield(active) {
    this.hasShield = active;
    if (this.shieldMesh) {
      this.shieldMesh.visible = active;
    }
  }

  changeLane(dir) {
    // dir: -1 (左) 或 +1 (右)
    const nextLane = this.currentLane + dir;
    if (nextLane >= 0 && nextLane < LANES.length) {
      this.currentLane = nextLane;
      this.targetX = LANES[this.currentLane];
    }
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.velocityY = JUMP_FORCE;
      if (this.isSliding) {
        this.stopSlide();
      }
      return true;
    }
    return false;
  }

  slide() {
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = SLIDE_DURATION;
      // 若在空中快速下墜俯衝
      if (this.isJumping) {
        this.velocityY = -25;
      }
      return true;
    }
    return false;
  }

  stopSlide() {
    this.isSliding = false;
    this.slideTimer = 0;
    this.torso.scale.set(1, 1, 1);
    this.torso.rotation.x = 0;
  }

  update(dt, speed) {
    // 1. X 軸平滑變道過渡與傾斜
    const dx = this.targetX - this.mesh.position.x;
    this.mesh.position.x += dx * Math.min(dt * 15, 1);
    this.mesh.rotation.z = -dx * 0.15; // 變道時身體自然側傾

    // 2. Y 軸跳躍重力模擬
    if (this.isJumping) {
      this.velocityY -= GRAVITY * dt;
      this.y += this.velocityY * dt;

      if (this.y <= 0) {
        this.y = 0;
        this.velocityY = 0;
        this.isJumping = false;
      }
    }

    // 3. 滑鏟狀態計時與縮放
    if (this.isSliding) {
      this.slideTimer -= dt;
      this.torso.scale.set(1, 0.45, 1.4); // 降低身高、壓低重心
      this.torso.rotation.x = 0.6;
      if (this.slideTimer <= 0) {
        this.stopSlide();
      }
    } else {
      this.torso.scale.set(1, 1, 1);
      this.torso.rotation.x = 0;
    }

    this.mesh.position.y = this.y;

    // 4. 奔跑關節擺動動畫
    this.runAnimTime += dt * (speed * 0.7);
    if (!this.isJumping && !this.isSliding) {
      const swing = Math.sin(this.runAnimTime) * 0.7;
      this.leftArm.rotation.x = swing;
      this.rightArm.rotation.x = -swing;
      this.leftLeg.rotation.x = -swing;
      this.rightLeg.rotation.x = swing;
      this.head.rotation.y = Math.sin(this.runAnimTime * 0.5) * 0.1;
    } else if (this.isJumping) {
      // 跳躍收腿姿勢
      this.leftLeg.rotation.x = -0.7;
      this.rightLeg.rotation.x = -0.7;
      this.leftArm.rotation.x = 1.2;
      this.rightArm.rotation.x = 1.2;
    }

    // 護盾自轉特效
    if (this.hasShield && this.shieldMesh.visible) {
      this.shieldMesh.rotation.y += dt * 3;
      this.shieldMesh.rotation.x += dt * 1.5;
    }

    // 5. 更新全身碰撞包圍盒
    // 依據是否滑鏟動態縮小頂部高度
    const height = this.isSliding ? 0.75 : 1.9;
    const min = new THREE.Vector3(
      this.mesh.position.x - 0.45,
      this.mesh.position.y,
      this.mesh.position.z - 0.45
    );
    const max = new THREE.Vector3(
      this.mesh.position.x + 0.45,
      this.mesh.position.y + height,
      this.mesh.position.z + 0.45
    );
    this.box.set(min, max);
  }

  reset() {
    this.currentLane = 1;
    this.targetX = LANES[1];
    this.mesh.position.set(0, 0, 0);
    this.mesh.rotation.set(0, 0, 0);
    this.y = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.stopSlide();
    this.setShield(false);
  }
}

// ==========================================
// 4. 跑道與城市建築管理器 (TrackManager)
// ==========================================
class TrackManager {
  constructor(scene) {
    this.scene = scene;
    this.segments = [];
    this.nextZ = 0;

    // 共享材質快取
    this.groundMat = new THREE.MeshStandardMaterial({
      color: 0x070b15,
      roughness: 0.4,
      metalness: 0.6
    });

    this.laneDividerMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: false
    });

    this.buildingMat = new THREE.MeshStandardMaterial({
      color: 0x040710,
      roughness: 0.5,
      metalness: 0.7
    });

    this.neonWindowMat = new THREE.MeshBasicMaterial({
      color: 0x00a8ff
    });

    this.neonPinkMat = new THREE.MeshBasicMaterial({
      color: 0xff0055
    });

    this.initTracks();
  }

  initTracks() {
    this.nextZ = 20; // 從玩家身後一點點開始
    for (let i = 0; i < VISIBLE_SEGMENTS; i++) {
      this.spawnSegment();
    }
  }

  spawnSegment() {
    const group = new THREE.Group();
    const length = SEGMENT_LENGTH;
    const trackWidth = LANE_WIDTH * 3 + 2;

    // 1. 主地面跑道
    const groundGeo = new THREE.PlaneGeometry(trackWidth, length);
    const ground = new THREE.Mesh(groundGeo, this.groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    group.add(ground);

    // 2. 跑道邊緣護欄光帶
    const edgeGeo = new THREE.BoxGeometry(0.3, 0.4, length);
    const leftEdge = new THREE.Mesh(edgeGeo, this.laneDividerMat);
    leftEdge.position.set(-trackWidth / 2, 0.2, 0);
    group.add(leftEdge);

    const rightEdge = new THREE.Mesh(edgeGeo, this.laneDividerMat);
    rightEdge.position.set(trackWidth / 2, 0.2, 0);
    group.add(rightEdge);

    // 3. 車道分界虛線
    [-LANE_WIDTH / 2, LANE_WIDTH / 2].forEach(x => {
      const lineGeo = new THREE.BoxGeometry(0.08, 0.05, length);
      const line = new THREE.Mesh(lineGeo, this.neonPinkMat);
      line.position.set(x, 0.02, 0);
      group.add(line);
    });

    // 4. 兩側賽博龐克摩天大樓群
    const buildingCount = 6;
    for (let i = 0; i < buildingCount; i++) {
      const zOffset = (i / buildingCount - 0.5) * length;

      // 左側大樓
      this.createBuilding(group, -trackWidth / 2 - 12 - Math.random() * 8, zOffset);
      // 右側大樓
      this.createBuilding(group, trackWidth / 2 + 12 + Math.random() * 8, zOffset);
    }

    group.position.z = this.nextZ - length / 2;
    this.nextZ -= length;
    this.scene.add(group);
    this.segments.push(group);
  }

  createBuilding(parent, x, z) {
    const width = 12 + Math.random() * 10;
    const depth = 10 + Math.random() * 8;
    const height = 30 + Math.random() * 60;

    const bldgGeo = new THREE.BoxGeometry(width, height, depth);
    const bldg = new THREE.Mesh(bldgGeo, this.buildingMat);
    bldg.position.set(x, height / 2 - 1, z);
    parent.add(bldg);

    // 霓虹招牌或窗戶條紋
    if (Math.random() > 0.4) {
      const signGeo = new THREE.BoxGeometry(width * 0.8, 1.2, depth + 0.2);
      const signMat = Math.random() > 0.5 ? this.neonWindowMat : this.neonPinkMat;
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(x, 10 + Math.random() * 30, z);
      parent.add(sign);
    }
  }

  update(playerZ) {
    // 當最老的地形塊超出玩家身後超過 SEGMENT_LENGTH 時，將其銷毀並在前方生成新地塊
    if (this.segments.length > 0) {
      const oldest = this.segments[0];
      if (oldest.position.z > playerZ + SEGMENT_LENGTH * 1.5) {
        this.scene.remove(oldest);
        // 清理 geometry / 避免內存洩漏
        oldest.traverse(child => {
          if (child.geometry) child.geometry.dispose();
        });
        this.segments.shift();
        this.spawnSegment();
      }
    }
  }

  reset() {
    this.segments.forEach(seg => {
      this.scene.remove(seg);
      seg.traverse(child => {
        if (child.geometry) child.geometry.dispose();
      });
    });
    this.segments = [];
    this.initTracks();
  }
}

// ==========================================
// 5. 障礙物與道具生成系統 (EntityManager)
// ==========================================
class EntityManager {
  constructor(scene, soundSystem) {
    this.scene = scene;
    this.sounds = soundSystem;
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.nextSpawnZ = -30;

    // 材質快取
    this.lowBarrierMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff2200,
      emissiveIntensity: 0.6,
      roughness: 0.3
    });

    this.highBeamMat = new THREE.MeshStandardMaterial({
      color: 0xff0077,
      emissive: 0xff0055,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    this.fullBlockMat = new THREE.MeshStandardMaterial({
      color: 0x1f293d,
      roughness: 0.2,
      metalness: 0.9
    });

    this.trainMat = new THREE.MeshStandardMaterial({
      color: 0x0088ff,
      emissive: 0x0044aa,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });

    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xffbe0b,
      emissive: 0xff9900,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2
    });
  }

  spawnCluster(z) {
    // 隨機選擇 1 到 2 條跑道生成障礙物，確保至少留有 1 條安全逃生通道
    const freeLane = Math.floor(Math.random() * 3);
    const lanesToBlock = [0, 1, 2].filter(lane => lane !== freeLane);

    // 在阻塞跑道生成障礙物
    lanesToBlock.forEach(lane => {
      // 隨機障礙類型：0: 矮障礙 (跳躍), 1: 高橫樑 (滑鏟), 2: 全阻擋 (換道), 3: 迎面列車
      const rand = Math.random();
      if (rand < 0.35) {
        this.createLowBarrier(lane, z);
      } else if (rand < 0.65) {
        this.createHighBeam(lane, z);
      } else if (rand < 0.85) {
        this.createFullBlock(lane, z);
      } else {
        this.createTrain(lane, z);
      }
    });

    // 在安全道或障礙物上方生成金幣與能量道具
    if (Math.random() > 0.2) {
      this.spawnCoinArc(freeLane, z);
    }

    // 25% 機率生成強力道具
    if (Math.random() < 0.25) {
      this.spawnPowerup(freeLane, z + (Math.random() > 0.5 ? 12 : -12));
    }
  }

  // 1. 矮路障：需跳躍
  createLowBarrier(lane, z) {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(2.4, 0.9, 0.4);
    const mesh = new THREE.Mesh(geo, this.lowBarrierMat);
    mesh.position.y = 0.45;
    mesh.castShadow = true;
    group.add(mesh);

    // 霓虹警示線
    const stripeGeo = new THREE.BoxGeometry(2.42, 0.2, 0.42);
    const stripe = new THREE.Mesh(stripeGeo, new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    stripe.position.y = 0.55;
    group.add(stripe);

    group.position.set(LANES[lane], 0, z);
    this.scene.add(group);

    this.obstacles.push({
      group: group,
      type: 'low',
      box: new THREE.Box3(),
      bounds: { minH: 0, maxH: 1.0, w: 1.2, d: 0.3 }
    });
  }

  // 2. 高橫樑：需滑鏟鑽過
  createHighBeam(lane, z) {
    const group = new THREE.Group();

    // 兩側立柱
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5);
    const leftPole = new THREE.Mesh(poleGeo, this.fullBlockMat);
    leftPole.position.set(-1.3, 1.75, 0);
    const rightPole = new THREE.Mesh(poleGeo, this.fullBlockMat);
    rightPole.position.set(1.3, 1.75, 0);
    group.add(leftPole, rightPole);

    // 頂部高橫樑 (下方騰空約 1.1 米，滑鏟高度約 0.75 米可安全通過)
    const beamGeo = new THREE.BoxGeometry(2.7, 1.4, 0.5);
    const beam = new THREE.Mesh(beamGeo, this.highBeamMat);
    beam.position.y = 2.1;
    beam.castShadow = true;
    group.add(beam);

    group.position.set(LANES[lane], 0, z);
    this.scene.add(group);

    this.obstacles.push({
      group: group,
      type: 'high',
      box: new THREE.Box3(),
      bounds: { minH: 1.3, maxH: 2.8, w: 1.3, d: 0.3 }
    });
  }

  // 3. 全高障礙牆：需換道
  createFullBlock(lane, z) {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(2.6, 3.2, 0.8);
    const mesh = new THREE.Mesh(geo, this.fullBlockMat);
    mesh.position.y = 1.6;
    mesh.castShadow = true;
    group.add(mesh);

    // 霓虹 X 警示牌
    const xGeo = new THREE.BoxGeometry(1.6, 0.3, 0.85);
    const bar1 = new THREE.Mesh(xGeo, this.highBeamMat);
    bar1.rotation.z = Math.PI / 4;
    bar1.position.y = 1.6;
    const bar2 = new THREE.Mesh(xGeo, this.highBeamMat);
    bar2.rotation.z = -Math.PI / 4;
    bar2.position.y = 1.6;
    group.add(bar1, bar2);

    group.position.set(LANES[lane], 0, z);
    this.scene.add(group);

    this.obstacles.push({
      group: group,
      type: 'full',
      box: new THREE.Box3(),
      bounds: { minH: 0, maxH: 3.2, w: 1.3, d: 0.4 }
    });
  }

  // 4. 動態逆向移動列車
  createTrain(lane, z) {
    const group = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(2.6, 2.6, 12);
    const body = new THREE.Mesh(bodyGeo, this.trainMat);
    body.position.y = 1.3;
    body.castShadow = true;
    group.add(body);

    // 車頭大燈
    const lightGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffff55 });
    const headlightL = new THREE.Mesh(lightGeo, lightMat);
    headlightL.rotation.x = Math.PI / 2;
    headlightL.position.set(-0.8, 1.2, 6.05);
    const headlightR = new THREE.Mesh(lightGeo, lightMat);
    headlightR.rotation.x = Math.PI / 2;
    headlightR.position.set(0.8, 1.2, 6.05);
    group.add(headlightL, headlightR);

    group.position.set(LANES[lane], 0, z);
    this.scene.add(group);

    this.obstacles.push({
      group: group,
      type: 'train',
      isMoving: true,
      moveSpeed: 14,
      box: new THREE.Box3(),
      bounds: { minH: 0, maxH: 2.6, w: 1.3, d: 6.0 }
    });
  }

  // 生成金幣排/弧線
  spawnCoinArc(lane, centerZ) {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const z = centerZ - 10 + i * 4.5;
      const coinGeo = new THREE.OctahedronGeometry(0.4, 0);
      const coin = new THREE.Mesh(coinGeo, this.coinMat);
      coin.position.set(LANES[lane], 1.2, z);
      this.scene.add(coin);
      this.coins.push({
        mesh: coin,
        box: new THREE.Box3()
      });
    }
  }

  // 生成強力道具
  spawnPowerup(lane, z) {
    const types = Object.keys(POWERUP_TYPES);
    const pickedType = types[Math.floor(Math.random() * types.length)];
    const def = POWERUP_TYPES[pickedType];

    const group = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(0.55, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: def.color,
      emissive: def.color,
      emissiveIntensity: 0.9,
      roughness: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    // 外圍懸浮光環
    const ringGeo = new THREE.TorusGeometry(0.8, 0.04, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: def.color });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    group.position.set(LANES[lane], 1.4, z);
    this.scene.add(group);

    this.powerups.push({
      group: group,
      type: pickedType,
      def: def,
      box: new THREE.Box3()
    });
  }

  update(dt, player, activePowerups, onHit, onCollectCoin, onCollectPowerup) {
    const playerZ = player.mesh.position.z;

    // 定期向前生成障礙物集團 (保持前方 180 米都有障礙物)
    while (this.nextSpawnZ > playerZ - 200) {
      this.spawnCluster(this.nextSpawnZ);
      this.nextSpawnZ -= 38 + Math.random() * 14;
    }

    // 1. 障礙物碰撞與移動判定
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (obs.isMoving) {
        // 迎面行駛
        obs.group.position.z += obs.moveSpeed * dt;
      }

      // 更新包圍盒
      const pos = obs.group.position;
      const b = obs.bounds;
      obs.box.min.set(pos.x - b.w, pos.y + b.minH, pos.z - b.d);
      obs.box.max.set(pos.x + b.w, pos.y + b.maxH, pos.z + b.d);

      // 碰撞檢測 (若 Nitro 狀態，撞擊直接摧毀障礙物)
      if (player.box.intersectsBox(obs.box)) {
        if (activePowerups.NITRO) {
          // 摧毀特效
          this.scene.remove(obs.group);
          this.obstacles.splice(i, 1);
          this.sounds.playShieldBreak();
          continue;
        } else if (player.hasShield) {
          // 護盾吸收一次撞擊
          player.setShield(false);
          activePowerups.SHIELD = 0;
          this.sounds.playShieldBreak();
          this.scene.remove(obs.group);
          this.obstacles.splice(i, 1);
          continue;
        } else {
          // 致命撞擊，遊戲結束
          onHit();
          return;
        }
      }

      // 超過身後銷毀
      if (obs.group.position.z > playerZ + 25) {
        this.scene.remove(obs.group);
        this.obstacles.splice(i, 1);
      }
    }

    // 2. 金幣旋轉、磁鐵吸附與拾取
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.mesh.rotation.y += dt * 3.5;

      // 磁鐵吸引邏輯
      if (activePowerups.MAGNET) {
        const pPos = player.mesh.position;
        const cPos = coin.mesh.position;
        const dist = pPos.distanceTo(cPos);
        if (dist < 22) {
          cPos.lerp(new THREE.Vector3(pPos.x, pPos.y + 1, pPos.z), dt * 14);
        }
      }

      coin.box.setFromObject(coin.mesh);
      if (player.box.intersectsBox(coin.box)) {
        this.scene.remove(coin.mesh);
        this.coins.splice(i, 1);
        this.sounds.playCoin();
        onCollectCoin();
        continue;
      }

      if (coin.mesh.position.z > playerZ + 20) {
        this.scene.remove(coin.mesh);
        this.coins.splice(i, 1);
      }
    }

    // 3. 道具旋轉與拾取
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pup = this.powerups[i];
      pup.group.rotation.y += dt * 2.5;

      pup.box.setFromObject(pup.group);
      if (player.box.intersectsBox(pup.box)) {
        this.scene.remove(pup.group);
        this.powerups.splice(i, 1);
        this.sounds.playPowerup();
        onCollectPowerup(pup.type, pup.def);
        continue;
      }

      if (pup.group.position.z > playerZ + 20) {
        this.scene.remove(pup.group);
        this.powerups.splice(i, 1);
      }
    }
  }

  reset() {
    this.obstacles.forEach(o => this.scene.remove(o.group));
    this.coins.forEach(c => this.scene.remove(c.mesh));
    this.powerups.forEach(p => this.scene.remove(p.group));
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.nextSpawnZ = -30;
  }
}

// ==========================================
// 6. 速度線粒子特效 (SpeedParticles)
// ==========================================
class SpeedParticles {
  constructor(scene) {
    this.scene = scene;
    this.count = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = -Math.random() * 80;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.15,
      transparent: true,
      opacity: 0.5
    });

    this.points = new THREE.Points(geo, mat);
    this.scene.add(this.points);
  }

  update(playerZ, isNitro) {
    const pos = this.points.geometry.attributes.position.array;
    this.points.material.opacity = isNitro ? 0.9 : 0.4;
    this.points.material.color.setHex(isNitro ? 0xffaa00 : 0x00f3ff);

    for (let i = 0; i < this.count; i++) {
      // 粒子向身後飛掠
      if (pos[i * 3 + 2] > playerZ + 10) {
        pos[i * 3 + 2] = playerZ - 70 - Math.random() * 30;
        pos[i * 3] = (Math.random() - 0.5) * 24;
        pos[i * 3 + 1] = Math.random() * 10;
      }
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }

  reset() {
    this.points.material.opacity = 0.4;
  }
}

// ==========================================
// 7. 主遊戲控制器 (GameManager)
// ==========================================
class GameManager {
  constructor() {
    // 遊戲狀態
    this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.speed = BASE_SPEED;
    this.multiplier = 1;
    this.highScore = parseInt(localStorage.getItem('cyber_runner_highscore') || '0', 10);

    // 道具有效時間字典 (以秒為單位計時)
    this.activePowerups = {
      SHIELD: 0,
      MAGNET: 0,
      NITRO: 0,
      MULTIPLIER: 0
    };

    // 音效系統
    this.sounds = new SoundSystem();

    // DOM 元素快取
    this.canvas = document.getElementById('game-canvas');
    this.hud = document.getElementById('hud');
    this.scoreDisplay = document.getElementById('score-display');
    this.distanceDisplay = document.getElementById('distance-display');
    this.coinsDisplay = document.getElementById('coins-display');
    this.multiplierDisplay = document.getElementById('multiplier-display');
    this.speedBar = document.getElementById('speed-bar');
    this.powerupContainer = document.getElementById('powerup-container');
    this.comboDisplay = document.getElementById('combo-display');

    this.startScreen = document.getElementById('start-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.startHighScore = document.getElementById('start-high-score');
    this.finalScore = document.getElementById('final-score');
    this.finalDistance = document.getElementById('final-distance');
    this.finalCoins = document.getElementById('final-coins');
    this.finalBestScore = document.getElementById('final-best-score');
    this.newRecordBadge = document.getElementById('new-record-badge');

    // 初始化 Three.js
    this.initThree();

    // 子系統初始化
    this.player = new Player(this.scene);
    this.trackMgr = new TrackManager(this.scene);
    this.entityMgr = new EntityManager(this.scene, this.sounds);
    this.speedParticles = new SpeedParticles(this.scene);

    // 綁定輸入控制與按鈕
    this.bindEvents();

    // 顯示最高紀錄
    this.startHighScore.textContent = this.highScore.toLocaleString();

    // 啟動主渲染迴圈
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050711);
    this.scene.fog = new THREE.FogExp2(0x050711, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      350
    );
    this.camera.position.set(0, 4.5, 7.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 環境光與主方向光
    const hemiLight = new THREE.HemisphereLight(0x334466, 0x111122, 0.9);
    this.scene.add(hemiLight);

    this.dirLight = new THREE.DirectionalLight(0x00f3ff, 1.2);
    this.dirLight.position.set(10, 25, 10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.scene.add(this.dirLight);
  }

  bindEvents() {
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // 鍵盤輸入
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

      if (this.state !== 'PLAYING') return;

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          this.player.changeLane(-1);
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.player.changeLane(1);
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          if (this.player.jump()) {
            this.sounds.playJump();
          }
          break;
        case 'KeyS':
        case 'ArrowDown':
          if (this.player.slide()) {
            this.sounds.playSlide();
          }
          break;
      }
    });

    // 觸控手勢滑動
    let touchStartX = 0;
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (this.state === 'START') {
        this.startGame();
        return;
      }

      if (this.state !== 'PLAYING') return;

      if (Math.max(absDx, absDy) > 25) {
        if (absDx > absDy) {
          if (dx > 0) this.player.changeLane(1);
          else this.player.changeLane(-1);
        } else {
          if (dy < 0) {
            if (this.player.jump()) this.sounds.playJump();
          } else {
            if (this.player.slide()) this.sounds.playSlide();
          }
        }
      }
    }, { passive: true });

    // UI 按鈕交互
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('pause-restart-btn').addEventListener('click', () => this.restartGame());

    document.getElementById('sound-btn').addEventListener('click', (e) => {
      this.sounds.init();
      const unmuted = this.sounds.toggleMute();
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

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  startGame() {
    this.sounds.init();
    this.sounds.startBgm();
    this.state = 'PLAYING';
    this.startScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.pauseScreen.classList.remove('hidden');
      this.sounds.stopBgm();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.pauseScreen.classList.add('hidden');
      this.sounds.startBgm();
    }
  }

  onGameOver() {
    this.state = 'GAMEOVER';
    this.sounds.playHit();
    this.sounds.stopBgm();

    const isNewRecord = this.score > this.highScore;
    if (isNewRecord) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem('cyber_runner_highscore', this.highScore.toString());
      this.newRecordBadge.classList.remove('hidden');
    } else {
      this.newRecordBadge.classList.add('hidden');
    }

    this.finalScore.textContent = Math.floor(this.score).toLocaleString();
    this.finalDistance.textContent = `${Math.floor(this.distance)} m`;
    this.finalCoins.textContent = this.coins.toLocaleString();
    this.finalBestScore.textContent = this.highScore.toLocaleString();

    // 與 Tauri Rust 後端通信（若在 Tauri 原生視窗環境中運行）
    try {
      if (window.__TAURI__ && window.__TAURI__.core) {
        window.__TAURI__.core.invoke('save_game_record', {
          record: {
            score: Math.floor(this.score),
            distance: Math.floor(this.distance),
            coins: this.coins,
            timestamp: Date.now()
          }
        }).then(res => console.log('Tauri Rust:', res)).catch(err => console.warn('Tauri invoke error:', err));
      }
    } catch (e) {
      console.warn('Tauri bridge not available in pure browser mode');
    }

    this.hud.classList.add('hidden');
    this.gameOverScreen.classList.remove('hidden');
  }

  restartGame() {
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.speed = BASE_SPEED;
    this.multiplier = 1;

    for (let key in this.activePowerups) {
      this.activePowerups[key] = 0;
    }

    this.player.reset();
    this.trackMgr.reset();
    this.entityMgr.reset();
    this.speedParticles.reset();
    this.renderPowerupUI();

    this.pauseScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');

    this.sounds.startBgm();
    this.state = 'PLAYING';
  }

  collectCoin() {
    const pointVal = 10 * this.multiplier;
    this.coins += 1;
    this.score += pointVal;
    this.coinsDisplay.textContent = this.coins;
  }

  collectPowerup(type, def) {
    this.activePowerups[type] = def.duration;
    if (type === 'SHIELD') {
      this.player.setShield(true);
    }
    this.renderPowerupUI();
  }

  renderPowerupUI() {
    this.powerupContainer.innerHTML = '';
    for (let key in this.activePowerups) {
      const remaining = this.activePowerups[key];
      if (remaining > 0) {
        const def = POWERUP_TYPES[key];
        const badge = document.createElement('div');
        badge.className = `powerup-badge ${key.toLowerCase()}`;
        badge.innerHTML = `
          <span>${def.label}</span>
          <div class="powerup-bar">
            <div class="powerup-fill" style="width: ${(remaining / def.duration) * 100}%"></div>
          </div>
        `;
        this.powerupContainer.appendChild(badge);
      }
    }
  }

  loop(timestamp) {
    requestAnimationFrame(this.loop.bind(this));

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    // 渲染場景
    this.renderer.render(this.scene, this.camera);
  }

  update(dt) {
    // 1. 道具倒數計時與效果
    const isNitro = this.activePowerups.NITRO > 0;
    const isMultiplier = this.activePowerups.MULTIPLIER > 0;
    this.multiplier = isMultiplier ? 2 : 1;
    this.multiplierDisplay.textContent = `x${this.multiplier}`;

    for (let key in this.activePowerups) {
      if (this.activePowerups[key] > 0) {
        this.activePowerups[key] -= dt;
        if (this.activePowerups[key] <= 0) {
          this.activePowerups[key] = 0;
          if (key === 'SHIELD') this.player.setShield(false);
        }
      }
    }
    this.renderPowerupUI();

    // 2. 奔跑速度計算 (極速 Nitro 狀態暴增速度)
    const targetSpeed = isNitro ? MAX_SPEED * 1.35 : Math.min(BASE_SPEED + (this.distance / 100) * SPEED_ACCEL, MAX_SPEED);
    this.speed += (targetSpeed - this.speed) * Math.min(dt * 3, 1);

    // 3. 奔跑前進 (Z 軸負方向前進)
    const moveZ = this.speed * dt;
    this.player.mesh.position.z -= moveZ;
    this.distance += moveZ * 0.4;
    this.score += moveZ * 0.5 * this.multiplier;

    // 4. 更新玩家主角
    this.player.update(dt, this.speed);

    // 5. 更新相機跟隨 (平滑跟隨)
    const targetCamZ = this.player.mesh.position.z + 7.5;
    const targetCamX = this.player.mesh.position.x * 0.45;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * Math.min(dt * 12, 1);
    this.camera.position.x += (targetCamX - this.camera.position.x) * Math.min(dt * 8, 1);
    this.camera.position.y = 4.2 + (this.player.y * 0.25);
    this.camera.lookAt(
      this.player.mesh.position.x * 0.2,
      1.6 + this.player.y * 0.2,
      this.player.mesh.position.z - 12
    );

    // 6. 光源同步前移
    this.dirLight.position.z = this.player.mesh.position.z + 10;
    this.dirLight.target.position.z = this.player.mesh.position.z - 10;
    this.dirLight.target.updateMatrixWorld();

    // 7. 更新跑道與實體管理器
    this.trackMgr.update(this.player.mesh.position.z);
    this.entityMgr.update(
      dt,
      this.player,
      this.activePowerups,
      this.onGameOver.bind(this),
      this.collectCoin.bind(this),
      this.collectPowerup.bind(this)
    );

    // 8. 速度線粒子更新
    this.speedParticles.update(this.player.mesh.position.z, isNitro);

    // 9. 更新 HUD 儀表板
    this.scoreDisplay.textContent = Math.floor(this.score).toLocaleString();
    this.distanceDisplay.textContent = `${Math.floor(this.distance)} m`;
    const speedRatio = Math.min((this.speed - BASE_SPEED) / (MAX_SPEED * 1.35 - BASE_SPEED), 1);
    this.speedBar.style.width = `${Math.max(15, speedRatio * 100)}%`;
  }
}

// 頁面載入完成後啟動遊戲管理器
window.addEventListener('DOMContentLoaded', () => {
  new GameManager();
});
