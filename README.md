# Task Manager — JavaScript Capstone 2

A debugged, modernized task management app in vanilla JavaScript (ES6 modules). Fixes 49+ intentional errors in the starter code, completes every missing feature, and adds a few professional touches beyond the brief: real form semantics, ARIA support, XSS-safe rendering, and a token-based CSS system.

## Overview

The starter code was ~60% complete: broken scoping, loop and operator bugs, missing OOP features, DOM errors, and two tests. This version has working add/complete/delete/clear-completed flows, localStorage persistence with dedicated test coverage, and 53 passing Jest tests across two files.

## Errors Found (see `issues-identified.md` for the full list)

Covers Variables & Operators (implicit globals, `var`, `==`, assignment-in-conditional), Control Flow (off-by-one loop, infinite `while`, missing recursion base case), Functions & OOP (missing parameter, no validation, missing `super()`, stale `TaskManager.tasks` snapshot), Modern JS (no template literals/destructuring/spread/rest, **no ES6 modules at all**), DOM (wrong selectors, no null checks, unescaped user input), and Testing (no imports, no `beforeEach`, only 2 tests).

## Fixes & Features Implemented

- **Modules:** every file (`utils.js`, `storage.js`, `app.js`, `dom.js`) now uses real `import`/`export`; `index.html` loads a single `<script type="module">`.
- **Core JS:** all `var`/`==`/assignment-in-conditional removed; loops fixed; array + object destructuring; spread (`mergeTasks`) and rest (`createTasks`) operators; a higher-order function (`createTaskFilter`).
- **OOP:** `Task`/`SubTask` with `super()`, `toggleCompletion()`, `id`; `TaskManager` now has a live getter plus `getCompletedTasks`, `getSummary`, `clearCompleted`.
- **DOM/UX:** the add-task section is a real `<form>` with `<label>`s, submits via a `submit` listener (`preventDefault` + native Enter-to-submit), disables its button until a title is entered, and tasks render as a semantic `<ul>`/`<li>` list.
- **Accessibility:** `aria-live` stats region, `aria-pressed` on the complete button, descriptive `aria-label`s on complete/delete buttons naming the task.
- **Security:** task title/description are HTML-escaped (`escapeHTML`) before being inserted via `insertAdjacentHTML`, closing a stored-XSS gap in the original code.
- **Code quality:** removed a duplicate localStorage implementation (`storage.js` is now the single source of truth, and checks `localStorage` availability at call time rather than caching it at import, so it's actually mockable in tests); `styles.css` rewritten from scratch — the original selectors (`#app`, `.task-form`, `.stats`) never matched the markup, so nothing had applied.
- **Design:** an original "editorial minimal" visual identity (Fraunces serif headline, single amber accent, numbered task index, pull-quote stats) replacing the unstyled Bootstrap-blue starter look — CSS/markup only, no functional ids or JS logic changed.
- **Storage:** `JSON.stringify`/`JSON.parse` via `storage.js`, wired to every mutation (add/toggle/delete/clear), with its own test file (`tests/storage.test.js`) using a mocked `localStorage`.

## Running the App

```bash
npm install
npx serve .
```
Open the printed local URL. (ES6 modules require an HTTP server — opening `index.html` directly via `file://` will fail due to browser module CORS restrictions.)

## Running Tests

```bash
npm test
```
**Result: 53 passed, 0 failed** across `tests/app.test.js` (Task/SubTask, all app.js functions including `getFirstAndRestTasks`/`clearCompletedTasks`, recursion edge cases, destructuring/spread/rest, utils.js helpers) and `tests/storage.test.js` (save/load/clear against a mocked `localStorage`, malformed-JSON handling, and the storage-unavailable fallback).

## Screenshots

*To be added before final submission:* app running, console with no errors, `npm test` output, and the task list after adding/completing/deleting a task.

## Reflection

The trickiest bug was `TaskManager.tasks` being assigned once at object creation instead of exposed as a getter — it silently never reflected new tasks. The ES6 module conversion was the largest structural change: it meant untangling which file owns which piece of state (e.g. consolidating the duplicate `storage.js`/`utils.js` localStorage code into one place) rather than just swapping keywords.

---
**Author:** Moloko Chris Poopedi | Capstone 2
