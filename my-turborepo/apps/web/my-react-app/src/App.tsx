import { useEffect, useState, FormEvent } from "react";
import keycloak from "./keyclock";
import {
  getTodos,
  createTodo,
  updateTodo,
  type Todo,
  deleteTodo,
  completedTodo,
} from "./api/todo";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [error, setError] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    keycloak
      .init({ onLoad: "login-required" })
      .then((auth) => setAuthenticated(auth))
      .catch(() => setError("Login failed or Keycloak not reachable"))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (authenticated) loadTodos();
  }, [authenticated]);

  async function loadTodos() {
    setServiceLoading(true);
    setError("");
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load todos.");
    } finally {
      setServiceLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    setServiceLoading(true);
    setError("");
    try {
      const created = await createTodo(title.trim());
      setTodos((current) => [...current, created]);
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create todo.");
    } finally {
      setServiceLoading(false);
    }
  }

  // --- Handlers for Update, Delete, Complete ---
  async function handleUpdate(todo: Todo) {
    const newTitle = prompt("Update todo title:", todo.title);
    if (!newTitle || !newTitle.trim()) return;

    setServiceLoading(true);
    setError("");
    try {
      const updated = await updateTodo(todo.id, newTitle.trim());
      setTodos((current) =>
        current.map((t) => (t.id === todo.id ? updated : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
    } finally {
      setServiceLoading(false);
    }
  }

  async function handleDelete(todo: Todo) {
    if (!confirm("Are you sure you want to delete this todo?")) return;

    setServiceLoading(true);
    setError("");
    try {
      const del = await deleteTodo(todo.id);
      setTodos((current) => current.filter((t) => t.id !== todo.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
    } finally {
      setServiceLoading(false);
    }
  }
  async function handleToggleComplete(todo: Todo) {
    setServiceLoading(true);
    setError("");
    try {
      const updated = await completedTodo(todo.id);
      setTodos((current) =>
        current.map((t) => (t.id === todo.id ? updated : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
    } finally {
      setServiceLoading(false);
    }
  }

  if (authLoading) return <div>Checking login...</div>;
  if (!authenticated) return <div>Not authenticated.</div>;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Todo Dashboard</h1>
      <p>
        Logged in as {keycloak.tokenParsed?.email ?? keycloak.tokenParsed?.sub}
      </p>
      <p>
        Service check: {serviceLoading ? "Contacting gateway..." : "Gateway reachable"}
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "0.5rem", margin: "1rem 0", flexWrap: "wrap" }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a todo"
          style={{ padding: "0.5rem", minWidth: "260px" }}
        />
        <button type="submit" disabled={serviceLoading}>
          Add Todo
        </button>
        <button type="button" onClick={loadTodos} disabled={serviceLoading}>
          Refresh
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      <section>
        <h2>Your Todos</h2>
        {serviceLoading && todos.length === 0 && <p>Loading todos...</p>}
        {!serviceLoading && todos.length === 0 && <p>No todos found yet.</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                marginBottom: "0.5rem",
                padding: "0.5rem",
                backgroundColor: todo.completed ? "#e0ffe0" : "#f8f8f8",
                borderRadius: "5px",
              }}
            >
              <span
                style={{
                  textDecoration: todo.completed ? "line-through" : "none",
                  flexGrow: 1,
                }}
              >
                {todo.title}
              </span>

              <button onClick={() => handleToggleComplete(todo)}>
                {todo.completed ? "Undo" : "Complete"}
              </button>
              <button onClick={() => handleUpdate(todo)}>Edit</button>
              <button onClick={() => handleDelete(todo)} style={{ color: "crimson" }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;