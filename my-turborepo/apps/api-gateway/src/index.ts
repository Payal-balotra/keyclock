import express from "express";
import { authMiddleware } from "./middleware/auth";
import { todoClient } from "./grpc/todoClient";
import { userClient } from "./grpc/userClient";

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.post("/todo", authMiddleware, (req: any, res) => {
  const { title } = req.body;

 
  userClient.SyncUser(
    {
      id: req.user.id,
      email: req.user.email,
    },
    (err: any, user: any) => {
      if (err) return res.status(500).send(err);

      todoClient.CreateTodo(
        {
          title,
          userId: user.id, 
        },
        (err: any, response: any) => {
          if (err) return res.status(500).send(err);

          res.json(response);
        }
      );
    }
  );
});

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
