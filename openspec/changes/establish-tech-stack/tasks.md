## 1. Workspace 與 package manager

- [ ] 1.1 在專案根目錄初始化 pnpm workspace，並建立 `apps/web`（前端）與 `apps/api`（後端）兩個 package 目錄。**完成標準**：執行 `pnpm install` 能成功安裝依賴並建立 workspace 連結；`pnpm -r run --help` 能列出所有 workspace package。
- [ ] 1.2 在根 `package.json` 定義跨 workspace 的 dev / build / test / lint 共用腳本，使 `pnpm dev`、`pnpm test`、`pnpm build` 一次驅動所有 package。**完成標準**：根目錄執行 `pnpm dev --filter web` 與 `pnpm dev --filter api` 能分別啟動單一 service；不帶 filter 的 `pnpm dev` 同時啟動兩者。
- [ ] 1.3 [spec: Package manager and runtime version][設計參照：Package manager 與 Node.js 版本鎖定] 鎖定 pnpm 版本與 Node 最低版本：根 `package.json` 設 `packageManager` 為帶 hash 的精確 pnpm 版本（如 `pnpm@<x.y.z>+sha256.<hash>`）、`engines.node` 為 `">=20"`；專案根新增 `.nvmrc` 釘住具體 LTS（例：`20`）。本任務交付「Package manager and runtime version」的可驗證鎖定，落實設計章節「Package manager 與 Node.js 版本鎖定」的決策。**完成標準**：清乾淨環境後執行 `corepack enable` → `pnpm -v` 顯示鎖定版本；切到 Node 18 執行 `pnpm install` 觸發 `engines` 警告或失敗；`.nvmrc` 內容與 `engines.node` 條件一致。

## 2. Programming language 設定（TypeScript）

- [ ] 2.1 [spec: Programming language] 於根目錄與兩個 app package 建立 `tsconfig.json`，採用 strict 模式並設定 path alias；本任務交付「Programming language 為 TypeScript / JavaScript」的可驗證落地。**完成標準**：`pnpm -r exec tsc --noEmit` 對兩個 package 皆無錯誤；新加入的 `.ts`/`.tsx` 檔可被編譯且 IDE 能解析 path alias。

## 3. 前端骨架（前端框架採用 Next.js + React）

- [ ] 3.1 [spec: Frontend framework] 在 `apps/web` 用最新版 Next.js（App Router）建立應用，含一頁可瀏覽的首頁；本任務確認 Frontend framework 為 Next.js + React。**完成標準**：`pnpm --filter web dev` 啟動後，瀏覽器開啟首頁可看到內容、無 console error；`pnpm --filter web build` 能成功產出 production build。

## 4. 客戶端路由（客戶端路由採用 React Router）

- [ ] 4.1 [spec: Client-side routing] 在 Next.js 應用中導入 React Router，於首頁底下提供至少一條巢狀路由示範（例如 `/demo` 與 `/demo/nested`）；本任務交付 Client-side routing 透過 React Router 的可驗證實作。**完成標準**：透過 React Router 切換 `/demo` 與 `/demo/nested` 不會觸發完整頁面重載，URL 與顯示內容皆切換正確。**設計參照**：明確區分「Next.js App Router 處理頁面層路由、React Router 處理頁內巢狀導覽」的拓撲。

## 5. 後端骨架（後端框架採用 Hono + Hono 與 Next.js 的拓撲：獨立後端服務 + BFF）

- [ ] 5.1 [spec: Backend framework] 在 `apps/api` 建立 Hono 應用，提供 `GET /health` 端點；本任務確認 Backend framework 為獨立的 Hono 服務。**完成標準**：`pnpm --filter api dev` 啟動後（預設與前端不同 port），對 `GET /health` 回應 HTTP 200 與 JSON `{ "status": "ok" }`。
- [ ] 5.2 設定 Hono 應用的基本 middleware：CORS（僅允許 BFF 同源 / 內網呼叫，不開放給瀏覽器直連）、request logging、JSON body parsing。**完成標準**：從 BFF（伺服器端）對 Hono 發請求不被 CORS 阻擋；從瀏覽器直接打 Hono port 被 CORS 拒絕；任一請求在 stdout 看到結構化 log；POST JSON 能被 Hono context 正確解析。

