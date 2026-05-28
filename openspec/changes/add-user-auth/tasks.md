## Tasks

本 change 僅捕捉規格，不含實作任務。

### 1. 規格文件
- [x] 建立 `proposal.md`
- [x] 建立 `specs/user-auth/spec.md`，列出已對齊需求
- [x] 將 Open Questions 寫入 `proposal.md`

### 2. 待決議（不在本 change 範圍）
- [x] 決議 Session 策略（單 / 多）→ 多 session，已寫入本 change spec
- [ ] 決議資料同步策略
- [ ] 決議是否導入 Email 驗證信
- [ ] 決議焚香狀態歸屬（本地裝置 / 雲端帳號）
- [ ] 決議推播去重策略（全部裝置 / 最後活躍 / 使用者設定）

### 3. 後續 change（待實作階段啟動）
- [ ] 技術選型：OAuth provider lib、session store、token 格式
- [ ] 實作 change：依本 spec 與待決議結果，提出 user-auth 實作 proposal
