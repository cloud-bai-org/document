## Context

cloud-bai 為個人學習取向的線上拜拜平台，PRD 已確立四層 14 個 capability 的產品範圍（拜神明 / 祭祖 / 廟宇打卡 / 多人共拜 / 環保追蹤 / 多語 / 等）。原 prototype 由 AI 自動產出，技術選型偏隨機；本變更為「重新建立技術基礎」，目的有三：

- **可掌握**：兩位開發者皆熟悉 JS 生態，續用 TypeScript / JS 以避免額外語言學習負擔
- **學習價值**：選擇能擴展技能的工具（如 Hono、Drizzle）而非熟悉的舊選擇（Express、Prisma）
- **驗證 AI 自動產出**：開發者需具備 Hono 底子，才能審查 AI 全自動產出的後端程式碼

本變更為 greenfield，無歷史包袱。`openspec/specs/` 目前為空，產品 capability 將於後續以 PRD 為依據另案重新定義。

## Goals / Non-Goals

**Goals:**

- 建立可立即用於 apply 階段的完整技術選型清單（前端、路由、後端、語言、ORM、資料庫、測試、容器、BFF 層、runtime 版本）
- 把每一項選擇的 alternatives 與理由留下文字紀錄，避免日後重複爭論
- 對 2C 產品的效能取向給出明確姿態（著重效能、SEO 僅基本）
- 為 Docker 與 nginx 兩項基礎建設明定本輪深度（baseline / 概念性說明），避免過度投入
- 明確界定前端 BFF 層與 Hono 後端的責任分工，避免業務邏輯散落

**Non-Goals:**

- 不在本變更內實際撰寫專案骨架程式碼（屬 apply 階段工作）
- 不深入 Docker 多階段建置、image slimming、distroless 等進階容器最佳化（留待部署需求出現時再做）
- 不導入 nginx 實際設定（僅保留概念性說明，等真實 VM 部署需求出現時另案處理）
- 不設計複雜效能測試情境（待應用部署後，依實際 user story 與流量另案規劃）
- 不在本變更內定義產品 capability 的規格（產品規格將另案以 PRD 為依據重新定義）
- 不評估非 JS 語言的後端選項（Rust / Go 等——超出兩位開發者的續用範圍）

## Decisions

### 前端框架採用 Next.js + React

選用 Next.js 而非純 React SPA 或 Vite + React，主要理由：

- **效能取向**：PRD 強調 2C 體驗的效能，Next.js 的 SSR / 預渲染 / Image 優化 / 路由級程式碼分割是直接命中需求的工具集
- **SEO 基本盤**：即使本輪 SEO 僅做基本，Next.js 的 metadata API 與 SSR 讓「最低限度 SEO」幾乎是免費取得
- **生態**：React 為兩位開發者的續用基礎，Next.js 是 React 上最成熟的 meta-framework

**Alternatives 考慮：**
- _Vite + React SPA_：開發體驗輕，但 SEO 與 SSR 需另外配，2C 效能訴求下不划算
- _Remix_：與 Next.js 同級，但 React Router 整合方式不同；生態較 Next.js 小

### 客戶端路由採用 React Router

否決 TanStack Router 的理由是「router 非本次學習重點，選學習成本低的」。React Router 為 React 生態最普及的路由解決方案，學習資源最豐富、招聘市場覆蓋率最廣。

**Alternatives 考慮：**
- _TanStack Router_：型別安全更強、檔案路由整合好，但 API 較新、學習曲線較陡；明確否決
- _Next.js App Router 直接做路由_：Next.js 本身就有 file-based App Router，理論上可省下 React Router。本決策保留 React Router 作為「客戶端內部路由與導覽」的工具；App Router 用於頁面層級路由（見「Hono 與 Next.js 的拓撲」決策）

### 後端框架採用 Hono

否決 Express 的理由：

- **AI 推薦傾向**：當前 AI 工具對新框架（Hono）的產出品質與 Express 持平甚至更高
- **同事實戰經驗**：Kyle 在既有專案使用 Hono，可形成知識遷移
- **驗證 AI 自動產出**：本專案有「驗證 AI 全自動產出」的副目標，開發者必須有 Hono 底子才能審查 AI 程式碼
- **執行環境彈性**：Hono 可在 Node.js / Bun / Cloudflare Workers / Deno 上運行，未來部署選擇較寬

