import express from "express";
import { authMiddleware } from "./middleware/auth";
const app = express();

app.use(express.json());

app.post("/todo", authMiddleware, (req, res) => {
  const { title } = req.body;

  todoClient.CreateTodo(
    {
      title,
      userId: req.user.id
    },
    (err, response) => {
      if (err) return res.status(500).send(err);

      res.json(response);
    }
  );
});

app.get("/todos", authMiddleware, (req, res) => {
  todoClient.GetTodos(
    { userId: req.user.id },
    (err, response) => {
      res.json(response.todos);
    }
  );
});

app.listen(3000, () => {
  console.log("API Gateway running on 3000");
});