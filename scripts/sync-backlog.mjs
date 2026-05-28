#!/usr/bin/env node
// 把 .docs/story/<journey>/S0X-*.md 同步成 GitHub Issues。
// Append-only：已填入 issue 號的 Story 不再更新；只建立新的 issue。
//
// 環境變數：
//   GITHUB_REPOSITORY  "owner/repo"
//   GITHUB_TOKEN       具 issues:write 權限

import fs from 'node:fs/promises';
import path from 'node:path';

const REPO = process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN;
const STORY_ROOT = '.docs/story';

if (!REPO || !TOKEN) {
  console.error('missing GITHUB_REPOSITORY or GITHUB_TOKEN');
  process.exit(1);
}

// ---- GitHub API ----

async function api(method, p, body) {
  const res = await fetch(`https://api.github.com${p}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${p} → ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

async function ensureLabel(name, color) {
  try {
    await api('POST', `/repos/${REPO}/labels`, { name, color });
    console.log(`  + label ${name}`);
  } catch (e) {
    if (!String(e).includes('already_exists')) throw e;
  }
}

async function createIssue({ title, body, labels }) {
  return api('POST', `/repos/${REPO}/issues`, { title, body, labels });
}

async function addSubIssue(parentNum, subId) {
  // GitHub Sub-issues API（public preview）
  return api('POST', `/repos/${REPO}/issues/${parentNum}/sub_issues`, {
    sub_issue_id: subId,
  });
}

// ---- Markdown parsing ----

function parseStory(raw) {
  const lines = raw.split('\n');
  const h1 = lines[0].match(/^#\s+(S\d+):\s+(.+?)\s*<!--\s*(#?\d+)?\s*-->\s*$/);
  if (!h1) return null;

  const [, storyId, title, parentRaw] = h1;
  const get = (re) => {
    const m = raw.match(re);
    return m ? m[1].trim() : null;
  };

  const journey = get(/^\*\*Journey\*\*:\s*(.+)$/m);
  const labelsRaw = get(/^\*\*Labels\*\*:\s*(.+)$/m) ?? '';
  const depsRaw = get(/^\*\*Story Dependencies\*\*:\s*(.+)$/m) ?? '無';

  const sub = (role) => {
    const m = raw.match(
      new RegExp(`^- \\[ \\] ${role}:\\s*(.+?)\\s*<!--\\s*(#?\\d+)?\\s*-->\\s*$`, 'm')
    );
    if (!m) return null;
    return { task: m[1], issue: m[2] ? Number(m[2].replace('#', '')) : null };
  };

  return {
    storyId,
    title,
    parentIssue: parentRaw ? Number(parentRaw.replace('#', '')) : null,
    journey,
    labels: labelsRaw.split(',').map((s) => s.trim()).filter(Boolean),
    deps: depsRaw === '無' ? [] : depsRaw.split(',').map((s) => s.trim()),
    fe: sub('FE'),
    be: sub('BE'),
  };
}

// 把 markdown body（含 H1 之外的全部內容）改寫成 issue body：
// - 解析 Story Dependencies 中的 ID（S01 或 <journey>/S01），轉成 #N
async function readStories() {
  const journeys = await fs.readdir(STORY_ROOT, { withFileTypes: true });
  const stories = [];
  for (const j of journeys) {
    if (!j.isDirectory()) continue;
    const files = (await fs.readdir(path.join(STORY_ROOT, j.name)))
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .sort();
    for (const f of files) {
      const fp = path.join(STORY_ROOT, j.name, f);
      const content = await fs.readFile(fp, 'utf8');
      const parsed = parseStory(content);
      if (!parsed) {
        console.warn(`skip (cannot parse): ${fp}`);
        continue;
      }
      stories.push({ ...parsed, journeyDir: j.name, path: fp, content });
    }
  }
  return stories;
}

function buildIndex(stories) {
  // key = "<journeyDir>/<storyId>" → parentIssue
  const idx = {};
  for (const s of stories) {
    if (s.parentIssue) idx[`${s.journeyDir}/${s.storyId}`] = s.parentIssue;
  }
  return idx;
}

function renderDeps(deps, journeyDir, idx) {
  if (!deps.length) return '無';
  return deps
    .map((d) => {
      const key = d.includes('/') ? d : `${journeyDir}/${d}`;
      const num = idx[key];
      return num ? `${d} (#${num})` : `${d} (待同步)`;
    })
    .join(', ');
}

