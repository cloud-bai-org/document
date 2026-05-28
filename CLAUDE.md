<!-- SPECTRA:START v1.0.2 -->

# Spectra Instructions

This project uses Spectra for Spec-Driven Development(SDD). Specs live in `openspec/specs/`, change proposals in `openspec/changes/`.

## Use `/spectra-*` skills when:

- A discussion needs structure before coding → `/spectra-discuss`
- User wants to plan, propose, or design a change → `/spectra-propose`
- Tasks are ready to implement → `/spectra-apply`
- There's an in-progress change to continue → `/spectra-ingest`
- User asks about specs or how something works → `/spectra-ask`
- Implementation is done → `/spectra-archive`
- Commit only files related to a specific change → `/spectra-commit`

## Workflow

discuss? → propose → apply ⇄ ingest → archive

- `discuss` is optional — skip if requirements are clear
- Requirements change mid-work? Plan mode → `ingest` → resume `apply`

## Parked Changes

Changes can be parked（暫存）— temporarily moved out of `openspec/changes/`. Parked changes won't appear in `spectra list` but can be found with `spectra list --parked`. To restore: `spectra unpark <name>`. The `/spectra-apply` and `/spectra-ingest` skills handle parked changes automatically.

<!-- SPECTRA:END -->

# 專案性質

本專案為**純文件專案**，僅用於撰寫產品文件、規格、使用者旅程等，**不包含任何產品程式碼**。請勿建立產品程式碼檔案、執行建置或測試指令。

**例外**：`.github/workflows/` 與 `scripts/` 下的檔案為文件同步工具（如把 Story 同步成 GitHub Issues），不在此限制內。

# 文件結構規範

- PRD 位於 `.docs/prd/`，僅保留產品層級內容（願景、問題、價值主張、範圍、指標、Non-Goals、詞彙表）。**不要在 PRD 中直接撰寫使用者旅程**。
- 使用者旅程位於 `.docs/journeys/`，一個旅程一個檔案，命名格式為 `<NN>-<kebab-case>.md`（如 `01-onboarding.md`、`02-daily-check-in.md`），編號用於排序。
- 新增、刪除或重新命名旅程檔案時，必須同步：
  1. 更新 `.docs/index.md` 的「使用者旅程」清單
  2. 確認 `.docs/prd/cloud-bai.md` 的「相關文件」章節仍指向 `.docs/journeys/`（資料夾連結即可，不需逐一列出旅程）

# Backlog / Story 規範

每個 journey 文件末尾可附 `## Backlog` 章節，列出**連結**到該旅程的 Story 檔案。每張 Story 為**獨立檔案**，置於 `.docs/story/<journey>/S0X-<slug>.md`。Story 會由 workflow 自動同步成 GitHub Issues（再經 Linear 官方整合同步至 Linear）。

## 目錄結構

- `.docs/journeys/<NN>-<journey>.md`：旅程本體（不含 Story 內容，只在 Backlog 章節放連結）
- `.docs/story/<NN>-<journey>/S0X-<slug>.md`：單張 Story 檔（一個 Story 一個檔案）。資料夾名稱**必須與 journey 檔名一致**（含編號）
- `.docs/template/journey.md`：旅程模板
- `.docs/template/story.md`：Story 模板

## Story 檔結構

每個 Story 檔以 `# S0X: 標題 <!-- #issue號 -->` 為 H1，必須包含：

- **Journey**：所屬 journey 名稱
- **Labels**：補充自訂 label（如 `priority:high`），workflow 會自動補上 `type`、`journey:xxx` 等系統 label
- **Story Dependencies**：依賴的 Story ID。同 journey 直接寫 `S01`；跨 journey 寫 `<journey>/S0X`
- **Sub-tasks**：固定兩項 `FE:` 和 `BE:`，各自帶 `<!-- #號 -->`
- `## UX 操作流程`
- `## UI 元件規格（Frontend）`
- `## 後端職責（Backend）`
- `## Acceptance Criteria`
- `## Test Cases`

## 撰寫原則

- **Story ID 每個 journey 內部編號**（`S01`、`S02`...），不跨 journey 連續
- **不訂資料規格**：Story 中不寫具體 API endpoint、request/response payload、欄位名稱、HTTP code、資料庫 schema。「後端職責」只描述行為層責任（如「驗證帳密」「建立 session」），實作細節留給工程師決定
- **AC 用 Gherkin 格式**：以 `Scenario:` 開頭，使用 `Given / When / Then / And` 描述。一個情境一個 Scenario，避免一條 AC 塞多個條件
- **AC vs TC 區分**：AC 寫使用者觀察得到的行為（Gherkin）；TC 寫測試怎麼跑（自由格式條列）
- **`<!-- -->` 是 issue 號占位**：首次同步後由 workflow 寫回，請勿手動填寫
- **「待釐清」項目不放進 Backlog**：策略未定的議題留在 journey 的「待釐清」章節，討論清楚後再轉成 Story
- **Story 為 append-only**：一旦 Story 已填入 issue 號（`<!-- #12 -->` 非空），內容視為與 GitHub Issue 凍結的合約，**不再修改**。需求變更請**新增 Story 檔案**（S05, S06...），舊 Story 保留。workflow 只建立新 issue，不更新既有 issue body
- **新增 Story 時**：從 `.docs/template/story.md` 複製為 `.docs/story/<NN>-<journey>/S0X-<slug>.md`，並在對應 journey 檔的 `## Backlog` 章節加上連結