**Alternatives 考慮：**
- _Express_：成熟、文件豐富、JS 後端的「預設值」，但學習價值低（兩位開發者皆已熟悉），且 AI 對 Hono 的支援度已足夠
- _Fastify_：性能優於 Express、plugin 架構清楚，但與 Hono 相比社群勢頭較弱，且非 AI 預設

### Hono 與 Next.js 的拓撲：獨立後端服務 + BFF

Next.js 本身有 API Route / Route Handler，可承載後端邏輯。本變更選擇 **Hono 作為獨立後端服務**，**Next.js 的 API Route 則作為 BFF 層**（見下一個決策的責任界線）。理由：

- **學習取向**：獨立後端服務能完整體驗 Hono 的生命週期、middleware、部署模型
- **責任分離清晰**：前端（Next.js）與後端（Hono）部署、擴展、版本管理互不耦合，符合 Docker baseline 的多服務佈局
- **未來彈性**：日後若把後端遷至 Cloudflare Workers / Edge，獨立 Hono 服務更容易拆出
- **同源呼叫**：前端對 Next.js 同源呼叫 BFF，瀏覽器層不需處理 CORS、cookie 自動帶；CORS 規則集中在 BFF 對 Hono 的伺服器層呼叫處理

**取捨：** 部署複雜度略高（需同時跑兩個 service），但本輪 Docker baseline 足以涵蓋。

### BFF 層責任界線

Next.js API Route Handler 承擔 **BFF（Backend For Frontend）** 角色。責任分工明確化：

**BFF 層（Next.js API Route）SHALL 負責**：
- 對前端聚合多個 Hono 端點（減少前端 round-trip 次數）
- 將內部 Hono API 對外重新塑形（封裝後端細節，讓前端只看到適合自己的形狀）
- 同源呼叫 Hono（避免瀏覽器層 CORS、cookie 不傳的雜訊）
- 前端專屬轉換（locale 注入、auth header inject、回應裁切）

**Hono（核心後端）SHALL 負責**：
- 業務邏輯、資料存取、權限驗證、領域規則
- 多通道共用 API（未來若有行動 App、第三方整合，皆走 Hono）

**禁止項**：BFF 層 SHALL NOT 包含業務邏輯——任何牽涉資料庫查詢、權限判斷、領域規則的程式碼，一律放 Hono；BFF 僅做轉發、聚合、形狀調整。

**取捨：**
- 多一層轉發會增加微小延遲（同機房內忽略）
- 換得前端與後端版本演進解耦、API 形狀可優化、CORS 完全在 BFF 處理掉
- BFF 純為轉發 + 形狀調整，責任界線越乾淨，越容易維持

### ORM 採用 Drizzle

Drizzle vs Prisma 取捨：

| 面向 | Drizzle | Prisma |
| --- | --- | --- |
| Schema 定義 | TypeScript（`drizzle-orm/pg-core`） | 獨立 DSL（`schema.prisma`） |
| 查詢寫法 | 接近 SQL（query builder） | Active Record 風格 |
| 抽象層級 | 低，SQL 產出透明 | 高，封裝較深 |
| Runtime | 純 TS 函式 | 早期需 query engine binary（4.x 後可用 driver adapter） |
| 學習遷移 | 強化 SQL 知識，跨 ORM 通用 | Prisma 專有 DSL，知識遷移性較弱 |
| 邊緣執行 | 原生支援 Hono / Edge | 需 driver adapter |
| 生態 | 新、社群成長中 | 成熟、文件豐富 |

選擇 Drizzle 的決定性理由：

- **SQL 透明度**：寫法接近 SQL，使用者學的是「SQL + TS 型別」這套通用知識，不被特定 ORM 鎖死
- **與 Hono / Edge 對齊**：Drizzle 在 edge runtime 比 Prisma 順手，符合未來部署彈性
- **學習一石二鳥**：寫 Drizzle = 同時練 SQL 與 TS 型別系統

**已知不確定性：** 開發者目前「講不出明確差異理由」。本決策依分析建議定為 Drizzle；apply 階段若實際撰寫 schema 後發現不適，可在追蹤工作中改 Prisma（schema 都在 TS，遷移成本不高）。