function renderParentBody(story, idx) {
  const lines = story.content.split('\n');
  // 移除 H1
  let body = lines.slice(1).join('\n');
  // 把 Story Dependencies 行替換為解析後的版本（轉成 #N）
  body = body.replace(
    /^\*\*Story Dependencies\*\*:.*$/m,
    `**Story Dependencies**: ${renderDeps(story.deps, story.journeyDir, idx)}`
  );
  return body.trim();
}

function renderSubBody(parentNum, role, task) {
  return [
    `Parent: #${parentNum}`,
    '',
    `**Role**: ${role}`,
    `**Task**: ${task}`,
    '',
    '完整規格、AC、Test Cases 請見 parent issue。',
    '',
    '_由 sync-backlog 自動建立_',
  ].join('\n');
}

// ---- Write-back issue numbers into the markdown ----

function writeBackIssueNums(raw, parentNum, feNum, beNum) {
  let out = raw;
  // `[ \t]*$`（而非 `\s*$`）才不會吃掉行尾的換行 → 不破壞段落間空白行
  out = out.replace(
    /^(#\s+S\d+:\s+.+?)[ \t]*<!--[ \t]*-->[ \t]*$/m,
    `$1 <!-- #${parentNum} -->`
  );
  out = out.replace(
    /^(- \[ \] FE:\s*.+?)[ \t]*<!--[ \t]*-->[ \t]*$/m,
    `$1 <!-- #${feNum} -->`
  );
  out = out.replace(
    /^(- \[ \] BE:\s*.+?)[ \t]*<!--[ \t]*-->[ \t]*$/m,
    `$1 <!-- #${beNum} -->`
  );
  return out;
}

// ---- Main ----

async function main() {
  const stories = await readStories();
  const idx = buildIndex(stories);

  // 確認系統 label 都存在
  const journeyLabels = new Set(stories.map((s) => `journey:${s.journeyDir}`));
  const allLabels = [
    ['story', '1f6feb'],
    ['frontend', '0e8a16'],
    ['backend', '5319e7'],
    ['backlog', 'ededed'],
    ['needs-triage', 'fbca04'],
    ...[...journeyLabels].map((l) => [l, 'd4c5f9']),
  ];
  console.log('ensuring labels...');
  for (const [name, color] of allLabels) await ensureLabel(name, color);

  // 處理每個尚未同步的 Story
  for (const s of stories) {
    if (s.parentIssue) {
      console.log(`skip (already synced): ${s.journeyDir}/${s.storyId} #${s.parentIssue}`);
      continue;
    }
    if (!s.fe || !s.be) {
      console.warn(`skip (missing FE/BE sub-task): ${s.path}`);
      continue;
    }

    console.log(`creating: ${s.journeyDir}/${s.storyId} ${s.title}`);

    const baseLabels = [
      'story',
      'backlog',
      'needs-triage',
      `journey:${s.journeyDir}`,
      ...s.labels,
    ];

    const parent = await createIssue({
      title: `[${s.journeyDir}][${s.storyId}] ${s.title}`,
      body: renderParentBody(s, idx),
      labels: baseLabels,
    });
    console.log(`  parent: #${parent.number}`);

    const fe = await createIssue({
      title: `[${s.journeyDir}][${s.storyId}][FE] ${s.fe.task}`,
      body: renderSubBody(parent.number, 'Frontend', s.fe.task),
      labels: ['frontend', 'backlog', `journey:${s.journeyDir}`],
    });
    console.log(`  FE: #${fe.number}`);

    const be = await createIssue({
      title: `[${s.journeyDir}][${s.storyId}][BE] ${s.be.task}`,
      body: renderSubBody(parent.number, 'Backend', s.be.task),
      labels: ['backend', 'backlog', `journey:${s.journeyDir}`],
    });
    console.log(`  BE: #${be.number}`);

    // 掛上 sub-issue 關聯
    try {
      await addSubIssue(parent.number, fe.id);
      await addSubIssue(parent.number, be.id);
      console.log('  sub-issues linked');
    } catch (e) {
      console.warn(`  sub-issue link failed (API may be unavailable): ${e.message}`);
    }

    // 寫回 issue 號
    const updated = writeBackIssueNums(s.content, parent.number, fe.number, be.number);
    await fs.writeFile(s.path, updated, 'utf8');
    idx[`${s.journeyDir}/${s.storyId}`] = parent.number;
    console.log(`  written back: ${s.path}`);
  }

  console.log('done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
