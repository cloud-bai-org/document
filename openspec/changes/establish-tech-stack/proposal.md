## Why

cloud-bai 是學習取向的個人專案，原 prototype 由 AI 自動產出、技術選型偏隨機。本次需重新建立可掌握、學習價值高的技術基礎，作為後續所有功能開發（依 PRD 與待重新定義的產品規格）的前提。技術選型亦兼顧驗證「AI 全自動產出」的可行性。

## What Changes

- **前端框架**：採用 **Next.js + React** 作為前端骨幹（含 SSR / 預渲染能力，呼應 PRD 對效能與 2C 體驗的著重）
- **路由**：採用 **React Router** 處理頁面路由（否決 TanStack Router——router 非本次學習重點,選學習成本低的）
- **後端框架**：採用 **Hono**（否決 Express）——AI 推薦、Kyle 於既有專案具實戰經驗、需 Hono 底子來驗證 AI 全自動產出
- **BFF 架構**：Next.js API Route 作為 BFF（Backend For Frontend）薄轉發層，前端只打同源 `/api/*`；業務邏輯一律集中在 Hono，BFF 層禁止包含業務邏輯
- **語言**：統一使用 **TypeScript / JavaScript**（兩位開發者皆續用 JS 生態）
- **Runtime 與 package manager**：**Node.js 20+**，透過 `engines.node` 與 `.nvmrc` 鎖定；**pnpm** 透過 `packageManager` 欄位鎖定具體版本（含 hash），確保所有開發者環境一致
- **ORM**：採用 **Drizzle**（暫定）作為 ORM——理由是寫法接近 SQL、可同步強化 SQL 知識與 TS 型別系統能力；Prisma 列為 Alternatives Considered
- **資料庫**：採用 **PostgreSQL**
- **測試框架**：採用 **Vitest**（否決 Jest——無歷史包袱、AI 預設、市場覆蓋率高）
- **容器化**：本輪僅導入 **Docker baseline**（classic 寫法、`node:20-slim` 系列 base image），不深入多階段建置、image slimming 等進階主題
- **反向代理**：**nginx 本輪僅保留概念性說明**，不實際導入（若部署到平台類如 Vercel 可能完全用不到；公司 VM 自駕場景才需詳列，留待未來工作專案處理）
- **效能與 SEO**：產品為 2C，**著重效能**；SEO 僅做基本（meta、Open Graph、結構化資料）+ AI 建議；複雜效能測試情境待部署後另行規劃

## Non-Goals (optional)

_本提案將建立 design.md，詳細的 Non-Goals 與被拒絕方案於該處說明。_

## Capabilities

### New Capabilities

- `tech-foundation`: 專案技術基礎決策的規格化記錄——前端框架、路由、後端框架、BFF 層責任界線、語言、Runtime 與 package manager 版本、ORM、資料庫、測試、容器化、效能與 SEO 取向。本 capability 為純技術，不混入產品行為，與後續以 PRD 為依據定義的產品 capability 分離。

### Modified Capabilities

_無——既有 spec 目錄目前為空（已於前一階段清空，待重新定義產品 capability）。_

## Impact

- **Affected code**：greenfield 專案，無既有程式碼受影響
- **New（待後續 apply 階段建立）**：
  - 專案骨架（Next.js 前端 + Hono 後端 workspace 結構）
  - Next.js API Route 作為 BFF 轉發層（同源 `/api/*` → Hono service）
  - `packageManager` 欄位、`.nvmrc`、`engines.node` 構成的版本鎖定
  - PostgreSQL + Drizzle 設定
  - Vitest 測試設定
  - Docker baseline 設定檔（`node:20-slim` 系列 base image）
- **影響範圍**：所有後續產品 capability 的實作 task 都將以本 capability 的技術選擇為前提；前端對後端的呼叫一律走 BFF，產品 spec 不需重複指定 transport
- **相依文件**：.docs/prd/cloud-bai.md（產品願景與能力概覽）
