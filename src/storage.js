// storage.js — the single source of truth for persistence.
// This is the only file that touches localStorage; utils.js only handles
// plain JSON string conversion. Keeping them separate avoids the duplicate
// save/load implementations the original codebase had in both files.

/**
 * Check for localStorage at call time (not cached at module load).
 * Caching this in a module-level constant would mean a test-time mock of
 * localStorage set up after this module is imported would never be seen —
 * checking live keeps the module honest and testable.
 * @returns {boolean}
 */
function isStorageAvailable() {
  return typeof localStorage !== "undefined";
}

/**
 * Save a tasks array to localStorage as a JSON string.
 * @param {Array} tasks - array of task objects to persist
 */
export function saveToStorage(tasks) {
  try {
    if (!Array.isArray(tasks)) {
      throw new Error("saveToStorage: tasks must be an array");
    }
    if (isStorageAvailable()) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  } catch (err) {
    console.error("Failed to save tasks:", err.message);
  }
}

/**
 * Load the tasks array from localStorage, parsing the stored JSON string.
 * @returns {Array} parsed tasks array, or [] if nothing stored or on error
 */
export function loadFromStorage() {
  try {
    if (!isStorageAvailable()) return [];
    const data = localStorage.getItem("tasks");
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load tasks:", err.message);
    return [];
  }
}

/**
 * Remove all persisted tasks from localStorage.
 */
export function clearStorage() {
  try {
    if (isStorageAvailable()) {
      localStorage.removeItem("tasks");
    }
  } catch (err) {
    console.error("Failed to clear storage:", err.message);
  }
}
