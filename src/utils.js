// utils.js — Pure helper functions: formatting, validation, and JSON conversion.
// No DOM access and no localStorage here (that lives in storage.js) so these
// functions stay easy to unit test and reuse outside the browser.

// Priority labels, indexed 1-5 to match the <select> options in index.html.
// index 0 is unused so priorityLabels[priority] reads naturally.
export const priorityLabels = ["", "Low", "Medium", "High", "Very High", "Critical"];

/**
 * Map a numeric priority (1-5) to its human-readable label.
 * Falls back to "Unknown" for out-of-range values instead of throwing,
 * since this is only ever used for display.
 * @param {number} priority
 * @returns {string}
 */
export function getPriorityLabel(priority) {
  return priorityLabels[priority] || "Unknown";
}

/**
 * Generate a unique-enough integer ID for a task.
 * Combines the current timestamp with a random offset so two tasks created
 * in the same millisecond still get different IDs.
 * @returns {number}
 */
export function generateRandomId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Trim a task name and capitalize its first letter.
 * @param {string} name - raw task name
 * @returns {string} formatted name, or "" if input is not a usable string
 */
export function formatTaskName(name) {
  if (typeof name !== "string" || name.trim() === "") return "";
  const result = name.trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Check if a task counts as high priority (4 or 5 on the 1-5 scale).
 * @param {Object} task - task object with a numeric priority property
 * @returns {boolean}
 */
export function isHighPriority(task) {
  if (!task || typeof task.priority !== "number") return false;
  return task.priority >= 4;
}

/**
 * Convert a tasks array to a JSON string.
 * @param {Array} tasks
 * @returns {string} JSON string, or "[]" if serialization fails
 */
export function tasksToJSON(tasks) {
  try {
    return JSON.stringify(tasks);
  } catch (error) {
    console.error("tasksToJSON failed:", error.message);
    return "[]";
  }
}

/**
 * Parse a JSON string back into a tasks array.
 * @param {string} json
 * @returns {Array} parsed array, or [] if parsing fails
 */
export function tasksFromJSON(json) {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("tasksFromJSON failed:", error.message);
    return [];
  }
}

/**
 * Validate that every entry in an array looks like a usable task object
 * (has a non-empty string title). Uses a for-of loop deliberately, rather
 * than .every(), so the codebase demonstrates both styles where each reads
 * more naturally: an early-exit validation loop like this is arguably
 * clearer imperatively than as a single boolean expression.
 * @param {Array} tasks
 * @returns {boolean} true only if tasks is a non-empty array of valid tasks
 */
export function validateTasksArray(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return false;
  for (const task of tasks) {
    if (!task || typeof task.title !== "string" || task.title.trim() === "") {
      return false;
    }
  }
  return true;
}

// Character-to-entity map used by escapeHTML. Declared once at module scope
// instead of inside the function so it isn't rebuilt on every call.
const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/**
 * Escape a string for safe insertion into innerHTML.
 * Task titles/descriptions come from user input and are rendered via
 * insertAdjacentHTML in dom.js — without this, a title like
 * "<img src=x onerror=alert(1)>" would execute as HTML/JS (stored XSS).
 * Implemented as a plain string replace (not the DOM-textContent trick) so
 * it stays a pure function that's testable in plain Node, no browser needed.
 * @param {string} str
 * @returns {string} HTML-safe string
 */
export function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
