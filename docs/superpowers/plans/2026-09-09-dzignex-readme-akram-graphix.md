# Dzignex Akram Graphix-Style README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the Dzignex repository README as a close, content-specific adaptation of the Akram Graphix README.

**Architecture:** This is a documentation-only change. `README.md` remains a single GitHub-rendered Markdown document using the same centered hero, badges, tables, feature list, visual-language summary, site map, structure, local-preview instructions, CTA, and creator credit as the reference.

**Tech Stack:** GitHub Flavored Markdown, GitHub-supported HTML, Shields.io badges, readme-typing-svg.

## Global Constraints

- Modify `README.md` only during implementation.
- Do not change website code, project pages, images, scripts, styles, hosting, or runtime behavior.
- Preserve Dzignex's public identity, links, `#FF5F57` accent, and factual repository paths.
- Do not add a project gallery, custom banner, or sections that are absent from the Akram Graphix structure.

---

### Task 1: Replace and verify the README

**Files:**
- Modify: `README.md`
- Reference: `docs/superpowers/specs/2026-09-09-dzignex-readme-akram-graphix-design.md`

**Interfaces:**
- Consumes: the existing public Dzignex links and repository file layout.
- Produces: one GitHub-rendered portfolio README with the approved section order.

- [ ] **Step 1: Record the baseline**

Run:

```powershell
git status --short
git diff -- README.md
```

Expected: no unrelated working-tree change overlaps `README.md`.

- [ ] **Step 2: Rewrite `README.md`**

The document must contain these headings in this exact order:

```text
✦ The experience
🎨 Services
⚡ Portfolio features
🎨 Visual language
🧭 Site map
📁 Project structure
🚀 Run locally
🔗 Explore the portfolio
👤 Creator
```

The hero must use `DZIGNEX`, the `#FF5F57` accent, and links to the live site, repository, Behance, and Instagram. The four creative cards must be `Art direction`, `Brand identity`, `Packaging design`, and `Digital craft`. The `Selected work` section must not remain.

- [ ] **Step 3: Validate the document structure**

Run:

```powershell
$readme = Get-Content -Raw README.md
$required = @('## ✦ The experience','## 🎨 Services','## ⚡ Portfolio features','## 🎨 Visual language','## 🧭 Site map','## 📁 Project structure','## 🚀 Run locally','## 🔗 Explore the portfolio','## 👤 Creator')
$missing = $required | Where-Object { -not $readme.Contains($_) }
$forbidden = $readme.Contains('## 🗂 Selected work')
[pscustomobject]@{ MissingHeadings = $missing.Count; HasSelectedWork = $forbidden; OpenDivs = ([regex]::Matches($readme,'<div\b').Count); CloseDivs = ([regex]::Matches($readme,'</div>').Count); OpenTables = ([regex]::Matches($readme,'<table\b').Count); CloseTables = ([regex]::Matches($readme,'</table>').Count) }
git diff --check
```

Expected: `MissingHeadings` is `0`, `HasSelectedWork` is `False`, opening and closing tag counts match, and `git diff --check` prints no errors.

- [ ] **Step 4: Review scope and scan secrets**

Run:

```powershell
git status --short
git diff --stat
git diff -- README.md
gitleaks detect --source . --no-banner --redact
```

Expected: only `README.md` changes during implementation and Gitleaks reports no leaks.

- [ ] **Step 5: Commit and push**

Run:

```powershell
git add README.md docs/superpowers/plans/2026-09-09-dzignex-readme-akram-graphix.md
git diff --cached --check
git diff --cached
git commit -m "docs: align Dzignex README with Akram Graphix"
git push origin main
```

Expected: the commit succeeds and `origin/main` advances to the new commit.
