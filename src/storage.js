// Storage module - handles localStorage save/load with JSON serialization

// Guard for non-browser environments (e.g. Jest/Node)
const isStorageAvailable = typeof localStorage !== "undefined"

/**
 * Save tasks array to localStorage as JSON string
 * @param {Array} tasks - array of task object to persist
 */
const saveToStorage = (tasks) => {
    try {
        if (typeof tasks !== 'object' || !Array.isArray(tasks)) {
            throw new Error('saveToStorage: tasks must be an array')
        }
        if (isStorageAvailable) {
            localStorage.setItem('tasks', JSON.stringify(tasks))
        }
    } catch (err) {
        console.error('Failed to save tasks:', err.message)
    }
}

/**
 * Load tasks array from localStorage, parsing JSON string back to object
 * @returns {Array} parsed tasks array, or empty array if nothing stored
 */
const loadFromStorage = () => {
    try {
        if (!isStorageAvailable) return []
        const data = localStorage.getItem('tasks')
        return data ? JSON.parse(data) : []
    } catch (err) {
        console.error('Failed to load tasks:', err.message)
        return []
    }
}

/**
 * Clear all tasks from localStorage
 */
const clearStorage = () => {
    try {
        if (isStorageAvailable) {
            localStorage.removeItem('tasks')
        }
    } catch (err) {
        console.error('Failed to clear storage:', err.message)
    }
}

module.exports = { saveToStorage, loadFromStorage, clearStorage }