## Why

PRD §3 將 `user-auth` 列為跨領域服務，且既有使用者旅程已將「儀式完成後提示登入綁定」設為流程核心切入點之一。本 change 將登入旅程（`.docs/journeys/login.md`）的已對齊決策規格化，作為後續實作 user-auth capability 的依據，避免規格散落於 PRD 與旅程文件之間。

本 change 僅捕捉規格，不含實作。

## What Changes

- **訪客模式**：未登入即可完整使用系統，所有紀錄暫存本機
- **Session 策略**：採用多 session — 同帳號可在多裝置同時登入；登出語意預設僅登出當前裝置，並提供「登出全部裝置」選項
- **登入觸發點**：儀式完成摘要頁主動詢問是否登入；設定/個人頁亦提供主動登入入口
- **登入方式**：
  - Email + 密碼（Email 作為帳號識別）
  - 第三方登入：Google、LINE、Facebook
- **登入後資料行為**：
  - 新帳號：本機訪客紀錄綁定至此帳號
  - 既有帳號：讀取雲端紀錄
  - **不做訪客→帳號的合併策略**（避免複雜衝突解決）
- **例外處理**：授權失敗、授權取消、網路中斷時，紀錄保留於本機，使用者維持訪客身分
- **密碼強度**：不指定特定規則，採實作合理預設

## Non-Goals (optional)

- **忘記密碼 / 密碼重設**：暫不實作；未來實作時將透過註冊 Email 寄送臨時密碼或重設連結，因此本階段需確保 Email 為有效載體（見 Open Questions）
- **裝置管理介面**（已登入裝置清單、遠端登出）
- **MFA / 兩階段驗證**
- **訪客資料與既有帳號的合併規則**

## Open Questions

下列項目本次 change 不寫入 spec，待後續決議後另開 change 補入：

1. **資料同步策略**：在多 session 之上，資料如何在裝置間流動？即時推送、開啟時拉取、衝突解決規則。
2. **Email 驗證**：註冊時是否寄送驗證信？影響忘記密碼是否可立即在後續啟用。
3. **焚香狀態歸屬**：背景焚香計時器是本地裝置狀態，或同步至雲端帳號供跨裝置接力？
4. **推播去重**：儀式完成等通知，要推送至帳號所有裝置、最後活躍裝置，或讓使用者設定？

## Capabilities

### New Capabilities

- `user-auth`: 使用者身分與登入管理——訪客模式、Email+密碼與第三方登入、登入後紀錄綁定。本 capability 為產品行為層，不規範技術選型（OAuth lib、session store 等），技術選型於實作前另議。

### Modified Capabilities

_無——`openspec/specs/user-auth/` 目前不存在。_

## Impact

- **Affected code**：無（本 change 僅規格捕捉）
- **New（規格層）**：
  - `openspec/specs/user-auth/spec.md`（archive 後產生）
- **影響範圍**：後續 user-auth 實作 change、儀式完成摘要頁（worship-ceremony）對登入提示的對接、所有需要識別使用者的 capability
- **相依文件**：
  - `.docs/prd/cloud-bai.md`
  - `.docs/journeys/login.md`