## 6. 資料庫與 ORM（資料庫採用 PostgreSQL、ORM 採用 Drizzle）

- [ ] 6.1 [spec: Relational database] 為本地開發提供 PostgreSQL 實例（於 docker compose 的 dev profile）；本任務交付 Relational database 為 PostgreSQL 的可驗證設定。**完成標準**：`docker compose up -d db` 後可用 `psql` 或任一 GUI 連上預設 port，看到空 schema。
- [ ] 6.2 [spec: ORM layer] 在 `apps/api` 設定 Drizzle ORM，含 `drizzle.config.ts` 與 schema 進入點；本任務交付 ORM layer 為 Drizzle 的可驗證落地。**完成標準**：後端啟動時透過 Drizzle 成功連上 dev PostgreSQL；連線失敗時 service 於啟動階段輸出明確錯誤並結束（不得靜默）。
- [ ] 6.3 撰寫一張示範 schema（例如 `pings` 表，含 `id`、`message`、`created_at`），產生並執行 migration。**完成標準**：`pnpm --filter api drizzle:generate` 產出 SQL migration 檔案；`pnpm --filter api drizzle:migrate` 套用後，DB 內可看到對應表結構。
- [ ] 6.4 在 Hono 加上 `GET /pings` 與 `POST /pings` 兩個端點，分別讀寫示範表，驗證 Drizzle 查詢路徑可用。**完成標準**：`POST /pings` body `{ "message": "hi" }` 回應 HTTP 201 與新建紀錄；`GET /pings` 回應陣列且包含剛建立的紀錄。

## 7. BFF 層與全棧整合（BFF 層責任界線）

- [ ] 7.1 [spec: BFF responsibility boundary] 在 `apps/web` 建立 Next.js API Route 作為 BFF 入口：`app/api/health/route.ts` 同步轉發至 Hono `GET /health`，`app/api/pings/route.ts` 轉發 `GET / POST` 至 Hono `/pings`。BFF 內 SHALL NOT 含業務邏輯，僅做轉發與必要的形狀調整。本任務交付 BFF responsibility boundary 的可驗證 infrastructure。**完成標準**：`curl http://localhost:3000/api/health` 回 `{ "status": "ok" }`；`POST /api/pings` 與 `GET /api/pings` 行為一致於後端對應端點；BFF 程式碼內找不到 Drizzle import 或任何資料庫呼叫。
- [ ] 7.2 BFF 對 Hono 不可用情境的處理：當 Hono service 未啟動或回 5xx 時，BFF 回應 HTTP 502 與結構化錯誤 payload（包含 `code`、`upstream`、`message`），不靜默吞掉。**完成標準**：手動停掉 Hono 後，`curl -i http://localhost:3000/api/health` 回 HTTP 502 與結構化 JSON；錯誤訊息不洩漏內部堆疊。
- [ ] 7.3 從前端首頁透過 fetch 呼叫**同源** `/api/health`（不是直連 Hono port），將結果顯示於頁面。**完成標準**：開啟首頁可看到從 BFF 取得的 `{ "status": "ok" }`；瀏覽器 devtools Network 面板顯示請求目標為同源（`localhost:3000/api/...`），不出現對 Hono port（如 8787）的直連；關閉後端時頁面顯示 BFF 回的 502 結構化錯誤，不顯示空白或卡死。

## 8. Automated testing framework（測試框架採用 Vitest）

