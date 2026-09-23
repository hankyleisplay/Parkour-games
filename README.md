# ⚡ Cyber Runner 3D - 霓虹極速跑酷

[![Build and Release](https://github.com/hankyleisplay/Parkour-games/actions/workflows/build.yml/badge.svg)](https://github.com/hankyleisplay/Parkour-games/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

《**Cyber Runner 3D**》是一款基於 **Tauri + Rust** 與 **Three.js** 打造的 3D 賽博龐克風格原生跑酷桌面遊戲。

玩家將置身於霓虹閃爍的未來都市高空跑道，在三軌道高速奔跑中切換跑道、跳躍、滑鏟穿行，避開各類路障與動態逆行列車，收集能量晶片與強化道具，挑戰神經反應極限！

---

## 🎮 遊戲特點

- **雙模式即開即玩**：
  - **原生桌面視窗（Tauri + Rust）**：輕量化原生程式，記憶體佔用極低、啟動瞬時完成，支援原生全螢幕與系統級命令。
  - **純網頁免安裝（Browser Web）**：免安裝任何運行庫，直接雙擊 `ui/index.html` 或 `index.html` 即可在任一瀏覽器以 60FPS 流暢遊玩。
- **經典三軌無盡跑酷（3-Lane Endless Runner）**：
  - 流暢變道、傾斜轉向、動態相機跟隨。
  - 角色跳躍起伏、俯身滑鏟穿梭。
- **多樣化障礙與敵對機關**：
  - 矮路障（需跳躍起跳）
  - 高架橫樑與激光線（需滑鏟俯衝）
  - 全封閉路障牆（需提前變道）
  - 動態逆向移動列車（極度考驗即時反應）
- **四大能量強化道具**：
  - 🛡️ **護盾 (Shield)**：抵禦一次撞擊失誤。
  - 🧲 **磁吸 (Magnet)**：短時間內吸取全跑道能量晶片。
  - 🚀 **極速衝刺 (Nitro)**：無敵狂飆，撞碎途中一切障礙。
  - ⚡ **雙倍晶片 (2x Multiplier)**：所有得分與能量晶片雙倍計量。
- **純代碼合成音效與電音 BGM (Web Audio API)**：
  - 內建程序化音效合成器，無需載入任何外部音訊檔，音質純淨無延遲，且支援一鍵靜音。
- **GitHub Actions 自動化雲端編譯**：
  - 每次 push 至 `main` 分支，GitHub Actions 自動在雲端 Windows 環境編譯 Tauri + Rust 原生執行檔 `.exe`，可在 GitHub Actions 頁面直接下載使用。

---

## 🕹️ 操作指南

| 按鍵 | 功能說明 |
| :--- | :--- |
| <kbd>A</kbd> / <kbd>D</kbd> 或 <kbd>←</kbd> / <kbd>→</kbd> | 向左 / 向右切換跑道 |
| <kbd>W</kbd> / <kbd>↑</kbd> / <kbd>Space</kbd> | 跳躍翻越矮障礙 |
| <kbd>S</kbd> / <kbd>↓</kbd> | 滑鏟鑽過高橫樑與激光線 |
| <kbd>ESC</kbd> / <kbd>P</kbd> | 暫停 / 繼續遊戲 |
| <kbd>F11</kbd> | 切換全螢幕模式 |
| **觸控 / 滑鼠手勢** | 支援在手機或觸控板上下左右滑動變道、跳躍與滑鏟 |

---

## 📂 專案結構

```
Parkour-games/
├── .github/
│   └── workflows/
│       └── build.yml          # GitHub Actions 自動化 CI/CD（自動編譯 Windows .exe）
├── src-tauri/                 # Tauri + Rust 後端
│   ├── Cargo.toml             # Rust 套件配置
│   ├── tauri.conf.json        # 視窗與應用規格設定
│   ├── build.rs               # 構建腳本
│   ├── capabilities/          # Tauri v2 權限規格
│   ├── icons/                 # 遊戲原生應用圖標
│   └── src/
│       ├── main.rs            # Rust 主程式進入點
│       └── lib.rs             # Tauri 原生命令與 IPC 接口
├── ui/                        # 遊戲前端視覺與 3D 引擎
│   ├── index.html             # 遊戲主畫面與 HUD
│   ├── style.css              # 賽博龐克霓虹 UI 樣式
│   ├── game.js                # 核心 3D 跑酷引擎與 Web Audio 合成音效
│   └── lib/
│       └── three.min.js       # 本地離線版 Three.js 引擎
├── index.html                 # 根目錄快捷跳轉
└── README.md                  # 專案文件說明
```

---

## 🚀 運行方式

### 方式一：直接透過瀏覽器（最快、免安裝）
1. 進入專案目錄。
2. 雙擊打開 `ui/index.html`（或根目錄 `index.html`）。
3. 即可在 Chrome / Edge / Firefox 等瀏覽器開始遊玩！

### 方式二：使用 Tauri + Rust 桌面應用啟動
1. 確保本機具備 Rust 與 Node.js 環境。
2. 在專案根目錄下執行：
   ```bash
   cargo tauri dev
   ```
3. 系統即會編譯並啟動獨立的原生桌面遊戲視窗。

### 方式三：直接下載 GitHub Actions 雲端自動編譯成果
- 每次代碼推送後，進入 GitHub 倉庫的 [Actions 頁面](https://github.com/hankyleisplay/Parkour-games/actions)，點選最新一筆工作流，即可在 **Artifacts** 區塊下載已編譯好的 Windows `CyberRunner3D.exe`！

---

## 📜 授權協議

本專案基於 [MIT License](LICENSE) 授權開放開源。