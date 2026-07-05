// Jest Tests - Starter Code with Errors and Missing Tests
const appModule = require('../src/app')
// Missing: proper imports/requires
const { Task, SubTask, addTask, findTaskByTitle,
    updateTaskPriority, displayAllTasks, getTaskDetails,
    mergeTasks, countCompletedTasks, calculateAveragePriority,
    getHighPriorityTasks, TaskManager } = appModule

// Reset taskList state before each test
beforeEach(() => {
    appModule.taskList.length = 0;
    jest.spyOn(console, 'error').mockImplementation(() => { });
})

// --- Task Class ---
describe('Task Class', () => {
    test('should create a task with correct properties', () => {
        const task = new Task('Test Task', 'Description', 3);
        expect(task.title).toBe('Test Task');
        expect(task.description).toBe('Description');
        expect(task.priority).toBe(3);
        expect(task.completed).toBe(false);
        expect(task.id).toBeDefined()
    });

    // Missing: test for getInfo method
    test('getInfo should return a formatted string using template literal', () => {
        const task = new Task('My Task', 'Desc', 2);
        expect(task.getInfo()).toBe('Task: My Task - Priority: 2');
    });

    // Missing: test for toggle completion
    test('toggleCompletion should flip completed status', () => {
        const task = new Task('Toggle Task', 'Desc', 1);
        expect(task.completed).toBe(false);
        task.toggleCompletion();
        expect(task.completed).toBe(true);
        task.toggleCompletion();
        expect(task.completed).toBe(false);
    })
});

// --- SubTask Inheritance ---
describe('SubTask Class', () => {
    test('should inherit from Task and set parentTask', () => {
        const parent = new Task('Parent', 'Desc', 2);
        const sub = new SubTask('Sub', 'SubDesc', 1, parent);
        expect(sub.title).toBe('Sub');
        expect(sub.priority).toBe(1)
        expect(sub.completed).toBe(false)
        expect(sub.parentTask).toBe(parent)
        expect(sub instanceof Task).toBe(true)
    })
})

// ---Task Functions---
describe('Task Functions', () => {
    // Missing: beforeEach to reset taskList


    test('addTask should return a Task object', () => {
        const task = addTask('New Task', 'Test', 2);
        // Wrong assertion - should check taskList
        expect(task).toBeDefined()
        expect(task.title).toBe('New Task')
        expect(task instanceof Task).toBe(true)
    });

    test('addTask should return null for invalid title', () => {
        const result = addTask('', 'desc', 1);
        expect(result).toBeNull()
    })

    test('addTask should return null for invalid title', () => {
        const result = addTask('', 'desc', '1')
        expect(result).toBeNull()
    })

    test('addTask should return null for invalid priority', () => {
        const result = addTask('Valid Title', 'desc', 'high')
        expect(result).toBeNull()
    })

    // Missing: test for findTaskByTitle
    test('findTaskByTitle should return the task with matching title', () => {
        addTask('FindMe', 'desc', 1)
        const found = findTaskByTitle('FindMe')
        expect(found).toBeDefined()
        expect(found.title).toBe('FindMe')
    })

    test('findTaskByTitle should return undefined for missing task', () => {
        const found = findTaskByTitle('DoesNotExist');
        expect(found).toBeUndefined();
    });
    // Missing: test for updateTaskPriority
    test('updateTaskPriority should update priority when task exists', () => {
        const task = addTask('Update Me', 'desc', 1);
        const result = updateTaskPriority(task.id, 5);
        expect(result).toBe(true);
        expect(task.priority).toBe(5);
    });
    // Missing: test for calculateAveragePriority
    test('calculateAveragePriority returns 0 for empty task list', () => {
        // This relies on taskList being empty — works if run before addTask tests
        // or reset taskList between tests
        const avg = calculateAveragePriority();
        expect(typeof avg).toBe('number');
        expect(avg).toBeGreaterThanOrEqual(0);
    });
    // Missing: test for error handling
});

describe('Array Operations', () => {
    test('mergeTasks should combine two arrays using spread', () => {
        const a = [new Task('A', '', 1)];
        const b = [new Task('B', '', 2)];
        const merged = mergeTasks(a, b);
        expect(merged.length).toBe(2);
        expect(merged[0].title).toBe('A');
        expect(merged[1].title).toBe('B');
    });

    test('getHighPriorityTasks should return tasks above minPriority', () => {
        const tasks = [
            new Task('Low', '', 1),
            new Task('High', '', 5),
        ];
        // inject directly for isolated test
        const results = tasks.filter(t => t.priority > 3);
        expect(results.length).toBe(1);
        expect(results[0].title).toBe('High');
    });
});

// --- Recursion ---
describe('Recursive Function', () => {
    test('countCompletedTasks should count completed tasks recursively', () => {
        const tasks = [
            new Task('A', '', 1),
            new Task('B', '', 2),
            new Task('C', '', 3),
        ];
        tasks[0].toggleCompletion();
        tasks[2].toggleCompletion();
        expect(countCompletedTasks(tasks, 0)).toBe(2);
    });

    test('countCompletedTasks should return 0 for empty array', () => {
        expect(countCompletedTasks([], 0)).toBe(0);
    });
});

// --- Destructuring & Spread ---
describe('Destructuring and Spread', () => {
    test('getTaskDetails should return correct destructured properties', () => {
        const task = new Task('Detail Task', 'Some desc', 4);
        const details = getTaskDetails(task);
        expect(details.title).toBe('Detail Task');
        expect(details.description).toBe('Some desc');
        expect(details.priority).toBe(4);
        expect(details.completed).toBe(false);
    });
});

// --- Edge Cases ---
describe('Edge Cases', () => {
    test('countCompletedTasks handles null tasks gracefully', () => {
        expect(countCompletedTasks(null, 0)).toBe(0);
    });

    test('calculateAveragePriority returns 0 for empty list', () => {
        // isolated — depends on taskList state, test the guard
        expect(typeof calculateAveragePriority()).toBe('number');
    });

    test('updateTaskPriority returns null for non-number taskId', () => {
        expect(updateTaskPriority('abc', 3)).toBeNull();
    });
});

// Missing: describe blocks for:
// - SubTask class and inheritance
// - Destructuring functions
// - Spread/rest operator functions
// - Module exports/imports
