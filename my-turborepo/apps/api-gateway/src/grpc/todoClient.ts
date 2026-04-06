import path from "path";
import * as grpc from "@grpc/grpc-js";         
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH = path.resolve(
  __dirname,
  "../../../../packages/grpc/todo.proto"
);

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObj = grpc.loadPackageDefinition(packageDef) as any;

export const todoClient = new grpcObj.todo.TodoService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);