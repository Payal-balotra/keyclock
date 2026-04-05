import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { createTodo, getTodos, type Todo } from "./api/todo";
import keycloak from "./keyclock";

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
      .then((auth) => {
        setAuthenticated(auth);
      })
      .catch(() => {
        setError("Login failed or Keycloak is not reachable.");
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    loadTodos();
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

  if (authLoading) return <div>Checking login...</div>;

  if (!authenticated) return <div>Not authenticated.</div>;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Todo Dashboard</h1>
      <p>Logged in as {keycloak.tokenParsed?.email ?? keycloak.tokenParsed?.sub}</p>
      <p>
        Service check: {serviceLoading ? "Contacting gateway..." : "Gateway reachable"}
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "0.75rem", margin: "1rem 0", flexWrap: "wrap" }}
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
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

      {error ? <p style={{ color: "crimson" }}>Error: {error}</p> : null}

      <section>
        <h2>Your Todos</h2>
        {serviceLoading && todos.length === 0 ? <p>Loading todos...</p> : null}
        {!serviceLoading && todos.length === 0 ? <p>No todos found yet.</p> : null}
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.title} {todo.completed ? "(done)" : "(pending)"}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );

  return <h1>Logged in ✅</h1>;
}

export default App;
