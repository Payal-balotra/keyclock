import express from "express";
import { authMiddleware } from "./middleware/auth";
import { todoClient } from "./grpc/todoClient";
import { userClient } from "./grpc/userClient";

const app = express();

app.use(express.json());

app.post("/todo", authMiddleware, (req: any, res) => {
  const { title } = req.body;

  // 1️⃣ Sync user first
  userClient.SyncUser(
    {
      id: req.user.id,
      email: req.user.email,
    },
    (err: any, user: any) => {
      if (err) return res.status(500).send(err);

      // 2️⃣ Then create todo
      todoClient.CreateTodo(
        {
          title,
          userId: user.id, // ✅ use returned user
        },
        (err: any, response: any) => {
          if (err) return res.status(500).send(err);

          res.json(response);
        }
      );
    }
  );
});

// ✅ separate route (correctly closed)
app.get("/todos", authMiddleware, (req: any, res) => {
  todoClient.GetTodos(
    { userId: req.user.id },
    (err: any, response: any) => {
      if (err) return res.status(500).send(err);

      res.json(response.todos);
    }
  );
});

app.listen(3000, () => {
  console.log("API Gateway running on 3000");
});