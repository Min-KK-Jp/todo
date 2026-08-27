const STORAGE_KEY = "todo-app-items";

/** @type {{id: string, text: string, completed: boolean}[]} */
let todos = loadTodos();
let currentFilter = "all";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const countLabel = document.getElementById("todo-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  todos.push({ id: crypto.randomUUID(), text, completed: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function editTodo(id, newText) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  const trimmed = newText.trim();
  if (trimmed) {
    todo.text = trimmed;
  } else {
    todos = todos.filter((t) => t.id !== id);
  }
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

function getFilteredTodos() {
  if (currentFilter === "active") return todos.filter((t) => !t.completed);
  if (currentFilter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

function render() {
  list.innerHTML = "";
  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = todos.length === 0 ? "タスクはまだありません" : "該当するタスクはありません";
    list.appendChild(empty);
  } else {
    for (const todo of filtered) {
      list.appendChild(renderItem(todo));
    }
  }

  const remaining = todos.filter((t) => !t.completed).length;
  countLabel.textContent = `${remaining} 件残り`;
}

function renderItem(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " completed" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;
  text.title = "クリックして編集";
  text.addEventListener("click", () => startEdit(li, todo));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "×";
  deleteBtn.setAttribute("aria-label", "削除");
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  li.appendChild(checkbox);
  li.appendChild(text);
  li.appendChild(deleteBtn);
  return li;
}

function startEdit(li, todo) {
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "todo-text-input";
  editInput.value = todo.text;
  editInput.maxLength = 200;

  const textSpan = li.querySelector(".todo-text");
  li.replaceChild(editInput, textSpan);
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    editTodo(todo.id, editInput.value);
  };

  editInput.addEventListener("blur", finish);
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editInput.blur();
    } else if (e.key === "Escape") {
      finished = true;
      render();
    }
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
  input.focus();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

render();
