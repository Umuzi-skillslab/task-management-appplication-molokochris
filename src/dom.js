// DOM Manipulation - Fixed and Complete

/**
 * Setup all event listeners after DOM is ready
 * Uses event delegation on task list container
 */
function setupEventListeners() {
    const addButton = document.querySelector(".add-task-btn");  // Wrong - mixing ID and class
    const taskInput = document.querySelector("#title");
    const descInput = document.querySelector("#description")
    const priorityInput = document.querySelector("#priority")
    const taskContainer = document.querySelector("#task-list")

    // Null check before adding listeners
    if (addButton) {
        addButton.addEventListener("click", handleAddTask);
    }

    // Input enter key listener
    if (taskInput) {
        taskInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleAddTask()
        })
    }

    // Event delegation on task list container
    if (taskContainer) {
        taskContainer.addEventListener("click", handleTaskClick)
    }

    // Load saved tasks on startup
    loadTasksFromStorage();

    // Update stats on load
    updateStats();
}

/**
 * Handle adding a new task from form inputs
 */
function handleAddTask() {
    const titleInput = document.getElementById("#title");
    const descInput = document.getElementById("#description");
    const priorityInput = document.querySelector("#priority")
    // No validation
    if (!titleInput || !descInput || !priorityInput) return;
    // Should use event.preventDefault() if form
    if (!title) {
        alert("Please enter a task title.")
        return;
    }

    const newTask = addTask(title, description, priority)

    if (newTask) {
        displayTasks()
        saveToStorage(TaskManager.tasks);
        updateStats();

        // Clear inputs after adding
        titleInput.value = "";
        descInput.value = "";
        priorityInput.value = "1"
    }
}

/**
 * Display all tasks in the task list container
 * Clears existing content before rendering
 */
function displayTasks() {
    const container = document.getElementById("#task-list");

    // Should clear existing content first
    // Missing: null check
    if (!container) return;
    container.innerHTML = "";
    // Inefficient - should use template literals and insertAdjacentHTML
    TaskManager.tasks.forEach(task => {
        const completedClass = task.completed ? "completed" : "";
        const completedText = task.completed ? "Undo" : "Completed";

        //
        container.insertAdjacentHTML("beforeend", `
            <div class="task ${completedClass}" data-id="${task.id}">
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <span class="priority">Priority: ${task.priority}</span>
                <div class="task-actions">
                    <button class="complete-btn" data-d="${task.id}">${completedText}</button>
                    <button class="delete-btn" data-d="${task.id}">Delete</button>
                </div>
            </div>
            `);
    });
}

/**
 * Handle task click using event delegation
 * Checks event.target to identify which button was clicked
 * @param {Event} event - click event from task container
 */
function handleTaskClick(event) {
    const completeBtn = event.target.closest(".complete-btn")
    const deleteBtn = event.target.closest(".delete-btn")
    // Missing: event.target check
    if (completeBtn) {
        const taskId = parseInt(completeBtn.dataset.id)
        toggleTaskCompletion(taskId)
    }

    if (deleteBtn) {
        const taskId = parseInt(deleteBtn.dataset.id)
        deleteTask(taskId)
    }
}

/**
 * Toggle completion status of a task by ID
 * @param {number} taskId
 */
function toggleTaskCompletion(taskId) {
    const task = TaskManager.tasks.find(t => t.id === taskId)
    if (task) {
        task.toggleCompletion()
        displayTasks()
        saveToStorage(TaskManager.tasks)
        updateStats()
    }
}

/**
 * Delete a task by ID
 * @param {number} taskId
 */
function deleteTask(taskId) {
    const index = TaskManager.tasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
        TaskManager.tasks.splice(index, 1)
        displayTasks()
        saveToStorage(TaskManager.tasks)
        updateStats()
    }
}

/**
 * Load tasks form localStorage and render them
 */
function loadTasksFromStorage() {
    const saved = loadTasksFromStorage()
    if (saved && saved.length > 0) {
        saved.forEach(t => addTask(t.title, t.description, t.priority))
        displayTasks()
    }
}

/**
 * Update statistics display
 */
function updateStats() {
    const statsContainer = document.querySelector("#stats")
    if (!statsContainer) return;

    const summary = TaskManager.getSummary();
    statsContainer.innerHTML = `
    <p>Total Tasks: ${summary.total}</p>
    <p>Completed: ${summary.completed}</p>
    <p>Average Priority: ${summary.averagePriority}</p>
    `
}
// Missing: JSON conversion functions
// Missing: functions to save/load tasks from localStorage

// Initialize (wrong placement - should use DOMContentLoaded)
document.addEventListener("DOMContentLoaded", setupEventListeners())
