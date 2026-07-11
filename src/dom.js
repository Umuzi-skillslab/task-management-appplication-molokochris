// dom.js — the only file that touches the document. Wires up the UI,
// delegates events, and keeps the DOM in sync with TaskManager + storage.

import { TaskManager, addTask } from "./app.js";
import { saveToStorage, loadFromStorage } from "./storage.js";
import { getPriorityLabel, escapeHTML } from "./utils.js";

/**
 * Wire up every interactive element. Called once on DOMContentLoaded.
 */
function setupEventListeners() {
  const taskForm = document.querySelector("#task-form");
  const titleInput = document.querySelector("#title");
  const taskContainer = document.querySelector("#task-list");
  const clearCompletedBtn = document.querySelector("#clear-completed-btn");

  // 1. Real form submission (handles both button click and Enter key
  //    natively — no separate keydown listener needed).
  if (taskForm) {
    taskForm.addEventListener("submit", handleAddTask);
  }

  // 2. Live validation feedback: disable submit until there's a title.
  if (titleInput) {
    titleInput.addEventListener("input", handleTitleInput);
  }

  // 3. Event delegation for every complete/delete button, present or future.
  if (taskContainer) {
    taskContainer.addEventListener("click", handleTaskClick);
  }

  // 4. Bulk action button.
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener("click", handleClearCompleted);
  }

  // Load any previously saved tasks and render the initial state.
  loadTasksFromStorage();
  displayTasks();
  updateStats();
}

/**
 * Handle the add-task form submission.
 * @param {SubmitEvent} event
 */
function handleAddTask(event) {
  event.preventDefault();

  const titleInput = document.querySelector("#title");
  const descInput = document.querySelector("#description");
  const priorityInput = document.querySelector("#priority");
  if (!titleInput || !descInput || !priorityInput) return;

  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const priority = parseInt(priorityInput.value, 10);

  if (!title) {
    titleInput.setAttribute("aria-invalid", "true");
    titleInput.focus();
    return;
  }

  const newTask = addTask(title, description, priority);
  if (!newTask) return;

  displayTasks();
  saveToStorage(TaskManager.tasks);
  updateStats();

  titleInput.value = "";
  descInput.value = "";
  priorityInput.value = "1";
  titleInput.removeAttribute("aria-invalid");
  titleInput.focus();
}

/**
 * Toggle the submit button's disabled state as the user types, so it's
 * clear from the UI (not just an alert on submit) that a title is required.
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
 * Render every task into #task-list as <li> elements.
 * User-supplied text is escaped before being inserted, since it's placed
 * with insertAdjacentHTML rather than textContent.
 */
function displayTasks() {
  const container = document.querySelector("#task-list");
  if (!container) return;

  container.innerHTML = "";

  if (TaskManager.tasks.length === 0) {
    container.insertAdjacentHTML(
      "beforeend",
      `<li class="empty-state">No tasks yet — add one above.</li>`,
    );
    return;
  }

  TaskManager.tasks.forEach((task) => {
    const completedClass = task.completed ? "completed" : "";
    const toggleLabel = task.completed ? "Mark incomplete" : "Mark complete";
    const safeTitle = escapeHTML(task.title);
    const safeDescription = escapeHTML(task.description);

    container.insertAdjacentHTML(
      "beforeend",
      `
      <li class="task ${completedClass}" data-id="${task.id}">
        <h3>${safeTitle}</h3>
        <p>${safeDescription}</p>
        <span class="priority priority-${task.priority}">${getPriorityLabel(task.priority)}</span>
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
 * Delegated click handler for the task list: figures out which button
 * (if any) was clicked and dispatches to the right action.
 * @param {MouseEvent} event
 */
function handleTaskClick(event) {
  const completeBtn = event.target.closest(".complete-btn");
  const deleteBtn = event.target.closest(".delete-btn");

  if (completeBtn) {
    const taskId = parseInt(completeBtn.dataset.id, 10);
    toggleTaskCompletion(taskId);
  }

  if (deleteBtn) {
    const taskId = parseInt(deleteBtn.dataset.id, 10);
    deleteTask(taskId);
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
    saveToStorage(TaskManager.tasks);
    updateStats();
  }
}

/**
 * Remove all completed tasks, then re-render and persist.
 */
function handleClearCompleted() {
  TaskManager.clearCompleted();
  displayTasks();
  saveToStorage(TaskManager.tasks);
  updateStats();
}

/**
 * Load previously saved tasks from storage into TaskManager.
 */
function loadTasksFromStorage() {
  const saved = loadFromStorage();
  if (saved && saved.length > 0) {
    saved.forEach((t) => addTask(t.title, t.description, t.priority));
  }
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

// 5. Kick everything off once the DOM is ready.
document.addEventListener("DOMContentLoaded", setupEventListeners);
