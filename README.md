# 🕹️ Retro Arcade All-in-One - 全能經典小遊戲平台 (含 AI Demo Mode)

[![Build and Release](https://github.com/hankyleisplay/Parkour-games/actions/workflows/build.yml/badge.svg)](https://github.com/hankyleisplay/Parkour-games/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

《**Retro Arcade All-in-One**》是一款基於 **Tauri + Rust** 原生桌面視窗與 HTML5 Canvas 打造的 **四合一經典街機小遊戲平台**，內建專屬像素街機應用程式圖標與 **🤖 AI Demo Mode（AI 自動遊玩系統）**！

---

## 🎮 四大內建遊戲與 AI Demo Mode 演算法

| 遊戲名稱 | 核心玩法特色 | 🤖 內建 AI Demo Mode 技術 |
| :--- | :--- | :--- |
| 🍄 **超級馬力歐跑酷 (Mario Parkour)** | 橫向捲軸無盡跑酷、頂 `[?]` 磚塊、吃超級蘑菇與火焰花發射彈跳火球、水管食人花、踩栗寶寶與過關旗杆！ | **地形與威脅感知 AI**：自動偵測前方深淵斷崖助跑大跳、判斷水管食人花伸縮時機駐足閃避、自動發射火球與頂擊問號磚塊 |
| 🔢 **2048 益智方塊 (2048 Puzzle)** | 經典 4×4 數字滑動合併、支援悔棋一步 (Undo) 與歷史最高分紀錄 | **Expectimax 蛇形權重啟發式 AI**：結合蛇形遞減權重矩陣、平滑度與空格最大化評估，高速自動合成大數字磚 |
| 🧱 **俄羅斯方塊 (Tetris Arcade)** | 7 種標準方塊、Ghost Piece 落點預覽陰影、Next Piece 預告與等級加速 | **Pierre Dellacherie 演算法 AI**：針對所有旋轉角度與落點計算總高度、消行數、空洞懲罰與凹凸度，最佳化高速堆疊消行 |
| 🐍 **經典貪吃蛇 (Retro Snake)** | 吞食紅蘋果與黃金星果實（+300 分）不斷變長，棋盤格復古視覺 | **BFS 尋路 + 存活空間驗證 AI**：以廣度優先搜尋最短路徑，並搭配 Flood-Fill 驗證吃蘋果後是否仍具備安全存活空間，避免進入死胡同 |

---

## 🕹️ 操作指南

- **頂部平台導覽列**：隨時一鍵切換「🏠 遊戲大廳」、「🍄 馬力歐跑酷」、「🔢 2048」、「🧱 俄羅斯方塊」、「🐍 貪吃蛇」。
- **🤖 Demo Mode 按鍵**：
  - 點擊頂部導覽列的 **「🤖 Demo Mode (AI 代玩)」** 按鈕、各遊戲內的 **「🤖 AI Demo Mode」** 按鈕，或直接按下鍵盤快捷鍵 <kbd>M</kbd>，即可隨時讓 AI 接手自動遊玩！
- **通用快捷鍵**：
  - <kbd>WASD</kbd> 或 <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd>：移動 / 滑動 / 旋轉
  - <kbd>Space</kbd>：馬力歐跳躍 / 俄羅斯方塊瞬間硬降 (Hard Drop)
  - <kbd>F</kbd> 或 <kbd>J</kbd>：馬力歐火焰形態發射彈跳火球
  - <kbd>M</kbd>：一鍵開啟 / 關閉 **AI Demo Mode**
  - <kbd>P</kbd> / <kbd>ESC</kbd>：暫停遊戲

---

## 🖥️ 本機運行與 Tauri 編譯

### 方式一：直接在瀏覽器遊玩（免安裝、最快速）
雙擊專案目錄下的 `ui/index.html` 或 `index.html`，即可在瀏覽器以 60FPS 暢玩四合一小遊戲平台與 AI Demo Mode！

### 方式二：Tauri + Rust 原生桌面應用啟動
```bash
npm install
npm run dev
# 或編譯正式版安裝包與執行檔
npm run build
```