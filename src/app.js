// app.js — core domain logic: Task/SubTask classes, TaskManager, and the
// functions that operate on the task list. No DOM code lives here; dom.js
// is the only file that touches the document.

import { generateTaskId, validateTasksArray } from "./utils.js";

// Module-level state. Exported as a live binding (see bottom of file) so
// importers always see the current array, not a stale snapshot.
let taskList = [];

// Tasks removed by clearCompletedTasks() land here instead of vanishing,
// so restoreArchivedTasks() can bring them back. Cleared on restore.
let archivedTasks = [];

// --- Task class ---
class Task {
  constructor(title, description, priority) {
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.completed = false;
    this.id = generateTaskId();
  }

  /** Flip the completed flag on this task. */
  toggleCompletion() {
    this.completed = !this.completed;
  }

  /** Human-readable one-line summary, built with a template literal. */
  getInfo() {
    return `Task: ${this.title} - Priority: ${this.priority}`;
  }
}

// --- SubTask: inherits from Task, adds a link back to its parent ---
class SubTask extends Task {
  constructor(title, description, priority, parentTask) {
    super(title, description, priority);
    this.parentTask = parentTask;
  }

  /**
   * Override: same summary as Task.getInfo(), plus the parent task's
   * title for context. Calls super.getInfo() rather than duplicating the
   * base format, so the two stay in sync if that format ever changes.
   */
  getInfo() {
    const parentTitle = this.parentTask ? this.parentTask.title : "none";
    return `${super.getInfo()} (subtask of: ${parentTitle})`;
  }
}

/**
 * Create a new Task, validate its inputs, and add it to the task list.
 * @param {string} title
 * @param {string} description
 * @param {number} priority
 * @returns {Task|null} the created task, or null if validation fails
 */
function addTask(title, description, priority) {
  try {
    if (!title || typeof title !== "string") {
      throw new Error("Title must be a non-empty string");
    }
    if (typeof priority !== "number") {
      throw new Error("Priority must be a number");
    }
    const newTask = new Task(title, description, priority);
    taskList.push(newTask);
    return newTask;
  } catch (error) {
    console.error("Failed to add task:", error.message);
    return null;
  }
}

/**
 * Create a SubTask under an existing task and add it to the task list.
 * @param {string} title
 * @param {string} description
 * @param {number} priority
 * @param {number} parentId - id of the task this is a subtask of
 * @returns {SubTask|null} the created subtask, or null if the parent
 *   doesn't exist or validation fails
 */
function addSubtask(title, description, priority, parentId) {
  try {
    if (!title || typeof title !== "string") {
      throw new Error("Title must be a non-empty string");
    }
    if (typeof priority !== "number") {
      throw new Error("Priority must be a number");
    }
    const parent = taskList.find((t) => t.id === parentId);
    if (!parent) {
      throw new Error(`No task found with id ${parentId} to attach subtask to`);
    }
    const subtask = new SubTask(title, description, priority, parent);
    taskList.push(subtask);
    return subtask;
  } catch (error) {
    console.error("Failed to add subtask:", error.message);
    return null;
  }
}

/**
 * Log every task's title to the console. A debug helper, not a UI
 * renderer — kept console-only on purpose, matching its original role.
 * @param {Task[]} tasks
 */
function displayAllTasks(tasks) {
  for (const task of tasks) {
    console.log(task.title);
  }
}

/**
 * Find the first task with a matching title (case-sensitive, exact match).
 * @param {string} title
 * @returns {Task|undefined}
 */
function findTaskByTitle(title) {
  let i = 0;
  while (i < taskList.length) {
    if (taskList[i].title === title) {
      return taskList[i];
    }
    i++;
  }
  return undefined;
}

/**
 * Update a task's priority by ID.
 * @param {number} taskId
 * @param {number} newPriority
 * @returns {boolean|null} true on success, false if not found, null if invalid input
 */
function updateTaskPriority(taskId, newPriority) {
  if (typeof taskId !== "number") return null;
  if (typeof newPriority !== "number") return null;
  const task = taskList.find((t) => t.id === taskId);
  if (task) {
    task.priority = newPriority;
    return true;
  }
  return false;
}

/**
 * Cycle a task's priority up by one step, wrapping from 5 back to 1.
 * Thin wrapper around updateTaskPriority for the "click to bump priority"
 * UI interaction.
 * @param {number} taskId
 * @returns {boolean|null} same contract as updateTaskPriority
 */
function cycleTaskPriority(taskId) {
  const task = taskList.find((t) => t.id === taskId);
  if (!task) return false;
  const next = task.priority >= 5 ? 1 : task.priority + 1;
  return updateTaskPriority(taskId, next);
}

/**
 * Pull the display-relevant fields off a task via object destructuring.
 * @param {Task} task
 * @returns {{title: string, description: string, priority: number, completed: boolean}}
 */
function getTaskDetails(task) {
  const { title, description, priority, completed } = task;
  return { title, description, priority, completed };
}

/**
 * Combine two task arrays into one, using the spread operator.
 * @param {Task[]} list1
 * @param {Task[]} list2
 * @returns {Task[]}
 */
function mergeTasks(list1, list2) {
  return [...list1, ...list2];
}

