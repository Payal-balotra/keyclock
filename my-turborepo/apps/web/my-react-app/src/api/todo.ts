import keycloak from "../keyclock";

export async function createTodo(title: string) {
  const res = await fetch("http://localhost:3000/todo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${keycloak.token}`
    },
    body: JSON.stringify({ title })
  });

  return res.json();
}