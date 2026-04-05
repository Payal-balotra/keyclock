import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync(
  "../../../packages/grpc/user.proto"
);

const grpcObj = grpc.loadPackageDefinition(packageDef) as any;

export const userClient = new grpcObj.user.UserService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);