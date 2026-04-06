import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { prisma } from "@repo/db";

const packageDef = protoLoader.loadSync(
  "../../packages/grpc/user.proto"
);

const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
const userPackage = grpcObj.user;

const server = new grpc.Server();

server.addService(userPackage.UserService.service, {
  SyncUser: async (call, callback) => {
    try {
      const { id, email } = call.request;

      const user = await prisma.user.upsert({
        where: { id },
        update: {},
        create: { id, email },
      });

      callback(null, user);
    } catch (err) {
      callback(err as any, null);
    }
  },
});

server.bindAsync(
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("User Service running on 50052");
  }
);