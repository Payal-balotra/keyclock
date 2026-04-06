import express from "express";
import { authMiddleware } from "./middleware/auth";
import { todoClient } from "./grpc/todoClient";
import { userClient } from "./grpc/userClient";

const app = express();

/* -------------------- CORS -------------------- */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173"); // ✅ safer than *
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

/* -------------------- Helpers (promisify gRPC) -------------------- */
const syncUser = (data: any) =>
  new Promise((resolve, reject) => {
    userClient.SyncUser(data, (err: any, res: any) => {
      if (err) return reject(err);
      resolve(res);
    });
  });

const createTodo = (data: any) =>
  new Promise((resolve, reject) => {
    todoClient.CreateTodo(data, (err: any, res: any) => {
      if (err) return reject(err);
      resolve(res);
    });
  });

const getTodosGrpc = (data: any) =>
  new Promise((resolve, reject) => {
    todoClient.GetTodos(data, (err: any, res: any) => {
      if (err) return reject(err);
      resolve(res);
    });
  });

/* -------------------- Routes -------------------- */

// ✅ Create Todo
app.post("/todo", authMiddleware, async (req: any, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    // 🔥 IMPORTANT: id must come from Keycloak "sub"
    const user = await syncUser({
      id: req.user.id, // should be mapped from decoded.sub in middleware
      email: req.user.email,
    });

    const todo = await createTodo({
      title: title.trim(),
      userId: (user as any).id,
    });

    res.json(todo);
  } catch (err) {
    console.error("Create Todo Error:", err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});


app.get("/todos", authMiddleware, async (req: any, res) => {
  try {
    const response: any = await getTodosGrpc({
      userId: req.user.id,
    });

    res.json(response.todos);
  } catch (err) {
    console.error("Get Todos Error:", err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

/* -------------------- Server -------------------- */
app.listen(3000, () => {
  console.log("API Gateway running on 3000");
});