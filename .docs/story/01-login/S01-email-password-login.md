# S01: Email + 密碼登入 <!-- #1 -->
**Journey**: login
**Labels**: priority:high
**Story Dependencies**: 無
**Sub-tasks**:
- [ ] FE: 登入頁 UI 與表單驗證 <!-- #2 -->
- [ ] BE: 登入驗證與 session 建立 <!-- #3 -->
## UX 操作流程

1. 使用者從訪客模式或設定頁點「登入」進入 `/login`
2. 預設顯示 Email + 密碼欄位（含註冊入口）
3. 輸入 Email、密碼，點「登入」
4. 成功 → 回到觸發登入的來源頁，並顯示登入成功提示
5. 失敗 → 欄位下方顯示對應錯誤訊息，焦點留在錯誤欄位

## UI 元件規格（Frontend）

- `LoginPage`
  - `EmailField`：必填，前端驗證 Email 格式
  - `PasswordField`：必填
  - `SubmitButton`：載入中顯示 spinner、disabled
  - `SignupLink`：導向註冊
  - `ThirdPartyButtons` 區塊：留位置，S02 接續實作
- 錯誤狀態：欄位下方紅字 + 邊框紅
- RWD：手機優先，按鈕全寬
- 設計稿：（待補連結）

## 後端職責（Backend）

- 驗證 Email + 密碼是否正確
- 成功後建立 session（支援多 session，同帳號可在多裝置同時登入）
- 防暴力破解（如錯誤次數限制）
- 錯誤訊息不洩漏帳號是否存在

## Acceptance Criteria

```gherkin
Scenario: 正確帳密成功登入
  Given 使用者已開啟 /login
  And 該 Email 已註冊
  When 使用者輸入正確的 Email 與密碼並送出
  Then 系統顯示登入成功提示
  And 使用者被導回觸發登入的來源頁

Scenario: 錯誤密碼不洩漏帳號存在性
  Given 使用者已開啟 /login
  When 使用者輸入存在的 Email 與錯誤的密碼並送出
  Then 系統顯示通用錯誤訊息「帳號或密碼錯誤」
  And 不揭露該 Email 是否存在

Scenario: 不存在的帳號顯示相同錯誤
  Given 使用者已開啟 /login
  When 使用者輸入不存在的 Email 與任意密碼並送出
  Then 系統顯示與「錯誤密碼」相同的錯誤訊息

Scenario: 前端攔截 Email 格式錯誤
  Given 使用者已開啟 /login
  When 使用者輸入格式錯誤的 Email
  Then 送出按鈕顯示為錯誤狀態
  And 不會發送登入請求

Scenario: 載入中防止重複送出
  Given 使用者已送出登入請求且尚未收到回應
  When 使用者再次點擊送出按鈕
  Then 按鈕為 disabled 狀態
  And 不會發送第二次請求

Scenario: 多裝置同時登入
  Given 使用者已在裝置 A 登入
  When 使用者在裝置 B 用相同帳號登入
  Then 兩台裝置皆維持登入狀態
```

## Test Cases

- TC-1: 正常登入（happy path）
- TC-2: 錯誤密碼 → 顯示通用錯誤訊息
- TC-3: 不存在的 Email → 相同錯誤訊息（不洩漏存在性）
- TC-4: Email 格式錯誤前端攔截
- TC-5: 同帳號在兩台裝置同時登入皆有效
