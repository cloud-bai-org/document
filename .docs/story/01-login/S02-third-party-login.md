# S02: 第三方登入（Google / LINE / Facebook） <!-- -->

**Journey**: login
**Labels**: priority:high
**Story Dependencies**: S01
**Sub-tasks**:
- [ ] FE: 第三方登入按鈕與授權跳轉 <!-- -->
- [ ] BE: OAuth callback、帳號建立與綁定 <!-- -->

## UX 操作流程

1. 使用者在 `/login` 點選 Google / LINE / Facebook 任一
2. 跳轉至該提供者授權頁
3. 同意授權 → 提供者導回應用
4. 系統判斷：
   - 該第三方**首次登入** → 建立新帳號，綁定本機訪客紀錄
   - **已存在綁定** → 直接登入既有帳號
5. 回到觸發登入的來源頁
6. 取消授權 → 返回 `/login` 並顯示「已取消登入」

## UI 元件規格（Frontend）

- `ThirdPartyButtons`：三個品牌按鈕，使用各自品牌規範色與 icon
- 點擊後按鈕進入 loading，避免重複觸發
- 取消授權返回後的提示文案：「已取消登入」

## 後端職責（Backend）

- 與三個 provider 完成 OAuth 流程
- 維護「provider 帳號 ↔ 本系統帳號」綁定關係
- 首次登入建立新帳號，並接收本機訪客紀錄綁定
- 既有綁定直接建立 session
- OAuth state 驗證，防 CSRF

## Acceptance Criteria

```gherkin
Scenario: 首次使用 Google 登入建立帳號
  Given 使用者為訪客且本機有訪客紀錄
  When 使用者在 /login 點選 Google 並完成授權
  And 該 Google 帳號從未登入過本系統
  Then 系統建立新帳號
  And 本機訪客紀錄綁定至新帳號
  And 使用者被導回觸發登入的來源頁

Scenario: 已綁定的第三方帳號再次登入
  Given 使用者擁有已綁定 Google 的帳號
  When 使用者在 /login 點選 Google 並完成授權
  Then 系統直接以既有帳號登入
  And 不建立新帳號

Scenario: LINE 登入流程
  Given 使用者在 /login
  When 使用者點選 LINE 並完成授權
  Then 行為與 Google 登入相同（首次建帳號 / 既有直接登入）

Scenario: Facebook 登入流程
  Given 使用者在 /login
  When 使用者點選 Facebook 並完成授權
  Then 行為與 Google 登入相同

Scenario: 使用者在授權頁取消
  Given 使用者點選任一第三方並跳轉至授權頁
  When 使用者取消授權
  Then 返回 /login
  And 顯示「已取消登入」提示
  And 本機訪客紀錄保留

Scenario: state 參數驗證防 CSRF
  Given 第三方 callback 被觸發
  When 回傳的 state 參數與發起時不符
  Then 系統拒絕該登入
  And 顯示錯誤提示
```

## Test Cases

- TC-1: Google 首次登入 → 建帳號 + 綁定訪客紀錄
- TC-2: Google 二次登入 → 直接登入既有帳號
- TC-3: LINE 首次 / 二次登入
- TC-4: Facebook 首次 / 二次登入
- TC-5: 使用者在 provider 授權頁取消
- TC-6: state 參數被竄改 → 拒絕並提示
- TC-7: provider 回傳錯誤 → 顯示對應提示
