import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.resolve(
  __dirname,
  "../../../../packages/grpc/user.proto"
);

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObj = grpc.loadPackageDefinition(packageDef) as any;

export const userClient = new grpcObj.user.UserService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);