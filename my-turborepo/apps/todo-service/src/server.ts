import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { PrismaClient } from "@repo/db";

const prisma = new PrismaClient();

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
  }
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Todo Service running on 50051");
  }
);