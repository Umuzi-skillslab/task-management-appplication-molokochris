// Utilities - Starter Code (WITH ERRORS AND MISSING FEATURES)

// Bug: Not using proper data structures
var priorities = ["low", "medium", "high"];

// Bug: Missing JSON operations
function saveToStorage(data) {
    // Bug: Not converting to JSON
    localStorage.setItem("tasks", data);
}

function loadFromStorage() {
    // Bug: Not parsing JSON
    var data = localStorage.getItem("tasks");
    return data;
}

// Bug: Incorrect Math object usage
function generateRandomId() {
    return Math.random();  // Bug: Returns decimal, not integer
}

// Bug: Poor string manipulation
function formatTaskName(name) {
    // Bug: Not using string methods properly
    var result = name;
    return result;  // Should capitalize, trim, etc.
}

// Bug: Incorrect boolean logic
function isHighPriority(task) {
    if (task.priority == "high") {  // Bug: Using ==
        return "yes";  // Bug: Should return boolean
    }
    return "no";
}

// Missing: Class definitions
// Missing: Inheritance example
// Missing: Module exports
// Missing: Proper use of operators (logical, comparison)
// Missing: Recursion
// Missing: Functional programming patterns
// Missing: Proper scope demonstration
