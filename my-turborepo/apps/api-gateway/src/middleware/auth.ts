import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import type { Request, Response, NextFunction } from "express";

const KEYCLOAK_URL = "http://localhost:8080";
const REALM = "myRealm";

const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export const authMiddleware = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).send("No token");
  jwt.verify(
    token,
    getKey,
    {
      issuer: `${KEYCLOAK_URL}/realms/${REALM}`,
      algorithms: ["RS256"],
    },
    (err, decoded: any) => {
      if (err) {
        console.error(err);
        return res.status(401).send("Invalid token");
      }

      req.user = {
        id: decoded.sub,
        email: decoded.email,
      };

      next();
    }
  );
};