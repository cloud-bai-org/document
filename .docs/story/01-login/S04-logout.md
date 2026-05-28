# S04: 登出（單裝置 / 全部裝置） <!-- -->

**Journey**: login
**Labels**: priority:medium
**Story Dependencies**: S01
**Sub-tasks**:
- [ ] FE: 登出選項 UI <!-- -->
- [ ] BE: session 結束處理 <!-- -->

## UX 操作流程

1. 使用者於設定頁點「登出」
2. 預設登出當前裝置；另提供「登出全部裝置」選項
3. 登出後回到訪客狀態，留在當前頁或回首頁

## UI 元件規格（Frontend）

- `LogoutSection`：兩個按鈕「登出」「登出全部裝置」
- 「登出全部裝置」按下後需二次確認

## 後端職責（Backend）

- 結束當前 session
- 「登出全部裝置」一次失效該帳號所有 session

## Acceptance Criteria

```gherkin
Scenario: 登出僅影響當前裝置
  Given 使用者在裝置 A 與裝置 B 同時登入
  When 使用者在裝置 A 點「登出」
  Then 裝置 A 回到訪客狀態
  And 裝置 B 維持登入狀態

Scenario: 登出全部裝置
  Given 使用者在裝置 A 與裝置 B 同時登入
  When 使用者在裝置 A 點「登出全部裝置」並二次確認
  Then 裝置 A 回到訪客狀態
  And 裝置 B 下次操作時被登出

Scenario: 登出全部裝置需二次確認
  Given 使用者在設定頁
  When 使用者點「登出全部裝置」
  Then 系統顯示二次確認對話框
  And 未確認前不會執行登出
```

## Test Cases

- TC-1: 兩台裝置登入，A 裝置登出 → B 裝置仍登入
- TC-2: 兩台裝置登入，A 裝置點「登出全部裝置」→ B 裝置也被登出
- TC-3: 登出後系統狀態為訪客