- [ ] 8.1 [spec: Automated testing framework] 於兩個 app package 安裝並設定 Vitest，含 root `vitest.config.ts` 與 workspace 整合；本任務確認 Automated testing framework 為 Vitest。**完成標準**：`pnpm test` 可同時跑兩個 package 的測試並彙整輸出。
- [ ] 8.2 撰寫示範測試：前端對 React 元件的 render 測試一則；後端對 Hono `GET /health` 的 supertest-style 測試一則；BFF 對 `GET /api/health` 的整合測試一則（mock Hono 上游、驗證轉發與 502 行為）。**完成標準**：`pnpm test` 通過三則測試；故意改錯任一處能讓對應測試失敗、回報行為差異而非 stack trace 噪音。

## 9. Container baseline（容器化採用 Docker baseline）

- [ ] 9.1 [spec: Container baseline] 為 `apps/web` 與 `apps/api` 各建立一份 Dockerfile（classic 寫法、單階段或淺多階段），base image 採用 `node:20-slim` 或更新；本任務交付 Container baseline 的可驗證 image build。**完成標準**：`docker build -f apps/web/Dockerfile .` 與 `docker build -f apps/api/Dockerfile .` 皆能成功 build 出 image；`docker run` 進去後 `node --version` 顯示 20 或更新。
- [ ] 9.2 提供 `docker compose.yaml`，至少包含 `db`（PostgreSQL）、`api`（Hono）、`web`（Next.js）三個 service。**完成標準**：`docker compose up` 啟動後，瀏覽器可訪問前端、前端透過 BFF 成功打到 Hono、Hono 能成功讀寫 PostgreSQL；service 全停後再 up 一次行為一致。

## 10. Performance-first delivery for 2C（效能與 SEO 取向）

- [ ] 10.1 [spec: Performance-first delivery for 2C] 建立共用 metadata helper（Next.js `generateMetadata` 包裝），確保任何頁面導入時能設定 title / description / Open Graph / schema.org JSON-LD；本任務交付 Performance-first delivery for 2C 的 SEO baseline。**完成標準**：首頁原始 HTML 含 title、`<meta name="description">`、`og:title`、`og:description` 與一段 JSON-LD；於 https://search.google.com/test/rich-results 或 schema validator 上不報結構錯誤。
- [ ] 10.2 為首頁設定預渲染或 SSR（依頁面性質），並在 README 留下「新頁面預設效能取向」一段說明（如：靜態先行、互動性高的頁面用 RSC + 客戶端片段、必要時加 cache header）。**完成標準**：首頁透過 `pnpm --filter web build` 後輸出顯示為 prerendered / static；README 內存在該段文字。

## 11. nginx 概念性說明（設計參照「nginx 僅保留概念性說明」）

- [ ] 11.1 在 `docs/deployment-notes.md`（新增檔）或 README 內新增「Reverse proxy 概念」一節，說明 nginx 在 VM 自駕場景的角色（TLS 終端、靜態檔、反向代理、limit / rate-limit），並明列「本專案目前不實際導入」。**完成標準**：該檔案存在且含上述內容；文件導覽中可從首頁或 README 連結到此段落。

## 12. 收尾驗收

- [ ] 12.1 在 README 加入「Getting Started」段落，列出本變更後可執行的指令（`corepack enable`、`pnpm install`、`pnpm dev`、`pnpm test`、`docker compose up`）以及預期觀察到的結果；附帶最低 Node 版本要求說明。**完成標準**：任意一位新加入的開發者照著 README 走，能在無口頭引導下完成完整 dev 環境啟動，並看到前後端、BFF、DB、首頁、測試皆通過。
- [ ] 12.2 跑一次完整驗收：`corepack enable` → `pnpm install` → `pnpm test` → `pnpm dev`（前端透過 BFF 可打通 Hono）→ `docker compose up`（全 stack 起來且首頁可訪問）。**完成標準**：五步全部通過，無 console error、無啟動錯誤；首頁所有 API 呼叫於 devtools 顯示為同源。
