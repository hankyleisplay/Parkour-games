# 🍄 Super Mario Parkour - 超級馬力歐跑酷

[![Build and Release](https://github.com/hankyleisplay/Parkour-games/actions/workflows/build.yml/badge.svg)](https://github.com/hankyleisplay/Parkour-games/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

《**Super Mario Parkour (超級馬力歐跑酷)**》是一款基於 **Tauri + Rust** 原生桌面視窗與 HTML5 Canvas 復古物理引擎打造的經典橫向捲軸冒險跑酷遊戲。

玩家扮演經典紅帽冒險家，在無盡延伸的蘑菇王國中奔跑、跳躍頂磚塊、踩扁栗寶寶與綠烏龜，收集金幣與超級蘑菇，挑戰最高積分！

---

## 🎮 經典馬力歐特色機制

- **流暢跑酷動作**：
  - **左右奔跑與慣性**：具備加速度、減速煞車打滑手感。
  - **彈性跳躍**：按住跳躍鍵越久跳得越高；在空中踩中怪物會強力反彈起跳！
  - **下蹲滑行**：鑽過矮通道或避開高處障礙。
- **經典機關與磚塊**：
  - ❓ **問號磚塊 `[ ? ]`**：由下方頂擊，彈出金幣、超級蘑菇或強化道具。
  - 🧱 **普通磚塊 `[ # ]`**：普通馬力歐頂擊震動，吃蘑菇變大後頂擊可直接擊碎磚塊！
  - 🟩 **綠色水管 (Pipes)**：不同高低段差障礙。
  - 🕳️ **深淵深谷**：考驗跑酷起跳時機。
- **經典怪物敵對**：
  - 🌰 **栗寶寶 (Goomba)**：巡邏前進，從上方踩踏立即消滅。
  - 🐢 **綠烏龜 (Koopa)**：踩踏後縮進龜殼，再踢一腳可在地面高速滑行撞翻前方整排怪物！
- **成長強化道具**：
  - 🍄 **超級蘑菇 (Super Mushroom)**：吃下後身形變大，獲得額外生命護盾！
  - ⭐ **無敵星 (Super Star)**：無敵彩虹衝刺，撞飛一切敵人！
- **純代碼合成 8-Bit 晶片音樂 (Web Audio API)**：
  - 頂磚聲、吃金幣「叮叮」聲、踩怪「啵」聲、升級琶音、陣亡音樂，以及輕快的 8-bit 背景音樂，完全不依賴任何外部音訊檔！

---

## 🕹️ 操作指南

| 鍵盤按鍵 | 功能說明 |
| :--- | :--- |
| <kbd>A</kbd> / <kbd>D</kbd> 或 <kbd>←</kbd> / <kbd>→</kbd> | 左右移動奔跑 |
| <kbd>W</kbd> / <kbd>↑</kbd> / <kbd>Space</kbd> | 跳躍（長按跳得更高） |
| <kbd>S</kbd> / <kbd>↓</kbd> | 下蹲 / 滑行 |
| **空中落下踩踏怪物** | 踩扁栗寶寶 / 烏龜縮殼反彈跳躍 |
| <kbd>ESC</kbd> / <kbd>P</kbd> | 暫停遊戲 |
| <kbd>F11</kbd> | 全螢幕切換 |
| **觸控螢幕** | 支援手指滑動手勢與點擊跳躍 |

---

## 🖥️ 本機運行與 Tauri 編譯

### 方式一：直接在瀏覽器遊玩（免安裝、最快速）
雙擊專案目錄下的 `ui/index.html` 或 `index.html`，即可在任何瀏覽器以 60FPS 享受流暢復古跑酷！

### 方式二：Tauri + Rust 原生視窗啟動
若本機已安裝 Rust 與 Node.js：
```bash
npm run dev
# 或
cargo tauri dev
```

### 方式三：下載已編譯好的 Windows 桌面執行檔 (.exe)
本專案已配置 GitHub Actions 雲端 CI/CD 工作流：
1. 進入 [GitHub Actions 頁面](https://github.com/hankyleisplay/Parkour-games/actions)。
2. 點擊最新一次的建置紀錄。
3. 在 **Artifacts** 區塊直接下載已編譯好的 Windows 原生執行檔 `MarioParkour.exe`！