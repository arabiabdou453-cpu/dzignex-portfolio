# Dzignex README Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic README with a premium, accurate portfolio presentation that carries the macOS-inspired visual identity of the live Dzignex website.

**Architecture:** Keep the repository documentation self-contained with one local SVG hero and one rewritten Markdown file. The SVG supplies the website's interface language; the README supplies the biography, practice areas, verified work, technical overview, local preview steps, and contact paths.

**Tech Stack:** GitHub-flavored Markdown, safe static SVG, HTML presentation tags supported by GitHub, Git, Gitleaks.

## Global Constraints

- Modify only `README.md`, `docs/assets/dzignex-readme-hero.svg`, and this implementation plan.
- Do not modify the website, project pages, images, deployment settings, or runtime code.
- Use only repository-backed or previously verified facts.
- Preserve all six existing project names and production routes exactly.
- Add no dependency, build step, remote screenshot, generated statistic, testimonial, award, or client metric.
- Keep the README useful even if remote badge images are unavailable.

---

### Task 1: Create the Dzignex interface hero

**Files:**
- Create: `docs/assets/dzignex-readme-hero.svg`

**Interfaces:**
- Consumes: the visual direction in `docs/superpowers/specs/2026-09-07-dzignex-readme-redesign.md`.
- Produces: a local `1440 × 640` SVG referenced by `README.md` as `./docs/assets/dzignex-readme-hero.svg`.

- [x] **Step 1: Confirm the asset does not exist**

Run: `Test-Path docs/assets/dzignex-readme-hero.svg`

Expected: `False`.

- [x] **Step 2: Create the complete static SVG**

Create a `1440 × 640` SVG with a near-black background, a rounded desktop window, three macOS controls, a compact sidebar, the Dzignex wordmark, the line `IDEAS, MADE VISIBLE.`, the four practice areas, and all six project labels. Use no scripts, foreign objects, external URLs, or embedded data.

- [x] **Step 3: Validate XML and safety invariants**

Run:

```powershell
[xml](Get-Content -Raw docs/assets/dzignex-readme-hero.svg) | Out-Null
$svg = Get-Content -Raw docs/assets/dzignex-readme-hero.svg
if ($svg -match '<script|foreignObject|(?:href|src)=["''](?:https?:|data:)') { throw 'Unsafe or remote SVG content found' }
```

Expected: exit code `0` and no output.

### Task 2: Replace the generic README

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: `./docs/assets/dzignex-readme-hero.svg`, the six production project routes, and the existing local server command.
- Produces: the public GitHub presentation for Dzignex.

- [x] **Step 1: Replace the document with the approved hierarchy**

Write these sections in this order:

```text
hero and primary links
01 — About the designer
02 — Creative practice
03 — Selected work
04 — Built as an interface
05 — Under the interface
06 — Open it locally
07 — Repository map
contact CTA and authorship footer
```

The biography must identify Mohamed Elamine Chaib, known as Amine, as an Algerian Senior Creative Designer and Co-Founder / Creative Director of Dzignex Studio. The practice grid must cover brand systems, art direction, packaging, and digital experiences. The selected-work section must link Menotopia, Auravita, Dermology, Formura Labs, Maison Noua, and Ops First to their exact live routes.

- [x] **Step 2: Validate local references and required content**

Run:

```powershell
$readme = Get-Content -Raw README.md
$required = @(
  './docs/assets/dzignex-readme-hero.svg',
  'https://dzignex.me/works/menotopia',
  'https://dzignex.me/works/auravita',
  'https://dzignex.me/works/champ-dermology',
  'https://dzignex.me/works/formura-labs',
  'https://dzignex.me/works/noua',
  'https://dzignex.me/works/ops-first',
  'node tools/static-server.mjs . 3200'
)
foreach ($item in $required) {
  if (-not $readme.Contains($item)) { throw "Missing required README content: $item" }
}
if (-not (Test-Path docs/assets/dzignex-readme-hero.svg)) { throw 'Missing local README hero' }
```

Expected: exit code `0` and no output.

- [x] **Step 3: Confirm no runtime files changed**

Run: `git status --short`

Expected: only `README.md`, `docs/assets/dzignex-readme-hero.svg`, and this plan are changed or untracked.

### Task 3: Review, verify, commit, and publish

**Files:**
- Review: `README.md`
- Review: `docs/assets/dzignex-readme-hero.svg`
- Review: `docs/superpowers/plans/2026-09-08-dzignex-readme-redesign.md`

**Interfaces:**
- Consumes: completed documentation changes from Tasks 1 and 2.
- Produces: a verified commit on `main` and the same commit on `origin/main`.

- [x] **Step 1: Review the actual diff**

Run:

```powershell
git status --short
git diff --check
git diff -- README.md docs/assets/dzignex-readme-hero.svg docs/superpowers/plans/2026-09-08-dzignex-readme-redesign.md
```

Expected: no whitespace errors, no unrelated files, no secrets, and no website/runtime changes.

- [x] **Step 2: Verify public links**

Run an HTTP request against the live homepage and each of the six case-study URLs. Require status `200` for every URL.

- [x] **Step 3: Run the secret scan**

Run: `gitleaks detect --source . --no-banner --redact --exit-code 1`

Expected: `no leaks found` and exit code `0`.

- [x] **Step 4: Commit the scoped changes**

Run:

```powershell
git add README.md docs/assets/dzignex-readme-hero.svg docs/superpowers/plans/2026-09-08-dzignex-readme-redesign.md
git diff --cached --check
git diff --cached --stat
git commit -m "Redesign Dzignex portfolio README"
```

Expected: one commit containing only the three planned files.

- [x] **Step 5: Push and verify the remote commit**

Run:

```powershell
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Expected: the local `HEAD` and remote `refs/heads/main` hashes match.
