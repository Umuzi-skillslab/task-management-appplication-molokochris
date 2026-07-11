// Jest tests for app.js (domain logic) and utils.js (pure helpers).
// Uses ES6 import syntax throughout; Babel (see package.json) transpiles
// this to CommonJS for Jest at test time.
import {
  taskList,
  Task,
  SubTask,
  addTask,
  findTaskByTitle,
  updateTaskPriority,
  getTaskDetails,
  mergeTasks,
  getFirstAndRestTasks,
  countCompletedTasks,
  calculateAveragePriority,
  getHighPriorityTasks,
  clearCompletedTasks,
  createTaskFilter,
  createTasks,
  TaskManager,
} from "../src/app.js";
import {
  getPriorityLabel,
  formatTaskName,
  isHighPriority,
  tasksToJSON,
  tasksFromJSON,
  validateTasksArray,
  escapeHTML,
  generateTaskId,
} from "../src/utils.js";

// Reset shared taskList state before every test so tests don't leak into
// each other regardless of run order.
beforeEach(() => {
  taskList.length = 0;
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("Task class", () => {
  test("creates a task with the expected properties", () => {
    const task = new Task("Test Task", "Description", 3);
    expect(task.title).toBe("Test Task");
    expect(task.description).toBe("Description");
    expect(task.priority).toBe(3);
    expect(task.completed).toBe(false);
    expect(task.id).toBeDefined();
  });

  test("two tasks created back-to-back always get different ids", () => {
    // Regression test: the original id generator combined Date.now() with
    // Math.random(), which had a real (if small) collision risk for tasks
    // created in the same millisecond.
    const ids = new Set();
    for (let i = 0; i < 500; i++) {
      ids.add(generateTaskId());
    }
    expect(ids.size).toBe(500);
  });

  test("getInfo returns a template-literal-formatted string", () => {
    const task = new Task("My Task", "Desc", 2);
    expect(task.getInfo()).toBe("Task: My Task - Priority: 2");
  });

  test("toggleCompletion flips the completed flag both ways", () => {
    const task = new Task("Toggle Task", "Desc", 1);
    expect(task.completed).toBe(false);
    task.toggleCompletion();
    expect(task.completed).toBe(true);
    task.toggleCompletion();
    expect(task.completed).toBe(false);
  });
});

describe("SubTask inheritance", () => {
  test("inherits from Task and sets parentTask", () => {
    const parent = new Task("Parent", "Desc", 2);
    const sub = new SubTask("Sub", "SubDesc", 1, parent);
    expect(sub.title).toBe("Sub");
    expect(sub.priority).toBe(1);
    expect(sub.completed).toBe(false);
    expect(sub.parentTask).toBe(parent);
    expect(sub instanceof Task).toBe(true);
  });

  test("SubTask inherits toggleCompletion from Task", () => {
    const parent = new Task("Parent", "Desc", 2);
    const sub = new SubTask("Sub", "SubDesc", 1, parent);
    sub.toggleCompletion();
    expect(sub.completed).toBe(true);
  });

  test("SubTask overrides getInfo() to include the parent task's title", () => {
    const parent = new Task("Write report", "Desc", 2);
    const sub = new SubTask("Draft outline", "SubDesc", 1, parent);
    expect(sub.getInfo()).toBe(
      "Task: Draft outline - Priority: 1 (subtask of: Write report)",
    );
  });

  test("SubTask.getInfo() handles a missing parentTask gracefully", () => {
    const sub = new SubTask("Orphan", "Desc", 1, null);
    expect(sub.getInfo()).toBe("Task: Orphan - Priority: 1 (subtask of: none)");
  });
});

describe("addTask", () => {
  test("returns a Task and adds it to taskList", () => {
    const task = addTask("New Task", "Test", 2);
    expect(task).toBeInstanceOf(Task);
    expect(task.title).toBe("New Task");
    expect(taskList).toContain(task);
  });

  test("returns null for an empty title", () => {
    expect(addTask("", "desc", 1)).toBeNull();
  });

  test("returns null when priority is not a number", () => {
    expect(addTask("Valid Title", "desc", "high")).toBeNull();
  });
});

describe("findTaskByTitle", () => {
  test("returns the task with a matching title", () => {
    addTask("FindMe", "desc", 1);
    const found = findTaskByTitle("FindMe");
    expect(found).toBeDefined();
    expect(found.title).toBe("FindMe");
  });

  test("returns undefined when no task matches", () => {
    expect(findTaskByTitle("DoesNotExist")).toBeUndefined();
  });
});

describe("updateTaskPriority", () => {
  test("updates priority when the task exists", () => {
    const task = addTask("Update Me", "desc", 1);
    expect(updateTaskPriority(task.id, 5)).toBe(true);
    expect(task.priority).toBe(5);
  });

  test("returns null for a non-number taskId", () => {
    expect(updateTaskPriority("abc", 3)).toBeNull();
  });

  test("returns false when no task matches the id", () => {
    expect(updateTaskPriority(999999, 3)).toBe(false);
  });
});

describe("array operations", () => {
  test("mergeTasks combines two arrays using spread", () => {
    const a = [new Task("A", "", 1)];
    const b = [new Task("B", "", 2)];
    const merged = mergeTasks(a, b);
    expect(merged).toHaveLength(2);
    expect(merged[0].title).toBe("A");
    expect(merged[1].title).toBe("B");
  });

  test("getHighPriorityTasks returns only tasks above minPriority", () => {
    addTask("Low", "", 1);
    addTask("High", "", 5);
    const results = getHighPriorityTasks(3);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("High");
  });

  test("getFirstAndRestTasks destructures the array into first + rest", () => {
    const [a, b, c] = [new Task("A", "", 1), new Task("B", "", 2), new Task("C", "", 3)];
    const { first, rest } = getFirstAndRestTasks([a, b, c]);
    expect(first).toBe(a);
    expect(rest).toEqual([b, c]);
  });

  test("getFirstAndRestTasks handles an empty array", () => {
    const { first, rest } = getFirstAndRestTasks([]);
    expect(first).toBeUndefined();
    expect(rest).toEqual([]);
  });

  test("clearCompletedTasks removes only completed tasks and returns them", () => {
    const a = addTask("A", "", 1);
    const b = addTask("B", "", 2);
    a.toggleCompletion();
    const removed = clearCompletedTasks();
    expect(removed).toEqual([a]);
    expect(taskList).toEqual([b]);
  });
});

describe("recursion: countCompletedTasks", () => {
  test("counts completed tasks recursively", () => {
    const tasks = [new Task("A", "", 1), new Task("B", "", 2), new Task("C", "", 3)];
    tasks[0].toggleCompletion();
    tasks[2].toggleCompletion();
    expect(countCompletedTasks(tasks, 0)).toBe(2);
  });

  test("returns 0 for an empty array (base case)", () => {
    expect(countCompletedTasks([], 0)).toBe(0);
  });

  test("returns 0 for null input instead of throwing", () => {
    expect(countCompletedTasks(null, 0)).toBe(0);
  });
});

describe("destructuring: getTaskDetails", () => {
  test("returns the destructured properties", () => {
    const task = new Task("Detail Task", "Some desc", 4);
    const details = getTaskDetails(task);
    expect(details).toEqual({
      title: "Detail Task",
      description: "Some desc",
      priority: 4,
      completed: false,
    });
  });
});

describe("higher-order function: createTaskFilter", () => {
  test("returns tasks matching an arbitrary predicate", () => {
    addTask("Short", "", 1);
    addTask("A longer title", "", 2);
    const longTitles = createTaskFilter((t) => t.title.length > 10);
    expect(longTitles).toHaveLength(1);
    expect(longTitles[0].title).toBe("A longer title");
  });
});

describe("rest parameter: createTasks", () => {
  test("creates multiple tasks from a variable number of arguments", () => {
    const results = createTasks(
      { title: "One", description: "", priority: 1 },
      { title: "Two", description: "", priority: 2 },
      { title: "Three", description: "", priority: 3 },
    );
    expect(results).toHaveLength(3);
    expect(results.every((t) => t instanceof Task)).toBe(true);
    expect(taskList).toHaveLength(3);
  });
});

describe("TaskManager", () => {
  test("getSummary reflects live taskList state, not a stale snapshot", () => {
    expect(TaskManager.getSummary().total).toBe(0);
    addTask("Live Task", "", 3);
    expect(TaskManager.getSummary().total).toBe(1);
  });

  test("calculateAveragePriority returns 0 for an empty list", () => {
    expect(calculateAveragePriority()).toBe(0);
  });
});

describe("utils: priority labels", () => {
  test("getPriorityLabel maps 1-5 to readable labels", () => {
    expect(getPriorityLabel(1)).toBe("Low");
    expect(getPriorityLabel(5)).toBe("Critical");
  });

  test("getPriorityLabel falls back for out-of-range values", () => {
    expect(getPriorityLabel(99)).toBe("Unknown");
  });
});

describe("utils: formatTaskName", () => {
  test("trims whitespace and capitalizes the first letter", () => {
    expect(formatTaskName("  buy milk  ")).toBe("Buy milk");
  });

  test("returns an empty string for non-string or blank input", () => {
    expect(formatTaskName("   ")).toBe("");
    expect(formatTaskName(42)).toBe("");
  });
});

describe("utils: isHighPriority", () => {
  test("returns true for priority 4 or 5", () => {
    expect(isHighPriority({ priority: 4 })).toBe(true);
    expect(isHighPriority({ priority: 5 })).toBe(true);
  });

  test("returns false for priority below 4 or missing input", () => {
    expect(isHighPriority({ priority: 2 })).toBe(false);
    expect(isHighPriority(null)).toBe(false);
  });
});

describe("utils: JSON conversion", () => {
  test("tasksToJSON and tasksFromJSON round-trip a tasks array", () => {
    const tasks = [new Task("A", "", 1)];
    const json = tasksToJSON(tasks);
    expect(typeof json).toBe("string");
    const parsed = tasksFromJSON(json);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe("A");
  });

  test("tasksFromJSON returns [] for malformed JSON instead of throwing", () => {
    expect(tasksFromJSON("{not valid json")).toEqual([]);
  });
});

describe("utils: validateTasksArray (for-of loop)", () => {
  test("returns true when every task has a non-empty title", () => {
    const tasks = [new Task("A", "", 1), new Task("B", "", 2)];
    expect(validateTasksArray(tasks)).toBe(true);
  });

  test("returns false if any task is missing a title", () => {
    const tasks = [new Task("A", "", 1), { title: "" }];
    expect(validateTasksArray(tasks)).toBe(false);
  });

  test("returns false for an empty array", () => {
    expect(validateTasksArray([])).toBe(false);
  });
});

describe("utils: escapeHTML (XSS safety)", () => {
  test("escapes angle brackets and quotes", () => {
    expect(escapeHTML(`<img src=x onerror="alert(1)">`)).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
  });

  test("returns an empty string for non-string input", () => {
    expect(escapeHTML(null)).toBe("");
  });
});

describe("edge cases", () => {
  test("countCompletedTasks handles null tasks gracefully", () => {
    expect(countCompletedTasks(null, 0)).toBe(0);
  });

  test("addTask rejects a non-string title", () => {
    expect(addTask(42, "desc", 1)).toBeNull();
  });

  test("mergeTasks handles two empty arrays", () => {
    expect(mergeTasks([], [])).toEqual([]);
  });
});
