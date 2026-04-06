import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { prisma } from "@repo/db";


const packageDef = protoLoader.loadSync(
  "../../packages/grpc/todo.proto"
);

const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
const todoPackage = grpcObj.todo;

const server = new grpc.Server();

server.addService(todoPackage.TodoService.service, {
  CreateTodo: async (call, callback) => {
    const { title, userId } = call.request;

    const todo = await prisma.todo.create({
      data: { title, userId }
    });

    callback(null, todo);
  },

  GetTodos: async (call, callback) => {
    const { userId } = call.request;

    const todos = await prisma.todo.findMany({
      where: { userId }
    });

    callback(null, { todos });
  },

  UpdateTodo: async (call, callback) => {
    const { id, title } = call.request;

    try {
      const updatedTodo = await prisma.todo.update({
        where: { id },
        data: { title }
      });

      callback(null, updatedTodo);
    } catch (err) {
      callback(err as any, null);
    }
  },
  DeleteTodo: async (call, callback) => {
    const { id } = call.request;

    try {
      const deletedTodo = await prisma.todo.delete({
        where: { id },
      });

      callback(null, deletedTodo);
    } catch (err) {
      callback(err as any, null);
    }
  },
  ToggleTodo: async (call, callback) => {
    const { id } = call.request;

    try {
      const todo = await prisma.todo.findUnique({ where: { id } });
      if (!todo) throw new Error("Todo not found");
      const toogleTodo = await prisma.todo.update({
        where: { id },
        data: { completed: !todo.completed }
      });

      callback(null, toogleTodo);
    } catch (err) {
      callback(err as any, null);
    }
  }

});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Todo Service running on 50051");
  }
);