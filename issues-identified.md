# Issues Identification Document
**Capstone 2 — Task Manager Debug Assessment**
**Author:** Moloko Chris Poopedi

## 1. Variables & Operators (8 errors)

- In app.js, `taskList = []` declared without `let`/`const`/`var` — creates an implicit global |
- In app.js, `var taskCounter = 0` — uses `var` with function-scoped hoisting; counter mutates so `let` is correct
- In app.js, `if (taskList[i].id = taskId)` assigns instead of comparing, always evaluates truthy |
- In app.js, `taskList[i].title == title` uses `==` instead of strict equality
- In utils.js, `task.priority == "high"` and returns string `"yes"`/`"no"` instead of boolean |
- `var` used in every function body (newTask, i, merged, total, highPriority, etc.) |
- No `typeof` checks — functions like `updateTaskPriority` and `addTask` accept any input without type validation | Add `typeof` guards in at least 3 functions |
- `Math.random()` returns a decimal, not a usable integer ID | Use `Math.floor(Math.random() * 1000000)` or `Date.now()` |

---

## 2. Control Flow (7 errors)

- Off-by-one loop error — `i <= taskList.length` accesses index equal to length, causing `undefined` on last iteration | Change to `i < taskList.length` |
- Infinite while loop — `i++` is missing inside the while body, so the index never advances | Add `i++` at the end of the while loop body |
- Should use `for...of` — `displayAllTasks` uses an index-based `for` loop where `for...of` is more idiomatic | Rewrite as `for (const task of taskList)` |
- Recursive function missing base case — `countCompletedTasks` calls itself without checking if `index` has reached the end, causing RangeError | Add `if (index >= tasks.length) return 0;` as the first line |
- No null/undefined guard in recursion — if `tasks` is null or empty the function throws immediately | Add `if (!tasks \|\| tasks.length === 0) return 0;` |
- Wrong initialisation timing — `setupEventListeners()` called at top level before DOM is ready | Wrap in `document.addEventListener("DOMContentLoaded", setupEventListeners)` |
- Empty array not handled — `calculateAveragePriority` divides by `taskList.length` without checking for zero, returning `NaN` | Return early with `0` or `null` if array is empty |

---

## 3. Functions & Functional Programming (10 errors)

- Missing parameter — `findTaskByTitle()` references `title` internally but declares no parameter, causing ReferenceError | Add `title` as a function parameter |
- No input validation on `addTask` — empty strings or non-string titles accepted silently | Add guards: `if (!title \|\| typeof title !== "string") throw new Error(...)` |
- No validation in `updateTaskPriority` — parameters not checked for type or presence before use | Validate both `taskId` and `newPriority` before the loop |
- Destructuring not used — `getTaskDetails` manually extracts each property with four separate `var` assignments | Replace with `const { title, description, priority, completed } = task;` |
- Spread operator not used — `mergeTasks` manually copies two arrays with nested `for` loops | Replace with `return [...list1, ...list2];` |
- No array methods — `getHighPriorityTasks` uses a `for` loop and manual push instead of `Array.filter` | Replace with `return taskList.filter(t => t.priority > minPriority);` |
- `calculateAveragePriority` not using `reduce` — imperative accumulation; also missing `Math.round` | Use `taskList.reduce(...)` and wrap result in `Math.round()` |
- `TaskManager` missing methods — only `getTotalTasks` exists; no functional add, filter, or reduce methods | Add `addTask`, `getCompletedTasks`, and `getSummary` methods using array methods |
- No higher-order functions — codebase has no example of a function accepting or returning another function | Implement at least one HOF, e.g. `createTaskFilter(predicate)` |
- No try-catch blocks — no error handling anywhere; exceptions will crash the app silently | Wrap `addTask`, `updateTaskPriority`, and storage functions in `try/catch` |

---

## 4. OOP & Classes (6 errors)

