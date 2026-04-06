import express from "express";
import { authMiddleware } from "./middleware/auth";
import { todoClient } from "./grpc/todoClient";
import { userClient } from "./grpc/userClient";
import cors from "cors"
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

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

const updateTodoGrpc = (data: any) =>{

 return  new Promise((resolve, reject) => {
  todoClient.UpdateTodo(data, (err: any, res: any) => {
    if (err) return reject(err);
    resolve(res);
  });
});
}


const deleteTodoGrpc = (data :any) =>{
  return new Promise((resolve,reject)=>{
    todoClient.DeleteTodo(data,(err : any , res :any)=>{
      if(err) return reject(err);
      resolve(res)
    })
  })
}
const toggleTodoGrpc = (data :any) =>{
 return  new Promise((resolve,reject)=>{
    todoClient.ToggleTodo(data,(err : any , res :any)=>{
      if(err) return reject(err);
      resolve(res)
    })
  })
}
app.post("/todo", authMiddleware, async (req: any, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const user = await syncUser({
      id: req.user.id, 
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

app.put("/todo/:id", authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const updatedTodo: any = await updateTodoGrpc({
      id,
      title: title.trim(),
    });

    res.json(updatedTodo);
  } catch (err) {
    console.error("Update Todo Error:", err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});
app.delete("/todo/:id", authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const deleteTodo: any = await deleteTodoGrpc({
      id
      
    });

    res.json(deleteTodo);
  } catch (err) {
    console.error("Update Todo Error:", err);
    res.status(500).json({ error: "Failed to update todo" });
  }
  
});
app.put("/todo/toggle/:id", authMiddleware, async (req: any, res) => {
  try {
    console.log("toggle request arrived at backend ")
    const { id } = req.params;
    console.log("Toggling todo id:", id);
    const toggleTodo: any = await toggleTodoGrpc({
      id
    });

    res.json(toggleTodo);
  } catch (err) {
    console.error("Update Todo Error:", err);
    res.status(500).json({ error: "Failed to update todo" });
  }
  
});

app.listen(3000, () => {
  console.log("API Gateway running on 3000");
});