### 資料庫採用 PostgreSQL

PostgreSQL 為 JS 後端的主流 RDBMS，無爭議。JSON 欄位、全文索引、CTE 等進階特性對未來功能（廟宇資料、足跡統計、環保里程碑統計）皆有用。

**Alternatives 考慮：**
- _MySQL / MariaDB_：可，但 PostgreSQL 的 JSON 與型別系統更貼合 TS 後端
- _SQLite_：適合純單機 / 行動端，不符合多人協作（multi-device 同步）需求

### 測試框架採用 Vitest

否決 Jest 的理由：

- **無歷史包袱**：greenfield 專案，沒有 Jest 既有測試需要相容
- **AI 預設**：當前 AI 工具對 Vitest 的支援已超越 Jest
- **市場覆蓋率**：Vitest 採用率持續上升，與 Vite / esbuild 生態整合佳；Next.js 亦官方支援
- **效能**：Vitest 啟動與 watch 比 Jest 快

### 容器化採用 Docker baseline

本輪僅導入 classic Dockerfile（單階段或淺多階段），目標是「能 build 出可執行 image」即可。

**不做**（屬 Non-Goals）：
- 多階段建置最佳化、image slimming、distroless base 等
- 完整 Docker Compose 編排（最多提供 dev compose 跑 PostgreSQL）
- Kubernetes / Helm 等更上層的編排

### nginx 僅保留概念性說明

本專案若部署到平台類服務（如 Vercel / Fly.io / Railway）可能完全用不到 nginx。公司 VM 自駕場景才需詳列；本變更不導入實際 nginx 設定，僅在文件中保留「為何需要 / 通常做什麼」的概念性說明，等真實部署需求出現時另案處理。

### 效能與 SEO 取向

- **效能**：所有產出皆以效能為一級考量；具體手段（SSR / 預渲染 / 程式碼分割 / 影像優化 / 快取策略）依頁面性質選用，由 Next.js 工具集提供
- **SEO**：僅做基本（title / description / Open Graph / 結構化資料 schema.org），其餘交由 AI 建議
- **效能測試**：複雜情境（多人房間下的 WebSocket 壓測、焚香計時與背景通知的時延）待部署後另案規劃，本變更不設計

### Package manager 與 Node.js 版本鎖定

關閉先前的 Open Questions，明確定下：

- **Package manager**：採用 **pnpm**，並透過根 `package.json` 的 `packageManager` 欄位鎖定具體版本（含完整 hash 或精確 semver）。任意開發者執行 `corepack enable` 後即自動取得相同 pnpm 版本，避免口頭同步
- **Node.js**：要求 **Node.js 20 或更新**。鎖定方式三管齊下：
  - 根 `package.json` 的 `engines.node` 設為 `">=20"`
  - `.nvmrc` 釘住具體 LTS 版本（如 `20`），方便 nvm 使用者一致切換
  - Docker base image 採用 `node:20-slim` 或更新，CI runner 亦使用同條件

理由：
- Node 18 已於 2025-04 退役；20.x 為現役 active LTS
- 本專案依賴的 Next.js 15+ / Hono / Drizzle / Vitest 皆要求 20+
- `packageManager` 欄位鎖死後，貢獻者環境自動對齊，省去版本錯亂的排錯時間

**Alternatives 考慮：**
- _不鎖 pnpm 版本_：兩位開發者很容易裝到不同版本，導致 lockfile 抖動，否決
- _Node 22_：22 為更新版 active LTS，但仍在普及中；採取「最低 20、不上限」的彈性策略，apply 階段以實際 LTS 訂 `.nvmrc`

## Implementation Contract

本變更於 apply 階段的可觀察成果：

