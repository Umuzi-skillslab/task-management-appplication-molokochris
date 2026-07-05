// Task Management Application - Starter Code with Errors

// Global variables (scoping issues)
taskList = [];  // Missing var/let/const
var taskCounter = 0;  // Should use let or const

// Task class with errors
class Task {
    constructor(title, description, priority) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.completed = false;
        // Missing: id property
    }
    
    // Missing: method to toggle completion
    
    getInfo() {
        // Wrong string concatenation - should use template literals
        return "Task: " + this.title + " - Priority: " + this.priority;
    }
}

// Subtask class with inheritance issues
class SubTask extends Task {
    constructor(title, description, priority, parentTask) {
        // Missing: super() call
        this.parentTask = parentTask;
    }
}

// Functions with errors

// Function with no error handling
function addTask(title, description, priority) {
    var newTask = new Task(title, description, priority);  // Should use const
    taskList.push(newTask);
    taskCounter++;
    return newTask;
}

// Function with incorrect loop
function displayAllTasks() {
    // Wrong loop - should use for-of
    for (var i = 0; i <= taskList.length; i++) {  // Off-by-one error
        console.log(taskList[i].title);
    }
}

// Function missing parameter
function findTaskByTitle() {
    // Missing: title parameter
    // Wrong loop construct
    var i = 0;
    while (i < taskList.length) {
        if (taskList[i].title == title) {  // Should use ===
            return taskList[i];
        }
        // Missing: i++
    }
    return undefined;
}

// Function with type checking issues
function updateTaskPriority(taskId, newPriority) {
    // Missing: typeof check for parameters
    // Missing: null/undefined validation
    
    for (var i = 0; i < taskList.length; i++) {
        if (taskList[i].id = taskId) {  // Wrong operator (= instead of ===)
            taskList[i].priority = newPriority;
            return true;
        }
    }
    return false;
}

// Function that should use destructuring but doesn't
function getTaskDetails(task) {
    // Should destructure task properties
    var title = task.title;
    var description = task.description;
    var priority = task.priority;
    var completed = task.completed;
    
    return {
        title: title,
        description: description,
        priority: priority,
        completed: completed
    };
}

// Function missing spread/rest operators
function mergeTasks(list1, list2) {
    // Should use spread operator
    var merged = [];
    for (var i = 0; i < list1.length; i++) {
        merged.push(list1[i]);
    }
    for (var i = 0; i < list2.length; i++) {
        merged.push(list2[i]);
    }
    return merged;
}

// Recursive function with error
function countCompletedTasks(tasks, index) {
    // Missing: base case check
    // Missing: null/undefined check
    
    if (tasks[index].completed) {
        return 1 + countCompletedTasks(tasks, index + 1);
    } else {
        return countCompletedTasks(tasks, index + 1);
    }
}

// Function with Math object issues
function calculateAveragePriority() {
    var total = 0;
    // Missing: check for empty array
    for (var i = 0; i < taskList.length; i++) {
        total = total + taskList[i].priority;
    }
    // Should use Math.round or toFixed
    return total / taskList.length;
}

// Filter function with errors
function getHighPriorityTasks(minPriority) {
    var highPriority = [];
    // Should use array methods (filter)
    for (var i = 0; i < taskList.length; i++) {
        if (taskList[i].priority > minPriority) {
            highPriority.push(taskList[i]);
        }
    }
    return highPriority;
}

// Object with missing methods
var TaskManager = {
    tasks: taskList,
    
    // Missing: method to add task using functional approach
    // Missing: method using array methods (map, filter, reduce)
    
    getTotalTasks: function() {
        return this.tasks.length;
    }
};

// Export issues - should be a module
// Missing: proper module exports
