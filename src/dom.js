// dom.js — the only file that touches the document. Wires up the UI,
// delegates events, and keeps the DOM in sync with TaskManager + storage.

import {
  TaskManager,
  addTask,
  addSubtask,
  findTaskByTitle,
  cycleTaskPriority,
  createTasks,
  getTaskDetails,
} from "./app.js";
import { saveToStorage, loadFromStorage, clearStorage } from "./storage.js";
import { getPriorityLabel, escapeHTML, validateTasksArray, formatTaskName, isHighPriority } from "./utils.js";

// Whether the "high priority only" filter is currently on. UI-only state;
// doesn't belong in app.js since it's a display concern, not domain data.
let highPriorityFilterOn = false;

/**
 * Wire up every interactive element. Called once on DOMContentLoaded.
 */
function setupEventListeners() {
  const taskForm = document.querySelector("#task-form");
  const titleInput = document.querySelector("#title");
  const taskContainer = document.querySelector("#task-list");
  const clearCompletedBtn = document.querySelector("#clear-completed-btn");
  const restoreBtn = document.querySelector("#restore-archived-btn");
  const priorityFilterToggle = document.querySelector("#priority-filter-toggle");
  const findForm = document.querySelector("#find-form");
  const importBtn = document.querySelector("#import-btn");
  const importInput = document.querySelector("#import-input");
  const clearAllBtn = document.querySelector("#clear-all-btn");

  if (taskForm) taskForm.addEventListener("submit", handleAddTask);
  if (titleInput) titleInput.addEventListener("input", handleTitleInput);
  if (taskContainer) taskContainer.addEventListener("click", handleTaskClick);
  if (clearCompletedBtn) clearCompletedBtn.addEventListener("click", handleClearCompleted);
  if (restoreBtn) restoreBtn.addEventListener("click", handleRestoreArchived);
  if (priorityFilterToggle) priorityFilterToggle.addEventListener("change", handlePriorityFilterToggle);
  if (findForm) findForm.addEventListener("submit", handleFindTask);

  // The visible "Import Tasks" button just proxies a click to the hidden
  // native file input, which is the actual file picker.
  if (importBtn && importInput) {
    importBtn.addEventListener("click", () => importInput.click());
    importInput.addEventListener("change", handleImportFile);
  }

  if (clearAllBtn) clearAllBtn.addEventListener("click", handleClearAllData);

  loadTasksFromStorage();
  populateParentTaskOptions();
  displayTasks();
  updateStats();
  updateUpNext();
  updateRestoreButtonVisibility();
}

/**
 * Handle the add-task form submission. If a parent task is selected in
 * #parent-task, creates a SubTask via addSubtask instead of a plain Task.
 * @param {SubmitEvent} event
 */
function handleAddTask(event) {
  event.preventDefault();

  const titleInput = document.querySelector("#title");
  const descInput = document.querySelector("#description");
  const priorityInput = document.querySelector("#priority");
  const parentSelect = document.querySelector("#parent-task");
  if (!titleInput || !descInput || !priorityInput) return;

  const title = formatTaskName(titleInput.value);
  const description = descInput.value.trim();
  const priority = parseInt(priorityInput.value, 10);
  const parentId = parentSelect && parentSelect.value ? parseInt(parentSelect.value, 10) : null;

  if (!title) {
    titleInput.setAttribute("aria-invalid", "true");
    titleInput.focus();
    return;
  }

  const newTask = parentId
    ? addSubtask(title, description, priority, parentId)
    : addTask(title, description, priority);
  if (!newTask) return;

  displayTasks();
  populateParentTaskOptions();
  saveToStorage(TaskManager.tasks);
  updateStats();
  updateUpNext();

  titleInput.value = "";
  descInput.value = "";
  priorityInput.value = "1";
  if (parentSelect) parentSelect.value = "";
  titleInput.removeAttribute("aria-invalid");
  titleInput.focus();
}

/**
 * Toggle the submit button's disabled state as the user types.
 * @param {Event} event
 */
function handleTitleInput(event) {
  const submitBtn = document.querySelector("#add-task-btn");
  if (!submitBtn) return;
  const hasTitle = event.target.value.trim().length > 0;
  submitBtn.disabled = !hasTitle;
  if (hasTitle) event.target.removeAttribute("aria-invalid");
}

/**
 * Fill the "Parent task (optional)" select with the current task titles,
 * so a new task can be added as a subtask of any existing one.
 */
function populateParentTaskOptions() {
  const select = document.querySelector("#parent-task");
  if (!select) return;

  const previousValue = select.value;
  select.innerHTML = '<option value="">None — top-level task</option>';
  TaskManager.tasks.forEach((task) => {
    const option = document.createElement("option");
    option.value = String(task.id);
    option.textContent = task.title;
    select.appendChild(option);
  });
  // Restore the previous selection if that task still exists.
  if ([...select.options].some((opt) => opt.value === previousValue)) {
    select.value = previousValue;
  }
}