- **可執行的前後端骨架**：根目錄執行單一指令可同時啟動 Next.js 前端與 Hono 後端（具體指令於 tasks.md 明定），前端可開啟首頁、後端可回應健康檢查端點
- **資料庫連線可用**：應用程式可透過 Drizzle 連上 PostgreSQL，並能執行至少一筆 migration（建立或刪除一張示範表）
- **測試可執行**：根目錄執行測試指令時，Vitest 能找到並執行至少一個示範測試案例並回報結果
- **可建出 Docker image**：根目錄存在 Dockerfile，能成功 build 並 run 起來，跑起來後可透過 HTTP 存取應用
- **BFF 層可運作**：前端首頁透過 Next.js API Route（BFF）呼叫到 Hono `/health`，瀏覽器看到的請求皆指向同源 `/api/*`，不出現對 Hono 後端 port 的直連
- **版本鎖定生效**：未安裝指定 pnpm 版本的開發者 `corepack enable` 後自動取得正確版本；Node 版本低於 20 時 `pnpm install` 立刻警告或失敗
- **介面 / 資料形狀**：本變更不定義應用層 API 形狀（屬產品 capability 的責任）；僅確保「健康檢查端點」存在，BFF 與 Hono 兩端皆回應 HTTP 200 + JSON `{ "status": "ok" }`
- **失敗模式**：DB 連線失敗時，後端 SHALL 於啟動時輸出明確錯誤訊息並結束，不得靜默；BFF 對 Hono 連線失敗時 SHALL 回 HTTP 502 並含明確錯誤代碼
- **驗收方式**：
  - `pnpm dev`（或同等指令）同時啟動兩個服務，二者皆健康
  - `pnpm test` 通過示範測試
  - `docker build` 成功並 `docker run` 後可存取應用
  - 開啟首頁，devtools Network 面板顯示前端只打同源 `/api/*`，不直連 Hono port
  - `corepack enable` 後 `pnpm -v` 顯示鎖定版本；用 Node 18 執行 `pnpm install` 觸發 engines 警告
- **In scope**：技術選擇、設定檔骨架、示範測試與健康端點、BFF infra、版本鎖定
- **Out of scope**：任何產品功能（拜拜流程、登入、廟宇資料等）的實作、BFF 對複雜資料的形狀調整實作（僅示範一條轉發路徑即可）

## Risks / Trade-offs

- [Hono 為獨立服務，部署需同時跑兩個 process] → Docker compose dev profile 涵蓋；正式部署選平台類（Vercel + Fly.io 等）可分開部署
- [BFF 多一層轉發增加微小延遲] → 同機房內忽略；換得 CORS 集中處理與 API 形狀自由度
- [BFF 邊界容易被破壞，業務邏輯可能漏寫到 BFF 層] → Mitigation：spec 明定 BFF SHALL NOT 含業務邏輯；code review 與 lint 規則需強制（apply 階段 task 可加進去）
- [Drizzle 較新，社群文件較 Prisma 少] → Mitigation：spec 已明定 Drizzle，但 schema 全在 TS，未來改 Prisma 成本不高
- [Next.js App Router 與 React Router 雙路由系統可能造成困惑] → Mitigation：明定 App Router 用於頁面層路由、React Router 用於頁內 nested routing；如後續發現多餘可移除 React Router（學習目的已達成）
- [本變更未實際部署，nginx 與效能測試的未知留待未來] → 接受；本輪明確標記為 Non-Goal
- [兩位開發者皆對 Drizzle 沒實戰經驗] → 接受；apply 階段第一個 task 即是寫示範 schema，及早暴露學習摩擦
- [鎖定 Node 20 為最低版本，可能限制未來引入只支援更新版的工具] → 接受；engines.node 為「最低」而非固定，可隨時調升

## Migration Plan

- 本變更為 greenfield，無資料 / 程式碼遷移
- Apply 階段以下列順序逐步建立：workspace 結構與版本鎖定 → Next.js 應用 → Hono 應用 → BFF 轉發示範 → PostgreSQL + Drizzle 設定 → Vitest 示範 → Docker baseline
- Rollback：若 Drizzle 在實作後判定不適用，schema 在 TS、可重寫為 Prisma；其他選型本變更內不預期 rollback

## Open Questions

- **Drizzle 適用性最終確認**：apply 階段寫完第一張 schema 與一組查詢後重新評估；若體驗顯著不佳，視為決策變更，另開 change 切換到 Prisma
- **多人房間的即時通訊技術**：本變更未涉及（屬產品 capability，留待產品規格定義時決定，例：socket.io / native WebSocket / Server-Sent Events）
- **BFF 邊界的強制機制**：本變更 spec 已明定 BFF 不得含業務邏輯，但要不要在 apply 階段加上 lint rule（例：禁止 BFF 目錄 import drizzle / 領域服務）尚未定，留待 apply 階段視體感決定
