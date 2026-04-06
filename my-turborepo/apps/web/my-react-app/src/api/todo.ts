import keycloak from "../keyclock";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request(path: string, init?: RequestInit) {
  const token = keycloak.token;
  if (!token) {
    throw new Error("No Keycloak token available");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export async function getTodos(): Promise<Todo[]> {
  return request("/todos", { method: "GET" });
}

export async function createTodo(title: string): Promise<Todo> {
  return request("/todo", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}
export async function updateTodo(id: string, title: string): Promise<Todo> {
  return request(`/todo/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
}

export async function deleteTodo(id: string): Promise<Todo> {
  return request(`/todo/${id}`, {
    method: "DELETE",
  });
}
export async function completedTodo(id: string): Promise<Todo> {
  console.log("request arrives at frontend ")
  return request(`/todo/toggle/${id}`, {
    method: "PUT",
  });
}