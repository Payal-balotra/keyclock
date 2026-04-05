import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync(
  "../../packages/grpc/todo.proto"
);

const grpcObj = grpc.loadPackageDefinition(packageDef) as any;

const todoClient = new grpcObj.todo.TodoService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);