/**
 * Render every task into #task-list as <li> elements. Respects the
 * high-priority-only filter when it's on.
 */
function displayTasks() {
  const container = document.querySelector("#task-list");
  if (!container) return;

  container.innerHTML = "";

  const tasks = highPriorityFilterOn ? TaskManager.getHighPriorityTasks(3) : TaskManager.tasks;

  if (tasks.length === 0) {
    const message = highPriorityFilterOn
      ? "No high-priority tasks right now."
      : "No tasks yet — add one above.";
    container.insertAdjacentHTML("beforeend", `<li class="empty-state">${message}</li>`);
    return;
  }

  tasks.forEach((task) => {
    const completedClass = task.completed ? "completed" : "";
    const highPriorityClass = isHighPriority(task) ? "high-priority" : "";
    const toggleLabel = task.completed ? "Mark incomplete" : "Mark complete";
    const safeTitle = escapeHTML(task.title);
    const safeDescription = escapeHTML(task.description);
    const subtaskNote = task.parentTask
      ? `<p class="subtask-note">↳ Subtask of: ${escapeHTML(task.parentTask.title)}</p>`
      : "";

    container.insertAdjacentHTML(
      "beforeend",
      `
      <li class="task ${completedClass} ${highPriorityClass}" data-id="${task.id}">
        <h3>${safeTitle}</h3>
        ${subtaskNote}
        <p>${safeDescription}</p>
        <button type="button" class="priority priority-btn" data-id="${task.id}" aria-label="Priority: ${getPriorityLabel(task.priority)}. Click to bump up.">${getPriorityLabel(task.priority)}</button>
        <div class="task-actions">
          <button
            type="button"
            class="complete-btn"
            data-id="${task.id}"
            aria-pressed="${task.completed}"
            aria-label="${toggleLabel}: ${safeTitle}"
          >${task.completed ? "Undo" : "Complete"}</button>
          <button
            type="button"
            class="delete-btn"
            data-id="${task.id}"
            aria-label="Delete task: ${safeTitle}"
          >Delete</button>
        </div>
      </li>
      `,
    );
  });
}

/**
 * Delegated click handler for the task list.
 * @param {MouseEvent} event
 */
function handleTaskClick(event) {
  const completeBtn = event.target.closest(".complete-btn");
  const deleteBtn = event.target.closest(".delete-btn");
  const priorityBtn = event.target.closest(".priority-btn");

  if (completeBtn) {
    toggleTaskCompletion(parseInt(completeBtn.dataset.id, 10));
  }
  if (deleteBtn) {
    deleteTask(parseInt(deleteBtn.dataset.id, 10));
  }
  if (priorityBtn) {
    bumpTaskPriority(parseInt(priorityBtn.dataset.id, 10));
  }
}

/**
 * Toggle a task's completed state by ID, then re-render and persist.
 * @param {number} taskId
 */
function toggleTaskCompletion(taskId) {
  const task = TaskManager.tasks.find((t) => t.id === taskId);
  if (task) {
    task.toggleCompletion();
    displayTasks();
    saveToStorage(TaskManager.tasks);
    updateStats();
    updateUpNext();
  }
}

/**
 * Cycle a task's priority up by one (wrapping 5 -> 1), then re-render.
 * @param {number} taskId
 */
function bumpTaskPriority(taskId) {
  if (cycleTaskPriority(taskId)) {
    displayTasks();
    saveToStorage(TaskManager.tasks);
    updateStats();
  }
}

/**
 * Delete a task by ID, then re-render and persist.
 * @param {number} taskId
 */
function deleteTask(taskId) {
  const index = TaskManager.tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    TaskManager.tasks.splice(index, 1);
    displayTasks();
    populateParentTaskOptions();
    saveToStorage(TaskManager.tasks);
    updateStats();
    updateUpNext();
  }
}

/**
 * Remove all completed tasks (archiving them), then re-render and persist.
 */
function handleClearCompleted() {
  TaskManager.clearCompleted();
  displayTasks();
  saveToStorage(TaskManager.tasks);
  updateStats();
  updateUpNext();
  updateRestoreButtonVisibility();
}

/**
 * Bring back the tasks removed by the last "Clear Completed", then
 * re-render and persist.
 */
function handleRestoreArchived() {
  const restoredCount = TaskManager.restoreArchived();
  if (restoredCount > 0) {
    displayTasks();
    populateParentTaskOptions();
    saveToStorage(TaskManager.tasks);
    updateStats();
    updateUpNext();
    updateRestoreButtonVisibility();
  }
}

/**
 * Show or hide the "Restore" button depending on whether there's
 * anything archived to restore.
 */
