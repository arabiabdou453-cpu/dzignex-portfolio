# macOS Window Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add functional macOS-style controls to every existing desktop portfolio window without altering the approved site design or mobile version.

**Architecture:** Replace the competing inline control experiments with one stylesheet and one script. The script decorates only the original colored dots inside known Framer window roots and observes later-mounted windows.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Framer-generated DOM

**Spec:** `docs/superpowers/specs/2026-08-24-macos-window-controls-design.md`

## Global Constraints

- Desktop only: `min-width: 810px`.
- Reuse original dots; create no visual duplicates.
- Preserve mobile, toast, links, images, content, and responsive layout.
- Keep the checkpoint commit `ae8a38a` recoverable.

---

### Task 1: Single native-control implementation

**Files:**
- Modify: `mac-window-controls.css`
- Modify: `mac-window-controls.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: existing Framer window containers and dot colors.
- Produces: `.dzignex-mac-control-group`, `.dzignex-window--minimized`, `.dzignex-window--fullscreen`, and `.dzignex-window-is-closed` behavior.

- [ ] **Step 1: Record failing structural checks**

Verify the current HTML still contains duplicate hit-area constructors and lacks the external control assets.

- [ ] **Step 2: Run the checks and confirm failure**

Run targeted `rg` checks for `dzignex-mac-hitbar` and `mac-window-controls.js`.

- [ ] **Step 3: Implement the minimal desktop-only behavior**

Replace duplicate inline control code with one external CSS/JS implementation that discovers and wires exactly three original dots per known window.

- [ ] **Step 4: Verify syntax and structure**

Run `node --check mac-window-controls.js`; verify one CSS link, one script link, zero duplicate hitbar constructors, and unchanged mobile rules.

- [ ] **Step 5: Browser-check interactions**

Open the local desktop site, trigger About, Notes, and project windows, then verify hover symbols, close, minimize/restore, fullscreen/restore, links, toast, and unchanged mobile rendering.

### Task 2: macOS hover visibility and responsiveness

**Files:**
- Modify: `mac-window-controls.css`
- Modify: `mac-window-controls.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: the existing `.dzignex-mac-control-group` and three original controls.
- Produces: a 6px group hover zone, 3px click tolerance, and strong centered `× − +` symbols.

- [ ] **Step 1: Run a focused source check that fails until the approved constants and group pointer tracking exist.**
- [ ] **Step 2: Replace per-dot enter/leave handlers with one nearby-group pointer calculation.**
- [ ] **Step 3: Increase symbol contrast and weight without changing dot dimensions.**
- [ ] **Step 4: Run JavaScript syntax, CSS structure, source invariants, localhost resource, and mobile-isolation checks.**
- [ ] **Step 5: Open a cache-busted localhost URL for desktop review.**
