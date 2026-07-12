// Jest tests for storage.js (localStorage persistence).
// Jest's default "node" test environment has no localStorage global, so we
// install a small in-memory mock before each test. storage.js checks
// availability at call time (see isStorageAvailable in the source), which
// is what makes it possible to mock it here rather than at module load.
import { saveToStorage, loadFromStorage, clearStorage } from "../src/storage.js";

/**
 * Minimal localStorage mock backed by a plain object, implementing just
 * the methods storage.js actually calls.
 */
function createMockLocalStorage() {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

beforeEach(() => {
  global.localStorage = createMockLocalStorage();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  delete global.localStorage;
  jest.restoreAllMocks();
});

describe("saveToStorage", () => {
  test("stores a tasks array as a JSON string under the 'tasks' key", () => {
    const tasks = [{ id: 1, title: "A", completed: false }];
    saveToStorage(tasks);
    expect(JSON.parse(global.localStorage.getItem("tasks"))).toEqual(tasks);
  });

  test("rejects non-array input without throwing, and writes nothing", () => {
    expect(() => saveToStorage("not an array")).not.toThrow();
    expect(global.localStorage.getItem("tasks")).toBeNull();
  });

  test("does nothing (but doesn't throw) when localStorage is unavailable", () => {
    delete global.localStorage;
    expect(() => saveToStorage([{ id: 1 }])).not.toThrow();
  });
});

describe("loadFromStorage", () => {
  test("returns the parsed array that was previously saved", () => {
    const tasks = [{ id: 1, title: "A" }, { id: 2, title: "B" }];
    saveToStorage(tasks);
    expect(loadFromStorage()).toEqual(tasks);
  });

  test("returns [] when nothing has been saved yet", () => {
    expect(loadFromStorage()).toEqual([]);
  });

  test("returns [] instead of throwing when the stored value is malformed JSON", () => {
    global.localStorage.setItem("tasks", "{not valid json");
    expect(loadFromStorage()).toEqual([]);
  });

  test("returns [] if the stored JSON parses to something other than an array", () => {
    global.localStorage.setItem("tasks", JSON.stringify({ not: "an array" }));
    expect(loadFromStorage()).toEqual([]);
  });

  test("returns [] when localStorage is unavailable", () => {
    delete global.localStorage;
    expect(loadFromStorage()).toEqual([]);
  });
});

describe("clearStorage", () => {
  test("removes previously saved tasks", () => {
    saveToStorage([{ id: 1, title: "A" }]);
    clearStorage();
    expect(loadFromStorage()).toEqual([]);
  });

  test("does nothing (but doesn't throw) when localStorage is unavailable", () => {
    delete global.localStorage;
    expect(() => clearStorage()).not.toThrow();
  });
});

describe("save/load round trip", () => {
  test("preserves task shape through a full save -> load cycle", () => {
    const tasks = [
      { id: 111, title: "Round trip", description: "desc", priority: 3, completed: true },
    ];
    saveToStorage(tasks);
    const loaded = loadFromStorage();
    expect(loaded).toEqual(tasks);
    expect(loaded[0].completed).toBe(true);
  });
});