- `Task` class missing `id` property — no unique identifier set in constructor, breaking `updateTaskPriority` matching | Add `this.id = generateRandomId();` in the constructor |
- Missing `toggleCompletion` method — the Task class has no way to flip completion state | Add `toggleCompletion() { this.completed = !this.completed; }` |
- String concatenation in `getInfo` — uses `"Task: " + this.title + ...` instead of a template literal | Rewrite as `` `Task: ${this.title} - Priority: ${this.priority}` `` |
- Missing `super()` in SubTask constructor — extends `Task` but calls no `super()`, throwing ReferenceError on `this` | Add `super(title, description, priority);` as the first line |
- SubTask constructor missing parameters — signature only has `parentTask`; needs `title`, `description`, `priority` too | Add `title, description, priority` to SubTask constructor parameters |
- `TaskManager.tasks` is a snapshot — assigned as `tasks: taskList` at object creation; won't reflect later pushes | Use a getter: `get tasks() { return taskList; }` or manage tasks internally |

---

## 5. Modern JavaScript / ES6+ (6 errors)

- No template literals — string concatenation used throughout instead of backtick template literals | Replace all `"..." + var + "..."` patterns with `` `...${var}...` `` |
- No object destructuring — `getTaskDetails` uses verbose manual property extraction | Use `const { title, description, priority, completed } = task;` |
- No spread operator — `mergeTasks` copies arrays with manual loops | Use `return [...list1, ...list2];` |
- No rest parameters — no function uses rest syntax despite opportunities (e.g. bulk task creation) | Add a function like `function createTasks(...taskDataArray)` |
- No ES6 module exports — comment acknowledges this but no exports exist | Add `export { Task, SubTask, addTask, TaskManager, ... }` at file end |
- Scripts in wrong order and not modules — `dom.js` loaded before `app.js`; neither uses `type="module"` | Swap order, add `type="module"`, and add missing priority input to the form |

---

## 6. DOM & Event Handling (8 errors)

- Wrong selector for button — `getElementById(".add-task-btn")` passes a class selector to an ID method; returns null | Use `document.querySelector(".add-task-btn")` |
- Missing `#` in querySelector — `querySelector("task-input")` looks for a `<task-input>` element, not an ID | Change to `querySelector("#task-input")` |
- No null check before `addEventListener` — if either selector fails, calling `.addEventListener` on null throws | Add `if (addButton)` guard before attaching the listener |
- No priority input handled — `handleAddTask` always passes `1` as priority with no field in the HTML | Add a `<select id="priority">` to HTML and read it in `handleAddTask` |
- Inputs not cleared after adding task — title and description fields retain their values | Set `titleInput.value = ""` and `descInput.value = ""` after calling `addTask` |
- `displayTasks` doesn't clear container — each call appends more divs, duplicating the list | Add `container.innerHTML = ""` before the loop |
- String concatenation in DOM innerHTML — multiple `div.innerHTML = div.innerHTML + "..."` is unsafe and inefficient | Build markup with template literals and use `insertAdjacentHTML` or set once |
- localStorage not using JSON — `saveToStorage` stores raw object references; `loadFromStorage` returns unparsed string | Use `JSON.stringify` on save and `JSON.parse` on load |

---

## 7. Testing / app.test.js (4 errors)

- Missing imports — no `require` or `import` statements; `Task`, `addTask` etc. are undefined in tests | Add `const { Task, addTask, ... } = require("./app");` at the top |
- No `beforeEach` to reset state — `taskList` accumulates across tests causing order-dependent failures | Add `beforeEach(() => { taskList.length = 0; taskCounter = 0; })` |
- Only 2 tests written; 10+ required — SubTask, `findTaskByTitle`, `updateTaskPriority`, recursion, edge cases all untested | Add test suites for all functions with at least 3 edge-case tests |
- No Babel config for ES6 modules — Jest cannot parse `import`/`export` without a transform; tests will fail to run | Install `@babel/preset-env` and add `babel.config.js`, or use CommonJS exports |

---

## Summary

- Variables & Operators | 8 |
- Control Flow | 7 |
- Functions & Functional Programming | 10 |
- OOP & Classes | 6 |
- Modern JavaScript / ES6+ | 6 |
- DOM & Event Handling | 8 |
- Testing | 4 |

---

*Moloko Chris Poopedi*
