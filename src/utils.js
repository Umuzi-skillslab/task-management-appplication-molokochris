// Utilities - Fixed and Complete

// Priority levels as a proper const array
const priorities = ["low", "medium", "high"];

/**
 * Save tasks to localStorage using JSON serialization
 * @param {Array} data - Array of task objects 
 */
function saveToStorage(data) {
    try {
        if (!Array.isArray(data)) throw new Error('Data must be an array')
        localStorage.setItem("tasks", JSON.stringify(data));
    } catch (error) {
        console.error('saveToStorage failed:', error.message)
    }
}

/**
 * Load and parse tasks from localStorage
 * @returns {Array} parsed to an array or empty array
 */
function loadFromStorage() {
    // Bug: Not parsing JSON
    try {
        const data = localStorage.getItem("tasks");
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('loadFromStorage failed:', error.message)
        return [];
    }
}

/**
 * Generate a unique integer ID
 * @returns {number} random integer ID
 */
function generateRandomId() {
    return Math.floor(Math.random() * 10000000);
}

/**
 * Format a task name - trim whitespace and capitalize first letters
 * @param {string} name - raw task name 
 * @returns {string} formatted name
 */
function formatTaskName(name) {
    if (typeof name !== 'string' || name.trim() === '') return '';
    const result = name.trim();
    return result.charAt(0).toUpperCase() + result.slice(1);  // Should capitalize, trim, etc.
}

/**
 * Check if a task is high priority
 * @param {Object} task - task object with priority property
 * @returns {boolean} true if high priority
 */
function isHighPriority(task) {
    if (!task || typeof task.priority === "undefined") return false;
    return task.priority === "high";
}

/**
 * convert tasks array to JSON string
 * @param {Array} task
 * @returns {string} JSON string
 */
function tasksToJSON(tasks) {
    try {
        return JSON.stringify(tasks);
    } catch (error) {
        console.error('tasksToJSON failed:', error.message);
        return '[]';
    }
}

/**
 * Parse JSON string back to tasks array
 * @param {string} json
 * @returns {Array} tasks array
 */
function tasksFromJSON(json) {
    try {
        return JSON.parse(json);
    } catch (error) {
        console.error('tasksFromJSON failed:', error.message);
        return [];
    }
}

module.exports = {
    priorities,
    saveToStorage,
    loadFromStorage,
    generateRandomId,
    formatTaskName,
    isHighPriority,
    tasksToJSON,
    tasksFromJSON
}
// Missing: Class definitions
// Missing: Inheritance example
// Missing: Module exports
// Missing: Proper use of operators (logical, comparison)
// Missing: Recursion
// Missing: Functional programming patterns
// Missing: Proper scope demonstration
