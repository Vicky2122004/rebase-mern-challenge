import { useState, useEffect } from "react";

// In dev: empty string → Vite proxy handles /api → localhost:5000
// In production: points to the deployed Render backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/api/todos`)
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch(() => setError("Failed to load todos. Is the backend running?"));
  }, []);

  const addTodo = async () => {
    const trimmed = newTodo.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      // FIX: Send 'title' to match what the backend expects (req.body.title)
      const response = await fetch(`${BASE_URL}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });

      if (!response.ok) {
        throw new Error("Failed to add todo");
      }

      // FIX: Use the returned data (with _id from MongoDB) to update state immediately
      // This prevents the need for a page refresh to see new items
      const data = await response.json();
      setTodos((prev) => [...prev, data]);
      setNewTodo("");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addTodo();
  };

  return (
    <div className="app-container">
      <div className="todo-card">
        <div className="header">
          <h1>Rebase Todo App</h1>
          <p>Stay organized. Add your tasks below.</p>
        </div>

        {error && <div className="error-toast">{error}</div>}

        <div className="add-task-row">
          <input
            id="todo-input"
            className="task-input"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
          />
          <button
            id="add-todo-btn"
            className="add-btn"
            onClick={addTodo}
            disabled={loading || !newTodo.trim()}
          >
            {loading ? "Adding…" : "Add Task"}
          </button>
        </div>

        <div className="section-label">
          Tasks
          <span className="count-badge">{todos.length}</span>
        </div>

        {todos.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📝</div>
            <p>No tasks yet. Add one above!</p>
          </div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo._id} className="todo-item">
                <span className="todo-dot" />
                {/* FIX: Use todo.title (matches backend schema field name) */}
                {todo.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
