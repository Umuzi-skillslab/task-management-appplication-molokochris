// Task Management Application - Starter Code with Errors

// Global variables (scoping issues)
let taskList = [];  // Missing var/let/const
let taskCounter = 0;  // Should use let or const

// Task class with errors
class Task {
    constructor(title, description, priority) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.completed = false;
        // Missing: id property
        this.id = Date.now() + Math.floor(Math.random() * 1000)
    }

    // Missing: method to toggle completion
    toggleCompletion() {
        this.completed = !this.completed
    }

    getInfo() {
        // Wrong string concatenation - should use template literals
        return `Task: ${this.title} - Priority: ${this.priority}`
    }
}

// Subtask class with inheritance issues
class SubTask extends Task {
    constructor(title, description, priority, parentTask) {
        // Missing: super() call
        super(title, description, priority)
        this.parentTask = parentTask;
    }
}

// Functions with errors

// Function with no error handling
function addTask(title, description, priority) {
    try {
        if (!title || typeof title !== 'string') throw new Error('Title must be a non-empty string');
        if (typeof priority !== 'number') throw new Error('Priority must be a number')
        const newTask = new Task(title, description, priority);  // Should use const
        taskList.push(newTask);
        taskCounter++;
        return newTask;
    } catch (error) {
        console.error("Failed to add task:", error.message)
        return null;
    }
}

// Function with incorrect loop
function displayAllTasks(taskList) {
    // Wrong loop - should use for-of
    for (const task of taskList) {  // Off-by-one error
        console.log(task.title);
    }
}

// Function missing parameter
function findTaskByTitle(title) {
    // Missing: title parameter
    // Wrong loop construct
    let i = 0;
    while (i < taskList.length) {
        if (taskList[i].title === title) {  // Should use ===
            return taskList[i];
        }
        // Missing: i++
        i++
    }
    return undefined;
}

// Function with type checking issues
function updateTaskPriority(taskId, newPriority) {
    // Missing: typeof check for parameters
    if (typeof taskId !== "number") return null
    if (typeof newPriority !== "number") return null
    // Missing: null/undefined validation
    const task = taskList.find(task => task.id === taskId);
    if (task) {
        task.priority = newPriority;
        return true;
    }
    return false;
}

// Function that should use destructuring but doesn't
function getTaskDetails(task) {
    // Should destructure task properties
    const { title, description, priority, completed } = task;

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
    let merged = [...list1, ...list2];
    // for (let i = 0; i < list1.length; i++) {
    //     merged.push(list1[i]);
    // }
    // for (var i = 0; i < list2.length; i++) {
    //     merged.push(list2[i]);
    // }
    return merged;
}

// Recursive function with error
function countCompletedTasks(tasks, index) {
    // Missing: base case check
    if (!tasks || tasks.length === 0) return 0;
    if (index >= tasks.length) return 0;
    // Missing: null/undefined check

    if (tasks[index].completed) {
        return 1 + countCompletedTasks(tasks, index + 1);
    } else {
        return countCompletedTasks(tasks, index + 1);
    }
}

// Function with Math object issues
function calculateAveragePriority() {
    if (taskList.length === 0) return 0;
    const total = taskList.reduce((sum, task) => sum + task.priority, 0)
    // Should use Math.round or toFixed
    return Math.round(total / taskList.length);
}

// Filter function with errors
function getHighPriorityTasks(minPriority) {
    return taskList.filter(task => task.priority > minPriority);;
}

// Object with missing methods
let TaskManager = {
    get tasks() { return taskList; },

    // Missing: method to add task using functional approach
    getCompletedTasks: function () {
        return taskList.filter(task => task.completed)
    },
    getSummary: function () {
        return {
            total: taskList.length,
            completed: this.getCompletedTasks().length,
            averagePriority: calculateAveragePriority()
        }
    },
    // Missing: method using array methods (map, filter, reduce)

    getTotalTasks: function () {
        return this.tasks.length;
    }
};

// Higher-order function
const createTaskFilter = (predicate) => {
    return taskList.filter(predicate);
}
// Rest parameter
function createTasks(...taskDataArray) {
    return taskDataArray.map(({ title, description, priority }) => addTask(title, description, priority))
}
// Export issues - should be a module
// Missing: proper module exports
module.exports = {
    taskList, Task, SubTask, addTask,
    findTaskByTitle, updateTaskPriority, displayAllTasks,
    getTaskDetails, mergeTasks, countCompletedTasks,
    calculateAveragePriority, getHighPriorityTasks,
    TaskManager
}