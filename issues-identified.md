# Issues Identification Document
**Capstone 2 — Task Manager Debug Assessment** | Moloko Chris Poopedi

## Variables & Operators
- `taskList`/`taskCounter` declared without `let`/`const` (implicit global, function-scoped `var`).
- `if (taskList[i].id = taskId)` — assignment instead of comparison, always truthy.
- Loose `==` used for title comparison and priority checks instead of `===`.
- No `typeof` guards on `addTask`/`updateTaskPriority` parameters.
- `Math.random()` used directly as an ID with no integer conversion.

## Control Flow
- Off-by-one: `i <= taskList.length` reads past the last index.
- Infinite `while` loop: missing `i++`.
- Index-based `for` loop used where `for...of` reads more naturally.
- Recursive `countCompletedTasks` had no base case → `RangeError`.
- `setupEventListeners()` ran before the DOM was ready.

## Functions & Functional Programming
- `findTaskByTitle()` referenced `title` but declared no parameter.
- No input validation on `addTask`/`updateTaskPriority`.
- `getTaskDetails` manually copied four properties instead of destructuring.
- `mergeTasks` used nested loops instead of the spread operator.
- `getHighPriorityTasks`/`calculateAveragePriority` used manual loops instead of `.filter()`/`.reduce()`.
- No higher-order function or rest-parameter example anywhere.
- No try/catch around operations that can throw.

## OOP & Classes
- `Task` missing `id` property and `toggleCompletion()` method.
- `SubTask` extended `Task` without calling `super()`.
- `getInfo()` used string concatenation instead of a template literal.
- `TaskManager.tasks` was a static snapshot, not a live getter — never reflected new tasks.

## Modern JavaScript / ES6+
- No template literals anywhere (string concatenation throughout).
- No destructuring (object or array), spread, or rest usage.
- No ES6 modules: every file used `module.exports`, `index.html` loaded scripts as classic `<script>` tags, and there wasn't a single `import`/`export` statement.

## DOM & Event Handling
- `getElementById(".add-task-btn")` mixed an ID method with a class selector.
- `querySelector("task-input")` was missing its `#`.
- No null checks before calling `.addEventListener`.
- `displayTasks` appended without clearing, duplicating the list on every render.
- `saveToStorage`/`loadFromStorage` didn't call `JSON.stringify`/`JSON.parse`.
- User-entered text was inserted into `innerHTML` unescaped (stored-XSS risk).

## Testing
- No imports — `Task`, `addTask`, etc. were undefined in the test file.
- No `beforeEach` to reset `taskList`, so tests were order-dependent.
- Only 2 tests existed against a 10+ requirement; no edge cases, no inheritance test.

## Code Quality
- `src/storage.js` duplicated `saveToStorage`/`loadFromStorage` already in `utils.js`, and was never imported anywhere — dead code.
- `styles.css` selectors (`#app`, `.task-form`, `.stats`) didn't match the actual HTML, so most rules never applied.