/**
 * Split a task list into its first item and the rest, via array
 * destructuring + rest syntax.
 * @param {Task[]} tasks
 * @returns {{first: Task|undefined, rest: Task[]}}
 */
function getFirstAndRestTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { first: undefined, rest: [] };
  }
  const [first, ...rest] = tasks;
  return { first, rest };
}

/**
 * The next pending (incomplete) task, plus how many others are waiting —
 * powers the "Up Next" teaser in the UI. Built on getFirstAndRestTasks
 * rather than reimplementing the same split.
 * @returns {{first: Task|undefined, rest: Task[]}}
 */
function getPendingQueue() {
  const pending = taskList.filter((task) => !task.completed);
  return getFirstAndRestTasks(pending);
}

/**
 * Recursively count how many tasks in the array are completed.
 * @param {Task[]} tasks
 * @param {number} index - current position (start at 0)
 * @returns {number}
 */
function countCompletedTasks(tasks, index) {
  if (!tasks || tasks.length === 0) return 0;
  if (index >= tasks.length) return 0; // base case

  if (tasks[index].completed) {
    return 1 + countCompletedTasks(tasks, index + 1);
  }
  return countCompletedTasks(tasks, index + 1);
}

/**
 * Average priority across all tasks, rounded to the nearest whole number.
 * @returns {number}
 */
function calculateAveragePriority() {
  if (taskList.length === 0) return 0;
  const total = taskList.reduce((sum, task) => sum + task.priority, 0);
  return Math.round(total / taskList.length);
}

/**
 * Higher-order function: returns the subset of taskList matching a
 * caller-supplied predicate function.
 * @param {(task: Task) => boolean} predicate
 * @returns {Task[]}
 */
const createTaskFilter = (predicate) => {
  return taskList.filter(predicate);
};

/**
 * All tasks with a priority strictly above minPriority.
 * Built on createTaskFilter rather than a second, duplicate .filter() call.
 * @param {number} minPriority
 * @returns {Task[]}
 */
function getHighPriorityTasks(minPriority) {
  return createTaskFilter((task) => task.priority > minPriority);
}

/**
 * Remove every completed task from the list in place (so the exported
 * taskList binding and any existing references stay valid), archive them,
 * and return the removed tasks.
 * @returns {Task[]} the tasks that were removed
 */
function clearCompletedTasks() {
  const removed = taskList.filter((task) => task.completed);
  for (let i = taskList.length - 1; i >= 0; i--) {
    if (taskList[i].completed) taskList.splice(i, 1);
  }
  archivedTasks.push(...removed);
  return removed;
}

/**
 * Bring every archived (previously cleared) task back into the active
 * list, using mergeTasks to combine the two arrays. Undo for
 * clearCompletedTasks().
 * @returns {number} how many tasks were restored
 */
function restoreArchivedTasks() {
  const restoredCount = archivedTasks.length;
  const merged = mergeTasks(taskList, archivedTasks);
  taskList.length = 0;
  taskList.push(...merged);
  archivedTasks = [];
  return restoredCount;
}

/**
 * Remove every task, active and archived. Used by the "Clear All Data"
 * action; storage.js's clearStorage() handles wiping localStorage
 * separately, since this module doesn't know about persistence.
 */
function resetAllTasks() {
  taskList.length = 0;
  archivedTasks = [];
}

/**
 * Create several tasks at once from an arbitrary number of task-data
 * objects, using a rest parameter. Validates the batch first so a
 * malformed import (e.g. from importTasksFromJSON in dom.js) doesn't
 * partially apply.
 * @param {...{title: string, description: string, priority: number}} taskDataArray
 * @returns {Array<Task|null>}
 */
function createTasks(...taskDataArray) {
  if (!validateTasksArray(taskDataArray)) return [];
  return taskDataArray.map(({ title, description, priority }) =>
    addTask(title, description, priority),
  );
}

// TaskManager: a small facade over taskList with derived/aggregate views.
const TaskManager = {
  get tasks() {
    return taskList;
  },

  getCompletedTasks() {
    return taskList.filter((task) => task.completed);
  },

  getSummary() {
    return {
      total: taskList.length,
      completed: countCompletedTasks(taskList, 0),
      averagePriority: calculateAveragePriority(),
    };
  },

  getTotalTasks() {
    return this.tasks.length;
  },

  getHighPriorityTasks(minPriority) {
    return getHighPriorityTasks(minPriority);
  },

  getPendingQueue() {
    return getPendingQueue();
  },

  clearCompleted() {
    return clearCompletedTasks();
  },

  getArchivedCount() {
    return archivedTasks.length;
  },

  restoreArchived() {
    return restoreArchivedTasks();
  },

  resetAll() {
    resetAllTasks();
  },
};

export {
  taskList,
  Task,
  SubTask,
  addTask,
  addSubtask,
  findTaskByTitle,
  updateTaskPriority,
  cycleTaskPriority,
  displayAllTasks,
  getTaskDetails,
  mergeTasks,
  getFirstAndRestTasks,
  getPendingQueue,
  countCompletedTasks,
  calculateAveragePriority,
  getHighPriorityTasks,
  clearCompletedTasks,
  restoreArchivedTasks,
  resetAllTasks,
  createTaskFilter,
  createTasks,
  TaskManager,
};