function updateRestoreButtonVisibility() {
  const restoreBtn = document.querySelector("#restore-archived-btn");
  if (!restoreBtn) return;
  const count = TaskManager.getArchivedCount();
  restoreBtn.hidden = count === 0;
  restoreBtn.textContent = count > 0 ? `Restore ${count} cleared` : "Restore cleared";
}

/**
 * Toggle the "high priority only" list filter and re-render.
 */
function handlePriorityFilterToggle(event) {
  highPriorityFilterOn = event.target.checked;
  displayTasks();
}

/**
 * Look up a task by exact title (via findTaskByTitle), show its details,
 * and scroll/highlight it in the list if found.
 * @param {SubmitEvent} event
 */
function handleFindTask(event) {
  event.preventDefault();
  const input = document.querySelector("#find-title");
  const resultBox = document.querySelector("#find-result");
  if (!input || !resultBox) return;

  const query = input.value.trim();
  if (!query) {
    resultBox.textContent = "";
    return;
  }

  const found = findTaskByTitle(query);
  if (!found) {
    resultBox.textContent = `No task titled "${query}".`;
    return;
  }

  const { priority, completed } = getTaskDetails(found);
  resultBox.textContent = `Found: "${found.title}" — ${getPriorityLabel(priority)} priority, ${completed ? "completed" : "pending"}.`;

  const taskEl = document.querySelector(`.task[data-id="${found.id}"]`);
  if (taskEl) {
    taskEl.scrollIntoView({ behavior: "smooth", block: "center" });
    taskEl.classList.add("just-found");
    setTimeout(() => taskEl.classList.remove("just-found"), 1500);
  }
}

/**
 * Read a selected JSON file, validate it, and batch-create tasks from it
 * via createTasks (rest parameters).
 * @param {Event} event
 */
function handleImportFile(event) {
  const file = event.target.files && event.target.files[0];
  const resultBox = document.querySelector("#find-result");
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!validateTasksArray(parsed)) {
        throw new Error("File must contain an array of tasks, each with a title.");
      }
      const created = createTasks(...parsed);
      const successCount = created.filter(Boolean).length;
      displayTasks();
      populateParentTaskOptions();
      saveToStorage(TaskManager.tasks);
      updateStats();
      updateUpNext();
      if (resultBox) resultBox.textContent = `Imported ${successCount} task(s) from ${file.name}.`;
    } catch (err) {
      console.error("Import failed:", err.message);
      if (resultBox) resultBox.textContent = `Import failed: ${err.message}`;
    }
  };
  reader.readAsText(file);
  event.target.value = ""; // allow re-selecting the same file later
}

/**
 * Permanently erase every task, active and archived, from memory and
 * localStorage. Destructive, so it's gated behind a confirmation.
 */
function handleClearAllData() {
  if (TaskManager.getTotalTasks() === 0) return;
  const confirmed = window.confirm(
    "Delete all tasks permanently? This clears localStorage too and can't be undone.",
  );
  if (!confirmed) return;

  TaskManager.resetAll();
  clearStorage();
  displayTasks();
  populateParentTaskOptions();
  updateStats();
  updateUpNext();
  updateRestoreButtonVisibility();
}

/**
 * Load previously saved tasks from storage into TaskManager, validating
 * first so corrupted localStorage data doesn't seed the list.
 */
function loadTasksFromStorage() {
  const saved = loadFromStorage();
  if (validateTasksArray(saved)) {
    saved.forEach((t) => addTask(t.title, t.description, t.priority));
  } else if (saved.length > 0) {
    console.error("Ignoring corrupted saved tasks in localStorage.");
  }
}

/**
 * Refresh the "Up Next" teaser under the masthead using getPendingQueue
 * (first pending task + however many are behind it).
 */
function updateUpNext() {
  const upNextEl = document.querySelector("#up-next");
  if (!upNextEl) return;

  const { first, rest } = TaskManager.getPendingQueue();
  if (!first) {
    upNextEl.textContent = "All caught up — nothing pending.";
    return;
  }
  const remainder = rest.length > 0 ? ` (+${rest.length} more pending)` : "";
  upNextEl.textContent = `Up next: ${first.title}${remainder}`;
}

/**
 * Refresh the stats region. Marked aria-live in the HTML so screen readers
 * announce updates without needing focus to move there.
 */
function updateStats() {
  const statsContainer = document.querySelector("#stats");
  if (!statsContainer) return;

  const summary = TaskManager.getSummary();
  statsContainer.innerHTML = `
    <div class="stat">
      <span class="stat-number">${summary.total}</span>
      <span class="stat-label">Total</span>
    </div>
    <div class="stat">
      <span class="stat-number">${summary.completed}</span>
      <span class="stat-label">Completed</span>
    </div>
    <div class="stat">
      <span class="stat-number">${summary.averagePriority}</span>
      <span class="stat-label">Avg. Priority</span>
    </div>
    `;
}

// Kick everything off once the DOM is ready.
document.addEventListener("DOMContentLoaded", setupEventListeners);
